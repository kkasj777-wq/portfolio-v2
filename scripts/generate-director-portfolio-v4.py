from __future__ import annotations

import hashlib
import html
import math
from functools import lru_cache
from pathlib import Path

from PIL import Image, ImageEnhance, ImageOps
from reportlab.lib.colors import Color, HexColor
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import cm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas
from reportlab.platypus import Paragraph


ROOT = Path(__file__).resolve().parents[1]
SOURCE_F = Path(r"F:\作品集")
STILLS = ROOT / "tmp" / "pdfs" / "source-assets"
CLEAN = ROOT / "tmp" / "pdfs" / "v4-clean"
PORTRAIT = ROOT / "assets" / "portrait-owner.jpg"
CACHE = ROOT / "tmp" / "pdfs" / "optimized-assets-v4-cool"
OUTPUT = ROOT / "output" / "pdf" / "Wang-Chenxin-Author-Director-Portfolio-2026-V4.pdf"
SPEC_OUTPUT = ROOT / "output" / "pdf" / "Wang-Chenxin-Portfolio-V4-Design-Spec.pdf"

PAGE_W, PAGE_H = landscape(A4)
M = 2.5 * cm
GUTTER = 10
COL = (PAGE_W - 2 * M - 11 * GUTTER) / 12

BG = HexColor("#F5F7FA")
NAVY = HexColor("#1E3A5F")
MIST = HexColor("#5B7B9A")
TEXT = HexColor("#2C3E4F")
NOTE = HexColor("#6F8FA5")
PALE = HexColor("#EAF0F5")
PALE_2 = HexColor("#DFE8F0")
WHITE = HexColor("#FFFFFF")
ICE = HexColor("#A9C8DD")

CN = "NotoSansSC"
CN_BOLD = "Deng-Bold"
EN = "Inter-Regular"
EN_MED = "Inter-Medium"
EN_BOLD = "Inter-SemiBold"


def register_fonts() -> None:
    pdfmetrics.registerFont(TTFont(CN, r"C:\Windows\Fonts\NotoSansSC-VF.ttf"))
    pdfmetrics.registerFont(TTFont(CN_BOLD, r"C:\Windows\Fonts\Dengb.ttf"))
    pdfmetrics.registerFont(TTFont(EN, r"C:\Windows\Fonts\Inter-Regular.ttf"))
    pdfmetrics.registerFont(TTFont(EN_MED, r"C:\Windows\Fonts\Inter-Medium.ttf"))
    pdfmetrics.registerFont(TTFont(EN_BOLD, r"C:\Windows\Fonts\Inter-SemiBold.ttf"))


def gx(col: int) -> float:
    return M + col * (COL + GUTTER)


def gw(span: int) -> float:
    return span * COL + (span - 1) * GUTTER


def verified(root: Path, relative: str) -> Path:
    path = root / relative
    if not path.exists():
        raise FileNotFoundError(path)
    return path


def f(relative: str) -> Path:
    return verified(SOURCE_F, relative)


def s(relative: str) -> Path:
    return verified(STILLS, relative)


def clean(relative: str) -> Path:
    return verified(CLEAN, relative)


def esc(value: str) -> str:
    return html.escape(value).replace("\n", "<br/>")


@lru_cache(maxsize=512)
def cool_image(path_string: str) -> Path:
    source = Path(path_string)
    stat = source.stat()
    signature = f"{source.resolve()}|{stat.st_mtime_ns}|{stat.st_size}|cool-v4b".encode("utf-8")
    target = CACHE / f"{hashlib.sha1(signature).hexdigest()[:24]}.jpg"
    if target.exists():
        return target
    CACHE.mkdir(parents=True, exist_ok=True)
    with Image.open(source) as raw:
        image = ImageOps.exif_transpose(raw).convert("RGB")
        image = ImageEnhance.Brightness(image).enhance(1.05)
        image = ImageEnhance.Contrast(image).enhance(1.07)
        image = ImageEnhance.Color(image).enhance(0.66)
        r, g, b = image.split()
        r = r.point(lambda value: int(max(0, min(255, value * 0.86))))
        g = g.point(lambda value: int(max(0, min(255, value * 0.98 + 2))))
        b = b.point(lambda value: int(max(0, min(255, value * 1.13 + 7))))
        image = Image.merge("RGB", (r, g, b))
        overlay = Image.new("RGB", image.size, (212, 231, 243))
        image = Image.blend(image, overlay, 0.13)
        image.thumbnail((1900, 1350), Image.Resampling.LANCZOS)
        image.save(target, "JPEG", quality=88, subsampling=0, optimize=True, progressive=True, dpi=(150, 150))
    return target


@lru_cache(maxsize=512)
def image_size(path_string: str) -> tuple[int, int]:
    with Image.open(path_string) as image:
        return image.size


