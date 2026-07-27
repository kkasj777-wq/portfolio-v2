from __future__ import annotations

import csv
import hashlib
import html
from functools import lru_cache
from pathlib import Path

from PIL import Image, ImageOps
from reportlab.lib.colors import Color, HexColor
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas
from reportlab.platypus import Paragraph


ROOT = Path(__file__).resolve().parents[1]
SOURCE_F = Path(r"F:\作品集")
SOURCE_D = Path(r"D:\光影重庆 王陈鑫")
DELIVERY = SOURCE_F / "重庆故事" / "《通幽录》第一集项目交付包"
STILLS = ROOT / "tmp" / "pdfs" / "source-assets"
CLEAN = ROOT / "tmp" / "pdfs" / "v4-clean"
CURATED = ROOT / "assets" / "portfolio-v6"
CACHE = ROOT / "tmp" / "pdfs" / "optimized-assets-v6"
OUTPUT = ROOT / "output" / "pdf" / "Wang-Chenxin-Author-Director-Portfolio-2026-V6.pdf"
PORTRAIT = ROOT / "assets" / "portrait-owner.jpg"
POSITION_IMAGE = SOURCE_F / "摄影" / "0296ba1e27f6e9f78673bc20492eaae1 2.JPG"

PAGE_W, PAGE_H = A4
M = 42
GUTTER = 28

SERIF = "SourceHanSerif-Heavy"
SANS = "NotoSansSC"
SANS_MED = "NotoSansSC-Medium"
INTER = "Inter"
INTER_MED = "Inter-Medium"
INTER_SEMI = "Inter-SemiBold"

BLACK = HexColor("#050607")
INK = HexColor("#151617")
PAPER = HexColor("#F2EFE8")
PAPER_LIGHT = HexColor("#F8F6F1")
ASH = HexColor("#C8C7C1")
MIST = HexColor("#8D9091")
STONE = HexColor("#8E9797")
STONE_DARK = HexColor("#303839")
BEAM = HexColor("#DDEBF1")
TEAL = HexColor("#64AFB1")
TEAL_DARK = HexColor("#082C30")
ARCHIVE_RED = HexColor("#C5463E")
PINK = HexColor("#F29AB6")
BLUE = HexColor("#6878E9")
YELLOW = HexColor("#F5C95D")
CREAM = HexColor("#FFF0D5")
WHITE = HexColor("#FBFBF8")


def register_fonts() -> None:
    pdfmetrics.registerFont(TTFont(SERIF, r"C:\Windows\Fonts\Source Han Serif SC Heavy (TrueType).ttf"))
    pdfmetrics.registerFont(TTFont(SANS, r"C:\Windows\Fonts\NotoSansSC-VF.ttf"))
    pdfmetrics.registerFont(TTFont(SANS_MED, r"C:\Windows\Fonts\NotoSansSC-VF.ttf"))
    pdfmetrics.registerFont(TTFont(INTER, r"C:\Windows\Fonts\Inter-Regular.ttf"))
    pdfmetrics.registerFont(TTFont(INTER_MED, r"C:\Windows\Fonts\Inter-Medium.ttf"))
    pdfmetrics.registerFont(TTFont(INTER_SEMI, r"C:\Windows\Fonts\Inter-SemiBold.ttf"))


def checked(path: Path) -> Path:
    if not path.exists():
        raise FileNotFoundError(path)
    return path


def s(relative: str) -> Path:
    return checked(STILLS / relative)


def clean(name: str) -> Path:
    return checked(CLEAN / name)


def first(directory: Path, pattern: str) -> Path:
    matches = sorted(directory.glob(pattern))
    if not matches:
        raise FileNotFoundError(f"No file matched {directory / pattern}")
    return matches[0]


@lru_cache(maxsize=512)
def prepared(path_string: str) -> Path:
    source = Path(path_string)
    stat = source.stat()
    signature = f"{source.resolve()}|{stat.st_mtime_ns}|{stat.st_size}".encode("utf-8")
    target = CACHE / f"{hashlib.sha1(signature).hexdigest()[:24]}.jpg"
    if target.exists():
        return target
    CACHE.mkdir(parents=True, exist_ok=True)
    with Image.open(source) as raw:
        image = ImageOps.exif_transpose(raw).convert("RGB")
        image.thumbnail((3200, 3200), Image.Resampling.LANCZOS)
        image.save(target, "JPEG", quality=92, subsampling=0, optimize=True, progressive=True, dpi=(180, 180))
    return target


@lru_cache(maxsize=512)
def image_size(path_string: str) -> tuple[int, int]:
    with Image.open(path_string) as image:
        return image.size


def esc(text: str) -> str:
    return html.escape(text).replace("\n", "<br/>")


def alpha(color: Color, value: float) -> Color:
    return Color(color.red, color.green, color.blue, alpha=value)


