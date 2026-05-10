import path from 'node:path';
import { readFile } from 'node:fs/promises';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { pickAssets } from './pige';
import { lineArtToDataUrl } from './line-art-processor';
import { analyzePlacementCover, analyzePlacementStory } from './placement-analyzer';
import { loadFonts, buildSatoriFontConfig } from './fonts';
import { uploadCoverPng } from './upload';
import { buildCoverBlogTemplate } from './templates/cover-blog';
import { buildStoryInstagramTemplate } from './templates/story-instagram';
import type { GenerateCoverInput, GenerateCoverOutput } from './types';

const SURTITRE_MAP: Record<string, string> = {
  ressource: 'Ressource',
  faq: 'FAQ',
  blog: 'Article',
};

const CTA_LABELS = {
  ressource: 'Lire la suite',
  reservation: 'Réserver une séance',
};

function bufferToDataUrl(buf: Buffer, mime: string): string {
  return `data:${mime};base64,${buf.toString('base64')}`;
}

export async function generateCovers(input: GenerateCoverInput): Promise<GenerateCoverOutput> {
  // 1. Pige assets (or use forced combo for M2A proposals)
  const { backgroundPath, lineartPath } = input.forceAssets
    ? input.forceAssets
    : await pickAssets(input.pilier, input.excludeAssets);

  // 2. Process en parallèle : line art (SVG ou raster), placements (cover + story), fonts, bg read
  const [laDataUrl, placementCover, placementStory, fonts, bgBuffer] = await Promise.all([
    lineArtToDataUrl(lineartPath),
    analyzePlacementCover(backgroundPath),
    analyzePlacementStory(backgroundPath),
    loadFonts(),
    readFile(backgroundPath),
  ]);

  const bgDataUrl = bufferToDataUrl(bgBuffer, 'image/jpeg');
  const surtitre = SURTITRE_MAP[input.type] || 'Ressource';
  const ctaMode = input.ctaMode || 'ressource';
  const satoriFonts = buildSatoriFontConfig(fonts);

  // 3. Génère 2 SVGs en parallèle
  const [coverSvg, storySvg] = await Promise.all([
    satori(
      buildCoverBlogTemplate({
        bgDataUrl,
        laDataUrl,
        surtitre,
        titre: input.titre,
        width: 1920,
        height: 1080,
        placementX: placementCover.xPercent,
        placementY: placementCover.yPercent,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      }) as any,
      { width: 1920, height: 1080, fonts: satoriFonts },
    ),
    satori(
      buildStoryInstagramTemplate({
        bgDataUrl,
        laDataUrl,
        surtitre,
        titre: input.titre,
        width: 1080,
        height: 1920,
        placementX: placementStory.xPercent,
        placementY: placementStory.yPercent,
        ctaMode,
        ctaLabel: CTA_LABELS[ctaMode],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      }) as any,
      { width: 1080, height: 1920, fonts: satoriFonts },
    ),
  ]);

  // 4. SVG → PNG en parallèle
  const [coverPng, storyPng] = await Promise.all([
    renderPng(coverSvg, 1920),
    renderPng(storySvg, 1080),
  ]);

  // 5. Upload en parallèle
  const prefix = input.uploadPrefix || 'covers';
  const [cover16x9Url, story9x16Url] = await Promise.all([
    uploadCoverPng(coverPng, input.contentId, 'cover16x9', prefix),
    uploadCoverPng(storyPng, input.contentId, 'story9x16', prefix),
  ]);

  return {
    cover16x9: cover16x9Url,
    story9x16: story9x16Url,
    assets: {
      backgroundFile: path.basename(backgroundPath),
      lineartFile: path.basename(lineartPath),
    },
    metadata: {
      placementZone: placementCover,
      generatedAt: new Date().toISOString(),
    },
  };
}

function renderPng(svg: string, width: number): Buffer {
  const resvg = new Resvg(svg, {
    background: '#F5F0E8',
    fitTo: { mode: 'width', value: width },
  });
  return resvg.render().asPng();
}
