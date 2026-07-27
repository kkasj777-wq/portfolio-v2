# Hallmark - genre: editorial - macrostructure: Photographic with Long Document / Catalogue inserts
# Hallmark - pre-emit critique: P5 H5 E4 S5 R4 V5
from __future__ import annotations

import csv
import importlib.util
from pathlib import Path

from reportlab.lib.colors import Color, HexColor
from reportlab.lib.enums import TA_CENTER
from reportlab.pdfbase import pdfmetrics


ROOT = Path(__file__).resolve().parents[1]
V6_PATH = ROOT / "scripts" / "generate-director-portfolio-v6.py"
SPEC = importlib.util.spec_from_file_location("portfolio_v6_base", V6_PATH)
if SPEC is None or SPEC.loader is None:
    raise RuntimeError(f"Cannot load base generator: {V6_PATH}")
base = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(base)


OUTPUT = ROOT / "output" / "pdf" / "Wang-Chenxin-Author-Director-Portfolio-2026-V7.pdf"
ASSETS = ROOT / "assets" / "portfolio-v7"
CACHE = ROOT / "tmp" / "pdfs" / "optimized-assets-v7"
base.CACHE = CACHE

PAGE_W, PAGE_H = base.PAGE_W, base.PAGE_H
M = 38

# PDF equivalents of the locked OKLCH tokens in design.md.
NIGHT = HexColor("#11151A")
NIGHT_2 = HexColor("#1A2026")
PAPER = HexColor("#F2EFE8")
PAPER_2 = HexColor("#E7E3DA")
INK = HexColor("#1B222A")
INK_2 = HexColor("#39444D")
SILVER = HexColor("#909BA3")
RULE = HexColor("#C9CED0")
SIGNAL = HexColor("#B8443D")
ICE = HexColor("#D7E5E9")
WHITE = HexColor("#F7F5EF")
MAIMAI_BLUE = HexColor("#616EDE")
MAIMAI_PINK = HexColor("#E896B4")
MAIMAI_YELLOW = HexColor("#E8C15D")

SERIF = base.SERIF
SANS = base.SANS
SANS_MED = base.SANS_MED
INTER = base.INTER
INTER_MED = base.INTER_MED
INTER_SEMI = base.INTER_SEMI


def a(color: Color, opacity: float) -> Color:
    return Color(color.red, color.green, color.blue, alpha=opacity)


def asset(name: str) -> Path:
    path = ASSETS / name
    if not path.exists():
        raise FileNotFoundError(path)
    return path


def display(book: base.Book, text: str, x: float, y: float, size: float, color: Color = INK) -> None:
    book.c.saveState()
    book.c.setFillColor(color)
    book.c.setFont(SERIF, size)
    book.c.drawString(x, y, text)
    book.c.restoreState()


def roman(book: base.Book, text: str, x: float, y: float, size: float, color: Color = INK, tracking: float = 0) -> None:
    book.c.saveState()
    book.c.setFillColor(color)
    book.c.setFont(INTER_SEMI, size)
    obj = book.c.beginText(x, y)
    obj.setCharSpace(tracking)
    obj.textLine(text)
    book.c.drawText(obj)
    book.c.restoreState()


def folio(book: base.Book, dark: bool = False) -> None:
    color = a(WHITE, 0.62) if dark else SILVER
    x = M if book.page % 2 == 0 else PAGE_W - M
    book.c.saveState()
    book.c.setFillColor(color)
    book.c.setFont(INTER_MED, 6.5)
    if book.page % 2 == 0:
        book.c.drawString(x, 20, f"{book.page:02d}")
    else:
        book.c.drawRightString(x, 20, f"{book.page:02d}")
    book.c.restoreState()


def small_rule(book: base.Book, x: float, y: float, width: float, color: Color = RULE) -> None:
    book.line(x, y, x + width, y, color, 0.45)


def caption(book: base.Book, text: str, x: float, top: float, width: float, dark: bool = False) -> None:
    book.para(text, x, top, width, 7.2, 10.8, a(WHITE, 0.88) if dark else INK_2, SANS)


