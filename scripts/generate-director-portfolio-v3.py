from __future__ import annotations

import html
import hashlib
from functools import lru_cache
from pathlib import Path

from PIL import Image, ImageOps
from reportlab.lib.colors import Color, HexColor
from reportlab.lib.enums import TA_LEFT, TA_CENTER
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas
from reportlab.platypus import Paragraph


ROOT = Path(__file__).resolve().parents[1]
SOURCE_F = Path(r"F:\作品集")
SOURCE_D = Path(r"D:\光影重庆 王陈鑫")
STILLS = ROOT / "tmp" / "pdfs" / "source-assets"
CACHE = ROOT / "tmp" / "pdfs" / "optimized-assets-v3"
OUTPUT = ROOT / "output" / "pdf" / "Wang-Chenxin-Author-Director-Portfolio-2026-V3.pdf"
PORTRAIT = Path(r"D:\LTWJ\xwechat_files\wxid_uzrjhbstp88b12_c9bd\temp\RWTemp\2026-07\9e20f478899dc29eb19741386f9343c8\15d1c24b2d2e6679b5a6bd7049446110.jpg")

PAGE_W, PAGE_H = landscape(A4)
M = 44
CN = "Deng-Regular"
CN_BOLD = "Deng-Bold"
EN = "Arial"
EN_BOLD = "Arial-Bold"
EN_NARROW = "Arial-Narrow"

INK = HexColor("#08090B")
BLACK = HexColor("#050506")
DEEP = HexColor("#101216")
WARM = HexColor("#F1EEE8")
WARM_DARK = HexColor("#D7D0C7")
MIST = HexColor("#85858A")
RULE = HexColor("#34353A")
BLUE = HexColor("#8CA8B8")
BURGUNDY = HexColor("#8F5262")
TEAL = HexColor("#79B3B4")
SILVER = HexColor("#ABB3B8")
MAIMAI_PINK = HexColor("#E79AB5")
MAIMAI_BLUE = HexColor("#8294F2")
MAIMAI_YELLOW = HexColor("#F2C96A")


def register_fonts() -> None:
    pdfmetrics.registerFont(TTFont(CN, r"C:\Windows\Fonts\Deng.ttf"))
    pdfmetrics.registerFont(TTFont(CN_BOLD, r"C:\Windows\Fonts\Dengb.ttf"))
    pdfmetrics.registerFont(TTFont(EN, r"C:\Windows\Fonts\arial.ttf"))
    pdfmetrics.registerFont(TTFont(EN_BOLD, r"C:\Windows\Fonts\arialbd.ttf"))
    pdfmetrics.registerFont(TTFont(EN_NARROW, r"C:\Windows\Fonts\ARIALN.TTF"))


def verified(root: Path, relative: str) -> Path:
    path = root / relative
    if not path.exists():
        raise FileNotFoundError(path)
    return path


def f(relative: str) -> Path:
    return verified(SOURCE_F, relative)


def d(relative: str) -> Path:
    return verified(SOURCE_D, relative)


def s(relative: str) -> Path:
    return verified(STILLS, relative)


@lru_cache(maxsize=512)
def prepared(path_string: str) -> Path:
    source = Path(path_string)
    stat = source.stat()
    signature = f"{source.resolve()}|{stat.st_mtime_ns}|{stat.st_size}".encode()
    target = CACHE / f"{hashlib.sha1(signature).hexdigest()[:24]}.jpg"
    if target.exists():
        return target
    CACHE.mkdir(parents=True, exist_ok=True)
    with Image.open(source) as raw:
        image = ImageOps.exif_transpose(raw).convert("RGB")
        image.thumbnail((2600, 1900), Image.Resampling.LANCZOS)
        image.save(target, "JPEG", quality=90, subsampling=0, optimize=True, progressive=True, dpi=(180, 180))
    return target


@lru_cache(maxsize=512)
def size(path_string: str) -> tuple[int, int]:
    with Image.open(path_string) as image:
        return image.size


def esc(text: str) -> str:
    return html.escape(text).replace("\n", "<br/>")


