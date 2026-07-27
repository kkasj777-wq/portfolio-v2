from pathlib import Path

import fitz
from PIL import Image, ImageDraw


source = Path(r"F:\作品集\剧本\剧本（保密文件，请勿外传）.pdf")
output = Path(r"D:\Ten\2026-07-18-03-25-26\portfolio-v2\tmp\pdfs\script-archive")
output.mkdir(parents=True, exist_ok=True)

document = fitz.open(source)
thumbs = []
for page_index, page in enumerate(document):
    pixmap = page.get_pixmap(matrix=fitz.Matrix(0.42, 0.42), alpha=False)
    image = Image.frombytes("RGB", (pixmap.width, pixmap.height), pixmap.samples)
    image.thumbnail((430, 620), Image.Resampling.LANCZOS)
    card = Image.new("RGB", (450, 660), "#16191f")
    card.paste(image, ((450 - image.width) // 2, 14))
    ImageDraw.Draw(card).text((18, 632), f"PAGE {page_index + 1:02d}", fill="#e8edf3")
    thumbs.append(card)

for sheet_index in range(0, len(thumbs), 12):
    page_group = thumbs[sheet_index:sheet_index + 12]
    sheet = Image.new("RGB", (1800, 1980), "#090b10")
    for index, card in enumerate(page_group):
        x = (index % 4) * 450
        y = (index // 4) * 660
        sheet.paste(card, (x, y))
    first_page = sheet_index + 1
    last_page = sheet_index + len(page_group)
    sheet.save(output / f"contact-{first_page:02d}-{last_page:02d}.jpg", quality=88, optimize=True)

print(f"Rendered {len(thumbs)} pages to {output}")