def cover_and_identity(book: base.Book) -> None:
    # P01 - a film poster, not a portfolio template.
    book.new(NIGHT, "COVER")
    book.full_bleed(asset("shou_202s.jpg"), dim=0.12, anchor_x=0.47, anchor_y=0.52)
    book.c.setFillColor(a(NIGHT, 0.54))
    book.c.rect(0, 0, PAGE_W, 260, fill=1, stroke=0)
    roman(book, "WANG", 38, 122, 32, WHITE, -1.0)
    roman(book, "CHENXIN", 38, 86, 32, WHITE, -1.0)
    small_rule(book, 38, 66, 210, a(ICE, 0.58))
    roman(book, "AUTHOR-DIRECTOR / SCREENWRITER", 38, 48, 6.3, ICE, 1.05)

    # P02 - a colophon with no resume card and no portrait.
    book.new(PAPER, "POSITION")
    roman(book, "2026", M, PAGE_H - 42, 7, SIGNAL, 1.2)
    display(book, "作者不在镜头之外", M, 620, 29, INK)
    book.para(
        "我先决定人物为什么行动，再决定镜头如何移动。剧本、分镜、现场、生成与剪辑，都是同一条导演判断链上的不同阶段。",
        M,
        565,
        330,
        10.2,
        17,
        INK_2,
        SANS,
    )
    book.image_cover(asset("yafo_142s.jpg"), 384, 316, 211, 328, anchor_x=0.58, anchor_y=0.45, dim=0)
    roman(book, "DIRECTING", M, 314, 7, INK, 0.8)
    roman(book, "SCREENWRITING", M, 282, 7, INK, 0.8)
    roman(book, "WORLD BUILDING", M, 250, 7, INK, 0.8)
    roman(book, "VISUAL THINKING", M, 218, 7, INK, 0.8)
    small_rule(book, M, 188, 268, RULE)
    caption(book, "Wang Chenxin / 王陈鑫", M, 162, 260)
    folio(book)

    # P03 - manifesto as authored prose, anchored by a physical image trace.
    book.new(NIGHT, "MANIFESTO")
    book.image_cover(asset("yafo_116s.jpg"), 354, 0, 241, PAGE_H, anchor_x=0.42, anchor_y=0.55, dim=0.42)
    roman(book, "DIRECTOR'S POSITION", M, PAGE_H - 44, 6.2, ICE, 1.25)
    display(book, "先问人物", M, 640, 33, WHITE)
    display(book, "再问镜头", M, 600, 33, WHITE)
    book.para(
        "人物的愿望、代价与沉默，决定空间如何被看见。镜头不是漂亮画面的集合，而是观众被允许知道什么、何时知道，以及为何在这一刻靠近。",
        M,
        520,
        268,
        10,
        17,
        a(WHITE, 0.82),
        SANS,
    )
    book.para("剧本写行动。导演组织观看。剪辑留下后果。", M, 202, 250, 12, 19, ICE, SANS_MED)
    folio(book, True)

    # P04 - an editorial contents strip, not four cards.
    book.new(PAPER, "INDEX")
    display(book, "四部作品", M, 710, 26, INK)
    display(book, "四种导演判断", 242, 710, 26, INK)
    book.para("前十页先建立作者身份；之后让制作证据进入画面。", M, 664, 350, 8.4, 13, SILVER, SANS)
    works = [
        (asset("yafo_172s.jpg"), "崖佛不语，岁岁佑我", "石刻 / 时间 / 记忆"),
        (asset("shou_176s.jpg"), "手电", "黑暗 / 光束 / 父子"),
        (asset("tongyoulu_ep01.jpg"), "通幽录·渝州篇", "世界 / 分镜 / 连续生产"),
        (asset("m9_11_102.3s.jpg"), "麦麦的魔法面包店", "单元 / 选择 / 色彩"),
    ]
    y = 516
    heights = [118, 132, 110, 132]
    for index, (image, title, note) in enumerate(works):
        h = heights[index]
        x = 0 if index % 2 == 0 else 174
        w = 320 if index % 2 == 0 else 421
        book.image_cover(image, x, y, w, h, anchor_x=0.5, anchor_y=0.5, dim=0.08)
        book.c.setFillColor(a(NIGHT, 0.48))
        book.c.rect(x, y, w, 34, fill=1, stroke=0)
        book.para(title, x + 18, y + 27, w - 36, 10.2, 13, WHITE, SANS_MED)
        book.para(note, x + 18, y + 19, w - 36, 6.4, 8.6, a(WHITE, 0.82), SANS_MED)
        y -= h + 10
    folio(book)