class Portfolio:
    def __init__(self, output: Path):
        output.parent.mkdir(parents=True, exist_ok=True)
        self.c = canvas.Canvas(
            str(output), pagesize=(PAGE_W, PAGE_H), pageCompression=1,
            initialFontName=EN, initialFontSize=12, initialLeading=14,
        )
        self.c.setTitle("Wang Chenxin - Author-Director Portfolio - 2026 - V4")
        self.c.setAuthor("Wang Chenxin")
        self.page = 0

    def new(self, bg: Color = BG, footer: bool = True) -> None:
        if self.page:
            self.c.showPage()
        self.page += 1
        self.c.setFillColor(bg)
        self.c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
        if footer:
            self.page_number()

    def finish(self) -> None:
        self.c.showPage()
        self.c.save()

    def page_number(self) -> None:
        self.c.setFillColor(NOTE)
        self.c.setFont(EN_MED, 8)
        self.c.drawRightString(PAGE_W - M, 22, f"{self.page:02d}")

    def para(self, text: str, x: float, top: float, width: float, size: float = 11, leading: float | None = None,
             color: Color = TEXT, bold: bool = False, align: int = TA_LEFT, max_height: float = 500) -> float:
        style = ParagraphStyle(
            "v4", fontName=CN_BOLD if bold else CN, fontSize=size, leading=leading or size * 1.5,
            textColor=color, alignment=align, wordWrap="CJK", splitLongWords=True,
        )
        paragraph = Paragraph(esc(text), style)
        _, height = paragraph.wrap(width, max_height)
        paragraph.drawOn(self.c, x, top - height)
        return height

    def title(self, text: str, x: float, top: float, width: float, size: float = 24, color: Color = NAVY,
              align: int = TA_LEFT) -> float:
        return self.para(text, x, top, width, size, size * 1.18, color, True, align)

    def label(self, text: str, x: float, y: float, color: Color = NOTE, size: float = 8) -> None:
        self.c.setFillColor(color)
        self.c.setFont(EN_BOLD, size)
        self.c.drawString(x, y, text.upper())

    def line(self, x: float, y: float, width: float, color: Color = MIST, thickness: float = 0.6) -> None:
        self.c.setStrokeColor(color)
        self.c.setLineWidth(thickness)
        self.c.line(x, y, x + width, y)

    def image_cover(self, path: Path, x: float, y: float, width: float, height: float, anchor_x: float = 0.5,
                    anchor_y: float = 0.5) -> None:
        target = cool_image(str(path))
        iw, ih = image_size(str(target))
        scale = max(width / iw, height / ih)
        dw, dh = iw * scale, ih * scale
        dx = x - (dw - width) * anchor_x
        dy = y - (dh - height) * anchor_y
        self.c.saveState()
        clip = self.c.beginPath()
        clip.rect(x, y, width, height)
        self.c.clipPath(clip, stroke=0, fill=0)
        self.c.drawImage(str(target), dx, dy, width=dw, height=dh, mask="auto")
        self.c.restoreState()

    def image_contain(self, path: Path, x: float, y: float, width: float, height: float, bg: Color = BG) -> None:
        target = cool_image(str(path))
        iw, ih = image_size(str(target))
        scale = min(width / iw, height / ih)
        dw, dh = iw * scale, ih * scale
        self.c.setFillColor(bg)
        self.c.rect(x, y, width, height, fill=1, stroke=0)
        self.c.drawImage(str(target), x + (width - dw) / 2, y + (height - dh) / 2, width=dw, height=dh, mask="auto")

    def card(self, x: float, y: float, width: float, height: float, fill: Color = PALE, stroke: Color = MIST) -> None:
        self.c.setFillColor(fill)
        self.c.setStrokeColor(stroke)
        self.c.setLineWidth(0.55)
        self.c.rect(x, y, width, height, fill=1, stroke=1)

    def arrow(self, x1: float, y1: float, x2: float, y2: float, color: Color = MIST) -> None:
        self.c.setStrokeColor(color)
        self.c.setFillColor(color)
        self.c.setLineWidth(1.4)
        self.c.line(x1, y1, x2, y2)
        angle = math.atan2(y2 - y1, x2 - x1)
        length = 8
        p = self.c.beginPath()
        p.moveTo(x2, y2)
        p.lineTo(x2 - length * math.cos(angle - 0.45), y2 - length * math.sin(angle - 0.45))
        p.lineTo(x2 - length * math.cos(angle + 0.45), y2 - length * math.sin(angle + 0.45))
        p.close()
        self.c.drawPath(p, fill=1, stroke=0)


def draw_page_1(b: Portfolio) -> None:
    b.new(BG, footer=False)
    top_h = PAGE_H / 3
    b.c.setFillColor(NAVY)
    b.c.rect(0, PAGE_H - top_h, PAGE_W, top_h, fill=1, stroke=0)
    b.title("作者型导演 / 编剧 / AI 影像创作者", M, PAGE_H - 62, PAGE_W - 2 * M, 24, WHITE)
    b.label("AUTHOR-DIRECTOR / SCREENWRITER / AI FILM", M, PAGE_H - 116, ICE, 9)
    b.c.setFillColor(NAVY)
    b.c.rect(M, 230, 360, 92, fill=1, stroke=0)
    b.c.setFillColor(WHITE)
    b.c.setFont(CN_BOLD, 48)
    b.c.drawString(M + 20, 252, "王陈鑫")
    b.c.setFillColor(MIST)
    b.c.setFont(EN_BOLD, 20)
    b.c.drawString(M, 178, "A DIRECTOR'S PORTFOLIO")
    b.para("从人物动机到可执行镜头 / 2026", M, 144, 430, 11, 16, TEXT)
    b.line(M, 92, PAGE_W - 2 * M, MIST, 0.8)


