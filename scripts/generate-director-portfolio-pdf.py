from __future__ import annotations

import html
import hashlib
import math
from functools import lru_cache
from pathlib import Path

from PIL import Image, ImageOps
from reportlab.lib.colors import Color, HexColor
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas
from reportlab.platypus import Paragraph


ROOT = Path(__file__).resolve().parents[1]
SOURCE_F = Path(r"F:\作品集")
SOURCE_D = Path(r"D:\光影重庆 王陈鑫")
SOURCE_STILLS = ROOT / "tmp" / "pdfs" / "source-assets"
OPTIMIZED_ASSETS = ROOT / "tmp" / "pdfs" / "optimized-assets"
OUTPUT_DIR = ROOT / "output" / "pdf"
OUTPUT_PDF = OUTPUT_DIR / "Wang-Chenxin-Author-Director-Portfolio-2026-V2.pdf"

PAGE_W, PAGE_H = landscape(A4)
MARGIN = 42

FONT_CN = "Deng-Regular"
FONT_CN_BOLD = "Deng-Bold"
FONT_EN = "Arial"
FONT_EN_BOLD = "Arial-Bold"
FONT_EN_NARROW = "Arial-Narrow"

PALETTE = {
    "ink": HexColor("#070C12"),
    "paper": HexColor("#E7EAEC"),
    "muted": HexColor("#89939B"),
    "line": HexColor("#26333D"),
    "prelude": HexColor("#08131E"),
    "directing": HexColor("#0B1824"),
    "directing_accent": HexColor("#83A7BE"),
    "writing": HexColor("#24151F"),
    "writing_accent": HexColor("#B18796"),
    "ai": HexColor("#062A35"),
    "ai_accent": HexColor("#78AEB6"),
    "experiment": HexColor("#241936"),
    "experiment_accent": HexColor("#9C8EAE"),
    "photo": HexColor("#18222B"),
    "photo_accent": HexColor("#AAB5BE"),
    "field": HexColor("#241E1A"),
    "field_accent": HexColor("#B69579"),
}


def register_fonts() -> None:
    pdfmetrics.registerFont(TTFont(FONT_CN, r"C:\Windows\Fonts\Deng.ttf"))
    pdfmetrics.registerFont(TTFont(FONT_CN_BOLD, r"C:\Windows\Fonts\Dengb.ttf"))
    pdfmetrics.registerFont(TTFont(FONT_EN, r"C:\Windows\Fonts\arial.ttf"))
    pdfmetrics.registerFont(TTFont(FONT_EN_BOLD, r"C:\Windows\Fonts\arialbd.ttf"))
    pdfmetrics.registerFont(TTFont(FONT_EN_NARROW, r"C:\Windows\Fonts\ARIALN.TTF"))


def verified_path(root: Path, relative: str) -> Path:
    path = root / relative
    if not path.exists():
        raise FileNotFoundError(f"Missing verified source asset: {path}")
    return path


def source_f(relative: str) -> Path:
    return verified_path(SOURCE_F, relative)


def source_d(relative: str) -> Path:
    return verified_path(SOURCE_D, relative)


def still(relative: str) -> Path:
    return verified_path(SOURCE_STILLS, relative)


@lru_cache(maxsize=512)
def prepared_image(path_string: str) -> Path:
    """Create one print-sharp, upload-friendly JPEG cache for PDF embedding."""
    source = Path(path_string)
    stat = source.stat()
    signature = f"{source.resolve()}|{stat.st_mtime_ns}|{stat.st_size}".encode("utf-8")
    target = OPTIMIZED_ASSETS / f"{hashlib.sha1(signature).hexdigest()[:24]}.jpg"
    if target.exists():
        return target
    OPTIMIZED_ASSETS.mkdir(parents=True, exist_ok=True)
    with Image.open(source) as raw:
        image = ImageOps.exif_transpose(raw)
        if image.mode in {"RGBA", "LA"} or "transparency" in image.info:
            rgba = image.convert("RGBA")
            flattened = Image.new("RGBA", rgba.size, (245, 247, 249, 255))
            flattened.alpha_composite(rgba)
            image = flattened.convert("RGB")
        else:
            image = image.convert("RGB")
        image.thumbnail((2400, 1700), Image.Resampling.LANCZOS)
        image.save(target, "JPEG", quality=88, subsampling=0, optimize=True, progressive=True, dpi=(180, 180))
    return target


@lru_cache(maxsize=512)
def image_size(path: str) -> tuple[int, int]:
    with Image.open(path) as image:
        return image.size


def safe_text(text: str) -> str:
    return html.escape(text).replace("\n", "<br/>")