def yafobuyu(book: base.Book) -> None:
    # P05-06 - uninterrupted stone-and-memory spread.
    hero = asset("yafo_172s.jpg")
    book.new(NIGHT, "YAFO")
    book.spread_half(hero, "left", dim=0.04, anchor_x=0.5, anchor_y=0.5)
    book.bottom_fade(190, 0.55)
    display(book, "崖佛", M, 74, 35, WHITE)
    caption(book, "石刻不是背景，而是人物记忆的空间。", M, 48, 240, True)

    book.new(NIGHT, "YAFO")
    book.spread_half(hero, "right", dim=0.04, anchor_x=0.5, anchor_y=0.5)
    book.bottom_fade(190, 0.55)
    display(book, "不语", 138, 74, 32, WHITE)
    display(book, "岁岁佑我", 258, 74, 32, WHITE)
    roman(book, "DIRECTOR / SCREENWRITER", 142, 42, 6.1, ICE, 1.0)

    # P07 - one director note, image-led and quiet.
    book.new(PAPER, "YAFO / NOTE")
    book.image_cover(asset("yafo_104s.jpg"), 0, 286, 366, 556, anchor_x=0.55, anchor_y=0.5, dim=0)
    display(book, "把时间留在石头上", 396, 704, 20, INK)
    book.para(
        "我没有把大足石刻当作地域标签。人物每次回到石刻前，空间都承担不同的情绪重量：童年是庇护，成年是距离，归来才成为重新理解守护的入口。",
        396,
        646,
        150,
        8.8,
        15,
        INK_2,
        SANS,
    )
    small_rule(book, 396, 458, 148, SIGNAL)
    caption(book, "导演判断：让同一空间在三次返回中改变意义。", 396, 438, 148)
    caption(book, "人物关系：减少对白，让站位、距离与回望完成解释。", 396, 356, 148)
    folio(book)

    # P08 - a still allowed to stand without a slogan.
    book.new(NIGHT, "YAFO / STILL")
    book.full_bleed(asset("yafo_142s.jpg"), dim=0.03, anchor_x=0.5, anchor_y=0.5)
    book.c.setFillColor(a(NIGHT, 0.48))
    book.c.rect(0, 0, PAGE_W, 76, fill=1, stroke=0)
    caption(book, "雨后。人物第一次不再向石刻索取答案。", M, 52, 330, True)
    folio(book, True)

    # P09 - motifs as editorial plates, not equal cards.
    book.new(PAPER_2, "YAFO / MOTIFS")
    roman(book, "THREE MOTIFS", M, PAGE_H - 42, 6.2, SIGNAL, 1.2)
    book.image_cover(asset("yafo_112s.jpg"), 0, 396, 206, 356, anchor_x=0.58, anchor_y=0.48, dim=0)
    book.image_cover(asset("yafo_116s.jpg"), 196, 162, 245, 438, anchor_x=0.52, anchor_y=0.48, dim=0)
    book.image_cover(asset("yafo_163s.jpg"), 430, 304, 165, 288, anchor_x=0.55, anchor_y=0.48, dim=0)
    display(book, "石", M, 328, 21, INK)
    caption(book, "时间的表面。", M, 300, 100)
    display(book, "雨", 454, 248, 21, INK)
    caption(book, "记忆重新显影。", 454, 220, 105)
    display(book, "物", 220, 118, 21, INK)
    caption(book, "苹果把守护落回动作。", 220, 88, 180)
    folio(book)

    # P10 - return.
    book.new(NIGHT, "YAFO / RETURN")
    book.full_bleed(asset("yafo-hq_02_00m39s.jpg"), dim=0.09, anchor_x=0.5, anchor_y=0.48)
    book.bottom_fade(230, 0.68)
    display(book, "不用对白解释父子关系", M, 106, 25, WHITE)
    caption(book, "让人物共享同一段路，而不是共享一段说明。", M, 68, 310, True)
    folio(book, True)


