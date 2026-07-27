# -*- coding: utf-8 -*-
"""Generate lightweight 15-second portfolio previews and a React data manifest."""

from __future__ import annotations

import argparse
import glob
import json
import os
import re
import subprocess
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
TOOLS = ROOT / "build" / "video-tools"
if TOOLS.exists():
    sys.path.insert(0, str(TOOLS))

import imageio_ffmpeg  # noqa: E402


FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()
WORKS_PATH = ROOT / "src" / "data" / "works.json"
MANIFEST_PATH = ROOT / "src" / "data" / "previews.json"
OUTPUT_ROOT = ROOT / "public" / "assets" / "previews"
CLIP_SECONDS = 15.0
WIDTH = 1280
HEIGHT = 720
FPS = 24


VIDEO_SOURCES = {
    "xindong": r"F:\作品集\a视频类\剧情片\心动策划案.mp4",
    "jinyan": r"F:\作品集\a视频类\剧情片\禁言最终和谐版.mp4",
    "mufeng": r"F:\作品集\a视频类\剧情片\牧   风 MP4.mp4",
    "qishuku": r"F:\作品集\4k\弃书库的守门人_1_chr2_prob4.mp4",
    "taoyan": r"F:\作品集\4k\我最讨厌的人_10_chr2_prob4.mp4",
    "shancheng": r"F:\作品集\4k\热血山城_1_chr2_prob4.mp4",
    "zoumagang": r"F:\作品集\4k\走马岗的来历_1_chf3_ghq5.mp4",
    "dongdeng": r"F:\作品集\a视频类\纪录片\冬等最终版.mp4",
    "xiayan": r"F:\作品集\a视频类\纪录片\峡砚3.0.mp4",
    "douyun": r"F:\作品集\a视频类\纪录片\豆晕4k.mp4",
}

SERIES_DIRS = {
    "tongyoulu": Path(r"F:\作品集\《通幽路》"),
    "maimai": Path(r"F:\作品集\麦麦的面包店\麦麦的面包店"),
}

CN = {
    "一": 1,
    "二": 2,
    "两": 2,
    "三": 3,
    "四": 4,
    "五": 5,
    "六": 6,
    "七": 7,
    "八": 8,
    "九": 9,
    "十": 10,
}


def parse_episode(name: str) -> int | None:
    digit_match = re.search(r"第\s*(\d+)\s*集", name)
    if digit_match:
        return int(digit_match.group(1))
    match = re.search(r"第([一二三四五六七八九十两]+)集", name)
    if not match:
        return None
    text = match.group(1)
    if text == "十":
        return 10
    if "十" in text:
        left, right = text.split("十")
        return CN.get(left, 1) * 10 + CN.get(right, 0)
    return CN.get(text)


def discover_series() -> dict[str, dict[int, str]]:
    result: dict[str, dict[int, str]] = {}
    for work_id, directory in SERIES_DIRS.items():
        episodes: dict[int, str] = {}
        if directory.is_dir():
            for path in directory.iterdir():
                if path.name.startswith("._") or path.suffix.lower() not in {".mp4", ".mov", ".mkv"}:
                    continue
                episode = parse_episode(path.name)
                if episode is not None:
                    episodes[episode] = str(path)
        result[work_id] = episodes
    return result


def add_glob_sources() -> None:
    cixiu = sorted(glob.glob(r"F:\作品集\a视频类\刺绣\*.mp4"))
    banhua = sorted(glob.glob(r"F:\作品集\a视频类\非遗版画\*.mp4"))
    if cixiu:
        VIDEO_SOURCES["cixiu_video"] = cixiu[0]
    if banhua:
        VIDEO_SOURCES["banhua_video"] = banhua[0]


def duration_seconds(path: str | Path) -> float | None:
    try:
        result = subprocess.run(
            [FFMPEG, "-hide_banner", "-i", str(path)],
            capture_output=True,
            text=True,
            timeout=90,
            encoding="utf-8",
            errors="replace",
        )
    except Exception:
        return None
    match = re.search(r"Duration:\s*(\d+):(\d+):(\d+(?:\.\d+)?)", result.stderr or "")
    if not match:
        return None
    hours, minutes, seconds = int(match.group(1)), int(match.group(2)), float(match.group(3))
    return hours * 3600 + minutes * 60 + seconds


