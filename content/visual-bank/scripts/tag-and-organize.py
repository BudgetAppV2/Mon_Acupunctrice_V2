#!/usr/bin/env python3.13
"""
tag-and-organize.py — Script interactif de tri pour la banque visuelle Judith.

WORKFLOW:
1. Place tes downloads Freepik (decompresses) dans content/visual-bank/raw-downloads/
2. Lance ce script: python3 tag-and-organize.py
3. Pour chaque image, le script:
   - Ouvre un preview Mac (Preview.app)
   - Te pose 2-3 questions courtes (1 lettre = 1 reponse)
   - Renomme et range automatiquement
   - Genere le metadata.json
4. A la fin: regroupe les metadata dans 1 metadata.json par dossier

USAGE:
    python3 content/visual-bank/scripts/tag-and-organize.py
    python3 content/visual-bank/scripts/tag-and-organize.py --rebuild-metadata

DEPENDANCES:
    pip install --break-system-packages colorthief Pillow
"""

import os, sys, json, shutil, subprocess
from pathlib import Path
from datetime import datetime

REPO_ROOT = Path('/Users/benoitarchambault/Desktop/Mon_Acupunctrice_V2')
BANK_DIR = REPO_ROOT / 'content' / 'visual-bank'
RAW_DIR = BANK_DIR / 'raw-downloads'
BG_DIR = BANK_DIR / 'backgrounds'
LA_DIR = BANK_DIR / 'lineart'

PILIERS = {
    'g': ('grossesse', 'Grossesse'),
    'p': ('pediatrie', 'Pediatrie'),
    'f': ('fertilite', 'Fertilite'),
    'a': ('anxiete-sommeil', 'Anxiete-Sommeil'),
    'm': ('menopause', 'Menopause'),
    'x': ('acupuncture-sociale', 'Sociale'),
    't': ('transversal', 'Transversal'),
}

IMG_EXTS = {'.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.webp'}
VECTOR_EXTS = {'.svg', '.eps', '.ai', '.pdf'}
ALL_EXTS = IMG_EXTS | VECTOR_EXTS


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


def get_existing_count(target_dir, prefix):
    if not target_dir.exists():
        return 0
    matching = [f for f in target_dir.iterdir() 
                if f.is_file() and f.name.startswith(prefix + '-') 
                and not f.name.startswith('.')]
    return len(matching)


def prompt(question, valid_keys=None, allow_quit=True, allow_skip=True):
    parts = []
    if allow_quit:
        parts.append('q=quit')
    if allow_skip:
        parts.append('s=skip')
    suffix = ' [' + '/'.join(parts) + ']' if parts else ''

    while True:
        try:
            response = input('  ' + question + suffix + ' > ').strip().lower()
        except (KeyboardInterrupt, EOFError):
            print()
            return 'q'

        if not response:
            continue
        if allow_quit and response == 'q':
            return 'q'
        if allow_skip and response == 's':
            return 's'
        if response == '?':
            print('    Tape la lettre. q=quit, s=skip cette image.')
            continue
        if valid_keys and response[0] not in valid_keys:
            print('    Reponse invalide. Cles valides: ' + ', '.join(valid_keys))
            continue
        return response[0]


def is_already_processed(filepath):
    abs_path = filepath.resolve()
    try:
        return (BG_DIR.resolve() in abs_path.parents or 
                LA_DIR.resolve() in abs_path.parents)
    except Exception:
        return False