class Book:
    def __init__(self, output: Path):
        output.parent.mkdir(parents=True, exist_ok=True)
        self.c = canvas.Canvas(
            str(output),
            pagesize=A4,
            pageCompression=1,
            initialFontName=INTER,
            initialFontSize=10,
            initialLeading=12,
        )
        self.c.setTitle("Wang Chenxin / Author-Director Visual Monograph / 2026")
        self.c.setAuthor("Wang Chenxin")
        self.c.setSubject("Directing / Screenwriting / AI Film / Visual Monograph")
        self.page = 0
        self.section = "PRELUDE"

    def new(self, bg: Color = PAPER, section: str = "", footer: bool = False) -> None:
        if self.page:
            self.c.showPage()
        self.page += 1
        self.section = section
        self.c.setFillColor(bg)
        self.c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
        if footer:
            self.footer()

    def finish(self) -> None:
        self.c.showPage()
        self.c.save()

    def footer(self, color: Color = MIST) -> None:
        self.c.saveState()
        self.c.setFillColor(color)
        self.c.setFont(INTER_MED, 6.2)
        label = f"{self.section.upper()} / WANG CHENXIN"
        if self.page % 2 == 0:
            self.c.drawString(M, 22, f"{self.page:02d}   {label}")
        else:
            self.c.drawRightString(PAGE_W - M, 22, f"{label}   {self.page:02d}")
        self.c.restoreState()

    def para(
        self,
        text: str,
        x: float,
        top: float,
        width: float,
        size: float = 9.2,
        leading: float | None = None,
        color: Color = INK,
        font: str = SANS,
        align: int = TA_LEFT,
        max_height: float = 760,
    ) -> float:
        if font == SERIF:
            text = text.translate(
                str.maketrans({"，": "", "。": "", "；": "", "：": "", "？": "", "！": "", "《": "", "》": ""})
            )
        style = ParagraphStyle(
            "editorial",
            fontName=font,
            fontSize=size,
            leading=leading or size * 1.55,
            textColor=color,
            alignment=align,
            wordWrap="CJK",
            splitLongWords=True,
            allowWidows=0,
            allowOrphans=0,
        )
        paragraph = Paragraph(esc(text), style)
        _, height = paragraph.wrap(width, max_height)
        paragraph.drawOn(self.c, x, top - height)
        return height

    def title(self, text: str, x: float, top: float, width: float, size: float = 30, color: Color = INK) -> float:
        # The selected display face is intentionally compact and omits CJK punctuation.
        # Keep titles typographic and let line breaks carry the pause.
        normalized = text.translate(str.maketrans({"，": "", "。": "", "；": "/", "：": ":", "？": "?", "！": "!"}))
        return self.para(normalized, x, top, width, size, size * 1.12, color, SERIF)

    def caps(self, text: str, x: float, y: float, color: Color = INK, size: float = 6.4, tracking: float = 1.4) -> None:
        self.c.saveState()
        self.c.setFillColor(color)
        display_font = SANS_MED if any(ord(character) > 127 for character in text) else INTER_SEMI
        self.c.setFont(display_font, size)
        text_object = self.c.beginText(x, y)
        text_object.setCharSpace(tracking)
        text_object.textLine(text.upper())
        self.c.drawText(text_object)
        self.c.restoreState()

    def line(self, x1: float, y1: float, x2: float, y2: float, color: Color = INK, width: float = 0.45) -> None:
        self.c.setStrokeColor(color)
        self.c.setLineWidth(width)
        self.c.line(x1, y1, x2, y2)

    def image_cover(
        self,
        path: Path,
        x: float,
        y: float,
        width: float,
        height: float,
        anchor_x: float = 0.5,
        anchor_y: float = 0.5,
        dim: float = 0,
    ) -> None:
        target = prepared(str(path))
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
        if dim:
            self.c.setFillColor(Color(0, 0, 0, alpha=dim))
            self.c.rect(x, y, width, height, fill=1, stroke=0)
        self.c.restoreState()

    def image_contain(self, path: Path, x: float, y: float, width: float, height: float, bg: Color = WHITE) -> None:
        target = prepared(str(path))
        iw, ih = image_size(str(target))
        scale = min(width / iw, height / ih)
        dw, dh = iw * scale, ih * scale
        self.c.setFillColor(bg)
        self.c.rect(x, y, width, height, fill=1, stroke=0)
        self.c.drawImage(str(target), x + (width - dw) / 2, y + (height - dh) / 2, width=dw, height=dh, mask="auto")

    def full_bleed(self, path: Path, dim: float = 0, anchor_x: float = 0.5, anchor_y: float = 0.5) -> None:
        self.image_cover(path, 0, 0, PAGE_W, PAGE_H, anchor_x, anchor_y, dim)

    def spread_half(
        self,
        path: Path,
        side: str,
        dim: float = 0,
        anchor_x: float = 0.5,
        anchor_y: float = 0.5,
    ) -> None:
        target = prepared(str(path))
        iw, ih = image_size(str(target))
        spread_w = PAGE_W * 2
        scale = max(spread_w / iw, PAGE_H / ih)
        dw, dh = iw * scale, ih * scale
        global_x = -(dw - spread_w) * anchor_x
        global_y = -(dh - PAGE_H) * anchor_y
        local_x = global_x if side == "left" else global_x - PAGE_W
        self.c.saveState()
        clip = self.c.beginPath()
        clip.rect(0, 0, PAGE_W, PAGE_H)
        self.c.clipPath(clip, stroke=0, fill=0)
        self.c.drawImage(str(target), local_x, global_y, width=dw, height=dh, mask="auto")
        if dim:
            self.c.setFillColor(Color(0, 0, 0, alpha=dim))
            self.c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
        self.c.restoreState()

    def bottom_fade(self, height: float = 300, strength: float = 0.7) -> None:
        self.c.saveState()
        steps = 24
        for index in range(steps):
            opacity = strength * (1 - index / steps) ** 1.5
            self.c.setFillColor(Color(0, 0, 0, alpha=opacity))
            self.c.rect(0, index * height / steps, PAGE_W, height / steps + 1, fill=1, stroke=0)
        self.c.restoreState()

    def top_fade(self, height: float = 220, strength: float = 0.55) -> None:
        self.c.saveState()
        steps = 18
        for index in range(steps):
            opacity = strength * (1 - index / steps) ** 1.5
            self.c.setFillColor(Color(0, 0, 0, alpha=opacity))
            self.c.rect(0, PAGE_H - (index + 1) * height / steps, PAGE_W, height / steps + 1, fill=1, stroke=0)
        self.c.restoreState()

    def beam(self, start: tuple[float, float], end_y: float, width: float = 210) -> None:
        sx, sy = start
        self.c.saveState()
        for index, opacity in enumerate((0.025, 0.04, 0.06, 0.09, 0.13)):
            extra = index * 24
            path = self.c.beginPath()
            path.moveTo(sx - 7 - index * 2, sy)
            path.lineTo(sx + 7 + index * 2, sy)
            path.lineTo(sx + width + extra, end_y)
            path.lineTo(sx - width - extra, end_y)
            path.close()
            self.c.setFillColor(Color(BEAM.red, BEAM.green, BEAM.blue, alpha=opacity))
            self.c.drawPath(path, fill=1, stroke=0)
        self.c.restoreState()


def tag(book: Book, text: str, x: float, y: float, color: Color = WHITE) -> None:
    book.c.setFillColor(alpha(BLACK, 0.72))
    width = max(74, pdfmetrics.stringWidth(text.upper(), INTER_SEMI, 6.2) + 22)
    book.c.rect(x, y, width, 22, fill=1, stroke=0)
    book.caps(text, x + 10, y + 8, color, 6.2, 0.9)


def draw_cover(book: Book) -> None:
    book.new(BLACK, "COVER")
    book.full_bleed(CURATED / "shou_202s.jpg", dim=0.04, anchor_x=0.53, anchor_y=0.5)
    book.bottom_fade(410, 0.88)
    book.top_fade(120, 0.36)
    book.caps("AUTHOR-DIRECTOR / SCREENWRITER / AI FILM", M, PAGE_H - 54, WHITE, 6.4, 1.8)
    book.para("WANG", M - 3, 224, 520, 52, 54, WHITE, INTER_SEMI)
    book.para("CHENXIN", M - 3, 170, 520, 52, 54, WHITE, INTER_SEMI)
    book.line(M, 92, PAGE_W - M, 92, alpha(WHITE, 0.55), 0.6)
    book.para("王陈鑫", M, 76, 160, 14, 18, WHITE, SERIF)
    book.caps("DIRECTING FROM MOTIVE TO IMAGE / 2026", PAGE_W - 310, 57, ASH, 6.2, 1.3)