def choose_start(work_id: str, duration: float, episode: int | None = None) -> float:
    if work_id == "tongyoulu" and episode == 3:
        return min(28.0, max(0.0, duration - CLIP_SECONDS))
    if duration <= CLIP_SECONDS + 0.5:
        return 0.0
    ratio = 0.1 if work_id in {"tongyoulu", "maimai"} else 0.18
    start = max(3.0, duration * ratio)
    return min(start, duration - CLIP_SECONDS - 0.1)


def valid_output(path: Path) -> bool:
    if not path.exists() or path.stat().st_size < 50_000:
        return False
    duration = duration_seconds(path)
    return duration is not None and 14.3 <= duration <= 15.7


def run_command(command: list[str], timeout: int = 300) -> tuple[bool, str]:
    try:
        result = subprocess.run(
            command,
            capture_output=True,
            text=True,
            timeout=timeout,
            encoding="utf-8",
            errors="replace",
        )
        if result.returncode == 0:
            return True, ""
        return False, (result.stderr or result.stdout or "unknown ffmpeg error")[-1200:]
    except Exception as exc:
        return False, str(exc)


def encode_video(source: str, output: Path, work_id: str, episode: int | None, force: bool) -> tuple[bool, str]:
    if not force and valid_output(output):
        return True, "cached"
    duration = duration_seconds(source)
    if not duration:
        return False, "duration unavailable"
    output.parent.mkdir(parents=True, exist_ok=True)
    start = choose_start(work_id, duration, episode)
    video_filter = (
        f"scale={WIDTH}:{HEIGHT}:force_original_aspect_ratio=decrease:flags=lanczos,"
        f"pad={WIDTH}:{HEIGHT}:(ow-iw)/2:(oh-ih)/2:color=black,setsar=1,fps={FPS},format=yuv420p"
    )
    command = [
        FFMPEG,
        "-hide_banner",
        "-loglevel",
        "error",
        "-y",
        "-ss",
        f"{start:.3f}",
        "-i",
        source,
        "-t",
        f"{CLIP_SECONDS:.3f}",
        "-map",
        "0:v:0",
        "-map",
        "0:a?",
        "-vf",
        video_filter,
        "-c:v",
        "libx264",
        "-preset",
        "veryfast",
        "-crf",
        "25",
        "-profile:v",
        "main",
        "-level",
        "3.1",
        "-pix_fmt",
        "yuv420p",
        "-c:a",
        "aac",
        "-b:a",
        "80k",
        "-ac",
        "2",
        "-movflags",
        "+faststart",
        "-max_muxing_queue_size",
        "2048",
        str(output),
    ]
    ok, detail = run_command(command)
    if ok and valid_output(output):
        return True, f"{start:.1f}s / {output.stat().st_size / 1_000_000:.1f}MB"
    return False, detail or "output validation failed"


def select_images(work: dict) -> list[Path]:
    raw = [work.get("thumb"), *(work.get("images") or [])]
    unique: list[Path] = []
    for relative in raw:
        if not relative:
            continue
        path = ROOT / "public" / relative
        if path.exists() and path not in unique:
            unique.append(path)
    if not unique:
        return []
    if len(unique) >= 5:
        indexes = [round(i * (len(unique) - 1) / 4) for i in range(5)]
        return [unique[index] for index in indexes]
    result = []
    while len(result) < 5:
        result.extend(unique)
    return result[:5]