def shoudian(book: base.Book) -> None:
    # P11 - darkness is the page architecture.
    book.new(NIGHT, "SHOU DIAN")
    book.full_bleed(asset("shou_000s.jpg"), dim=0.42, anchor_x=0.5, anchor_y=0.5)
    book.beam((292, 670), 0, 150)
    roman(book, "02", M, PAGE_H - 42, 7, ICE, 1.3)
    display(book, "手电", M, 108, 38, WHITE)
    caption(book, "让光替人物说话。", M, 70, 240, True)

    # P12 - the partner page begins with the visible consequence of the beam.
    book.new(NIGHT, "SHOU DIAN")
    book.full_bleed(asset("shou_196s.jpg"), dim=0.08, anchor_x=0.5, anchor_y=0.5)
    book.c.setFillColor(a(NIGHT, 0.64))
    book.c.rect(0, 0, 220, PAGE_H, fill=1, stroke=0)
    display(book, "光规定", M, 676, 28, WHITE)
    display(book, "观众先看见什么", M, 638, 22, WHITE)
    book.para("父子关系不靠解释推进。窄光先选择物，再选择人，最后让彼此进入同一片亮处。", M, 562, 150, 8.9, 15, ICE, SANS)
    folio(book, True)

    # P13 - a sequence cut like film strips, not a dashboard.
    book.new(NIGHT_2, "SHOU DIAN / SEQUENCE")
    frames = [
        (asset("shou_176s.jpg"), "04:33", "光第一次越过门槛"),
        (asset("shou_210s.jpg"), "03:30", "视线被迫靠近"),
        (asset("shou_220s.jpg"), "03:40", "人物进入同一亮处"),
    ]
    x_positions = [0, 184, 392]
    widths = [205, 230, 203]
    for (image, timecode, note), x, width in zip(frames, x_positions, widths):
        book.image_cover(image, x, 180, width, 540, anchor_x=0.5, anchor_y=0.5, dim=0.06)
        book.c.setFillColor(a(NIGHT, 0.64))
        book.c.rect(x, 180, width, 72, fill=1, stroke=0)
        roman(book, timecode, x + 16, 225, 7, ICE, 0.8)
        caption(book, note, x + 16, 211, width - 32, True)
    roman(book, "LIGHT SEQUENCE / THREE DECISIONS", M, 108, 6.2, SILVER, 1.15)
    folio(book, True)

    # P14 - emotional return, full image.
    book.new(NIGHT, "SHOU DIAN / RETURN")
    book.full_bleed(asset("shou_176s.jpg"), dim=0.08, anchor_x=0.5, anchor_y=0.5)
    book.bottom_fade(230, 0.6)
    display(book, "当光照回彼此", M, 102, 28, WHITE)
    caption(book, "父子关系才真正开始。", M, 64, 220, True)
    folio(book, True)