class Book:
    def __init__(self, output: Path):
        output.parent.mkdir(parents=True, exist_ok=True)
        self.c = canvas.Canvas(str(output), pagesize=(PAGE_W, PAGE_H), pageCompression=1)
        self.c.setTitle("Wang Chenxin / Author-Director Visual Monograph / 2026")
        self.c.setAuthor("Wang Chenxin")
        self.c.setSubject("Visual Monograph / Directing / Screenwriting / AI Film")
        self.page = 0
        self.section = "PRELUDE"
        self.accent = BLUE

    def new(self, bg: Color, section: str, accent: Color = BLUE, footer: bool = True) -> None:
        if self.page:
            self.c.showPage()
        self.page += 1
        self.section = section
        self.accent = accent
        self.c.setFillColor(bg)
        self.c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
        if footer:
            self.footer()

    def finish(self) -> None:
        self.c.showPage()
        self.c.save()

    def footer(self) -> None:
        self.c.saveState()
        self.c.setStrokeColor(Color(self.accent.red, self.accent.green, self.accent.blue, alpha=0.34))
        self.c.setLineWidth(0.45)
        self.c.line(M, 25, PAGE_W - M, 25)
        self.c.setFillColor(Color(self.accent.red, self.accent.green, self.accent.blue, alpha=0.8))
        self.c.setFont(EN_NARROW, 6.2)
        self.c.drawString(M, 13, f"WANG CHENXIN / VISUAL MONOGRAPH / {self.section}")
        self.c.setFillColor(MIST)
        self.c.setFont(EN, 6.2)
        self.c.drawRightString(PAGE_W - M, 13, f"{self.page:02d}")
        self.c.restoreState()

    def para(self, text: str, x: float, top: float, width: float, size_: float = 10, leading: float | None = None,
             color: Color = WARM, bold: bool = False, align: int = TA_LEFT, max_height: float = 500) -> float:
        style = ParagraphStyle(
            "mono", fontName=CN_BOLD if bold else CN, fontSize=size_, leading=leading or size_ * 1.52,
            textColor=color, alignment=align, wordWrap="CJK", splitLongWords=True,
        )
        p = Paragraph(esc(text), style)
        _, h = p.wrap(width, max_height)
        p.drawOn(self.c, x, top - h)
        return h

    def title(self, text: str, x: float, top: float, width: float, size_: float = 30, color: Color = WARM) -> float:
        return self.para(text, x, top, width, size_, size_ * 1.08, color, True)

    def caps(self, text: str, x: float, y: float, color: Color | None = None, size_: float = 6.4) -> None:
        self.c.setFillColor(color or self.accent)
        self.c.setFont(EN_BOLD, size_)
        self.c.drawString(x, y, text.upper())

    def rule(self, x: float, y: float, width: float, color: Color | None = None, alpha: float = 0.52) -> None:
        c = color or self.accent
        self.c.setStrokeColor(Color(c.red, c.green, c.blue, alpha=alpha))
        self.c.setLineWidth(0.48)
        self.c.line(x, y, x + width, y)

    def image_cover(self, path: Path, x: float, y: float, width: float, height: float, anchor_x: float = 0.5,
                    anchor_y: float = 0.5, dim: float = 0) -> None:
        target = prepared(str(path))
        iw, ih = size(str(target))
        scale = max(width / iw, height / ih)
        dw, dh = iw * scale, ih * scale
        dx = x - (dw - width) * anchor_x
        dy = y - (dh - height) * anchor_y
        self.c.saveState()
        clip = self.c.beginPath()
        clip.rect(x, y, width, height)
        self.c.clipPath(clip, stroke=0, fill=0)
        self.c.drawImage(str(target), dx, dy, width=dw, height=dh, mask="auto")
        if dim:
            self.c.setFillColor(Color(0.01, 0.01, 0.015, alpha=dim))
            self.c.rect(x, y, width, height, fill=1, stroke=0)
        self.c.restoreState()

    def image_contain(self, path: Path, x: float, y: float, width: float, height: float, bg: Color = BLACK) -> None:
        target = prepared(str(path))
        iw, ih = size(str(target))
        scale = min(width / iw, height / ih)
        dw, dh = iw * scale, ih * scale
        self.c.setFillColor(bg)
        self.c.rect(x, y, width, height, fill=1, stroke=0)
        self.c.drawImage(str(target), x + (width - dw) / 2, y + (height - dh) / 2, width=dw, height=dh, mask="auto")

    def full_bleed(self, path: Path, dim: float = 0.18, anchor_x: float = 0.5, anchor_y: float = 0.5) -> None:
        self.image_cover(path, 0, 0, PAGE_W, PAGE_H, anchor_x, anchor_y, dim)

    def centered(self, text: str, y: float, size_: float, color: Color = WARM) -> None:
        self.c.setFillColor(color)
        self.c.setFont(CN_BOLD if any(ord(ch) > 127 for ch in text) else EN_BOLD, size_)
        self.c.drawCentredString(PAGE_W / 2, y, text)

    def light_beam(self, x: float, y: float, width: float, height: float, color: Color = HexColor("#BFD8E2")) -> None:
        self.c.saveState()
        for i, alpha in enumerate((0.04, 0.06, 0.085, 0.12)):
            inset = i * 9
            p = self.c.beginPath()
            p.moveTo(x + width * 0.48 - inset, y + height)
            p.lineTo(x + width * 0.52 + inset, y + height)
            p.lineTo(x + width + inset, y)
            p.lineTo(x - inset, y)
            p.close()
            self.c.setFillColor(Color(color.red, color.green, color.blue, alpha=alpha))
            self.c.drawPath(p, fill=1, stroke=0)
        self.c.restoreState()


def page_hero(book: Book, image: Path, title: str, kicker: str, accent: Color, subtitle: str = "", dim: float = 0.2,
              align: str = "left") -> None:
    book.new(BLACK, kicker, accent, footer=False)
    book.full_bleed(image, dim)
    if align == "center":
        book.c.setFillColor(Color(0, 0, 0, alpha=0.35))
        book.c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
        book.caps(kicker, M, PAGE_H - 56, accent)
        book.centered(title, 292, 36, WARM)
        if subtitle:
            book.centered(subtitle, 252, 10, WARM_DARK)
    else:
        book.c.setFillColor(Color(0, 0, 0, alpha=0.54))
        book.c.rect(0, 0, PAGE_W * 0.52, PAGE_H, fill=1, stroke=0)
        book.caps(kicker, M, PAGE_H - 56, accent)
        book.title(title, M, 240, 380, 34, WARM)
        if subtitle:
            book.para(subtitle, M, 156, 330, 9, 14, WARM_DARK)