class PortfolioBook:
    def __init__(self, output: Path):
        output.parent.mkdir(parents=True, exist_ok=True)
        self.c = canvas.Canvas(str(output), pagesize=(PAGE_W, PAGE_H), pageCompression=1)
        self.c.setTitle("王陈鑫 - 作者型导演作品集 2026")
        self.c.setAuthor("王陈鑫")
        self.c.setSubject("Author-Director Portfolio / Screenwriting / AI Film / Visual Archive")
        self.page = 0
        self.chapter = "PRELUDE"
        self.accent = PALETTE["directing_accent"]

    def begin(self, bg: Color, chapter: str, accent: Color, footer: bool = True) -> None:
        if self.page:
            self.c.showPage()
        self.page += 1
        self.chapter = chapter
        self.accent = accent
        self.c.setFillColor(bg)
        self.c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
        self.draw_ambient_grid(bg, accent)
        if footer:
            self.footer()

    def finish(self) -> None:
        self.c.showPage()
        self.c.save()

    def draw_ambient_grid(self, bg: Color, accent: Color) -> None:
        self.c.saveState()
        # A restrained editorial atmosphere replaces the old full-page UI grid.
        self.c.setFillColor(Color(accent.red, accent.green, accent.blue, alpha=0.035))
        self.c.ellipse(PAGE_W * 0.67, PAGE_H * 0.71, PAGE_W * 1.11, PAGE_H * 1.22, fill=1, stroke=0)
        self.c.setStrokeColor(Color(accent.red, accent.green, accent.blue, alpha=0.12))
        self.c.setLineWidth(0.35)
        self.c.line(PAGE_W - 118, 0, PAGE_W - 118, PAGE_H)
        self.c.line(0, PAGE_H - 36, PAGE_W, PAGE_H - 36)
        self.c.restoreState()

    def footer(self) -> None:
        self.c.saveState()
        self.c.setStrokeColor(Color(self.accent.red, self.accent.green, self.accent.blue, alpha=0.32))
        self.c.setLineWidth(0.45)
        self.c.line(MARGIN, 25, PAGE_W - MARGIN, 25)
        self.c.setFillColor(PALETTE["muted"])
        self.c.setFont(FONT_EN_NARROW, 6.4)
        self.c.drawString(MARGIN, 13, f"WANG CHENXIN / AUTHOR-DIRECTOR PORTFOLIO / {self.chapter}")
        self.c.setFont(FONT_EN, 6.4)
        self.c.drawRightString(PAGE_W - MARGIN, 13, f"{self.page:02d}")
        self.c.restoreState()

    def kicker(self, text: str, x: float, y: float, color: Color | None = None, size: float = 7.2) -> None:
        self.c.setFillColor(color or self.accent)
        font = FONT_CN_BOLD if any(ord(character) > 127 for character in text) else FONT_EN_BOLD
        self.c.setFont(font, size)
        self.c.drawString(x, y, text.upper())

    def rule(self, x: float, y: float, w: float, color: Color | None = None, width: float = 0.6) -> None:
        self.c.setStrokeColor(color or Color(self.accent.red, self.accent.green, self.accent.blue, alpha=0.45))
        self.c.setLineWidth(width)
        self.c.line(x, y, x + w, y)

    def para(
        self,
        text: str,
        x: float,
        top: float,
        width: float,
        size: float = 10,
        leading: float | None = None,
        color: Color | None = None,
        bold: bool = False,
        max_height: float = 500,
        align: int = TA_LEFT,
    ) -> float:
        style = ParagraphStyle(
            "portfolio",
            fontName=FONT_CN_BOLD if bold else FONT_CN,
            fontSize=size,
            leading=leading or size * 1.58,
            textColor=color or PALETTE["paper"],
            alignment=align,
            wordWrap="CJK",
            splitLongWords=True,
            spaceAfter=0,
            spaceBefore=0,
        )
        paragraph = Paragraph(safe_text(text), style)
        _, height = paragraph.wrap(width, max_height)
        paragraph.drawOn(self.c, x, top - height)
        return height

    def title(self, text: str, x: float, top: float, width: float, size: float = 32, color: Color | None = None) -> float:
        return self.para(text, x, top, width, size=size, leading=size * 1.12, color=color, bold=True)

    def image_cover(
        self,
        path: Path,
        x: float,
        y: float,
        w: float,
        h: float,
        anchor_x: float = 0.5,
        anchor_y: float = 0.5,
        dim: float = 0,
    ) -> None:
        prepared = prepared_image(str(path))
        iw, ih = image_size(str(prepared))
        scale = max(w / iw, h / ih)
        draw_w, draw_h = iw * scale, ih * scale
        draw_x = x - (draw_w - w) * anchor_x
        draw_y = y - (draw_h - h) * anchor_y
        self.c.saveState()
        clip = self.c.beginPath()
        clip.rect(x, y, w, h)
        self.c.clipPath(clip, stroke=0, fill=0)
        self.c.drawImage(str(prepared), draw_x, draw_y, width=draw_w, height=draw_h, preserveAspectRatio=True, mask="auto")
        if dim:
            self.c.setFillColor(Color(0.01, 0.025, 0.045, alpha=dim))
            self.c.rect(x, y, w, h, fill=1, stroke=0)
        self.c.restoreState()

    def image_contain(self, path: Path, x: float, y: float, w: float, h: float, bg: Color | None = None) -> None:
        if bg:
            self.c.setFillColor(bg)
            self.c.rect(x, y, w, h, fill=1, stroke=0)
        prepared = prepared_image(str(path))
        iw, ih = image_size(str(prepared))
        scale = min(w / iw, h / ih)
        dw, dh = iw * scale, ih * scale
        self.c.drawImage(str(prepared), x + (w - dw) / 2, y + (h - dh) / 2, width=dw, height=dh, mask="auto")

    def label_chip(self, text: str, x: float, y: float, color: Color | None = None) -> float:
        color = color or self.accent
        width = max(52, len(text) * 5.2 + 18)
        self.c.setFillColor(Color(color.red, color.green, color.blue, alpha=0.16))
        self.c.setStrokeColor(Color(color.red, color.green, color.blue, alpha=0.48))
        self.c.roundRect(x, y, width, 18, 9, fill=1, stroke=1)
        self.c.setFillColor(color)
        self.c.setFont(FONT_CN, 6.6)
        self.c.drawCentredString(x + width / 2, y + 5.4, text)
        return width

    def section_cover(self, number: str, en: str, zh: str, statement: str, bg: Color, accent: Color, image: Path | None = None) -> None:
        self.begin(bg, en, accent, footer=True)
        if image:
            self.image_cover(image, PAGE_W * 0.47, 0, PAGE_W * 0.53, PAGE_H, anchor_x=0.56, dim=0.28)
            self.c.setFillColor(bg)
            self.c.rect(0, 0, PAGE_W * 0.52, PAGE_H, fill=1, stroke=0)
        self.kicker(f"CHAPTER {number}", MARGIN, PAGE_H - 68)
        self.c.setFillColor(Color(accent.red, accent.green, accent.blue, alpha=0.16))
        self.c.setFont(FONT_EN_BOLD, 128)
        self.c.drawString(MARGIN - 8, 214, number)
        self.c.setFillColor(PALETTE["paper"])
        self.c.setFont(FONT_EN_BOLD, 42)
        self.c.drawString(MARGIN, 188, en)
        self.title(zh, MARGIN, 151, 360, size=21, color=accent)
        self.para(statement, MARGIN, 102, 330, size=9.4, leading=15.5, color=HexColor("#B7C4CE"))

    def project_cover(self, project: dict) -> None:
        self.begin(project["bg"], "DIRECTING / CASE STUDY", project["accent"], footer=True)
        self.image_cover(project["cover"], 0, 0, PAGE_W, PAGE_H, anchor_x=project.get("cover_anchor", 0.5), dim=0.28)
        self.c.setFillColor(Color(project["bg"].red, project["bg"].green, project["bg"].blue, alpha=0.88))
        self.c.rect(0, 0, PAGE_W * 0.42, PAGE_H, fill=1, stroke=0)
        self.kicker(f"CASE {project['case']} / DIRECTOR STUDY", MARGIN, PAGE_H - 62)
        self.c.setFillColor(Color(project["accent"].red, project["accent"].green, project["accent"].blue, alpha=0.14))
        self.c.setFont(FONT_EN_BOLD, 112)
        self.c.drawString(MARGIN - 8, 294, project["case"])
        self.title(project["title"], MARGIN, 276, 300, size=33)
        self.para(project["subtitle"], MARGIN, 214, 290, size=9.2, leading=14.2, color=project["accent"], bold=True)
        self.rule(MARGIN, 186, 282)
        self.para(project["logline"], MARGIN, 162, 286, size=9.4, leading=15.4, color=HexColor("#C4CED6"))
        self.kicker(project["meta"], MARGIN, 64, color=HexColor("#A2B2BE"), size=6.4)

    def project_intent(self, project: dict) -> None:
        self.begin(project["bg"], "DIRECTING / DECISION", project["accent"])
        self.kicker(f"CASE {project['case']} / 01", MARGIN, PAGE_H - 58)
        self.title(project.get("decision_title", "导演判断"), MARGIN, PAGE_H - 88, 330, size=28)
        self.rule(MARGIN, PAGE_H - 132, 320)
        self.kicker("CORE DECISION", MARGIN, PAGE_H - 166, size=6.7)
        self.para(project["statement"], MARGIN, PAGE_H - 188, 310, size=16, leading=22, color=PALETTE["paper"], bold=True)
        chip_x = MARGIN
        for keyword in project["keywords"]:
            chip_x += self.label_chip(keyword, chip_x, 218, project["accent"]) + 8
        self.kicker("STORY PREMISE", MARGIN, 185, size=6.7)
        self.para(project["story"], MARGIN, 164, 310, size=8.7, leading=14.2, color=HexColor("#AEB9C1"))
        self.kicker("DIRECTOR'S EVIDENCE", MARGIN, 95, size=6.7)
        self.para(project["evidence"], MARGIN, 78, 310, size=7.3, leading=11.6, color=HexColor("#8998A2"))
        self.image_cover(project["images"][0], 390, 58, PAGE_W - 430, PAGE_H - 100, anchor_x=0.5)
        self.c.setStrokeColor(Color(project["accent"].red, project["accent"].green, project["accent"].blue, alpha=0.55))
        self.c.rect(390, 58, PAGE_W - 430, PAGE_H - 100, fill=0, stroke=1)

    def project_structure(self, project: dict) -> None:
        self.begin(project["bg"], "DIRECTING / STRUCTURE", project["accent"])
        self.kicker(f"CASE {project['case']} / 02", MARGIN, PAGE_H - 58)
        self.title(project.get("structure_title", "叙事结构与核心意象"), MARGIN, PAGE_H - 88, 480, size=28)
        self.para(project["structure_intro"], 514, PAGE_H - 88, 278, size=8.2, leading=13.5, color=HexColor("#9EAFBA"))
        card_w = (PAGE_W - MARGIN * 2 - 24) / 3
        y = 78
        h = 350
        for index, beat in enumerate(project["structure"]):
            x = MARGIN + index * (card_w + 12)
            self.image_cover(beat["image"], x, y + 126, card_w, h - 126, anchor_x=0.5, dim=0.12)
            self.c.setFillColor(Color(project["accent"].red, project["accent"].green, project["accent"].blue, alpha=0.11))
            self.c.rect(x, y, card_w, 126, fill=1, stroke=0)
            self.kicker(f"0{index + 1} / {beat['en']}", x + 14, y + 100, size=6.2)
            self.para(beat["title"], x + 14, y + 82, card_w - 28, size=12, leading=16, bold=True)
            self.para(beat["text"], x + 14, y + 53, card_w - 28, size=7.8, leading=12.4, color=HexColor("#AAB8C2"))

    def project_visual(self, project: dict) -> None:
        self.begin(project["bg"], "DIRECTING / VISUAL SYSTEM", project["accent"])
        self.kicker(f"CASE {project['case']} / 03", MARGIN, PAGE_H - 58)
        self.title(project.get("visual_title", "镜头语言与制作证据"), MARGIN, PAGE_H - 88, 430, size=28)
        self.para(
            project.get(
                "visual_intro",
                "现有归档以全片成片帧为主，以下拆解机位、光线与人物关系；不补造分镜或幕后材料。",
            ),
            478,
            PAGE_H - 90,
            314,
            size=7.5,
            leading=12.2,
            color=HexColor("#93A6B2"),
        )
        visual_images = project.get("visual_images", project["images"][1:4])
        large, small_a, small_b = visual_images[:3]
        self.image_cover(large, MARGIN, 78, 455, 354, anchor_x=0.5)
        self.image_cover(small_a, 510, 255, 282, 177, anchor_x=0.5)
        self.image_cover(small_b, 510, 78, 282, 165, anchor_x=0.5)
        note_y = [93, 270, 93]
        boxes = [(MARGIN + 16, 78 + 14, 260), (526, 255 + 14, 242), (526, 78 + 14, 242)]
        for note, (x, y, width) in zip(project["visual_notes"], boxes):
            self.c.setFillColor(Color(0.02, 0.04, 0.07, alpha=0.78))
            self.c.roundRect(x, y, width, 47, 3, fill=1, stroke=0)
            self.kicker(note["title"], x + 10, y + 31, size=5.8)
            self.para(note["text"], x + 10, y + 23, width - 20, size=6.7, leading=9.4, color=HexColor("#D3DCE2"))

    def project_outcome(self, project: dict) -> None:
        self.begin(project["bg"], "DIRECTING / OUTCOME", project["accent"])
        self.kicker(f"CASE {project['case']} / 04", MARGIN, PAGE_H - 58)
        self.title(project.get("outcome_title", "制作方法、成果与复盘"), MARGIN, PAGE_H - 88, 430, size=28)
        strip_h = 174
        gap = 8
        strip_w = (PAGE_W - MARGIN * 2 - gap * 2) / 3
        for index, image in enumerate(project.get("outcome_images", project["images"][4:7])):
            self.image_cover(image, MARGIN + index * (strip_w + gap), 328, strip_w, strip_h, anchor_x=0.5)
        facts = project["facts"]
        fact_w = 165
        for index, fact in enumerate(facts[:4]):
            x = MARGIN + index * (fact_w + 12)
            self.c.setFillColor(Color(project["accent"].red, project["accent"].green, project["accent"].blue, alpha=0.105))
            self.c.roundRect(x, 228, fact_w, 76, 5, fill=1, stroke=0)
            self.c.setFillColor(project["accent"])
            self.c.setFont(FONT_EN_BOLD, 17)
            self.c.drawString(x + 14, 268, fact["value"])
            self.para(fact["label"], x + 14, 255, fact_w - 28, size=6.9, leading=10, color=HexColor("#AAB8C2"))
        self.kicker("WHAT THE WORK PROVES", MARGIN, 188, size=6.6)
        self.para(project["review"], MARGIN, 168, 398, size=9.1, leading=14.6, color=PALETTE["paper"])
        self.kicker(project.get("next_label", "NEXT ITERATION"), 458, 188, size=6.6)
        self.para(project["next"], 458, 168, 205, size=7.7, leading=12.2, color=HexColor("#AAB8C2"))
        self.c.setStrokeColor(Color(project["accent"].red, project["accent"].green, project["accent"].blue, alpha=0.55))
        self.c.setDash(3, 3)
        self.c.rect(696, 82, 96, 96, fill=0, stroke=1)
        self.c.setDash()
        self.kicker("FULL FILM", 711, 142, size=6.2)
        self.para("公开链接确认后\n生成二维码", 711, 127, 66, size=6.4, leading=9.2, color=HexColor("#9CAAB3"), align=TA_LEFT)

    def gallery_page(self, title: str, subtitle: str, images: list[Path], bg: Color, accent: Color, chapter: str, captions: list[str] | None = None) -> None:
        self.begin(bg, chapter, accent)
        self.kicker(chapter, MARGIN, PAGE_H - 56)
        self.title(title, MARGIN, PAGE_H - 84, 500, size=27)
        self.para(subtitle, 532, PAGE_H - 86, 260, size=7.7, leading=12.4, color=HexColor("#9FB0BB"))
        cols, rows = 3, 2
        gap = 8
        tile_w = (PAGE_W - MARGIN * 2 - gap * (cols - 1)) / cols
        tile_h = 176
        for idx, path in enumerate(images[:6]):
            row, col = divmod(idx, cols)
            x = MARGIN + col * (tile_w + gap)
            y = 286 - row * (tile_h + 30)
            self.image_cover(path, x, y, tile_w, tile_h, anchor_x=0.5)
            if captions and idx < len(captions):
                self.kicker(captions[idx], x, y - 14, color=HexColor("#91A2AD"), size=5.6)


