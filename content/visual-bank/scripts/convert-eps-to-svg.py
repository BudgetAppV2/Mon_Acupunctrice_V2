#!/usr/bin/env python3
"""
convert-eps-to-svg.py — Conversion EPS -> SVG line art (filtre automatique)

STRATEGIE :
Convertit uniquement les EPS qui sont de **vrais line art trait fin** (stroke-based).
Les dessins en blocs/silhouettes pleines (fill-based) sont **rejetes** automatiquement
parce qu'ils donnent des taches noires opaques quand ils sont rasterises en SVG.

Pour ces images blob, le pipeline retombera automatiquement sur le JPG (chroma key
qui transforme les blocs en monochrome semi-transparent).

Workflow par fichier :
1. EPS -> PDF via Ghostscript (-dEPSCrop)
2. PDF -> SVG via Inkscape CLI
3. Audit : compter les paths "stroked" (trait fin) vs "filled" (blob plein)
4a. Si stroked > filled : KEEP, recolorer strokes en INK_COLOR
4b. Si filled >= stroked : REJECT (supprimer le SVG, garder le JPG)

Usage:
    python3 convert-eps-to-svg.py [pilier]
    python3 convert-eps-to-svg.py grossesse
    python3 convert-eps-to-svg.py --all
"""

import os
import sys
import subprocess
import re
import shutil
from pathlib import Path

LINEART_DIR = Path(__file__).parent.parent / "lineart"
INK_COLOR = "#2C2A26"
INKSCAPE = "/Applications/Inkscape.app/Contents/MacOS/inkscape"


def check_dependencies():
    if not shutil.which("gs"):
        print("ERREUR: ghostscript non installe (brew install ghostscript)", file=sys.stderr)
        sys.exit(1)
    if not Path(INKSCAPE).exists():
        print(f"ERREUR: Inkscape non trouve a {INKSCAPE}", file=sys.stderr)
        sys.exit(1)


def eps_to_pdf(eps_path: Path, pdf_path: Path) -> bool:
    cmd = ["gs", "-dNOPAUSE", "-dBATCH", "-dQUIET", "-sDEVICE=pdfwrite",
           "-dEPSCrop", f"-sOutputFile={pdf_path}", str(eps_path)]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"  GS ERROR: {result.stderr[:200]}", file=sys.stderr)
        return False
    return True


def pdf_to_svg(pdf_path: Path, svg_path: Path) -> bool:
    cmd = [INKSCAPE, "--export-type=svg", "--export-plain-svg",
           f"--export-filename={svg_path}", str(pdf_path)]
    subprocess.run(cmd, capture_output=True, text=True)
    return svg_path.exists()


def classify_paths(svg_content: str) -> tuple:
    """
    Classifier les paths du SVG :
    - stroked : fill:none + stroke present non-blanc (= vrai trait fin)
    - filled : fill present non-blanc + stroke=none (= blob plein)
    - white_bg : fill blanc (= rectangle d arriere plan)
    Returns (stroked_count, filled_count, white_count, total)
    """
    # Capture chaque path avec son style
    paths = re.findall(r'<path[^>]*?style="([^"]+)"[^>]*?/>', svg_content, re.DOTALL)

    stroked = 0
    filled = 0
    white_bg = 0

    for style in paths:
        fill_match = re.search(r"fill:([#\w]+)", style)
        stroke_match = re.search(r"stroke:([#\w]+)", style)
        fill = fill_match.group(1).lower() if fill_match else "none"
        stroke = stroke_match.group(1).lower() if stroke_match else "none"

        if fill in ("#ffffff", "#fff", "white"):
            white_bg += 1
        elif fill == "none" and stroke not in ("none", "#ffffff", "#fff", "white"):
            stroked += 1
        elif fill != "none":
            filled += 1

    return stroked, filled, white_bg, len(paths)