def draw_cover(book: Book) -> None:
    book.new(BLACK, "COVER", WARM, footer=False)
    book.full_bleed(s("tongyoulu/cover.jpg"), 0.34, 0.56, 0.5)
    book.c.setFillColor(Color(0, 0, 0, alpha=0.48))
    book.c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    book.caps("VISUAL MONOGRAPH / 2026", M, PAGE_H - 58, WARM_DARK)
    book.c.setFillColor(WARM)
    book.c.setFont(EN_BOLD, 66)
    book.c.drawString(M, 350, "WANG")
    book.c.drawString(M, 276, "CHENXIN")
    book.rule(M, 226, 315, WARM, 0.7)
    book.para("作者型导演 / 编剧 / AI 影像创作者", M, 196, 370, 14, 18, WARM, True)
    book.caps("DIRECTING / SCREENWRITING / WORLD BUILDING / VISUAL THINKING", M, 84, WARM_DARK, 6.1)


def draw_manifesto(book: Book) -> None:
    book.new(WARM, "PRELUDE / POSITION", BURGUNDY)
    book.caps("01 / POSITION", M, PAGE_H - 58, BURGUNDY)
    book.title("我先决定人物为什么行动，\n再决定镜头如何移动。", M, PAGE_H - 122, 470, 30, INK)
    book.rule(M, 356, 420, BURGUNDY, 0.65)
    book.para("我是作者型导演创作者：从人物、世界规则与故事结构出发，进入剧本、导演、分镜、镜头设计、AI 影像与剪辑。技术改变制作方式，但不替代创作判断。", M, 322, 360, 10.4, 17, HexColor("#3D3436"))
    book.caps("A DIRECTOR'S PORTFOLIO", M, 180, BURGUNDY)
    book.para("这不是技能清单。\n它记录选择如何变成画面。", M, 152, 330, 16, 22, INK, True)
    book.image_cover(s("yafobuyu/frame_01.jpg"), 528, 74, 264, 414, anchor_x=0.5, dim=0.05)
    book.caps("MEMORY / SPACE / ACTION", 528, 54, BURGUNDY, 5.8)


def draw_method(book: Book) -> None:
    book.new(BLACK, "PRELUDE / METHOD", BLUE)
    book.caps("02 / METHOD", M, PAGE_H - 58, BLUE)
    book.title("从命题到可执行的镜头。", M, PAGE_H - 104, 520, 34, WARM)
    book.para("我把导演工作看成一条判断链，而不是六张方法卡。", M, PAGE_H - 168, 360, 10, 15, MIST)
    items = [("QUESTION", "故事真正要追问什么？"), ("PERSON", "谁在付出代价？"), ("STRUCTURE", "信息何时被看见？"), ("SHOT", "观众先看见什么？"), ("SYSTEM", "如何保持连续？"), ("CUT", "什么应该被留下？")]
    for idx, (en, zh) in enumerate(items):
        y = 318 - idx * 43
        book.caps(en, 132, y + 7, BLUE if idx < 4 else WARM_DARK, 6.1)
        book.para(zh, 264, y + 16, 350, 14, 18, WARM if idx < 4 else WARM_DARK, True)
        book.rule(132, y - 6, 510, RULE, 0.35)
    book.caps("THE TEST", M, 78, BLUE)
    book.para("如果镜头不能回答人物为什么行动，它就还没有准备好。", M, 58, 650, 13, 18, WARM, True)


def draw_directing_opener(book: Book) -> None:
    book.new(BLACK, "DIRECTING / OPENING", BLUE, footer=False)
    book.full_bleed(s("shoudian/frame_04.jpg"), 0.2)
    book.c.setFillColor(Color(0, 0, 0, alpha=0.5))
    book.c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    book.caps("DIRECTING / SELECTED FILMS", M, PAGE_H - 58, WARM_DARK)
    book.title("四种作品，四种导演判断。", M, 192, 500, 34, WARM)
    book.para("石刻与记忆 / 黑暗与光束 / 世界观与资产 / 单元机制与色彩", M, 134, 480, 10, 16, WARM_DARK)