def draw_page_2(b: Portfolio) -> None:
    b.new(BG)
    b.label("POSITION / 02", gx(0), PAGE_H - M + 16, MIST)
    b.title("“我先决定人物为什么行动，\n再决定镜头如何移动。”", gx(0), PAGE_H - M - 18, gw(5), 24, NAVY)
    b.para("我的创作从人物、世界规则和故事结构出发，再进入剧本、分镜、镜头设计、AI 影像与剪辑。技术改变制作方式，但不替代导演判断。", gx(0), 310, gw(5), 11, 18, TEXT)
    b.image_contain(PORTRAIT, gx(5), M + 14, gw(7), PAGE_H - 2 * M - 28, BG)
    b.label("OWNER-PROVIDED PORTRAIT", gx(5), M - 8, NOTE, 8)


def draw_page_3(b: Portfolio) -> None:
    b.new(BG)
    b.title("从命题到镜头：六个连续判断", gx(0), PAGE_H - M + 6, gw(8), 24, NAVY)
    items = [
        ("QUESTION", "故事真正讨论什么？"), ("PERSON", "谁必须付出代价？"),
        ("STRUCTURE", "信息何时被看见？"), ("SHOT", "观众先看见什么？"),
        ("SYSTEM", "如何维持连续？"), ("CUT", "什么应该被留下？"),
    ]
    y, h = 190, 220
    for i, (en, zh) in enumerate(items):
        x = gx(i * 2)
        w = gw(2)
        b.card(x, y, w, h, PALE if i % 2 == 0 else WHITE)
        b.c.setFillColor(NAVY)
        b.c.setFont(EN_BOLD, 10)
        b.c.drawString(x + 10, y + h - 28, en)
        b.para(zh, x + 10, y + h - 62, w - 20, 11, 17, TEXT, True)
        b.c.setFillColor(ICE)
        b.c.rect(x + 10, y + 22, w - 20, 4, fill=1, stroke=0)
    b.para("THE TEST / 如果镜头不能回答人物为什么行动，它就还没有准备好。", gx(0), 130, gw(12), 11, 16, MIST, False)


def draw_page_4(b: Portfolio) -> None:
    b.new(BG)
    b.title("四种作品，四种导演判断", gx(0), PAGE_H - M + 6, gw(7), 24, NAVY)
    blocks = [
        ("01", "石刻与记忆", HexColor("#DCE6EE")), ("02", "黑暗与光束", HexColor("#C9D7E3")),
        ("03", "世界观与资产", HexColor("#B5C9D9")), ("04", "单元机制与选择", HexColor("#A4BDD1")),
    ]
    y, h = 180, 238
    for i, (no, name, color) in enumerate(blocks):
        x = gx(i * 3)
        w = gw(3)
        b.c.setFillColor(color)
        b.c.rect(x, y, w, h, fill=1, stroke=0)
        b.c.setFillColor(NAVY)
        b.c.setFont(EN_BOLD, 18)
        b.c.drawString(x + 16, y + h - 42, no)
        b.para(name, x + 16, y + 82, w - 32, 16, 21, NAVY, True)
    b.line(gx(0), 134, gw(12), NAVY, 1)


def draw_page_5(b: Portfolio) -> None:
    b.new(BG)
    b.title("崖佛不语，岁岁佑我", gx(0), 320, gw(12), 48, NAVY, TA_CENTER)
    b.para("YAFO BUYU, SUISUI YOU WO / DIRECTING CASE 01", gx(2), 252, gw(8), 10, 14, MIST, False, TA_CENTER)
    b.line(gx(2), 116, gw(8), MIST, 0.8)


def draw_page_6(b: Portfolio) -> None:
    b.new(BG)
    img_w = PAGE_W * 0.60
    img_x = (PAGE_W - img_w) / 2
    b.image_cover(s("yafobuyu/frame_05.jpg"), img_x, 214, img_w, 300)
    b.label("CHILDHOOD / ADULT / RETURN", img_x + img_w - 164, 196, MIST, 8)
    b.title("导演笔记", gx(2), 166, gw(2), 16, NAVY)
    b.para("石刻不是背景，而是人物记忆的空间。镜头先让人物被场域包围，再逐步靠近，使童年祈愿与成年回望彼此照亮。", gx(4), 168, gw(6), 11, 18, TEXT)


def draw_page_7(b: Portfolio) -> None:
    b.new(BG)
    b.title("STONE / RITUAL / OBJECT", gx(0), PAGE_H - M + 6, gw(8), 24, NAVY)
    items = [
        ("STONE", "石刻提供比人物更长的时间尺度。", PALE),
        ("RITUAL", "祈愿动作把守护从仪式转为关系。", WHITE),
        ("OBJECT", "苹果与陪伴连接童年和成年。", PALE),
    ]
    for i, (en, zh, fill) in enumerate(items):
        x = gx(i * 4)
        w = gw(4)
        b.c.setFillColor(fill)
        b.c.rect(x, 120, w, 320, fill=1, stroke=0)
        cx, cy = x + w / 2, 332
        b.c.setStrokeColor(MIST)
        b.c.setLineWidth(1.3)
        if i == 0:
            b.c.circle(cx, cy, 28, fill=0, stroke=1)
            b.c.circle(cx, cy, 12, fill=0, stroke=1)
        elif i == 1:
            b.c.line(cx - 26, cy - 26, cx, cy + 28)
            b.c.line(cx, cy + 28, cx + 26, cy - 26)
            b.c.line(cx - 26, cy - 26, cx + 26, cy - 26)
        else:
            b.c.rect(cx - 28, cy - 28, 56, 56, fill=0, stroke=1)
            b.c.line(cx - 28, cy - 28, cx + 28, cy + 28)
        b.c.setFillColor(NAVY)
        b.c.setFont(EN_BOLD, 14)
        b.c.drawCentredString(cx, 250, en)
        b.para(zh, x + 22, 216, w - 44, 11, 18, TEXT, False, TA_CENTER)


