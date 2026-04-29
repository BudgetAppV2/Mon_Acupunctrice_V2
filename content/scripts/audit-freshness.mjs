#!/usr/bin/env node
/**
 * audit-freshness.mjs — Vérifie la fraîcheur du contenu
 * 
 * Usage : node content/scripts/audit-freshness.mjs
 * 
 * Analyse tous les fichiers markdown dans content/ et signale :
 * - Les ressources dont la recherche date de > 12 mois
 * - Les ressources dont la source la plus récente a > 2 ans
 */
import { readFileSync, readdirSync } from 'node:fs';
import { resolve, join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CONTENT_DIR = resolve(__dirname, '..');

const WARN_RESEARCH_MONTHS = 12;
const WARN_SOURCE_YEARS = 2;

function checkDir(dir, type) {
  const files = readdirSync(dir).filter(f => f.endsWith('.md') && !f.startsWith('_'));
  const now = new Date();
  const results = [];
  
  for (const file of files) {
    const raw = readFileSync(join(dir, file), 'utf-8');
    const fmMatch = raw.match(/^---\n([\s\S]*?)\n---/);
    if (!fmMatch) continue;
    
    const fm = fmMatch[1];
    const slug = fm.match(/slug: "?([^"\n]+)"?/)?.[1] || file;
    const title = fm.match(/title: "?([^"\n]+)"?/)?.[1] || file;
    const lastResearched = fm.match(/lastResearchedAt: "?([^"\n]+)"?/)?.[1];
    const newestSource = fm.match(/newestSourceYear: (\d+)/)?.[1];
    const status = fm.match(/status: "?([^"\n]+)"?/)?.[1];
    
    const issues = [];
    
    if (lastResearched) {
      const researchDate = new Date(lastResearched);
      const monthsAgo = (now - researchDate) / (1000 * 60 * 60 * 24 * 30);
      if (monthsAgo > WARN_RESEARCH_MONTHS) {
        issues.push(`⚠️  Recherche datant de ${Math.round(monthsAgo)} mois (${lastResearched})`);
      }
    } else {
      issues.push(`❓ Pas de date de recherche (lastResearchedAt)`);
    }
    
    if (newestSource) {
      const yearsOld = now.getFullYear() - Number(newestSource);
      if (yearsOld > WARN_SOURCE_YEARS) {
        issues.push(`⚠️  Source la plus récente a ${yearsOld} ans (${newestSource})`);
      }
    }
    
    results.push({ slug, title, type, status, issues });
  }
  
  return results;
}

// Scan all content dirs
const allResults = [];
for (const type of ['ressources', 'faq', 'blog']) {
  const dir = join(CONTENT_DIR, type);
  try {
    allResults.push(...checkDir(dir, type));
  } catch { /* dir doesn't exist yet */ }
}

console.log('=== Audit de fraîcheur du contenu ===\n');

const needsAttention = allResults.filter(r => r.issues.length > 0);
const ok = allResults.filter(r => r.issues.length === 0);

if (needsAttention.length > 0) {
  console.log(`🔴 ${needsAttention.length} contenus nécessitent attention :\n`);
  for (const r of needsAttention) {
    console.log(`  ${r.type}/${r.slug} (${r.status})`);
    for (const issue of r.issues) console.log(`    ${issue}`);
  }
}

if (ok.length > 0) {
  console.log(`\n🟢 ${ok.length} contenus à jour`);
}

console.log(`\nTotal : ${allResults.length} fichiers audités`);