def encode_slideshow(images: list[Path], output: Path, force: bool) -> tuple[bool, str]:
    if not force and valid_output(output):
        return True, "cached"
    if not images:
        return False, "no images"
    output.parent.mkdir(parents=True, exist_ok=True)
    seconds_each = CLIP_SECONDS / 5
    command = [FFMPEG, "-hide_banner", "-loglevel", "error", "-y"]
    for image in images:
        command.extend(["-loop", "1", "-t", f"{seconds_each:.3f}", "-i", str(image)])
    filters = []
    labels = []
    for index in range(5):
        label = f"v{index}"
        filters.append(
            f"[{index}:v]scale={WIDTH}:{HEIGHT}:force_original_aspect_ratio=increase:flags=lanczos,"
            f"crop={WIDTH}:{HEIGHT},setsar=1,fps={FPS},trim=duration={seconds_each:.3f},"
            f"setpts=PTS-STARTPTS[{label}]"
        )
        labels.append(f"[{label}]")
    filters.append(
        f"{''.join(labels)}concat=n=5:v=1:a=0,"
        f"fade=t=in:st=0:d=0.35,fade=t=out:st={CLIP_SECONDS - .4:.2f}:d=0.4,format=yuv420p[outv]"
    )
    command.extend(
        [
            "-filter_complex",
            ";".join(filters),
            "-map",
            "[outv]",
            "-t",
            f"{CLIP_SECONDS:.3f}",
            "-r",
            str(FPS),
            "-an",
            "-c:v",
            "libx264",
            "-preset",
            "veryfast",
            "-crf",
            "25",
            "-profile:v",
            "main",
            "-level",
            "3.1",
            "-pix_fmt",
            "yuv420p",
            "-movflags",
            "+faststart",
            str(output),
        ]
    )
    ok, detail = run_command(command)
    if ok and valid_output(output):
        return True, f"slideshow / {output.stat().st_size / 1_000_000:.1f}MB"
    return False, detail or "output validation failed"


def wanted(token: str, only: set[str]) -> bool:
    return not only or token in only or token.split(":", 1)[0] in only


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--only", default="", help="Comma-separated work ids or work:episode tokens")
    parser.add_argument("--force", action="store_true")
    args = parser.parse_args()
    only = {part.strip() for part in args.only.split(",") if part.strip()}

    works = json.loads(WORKS_PATH.read_text(encoding="utf-8"))["works"]
    add_glob_sources()
    series_sources = discover_series()
    manifest = {"works": {}, "episodes": {"tongyoulu": {}, "maimai": {}}}
    failures: list[str] = []
    completed = 0

    for work in works:
        work_id = work["id"]
        episodes = work.get("episodes") or []
        if episodes:
            for index, episode_data in enumerate(episodes, start=1):
                token = f"{work_id}:{index}"
                if not wanted(token, only):
                    continue
                source = series_sources.get(work_id, {}).get(index)
                output = OUTPUT_ROOT / work_id / f"ep{index:02d}.mp4"
                if not source:
                    failures.append(f"{token}: source missing")
                    print(f"FAIL {token}: source missing", flush=True)
                    continue
                ok, detail = encode_video(source, output, work_id, index, args.force)
                print(f"{'OK' if ok else 'FAIL'} {token}: {detail}", flush=True)
                if ok:
                    manifest["episodes"].setdefault(work_id, {})[str(index)] = output.relative_to(ROOT / "public").as_posix()
                    completed += 1
                else:
                    failures.append(f"{token}: {detail}")
            continue

        if not wanted(work_id, only):
            continue
        output = OUTPUT_ROOT / work_id / "preview.mp4"
        source = VIDEO_SOURCES.get(work_id)
        if source and Path(source).exists():
            ok, detail = encode_video(source, output, work_id, None, args.force)
        else:
            ok, detail = encode_slideshow(select_images(work), output, args.force)
        print(f"{'OK' if ok else 'FAIL'} {work_id}: {detail}", flush=True)
        if ok:
            manifest["works"][work_id] = output.relative_to(ROOT / "public").as_posix()
            completed += 1
        else:
            failures.append(f"{work_id}: {detail}")

    if only and MANIFEST_PATH.exists():
        previous = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
        previous.setdefault("works", {}).update(manifest["works"])
        for work_id, episode_map in manifest["episodes"].items():
            previous.setdefault("episodes", {}).setdefault(work_id, {}).update(episode_map)
        manifest = previous

    MANIFEST_PATH.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    total_bytes = sum(path.stat().st_size for path in OUTPUT_ROOT.rglob("*.mp4")) if OUTPUT_ROOT.exists() else 0
    print(f"SUMMARY completed={completed} failures={len(failures)} total={total_bytes / 1_000_000:.1f}MB", flush=True)
    if failures:
        print("FAILURES", flush=True)
        for failure in failures:
            print(f"- {failure}", flush=True)
    return 1 if failures else 0


if __name__ == "__main__":
    raise SystemExit(main())
