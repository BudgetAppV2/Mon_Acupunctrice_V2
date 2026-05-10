import path from 'node:path';
import { pickAssets } from './pige';
import { generateCovers } from './compose';
import type { Pilier, ContentType } from './types';

export interface ProposalResult {
  proposalId: string;
  coverUrl: string;
  storyUrl: string;
  combo: { backgroundFile: string; lineartFile: string };
  generatedAt: string;
}

interface GenerateProposalsOutput {
  successes: ProposalResult[];
  failures: { index: number; error: string }[];
}

/**
 * Génère N propositions visuelles distinctes (BG + lineart uniques par combo).
 * Pré-pige les combos de manière cumulative puis génère en parallèle.
 */
export async function generateProposals(
  contentId: string,
  type: ContentType,
  titre: string,
  pilier: Pilier,
  count = 4,
  startIndex = 1,
  excludeBgs: string[] = [],
  excludeLas: string[] = [],
): Promise<GenerateProposalsOutput> {
  // 1. Pré-piger N combos distinctes
  const combos: Array<{ bgPath: string; laPath: string; bgFile: string; laFile: string }> = [];
  const usedBgs = [...excludeBgs];
  const usedLas = [...excludeLas];

  for (let i = 0; i < count; i++) {
    const { backgroundPath, lineartPath } = await pickAssets(pilier, {
      backgrounds: usedBgs,
      lineart: usedLas,
    });
    const bgFile = path.basename(backgroundPath);
    const laFile = path.basename(lineartPath);
    combos.push({ bgPath: backgroundPath, laPath: lineartPath, bgFile, laFile });
    usedBgs.push(bgFile);
    usedLas.push(laFile);
  }

  // 2. Générer en parallèle avec forceAssets
  const results = await Promise.allSettled(
    combos.map((combo, i) => {
      const proposalId = `p${startIndex + i}`;
      return generateCovers({
        contentId: `${contentId}/${proposalId}`,
        type,
        titre,
        pilier,
        forceAssets: { backgroundPath: combo.bgPath, lineartPath: combo.laPath },
        uploadPrefix: 'proposals',
      }).then((output) => ({
        proposalId,
        coverUrl: output.cover16x9,
        storyUrl: output.story9x16,
        combo: { backgroundFile: combo.bgFile, lineartFile: combo.laFile },
        generatedAt: output.metadata.generatedAt,
      }));
    }),
  );

  const successes: ProposalResult[] = [];
  const failures: { index: number; error: string }[] = [];

  results.forEach((result, i) => {
    if (result.status === 'fulfilled') {
      successes.push(result.value);
    } else {
      failures.push({
        index: startIndex + i,
        error: result.reason instanceof Error ? result.reason.message : String(result.reason),
      });
    }
  });

  return { successes, failures };
}