def process_image(filepath):
    print()
    print('--- ' + filepath.name + ' (' + filepath.suffix + ') ---')

    if filepath.suffix.lower() in IMG_EXTS:
        open_preview(filepath)
    else:
        print('  (Format vectoriel ' + filepath.suffix + ' - preview pas dispo)')

    print()
    type_key = prompt(
        'Type? [b]ackground / [l]ine art / [d]elete',
        valid_keys=['b', 'l', 'd'],
    )
    if type_key == 'q':
        return 'QUIT'
    if type_key == 's':
        return None
    if type_key == 'd':
        try:
            filepath.unlink()
            print('  -> Supprime')
        except Exception as e:
            print('  ERROR delete: ' + str(e))
        return None

    if type_key == 'b':
        target_dir = BG_DIR
        type_prefix = 'boho'
        pilier_dir = None
    else:
        choices_str = ' / '.join(['[' + k + ']=' + v[1] for k, v in PILIERS.items()])
        print('    ' + choices_str)
        pilier_key = prompt('Pilier?', valid_keys=list(PILIERS.keys()))
        if pilier_key == 'q':
            return 'QUIT'
        if pilier_key == 's':
            return None
        pilier_dir, _ = PILIERS[pilier_key]
        target_dir = LA_DIR / pilier_dir
        type_prefix = ''

    print()
    while True:
        try:
            desc = input('  Description (kebab-case, ex: "pastel-pink") > ').strip().lower()
        except (KeyboardInterrupt, EOFError):
            return 'QUIT'
        if not desc:
            print('    Description requise.')
            continue
        if desc == 'q':
            return 'QUIT'
        if desc == 's':
            return None
        desc = desc.replace(' ', '-').replace('_', '-')
        desc = ''.join(c for c in desc if c.isalnum() or c == '-')
        desc = '-'.join(p for p in desc.split('-') if p)
        if len(desc) < 2 or len(desc) > 50:
            print('    Longueur invalide.')
            continue
        break

    target_dir.mkdir(parents=True, exist_ok=True)
    if type_key == 'b':
        prefix_for_count = type_prefix + '-' + desc
        existing = get_existing_count(target_dir, prefix_for_count)
        new_name = '{0}-{1}-{2:02d}{3}'.format(type_prefix, desc, existing+1, filepath.suffix.lower())
    else:
        existing = get_existing_count(target_dir, desc)
        new_name = '{0}-{1:02d}{2}'.format(desc, existing+1, filepath.suffix.lower())

    new_path = target_dir / new_name
    counter = existing + 1
    while new_path.exists():
        counter += 1
        if type_key == 'b':
            new_name = '{0}-{1}-{2:02d}{3}'.format(type_prefix, desc, counter, filepath.suffix.lower())
        else:
            new_name = '{0}-{1:02d}{2}'.format(desc, counter, filepath.suffix.lower())
        new_path = target_dir / new_name

    try:
        shutil.move(str(filepath), str(new_path))
        print('  -> ' + target_dir.name + '/' + new_name)
    except Exception as e:
        print('  ERROR move: ' + str(e))
        return None

    metadata = {
        'file': new_name,
        'original_name': filepath.name,
        'type': 'background' if type_key == 'b' else 'lineart',
        'tagged_at': datetime.now().isoformat(timespec='seconds'),
    }
    if type_key == 'l':
        metadata['pilier'] = pilier_dir

    palette = extract_palette(new_path)
    if palette:
        metadata['palette'] = palette
        metadata['dominant_color'] = palette[0]

    dims = extract_dimensions(new_path)
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

    metadata['target_dir'] = str(target_dir.relative_to(BANK_DIR))
    return metadata


def update_metadata_json(target_dir, new_entry):
    metadata_path = target_dir / 'metadata.json'
    if metadata_path.exists():
        with open(metadata_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
    else:
        data = {'assets': []}

    data['assets'] = [a for a in data['assets'] if a.get('file') != new_entry['file']]
    data['assets'].append(new_entry)
    data['updated_at'] = datetime.now().isoformat(timespec='seconds')
    data['count'] = len(data['assets'])

    with open(metadata_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


def rebuild_all_metadata():
    print('Rebuild mode: scan complet')
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
                       if f.is_file() and f.suffix.lower() in ALL_EXTS])
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

            palette = extract_palette(f)
            if palette:
                entry['palette'] = palette
                entry['dominant_color'] = palette[0]

            dims = extract_dimensions(f)
            if dims:
                entry['dimensions'] = {'width': dims[0], 'height': dims[1]}

            assets.append(entry)

        metadata = {
            'count': len(assets),
            'updated_at': datetime.now().isoformat(timespec='seconds'),
            'assets': assets,
        }
        with open(d / 'metadata.json', 'w', encoding='utf-8') as f:
            json.dump(metadata, f, indent=2, ensure_ascii=False)
        print('  ' + str(d.relative_to(BANK_DIR)) + ': ' + str(len(assets)) + ' assets')
        total += len(assets)

    print()
    print('Total: ' + str(total) + ' assets indexes')


def main():
    args = sys.argv[1:]

    if '--rebuild-metadata' in args:
        rebuild_all_metadata()
        return 0

    if not RAW_DIR.exists():
        print('ERROR: ' + str(RAW_DIR) + ' nexiste pas.')
        return 1

    all_files = []
    for ext in ALL_EXTS:
        all_files.extend(RAW_DIR.rglob('*' + ext))
        all_files.extend(RAW_DIR.rglob('*' + ext.upper()))

    all_files = sorted(set(f.resolve() for f in all_files))

    if not all_files:
        print('Aucune image dans ' + str(RAW_DIR))
        return 0

    print()
    print('=' * 60)
    print('  Tag & Organize - ' + str(len(all_files)) + ' fichiers')
    print('=' * 60)
    print()
    print('  Raw:           ' + str(RAW_DIR))
    print('  Backgrounds:   ' + str(BG_DIR))
    print('  Line art:      ' + str(LA_DIR))
    print()
    print('  ? = aide, q = quit, s = skip')

    processed = 0
    skipped = 0

    for i, filepath in enumerate(all_files, 1):
        if not filepath.exists():
            continue

        print()
        print('[' + str(i) + '/' + str(len(all_files)) + ']', end='')
        result = process_image(filepath)

        if result == 'QUIT':
            break
        elif result is None:
            skipped += 1
        else:
            target_dir = BANK_DIR / result['target_dir']
            del result['target_dir']
            update_metadata_json(target_dir, result)
            processed += 1

    close_previews()

    print()
    print('=' * 60)
    print('  Traites: ' + str(processed) + '   Skips: ' + str(skipped))
    print('=' * 60)
    return 0


if __name__ == '__main__':
    sys.exit(main())