def draw_page_8(b: Portfolio) -> None:
    b.new(BG)
    b.title("守护不是答案，\n是被时间重新看见。", gx(1), 342, gw(10), 36, NAVY, TA_CENTER)
    b.line(gx(4), 180, gw(4), MIST, 0.7)


def draw_page_9(b: Portfolio) -> None:
    b.new(BG)
    left_w = gw(5)
    b.c.setFillColor(PALE)
    b.c.rect(gx(0), 112, left_w, 362, fill=1, stroke=0)
    b.title("容器", gx(0) + 22, 422, left_w - 44, 24, NAVY)
    b.para("大足石刻被作为关系的容器，而不是地域标签。冷灰雨雾、石壁尺度和人物表情共同完成情感回声。", gx(0) + 22, 360, left_w - 44, 10, 17, TEXT)
    b.image_cover(s("yafobuyu/frame_02.jpg"), gx(5), 112, gw(7), 362)


def draw_page_10(b: Portfolio) -> None:
    b.new(BG)
    width = PAGE_W * 0.70
    x = (PAGE_W - width) / 2
    b.image_cover(s("shoudian/frame_08.jpg"), x, 154, width, 334)
    b.para("“不用对白解释父子关系，让光替人物说话。”", x, 122, width, 16, 21, MIST)


def draw_page_11(b: Portfolio) -> None:
    b.new(BG)
    steps = 56
    for i in range(steps):
        t = i / (steps - 1)
        r = NAVY.red * (1 - t) + BG.red * t
        g = NAVY.green * (1 - t) + BG.green * t
        bl = NAVY.blue * (1 - t) + BG.blue * t
        b.c.setFillColor(Color(r, g, bl))
        b.c.rect(i * PAGE_W / steps, 0, PAGE_W / steps + 1, PAGE_H, fill=1, stroke=0)
    b.title("一束窄光，\n把观看变成行动。", gx(1), 342, gw(10), 36, WHITE, TA_CENTER)


def draw_page_12(b: Portfolio) -> None:
    b.new(BG)
    b.image_cover(s("shoudian/frame_05.jpg"), gx(0), 104, gw(7), 382)
    b.title("光来规定\n观众看见什么。", gx(8), 386, gw(4), 24, NAVY)
    b.para("窄光在暗空间中建立观看方向，人物行动始终先于解释。", gx(8), 300, gw(4), 11, 18, TEXT)
    b.arrow(gx(8), 242, gx(6) + 20, 286, MIST)


def draw_page_13(b: Portfolio) -> None:
    b.new(PALE)
    b.title("176 个镜头判断", gx(0), PAGE_H - M + 6, gw(6), 24, NAVY)
    points = []
    for i in range(18):
        x = gx(0) + i * gw(12) / 17
        y = 260 + math.sin(i * 0.85) * 58
        points.append((x, y))
    b.c.setStrokeColor(ICE)
    b.c.setLineWidth(2)
    path = b.c.beginPath()
    path.moveTo(*points[0])
    for x, y in points[1:]:
        path.lineTo(x, y)
    b.c.drawPath(path, fill=0, stroke=1)
    for i, (x, y) in enumerate(points):
        b.c.setFillColor(NAVY if i % 3 == 0 else MIST)
        b.c.circle(x, y, 5, fill=1, stroke=0)
        b.c.setFillColor(NOTE)
        b.c.setFont(EN_MED, 7)
        b.c.drawCentredString(x, y + 13, f"{i * 10 + 1:03d}")
    b.para("176 个镜头判断，分布在冷色光谱的每一个节点。", gx(0), 148, gw(12), 14, 20, NAVY, True)


def draw_page_14(b: Portfolio) -> None:
    b.new(BG)
    b.c.setFillColor(Color(0.55, 0.72, 0.84, alpha=0.22))
    beam = b.c.beginPath()
    beam.moveTo(0, PAGE_H)
    beam.lineTo(180, PAGE_H)
    beam.lineTo(560, 0)
    beam.lineTo(290, 0)
    beam.close()
    b.c.drawPath(beam, fill=1, stroke=0)
    b.title("当光照回彼此，\n关系才真正出现。", gx(2), 338, gw(8), 36, NAVY, TA_CENTER)


def draw_page_15(b: Portfolio) -> None:
    b.new(NAVY, footer=False)
    b.title("通幽录·渝州篇", gx(0), 376, gw(12), 40, WHITE, TA_CENTER)
    b.para("WORLD BUILDING ARCHIVE / 7 EPISODES / 60+ MINUTES", gx(2), 314, gw(8), 10, 14, ICE, False, TA_CENTER)
    b.c.setFillColor(HexColor("#7790A5"))
    silhouette = b.c.beginPath()
    silhouette.moveTo(0, 0)
    for x, y in [(0, 86), (70, 86), (70, 124), (130, 124), (130, 102), (220, 102), (220, 156), (310, 156), (310, 118), (410, 118), (410, 190), (505, 190), (505, 130), (620, 130), (620, 172), (720, 172), (720, 110), (PAGE_W, 110), (PAGE_W, 0)]:
        silhouette.lineTo(x, y)
    silhouette.close()
    b.c.drawPath(silhouette, fill=1, stroke=0)