def draw_colophon(book: Book) -> None:
    book.new(PAPER_LIGHT, "POSITION", footer=True)
    book.caps("00 / POSITION", M, PAGE_H - 54, STONE_DARK, 6.2, 1.6)
    book.title("作者不在镜头之外。", M, PAGE_H - 128, 430, 36, INK)
    book.para(
        "我先决定人物为什么行动，再决定镜头如何移动。剧本、分镜、镜头设计、AI 影像与剪辑，都是同一个导演判断在不同制作阶段的延伸。",
        M,
        PAGE_H - 224,
        300,
        10.2,
        17,
        STONE_DARK,
    )
    book.image_cover(checked(POSITION_IMAGE), 390, 420, 158, 222, anchor_x=0.68, anchor_y=0.58, dim=0.02)
    book.caps("OBSERVATION / OWNER PHOTOGRAPH", 390, 402, MIST, 5.8, 1.0)
    book.line(M, 310, PAGE_W - M, 310, STONE, 0.55)
    book.caps("SELECTED FOCUS", M, 276, STONE_DARK, 6.1, 1.3)
    book.para("DIRECTING", M, 236, 150, 16, 20, INK, INTER_SEMI)
    book.para("SCREENWRITING", 220, 236, 180, 16, 20, INK, INTER_SEMI)
    book.para("WORLD BUILDING", M, 188, 220, 16, 20, INK, INTER_SEMI)
    book.para("VISUAL THINKING", 270, 188, 220, 16, 20, INK, INTER_SEMI)
    book.para("A DIRECTOR'S VISUAL MONOGRAPH", M, 96, 300, 8.4, 12, MIST, INTER_MED)


def draw_prelude(book: Book) -> None:
    book.new(BLACK, "MANIFESTO")
    book.caps("01 / A DIRECTOR'S METHOD", M, PAGE_H - 52, ASH, 6.2, 1.5)
    book.para("先问人物，\n再问镜头。", M, PAGE_H - 132, 420, 49, 55, WHITE, SERIF)
    book.image_cover(s("tongyoulu/ep06.jpg"), PAGE_W - 182, 92, 182, 474, anchor_x=0.48, dim=0.2)
    book.para(
        "命题 / 人物 / 结构 / 镜头 / 系统 / 剪辑",
        M,
        332,
        270,
        9.2,
        15,
        BEAM,
        SANS_MED,
    )
    book.line(M, 262, 290, 262, alpha(BEAM, 0.55), 0.55)
    book.para("如果一个镜头不能回答人物为什么行动，它就还没有准备好。", M, 236, 274, 14, 21, WHITE, SERIF)
    book.caps("THE FRAME IS A DECISION, NOT A DECORATION", M, 66, MIST, 5.9, 1.1)

    book.new(PAPER_LIGHT, "SELECTED WORKS", footer=True)
    book.caps("SELECTED FILMS / 2024-2026", M, PAGE_H - 52, STONE_DARK, 6.2, 1.5)
    book.title("四部作品，\n四种导演判断。", M, PAGE_H - 108, 340, 31, INK)
    works = [
        ("01", "崖佛不语，岁岁佑我", "石刻 / 时间 / 记忆"),
        ("02", "手电", "黑暗 / 光束 / 关系"),
        ("03", "通幽录·渝州篇", "世界规则 / 资产 / 连续生产"),
        ("04", "麦麦的魔法面包店", "单元机制 / 色彩 / 选择"),
    ]
    y = 554
    for no, title, idea in works:
        book.caps(no, M, y + 12, STONE, 6.4, 1.1)
        book.para(title, 84, y + 24, 270, 14.5, 20, INK, SERIF)
        book.para(idea, 84, y - 2, 270, 7.5, 11, MIST, SANS)
        book.line(84, y - 20, 350, y - 20, alpha(STONE, 0.5), 0.4)
        y -= 88
    book.image_cover(s("yafobuyu/frame_01.jpg"), 382, 420, 166, 300, anchor_x=0.62, dim=0.04)
    book.image_cover(s("tongyoulu/ep05.jpg"), 382, 212, 166, 190, anchor_x=0.52, dim=0.08)
    book.image_cover(s("maimai/ep08.jpg"), 382, 56, 166, 138, anchor_x=0.5, dim=0.01)