def tongyoulu(book: base.Book) -> None:
    hero = asset("tongyoulu_ep01.jpg")
    # P15-16 - world opening as one cinematic spread.
    book.new(NIGHT, "TONGYOULU")
    book.spread_half(hero, "left", dim=0.08, anchor_x=0.5, anchor_y=0.5)
    book.bottom_fade(210, 0.62)
    display(book, "通幽录", M, 84, 34, WHITE)
    roman(book, "YUZHOU CHAPTER", M, 50, 6.2, ICE, 1.15)

    book.new(NIGHT, "TONGYOULU")
    book.spread_half(hero, "right", dim=0.08, anchor_x=0.5, anchor_y=0.5)
    book.bottom_fade(210, 0.62)
    display(book, "渝州篇", 332, 84, 32, WHITE)
    caption(book, "世界规则先于奇观。", 332, 52, 200, True)

    # P17 - seven episodes as a production contact sheet.
    book.new(PAPER, "TONGYOULU / EPISODES")
    display(book, "七个单元", M, 734, 25, INK)
    display(book, "一套连续世界", 260, 734, 25, INK)
    episodes = [
        ("01", "浮生无迹·归乡逢幽", asset("tongyoulu_ep01.jpg")),
        ("02", "渝州巷年", asset("tongyoulu_ep02.jpg")),
        ("03", "江畔古楼", asset("tongyoulu_ep03.jpg")),
        ("04", "黄桷渡·燃茶案", asset("tongyoulu_ep04.jpg")),
        ("05", "傀灵寄忆", asset("tongyoulu_ep05.jpg")),
        ("06", "黄桷渡·忌渡", asset("tongyoulu_ep06.jpg")),
        ("07", "南山旧约", asset("tongyoulu_ep07.jpg")),
    ]
    positions = [(0, 500, 270, 180), (276, 500, 319, 180), (0, 310, 185, 180), (191, 310, 230, 180), (427, 310, 168, 180), (0, 120, 319, 180), (325, 120, 270, 180)]
    for (no, title, image), (x, y, w, h) in zip(episodes, positions):
        book.image_cover(image, x, y, w, h, anchor_x=0.5, anchor_y=0.5, dim=0.06)
        # Opaque caption band removes any source-platform marks from the frame edge.
        book.c.setFillColor(NIGHT)
        book.c.rect(x, y, w, 34, fill=1, stroke=0)
        roman(book, no, x + 12, y + 21, 6, WHITE, 0.8)
        book.para(title, x + 42, y + 27, w - 54, 7.2, 9.5, WHITE, SANS_MED)
    caption(book, "7 集 / 60+ 分钟。单元故事独立完成愿望，连续线索逐层逼近被抹去的真相。", M, 80, 500)
    folio(book)

    # P18 - storyboard evidence on paper.
    storyboard_dir = base.DELIVERY / "4分镜头脚本" / "4.2图示分镜头" / "回家分镜"
    book.new(PAPER_2, "TONGYOULU / STORYBOARD")
    roman(book, "WORKING ARCHIVE", M, PAGE_H - 42, 6.2, SIGNAL, 1.2)
    display(book, "镜头在生成之前已经发生", M, 716, 24, INK)
    book.image_contain(base.checked(storyboard_dir / "到家1.png"), 24, 292, 546, 360, PAPER_2)
    book.image_contain(base.checked(storyboard_dir / "回忆1.png"), 214, 78, 356, 194, PAPER_2)
    roman(book, "BLOCKING", M, 236, 6, SIGNAL, 1.0)
    caption(book, "先固定人物站位。", M, 218, 140)
    roman(book, "SCALE", M, 174, 6, SIGNAL, 1.0)
    caption(book, "再决定空间尺度。", M, 156, 140)
    roman(book, "DIRECTION", M, 112, 6, SIGNAL, 1.0)
    caption(book, "动作方向进入生成指令。", M, 94, 160)
    folio(book)

    # P19 - continuity as an archive table without equal cards.
    character = base.DELIVERY / "5数字资产库" / "5.1角色" / "林砚.png"
    scene = base.DELIVERY / "5数字资产库" / "5.2场景" / "老家房屋.png"
    prop = base.DELIVERY / "5数字资产库" / "5.3道具" / "高调版本通幽录.png"
    book.new(NIGHT_2, "TONGYOULU / ASSETS")
    display(book, "连续性不是运气", M, 728, 27, WHITE)
    caption(book, "角色、场景、关键道具被重复调用，维持七集的识别与空间关系。", M, 688, 420, True)
    book.image_contain(base.checked(character), 20, 76, 190, 520, NIGHT_2)
    book.image_cover(base.checked(scene), 204, 364, 391, 232, anchor_x=0.54, anchor_y=0.5, dim=0.02)
    book.image_contain(base.checked(prop), 348, 76, 247, 248, NIGHT_2)
    book.c.setFillColor(NIGHT)
    book.c.rect(486, 364, 109, 30, fill=1, stroke=0)
    book.c.rect(458, 76, 137, 30, fill=1, stroke=0)
    roman(book, "CHARACTER", 28, 54, 5.8, ICE, 0.9)
    roman(book, "SCENE", 216, 342, 5.8, ICE, 0.9)
    roman(book, "PROP", 360, 54, 5.8, ICE, 0.9)
    folio(book, True)

    # P20 - production record. One number, four real rows, no KPI dashboard.
    csv_path = base.DELIVERY / "6全套提示词" / "通幽录第一集_可灵AI视频指令表_176镜头.csv"
    with csv_path.open("r", encoding="utf-8-sig", newline="") as handle:
        rows = list(csv.DictReader(handle))
    samples = [rows[0], rows[min(42, len(rows) - 1)], rows[min(101, len(rows) - 1)], rows[-1]]
    book.new(NIGHT, "TONGYOULU / DIRECTIONS")
    roman(book, "176", M, 658, 80, ICE, -2.5)
    roman(book, "SHOT DIRECTIONS / EPISODE 01", 278, 680, 6.2, SILVER, 1.0)
    caption(book, "景别 / 机位 / 动作 / 站位 / 光影 / 声音 / 资产", 278, 656, 260, True)
    y = 540
    for row in samples:
        no = (row.get("镜号") or "").strip()
        shot = (row.get("景别") or "").strip()
        move = (row.get("运镜方式") or "").strip()
        action = (row.get("动作顺序") or "").strip().replace("\n", " ")
        if len(action) > 82:
            action = action[:82] + "…"
        roman(book, f"SHOT {no}", M, y, 6.2, ICE, 0.55)
        book.para(f"{shot} / {move}", M + 74, y + 9, 290, 7, 9.5, ICE, SANS_MED)
        caption(book, action, M, y - 18, 500, True)
        small_rule(book, M, y - 68, 510, a(ICE, 0.24))
        y -= 112
    roman(book, "SOURCE / 176-SHOT CSV", M, 38, 5.6, SILVER, 0.8)
    folio(book, True)

    # P21 - series proof as three uninterrupted bands.
    book.new(NIGHT, "TONGYOULU / SERIES")
    book.image_cover(asset("tongyoulu_ep03.jpg"), 0, 540, PAGE_W, 302, anchor_x=0.5, anchor_y=0.5, dim=0.08)
    book.image_cover(asset("tongyoulu_ep04.jpg"), 0, 260, PAGE_W, 280, anchor_x=0.5, anchor_y=0.5, dim=0.1)
    book.image_cover(asset("tongyoulu_ep07.jpg"), 0, 0, PAGE_W, 260, anchor_x=0.5, anchor_y=0.5, dim=0.12)
    book.c.setFillColor(a(NIGHT, 0.42))
    book.c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    display(book, "七集不是数量", M, 104, 28, WHITE)
    display(book, "而是连续性被证明", M, 68, 24, WHITE)
    folio(book, True)