def build_projects() -> list[dict]:
    directing_bg = PALETTE["prelude"]
    return [
        {
            "case": "01",
            "title": "崖佛不语，岁岁佑我",
            "subtitle": "剧情短片 / 大足石刻 / 亲情与守护",
            "meta": "PERSONAL NARRATIVE FILM / COMPLETE FILM",
            "bg": directing_bg,
            "accent": HexColor("#C6A56A"),
            "cover": still("yafobuyu/frame_06.jpg"),
            "logline": "以崖佛为沉默见证者，让童年祈愿、亲情记忆与成年回望在同一组意象中彼此回应。",
            "story": "童年祈愿与成年回望彼此照亮。崖佛、苹果和陪伴关系保存了一段未被说出的亲情。",
            "statement": "石刻不是背景，而是人物记忆的空间。",
            "keywords": ["空间尺度", "时间回响", "情感象征"],
            "evidence": "画面由崖壁远景进入人物近景；冷灰雨雾与佛堂暖光分开现实和记忆；重复物件连接两条时间线。",
            "structure_title": "记忆的三次回响",
            "structure_intro": "被守护 - 离开 - 回返。意象重复，但每次承担新的情绪位置。",
            "structure": [
                {"en": "ORIGIN", "title": "童年：被守护", "text": "雨雾、庭院与祈愿建立最初记忆。", "image": still("yafobuyu/frame_00.jpg")},
                {"en": "IMPRINT", "title": "意象：被保存", "text": "苹果、金毛与崖佛持续承载亲情。", "image": still("yafobuyu/frame_04.jpg")},
                {"en": "RETURN", "title": "成年：重新理解", "text": "人物回到相似空间，完成情绪回响。", "image": still("yafobuyu/frame_08.jpg")},
            ],
            "images": [still("yafobuyu/frame_02.jpg")],
            "visual_images": [
                still("yafobuyu/frame_03.jpg"),
                still("yafobuyu/frame_07.jpg"),
                still("yafobuyu/frame_09.jpg"),
            ],
            "outcome_images": [
                still("yafobuyu/frame_01.jpg"),
                still("yafobuyu/frame_05.jpg"),
                still("yafobuyu/frame_10.jpg"),
            ],
            "visual_title": "石刻、雨雾与记忆意象",
            "visual_intro": "从成片中选择不同空间、人物关系与光线状态，说明地域景观如何参与情绪。",
            "outcome_title": "意象如何完成情感回声",
            "visual_notes": [
                {"title": "SCALE / 场域尺度", "text": "让人物被石刻空间包围，建立时间感。"},
                {"title": "MOTIF / 意象", "text": "苹果与陪伴关系连接不同时间线。"},
                {"title": "COLOR / 色温", "text": "冷灰雨雾与暖金佛堂构成情绪对照。"},
            ],
            "facts": [
                {"value": "≈05'00\"", "label": "完整成片时长"},
                {"value": "02 LINES", "label": "童年 / 成年双时间线"},
                {"value": "DAZU", "label": "大足石刻地域空间"},
                {"value": "16:9", "label": "横向剧情片画幅"},
            ],
            "review": "地域空间、重复物件和人物表情被组织成同一条情感线，证明场域可以参与叙事，而不只是提供奇观。",
            "next_label": "DEVELOPMENT NOTE",
            "next": "继续压缩解释，让重复意象和声画回声承担更多叙事。",
        },
        {
            "case": "02",
            "title": "手电",
            "subtitle": "剧情短片 / 父子关系 / 大足石刻",
            "meta": "PERSONAL NARRATIVE FILM / COMPLETE FILM",
            "bg": directing_bg,
            "accent": HexColor("#6BC7E8"),
            "cover": still("shoudian/frame_07.jpg"),
            "logline": "一支旧手电把被搁置的家庭记忆带回当下，也让父子在共同观看与陪伴中完成回应。",
            "story": "人物从旧手电和合照进入一段没有被说出的父子关系，最终在共同观看中完成回应。",
            "statement": "不用对白解释父子关系，让光束替人物说话。",
            "keywords": ["道具叙事", "光线方向", "同框关系"],
            "evidence": "旧物先于人物开口；光束规定观众看见什么；构图从单人逐步转向父子同框。",
            "structure_title": "一支手电的动作链",
            "structure_intro": "发现 - 修复 - 传递。物理照明与关系修复在同一动作中完成。",
            "structure": [
                {"en": "DISCOVERY", "title": "旧物：关系入口", "text": "旧居、合照和手电唤起未完成的记忆。", "image": still("shoudian/frame_00.jpg")},
                {"en": "REPAIR", "title": "修复：重新行动", "text": "修理手电也等于重新面对关系。", "image": still("shoudian/frame_03.jpg")},
                {"en": "RESPONSE", "title": "石刻：情感回应", "text": "光束、拥抱与共同观看完成收束。", "image": still("shoudian/frame_12.jpg")},
            ],
            "images": [still("shoudian/frame_01.jpg")],
            "visual_images": [
                still("shoudian/frame_05.jpg"),
                still("shoudian/frame_02.jpg"),
                still("shoudian/frame_08.jpg"),
            ],
            "outcome_images": [
                still("shoudian/frame_09.jpg"),
                still("shoudian/frame_10.jpg"),
                still("shoudian/frame_11.jpg"),
            ],
            "visual_title": "光束、道具与父子调度",
            "visual_intro": "以旧物、窄光和同框关系拆解无对白段落，不补造未归档的分镜或幕后材料。",
            "outcome_title": "一束光如何推进一段关系",
            "visual_notes": [
                {"title": "OBJECT / 道具", "text": "手电与合照承担信息，不依赖对白解释。"},
                {"title": "BEAM / 光束", "text": "窄光在暗空间中决定观看方向。"},
                {"title": "RELATION / 关系", "text": "从单人构图逐步转向父子同框。"},
            ],
            "facts": [
                {"value": "05'10\"", "label": "完整成片时长"},
                {"value": "01 OBJECT", "label": "旧手电作为叙事核心"},
                {"value": "DAZU", "label": "大足石刻地域空间"},
                {"value": "16:9", "label": "横向剧情片画幅"},
            ],
            "review": "物件、光线与人物调度共同推进关系，证明无对白段落也能依靠动作和构图完成情绪转折。",
            "next_label": "DEVELOPMENT NOTE",
            "next": "继续精确手电开合、维修与传递的节奏，让动作链更有递进。",
        },
        {
            "case": "03",
            "title": "通幽录·渝州篇",
            "subtitle": "7 集 · 中式奇幻悬疑系列 / 山城叙事 / AI 影像",
            "meta": "AI DIRECTOR / ROLE VERIFIED IN EP01 TEAM SHEET",
            "bg": directing_bg,
            "accent": HexColor("#4DD5C3"),
            "cover": still("tongyoulu/ep06.jpg"),
            "logline": "一个被世界遗忘的少年回到渝州老宅，在精怪未了的心愿中追查自己被抹去的真相。",
            "story": "7 个精怪单元推进林砚、外婆与黄桷树的长线谜团。每一集完成一段执念，也揭开一层世界规则。",
            "statement": "先建立可持续的世界规则，再追求单个漂亮镜头。",
            "keywords": ["山城空间", "单元长线", "资产连续性"],
            "evidence": "首集交付包保留 176 条镜头指令、图示分镜及角色 / 场景 / 道具资产，7 集累计 60+ 分钟。",
            "structure_title": "7 集世界观推进图",
            "structure_intro": "单元愿望与长线谜团并行，地点、精怪和人物记忆逐层逼近真相。",
            "structure": [
                {"en": "ENTRY", "title": "归乡：进入规则", "text": "老宅、古书与黄桷树建立世界入口。", "image": still("tongyoulu/ep01.jpg")},
                {"en": "CASES", "title": "单元：完成执念", "text": "每集以一段精怪心愿推进人物成长。", "image": still("tongyoulu/ep04.jpg")},
                {"en": "TRUTH", "title": "长线：逼近真相", "text": "林砚逐步理解被遗忘与守护的代价。", "image": still("tongyoulu/ep07.jpg")},
            ],
            "images": [still("tongyoulu/ep03.jpg")],
            "visual_title": "分镜、资产与成片对照",
            "visual_intro": "首集原始交付包包含图示分镜、角色 / 场景 / 道具资产与 176 条镜头指令。以下直接使用原始制作档案，不以成片反推分镜。",
            "visual_images": [
                source_f(r"重庆故事\《通幽录》第一集项目交付包\4分镜头脚本\4.2图示分镜头\回家分镜\到家1.png"),
                source_f(r"重庆故事\《通幽录》第一集项目交付包\5数字资产库\5.1角色\林砚.png"),
                still("tongyoulu/ep02.jpg"),
            ],
            "visual_notes": [
                {"title": "STORYBOARD / 图示分镜", "text": "把人物位置、场景关系与动作方向在生成前固定。"},
                {"title": "CHARACTER / 角色资产", "text": "角色基准图维持跨镜头、跨集连续性。"},
                {"title": "FINAL / 成片核对", "text": "以完成帧检验构图、光线与叙事信息是否一致。"},
            ],
            "outcome_images": [
                still("tongyoulu/ep05.jpg"),
                source_f(r"重庆故事\《通幽录》第一集项目交付包\5数字资产库\5.3道具\高调版本通幽录.png"),
                source_f(r"重庆故事\《通幽录》第一集项目交付包\5数字资产库\5.2场景\老家房屋.png"),
            ],
            "outcome_title": "从 176 条指令到 7 集成片",
            "facts": [
                {"value": "07 EP", "label": "完整系列集数"},
                {"value": "60+ MIN", "label": "累计成片时长"},
                {"value": "176", "label": "首集镜头指令"},
                {"value": "03 LIBS", "label": "角色 / 场景 / 道具资产库"},
            ],
            "review": "从文学信息到镜头指令，再到跨集资产连续性，这个系列证明导演判断可以被拆解为稳定的生产系统。",
            "next_label": "SERIES MAP",
            "next": "01 浮生无迹·归乡逢幽 / 02 渝州巷年 / 03 江畔古楼 / 04 黄桷渡·燃茶案 / 05 傀灵寄忆 / 06 黄桷渡·忌渡 / 07 南山旧约",
        },
        {
            "case": "04",
            "title": "麦麦的魔法面包店",
            "subtitle": "15 集儿童奇幻系列 / 单元故事 / AI 动画",
            "meta": "15-EPISODE SERIES / COMPLETE SOURCE ARCHIVE",
            "bg": directing_bg,
            "accent": HexColor("#A9B8FF"),
            "cover": still("maimai/cover.jpg"),
            "logline": "每一种魔法面包回应一种成长困惑，让奇幻机制成为孩子理解情绪和选择的入口。",
            "story": "15 种魔法面包对应 15 个成长困惑。共同的店铺与角色维持连续，每集的能力和选择保持差异。",
            "statement": "重复的是单元机制，不重复每一集的视觉答案。",
            "keywords": ["单元机制", "跨集差异", "儿童视角"],
            "evidence": "15 集完整成片、独立分集命名和过程资产共同显示：统一规则维持系列感，场景修改保留分集差异。",
            "structure_title": "一个面包，一次选择",
            "structure_intro": "困惑 - 魔法 - 选择。稳定模板支持连续生产，主题决定每集视觉命题。",
            "structure": [
                {"en": "QUESTION", "title": "困惑：提出问题", "text": "从孩子当下的情绪或愿望进入故事。", "image": still("maimai/ep01.jpg")},
                {"en": "MAGIC", "title": "面包：触发体验", "text": "奇幻机制把抽象困惑转成行动。", "image": still("maimai/ep09a.jpg")},
                {"en": "CHOICE", "title": "选择：完成成长", "text": "角色通过决定而非说教获得理解。", "image": still("maimai/ep15.jpg")},
            ],
            "images": [still("maimai/ep03.jpg")],
            "visual_title": "场景迭代与成片差异",
            "visual_intro": "原始资产目录保留了角色、场景、桥梁修改与生成过程图。页面呈现实际迭代证据，并与不同分集成片核对，避免把固定烘焙过程重复当成系列差异。",
            "visual_images": [
                source_f(r"麦麦的面包店\麦麦的面包店\资产\jimeng-2026-04-29-4172-将图片中的桥断开，其余元素保持不变.png"),
                source_f(r"麦麦的面包店\麦麦的面包店\资产\jimeng-2026-04-29-4485-将图片中的桥完全断开，并且让桥变得更长，其余元素保持不变.png"),
                still("maimai/ep06.jpg"),
            ],
            "visual_notes": [
                {"title": "ITERATION / 场景修改", "text": "桥梁断裂长度与空间关系通过版本迭代明确。"},
                {"title": "REVISION / 修改版本", "text": "桥梁进一步断开并延长，形成可见的空间差异。"},
                {"title": "EPISODE / 成片差异", "text": "每集用不同能力、场景与冲突建立独立视觉命题。"},
            ],
            "outcome_images": [
                still("maimai/ep02.jpg"),
                still("maimai/ep08.jpg"),
                still("maimai/ep14.jpg"),
            ],
            "outcome_title": "15 个单元如何保持差异",
            "facts": [
                {"value": "15 EP", "label": "完整单元系列"},
                {"value": "15 TITLES", "label": "独立分集命名与预览"},
                {"value": "30+ MIN", "label": "15 集累计成片时长"},
                {"value": "PROCESS", "label": "原始生成与修改资产归档"},
            ],
            "review": "统一的世界规则承载 15 个不同成长命题，证明系列化不等于复制画面，而是用稳定结构容纳变化。",
            "next_label": "EPISODE MAP",
            "next": "小鱼 / 云朵 / 太极 / 泡泡 / 伸缩 / 彩虹 / 绿化 / 音乐 / 飞行 / 弹簧 / 绘画 / 好梦 / 房屋 / 勇气 / 发光",
        },
    ]


