#!/usr/bin/env python3.13
"""
tag-and-organize-v2.py — Script de tri pour la banque visuelle Judith (v2 adaptee aux downloads Freepik).

CONTEXTE: Les downloads Freepik creent un sous-dossier par asset, contenant 1 EPS + 1 JPG.
Ce script detecte ces paires, propose un nom auto-genere depuis le slug Freepik, et range a plat.

WORKFLOW:
1. Tu places tes downloads Freepik dans content/visual-bank/{backgrounds,lineart/<pilier>}/
   Chaque download = 1 sous-dossier avec EPS+JPG dedans
2. Tu lances: python3 tag-and-organize-v2.py
3. Pour chaque sous-dossier:
   - Ouvre le JPG en preview
   - Affiche le slug Freepik et le nom auto-suggere
   - Tu tapes Enter pour accepter, ou tu retapes un nom
   - Le script renomme JPG (asset primaire) + EPS (archive) et les sort a plat
   - Le sous-dossier vide est supprime

USAGE:
    python3 content/visual-bank/scripts/tag-and-organize-v2.py
    python3 content/visual-bank/scripts/tag-and-organize-v2.py --dry-run    # preview sans modifier
    python3 content/visual-bank/scripts/tag-and-organize-v2.py --rebuild-metadata
    python3 content/visual-bank/scripts/tag-and-organize-v2.py --no-preview  # pas de Preview.app
"""

import os, sys, re, json, shutil, subprocess
from pathlib import Path
from datetime import datetime

REPO_ROOT = Path('/Users/benoitarchambault/Desktop/Mon_Acupunctrice_V2')
BANK_DIR = REPO_ROOT / 'content' / 'visual-bank'
BG_DIR = BANK_DIR / 'backgrounds'
LA_DIR = BANK_DIR / 'lineart'

IMG_EXTS = {'.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.webp'}
VECTOR_EXTS = {'.svg', '.eps', '.ai', '.pdf'}
ALL_EXTS = IMG_EXTS | VECTOR_EXTS

# Mots a ignorer dans le slug Freepik pour generer un nom court
SKIP_WORDS = {
    'vector', 'illustration', 'art', 'drawing', 'continuous', 'line',
    'minimal', 'minimalist', 'minimalism', 'simple', 'abstract',
    'isolated', 'background', 'white', 'black', 'design',
    'style', 'with', 'on', 'in', 'and', 'or', 'the', 'a', 'an',
    'one', 'set', 'collection', 'pack', 'free', 'premium',
    'concept', 'symbol', 'sign', 'icon', 'logo',
    'hand', 'drawn', 'handdrawn',
    'image', 'graphic', 'graphics', 'element', 'elements',
    'aesthetic', 'aesthetics', 'modern', 'classic', 'simple',
    'high', 'quality', 'beautiful', 'cute', 'pretty',
    'editable', 'customizable',
    'eps', 'jpg', 'png', 'svg',
}


def open_preview(filepath):
    try:
        subprocess.run(['open', '-a', 'Preview', str(filepath)], check=False)
    except Exception:
        pass


def close_previews():
    try:
        subprocess.run(['osascript', '-e', 'tell application "Preview" to close every window'],
                      check=False, capture_output=True)
    except Exception:
        pass


def extract_palette(filepath, n=5):
    if filepath.suffix.lower() not in IMG_EXTS:
        return None
    try:
        from colorthief import ColorThief
        ct = ColorThief(str(filepath))
        palette = ct.get_palette(color_count=n, quality=10)
        return ['#{0:02x}{1:02x}{2:02x}'.format(c[0], c[1], c[2]) for c in palette]
    except Exception:
        return None


def extract_dimensions(filepath):
    if filepath.suffix.lower() in IMG_EXTS:
        try:
            from PIL import Image
            with Image.open(filepath) as img:
                return img.size
        except Exception:
            return None
    return None