def draw_yafobuyu(book: Book) -> None:
    accent = HexColor("#C8BBA5")
    hero = CURATED / "yafo_172s.jpg"

    book.new(BLACK, "YAF0 / OPENING")
    book.spread_half(hero, "left", dim=0.12, anchor_x=0.5, anchor_y=0.5)
    book.top_fade(170, 0.42)
    book.bottom_fade(300, 0.68)
    book.caps("DIRECTING / 01 / MEMORY", M, PAGE_H - 54, accent, 6.2, 1.5)
    book.para("崖佛", M - 5, 220, 420, 67, 68, WHITE, SERIF)
    book.caps("STONE / TIME / MEMORY", M, 76, accent, 6.1, 1.3)

    book.new(BLACK, "YAF0 / OPENING")
    book.spread_half(hero, "right", dim=0.08, anchor_x=0.5, anchor_y=0.5)
    book.top_fade(150, 0.42)
    book.bottom_fade(290, 0.72)
    book.caps("A FILM BY WANG CHENXIN", M, PAGE_H - 54, accent, 6.2, 1.4)
    book.title("不语，\n岁岁佑我", M, 212, 420, 43, WHITE)
    book.para("约 05'00\" / DIRECTOR / SCREENWRITER / EDITOR", M, 96, 430, 7.8, 12, accent, INTER_MED)

    book.new(PAPER, "YAF0 / DIRECTOR'S NOTE", footer=True)
    book.caps("DIRECTOR'S NOTE / MEMORY AS SPACE", M, PAGE_H - 52, STONE_DARK, 6.1, 1.5)
    book.title("石刻不是背景，\n而是人物记忆的空间。", M, PAGE_H - 112, 320, 28, INK)
    book.para(
        "作品在童年与成年之间建立回声。苹果、金毛、祈愿动作与崖佛共同保存一段没有被说尽的亲情。人物先被空间包围，再慢慢靠近；宏观石刻、雨雾湿度与佛堂微暖的光，共同决定情感尺度。",
        M,
        578,
        176,
        9.2,
        16,
        STONE_DARK,
    )
    book.caps("DIRECTOR'S QUESTION", M, 342, STONE, 5.8, 1.1)
    book.para("为什么不用对白解释关系？", M, 314, 170, 13.5, 19, INK, SERIF)
    book.image_cover(CURATED / "yafo-hq_02_00m39s.jpg", 248, 116, 347, 584, anchor_x=0.48, dim=0.03)
    book.caps("DISTANCE BEFORE RECOGNITION", 248, 94, STONE_DARK, 5.7, 1.0)

    book.new(BLACK, "YAF0 / STILL")
    book.full_bleed(CURATED / "yafo_116s.jpg", dim=0.05, anchor_x=0.54, anchor_y=0.5)
    book.top_fade(130, 0.3)
    tag(book, "FULL-BLEED STILL / RITUAL", M, PAGE_H - 68, accent)
    book.para("让仪式先发生，\n让解释晚一点到来。", M, 124, 340, 16, 23, WHITE, SERIF)

    book.new(PAPER_LIGHT, "YAF0 / MOTIFS", footer=True)
    book.caps("MOTIF STUDY / NOT A MOODBOARD", M, PAGE_H - 52, STONE_DARK, 6.1, 1.4)
    book.image_cover(CURATED / "yafo_104s.jpg", 0, 425, 385, 332, anchor_x=0.62, dim=0.02)
    book.image_cover(CURATED / "yafo_112s.jpg", 334, 188, 261, 360, anchor_x=0.5, dim=0.02)
    book.image_cover(CURATED / "yafo_163s.jpg", 46, 80, 246, 244, anchor_x=0.42, dim=0.02)
    book.caps("STONE", 404, 705, STONE_DARK, 6.1, 1.5)
    book.para("空间尺度", 404, 680, 150, 12, 17, INK, SERIF)
    book.caps("RITUAL", 46, 366, STONE_DARK, 6.1, 1.5)
    book.para("动作代替说明", 46, 342, 210, 12, 17, INK, SERIF)
    book.caps("OBJECT", 334, 162, STONE_DARK, 6.1, 1.5)
    book.para("物件承接记忆", 334, 138, 220, 12, 17, INK, SERIF)

    book.new(BLACK, "YAF0 / RETURN")
    book.full_bleed(CURATED / "yafo_142s.jpg", dim=0.14, anchor_x=0.56, anchor_y=0.52)
    book.bottom_fade(350, 0.74)
    book.caps("FINAL MOVEMENT / RETURN", M, 170, accent, 6.2, 1.5)
    book.title("守护不是答案，\n是被时间重新看见。", M, 142, 465, 29, WHITE)
    book.para("CHILDHOOD / ADULT / RETURN", M, 52, 340, 6.6, 10, accent, INTER_MED)


def draw_shoudian(book: Book) -> None:
    book.new(BLACK, "SHOU DIAN / LIGHT")
    book.beam((430, PAGE_H - 40), -60, 145)
    book.caps("DIRECTING / 02 / SHOU DIAN", M, PAGE_H - 54, BEAM, 6.2, 1.5)
    book.para("LET", M - 4, 528, 420, 61, 62, WHITE, INTER_SEMI)
    book.para("LIGHT", M - 4, 466, 520, 61, 62, WHITE, INTER_SEMI)
    book.para("SPEAK.", M - 4, 404, 520, 61, 62, WHITE, INTER_SEMI)
    book.line(M, 292, 314, 292, alpha(BEAM, 0.45), 0.55)
    book.title("不用对白解释父子关系。", M, 262, 350, 20, BEAM)
    book.caps("OBJECT / BEAM / RELATION", M, 70, MIST, 6.1, 1.2)

    book.new(BLACK, "SHOU DIAN / LIGHT")
    book.full_bleed(CURATED / "shou_000s.jpg", dim=0.08, anchor_x=0.56, anchor_y=0.5)
    book.top_fade(150, 0.4)
    book.bottom_fade(250, 0.58)
    book.caps("05'10\" / COMPLETE FILM", M, PAGE_H - 54, BEAM, 6.1, 1.4)
    book.title("一束窄光，\n把观看变成行动。", M, 150, 390, 31, WHITE)

    book.new(BLACK, "SHOU DIAN / SEQUENCE", footer=True)
    book.caps("DISCOVERY / REPAIR / RESPONSE", M, PAGE_H - 50, BEAM, 6.2, 1.4)
    book.image_cover(CURATED / "shou_176s.jpg", 0, 510, 390, 242, anchor_x=0.52, dim=0.08)
    book.image_cover(CURATED / "shou_196s.jpg", 248, 286, 347, 290, anchor_x=0.52, dim=0.07)
    book.image_cover(CURATED / "shou_210s.jpg", 0, 64, 326, 296, anchor_x=0.48, dim=0.08)
    book.caps("01 / OLD OBJECT", 410, 690, MIST, 5.8, 1.0)
    book.para("先让物件出现，\n关系随后进入。", 410, 666, 145, 11.5, 17, WHITE, SERIF)
    book.caps("02 / REPAIR", 56, 446, MIST, 5.8, 1.0)
    book.caps("03 / MEMORY", 350, 252, MIST, 5.8, 1.0)
    book.para("光束规定观众看见什么；动作先于解释。", 350, 224, 198, 10, 16, BEAM, SANS_MED)

    book.new(BLACK, "SHOU DIAN / RETURN")
    book.full_bleed(CURATED / "shou_220s.jpg", dim=0.12, anchor_x=0.42, anchor_y=0.5)
    book.bottom_fade(310, 0.72)
    book.caps("THE OBJECT RETURNS", M, 152, BEAM, 6.2, 1.5)
    book.title("当光照回彼此，\n关系才真正出现。", M, 124, 430, 28, WHITE)
    book.para("A FILM ABOUT WHAT IS NOT SAID", M, 48, 400, 6.4, 10, MIST, INTER_MED)