def draw_yafobuyu(book: Book) -> None:
    page_hero(book, s("yafobuyu/frame_06.jpg"), "崖佛不语，岁岁佑我", "DIRECTING / 01 / MEMORY", HexColor("#C7A66A"), "石刻不是背景，而是人物记忆的空间。", 0.18)
    book.new(WARM, "崖佛 / STORY", HexColor("#9D7552"))
    book.caps("THE FILM / 05'00\"", M, PAGE_H - 58, HexColor("#9D7552"))
    book.title("时间不是闪回，\n而是一种仍在场的关系。", M, PAGE_H - 116, 400, 27, INK)
    book.para("作品在童年与成年之间建立回声。苹果、金毛、祈愿动作与崖佛共同保存一段没有被说尽的亲情。", M, 316, 300, 9.8, 16, HexColor("#4B4441"))
    book.caps("DIRECTOR'S NOTE", M, 224, HexColor("#9D7552"))
    book.para("让人物先被空间包围，再慢慢靠近。宏观石刻、雨雾湿度与佛堂暖光共同决定情感尺度。", M, 204, 300, 10.2, 16, INK, True)
    book.image_cover(s("yafobuyu/frame_00.jpg"), 430, 284, 362, 218, dim=0.04)
    book.image_cover(s("yafobuyu/frame_01.jpg"), 430, 74, 174, 174, dim=0.04)
    book.image_cover(s("yafobuyu/frame_07.jpg"), 618, 74, 174, 174, dim=0.04)
    book.caps("CHILDHOOD / ADULT / RETURN", 430, 54, HexColor("#9D7552"), 5.8)
    book.new(WARM, "崖佛 / MOTIFS", HexColor("#9D7552"))
    book.caps("THE MOTIFS", M, PAGE_H - 58, HexColor("#9D7552"))
    book.image_cover(s("yafobuyu/frame_02.jpg"), M, 78, 246, 390)
    book.image_cover(s("yafobuyu/frame_03.jpg"), 304, 78, 246, 390)
    book.image_cover(s("yafobuyu/frame_04.jpg"), 562, 78, 230, 390)
    book.caps("STONE", M, 56, HexColor("#9D7552"), 5.8)
    book.caps("RITUAL", 304, 56, HexColor("#9D7552"), 5.8)
    book.caps("OBJECT", 562, 56, HexColor("#9D7552"), 5.8)
    page_hero(book, s("yafobuyu/frame_05.jpg"), "守护不是答案，\n是被时间重新看见。", "DIRECTING / 01 / RETURN", HexColor("#C7A66A"), "", 0.24)
    book.new(BLACK, "崖佛 / EVIDENCE", HexColor("#C7A66A"))
    book.caps("EVIDENCE / WHAT THE FRAME DOES", M, PAGE_H - 58, HexColor("#C7A66A"))
    book.image_cover(s("yafobuyu/frame_08.jpg"), M, 92, 330, 390, dim=0.05)
    book.image_cover(s("yafobuyu/frame_00.jpg"), 394, 290, 190, 192, dim=0.05)
    book.image_cover(s("yafobuyu/frame_01.jpg"), 602, 290, 190, 192, dim=0.05)
    book.caps("EMOTION", 394, 268, HexColor("#C7A66A"), 5.8)
    book.caps("SPACE", 602, 268, HexColor("#C7A66A"), 5.8)
    book.para("大足石刻被当作关系的容器：冷灰雨雾与暖金佛堂区分记忆层次，人物表情才在最后完成回响。", 394, 230, 398, 9.2, 14.5, WARM)
    book.caps("FULL FILM / LINK AFTER OWNER CONFIRMATION", 394, 116, MIST, 5.7)
    book.rule(394, 104, 398, RULE, 0.35)


def draw_shoudian(book: Book) -> None:
    book.new(BLACK, "手电 / LIGHT", HexColor("#B9D7E1"), footer=False)
    book.light_beam(310, 0, 220, PAGE_H, HexColor("#BFDDE7"))
    book.caps("DIRECTING / 02 / SHOU DIAN", M, PAGE_H - 58, HexColor("#B9D7E1"))
    book.c.setFillColor(WARM)
    book.c.setFont(EN_BOLD, 54)
    book.c.drawString(M, 318, "LET LIGHT")
    book.c.drawString(M, 256, "SPEAK.")
    book.para("不用对白解释父子关系。", M, 204, 320, 13, 18, HexColor("#C0D6DD"), True)
    book.caps("OBJECT / BEAM / RELATION", M, 78, MIST, 6.1)
    page_hero(book, s("shoudian/frame_05.jpg"), "一束窄光，\n把观看变成行动。", "DIRECTING / 02 / BEAM", HexColor("#B9D7E1"), "", 0.12)
    book.new(BLACK, "手电 / SEQUENCE", HexColor("#B9D7E1"))
    book.caps("DISCOVERY / REPAIR / RESPONSE", M, PAGE_H - 58, HexColor("#B9D7E1"))
    book.image_cover(s("shoudian/frame_00.jpg"), M, 130, 238, 320, dim=0.08)
    book.image_cover(s("shoudian/frame_03.jpg"), 302, 130, 238, 320, dim=0.08)
    book.image_cover(s("shoudian/frame_02.jpg"), 560, 130, 232, 320, dim=0.08)
    book.light_beam(70, 112, 190, 30, HexColor("#B9D7E1"))
    book.caps("OLD OBJECT", M, 98, MIST, 5.8)
    book.caps("REPAIR", 302, 98, MIST, 5.8)
    book.caps("PHOTO / MEMORY", 560, 98, MIST, 5.8)
    book.para("光束规定观众看见什么，动作先于解释。", M, 62, 390, 10, 15, WARM, True)
    book.new(BLACK, "手电 / RELATION", HexColor("#B9D7E1"))
    book.image_cover(s("shoudian/frame_08.jpg"), M, 78, 280, 390, dim=0.12)
    book.image_cover(s("shoudian/frame_09.jpg"), 342, 294, 210, 174, dim=0.1)
    book.image_cover(s("shoudian/frame_10.jpg"), 570, 294, 222, 174, dim=0.1)
    book.image_cover(s("shoudian/frame_11.jpg"), 342, 78, 450, 188, dim=0.1)
    book.caps("WHEN THE OBJECT RETURNS, THE RELATION MOVES", 342, 56, HexColor("#B9D7E1"), 5.8)
    page_hero(book, s("shoudian/frame_07.jpg"), "当光照回彼此，\n关系才真正出现。", "DIRECTING / 02 / RETURN", HexColor("#B9D7E1"), "05'10\" / COMPLETE FILM", 0.2)