def draw_cover(book: PortfolioBook) -> None:
    book.begin(PALETTE["prelude"], "COVER", PALETTE["directing_accent"], footer=False)
    book.image_cover(still("tongyoulu/cover.jpg"), 0, 0, PAGE_W, PAGE_H, anchor_x=0.55, dim=0.46)
    book.c.setFillColor(Color(PALETTE["prelude"].red, PALETTE["prelude"].green, PALETTE["prelude"].blue, alpha=0.78))
    book.c.rect(0, 0, PAGE_W * 0.56, PAGE_H, fill=1, stroke=0)
    book.kicker("AUTHOR-DIRECTOR PORTFOLIO / 2026", MARGIN, PAGE_H - 62)
    book.c.setFillColor(PALETTE["paper"])
    book.c.setFont(FONT_EN_BOLD, 50)
    book.c.drawString(MARGIN, 370, "FROM MOTIVE")
    book.c.drawString(MARGIN, 314, "TO IMAGE")
    book.title("从人物动机，到可以被执行的镜头。", MARGIN, 270, 380, size=18, color=PALETTE["directing_accent"])
    book.rule(MARGIN, 210, 382)
    book.c.setFillColor(PALETTE["paper"])
    book.c.setFont(FONT_CN_BOLD, 24)
    book.c.drawString(MARGIN, 168, "王陈鑫")
    book.c.setFont(FONT_EN_NARROW, 10)
    book.c.drawString(MARGIN, 145, "WANG CHENXIN")
    book.kicker("DIRECTOR / SCREENWRITER / AI FILMMAKER", MARGIN, 88, color=HexColor("#B7C6D1"), size=6.8)