def draw_tongyoulu(book: Book) -> None:
    hero = s("tongyoulu/cover.jpg")
    episodes = [
        ("01", "浮生无迹 · 归乡逢幽", s("tongyoulu/ep01.jpg")),
        ("02", "渝州巷年", s("tongyoulu/ep02.jpg")),
        ("03", "江畔古楼", s("tongyoulu/ep03.jpg")),
        ("04", "黄桷渡 · 燃茶案", s("tongyoulu/ep04.jpg")),
        ("05", "傀灵寄忆", s("tongyoulu/ep05.jpg")),
        ("06", "黄桷渡 · 忌渡", s("tongyoulu/ep06.jpg")),
        ("07", "南山旧约", s("tongyoulu/ep07.jpg")),
    ]
    storyboard_dir = DELIVERY / "4分镜头脚本" / "4.2图示分镜头" / "回家分镜"
    character_dir = DELIVERY / "5数字资产库" / "5.1角色"
    scene_dir = DELIVERY / "5数字资产库" / "5.2场景"
    prop_dir = DELIVERY / "5数字资产库" / "5.3道具"
    csv_path = DELIVERY / "6全套提示词" / "通幽录第一集_可灵AI视频指令表_176镜头.csv"

    book.new(BLACK, "TONGYOULU / OPENING")
    book.spread_half(hero, "left", dim=0.1, anchor_x=0.5, anchor_y=0.5)
    book.top_fade(150, 0.4)
    book.bottom_fade(330, 0.72)
    book.caps("WORLD BUILDING ARCHIVE / 03", M, PAGE_H - 54, TEAL, 6.2, 1.5)
    book.para("通幽录", M - 4, 190, 490, 52, 56, WHITE, SERIF)
    book.caps("YUZHOU CHAPTER", M, 84, TEAL, 6.3, 1.6)

    book.new(BLACK, "TONGYOULU / OPENING")
    book.spread_half(hero, "right", dim=0.08, anchor_x=0.5, anchor_y=0.5)
    book.top_fade(150, 0.4)
    book.bottom_fade(350, 0.76)
    book.caps("AI DIRECTOR / CONTINUOUS PRODUCTION", M, PAGE_H - 54, TEAL, 6.2, 1.4)
    book.title("世界规则先于奇观。", M, 202, 430, 32, WHITE)
    book.para("7 集 / 60+ 分钟 / 首集 176 条镜头指令", M, 118, 450, 10, 15, TEAL, SANS_MED)
    book.caps("STORY / SHOT / ASSET / GENERATION / CUT", M, 58, ASH, 5.9, 1.05)

    book.new(PAPER_LIGHT, "TONGYOULU / EPISODE INDEX", footer=True)
    book.caps("SEVEN EPISODES / ONE STORY UNIVERSE", M, PAGE_H - 52, TEAL_DARK, 6.2, 1.35)
    book.image_cover(episodes[0][2], 0, 470, PAGE_W, 280, anchor_x=0.52, dim=0.08)
    book.title("七个单元，\n一套连续世界。", M, 438, 340, 26, INK)
    columns = [(M, 324), (310, 324)]
    for index, (no, title, _) in enumerate(episodes):
        column = 0 if index < 4 else 1
        row = index if index < 4 else index - 4
        x, start_y = columns[column]
        y = start_y - row * 68
        book.caps(no, x, y + 12, TEAL_DARK, 6.2, 1.1)
        book.para(title, x + 44, y + 22, 215, 11.5, 16, INK, SERIF)
        book.line(x + 44, y - 5, x + 250, y - 5, alpha(STONE, 0.52), 0.4)
    book.para(
        "单元故事完成愿望，连续线索逐层逼近林砚被抹去的真相。",
        M,
        76,
        485,
        8.3,
        13,
        MIST,
    )

    book.new(PAPER, "TONGYOULU / STORYBOARD", footer=True)
    book.caps("PRODUCTION ARCHIVE / STORYBOARD", M, PAGE_H - 52, ARCHIVE_RED, 6.2, 1.35)
    book.title("镜头不是生成之后\n才决定的。", M, PAGE_H - 108, 330, 27, INK)
    book.para(
        "图示分镜先固定人物站位、空间尺度与动作方向，再进入影像生成和迭代。",
        362,
        PAGE_H - 110,
        188,
        8.7,
        14,
        STONE_DARK,
    )
    book.image_contain(checked(storyboard_dir / "到家1.png"), 30, 278, 535, 360, PAPER)
    book.image_contain(checked(storyboard_dir / "回忆1.png"), 180, 66, 385, 188, PAPER)
    book.caps("BLOCKING", M, 248, ARCHIVE_RED, 5.9, 1.2)
    book.para("站位", M, 226, 100, 10.5, 15, INK, SERIF)
    book.caps("SCALE", M, 180, ARCHIVE_RED, 5.9, 1.2)
    book.para("尺度", M, 158, 100, 10.5, 15, INK, SERIF)
    book.caps("DIRECTION", M, 112, ARCHIVE_RED, 5.9, 1.2)
    book.para("动作方向", M, 90, 100, 10.5, 15, INK, SERIF)

    book.new(TEAL_DARK, "TONGYOULU / ASSET SYSTEM", footer=True)
    book.caps("DIGITAL ASSET SYSTEM / CONTINUITY", M, PAGE_H - 52, TEAL, 6.2, 1.35)
    book.title("连续性来自资产系统，\n不是来自运气。", M, PAGE_H - 108, 470, 27, WHITE)
    book.image_contain(checked(character_dir / "林砚.png"), 26, 70, 190, 520, TEAL_DARK)
    book.image_cover(checked(scene_dir / "老家房屋.png"), 226, 352, 369, 238, anchor_x=0.55, dim=0.04)
    book.image_contain(checked(prop_dir / "高调版本通幽录.png"), 348, 64, 247, 254, TEAL_DARK)
    # Keep the archive labels fully opaque so source-platform marks never
    # remain visible beneath them in the final PDF.
    book.c.setFillColor(BLACK)
    book.c.rect(494, 352, 101, 28, fill=1, stroke=0)
    book.c.rect(458, 64, 137, 28, fill=1, stroke=0)
    book.caps("SCENE ASSET", 506, 362, TEAL, 5.7, 0.8)
    book.caps("PROP ASSET", 472, 74, TEAL, 5.7, 0.8)
    book.caps("CHARACTER", 28, 48, TEAL, 5.9, 1.2)
    book.caps("SCENE", 226, 330, TEAL, 5.9, 1.2)
    book.caps("PROP", 348, 42, TEAL, 5.9, 1.2)
    book.para("角色、场景和关键道具在多镜头、多集之间被重复调用，维持识别与空间关系。", 236, 300, 265, 8.5, 14, ASH)

    with csv_path.open("r", encoding="utf-8-sig", newline="") as handle:
        rows = list(csv.DictReader(handle))
    sample_indexes = [0, min(42, len(rows) - 1), min(101, len(rows) - 1), len(rows) - 1]
    samples = [rows[index] for index in sample_indexes]

    book.new(BLACK, "TONGYOULU / SHOT DIRECTIONS", footer=True)
    book.caps("VERIFIED PRODUCTION FILE / EP01", M, PAGE_H - 52, TEAL, 6.2, 1.35)
    book.para("176", M - 8, PAGE_H - 92, 420, 88, 88, TEAL, INTER_SEMI)
    book.caps("SHOT DIRECTIONS", M + 7, 628, ASH, 6.4, 1.8)
    book.para("景别 / 机位 / 动作 / 站位 / 光影 / 声音 / 资产", M, 590, 470, 11.2, 17, WHITE, SANS_MED)
    y = 520
    for row in samples:
        no = (row.get("镜号") or "").strip()
        scene = (row.get("场号") or "").strip()
        shot = (row.get("景别") or "").strip()
        move = (row.get("运镜方式") or "").strip()
        action = (row.get("动作顺序") or "").strip().replace("\n", " ")
        if len(action) > 68:
            action = action[:68] + "..."
        book.caps(f"SHOT {no} / {shot} / {move}", M, y, TEAL, 5.8, 0.8)
        book.para(scene, 268, y + 10, 282, 7.2, 11, ASH, SANS_MED)
        book.para(action, M, y - 18, 506, 7.5, 11.5, WHITE)
        book.line(M, y - 60, PAGE_W - M, y - 60, alpha(TEAL, 0.32), 0.35)
        y -= 102
    book.caps("SOURCE / 通幽录第一集_可灵AI视频指令表_176镜头.csv", M, 44, MIST, 5.3, 0.5)

    book.new(BLACK, "TONGYOULU / SERIES PROOF")
    book.image_cover(episodes[2][2], 0, 532, PAGE_W, 310, anchor_x=0.48, dim=0.08)
    book.image_cover(episodes[3][2], 0, 250, PAGE_W, 282, anchor_x=0.53, dim=0.11)
    book.image_cover(episodes[6][2], 0, 0, PAGE_W, 250, anchor_x=0.58, dim=0.14)
    book.c.setFillColor(alpha(BLACK, 0.34))
    book.c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    book.caps("SERIES PROOF / 7 EPISODES", M, PAGE_H - 54, TEAL, 6.2, 1.5)
    book.title("7 集不是数量，\n而是连续性被证明。", M, 154, 470, 31, WHITE)
    book.para("60+ MINUTES / AI DIRECTOR / WORLD BUILDING", M, 54, 450, 6.5, 10, ASH, INTER_MED)


