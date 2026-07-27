from __future__ import annotations

import importlib.util
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "scripts" / "render-director-portfolio-v6-previews.py"
SPEC = importlib.util.spec_from_file_location("portfolio_v6_preview_base", SOURCE)
if SPEC is None or SPEC.loader is None:
    raise RuntimeError(f"Cannot load preview base: {SOURCE}")
preview = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(preview)

preview.RENDER = ROOT / "tmp" / "pdfs" / "v7-render-final"
preview.OUTPUT = ROOT / "output" / "pdf"
preview.SPREADS = preview.OUTPUT / "Wang-Chenxin-Portfolio-V7-Spreads"
preview.PAGES_PREVIEW = preview.OUTPUT / "Wang-Chenxin-Portfolio-V7-Pages-Preview.jpg"
preview.SPREADS_PREVIEW = preview.OUTPUT / "Wang-Chenxin-Portfolio-V7-Spreads-Preview.jpg"


if __name__ == "__main__":
    preview.main()
