import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import type { Pilier, AssetMetadata } from './types';

const BANK_DIR = path.join(process.cwd(), 'content/visual-bank');
const BG_DIR = path.join(BANK_DIR, 'backgrounds');
const LA_DIR = path.join(BANK_DIR, 'lineart');

// Cache metadata 60s
let bgCache: { data: AssetMetadata; ts: number } | null = null;
const laCache = new Map<string, { data: AssetMetadata; ts: number }>();
const CACHE_TTL = 60_000;

async function loadMetadata(dir: string): Promise<AssetMetadata> {
  const metaPath = path.join(dir, 'metadata.json');
  const raw = await readFile(metaPath, 'utf-8');
  return JSON.parse(raw) as AssetMetadata;
}

async function getBackgroundMetadata(): Promise<AssetMetadata> {
  if (bgCache && Date.now() - bgCache.ts < CACHE_TTL) return bgCache.data;
  const data = await loadMetadata(BG_DIR);
  bgCache = { data, ts: Date.now() };
  return data;
}

async function getLineartMetadata(pilier: string): Promise<AssetMetadata> {
  const cached = laCache.get(pilier);
  if (cached && Date.now() - cached.ts < CACHE_TTL) return cached.data;
  const dir = path.join(LA_DIR, pilier);
  const data = await loadMetadata(dir);
  laCache.set(pilier, { data, ts: Date.now() });
  return data;
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Sélectionne un background et un line art pour le pilier donné.
 * Phase 1 : pige aléatoire simple (anti-répétition en Phase 2).
 */
export async function pickAssets(
  pilier: Pilier,
  exclude?: { backgrounds?: string[]; lineart?: string[] },
): Promise<{ backgroundPath: string; lineartPath: string }> {
  // Backgrounds
  const bgMeta = await getBackgroundMetadata();
  let bgCandidates = bgMeta.assets.filter((a) => a.file.match(/\.(jpg|jpeg|png)$/i));
  if (exclude?.backgrounds?.length) {
    bgCandidates = bgCandidates.filter((a) => !exclude.backgrounds!.includes(a.file));
  }
  if (bgCandidates.length === 0) throw new Error('No background assets available');
  const bgFile = pickRandom(bgCandidates).file;

  // Line art for pilier
  let lineartPilier = pilier;
  let laMeta: AssetMetadata;
  try {
    laMeta = await getLineartMetadata(pilier);
  } catch {
    // Fallback transversal si pilier vide
    lineartPilier = 'transversal';
    laMeta = await getLineartMetadata('transversal');
  }

  let laCandidates = laMeta.assets.filter((a) => a.file.match(/\.(jpg|jpeg|png)$/i));

  // Si < 3 assets, fallback transversal
  if (laCandidates.length < 3 && lineartPilier !== 'transversal') {
    try {
      const transversalMeta = await getLineartMetadata('transversal');
      const transversalAssets = transversalMeta.assets.filter((a) =>
        a.file.match(/\.(jpg|jpeg|png)$/i),
      );
      laCandidates = [...laCandidates, ...transversalAssets];
    } catch {
      // transversal vide — on garde ce qu'on a
    }
  }

  if (exclude?.lineart?.length) {
    laCandidates = laCandidates.filter((a) => !exclude.lineart!.includes(a.file));
  }
  if (laCandidates.length === 0) throw new Error(`No lineart assets for pilier ${pilier}`);
  const laAsset = pickRandom(laCandidates);

  // Déterminer le dossier réel du line art sélectionné
  const laDir = await findLineartDir(laAsset.file, pilier);

  return {
    backgroundPath: path.join(BG_DIR, bgFile),
    lineartPath: path.join(laDir, laAsset.file),
  };
}

async function findLineartDir(filename: string, primaryPilier: string): Promise<string> {
  // Essayer le pilier principal d'abord
  const primaryDir = path.join(LA_DIR, primaryPilier);
  try {
    const files = await readdir(primaryDir);
    if (files.includes(filename)) return primaryDir;
  } catch {
    // ignore
  }
  // Fallback transversal
  return path.join(LA_DIR, 'transversal');
}