def slug_to_short_name(slug, is_background=False, max_words=4):
    """Convertit slug Freepik en nom court kebab-case.
    Ex: 'aesthetics-pregnant-women-minimal-style-elegant-line-art' -> 'pregnant-women-elegant'
    Ex: 'boho-watercolor-background-pastel-pink' -> 'pastel-pink-watercolor'
    """
    # Normalize
    s = slug.lower().strip()
    s = re.sub(r'[^a-z0-9]+', '-', s)
    words = [w for w in s.split('-') if w]

    # Filter out skip words
    significant = [w for w in words if w not in SKIP_WORDS]

    # Limit to N words
    significant = significant[:max_words]

    # If nothing left, fallback to first 3 words of original
    if not significant:
        significant = words[:3]

    return '-'.join(significant) if significant else 'asset'


def get_existing_count(target_dir, prefix, suffix=None):
    """Compte fichiers JPG existants avec ce prefix (sans compter EPS pour eviter doublons)."""
    if not target_dir.exists():
        return 0
    matching = [f for f in target_dir.iterdir() 
                if f.is_file() 
                and f.name.startswith(prefix + '-') 
                and f.suffix.lower() in IMG_EXTS
                and not f.name.startswith('.')]
    return len(matching)


def find_freepik_subdirs(parent):
    """Trouve les sous-dossiers Freepik (qui contiennent un couple EPS+JPG ou similaire)."""
    if not parent.exists():
        return []
    results = []
    for sub in parent.iterdir():
        if not sub.is_dir():
            continue
        if sub.name.startswith('.'):
            continue
        # Verifier qu'il contient au moins 1 fichier image
        files_in = [f for f in sub.iterdir() if f.is_file() and f.suffix.lower() in ALL_EXTS]
        if files_in:
            results.append((sub, files_in))
    return sorted(results, key=lambda x: x[0].name)