def draw_page_16(b: Portfolio) -> None:
    b.new(BG)
    b.title("七个单元，一张山城地图", gx(0), PAGE_H - M + 6, gw(7), 24, NAVY)
    b.c.setStrokeColor(HexColor("#D4DEE7"))
    b.c.setLineWidth(1)
    for k in range(6):
        p = b.c.beginPath()
        for i in range(80):
            x = M + i * (PAGE_W - 2 * M) / 79
            y = 270 + math.sin(i * 0.24 + k) * 28 + math.sin(i * 0.08) * 52 + k * 8
            if i == 0:
                p.moveTo(x, y)
            else:
                p.lineTo(x, y)
        b.c.drawPath(p, fill=0, stroke=1)
    episodes = ["浮生无迹·归乡逢幽", "渝州巷年", "江畔古楼", "黄桷渡·燃茶案", "傀灵寄忆", "黄桷渡·忌渡", "南山旧约"]
    positions = [(1, 370), (4, 324), (8, 388), (2, 228), (6, 260), (9, 202), (5, 150)]
    for i, (name, (col, y)) in enumerate(zip(episodes, positions), 1):
        x = gx(col)
        b.c.setFillColor(WHITE)
        b.c.setStrokeColor(MIST)
        b.c.rect(x, y, 142, 28, fill=1, stroke=1)
        b.c.setFillColor(NAVY)
        b.c.setFont(EN_BOLD, 7)
        b.c.drawString(x + 8, y + 10, f"{i:02d}")
        b.para(name, x + 30, y + 19, 104, 7.4, 10, TEXT)


def draw_page_17(b: Portfolio) -> None:
    b.new(BG)
    b.title("镜头不是生成之后\n才决定的。", gx(0), PAGE_H - M + 2, gw(4), 24, NAVY)
    b.para("首集交付包保留图示分镜、角色 / 场景 / 道具资产与镜头指令。先固定空间关系，再进入生成和剪辑。", gx(0), 330, gw(4), 11, 18, TEXT)
    hand = f(r"重庆故事\《通幽录》第一集项目交付包\4分镜头脚本\4.2图示分镜头\回家分镜\到家1.png")
    b.image_contain(hand, gx(5), 250, gw(7), 230, BG)
    b.image_cover(s("tongyoulu/ep01.jpg"), gx(5), 92, gw(7), 130)
    b.label("STORYBOARD", gx(5), 232, NOTE)
    b.label("FINAL FRAME", gx(5), 74, NOTE)


def draw_page_18(b: Portfolio) -> None:
    b.new(BG)
    b.title("连续性来自资产系统", gx(0), PAGE_H - M + 6, gw(7), 24, NAVY)
    assets = [
        ("CHARACTER", f(r"重庆故事\《通幽录》第一集项目交付包\5数字资产库\5.1角色\林砚.png")),
        ("SCENE", f(r"重庆故事\《通幽录》第一集项目交付包\5数字资产库\5.2场景\老家房屋.png")),
        ("PROP", f(r"重庆故事\《通幽录》第一集项目交付包\5数字资产库\5.3道具\高调版本通幽录.png")),
        ("COLOR", s("tongyoulu/ep03.jpg")),
    ]
    for i, (label, image) in enumerate(assets):
        x = gx(i * 3)
        w = gw(3)
        b.card(x, 124, w, 316, WHITE, MIST)
        b.image_contain(image, x + 10, 186, w - 20, 232, WHITE)
        b.label(label, x + 12, 154, NAVY, 9)


def draw_page_19(b: Portfolio) -> None:
    b.new(BG)
    b.c.setFillColor(NAVY)
    b.c.setFont(EN_BOLD, 72)
    b.c.drawString(gx(0), 402, "176")
    b.label("SHOT DIRECTIONS / EPISODE 01", gx(0), 382, MIST, 9)
    dimensions = [("SCALE", "景别"), ("CAMERA", "机位"), ("ACTION", "动作"), ("EMOTION", "情绪"), ("SOUND", "声音"), ("ASSET", "资产")]
    y, h = 150, 170
    for i, (en, zh) in enumerate(dimensions):
        x = gx(i * 2)
        w = gw(2)
        b.card(x, y, w, h, PALE if i % 2 == 0 else WHITE)
        b.c.setFillColor(NAVY)
        b.c.setFont(EN_BOLD, 9)
        b.c.drawString(x + 10, y + h - 28, en)
        b.para(zh, x + 10, y + 92, w - 20, 16, 21, TEXT, True)
        b.line(x + 10, y + 38, w - 20, MIST, 0.45)


def draw_page_20(b: Portfolio) -> None:
    b.new(BG)
    b.title("世界规则先于奇观。", gx(1), 384, gw(10), 36, NAVY, TA_CENTER)
    b.image_cover(s("tongyoulu/ep04.jpg"), gx(3), 146, gw(6), 180)
    b.para("山城高差、江雾和吊脚楼先成为叙事条件，再成为视觉风格。", gx(3), 118, gw(6), 10, 15, MIST, False, TA_CENTER)


