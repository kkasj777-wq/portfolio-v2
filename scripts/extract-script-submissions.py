import json
from pathlib import Path

from docx import Document


root = Path(r"D:\光影重庆 王陈鑫\剧本类投递")
output = Path(r"D:\Ten\2026-07-18-03-25-26\portfolio-v2\tmp\script-submissions.json")
submissions = []

for source in sorted(root.glob("*/*申报表*.docx")):
    document = Document(source)
    fields = {}
    for table in document.tables:
        for row in table.rows:
            cells = []
            seen = set()
            for cell in row.cells:
                cell_id = id(cell._tc)
                if cell_id in seen:
                    continue
                seen.add(cell_id)
                cells.append(" ".join(cell.text.split()))
            if len(cells) >= 2:
                for index in range(0, len(cells) - 1, 2):
                    label = cells[index].strip()
                    value = cells[index + 1].strip()
                    if label:
                        fields[label] = value
    submissions.append({
        "title": fields.get("作品名称", source.parent.name).strip("《》"),
        "type": fields.get("作品类型", ""),
        "source": fields.get("故事来源", ""),
        "subject": fields.get("作品题材", ""),
        "episodes": fields.get("总集数", ""),
        "creator": fields.get("主创人员 （不超过5人）", ""),
        "statement": fields.get("编剧阐述（不少于500字）", "")[:700],
        "synopsis": fields.get("故事梗概（不少于1500字）", "")[:900],
        "sourcePath": str(source),
    })

output.parent.mkdir(parents=True, exist_ok=True)
output.write_text(json.dumps(submissions, ensure_ascii=False, indent=2), encoding="utf-8")
print(output)