def process_subdir(parent_dir, sub_dir, files_in, is_background, pilier, dry_run=False, no_preview=False):
    """Traite un sous-dossier Freepik. Retourne metadata dict ou None."""
    slug = sub_dir.name

    # Trouver JPG primary et EPS archive
    jpgs = [f for f in files_in if f.suffix.lower() in IMG_EXTS]
    epss = [f for f in files_in if f.suffix.lower() in VECTOR_EXTS]

    if not jpgs:
        print(f'  WARN: pas de JPG dans {slug}, skip')
        return None

    # Si plusieurs JPG, prend le plus gros (le vrai asset)
    primary_jpg = max(jpgs, key=lambda f: f.stat().st_size)
    primary_eps = max(epss, key=lambda f: f.stat().st_size) if epss else None

    print()
    print(f'--- {slug[:80]} ---')
    if not no_preview:
        open_preview(primary_jpg)

    # Generer nom auto-suggere
    auto_name = slug_to_short_name(slug, is_background=is_background)

    # Determine prefix selon type
    if is_background:
        prefix = f'boho-{auto_name}'
    else:
        prefix = auto_name

    # Compter existants pour suffix numerique
    existing = get_existing_count(parent_dir, prefix.rsplit('-', 0)[0] if '-' not in prefix else prefix)
    # Si ya deja des fichiers avec ce prefix exact, on incremente
    nn = existing + 1

    # Demander confirmation
    print(f'  Suggestion: {prefix}-{nn:02d}.jpg (+ .eps archive)' if primary_eps else f'  Suggestion: {prefix}-{nn:02d}.jpg')
    print(f'  [Enter=accepter] [autre nom kebab-case] [s=skip] [d=delete] [q=quit]')

    try:
        response = input('  > ').strip().lower()
    except (KeyboardInterrupt, EOFError):
        return 'QUIT'

    if response == 'q':
        return 'QUIT'
    if response == 's':
        return None
    if response == 'd':
        if not dry_run:
            shutil.rmtree(sub_dir)
        print(f'  -> SUPPRIME')
        return None

    # Si reponse non vide, c'est un override
    if response:
        # Sanitize
        custom = response.replace(' ', '-').replace('_', '-')
        custom = ''.join(c for c in custom if c.isalnum() or c == '-')
        custom = '-'.join(p for p in custom.split('-') if p)
        if len(custom) >= 2:
            if is_background:
                prefix = f'boho-{custom}' if not custom.startswith('boho-') else custom
            else:
                prefix = custom
            existing = get_existing_count(parent_dir, prefix)
            nn = existing + 1
        else:
            print('  Nom invalide, on garde la suggestion auto')

    # Construire les nouveaux paths
    new_jpg_name = f'{prefix}-{nn:02d}{primary_jpg.suffix.lower()}'
    new_jpg_path = parent_dir / new_jpg_name

    # Eviter collisions
    while new_jpg_path.exists():
        nn += 1
        new_jpg_name = f'{prefix}-{nn:02d}{primary_jpg.suffix.lower()}'
        new_jpg_path = parent_dir / new_jpg_name

    new_eps_name = None
    new_eps_path = None
    if primary_eps:
        new_eps_name = f'{prefix}-{nn:02d}{primary_eps.suffix.lower()}'
        new_eps_path = parent_dir / new_eps_name

    # Action !
    if dry_run:
        print(f'  [DRY-RUN] {primary_jpg.name} -> {new_jpg_name}')
        if primary_eps:
            print(f'  [DRY-RUN] {primary_eps.name} -> {new_eps_name}')
    else:
        try:
            shutil.move(str(primary_jpg), str(new_jpg_path))
            if primary_eps:
                shutil.move(str(primary_eps), str(new_eps_path))
            # Supprimer le sous-dossier (qui doit maintenant etre vide ou avec des fichiers indesires)
            remaining = [f for f in sub_dir.iterdir() if not f.name.startswith('.')]
            if remaining:
                # Il reste des fichiers (autres formats?) -> on les laisse mais on les signale
                print(f'  NOTE: {len(remaining)} fichier(s) restant(s) dans {slug} (non geres):')
                for r in remaining:
                    print(f'    - {r.name}')
            else:
                # Vide ou seulement .DS_Store -> supprime
                shutil.rmtree(sub_dir, ignore_errors=True)
            print(f'  -> {new_jpg_name}' + (f' (+ {new_eps_name} archive)' if primary_eps else ''))
        except Exception as e:
            print(f'  ERROR: {e}')
            return None

    # Build metadata
    metadata = {
        'file': new_jpg_name,
        'archive_eps': new_eps_name,
        'original_slug': slug,
        'type': 'background' if is_background else 'lineart',
        'tagged_at': datetime.now().isoformat(timespec='seconds'),
    }
    if pilier:
        metadata['pilier'] = pilier

    if not dry_run and new_jpg_path.exists():
        palette = extract_palette(new_jpg_path)
        if palette:
            metadata['palette'] = palette
            metadata['dominant_color'] = palette[0]
        dims = extract_dimensions(new_jpg_path)
        if dims:
            metadata['dimensions'] = {'width': dims[0], 'height': dims[1]}
            ratio = dims[0] / dims[1]
            if 0.95 < ratio < 1.05:
                metadata['format'] = 'square'
            elif ratio > 1.5:
                metadata['format'] = 'horizontal'
            elif ratio < 0.7:
                metadata['format'] = 'vertical'
            else:
                metadata['format'] = 'mixed'

    return metadata