def draw_page_21(b: Portfolio) -> None:
    b.new(BG)
    b.image_cover(s("tongyoulu/ep07.jpg"), gx(0), 160, gw(5), 300)
    b.image_cover(s("tongyoulu/ep05.jpg"), gx(7), 160, gw(5), 300)
    b.title("7 集不是数量，\n而是连续性\n被证明。", gx(5), 360, gw(2), 16, NAVY, TA_CENTER)
    start, seg_w, gap = gx(0), (gw(12) - 6 * 8) / 7, 8
    for i in range(7):
        b.c.setFillColor(NAVY if i < 7 else PALE)
        b.c.rect(start + i * (seg_w + gap), 102, seg_w, 8, fill=1, stroke=0)
        b.c.setFillColor(NOTE)
        b.c.setFont(EN_MED, 7)
        b.c.drawCentredString(start + i * (seg_w + gap) + seg_w / 2, 84, f"EP {i + 1:02d}")


def draw_bread_icon(c: canvas.Canvas, cx: float, cy: float, scale: float = 1.0) -> None:
    c.setStrokeColor(ICE)
    c.setLineWidth(2)
    p = c.beginPath()
    p.moveTo(cx - 48 * scale, cy - 28 * scale)
    p.curveTo(cx - 62 * scale, cy + 10 * scale, cx - 30 * scale, cy + 42 * scale, cx, cy + 38 * scale)
    p.curveTo(cx + 30 * scale, cy + 42 * scale, cx + 62 * scale, cy + 10 * scale, cx + 48 * scale, cy - 28 * scale)
    p.close()
    c.drawPath(p, fill=0, stroke=1)
    for dx in (-22, 0, 22):
        c.arc(cx + dx * scale - 9, cy + 4, cx + dx * scale + 9, cy + 28, startAng=20, extent=130)


def draw_page_22(b: Portfolio) -> None:
    b.new(NAVY, footer=False)
    draw_bread_icon(b.c, PAGE_W / 2, 352, 1.2)
    b.title("麦麦的魔法面包店", gx(1), 260, gw(10), 36, WHITE, TA_CENTER)
    b.para("MAIMAI'S MAGIC BAKERY / 15 EPISODES", gx(2), 202, gw(8), 10, 14, ICE, False, TA_CENTER)


def draw_page_23(b: Portfolio) -> None:
    b.new(BG)
    b.title("重复的是单元机制，\n不重复每一集的视觉答案。", gx(0), PAGE_H - M + 2, gw(5), 24, NAVY)
    b.para("每集由一种魔法面包触发一次选择。共同的店铺和角色建立安全感，能力、场景和冲突保留差异。", gx(0), 316, gw(5), 11, 18, TEXT)
    b.image_cover(s("maimai/ep03.jpg"), gx(5), 106, gw(7), 372)


def draw_page_24(b: Portfolio) -> None:
    b.new(BG)
    width = PAGE_W * 0.80
    x = (PAGE_W - width) / 2
    b.image_cover(s("maimai/ep14.jpg"), x, 150, width, 330)
    b.para("奇幻机制把抽象困惑转为孩子能够行动、选择和承担结果的体验。", x, 122, width, 10, 15, NOTE)


def draw_page_25(b: Portfolio) -> None:
    b.new(BG)
    b.title("场景修改，让差异变得可见。", gx(0), PAGE_H - M + 6, gw(8), 24, NAVY)
    before = f(r"麦麦的面包店\麦麦的面包店\资产\jimeng-2026-04-29-4172-将图片中的桥断开，其余元素保持不变.png")
    after = f(r"麦麦的面包店\麦麦的面包店\资产\jimeng-2026-04-29-4485-将图片中的桥完全断开，并且让桥变得更长，其余元素保持不变.png")
    b.image_cover(before, gx(0), 150, gw(5), 282)
    b.image_cover(after, gx(7), 150, gw(5), 282)
    b.label("BEFORE", gx(0), 126, NOTE)
    b.label("AFTER", gx(7), 126, NOTE)
    b.arrow(gx(5) + 10, 290, gx(7) - 10, 290, NAVY)


def draw_page_26(b: Portfolio) -> None:
    b.new(BG)
    b.title("每一个魔法，\n都要回到一次选择。", gx(1), 410, gw(10), 32, NAVY, TA_CENTER)
    nodes = [(PAGE_W / 2, 244, "MAGIC"), (PAGE_W / 2 + 150, 164, "CHOICE"), (PAGE_W / 2 - 150, 164, "RESULT")]
    for x, y, label in nodes:
        b.c.setFillColor(PALE)
        b.c.setStrokeColor(MIST)
        b.c.circle(x, y, 48, fill=1, stroke=1)
        b.c.setFillColor(NAVY)
        b.c.setFont(EN_BOLD, 10)
        b.c.drawCentredString(x, y - 3, label)
    b.arrow(nodes[0][0] + 38, nodes[0][1] - 20, nodes[1][0] - 40, nodes[1][1] + 18, MIST)
    b.arrow(nodes[1][0] - 40, nodes[1][1] - 30, nodes[2][0] + 40, nodes[2][1] - 30, MIST)
    b.arrow(nodes[2][0] + 12, nodes[2][1] + 45, nodes[0][0] - 12, nodes[0][1] - 45, MIST)