def post_process_stroked_svg(svg_path: Path, ink_color: str = INK_COLOR) -> int:
    """
    Post-process pour SVG stroke-based valide :
    - Supprimer les paths white background
    - Recolorer tous les strokes en ink_color
    - Recolorer tous les fills (ceux qui restent) en ink_color
    Returns: count of recolored elements
    """
    with open(svg_path, "r") as f:
        content = f.read()

    # Retirer commentaires
    content = re.sub(r"<!--.*?-->", "", content, flags=re.DOTALL)

    # Supprimer les paths white background
    white_pattern = re.compile(
        r'<path[^>]*?fill:#ffffff[^>]*?/>',
        re.IGNORECASE | re.DOTALL
    )
    content = white_pattern.sub("", content)

    recolored = 0

    def replace_color(match):
        nonlocal recolored
        prop = match.group(1)
        color = match.group(2)
        if color.lower() in ("#ffffff", "#fff", "white", "none"):
            return match.group(0)
        recolored += 1
        return f"{prop}:{ink_color}"

    content = re.sub(r"(fill|stroke):(#[0-9a-fA-F]{3,6}|black|white)", replace_color, content)

    # Nettoyer
    content = re.sub(r"\n\s*\n", "\n", content)

    with open(svg_path, "w") as f:
        f.write(content)

    return recolored


def convert_eps(eps_path: Path) -> str:
    """
    Returns: 'kept' / 'rejected' / 'failed'
    """
    output_dir = eps_path.parent
    base = eps_path.stem
    pdf_path = output_dir / f"{base}.pdf"
    svg_path = output_dir / f"{base}.svg"

    print(f"  {eps_path.name}", end="")

    if not eps_to_pdf(eps_path, pdf_path):
        return "failed"

    if not pdf_to_svg(pdf_path, svg_path):
        pdf_path.unlink(missing_ok=True)
        return "failed"

    pdf_path.unlink(missing_ok=True)

    # Audit du SVG
    with open(svg_path) as f:
        content = f.read()
    stroked, filled, white_bg, total = classify_paths(content)

    # Decision : on garde si majorite stroked OU si stroked > 0 ET filled <= 1
    # (parfois 1 seul filled est un detail mineur)
    keep = stroked > 0 and stroked >= filled

    if keep:
        recolored = post_process_stroked_svg(svg_path)
        size_kb = svg_path.stat().st_size / 1024
        print(f"  -> KEPT ({size_kb:.1f} KB, {stroked} strokes, {filled} fills, {recolored} recolored)")
        return "kept"
    else:
        # Rejeter le SVG : le pipeline tombera sur le JPG
        svg_path.unlink(missing_ok=True)
        print(f"  -> REJECTED (blobs only: {filled} fills, {stroked} strokes -> fallback JPG)")
        return "rejected"


def convert_pilier(pilier: str) -> dict:
    pilier_dir = LINEART_DIR / pilier
    if not pilier_dir.exists():
        print(f"ERREUR: pilier {pilier} non trouve", file=sys.stderr)
        return {"kept": 0, "rejected": 0, "failed": 0}

    eps_files = sorted(pilier_dir.glob("*.eps"))
    if not eps_files:
        return {"kept": 0, "rejected": 0, "failed": 0}

    print(f"\n=== Pilier '{pilier}' : {len(eps_files)} EPS ===")
    stats = {"kept": 0, "rejected": 0, "failed": 0}
    for eps_path in eps_files:
        result = convert_eps(eps_path)
        stats[result] += 1

    print(f"  Resultat : {stats['kept']} SVG gardes, {stats['rejected']} rejetes (fallback JPG), {stats['failed']} echec")
    return stats


def main():
    check_dependencies()
    args = sys.argv[1:]

    if "--all" in args:
        piliers = sorted([d.name for d in LINEART_DIR.iterdir() if d.is_dir()])
        total = {"kept": 0, "rejected": 0, "failed": 0}
        for p in piliers:
            stats = convert_pilier(p)
            for k in total:
                total[k] += stats[k]
        print(f"\n=== TOTAL : {total['kept']} kept, {total['rejected']} rejected, {total['failed']} failed ===")
    elif args:
        convert_pilier(args[0])
    else:
        print(__doc__)
        print("\nPiliers disponibles:")
        for d in sorted(LINEART_DIR.iterdir()):
            if d.is_dir():
                eps_count = len(list(d.glob("*.eps")))
                svg_count = len(list(d.glob("*.svg")))
                print(f"  {d.name}: {eps_count} EPS, {svg_count} SVG")


if __name__ == "__main__":
    main()