def draw_tongyoulu(book: Book) -> None:
    page_hero(book, s("tongyoulu/ep06.jpg"), "通幽录·渝州篇", "WORLD BUILDING ARCHIVE / 03", TEAL, "7 集 / 60+ 分钟 / 首集 176 条镜头指令", 0.3)
    book.new(WARM, "通幽录 / SERIES MAP", TEAL)
    book.caps("WORLD BUILDING / 7 EPISODES", M, PAGE_H - 58, HexColor("#3C7376"))
    book.title("不是七张海报，\n而是一套可以持续生产的世界。", M, PAGE_H - 112, 430, 27, INK)
    book.para("重庆山城空间、精怪执念与林砚的长线谜团同时推进。单元故事完成愿望，连续线索逐层逼近真相。", M, 314, 350, 9.5, 15, HexColor("#3B4141"))
    episodes = [("01", "浮生无迹·归乡逢幽", s("tongyoulu/ep01.jpg")), ("02", "渝州巷年", s("tongyoulu/ep02.jpg")), ("03", "江畔古楼", s("tongyoulu/ep03.jpg")), ("04", "燃茶案", s("tongyoulu/ep04.jpg")), ("05", "傀灵寄忆", s("tongyoulu/ep05.jpg")), ("07", "南山旧约", s("tongyoulu/ep07.jpg"))]
    for idx, (no, name, image) in enumerate(episodes):
        x = 424 + (idx % 3) * 124
        y = 270 - (idx // 3) * 175
        book.image_cover(image, x, y, 112, 132, dim=0.03)
        book.caps(no, x, y - 15, HexColor("#3C7376"), 5.6)
        book.para(name, x, y - 21, 112, 6.7, 9.2, HexColor("#4B5252"))
    book.caps("06 / 黄桷渡·忌渡 / EPISODE TITLE RETAINED IN THE SERIES MAP", 424, 56, HexColor("#3C7376"), 5.7)
    book.new(WARM, "通幽录 / STORYBOARD", TEAL)
    book.caps("PRODUCTION ARCHIVE / STORYBOARD", M, PAGE_H - 58, HexColor("#3C7376"))
    book.title("镜头不是生成之后才决定的。", M, PAGE_H - 110, 520, 28, INK)
    book.para("首集交付包保留图示分镜、角色 / 场景 / 道具资产与 176 条镜头指令。先固定空间关系，再进入生成与迭代。", 540, PAGE_H - 112, 252, 8.4, 13, HexColor("#596060"))
    book.image_contain(f(r"重庆故事\《通幽录》第一集项目交付包\4分镜头脚本\4.2图示分镜头\回家分镜\到家1.png"), M, 66, 360, 342, WARM)
    book.image_contain(f(r"重庆故事\《通幽录》第一集项目交付包\4分镜头脚本\4.2图示分镜头\回家分镜\到家2.png"), 426, 284, 366, 190, WARM)
    book.image_contain(f(r"重庆故事\《通幽录》第一集项目交付包\4分镜头脚本\4.2图示分镜头\回家分镜\回忆1.png"), 426, 86, 366, 180, WARM)
    book.caps("BLOCKING / SCALE / DIRECTION", 426, 60, HexColor("#3C7376"), 5.8)
    book.new(WARM, "通幽录 / ASSETS", TEAL)
    book.caps("DIGITAL ASSET SYSTEM", M, PAGE_H - 58, HexColor("#3C7376"))
    book.title("连续性来自资产系统，\n不是来自运气。", M, PAGE_H - 112, 420, 27, INK)
    book.image_contain(f(r"重庆故事\《通幽录》第一集项目交付包\5数字资产库\5.1角色\林砚.png"), M, 94, 180, 360, WARM)
    book.image_contain(f(r"重庆故事\《通幽录》第一集项目交付包\5数字资产库\5.1角色\外婆.png"), 236, 94, 180, 360, WARM)
    book.image_contain(f(r"重庆故事\《通幽录》第一集项目交付包\5数字资产库\5.2场景\老家房屋.png"), 472, 286, 320, 168, WARM)
    book.image_contain(f(r"重庆故事\《通幽录》第一集项目交付包\5数字资产库\5.3道具\高调版本通幽录.png"), 472, 94, 320, 168, WARM)
    book.caps("CHARACTER / SCENE / PROP", 472, 72, HexColor("#3C7376"), 5.8)
    book.new(BLACK, "通幽录 / SHOT COUNT", TEAL)
    book.caps("SHOT INSTRUCTION / EP01", M, PAGE_H - 58, TEAL)
    book.c.setFillColor(TEAL)
    book.c.setFont(EN_BOLD, 112)
    book.c.drawString(M, 262, "176")
    book.caps("SHOT DIRECTIONS", M + 18, 236, MIST, 6.2)
    book.para("景别 / 机位 / 动作 / 情绪 / 声音 / 资产", M, 200, 300, 12, 16, WARM, True)
    for i, label in enumerate(("01 / WORLD RULE", "02 / CHARACTER CONTINUITY", "03 / SPACE", "04 / EDIT RHYTHM")):
        y = 390 - i * 62
        book.caps(label, 460, y, TEAL, 6.1)
        book.rule(460, y - 13, 300, RULE, 0.35)
        book.para(("让山城的高差成为叙事条件。" if i == 0 else ""), 460, y - 24, 290, 7.5, 11, MIST)
    book.caps("THE SCALE IS THE DIRECTOR'S PROOF", M, 70, TEAL, 6.1)
    page_hero(book, s("tongyoulu/ep04.jpg"), "世界规则先于奇观。", "WORLD BUILDING ARCHIVE / 03 / SPACE", TEAL, "", 0.2)
    book.new(BLACK, "通幽录 / RESULT", TEAL)
    book.caps("SERIES PROOF", M, PAGE_H - 58, TEAL)
    book.image_contain(f(r"重庆故事\《通幽录》第一集项目交付包\5数字资产库\5.3道具\高调版本通幽录.png"), M, 82, 430, 406, WARM)
    book.image_contain(f(r"重庆故事\《通幽录》第一集项目交付包\5数字资产库\5.2场景\老家房屋.png"), 496, 294, 296, 194, WARM)
    book.image_cover(s("tongyoulu/cover.jpg"), 496, 82, 296, 194, dim=0.12)
    book.title("7 集不是数量，\n而是连续性被证明。", 496, 256, 296, 22, WARM)
    book.caps("AI DIRECTOR / 60+ MINUTES / 176 SHOT DIRECTIONS", 496, 54, TEAL, 5.7)


def draw_maimai(book: Book) -> None:
    page_hero(book, s("maimai/cover.jpg"), "麦麦的魔法面包店", "DIRECTING / 04 / COLOR EXPLOSION", MAIMAI_PINK, "15 集 / 30+ 分钟 / 一个面包，一次选择", 0.05, "center")
    book.new(MAIMAI_YELLOW, "麦麦 / EPISODES", MAIMAI_BLUE)
    book.caps("15 EPISODES / ONE WORLD", M, PAGE_H - 52, HexColor("#4C4D7E"))
    book.title("重复的是单元机制，\n不重复每一集的视觉答案。", M, PAGE_H - 106, 470, 28, INK)
    episode_images = [s("maimai/ep03.jpg"), s("maimai/ep06.jpg"), s("maimai/ep09b.jpg"), s("maimai/ep14.jpg"), s("maimai/ep15.jpg")]
    for idx, image in enumerate(episode_images):
        x = M + (idx % 4) * 188
        y = 216 if idx < 4 else 70
        w = 176 if idx < 4 else 176
        book.image_cover(image, x, y, w, 124, dim=0.01)
        book.caps(f"{idx + 1:02d}", x, y - 16, MAIMAI_BLUE, 5.5)
    book.caps("QUESTION / MAGIC / CHOICE", M, 50, HexColor("#4C4D7E"), 6)
    book.new(MAIMAI_PINK, "麦麦 / VISUAL SYSTEM", MAIMAI_BLUE)
    book.caps("VISUAL SYSTEM / PROCESS", M, PAGE_H - 54, MAIMAI_BLUE)
    book.title("奇幻不是装饰，\n而是孩子理解情绪的入口。", M, PAGE_H - 110, 450, 28, INK)
    book.para("每集由一种魔法面包触发一次选择。共同的店铺和角色建立安全感，能力、场景和冲突让每集保留独立命题。", M, 304, 310, 9.4, 15, HexColor("#4D3F4A"))
    book.image_cover(s("maimai/ep01.jpg"), 430, 226, 362, 254, dim=0)
    book.c.setFillColor(MAIMAI_BLUE)
    book.c.rect(430, 74, 170, 118, fill=1, stroke=0)
    book.c.setFillColor(MAIMAI_YELLOW)
    book.c.rect(612, 74, 180, 118, fill=1, stroke=0)
    book.c.setFillColor(WARM)
    book.c.setFont(EN_BOLD, 19)
    book.c.drawCentredString(515, 126, "MAGIC")
    book.c.setFillColor(INK)
    book.c.drawCentredString(702, 126, "CHOICE")
    book.caps("CHILDHOOD / COLOR / CHOICE", 430, 54, MAIMAI_BLUE, 5.8)
    book.new(MAIMAI_BLUE, "麦麦 / ITERATION", MAIMAI_YELLOW)
    book.caps("ITERATION / SPACE", M, PAGE_H - 54, MAIMAI_YELLOW)
    book.title("场景修改，让差异变得可见。", M, PAGE_H - 108, 500, 28, WARM)
    book.image_contain(f(r"麦麦的面包店\麦麦的面包店\资产\jimeng-2026-04-29-4172-将图片中的桥断开，其余元素保持不变.png"), M, 98, 350, 330, MAIMAI_BLUE)
    book.image_contain(f(r"麦麦的面包店\麦麦的面包店\资产\jimeng-2026-04-29-4485-将图片中的桥完全断开，并且让桥变得更长，其余元素保持不变.png"), 442, 98, 350, 330, MAIMAI_BLUE)
    book.caps("VERSION A", M, 74, MAIMAI_YELLOW, 5.8)
    book.caps("VERSION B / LONGER BREAK", 442, 74, MAIMAI_YELLOW, 5.8)
    page_hero(book, s("maimai/ep15.jpg"), "每一个魔法，\n都要回到一次选择。", "DIRECTING / 04 / CLOSING", MAIMAI_YELLOW, "15 EPISODES / COMPLETE SOURCE ARCHIVE", 0.08, "center")


def draw_screenwriting(book: Book) -> None:
    book.new(WARM, "SCREENWRITING / OPENING", BURGUNDY)
    book.caps("SCREENWRITING / 05", M, PAGE_H - 58, BURGUNDY)
    book.title("剧本不是对白的容器，\n而是选择与代价的设计。", M, PAGE_H - 122, 560, 32, INK)
    book.para("现实题材、年代家庭、工业转型与网络电影，都从人物关系进入，再被转译为可以拍摄的场次。", M, 290, 380, 10, 16, HexColor("#4A3F42"))
    scripts = [("两块门牌", "12 集 / 现实题材", "三峡库区两户家庭与移民、恢复高考和县城迁建。"), ("合味", "12 集 / 年代现实", "火锅店、辣椒供应与共同创制权。"), ("山城换挡", "12 集 / 工业家庭", "三代人与重庆制造业和新能源转型。"), ("山那边的课表", "12 集 / 教育题材", "乡村学校、教师、家庭与公共教育。"), ("江水记得", "约 60 分钟 / 网络电影", "姐妹通过底片、磁带和档案重新联系。")]
    for i, (title, meta, synopsis) in enumerate(scripts):
        y = 230 - i * 43
        book.caps(f"{i + 1:02d} / {meta}", M, y + 23, BURGUNDY, 5.8)
        book.para(title, 190, y + 29, 180, 13, 16, INK, True)
        book.para(synopsis, 390, y + 27, 340, 8.2, 12, HexColor("#5A5153"))
        book.rule(M, y - 6, 748, HexColor("#C9BFC0"), 0.35)
    book.caps("FULL SCRIPTS / NOT INCLUDED IN THIS PDF", M, 36, BURGUNDY, 5.8)


def draw_ai(book: Book) -> None:
    book.new(DEEP, "AI FILM / DIRECTOR PROCESS", TEAL)
    book.caps("AI FILM / DIRECTOR PROCESS", M, PAGE_H - 58, TEAL)
    book.title("AI 是制作系统，\n不是创作者身份的替代品。", M, PAGE_H - 116, 500, 30, WARM)
    book.para("人物动机、世界规则、镜头判断与最终取舍始终由导演负责。", M, 300, 350, 10.2, 16, HexColor("#B3C4C4"))
    book.image_contain(f(r"重庆故事\《通幽录》第一集项目交付包\4分镜头脚本\4.2图示分镜头\回家分镜\到家2.png"), 430, 278, 362, 205, DEEP)
    book.image_cover(s("maimai/ep03.jpg"), 430, 74, 174, 174, dim=0.02)
    book.image_cover(s("tongyoulu/ep03.jpg"), 618, 74, 174, 174, dim=0.02)
    book.caps("SCRIPT / SHOT / ASSET / GENERATION / EDIT", M, 78, TEAL, 5.9)


def draw_experiment(book: Book) -> None:
    page_hero(book, s("archive/jinyan.jpg"), "实验影像不是逃逸，\n而是寻找新的叙事形式。", "EXPERIMENT / 06", HexColor("#A795BC"), "志怪、民俗、非遗与地域经验", 0.28)


def draw_field(book: Book) -> None:
    book.new(WARM, "FIELD PRACTICE / VERIFIED", HexColor("#93745B"))
    book.caps("FIELD PRACTICE / VERIFIED CREDIT", M, PAGE_H - 58, HexColor("#93745B"))
    book.title("真实协作，让署名边界\n成为创作的一部分。", M, PAGE_H - 116, 430, 28, INK)
    book.para("共青团伙伴计划纪录短片：出品、策划为共青团重庆市綦江区委员会；王陈鑫承担摄影、剪辑，摄影为共同署名。", M, 300, 330, 9.2, 15, HexColor("#514A47"))
    book.image_cover(s("fanjiagxiang/frame_00.jpg"), 414, 276, 378, 210, dim=0.02)
    book.image_cover(s("fanjiagxiang/frame_01.jpg"), 414, 78, 182, 180, dim=0.02)
    book.image_cover(s("fanjiagxiang/frame_02.jpg"), 610, 78, 182, 180, dim=0.02)
    book.caps("03'51\" / CAMERA + EDIT / END CREDITS VERIFIED", M, 74, HexColor("#93745B"), 5.8)


def draw_photo(book: Book) -> None:
    book.new(DEEP, "PHOTOGRAPHY / OBSERVATION", SILVER)
    book.caps("PHOTOGRAPHY / OBSERVATION", M, PAGE_H - 58, SILVER)
    book.title("摄影最终回到一个导演问题：\n观众先看见什么？", M, PAGE_H - 112, 550, 29, WARM)
    photos = [
        f(r"摄影\4794913bc10f4e4b7ae1cbdd452bb9b0.JPG"), f(r"摄影\ae625a15ddf91a9ecadb49a4a508c026.JPG"),
        f(r"摄影\19c09128a06362c2abcacd41f25803f4.JPG"), f(r"摄影\ef4f854d35b74913ea090f6245d974ca.JPG"),
        f(r"摄影\1acf227bf6d2e9a3e4291dce3b6f2ed3.JPG"), f(r"摄影\106fea9093c13a256121594c98fdb2fb.JPG"),
    ]
    for i, image in enumerate(photos):
        x = M + (i % 3) * 252
        y = 222 if i < 3 else 70
        book.image_cover(image, x, y, 238, 126, dim=0.04)
        book.caps(("NIGHT / DISTANCE / WEATHER".split(" / ")[i] if i < 3 else "SPACE / REFLECTION / STRUCTURE".split(" / ")[i - 3]), x, y - 16, SILVER, 5.6)


def draw_profile(book: Book) -> None:
    book.new(WARM, "PROFILE / TRACE", BLUE)
    book.caps("PROFILE / VERIFIED TRACE", M, PAGE_H - 58, HexColor("#567384"))
    book.title("导演身份，不靠一句自我介绍成立。", M, PAGE_H - 108, 570, 29, INK)
    timeline = [("AI SERIES", "《通幽录·渝州篇》", "AI 导演 / 7 集 / 60+ 分钟 / 首集 176 条镜头指令"), ("DOCUMENTARY", "共青团伙伴计划纪录短片", "摄影、剪辑；摄影为共同署名"), ("PROGRAM", "《峡砚》", "节目类投递资料核验为主创"), ("WRITING", "五部原创剧本档案", "以申报表与原创声明为依据")]
    for i, (label, title, text) in enumerate(timeline):
        y = 358 - i * 72
        book.caps(label, M, y + 17, HexColor("#567384"), 5.9)
        book.para(title, 170, y + 25, 160, 11, 15, INK, True)
        book.para(text, 340, y + 23, 160, 7.6, 11.5, HexColor("#5D676C"))
        book.rule(M, y - 8, 456, HexColor("#C0CDD2"), 0.35)
    book.image_contain(PORTRAIT, 548, 112, 244, 280, WARM)
    book.c.setStrokeColor(Color(0.34, 0.45, 0.5, alpha=0.5))
    book.c.setLineWidth(0.55)
    book.c.rect(548, 112, 244, 280, fill=0, stroke=1)
    book.caps("PORTRAIT / OWNER-PROVIDED", 548, 88, HexColor("#567384"), 5.8)


def draw_contact(book: Book) -> None:
    book.new(BLACK, "CONTACT", BLUE, footer=False)
    book.caps("CONTACT / OWNER CONFIRMATION REQUIRED", M, PAGE_H - 58, BLUE)
    book.title("下一镜，\n一起完成。", M, 386, 420, 48, WARM)
    book.rule(M, 286, 410, BLUE, 0.55)
    book.caps("PUBLIC CONTACT", M, 246, BLUE, 6.1)
    book.para("3146652776@qq.com", M, 222, 360, 16, 21, WARM, True)
    book.para("13002860718", M, 193, 300, 13, 18, BLUE, True)
    book.c.linkURL("mailto:3146652776@qq.com", (M, 206, M + 360, 232), relative=0)
    book.c.linkURL("tel:13002860718", (M, 180, M + 300, 203), relative=0)
    book.caps("RELEASE CHECK", M, 150, MIST, 6.1)
    book.para("作品观看链接尚未提供；收到链接后补充二维码和完整影片入口。", M, 128, 360, 9.2, 14, HexColor("#A8B2B8"))
    book.caps("FULL FILM LINKS / PORTRAIT / CONTACT", 506, 76, MIST, 5.8)
    book.c.setStrokeColor(Color(BLUE.red, BLUE.green, BLUE.blue, alpha=0.55))
    book.c.setDash(4, 4)
    book.c.rect(506, 106, 286, 286, fill=0, stroke=1)
    book.c.setDash()
    book.c.setFillColor(BLUE)
    book.c.setFont(EN_BOLD, 14)
    book.c.drawCentredString(649, 252, "FILM LINKS / TO BE ADDED")
    book.para("公开作品链接确认后生成二维码。", 540, 218, 220, 8.1, 12, HexColor("#8D9AA1"), align=TA_CENTER)


def draw_closing(book: Book) -> None:
    book.new(BLACK, "FINAL FRAME", WARM, footer=False)
    book.full_bleed(s("shoudian/frame_06.jpg"), 0.62, 0.5, 0.5)
    book.c.setFillColor(Color(0, 0, 0, alpha=0.54))
    book.c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    book.caps("FINAL FRAME / 2026", M, PAGE_H - 58, WARM_DARK)
    book.centered("DIRECT FROM MOTIVE.", 318, 42, WARM)
    book.centered("让每一个镜头，都能回答人物为什么行动。", 254, 17, BLUE)
    book.centered("WANG CHENXIN / AUTHOR-DIRECTOR", 86, 8, WARM_DARK)


def main() -> None:
    register_fonts()
    book = Book(OUTPUT)
    draw_cover(book)
    draw_manifesto(book)
    draw_method(book)
    draw_directing_opener(book)
    draw_yafobuyu(book)
    draw_shoudian(book)
    draw_tongyoulu(book)
    draw_maimai(book)
    draw_screenwriting(book)
    draw_ai(book)
    draw_experiment(book)
    draw_field(book)
    draw_photo(book)
    draw_profile(book)
    draw_contact(book)
    draw_closing(book)
    book.finish()
    print(f"Created {OUTPUT}")
    print(f"Pages: {book.page}")


if __name__ == "__main__":
    main()