def draw_page_27(b: Portfolio) -> None:
    b.new(BG)
    b.title("原创剧本 / 五个项目", gx(0), PAGE_H - M + 6, gw(7), 24, NAVY)
    projects = [
        ("01", "两块门牌", "迁徙与制度变化让两户家庭重新决定归属。"),
        ("02", "合味", "共同劳动之后，谁拥有创制权？"),
        ("03", "山城换挡", "产业转型迫使三代人改变自我理解。"),
        ("04", "山那边的课表", "公共教育需要长期建设，而非一次性善意。"),
        ("05", "江水记得", "分离的姐妹必须重新面对记忆与档案。"),
    ]
    xline = gx(1)
    b.c.setStrokeColor(MIST)
    b.c.setLineWidth(1)
    b.c.line(xline, 112, xline, 430)
    for i, (no, title, note) in enumerate(projects):
        y = 408 - i * 66
        b.c.setFillColor(NAVY)
        b.c.circle(xline, y, 5, fill=1, stroke=0)
        b.c.setFont(EN_BOLD, 8)
        b.c.drawRightString(xline - 18, y - 3, no)
        b.para(title, gx(2), y + 12, gw(3), 16, 20, NAVY, True)
        b.para(note, gx(5), y + 12, gw(6), 11, 17, TEXT)
        b.line(gx(2), y - 20, gw(9), PALE_2, 0.5)


def draw_page_28(b: Portfolio) -> None:
    b.new(BG)
    b.title("AI 不是创作者身份的替代品。", gx(0), PAGE_H - M + 2, gw(5), 24, NAVY)
    b.para("人物动机、世界规则、镜头判断和最终取舍始终由导演负责。现有归档没有保留工具界面截图，因此本页使用真实分镜与生成资产呈现工作流程，不伪造软件界面。", gx(0), 330, gw(5), 11, 18, TEXT)
    b.card(gx(5), 112, gw(7), 364, WHITE, MIST)
    board = f(r"重庆故事\《通幽录》第一集项目交付包\4分镜头脚本\4.2图示分镜头\回家分镜\到家2.png")
    b.image_contain(board, gx(5) + 12, 244, gw(7) - 24, 216, WHITE)
    b.image_cover(s("maimai/ep03.jpg"), gx(5) + 12, 128, gw(3), 96)
    b.image_cover(s("tongyoulu/ep03.jpg"), gx(8) + 4, 128, gw(4) - 16, 96)
    b.label("VERIFIED PROCESS ASSETS", gx(5) + 12, 116, NOTE)


def draw_page_29(b: Portfolio) -> None:
    b.new(BG)
    b.title("实验影像不是逃逸，\n而是寻找新的叙事形式。", gx(0), PAGE_H - M + 2, gw(5), 24, NAVY)
    b.para("志怪、民俗、非遗与地域经验被重新组织为影像规则。", gx(0), 300, gw(5), 11, 18, TEXT)
    b.image_cover(clean("jinyan_04.jpg"), gx(5), 110, gw(7), 368)


def draw_page_30(b: Portfolio) -> None:
    b.new(PALE)
    b.title("真实协作，让署名边界\n成为创作的一部分。", gx(0), PAGE_H - M + 2, gw(7), 24, NAVY)
    images = [clean("field_00.jpg"), clean("field_04.jpg"), clean("field_05.jpg")]
    for i, image in enumerate(images):
        b.image_cover(image, gx(i * 4), 190, gw(4), 210)
    b.para("共青团伙伴计划纪录短片 / 出品、策划：共青团重庆市綦江区委员会 / 王陈鑫：摄影、剪辑；摄影为共同署名。", gx(0), 148, gw(12), 10, 16, TEXT)


def draw_page_31(b: Portfolio) -> None:
    b.new(BG)
    b.title("摄影最终回到一个导演问题：\n观众先看见什么？", gx(1), PAGE_H - M + 2, gw(10), 24, NAVY, TA_CENTER)
    images = [
        f(r"摄影\4794913bc10f4e4b7ae1cbdd452bb9b0.JPG"),
        f(r"摄影\ae625a15ddf91a9ecadb49a4a508c026.JPG"),
        f(r"摄影\19c09128a06362c2abcacd41f25803f4.JPG"),
    ]
    labels = ["LONG SHOT", "MEDIUM", "DETAIL"]
    for i, (image, label) in enumerate(zip(images, labels)):
        x = gx(i * 4)
        b.image_cover(image, x, 154, gw(4), 220)
        b.label(label, x, 132, NOTE)
        if i < 2:
            b.arrow(x + gw(4) + 3, 264, gx((i + 1) * 4) - 3, 264, MIST)


def draw_page_32(b: Portfolio) -> None:
    b.new(BG)
    b.title("导演身份，\n不靠一句自我介绍成立。", gx(6), 190, gw(6), 28, HexColor("#8A9AAA"))


def draw_storyboard_icon(c: canvas.Canvas, cx: float, cy: float) -> None:
    c.setStrokeColor(MIST)
    c.setLineWidth(2)
    c.rect(cx - 60, cy - 45, 120, 90, fill=0, stroke=1)
    c.line(cx - 60, cy + 15, cx + 60, cy + 15)
    c.line(cx - 20, cy - 45, cx - 20, cy + 15)
    c.line(cx + 20, cy - 45, cx + 20, cy + 15)
    c.line(cx - 60, cy + 45, cx + 60, cy + 15)