def maimai(book: base.Book) -> None:
    hero = asset("m9_11_102.3s.jpg")
    # P22-23 - the book's deliberate colour burst comes from the film.
    book.new(NIGHT, "MAIMAI")
    book.spread_half(hero, "left", dim=0.02, anchor_x=0.5, anchor_y=0.5)
    book.bottom_fade(220, 0.46)
    display(book, "麦麦的", M, 86, 34, WHITE)
    roman(book, "15 EPISODES", M, 52, 6.2, MAIMAI_YELLOW, 1.1)

    book.new(NIGHT, "MAIMAI")
    book.spread_half(hero, "right", dim=0.02, anchor_x=0.5, anchor_y=0.5)
    book.bottom_fade(220, 0.46)
    display(book, "魔法面包店", 272, 86, 31, WHITE)
    caption(book, "一个面包 / 一次选择", 274, 52, 240, True)

    # P24 - episode variation contact sheet; colour stays in images.
    book.new(PAPER, "MAIMAI / EPISODES")
    display(book, "重复机制", M, 730, 25, INK)
    display(book, "不重复视觉答案", 242, 730, 25, INK)
    frames = [asset("maimai_ep01.jpg"), asset("m6_05_042.8s.jpg"), asset("m6_11_090.0s.jpg"), asset("m15_10_077.8s.jpg")]
    positions = [(0, 438, 280, 224), (288, 438, 307, 224), (0, 158, 354, 266), (362, 158, 233, 266)]
    for image, (x, y, w, h) in zip(frames, positions):
        book.image_cover(image, x, y, w, h, anchor_x=0.5, anchor_y=0.5, dim=0)
    roman(book, "QUESTION", M, 112, 6, MAIMAI_BLUE, 1.0)
    roman(book, "MAGIC", 156, 112, 6, MAIMAI_PINK, 1.0)
    roman(book, "CHOICE", 258, 112, 6, MAIMAI_YELLOW, 1.0)
    caption(book, "共同的店铺与角色建立安全感；能力、空间和冲突为每一集保留独立命题。", M, 90, 500)
    folio(book)

    # P25 - real iteration evidence.
    asset_dir = base.SOURCE_F / "麦麦的面包店" / "麦麦的面包店" / "资产"
    iteration_a = base.first(asset_dir, "*4172*.png")
    iteration_b = base.first(asset_dir, "*4485*.png")
    book.new(PAPER_2, "MAIMAI / ITERATION")
    roman(book, "SPACE AS STORY", M, PAGE_H - 42, 6.2, MAIMAI_BLUE, 1.15)
    display(book, "空间修改", M, 720, 24, INK)
    display(book, "行动代价", 246, 720, 24, INK)
    book.image_cover(iteration_a, 0, 170, 309, 470, anchor_x=0.5, anchor_y=0.5, dim=0)
    book.image_cover(iteration_b, 286, 170, 309, 470, anchor_x=0.5, anchor_y=0.5, dim=0)
    book.c.setStrokeColor(MAIMAI_YELLOW)
    book.c.setLineWidth(1.2)
    book.c.line(298, 170, 298, 640)
    roman(book, "A", M, 138, 7, MAIMAI_BLUE, 1.0)
    roman(book, "B", 320, 138, 7, MAIMAI_PINK, 1.0)
    caption(book, "延长障碍的长度，等于增加角色必须付出的行动代价。", M, 108, 500)
    folio(book)

    # P26 - closing choice.
    book.new(NIGHT, "MAIMAI / CLOSING")
    book.full_bleed(asset("m15_12_092.7s.jpg"), dim=0.06, anchor_x=0.54, anchor_y=0.5)
    book.bottom_fade(250, 0.62)
    display(book, "每一个魔法", M, 108, 27, WHITE)
    display(book, "都回到一次选择", M, 72, 24, WHITE)
    roman(book, "15 EPISODES / 30+ MINUTES", M, 42, 6, MAIMAI_YELLOW, 1.0)
    folio(book, True)