def update_metadata_json(target_dir, new_entry):
    metadata_path = target_dir / 'metadata.json'
    if metadata_path.exists():
        try:
            with open(metadata_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
        except Exception:
            data = {'assets': []}
    else:
        data = {'assets': []}
    if 'assets' not in data:
        data['assets'] = []
    data['assets'] = [a for a in data['assets'] if a.get('file') != new_entry['file']]
    data['assets'].append(new_entry)
    data['updated_at'] = datetime.now().isoformat(timespec='seconds')
    data['count'] = len(data['assets'])
    with open(metadata_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


def rebuild_all_metadata():
    print('Rebuild metadata mode: scan complet')
    dirs_to_scan = [BG_DIR]
    if LA_DIR.exists():
        for sub in LA_DIR.iterdir():
            if sub.is_dir():
                dirs_to_scan.append(sub)
    total = 0
    for d in dirs_to_scan:
        if not d.exists():
            continue
        files = sorted([f for f in d.iterdir() 
                       if f.is_file() and f.suffix.lower() in IMG_EXTS])
        if not files:
            continue
        assets = []
        for f in files:
            entry = {
                'file': f.name,
                'type': 'background' if d == BG_DIR else 'lineart',
            }
            if d != BG_DIR:
                entry['pilier'] = d.name
            # Cherche EPS associe
            eps = f.with_suffix('.eps')
            if eps.exists():
                entry['archive_eps'] = eps.name
            palette = extract_palette(f)
            if palette:
                entry['palette'] = palette
                entry['dominant_color'] = palette[0]
            dims = extract_dimensions(f)
            if dims:
                entry['dimensions'] = {'width': dims[0], 'height': dims[1]}
                ratio = dims[0] / dims[1]
                if 0.95 < ratio < 1.05:
                    entry['format'] = 'square'
                elif ratio > 1.5:
                    entry['format'] = 'horizontal'
                elif ratio < 0.7:
                    entry['format'] = 'vertical'
                else:
                    entry['format'] = 'mixed'
            assets.append(entry)
        metadata = {
            'count': len(assets),
            'updated_at': datetime.now().isoformat(timespec='seconds'),
            'assets': assets,
        }
        with open(d / 'metadata.json', 'w', encoding='utf-8') as f:
            json.dump(metadata, f, indent=2, ensure_ascii=False)
        print(f'  {d.relative_to(BANK_DIR)}: {len(assets)} assets')
        total += len(assets)
    print()
    print(f'Total: {total} assets indexes')


def main():
    args = sys.argv[1:]
    if '--rebuild-metadata' in args:
        rebuild_all_metadata()
        return 0

    dry_run = '--dry-run' in args
    no_preview = '--no-preview' in args

    # Collecter tous les sous-dossiers Freepik a traiter
    work_items = []

    # Backgrounds
    for sub_dir, files_in in find_freepik_subdirs(BG_DIR):
        work_items.append({
            'parent': BG_DIR,
            'sub_dir': sub_dir,
            'files_in': files_in,
            'is_background': True,
            'pilier': None,
        })

    # Line art par pilier
    if LA_DIR.exists():
        for pilier_dir in sorted(LA_DIR.iterdir()):
            if not pilier_dir.is_dir():
                continue
            for sub_dir, files_in in find_freepik_subdirs(pilier_dir):
                work_items.append({
                    'parent': pilier_dir,
                    'sub_dir': sub_dir,
                    'files_in': files_in,
                    'is_background': False,
                    'pilier': pilier_dir.name,
                })

    if not work_items:
        print('Aucun sous-dossier Freepik trouve.')
        print(f'Verifie que tes downloads sont dans:')
        print(f'  - {BG_DIR}/<slug-freepik>/{{eps,jpg}}')
        print(f'  - {LA_DIR}/<pilier>/<slug-freepik>/{{eps,jpg}}')
        return 0

    print()
    print('=' * 60)
    print(f'  Tag & Organize v2 - {len(work_items)} sous-dossiers Freepik')
    if dry_run:
        print('  [MODE DRY-RUN: aucun fichier modifie]')
    print('=' * 60)
    print()
    print(f'  Backgrounds:   {sum(1 for w in work_items if w["is_background"])}')
    print(f'  Line art:      {sum(1 for w in work_items if not w["is_background"])}')

    # Stats par pilier
    from collections import Counter
    piliers = Counter(w['pilier'] for w in work_items if w['pilier'])
    for p, c in sorted(piliers.items()):
        print(f'    - {p}: {c}')

    print()
    print('  Pour chaque asset: Enter=accepter / autre nom / s=skip / d=delete / q=quit')

    processed = 0
    skipped = 0

    for i, item in enumerate(work_items, 1):
        if not item['sub_dir'].exists():
            continue
        print(f'\n[{i}/{len(work_items)}]', end='')
        result = process_subdir(
            item['parent'], item['sub_dir'], item['files_in'],
            item['is_background'], item['pilier'],
            dry_run=dry_run, no_preview=no_preview,
        )
        if result == 'QUIT':
            break
        elif result is None:
            skipped += 1
        else:
            if not dry_run:
                update_metadata_json(item['parent'], result)
            processed += 1

    if not no_preview:
        close_previews()

    print()
    print('=' * 60)
    print(f'  Traites: {processed}   Skips: {skipped}')
    print('=' * 60)
    return 0


if __name__ == '__main__':
    sys.exit(main())