def draw_manifesto(book: PortfolioBook) -> None:
    book.begin(PALETTE["prelude"], "PRELUDE / MANIFESTO", PALETTE["directing_accent"])
    book.image_cover(still("yafobuyu/frame_11.jpg"), PAGE_W * 0.52, 0, PAGE_W * 0.48, PAGE_H, anchor_x=0.5, dim=0.18)
    book.kicker("CREATIVE MANIFESTO / 01", MARGIN, PAGE_H - 62)
    book.title("我首先是一个讲故事的人。", MARGIN, PAGE_H - 102, 365, size=35)
    book.title("导演让我组织画面，编剧让我理解人物。", MARGIN, PAGE_H - 190, 385, size=21, color=PALETTE["directing_accent"])
    book.para(
        "我的创作从人物与世界规则开始，再进入分场、分镜、调度和后期。技术提高产能，角色动机与叙事取舍始终由创作者负责。",
        MARGIN, PAGE_H - 270, 360, size=10.2, leading=17.2, color=HexColor("#C1CCD4")
    )
    book.kicker("POSITION", MARGIN, 104, size=6.4)
    book.para("作者型导演 / 独立完成剧本、导演、分镜、剪辑、镜头设计与创意策划", MARGIN, 88, 355, size=8.2, leading=12.8, color=HexColor("#9FB0BB"))


def draw_method(book: PortfolioBook) -> None:
    book.begin(PALETTE["prelude"], "PRELUDE / METHOD", PALETTE["directing_accent"])
    book.kicker("DIRECTOR'S METHOD / 02", MARGIN, PAGE_H - 60)
    book.title("创作方法不是技能清单，而是一条导演决策链。", MARGIN, PAGE_H - 92, 650, size=30)
    stages = [
        ("01", "命题", "先确认故事真正讨论的问题，以及人物必须付出的代价。"),
        ("02", "人物", "建立欲望、恐惧、关系和选择，让行动来自人物而非设定。"),
        ("03", "结构", "把信息、冲突与情绪递进落到场次和节奏。"),
        ("04", "镜头", "通过景别、机位、调度、光影与声音建立观看方向。"),
        ("05", "制作", "统一角色、场景、资产、现场条件或 AI 生成流程。"),
        ("06", "复盘", "检验成片是否仍然服务最初命题，并记录下一轮修正。"),
    ]
    start_x = MARGIN
    y = 260
    gap = 9
    card_w = (PAGE_W - 2 * MARGIN - gap * 2) / 3
    card_h = 110
    for idx, (number, title, text) in enumerate(stages):
        row, col = divmod(idx, 3)
        x = start_x + col * (card_w + gap)
        card_y = y - row * (card_h + 12)
        book.c.setFillColor(Color(PALETTE["directing_accent"].red, PALETTE["directing_accent"].green, PALETTE["directing_accent"].blue, alpha=0.095))
        book.c.roundRect(x, card_y, card_w, card_h, 5, fill=1, stroke=0)
        book.kicker(number, x + 14, card_y + 84, size=6.4)
        book.para(title, x + 14, card_y + 69, card_w - 28, size=12, leading=15, bold=True)
        book.para(text, x + 14, card_y + 43, card_w - 28, size=7.5, leading=11.6, color=HexColor("#A7B7C2"))
    book.kicker("PRINCIPLE", MARGIN, 84, size=6.4)
    book.para("先理解人物为什么行动，再决定镜头如何移动。", MARGIN, 68, 700, size=15, leading=19, color=PALETTE["directing_accent"], bold=True)


def draw_contents(book: PortfolioBook) -> None:
    book.begin(PALETTE["prelude"], "PRELUDE / CONTENTS", PALETTE["directing_accent"])
    book.kicker("CURATED CONTENTS / 03", MARGIN, PAGE_H - 60)
    book.title("一本导演作品集，而不是一组技能证明。", MARGIN, PAGE_H - 94, 620, size=30)
    entries = [
        ("01", "DIRECTING", "4 个以导演判断为核心的代表作", "05"),
        ("02", "SCREENWRITING", "5 部原创剧本与故事开发方法", "26"),
        ("03", "AI FILM", "把 AI 放回导演流程，而不是放在身份之前", "30"),
        ("04", "EXPERIMENT", "实验影像、非遗视觉与形式探索", "33"),
        ("05", "PHOTOGRAPHY", "作为取景、光线与空间观察训练", "36"),
        ("06", "FIELD PRACTICE", "网络剧、红果短剧与真实片场协作", "39"),
        ("07", "PROFILE", "职责署名、完整作品索引与联系", "42"),
    ]
    top = PAGE_H - 158
    for idx, (no, en, zh, page) in enumerate(entries):
        y = top - idx * 51
        book.rule(MARGIN, y - 14, PAGE_W - MARGIN * 2, color=Color(0.6, 0.75, 0.85, alpha=0.16), width=0.45)
        book.kicker(no, MARGIN, y, size=6.3)
        book.c.setFillColor(PALETTE["paper"])
        book.c.setFont(FONT_EN_BOLD, 13)
        book.c.drawString(88, y - 1, en)
        book.para(zh, 255, y + 8, 430, size=8, leading=11.5, color=HexColor("#A3B3BE"))
        book.c.setFillColor(PALETTE["directing_accent"])
        book.c.setFont(FONT_EN_BOLD, 10)
        book.c.drawRightString(PAGE_W - MARGIN, y - 1, page)