def draw_page_33(b: Portfolio) -> None:
    b.new(BG)
    b.title("下一镜，一起完成。", gx(1), 420, gw(10), 36, NAVY, TA_CENTER)
    draw_storyboard_icon(b.c, PAGE_W / 2, 270)
    b.para("3146652776@qq.com  /  13002860718", gx(2), 154, gw(8), 11, 16, TEXT, False, TA_CENTER)
    b.c.linkURL("mailto:3146652776@qq.com", (gx(2), 132, gx(7), 170), relative=0)
    b.c.linkURL("tel:13002860718", (gx(7), 132, gx(10), 170), relative=0)
    b.para("作品观看链接确认后补充二维码。", gx(2), 118, gw(8), 8, 12, NOTE, False, TA_CENTER)


def draw_page_34(b: Portfolio) -> None:
    b.new(BG, footer=False)
    b.title("让每一个镜头，\n都能回答人物为什么行动。", gx(1), 360, gw(10), 36, NAVY, TA_CENTER)
    b.line(gx(3), 176, gw(6), MIST, 0.8)
    b.c.setFillColor(NAVY)
    b.c.setFont(EN_BOLD, 12)
    b.c.drawCentredString(PAGE_W / 2, 130, "WANG CHENXIN / 2026")
    b.para("王陈鑫 / AUTHOR-DIRECTOR", gx(3), 104, gw(6), 10, 14, NOTE, False, TA_CENTER)


def build_portfolio() -> None:
    b = Portfolio(OUTPUT)
    pages = [
        draw_page_1, draw_page_2, draw_page_3, draw_page_4, draw_page_5, draw_page_6, draw_page_7,
        draw_page_8, draw_page_9, draw_page_10, draw_page_11, draw_page_12, draw_page_13, draw_page_14,
        draw_page_15, draw_page_16, draw_page_17, draw_page_18, draw_page_19, draw_page_20, draw_page_21,
        draw_page_22, draw_page_23, draw_page_24, draw_page_25, draw_page_26, draw_page_27, draw_page_28,
        draw_page_29, draw_page_30, draw_page_31, draw_page_32, draw_page_33, draw_page_34,
    ]
    for draw in pages:
        draw(b)
    if b.page != 34:
        raise RuntimeError(f"Expected 34 pages, got {b.page}")
    b.finish()


def build_spec() -> None:
    b = Portfolio(SPEC_OUTPUT)
    b.new(BG)
    b.title("PORTFOLIO V4 / DESIGN SYSTEM", gx(0), PAGE_H - M + 6, gw(9), 24, NAVY)
    b.para("冷色调、清晰明快、图文比例稳定。适用于 A4 横版作品集及网页视觉延展。", gx(0), 430, gw(7), 11, 18, TEXT)
    palette = [("BACKGROUND", BG, "#F5F7FA"), ("PRIMARY", NAVY, "#1E3A5F"), ("SECONDARY", MIST, "#5B7B9A"), ("TEXT", TEXT, "#2C3E4F"), ("NOTE", NOTE, "#6F8FA5")]
    for i, (label, color, value) in enumerate(palette):
        x = gx(i * 2)
        b.c.setFillColor(color)
        b.c.rect(x, 246, gw(2), 82, fill=1, stroke=0)
        b.label(label, x, 226, NAVY if color != NAVY else MIST, 7)
        b.c.setFillColor(TEXT)
        b.c.setFont(EN_MED, 8)
        b.c.drawString(x, 210, value)
    b.title("12-COLUMN GRID", gx(0), 164, gw(4), 16, NAVY)
    for i in range(12):
        b.c.setFillColor(PALE if i % 2 == 0 else PALE_2)
        b.c.rect(gx(i), 78, COL, 58, fill=1, stroke=0)
    b.para("页边距 2.5 cm / 12 栏 / 栏间距 10 pt / 正文 11 pt / 注释 8 pt", gx(0), 60, gw(12), 8, 12, NOTE)
    b.new(BG)
    b.title("IMAGE & TYPE GUIDELINES", gx(0), PAGE_H - M + 6, gw(8), 24, NAVY)
    b.title("标题 24 pt", gx(0), 410, gw(4), 24, NAVY)
    b.para("副标题 16 pt / 正文 11 pt / 注释 8 pt", gx(0), 346, gw(5), 11, 18, TEXT)
    b.para("字体：Inter + Noto Sans SC。所有文字左对齐，标题页可居中。", gx(0), 292, gw(5), 11, 18, TEXT)
    b.card(gx(6), 166, gw(6), 260, WHITE, MIST)
    b.title("IMAGE TREATMENT", gx(6) + 18, 392, gw(6) - 36, 16, NAVY)
    b.para("RGB / 150 dpi / 提亮暗部 / 对比度 +7% / 饱和度 -34% / 蓝青色叠加 13%。禁止使用暖黄、棕褐作为页面主色。", gx(6) + 18, 344, gw(6) - 36, 11, 18, TEXT)
    b.para("交付：34 页可复制文字 PDF + 本设计规范 PDF。", gx(0), 126, gw(6), 11, 18, NAVY, True)
    b.finish()


def main() -> None:
    register_fonts()
    build_portfolio()
    build_spec()
    print(f"Created {OUTPUT}")
    print(f"Created {SPEC_OUTPUT}")


if __name__ == "__main__":
    main()