def draw_maimai(book: Book) -> None:
    hero = CURATED / "m9_11_102.3s.jpg"
    asset_dir = SOURCE_F / "麦麦的面包店" / "麦麦的面包店" / "资产"
    iteration_a = first(asset_dir, "*4172*.png")
    iteration_b = first(asset_dir, "*4485*.png")

    book.new(BLUE, "MAIMAI / OPENING")
    book.spread_half(hero, "left", dim=0.01, anchor_x=0.5, anchor_y=0.5)
    book.c.setFillColor(alpha(BLUE, 0.16))
    book.c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    book.top_fade(120, 0.24)
    book.bottom_fade(300, 0.48)
    book.caps("DIRECTING / 04 / COLOR EXPLOSION", M, PAGE_H - 54, WHITE, 6.2, 1.4)
    book.para("麦麦的", M - 3, 184, 500, 48, 51, WHITE, SERIF)
    book.caps("MAGIC / CHOICE / CONSEQUENCE", M, 72, CREAM, 6.1, 1.2)

    book.new(PINK, "MAIMAI / OPENING")
    book.spread_half(hero, "right", dim=0.01, anchor_x=0.5, anchor_y=0.5)
    book.c.setFillColor(alpha(PINK, 0.13))
    book.c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    book.top_fade(120, 0.24)
    book.bottom_fade(315, 0.52)
    book.caps("15 EPISODES / 30+ MINUTES", M, PAGE_H - 54, WHITE, 6.2, 1.4)
    book.title("魔法面包店", M, 174, 470, 39, WHITE)
    book.para("一个面包，一次选择。", M, 112, 400, 13.5, 19, CREAM, SERIF)
    book.caps("A SERIAL WORLD FOR CHILDREN", M, 58, WHITE, 5.9, 1.2)

    book.new(CREAM, "MAIMAI / EPISODE MECHANISM", footer=True)
    book.caps("EPISODE MECHANISM / VISUAL VARIATION", M, PAGE_H - 52, BLUE, 6.2, 1.35)
    book.title("重复的是单元机制，\n不是每一集的视觉答案。", M, PAGE_H - 108, 450, 26, INK)
    book.image_cover(s("maimai/ep01.jpg"), 0, 362, 382, 316, anchor_x=0.48, anchor_y=0.45, dim=0)
    book.image_cover(s("maimai/ep02.jpg"), 355, 472, 240, 206, anchor_x=0.55, anchor_y=0.4, dim=0)
    book.image_cover(s("maimai/ep06.jpg"), 268, 146, 327, 300, anchor_x=0.5, anchor_y=0.36, dim=0)
    book.image_cover(s("maimai/ep11.jpg"), 0, 72, 238, 224, anchor_x=0.52, anchor_y=0.36, dim=0)
    book.caps("QUESTION", M, 330, BLUE, 5.9, 1.2)
    book.caps("MAGIC", 146, 330, PINK, 5.9, 1.2)
    book.caps("CHOICE", 220, 330, HexColor("#B38116"), 5.9, 1.2)
    book.para(
        "共同的店铺与角色建立安全感；能力、场景和冲突为每集保留独立命题。",
        M,
        318,
        205,
        8.4,
        13.5,
        STONE_DARK,
    )

    book.new(BLUE, "MAIMAI / ITERATION", footer=True)
    book.caps("ITERATION / SPACE AS STORY", M, PAGE_H - 52, YELLOW, 6.2, 1.35)
    book.title("场景修改，\n让差异变得可见。", M, PAGE_H - 108, 380, 27, WHITE)
    half = PAGE_W / 2
    book.image_cover(iteration_a, 0, 72, half + 20, 570, anchor_x=0.5, anchor_y=0.5, dim=0.02)
    book.image_cover(iteration_b, half - 20, 72, half + 20, 570, anchor_x=0.5, anchor_y=0.5, dim=0.02)
    book.c.setStrokeColor(YELLOW)
    book.c.setLineWidth(1.0)
    book.c.line(half, 72, half, 642)
    tag(book, "VERSION A", 30, 92, YELLOW)
    tag(book, "VERSION B / LONGER BREAK", half + 18, 92, YELLOW)
    book.para("改变空间障碍的长度，等于改变角色需要付出的行动代价。", M, 46, 500, 8.1, 12.5, CREAM, SANS_MED)

    book.new(BLACK, "MAIMAI / CLOSING")
    book.full_bleed(CURATED / "m15_12_092.7s.jpg", dim=0.08, anchor_x=0.54, anchor_y=0.5)
    book.top_fade(130, 0.34)
    book.bottom_fade(340, 0.72)
    book.caps("EPISODE 15 / FINAL CHOICE", M, PAGE_H - 54, YELLOW, 6.2, 1.5)
    book.title("每一个魔法，\n都要回到一次选择。", M, 140, 445, 30, WHITE)
    book.para("15 EPISODES / COMPLETE SOURCE ARCHIVE", M, 48, 450, 6.3, 10, CREAM, INTER_MED)