def draw_writing_chapter(book: PortfolioBook) -> None:
    book.section_cover("02", "SCREENWRITING", "剧本不是对白的容器，而是选择与代价的设计。", "从人物和规则出发，把冲突转译为可以拍摄的行动。", PALETTE["writing"], PALETTE["writing_accent"])
    book.begin(PALETTE["writing"], "SCREENWRITING / METHOD", PALETTE["writing_accent"])
    book.kicker("STORY DEVELOPMENT SYSTEM", MARGIN, PAGE_H - 58)
    book.title("从命题到场次：我的剧本开发路径", MARGIN, PAGE_H - 90, 520, size=29)
    methods = [
        ("01", "现实命题", "不是先寻找热闹情节，而是确认人物处在什么制度、家庭与资源关系中。"),
        ("02", "人物小传", "让长处在过度使用时成为局限，让错误来自可理解的经验与恐惧。"),
        ("03", "结构推进", "用行动、程序、物件和空间改变信息，避免人物替作者讲主题。"),
        ("04", "镜头可执行", "分场时同步考虑景别、调度、声音、时间成本和制作边界。"),
    ]
    for idx, (no, title, text) in enumerate(methods):
        x = MARGIN + (idx % 2) * 378
        y = 318 - (idx // 2) * 144
        book.c.setFillColor(Color(PALETTE["writing_accent"].red, PALETTE["writing_accent"].green, PALETTE["writing_accent"].blue, alpha=0.11))
        book.c.roundRect(x, y, 360, 126, 5, fill=1, stroke=0)
        book.kicker(no, x + 16, y + 94, size=6.2)
        book.para(title, x + 16, y + 78, 320, size=13, leading=17, bold=True)
        book.para(text, x + 16, y + 49, 320, size=8.1, leading=12.8, color=HexColor("#B5AED0"))
    scripts = [
        ("《两块门牌》", "12 集 / 现实题材 / 1974-2012", "三峡库区两户家庭经历恢复高考、移民、国企改革与县城迁建。"),
        ("《合味》", "12 集 / 现实主义年代题材 / 1997-2026", "重庆火锅店、石柱辣椒供应、城乡母女与共同创制权。"),
        ("《山城换挡》", "12 集 / 现实主义工业家庭剧 / 1978-2026", "三代人与重庆制造业、摩托产业及智能新能源转型。"),
        ("《山那边的课表》", "12 集 / 现实主义教育题材 / 1997-2026", "城口乡村学校、教师、家庭与公共教育制度的长期建设。"),
        ("《江水记得》", "约 60 分钟 / 原创网络电影", "姐妹因三峡移民分隔两地，通过底片、磁带和档案重新联系。"),
    ]
    for page_index, subset in enumerate((scripts[:3], scripts[3:])):
        book.begin(PALETTE["writing"], "SCREENWRITING / ORIGINAL SCRIPTS", PALETTE["writing_accent"])
        book.kicker(f"ORIGINAL SCRIPT ARCHIVE / 0{page_index + 1}", MARGIN, PAGE_H - 58)
        book.title("原创剧本档案", MARGIN, PAGE_H - 90, 430, size=28)
        book.para("仅展示经申报材料核验的类型、体量与故事概况；完整剧本、对白与关键反转不公开。", 462, PAGE_H - 91, 330, size=7.6, leading=12.2, color=HexColor("#AFA7CE"))
        card_h = 112 if len(subset) == 3 else 168
        for idx, (title, meta, synopsis) in enumerate(subset):
            y = 350 - idx * (card_h + 14)
            book.c.setFillColor(Color(PALETTE["writing_accent"].red, PALETTE["writing_accent"].green, PALETTE["writing_accent"].blue, alpha=0.095))
            book.c.roundRect(MARGIN, y, PAGE_W - MARGIN * 2, card_h, 7, fill=1, stroke=0)
            book.kicker(f"SCRIPT / {page_index * 3 + idx + 1:02d}", MARGIN + 18, y + card_h - 25, size=5.9)
            book.para(title, MARGIN + 18, y + card_h - 42, 250, size=16, leading=20, bold=True)
            book.para(meta, 294, y + card_h - 26, 230, size=7, leading=10.5, color=PALETTE["writing_accent"], bold=True)
            book.para(synopsis, 294, y + card_h - 49, 465, size=8.2, leading=13.2, color=HexColor("#C2BBD8"))


def draw_ai_chapter(book: PortfolioBook) -> None:
    book.section_cover("03", "AI FILM", "AI 是制作系统，不是创作者身份的替代品。", "人物动机、世界规则与最终取舍始终由导演负责。", PALETTE["ai"], PALETTE["ai_accent"], still("archive/douyun.jpg"))
    book.gallery_page(
        "AI 影像作为导演流程",
        "从世界观、角色与场景资产，到镜头指令、生成迭代和后期质控。",
        [source_f(r"重庆故事\《通幽录》第一集项目交付包\4分镜头脚本\4.2图示分镜头\回家分镜\到家2.png"), still("maimai/ep11.jpg"), still("archive/qishuku.jpg"), still("archive/zoumagang.jpg"), still("archive/cixiu.jpg"), still("archive/banhua.jpg")],
        PALETTE["ai"], PALETTE["ai_accent"], "AI FILM / SELECTED WORK",
        ["通幽录", "麦麦的魔法面包店", "弃书库的守门人", "走马岗的来历", "刺绣 · 动态", "非遗版画 · 动态"],
    )
    book.begin(PALETTE["ai"], "AI FILM / PIPELINE", PALETTE["ai_accent"])
    book.kicker("DIRECTOR-LED PIPELINE", MARGIN, PAGE_H - 58)
    book.title("让技术服从叙事，而不是让叙事追逐技术。", MARGIN, PAGE_H - 92, 620, size=29)
    pipeline = [
        ("01", "SCRIPT", "人物小传 / 分场 / 世界规则"),
        ("02", "SHOT DESIGN", "景别 / 机位 / 动作 / 声音"),
        ("03", "ASSET SYSTEM", "角色 / 场景 / 服化道 / 色彩"),
        ("04", "GENERATION", "镜头指令 / 迭代 / 版本记录"),
        ("05", "EDITING", "节奏 / 连续性 / 声画关系"),
        ("06", "QUALITY", "动机核对 / 一致性 / 最终取舍"),
    ]
    x0, y = MARGIN, 310
    step_w = 115
    for idx, (no, en, zh) in enumerate(pipeline):
        x = x0 + idx * 125
        book.c.setFillColor(Color(PALETTE["ai_accent"].red, PALETTE["ai_accent"].green, PALETTE["ai_accent"].blue, alpha=0.11))
        book.c.roundRect(x, y, step_w, 108, 5, fill=1, stroke=0)
        book.kicker(no, x + 12, y + 83, size=5.8)
        book.c.setFillColor(PALETTE["paper"])
        book.c.setFont(FONT_EN_BOLD, 8.5)
        book.c.drawString(x + 12, y + 61, en)
        book.para(zh, x + 12, y + 47, step_w - 24, size=6.9, leading=10.2, color=HexColor("#A6C8C5"))
        if idx < len(pipeline) - 1:
            book.c.setStrokeColor(PALETTE["ai_accent"])
            book.c.line(x + step_w, y + 54, x + 125, y + 54)
    book.kicker("PROOF OF SCALE", MARGIN, 246, size=6.2)
    book.para("7 集《通幽录》 / 60+ 分钟成片 / 首集 176 条镜头指令 / 15 集《麦麦的魔法面包店》", MARGIN, 228, 700, size=13, leading=18, color=PALETTE["ai_accent"], bold=True)
    book.para("AI 章节不重复展示“会用什么工具”，而展示如何维持人物、世界与镜头判断的一致性。", MARGIN, 172, 520, size=9, leading=15, color=HexColor("#B2CBC8"))


def draw_photo_chapter(book: PortfolioBook) -> None:
    book.section_cover("05", "PHOTOGRAPHY", "摄影不是另一种身份，而是导演观察空间与光线的训练。", "把城市、自然与人物当作取景、节奏和情绪关系来观看。", PALETTE["photo"], PALETTE["photo_accent"], source_f(r"摄影\IMG_2840.jpg"))
    book.gallery_page(
        "视觉观察 / 空间与光",
        "夜景、自然、城市与人物不按题材堆叠，而按光线方向、空间层次和观看距离组织。",
        [
            source_f(r"摄影\4794913bc10f4e4b7ae1cbdd452bb9b0.JPG"),
            source_f(r"摄影\ae625a15ddf91a9ecadb49a4a508c026.JPG"),
            source_f(r"摄影\19c09128a06362c2abcacd41f25803f4.JPG"),
            source_f(r"摄影\ef4f854d35b74913ea090f6245d974ca.JPG"),
            source_f(r"摄影\1acf227bf6d2e9a3e4291dce3b6f2ed3.JPG"),
            source_f(r"摄影\106fea9093c13a256121594c98fdb2fb.JPG"),
        ],
        PALETTE["photo"], PALETTE["photo_accent"], "PHOTOGRAPHY / VISUAL NOTES",
        ["夜 / 城市光", "人物 / 逆光", "城市 / 几何", "水面 / 反射", "桥体 / 结构", "风景 / 气候"],
    )
    book.begin(PALETTE["photo"], "PHOTOGRAPHY / DIRECTOR'S EYE", PALETTE["photo_accent"])
    book.kicker("OBSERVATION AS PREVIS", MARGIN, PAGE_H - 58)
    book.title("摄影练习最终回到导演问题：观众先看见什么？", MARGIN, PAGE_H - 92, 650, size=29)
    photos = [
        source_f(r"摄影\4121cabb8b943e72e70af372ef9d22d7.JPG"),
        source_f(r"摄影\980096784da9310de980466220d2977b.JPG"),
        source_f(r"摄影\23375546f24ef50ae3a3da013fc5ce11.JPG"),
    ]
    notes = [
        ("人物", "距离决定关系：靠近不等于亲密，远景也可以留下情绪。"),
        ("空间", "前景、通道和边界决定人物能否行动，以及画面如何呼吸。"),
        ("气候", "雾、雨、水面与自然光不是滤镜，而是情绪的物理条件。"),
    ]
    for idx, (path, note) in enumerate(zip(photos, notes)):
        x = MARGIN + idx * 252
        book.image_cover(path, x, 192, 236, 236, anchor_x=0.5)
        book.kicker(note[0], x, 168, size=6.1)
        book.para(note[1], x, 153, 230, size=7.6, leading=11.8, color=HexColor("#AAC2B8"))


def draw_experiment_chapter(book: PortfolioBook) -> None:
    book.section_cover("04", "EXPERIMENT", "实验不是风格化逃逸，而是寻找新的叙事形式。", "从志怪、民俗、非遗到平面系统，探索图像如何承载地域经验。", PALETTE["experiment"], PALETTE["experiment_accent"], still("archive/dongdeng.jpg"))
    book.gallery_page(
        "实验影像 / 类型与形式",
        "保留题材差异，同时以人物、空间和视觉规则组织观看。",
        [
            still("archive/jinyan.jpg"),
            still("archive/taoyan.jpg"),
            still("archive/shancheng.jpg"),
            still("archive/mufeng.jpg"),
            still("archive/fanjiagxiang.jpg"),
            still("archive/xiayan.jpg"),
        ],
        PALETTE["experiment"], PALETTE["experiment_accent"], "EXPERIMENT / MOVING IMAGE",
        ["禁言", "我最讨厌的人", "热血山城", "牧风", "共青团伙伴计划", "峡砚"],
    )
    book.gallery_page(
        "非遗与视觉系统",
        "动态影像、纹样、漫画与平面实验作为文化题材的视觉研究。",
        [
            source_f(r"a图片\刺绣\微信图片_20260613131606_47_1.png"),
            source_f(r"a图片\刻\微信图片_20260613131330_43_1.png"),
            source_f(r"a图片\木板年画\微信图片_20260613141349_49_366.png"),
            source_f(r"a图片\绣漫画\微信图片_20260613135629_25_366.png"),
            source_f(r"a图片\陶艺漫画\微信图片_20260613140519_41_366.png"),
            source_f(r"a图片\龙与世界\微信图片_20260613133016_10_366.png"),
        ],
        PALETTE["experiment"], PALETTE["experiment_accent"], "EXPERIMENT / VISUAL CULTURE",
        ["刺绣", "刻", "木板年画", "绣漫画", "陶艺漫画", "龙与世界"],
    )


def draw_field_chapter(book: PortfolioBook) -> None:
    book.section_cover("06", "FIELD PRACTICE", "真实协作让创作判断面对机构、对象与署名边界。", "所有职责只按原片片尾或申报材料呈现，不把团队成果误写为个人导演成果。", PALETTE["field"], PALETTE["field_accent"], still("fanjiagxiang/frame_00.jpg"))
    book.begin(PALETTE["field"], "FIELD PRACTICE / DOCUMENTARY", PALETTE["field_accent"])
    book.kicker("INSTITUTIONAL DOCUMENTARY / VERIFIED CREDITS", MARGIN, PAGE_H - 58)
    book.title("“共青团伙伴计划”纪录短片", MARGIN, PAGE_H - 92, 350, size=27)
    book.para("源文件名：反家乡纪录片 / 03'51\"", MARGIN, PAGE_H - 132, 380, size=8, leading=12, color=PALETTE["field_accent"], bold=True)
    book.para("原片片尾明确：出品、策划为共青团重庆市綦江区委员会；王陈鑫署名摄影、剪辑，其中摄影为共同署名。页面不扩写未出现的导演职责。", MARGIN, PAGE_H - 176, 340, size=9.2, leading=15.2, color=HexColor("#CDBCB5"))
    book.image_cover(still("fanjiagxiang/frame_00.jpg"), 420, 272, 372, 230, anchor_x=0.5)
    book.image_cover(still("fanjiagxiang/frame_01.jpg"), 420, 78, 180, 180, anchor_x=0.5)
    book.image_cover(still("fanjiagxiang/frame_02.jpg"), 612, 78, 180, 180, anchor_x=0.5)
    facts = [("03'51\"", "完整成片"), ("CAMERA", "摄影 / 共同署名"), ("EDIT", "剪辑 / 片尾署名")]
    for idx, (value, label) in enumerate(facts):
        x = MARGIN + idx * 116
        book.c.setFillColor(PALETTE["field_accent"])
        book.c.setFont(FONT_EN_BOLD, 16)
        book.c.drawString(x, 178, value)
        book.para(label, x, 164, 104, size=6.7, leading=9.5, color=HexColor("#B7A8A2"))
    book.kicker("CREDIT SOURCE", MARGIN, 111, size=6.1)
    book.para("职责依据原片 片尾 205-215 秒署名核验。", MARGIN, 94, 340, size=8, leading=12.5, color=HexColor("#A99892"))
    book.gallery_page(
        "商业短剧 / 现场档案",
        "F 盘保留商业短剧现场、平台与宣发影像；本页仅作为现场影像归档，不推断未写入材料的岗位与年份。",
        [
            source_f(r"红果短剧\11e8fb8e05bc174173afa724697a9f.JPG"),
            source_f(r"红果短剧\480a676c7b00b1f851b3821edece5b.JPG"),
            source_f(r"红果短剧\2457d7e8dc151cd07b499776e0f9ce.JPG"),
            source_f(r"红果短剧\f1ae24434fb77ed79867e00e1ac9cf.JPG"),
            source_f(r"红果短剧\61b32be1ff113773d573c6b8589cbf.JPG"),
            source_f(r"红果短剧\492cb56b3e2cd73d2f5597f5b2100e.JPG"),
        ],
        PALETTE["field"], PALETTE["field_accent"], "FIELD PRACTICE / COMMERCIAL SHORT DRAMA",
        ["开机仪式", "平台记录", "现场合影", "宣发物料", "成片截图", "杀青记录"],
    )


def build_work_index() -> list[dict]:
    """Build the archive only from verifiable F:/D: source material."""
    return [
        {"title": "崖佛不语，岁岁佑我", "category": "剧情短片", "scope": "约 05'00\"", "role": "个人成片归档"},
        {"title": "手电", "category": "剧情短片", "scope": "05'10\"", "role": "个人成片归档"},
        {"title": "通幽录·渝州篇", "category": "AI 系列剧", "scope": "7 集 / 60+ 分钟", "role": "AI 导演（首集分工表）"},
        {"title": "麦麦的魔法面包店", "category": "儿童奇幻系列", "scope": "15 集 / 30+ 分钟", "role": "系列成片与资产归档"},
        {"title": "禁言", "category": "剧情影像", "scope": "02'51\"", "role": "主创之一（申报表）"},
        {"title": "弃书库的守门人", "category": "实验影像", "scope": "4K 成片", "role": "成片归档"},
        {"title": "我最讨厌的人", "category": "剧情影像", "scope": "4K 成片", "role": "成片归档"},
        {"title": "热血山城", "category": "地域影像", "scope": "02'19\"", "role": "主创之一（申报表）"},
        {"title": "走马岗的来历", "category": "地域影像", "scope": "03'03\"", "role": "主创之一（申报表）"},
        {"title": "牧风", "category": "剧情影像", "scope": "4K 成片", "role": "成片归档"},
        {"title": "心动策划案", "category": "剧情短片", "scope": "完整成片", "role": "成片归档"},
        {"title": "峡砚", "category": "纪录片", "scope": "03'35\" / 多版本", "role": "主创（申报表）"},
        {"title": "豆晕", "category": "纪录片", "scope": "4K 成片", "role": "成片归档"},
        {"title": "冬等", "category": "纪录片", "scope": "成片 + 原始素材", "role": "项目归档"},
        {"title": "“共青团伙伴计划”纪录短片", "category": "合作纪录", "scope": "03'51\"", "role": "摄影 / 剪辑（片尾）"},
        {"title": "刺绣 · 动态影像", "category": "非遗影像", "scope": "3 段原片", "role": "动态影像归档"},
        {"title": "非遗版画 · 动态影像", "category": "非遗影像", "scope": "6 段原片", "role": "动态影像归档"},
        {"title": "城市、自然与人物观察", "category": "摄影", "scope": "原始摄影档案", "role": "摄影 / 视觉观察"},
        {"title": "刺绣视觉组", "category": "非遗平面", "scope": "3 幅", "role": "视觉创作"},
        {"title": "刻 · 视觉组", "category": "非遗平面", "scope": "3 幅", "role": "视觉创作"},
        {"title": "木板年画视觉组", "category": "非遗平面", "scope": "10 幅", "role": "视觉创作"},
        {"title": "绣漫画", "category": "漫画实验", "scope": "10 幅", "role": "视觉创作"},
        {"title": "陶艺视觉组", "category": "非遗平面", "scope": "3 幅", "role": "视觉创作"},
        {"title": "陶艺漫画", "category": "漫画实验", "scope": "10 幅", "role": "视觉创作"},
        {"title": "龙 · 视觉组", "category": "文化视觉", "scope": "原始图组", "role": "视觉创作"},
        {"title": "龙与世界", "category": "文化视觉", "scope": "10 幅", "role": "视觉创作"},
        {"title": "非遗宣传展板", "category": "平面系统", "scope": "6 幅", "role": "视觉设计"},
        {"title": "两块门牌", "category": "原创剧本", "scope": "12 集", "role": "主创（申报表）"},
        {"title": "合味", "category": "原创剧本", "scope": "12 集", "role": "主创（申报表）"},
        {"title": "山城换挡", "category": "原创剧本", "scope": "12 集", "role": "本人原创声明"},
        {"title": "山那边的课表", "category": "原创剧本", "scope": "12 集", "role": "主创（申报表）"},
        {"title": "江水记得", "category": "原创网络电影剧本", "scope": "约 60 分钟", "role": "主创（申报表）"},
        {"title": "红果短剧项目", "category": "商业短剧", "scope": "多项目现场影像", "role": "现场影像归档"},
    ]


def draw_profile(book: PortfolioBook, works: list[dict]) -> None:
    book.begin(PALETTE["prelude"], "PROFILE / TIMELINE", PALETTE["directing_accent"])
    book.kicker("VERIFIED CREATIVE RECORD", MARGIN, PAGE_H - 58)
    book.title("创作职责与署名脉络", MARGIN, PAGE_H - 90, 430, size=29)
    timeline = [
        ("AI SERIES", "《通幽录·渝州篇》", "AI 导演", "首集团队分工表明确署名；7 集成片累计 60+ 分钟。"),
        ("DOCUMENTARY", "“共青团伙伴计划”纪录短片", "摄影 / 剪辑", "片尾署名核验；出品、策划为共青团重庆市綦江区委员会。"),
        ("PROGRAM", "《峡砚》", "主创", "节目申报表列王陈鑫为主创；成片 03'35\"。"),
        ("CO-CREATE", "《禁言》《热血山城》《走马岗的来历》", "主创之一", "按三份节目申报表呈现团队主创关系，不改写为个人独立成果。"),
        ("WRITING", "五部原创剧本档案", "原创编剧 / 主创", "4 份申报表列王陈鑫为主创；《山城换挡》按本人原创声明收录。"),
    ]
    x_line = 192
    book.c.setStrokeColor(Color(PALETTE["directing_accent"].red, PALETTE["directing_accent"].green, PALETTE["directing_accent"].blue, alpha=0.45))
    book.c.setLineWidth(1)
    book.c.line(x_line, 96, x_line, 445)
    for idx, (year, title, role, text) in enumerate(timeline):
        y = 422 - idx * 72
        book.c.setFillColor(PALETTE["directing_accent"])
        book.c.circle(x_line, y + 3, 4, fill=1, stroke=0)
        book.c.setFont(FONT_EN_BOLD, 8)
        book.c.drawRightString(x_line - 18, y, year)
        book.para(title, x_line + 24, y + 12, 270, size=11.5, leading=14, bold=True)
        book.kicker(role, x_line + 315, y + 4, size=6.1)
        book.para(text, x_line + 315, y - 9, 270, size=7.5, leading=11.5, color=HexColor("#9FB0BB"))
    book.kicker("SOURCE POLICY", MARGIN, 69, size=6.2)
    book.para("本页只写入 F 盘 / D 盘原片、团队分工表、片尾署名与申报表可核验的职责。", MARGIN, 53, 650, size=9, leading=14, color=PALETTE["paper"], bold=True)

    flat = works
    for page_index, subset in enumerate((flat[:20], flat[20:])):
        book.begin(PALETTE["prelude"], "PROFILE / COMPLETE INDEX", PALETTE["directing_accent"])
        book.kicker(f"COMPLETE WORK INDEX / 0{page_index + 1}", MARGIN, PAGE_H - 58)
        book.title("完整创作档案", MARGIN, PAGE_H - 90, 430, size=28)
        book.para(f"从 F 盘与 D 盘原始作品目录核验并整理 {len(works)} 项创作档案。索引保留项目、类别、体量与职责；代表作已在前文展开。", 454, PAGE_H - 91, 338, size=7.7, leading=12.2, color=HexColor("#9FB0BB"))
        col_w = 360
        for idx, work in enumerate(subset):
            col = 0 if idx < math.ceil(len(subset) / 2) else 1
            row = idx if col == 0 else idx - math.ceil(len(subset) / 2)
            x = MARGIN + col * 382
            y = 450 - row * 36
            book.rule(x, y - 11, col_w, color=Color(0.55, 0.7, 0.8, alpha=0.12), width=0.4)
            book.kicker(f"{page_index * 20 + idx + 1:02d}", x, y, size=5.4)
            book.para(work["title"], x + 28, y + 7, 190, size=8.1, leading=10.5, bold=True)
            book.para(f"{work['category']} / {work['scope']} / {work['role']}", x + 220, y + 6, 138, size=5.9, leading=8.2, color=HexColor("#889BA8"))

    book.begin(PALETTE["prelude"], "PROFILE / CREDIT TRACE", PALETTE["directing_accent"])
    book.kicker("CREDIT TRACE / SOURCE-BOUND INFORMATION", MARGIN, PAGE_H - 58)
    book.title("署名依据", MARGIN, PAGE_H - 90, 430, size=29)
    recognitions = [
        ("TEAM SHEET", "《通幽录》第一集 / AI 导演", "依据第一集项目交付包中的团队分工表。"),
        ("END CREDITS", "“共青团伙伴计划” / 摄影、剪辑", "依据《反家乡纪录片》片尾 205-215 秒署名。"),
        ("FORMS", "《峡砚》《禁言》《热血山城》《走马岗的来历》", "依据 D 盘节目类投递申报表，分别标注主创或主创之一。"),
    ]
    for idx, (year, title, note) in enumerate(recognitions):
        y = 382 - idx * 112
        book.c.setFillColor(Color(PALETTE["directing_accent"].red, PALETTE["directing_accent"].green, PALETTE["directing_accent"].blue, alpha=0.085))
        book.c.roundRect(MARGIN, y, PAGE_W - MARGIN * 2, 90, 6, fill=1, stroke=0)
        book.kicker(year, MARGIN + 18, y + 62, size=6.1)
        book.para(title, MARGIN + 128, y + 71, 360, size=13, leading=17, bold=True)
        book.para(note, MARGIN + 510, y + 68, 240, size=7.1, leading=11.2, color=HexColor("#96A8B4"))


def draw_contact_and_closing(book: PortfolioBook) -> None:
    book.begin(PALETTE["prelude"], "CONTACT", PALETTE["directing_accent"])
    book.kicker("CONTACT / OWNER CONFIRMATION REQUIRED", MARGIN, PAGE_H - 58)
    book.title("故事已经开始。", MARGIN, PAGE_H - 110, 450, size=42)
    book.title("下一镜，一起完成。", MARGIN, PAGE_H - 170, 450, size=31, color=PALETTE["directing_accent"])
    book.para("原创剧本 / 剧情短片 / AI 系列剧 / 纪录影像", MARGIN, PAGE_H - 230, 420, size=9, leading=14, color=HexColor("#9FB0BB"))
    book.rule(MARGIN, 280, 420)
    book.kicker("PUBLIC CONTACT", MARGIN, 244, size=6.4)
    book.para("联系方式将在本人确认后开放", MARGIN, 226, 370, size=15, leading=19, bold=True)
    book.kicker("RELEASE CHECK", MARGIN, 170, size=6.4)
    book.para("正式提交前补充可公开邮箱或微信，以及作品集二维码链接。", MARGIN, 152, 370, size=9, leading=14, color=HexColor("#B8C5CD"))
    book.c.setFillColor(Color(PALETTE["directing_accent"].red, PALETTE["directing_accent"].green, PALETTE["directing_accent"].blue, alpha=0.09))
    book.c.roundRect(520, 128, 272, 304, 9, fill=1, stroke=0)
    book.kicker("DIRECTOR PORTRAIT", 548, 392, size=6.5)
    book.c.setFillColor(PALETTE["paper"])
    book.c.setStrokeColor(Color(PALETTE["directing_accent"].red, PALETTE["directing_accent"].green, PALETTE["directing_accent"].blue, alpha=0.48))
    book.c.setDash(4, 4)
    book.c.rect(548, 190, 216, 174, fill=0, stroke=1)
    book.c.setDash()
    book.c.setFont(FONT_EN_BOLD, 19)
    book.c.drawCentredString(656, 286, "AUTHOR")
    book.c.drawCentredString(656, 260, "ON SET")
    book.para("待本人提供片场、摄影机旁或剪辑室肖像后替换。", 568, 226, 176, size=7.5, leading=11.5, color=HexColor("#9FB0BB"), align=TA_LEFT)
    book.para("不使用陌生人物或未经确认的照片。", 548, 168, 216, size=7.2, leading=11, color=HexColor("#8797A1"))

    book.begin(PALETTE["prelude"], "CLOSING", PALETTE["directing_accent"], footer=False)
    book.image_cover(still("shoudian/frame_06.jpg"), 0, 0, PAGE_W, PAGE_H, anchor_x=0.55, dim=0.56)
    book.c.setFillColor(Color(PALETTE["prelude"].red, PALETTE["prelude"].green, PALETTE["prelude"].blue, alpha=0.67))
    book.c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    book.kicker("FINAL FRAME / 2026", MARGIN, PAGE_H - 58)
    book.c.setFillColor(PALETTE["paper"])
    book.c.setFont(FONT_EN_BOLD, 44)
    book.c.drawCentredString(PAGE_W / 2, 322, "DIRECT FROM MOTIVE.")
    book.title("让每一个镜头，都能回答人物为什么行动。", 170, 270, PAGE_W - 340, size=22, color=PALETTE["directing_accent"])
    book.c.setFont(FONT_CN_BOLD, 18)
    book.c.setFillColor(PALETTE["paper"])
    book.c.drawCentredString(PAGE_W / 2, 142, "王陈鑫")
    book.c.setFont(FONT_EN_NARROW, 8)
    book.c.drawCentredString(PAGE_W / 2, 123, "WANG CHENXIN / AUTHOR-DIRECTOR")


def main() -> None:
    register_fonts()
    works = build_work_index()
    book = PortfolioBook(OUTPUT_PDF)
    draw_cover(book)
    draw_manifesto(book)
    draw_method(book)
    draw_contents(book)
    book.section_cover("01", "DIRECTING", "从人物动机出发，建立可以被执行的镜头。", "四个项目共享判断框架，但分别突出意象、光线、世界观与系列机制。", PALETTE["directing"], PALETTE["directing_accent"], still("shoudian/frame_04.jpg"))
    for project in build_projects():
        book.project_cover(project)
        book.project_intent(project)
        book.project_structure(project)
        book.project_visual(project)
        book.project_outcome(project)
    draw_writing_chapter(book)
    draw_ai_chapter(book)
    draw_experiment_chapter(book)
    draw_photo_chapter(book)
    draw_field_chapter(book)
    draw_profile(book, works)
    draw_contact_and_closing(book)
    book.finish()
    print(f"Created {OUTPUT_PDF}")
    print(f"Pages: {book.page}")


if __name__ == "__main__":
    main()