def closing_sections(book: base.Book) -> None:
    # P27 - script paper, not a timeline or five cards.
    book.new(PAPER, "SCREENWRITING")
    roman(book, "ORIGINAL SCREENPLAYS", M, PAGE_H - 42, 6.2, SIGNAL, 1.15)
    display(book, "剧本写的是选择与代价", M, 724, 26, INK)
    scripts = [
        ("两块门牌", "12 集 / 1974-2012 / 404 场"),
        ("合味", "12 集 / 火锅店、辣椒供应与共同创制权"),
        ("山城换挡", "12 集 / 1978-2026 / 工业家庭剧"),
        ("山那边的课表", "12 集 / 1997-2026 / 年代家庭剧"),
        ("江水记得", "三峡移民题材现实主义群像电影 / 1993-2023"),
    ]
    y = 606
    for index, (title, note) in enumerate(scripts, 1):
        roman(book, f"{index:02d}", M, y + 4, 6.2, SIGNAL, 0.9)
        display(book, title, 92, y - 3, 18, INK)
        caption(book, note, 310, y + 5, 240)
        small_rule(book, 92, y - 28, 455, RULE)
        y -= 104
    caption(book, "完整终稿保存在项目源文件中；本页不以虚构奖项或平台数据替代文本。", M, 86, 480)
    folio(book)

    # P28 - working archive; three materials overlap as a process trace.
    storyboard = base.DELIVERY / "4分镜头脚本" / "4.2图示分镜头" / "回家分镜" / "到家2.png"
    prop = base.DELIVERY / "5数字资产库" / "5.3道具" / "低调版本通幽录.png"
    book.new(NIGHT_2, "AI DIRECTING")
    roman(book, "AI", M, 730, 24, WHITE, -0.8)
    display(book, "改变生产", 104, 730, 25, WHITE)
    display(book, "不改变责任", 330, 730, 25, WHITE)
    book.image_contain(base.checked(storyboard), 24, 330, 350, 296, NIGHT_2)
    book.image_cover(asset("tongyoulu_ep02.jpg"), 282, 88, 313, 330, anchor_x=0.54, anchor_y=0.5, dim=0.04)
    book.image_contain(base.checked(prop), 38, 70, 212, 230, NIGHT_2)
    book.c.setFillColor(NIGHT)
    book.c.rect(146, 70, 104, 28, fill=1, stroke=0)
    roman(book, "STORYBOARD", 36, 306, 5.7, ICE, 0.9)
    roman(book, "ASSET", 38, 48, 5.7, ICE, 0.9)
    roman(book, "FINAL FRAME", 282, 66, 5.7, ICE, 0.9)
    caption(book, "导演负责人物动机、世界规则、镜头判断与最终取舍。", 396, 624, 152, True)
    folio(book, True)

    # P29 - experimental film: one image, one factual line.
    book.new(NIGHT, "EXPERIMENT")
    book.full_bleed(asset("jinyan_04.jpg"), dim=0.05, anchor_x=0.5, anchor_y=0.5)
    book.bottom_fade(220, 0.64)
    display(book, "实验影像", M, 98, 28, WHITE)
    caption(book, "志怪 / 民俗 / 非遗 / 地域经验", M, 62, 300, True)
    folio(book, True)

    # P30 - verified collaboration as an editorial tear sheet.
    book.new(PAPER_2, "FIELD PRACTICE")
    roman(book, "VERIFIED CREDITS", M, PAGE_H - 42, 6.2, SIGNAL, 1.15)
    book.image_cover(asset("field_00.jpg"), 0, 350, 252, 348, anchor_x=0.82, anchor_y=0.5, dim=0)
    book.image_cover(asset("field_05.jpg"), 205, 84, 236, 318, anchor_x=0.84, anchor_y=0.5, dim=0)
    roman(book, "03'51\"", 286, 618, 38, SIGNAL, -1.1)
    display(book, "反家乡", 286, 566, 24, INK)
    caption(book, "共青团伙伴计划纪录短片。王陈鑫：摄影、剪辑；摄影为共同署名。出品与策划：共青团重庆市綦江区委员会。", 286, 526, 252)
    small_rule(book, 466, 330, 86, SIGNAL)
    book.para("奶茶滚烫", 466, 310, 92, 9.2, 12, INK, SANS_MED)
    caption(book, "导演助理 / 30+ 场次\n搜狐视频、乐视TV 播出", 466, 278, 92)
    book.para("猛龙下山", 466, 206, 92, 9.2, 12, INK, SANS_MED)
    caption(book, "艺人助理 / 红果商业短剧", 466, 174, 92)
    folio(book)

    # P31 - one photographic observation.
    photo = base.SOURCE_F / "摄影" / "ae625a15ddf91a9ecadb49a4a508c026.JPG"
    book.new(NIGHT, "PHOTOGRAPHY")
    book.full_bleed(base.checked(photo), dim=0.1, anchor_x=0.55, anchor_y=0.49)
    book.bottom_fade(240, 0.62)
    display(book, "观众先看见什么", M, 96, 27, WHITE)
    caption(book, "距离 / 天气 / 人留下的痕迹", M, 62, 300, True)
    folio(book, True)

    # P32 - author appears once, at the end, as requested.
    book.new(PAPER, "PROFILE")
    book.image_cover(base.PORTRAIT, 0, 0, 278, PAGE_H, anchor_x=0.5, anchor_y=0.47, dim=0.03)
    roman(book, "WANG CHENXIN", 316, 700, 7, SIGNAL, 1.15)
    display(book, "王陈鑫", 316, 638, 34, INK)
    book.para("作者型导演 / 编剧 / AI 影像创作者", 316, 586, 230, 10, 15, INK, SANS_MED)
    small_rule(book, 316, 538, 220, RULE)
    traces = [
        "《崖佛不语，岁岁佑我》《手电》",
        "《通幽录·渝州篇》/ 7 集 / 60+ 分钟",
        "《麦麦的魔法面包店》/ 15 集 / 30+ 分钟",
        "五部原创剧本完整终稿",
        "纪录片摄影与剪辑 / 商业剧组协作",
    ]
    y = 476
    for line in traces:
        book.para(line, 316, y, 230, 8.4, 13.5, INK_2, SANS)
        y -= 58
    display(book, "导演身份", 316, 146, 17, INK)
    display(book, "靠选择留下证据", 412, 146, 17, INK)
    folio(book)

    # P33 - contact, no placeholder box and no invented QR.
    book.new(NIGHT, "CONTACT")
    roman(book, "NEXT FRAME", M, 686, 44, WHITE, -1.6)
    display(book, "下一镜", M, 584, 24, ICE)
    display(book, "一起完成", 208, 584, 24, ICE)
    small_rule(book, M, 510, 510, a(ICE, 0.38))
    roman(book, "3146652776@qq.com", M, 448, 17, WHITE, -0.2)
    book.c.linkURL("mailto:3146652776@qq.com", (M, 424, 390, 470), relative=0)
    roman(book, "13002860718", M, 370, 18, ICE, -0.2)
    book.c.linkURL("tel:13002860718", (M, 346, 310, 392), relative=0)
    caption(book, "公开作品链接尚未提供。收到链接后再加入正式观看入口与二维码。", M, 266, 340, True)
    roman(book, "AUTHOR-DIRECTOR / 2026", M, 42, 6, SILVER, 1.0)
    folio(book, True)

    # P34 - the last frame closes the book without another slogan.
    book.new(NIGHT, "FINAL FRAME")
    book.full_bleed(asset("tyl1_09_06m06s.jpg"), dim=0.11, anchor_x=0.52, anchor_y=0.5)
    book.bottom_fade(170, 0.44)
    roman(book, "WANG CHENXIN", M, 44, 7, WHITE, 1.0)
    roman(book, "2026", PAGE_W - 76, 44, 7, WHITE, 1.0)


def main() -> None:
    base.register_fonts()
    book = base.Book(OUTPUT)
    cover_and_identity(book)
    yafobuyu(book)
    shoudian(book)
    tongyoulu(book)
    maimai(book)
    closing_sections(book)
    if book.page != 34:
        raise RuntimeError(f"Expected 34 pages, got {book.page}")
    book.finish()
    print(f"Created {OUTPUT}")
    print(f"Pages: {book.page}")


if __name__ == "__main__":
    main()
