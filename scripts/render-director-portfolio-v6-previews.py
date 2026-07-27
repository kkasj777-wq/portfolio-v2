from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
RENDER = ROOT / "tmp" / "pdfs" / "v6-render-final"
OUTPUT = ROOT / "output" / "pdf"
SPREADS = OUTPUT / "Wang-Chenxin-Portfolio-V6-Spreads"
PAGES_PREVIEW = OUTPUT / "Wang-Chenxin-Portfolio-V6-Pages-Preview.jpg"
SPREADS_PREVIEW = OUTPUT / "Wang-Chenxin-Portfolio-V6-Spreads-Preview.jpg"
FONT_PATH = Path(r"C:\Windows\Fonts\Inter-Medium.ttf")


def load_pages() -> list[Image.Image]:
    paths = sorted(RENDER.glob("page-*.png"))
    if len(paths) != 34:
        raise RuntimeError(f"Expected 34 rendered pages, got {len(paths)}")
    return [Image.open(path).convert("RGB") for path in paths]


def pages_contact(pages: list[Image.Image]) -> None:
    thumb_w = 260
    thumb_h = round(thumb_w * pages[0].height / pages[0].width)
    gap = 28
    top = 40
    columns = 6
    rows = (len(pages) + columns - 1) // columns
    sheet = Image.new("RGB", (columns * thumb_w + (columns + 1) * gap, rows * thumb_h + (rows + 1) * gap + top), "#151719")
    draw = ImageDraw.Draw(sheet)
    font = ImageFont.truetype(str(FONT_PATH), 17)
    for index, page in enumerate(pages):
        x = gap + (index % columns) * (thumb_w + gap)
        y = top + gap + (index // columns) * (thumb_h + gap)
        sheet.paste(page.resize((thumb_w, thumb_h), Image.Resampling.LANCZOS), (x, y))
        draw.text((x, y - 21), f"{index + 1:02d}", fill="#C8CDD0", font=font)
    sheet.save(PAGES_PREVIEW, "JPEG", quality=92, subsampling=0, optimize=True)


def spread_outputs(pages: list[Image.Image]) -> None:
    SPREADS.mkdir(parents=True, exist_ok=True)
    spread_images: list[Image.Image] = []
    for index in range(0, 34, 2):
        left = pages[index]
        right = pages[index + 1]
        spread = Image.new("RGB", (left.width + right.width, left.height), "white")
        spread.paste(left, (0, 0))
        spread.paste(right, (left.width, 0))
        spread.save(SPREADS / f"spread-{index // 2 + 1:02d}.jpg", "JPEG", quality=93, subsampling=0, optimize=True)
        spread_images.append(spread)

    thumb_w = 720
    thumb_h = round(thumb_w * spread_images[0].height / spread_images[0].width)
    gap = 34
    top = 40
    columns = 2
    rows = (len(spread_images) + columns - 1) // columns
    sheet = Image.new("RGB", (columns * thumb_w + (columns + 1) * gap, rows * thumb_h + (rows + 1) * gap + top), "#111315")
    draw = ImageDraw.Draw(sheet)
    font = ImageFont.truetype(str(FONT_PATH), 19)
    for index, spread in enumerate(spread_images):
        x = gap + (index % columns) * (thumb_w + gap)
        y = top + gap + (index // columns) * (thumb_h + gap)
        sheet.paste(spread.resize((thumb_w, thumb_h), Image.Resampling.LANCZOS), (x, y))
        draw.text((x, y - 24), f"SPREAD {index + 1:02d} / P{index * 2 + 1:02d}-{index * 2 + 2:02d}", fill="#C8CDD0", font=font)
    sheet.save(SPREADS_PREVIEW, "JPEG", quality=92, subsampling=0, optimize=True)


def main() -> None:
    OUTPUT.mkdir(parents=True, exist_ok=True)
    pages = load_pages()
    pages_contact(pages)
    spread_outputs(pages)
    print(PAGES_PREVIEW)
    print(SPREADS_PREVIEW)
    print(SPREADS)


if __name__ == "__main__":
    main()