def draw_screenwriting(book: Book) -> None:
    book.new(PAPER_LIGHT, "SCREENWRITING / ORIGINAL WORKS", footer=True)
    book.caps("SCREENWRITING / 05 / ORIGINAL WORKS", M, PAGE_H - 52, ARCHIVE_RED, 6.2, 1.35)
    book.title("剧本不是对白的容器，\n而是选择与代价的设计。", M, PAGE_H - 108, 470, 28, INK)
    book.para(
        "五部原创剧本均保留完整项目文档。以下信息来自现有终稿文件，不以虚构奖项或平台数据替代作品本身。",
        M,
        655,
        390,
        8.4,
        13.5,
        STONE_DARK,
    )
    scripts = [
        ("01", "两块门牌", "12 集现实主义年代家庭剧 / 1974-2012 / 404 场"),
        ("02", "合味", "12 集年代现实题材 / 火锅店、辣椒供应与共同创制权"),
        ("03", "山城换挡", "12 集工业家庭剧 / 1978-2026 / 每集 25-30 分钟"),
        ("04", "山那边的课表", "12 集现实主义年代家庭剧 / 1997-2026"),
        ("05", "江水记得", "三峡移民题材现实主义群像电影 / 1993-2023"),
    ]
    y = 574
    for no, title, meta in scripts:
        book.para(no, M - 3, y + 14, 70, 25, 27, alpha(ARCHIVE_RED, 0.34), INTER_SEMI)
        book.para(title, 108, y + 22, 190, 16, 21, INK, SERIF)
        book.para(meta, 310, y + 18, 235, 7.6, 12, STONE_DARK, SANS_MED)
        book.line(108, y - 10, PAGE_W - M, y - 10, alpha(STONE, 0.5), 0.4)
        y -= 91
    book.caps("FULL SCREENPLAYS / LOCAL SOURCE ARCHIVE", M, 50, MIST, 5.8, 1.0)


def draw_ai_process(book: Book) -> None:
    storyboard = DELIVERY / "4分镜头脚本" / "4.2图示分镜头" / "回家分镜" / "到家2.png"
    prop = DELIVERY / "5数字资产库" / "5.3道具" / "低调版本通幽录.png"
    book.new(TEAL_DARK, "AI FILM / DIRECTOR PROCESS", footer=True)
    book.caps("AI FILM / 06 / DIRECTOR PROCESS", M, PAGE_H - 52, TEAL, 6.2, 1.35)
    book.title("AI 是制作系统，\n不是创作者身份的替代品。", M, PAGE_H - 108, 485, 26, WHITE)
    book.image_contain(checked(storyboard), 28, 350, 342, 282, TEAL_DARK)
    book.image_cover(s("tongyoulu/ep02.jpg"), 286, 118, 309, 300, anchor_x=0.54, dim=0.05)
    book.image_contain(checked(prop), 42, 76, 200, 230, TEAL_DARK)
    book.c.setFillColor(alpha(BLACK, 0.86))
    book.c.rect(132, 76, 110, 28, fill=1, stroke=0)
    book.caps("PROP ASSET", 146, 86, TEAL, 5.7, 0.8)
    book.line(230, 353, 304, 394, ARCHIVE_RED, 0.8)
    book.line(224, 266, 296, 234, ARCHIVE_RED, 0.8)
    book.c.setFillColor(ARCHIVE_RED)
    book.c.circle(230, 353, 3, fill=1, stroke=0)
    book.c.circle(304, 394, 3, fill=1, stroke=0)
    book.c.circle(224, 266, 3, fill=1, stroke=0)
    book.c.circle(296, 234, 3, fill=1, stroke=0)
    book.caps("STORYBOARD", 28, 330, TEAL, 5.8, 1.1)
    book.caps("ASSET", 42, 54, TEAL, 5.8, 1.1)
    book.caps("FINAL FRAME", 286, 96, TEAL, 5.8, 1.1)
    book.para("导演负责人物动机、世界规则、镜头判断与最终取舍。工具改变生产方式，不改变责任归属。", 388, 610, 160, 8.3, 13.5, ASH)


def draw_experiment(book: Book) -> None:
    book.new(BLACK, "EXPERIMENT / FORM")
    book.full_bleed(CURATED / "jinyan_04.jpg", dim=0.06, anchor_x=0.5, anchor_y=0.5)
    book.top_fade(160, 0.45)
    book.bottom_fade(300, 0.7)
    book.caps("EXPERIMENT / 07 / FORM", M, PAGE_H - 54, HexColor("#B6A3C4"), 6.2, 1.5)
    book.title("实验影像不是逃逸，\n而是寻找新的叙事形式。", M, 144, 475, 28, WHITE)
    book.para("志怪 / 民俗 / 非遗 / 地域经验", M, 52, 430, 6.5, 10, ASH, INTER_MED)


def draw_practice(book: Book) -> None:
    book.new(PAPER, "FIELD / COMMERCIAL PRACTICE", footer=True)
    book.caps("FIELD PRACTICE / VERIFIED CREDITS", M, PAGE_H - 52, ARCHIVE_RED, 6.2, 1.35)
    book.title("真实协作，\n也要求清楚的署名边界。", M, PAGE_H - 108, 340, 27, INK)
    book.image_cover(CURATED / "field_00.jpg", 0, 324, 236, 300, anchor_x=0.82, anchor_y=0.5, dim=0.03)
    book.image_cover(CURATED / "field_05.jpg", 184, 82, 220, 286, anchor_x=0.86, anchor_y=0.5, dim=0.03)
    book.para("03'51\"", 258, 574, 290, 49, 52, ARCHIVE_RED, INTER_SEMI)
    book.caps("共青团伙伴计划纪录短片", 258, 500, STONE_DARK, 5.9, 0.9)
    book.para("王陈鑫：摄影、剪辑；摄影为共同署名。出品与策划为共青团重庆市綦江区委员会。", 258, 482, 290, 8.2, 13.5, STONE_DARK)
    book.line(432, 376, 432, 116, alpha(STONE, 0.6), 0.45)
    book.caps("BROADCAST", 456, 350, ARCHIVE_RED, 5.8, 1.0)
    book.para("奶茶滚烫", 456, 326, 98, 11.5, 16, INK, SERIF)
    book.para("导演助理 / 30+ 场次\n搜狐视频、乐视TV 播出", 456, 292, 104, 7.2, 11, STONE_DARK)
    book.caps("COMMERCIAL SHORT DRAMA", 456, 214, ARCHIVE_RED, 5.4, 0.55)
    book.para("猛龙下山", 456, 192, 98, 11.5, 16, INK, SERIF)
    book.para("艺人助理 / 红果商业短剧", 456, 158, 104, 7.2, 11, STONE_DARK)
    book.caps("CREDITS ARE PART OF THE WORK", M, 48, MIST, 5.7, 1.0)


def draw_photography(book: Book) -> None:
    photo = SOURCE_F / "摄影" / "ae625a15ddf91a9ecadb49a4a508c026.JPG"
    book.new(BLACK, "PHOTOGRAPHY / OBSERVATION")
    book.full_bleed(checked(photo), dim=0.13, anchor_x=0.55, anchor_y=0.49)
    book.top_fade(160, 0.42)
    book.bottom_fade(300, 0.76)
    book.caps("PHOTOGRAPHY / 08 / OBSERVATION", M, PAGE_H - 54, BEAM, 6.2, 1.5)
    book.title("摄影最终回到一个导演问题：\n观众先看见什么？", M, 142, 470, 27, WHITE)
    book.para("DISTANCE / WEATHER / HUMAN TRACE", M, 50, 430, 6.3, 10, ASH, INTER_MED)


def draw_profile(book: Book) -> None:
    book.new(PAPER_LIGHT, "PROFILE / AUTHOR", footer=True)
    book.caps("PROFILE / AUTHOR-DIRECTOR", M, PAGE_H - 52, STONE_DARK, 6.2, 1.4)
    book.image_cover(PORTRAIT, M, 478, 154, 218, anchor_x=0.5, anchor_y=0.47, dim=0.02)
    book.para("王陈鑫", 230, 668, 320, 38, 42, INK, SERIF)
    book.para("WANG CHENXIN", 232, 622, 300, 11, 15, STONE_DARK, INTER_SEMI)
    book.para("作者型导演 / 编剧 / AI 影像创作者", 232, 584, 310, 11.5, 17, INK, SANS_MED)
    book.line(M, 438, PAGE_W - M, 438, STONE, 0.55)
    book.title("导演身份，\n靠选择留下证据。", M, 396, 300, 24, INK)
    traces = [
        ("DIRECTING", "《崖佛不语，岁岁佑我》《手电》"),
        ("AI SERIES", "《通幽录·渝州篇》 / 7 集 / 60+ 分钟"),
        ("SERIAL", "《麦麦的魔法面包店》 / 15 集 / 30+ 分钟"),
        ("WRITING", "五部原创剧本完整终稿"),
        ("FIELD", "纪录片摄影与剪辑 / 商业剧组协作"),
    ]
    y = 270
    for label, detail in traces:
        book.caps(label, M, y, STONE_DARK, 5.8, 1.0)
        book.para(detail, 178, y + 10, 360, 9.2, 14, INK, SANS_MED)
        y -= 48
    book.caps("DIRECTING / SCREENWRITING / WORLD BUILDING", M, 48, MIST, 5.7, 0.95)


def draw_contact(book: Book) -> None:
    book.new(BLACK, "CONTACT")
    book.caps("CONTACT / 2026", M, PAGE_H - 54, BEAM, 6.2, 1.5)
    book.para("NEXT", M - 4, 630, 500, 56, 58, WHITE, INTER_SEMI)
    book.para("FRAME.", M - 4, 572, 500, 56, 58, WHITE, INTER_SEMI)
    book.title("下一镜，一起完成。", M, 466, 430, 24, BEAM)
    book.line(M, 392, PAGE_W - M, 392, alpha(BEAM, 0.42), 0.55)
    book.caps("EMAIL", M, 352, MIST, 5.9, 1.2)
    book.para("3146652776@qq.com", M, 326, 510, 18, 24, WHITE, INTER_MED)
    book.c.linkURL("mailto:3146652776@qq.com", (M, 302, PAGE_W - M, 344), relative=0)
    book.caps("PHONE", M, 258, MIST, 5.9, 1.2)
    book.para("13002860718", M, 232, 430, 20, 26, BEAM, INTER_MED)
    book.c.linkURL("tel:13002860718", (M, 208, 360, 250), relative=0)
    book.para("公开作品链接尚未提供。收到链接后，可在此页补充正式观看入口与二维码。", M, 128, 390, 8.2, 13, MIST)
    book.caps("WANG CHENXIN / AUTHOR-DIRECTOR", M, 48, ASH, 5.9, 1.1)


def draw_closing(book: Book) -> None:
    final_still = CURATED / "tyl1_09_06m06s.jpg"
    book.new(BLACK, "FINAL FRAME")
    book.full_bleed(checked(final_still), dim=0.13, anchor_x=0.52, anchor_y=0.5)
    book.top_fade(150, 0.4)
    book.bottom_fade(180, 0.48)
    book.caps("FINAL FRAME / 2026", M, PAGE_H - 54, ASH, 6.2, 1.5)
    book.para("WANG CHENXIN", M, 70, 350, 11, 14, WHITE, INTER_SEMI)
    book.para("王陈鑫", PAGE_W - 128, 70, 86, 10.5, 14, WHITE, SERIF, TA_CENTER)


def main() -> None:
    register_fonts()
    book = Book(OUTPUT)
    draw_cover(book)
    draw_colophon(book)
    draw_prelude(book)
    draw_yafobuyu(book)
    draw_shoudian(book)
    draw_tongyoulu(book)
    draw_maimai(book)
    draw_screenwriting(book)
    draw_ai_process(book)
    draw_experiment(book)
    draw_practice(book)
    draw_photography(book)
    draw_profile(book)
    draw_contact(book)
    draw_closing(book)
    if book.page != 34:
        raise RuntimeError(f"Expected 34 pages, got {book.page}")
    book.finish()
    print(f"Created {OUTPUT}")
    print(f"Pages: {book.page}")


if __name__ == "__main__":
    main()
