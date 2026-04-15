# MW-D3 — Notes d'execution

**Date** : 14 avril 2026
**Execute par** : Claude Code (Opus)
**Branche** : `feature/site-public-migration`

---

## Resume

6 FAQ importees dans la collection `faqs` (toutes `status: 'published'`). 5 ressources importees dans la collection `ressources` (toutes `status: 'draft'` car les 5 fichiers source contiennent des temoignages fictifs confirmes dans leur section NOTES). Script `import-seo-geo-content.mjs` cree avec mode `--dry-run`, idempotent (`.doc(slug).set()`).

---

## Temoignages fictifs detectes (5/5 ressources)

**IMPORTANT** : les 5 ressources sont en `status: 'draft'` et `testimonial: ''`. Elles ne seront PAS visibles sur le site public tant que Benoit ne flip pas manuellement le status.

| Ressource | Marqueur detecte | Action requise |
|-----------|-----------------|----------------|
| `acupuncture-fertilite-montreal` | "Sarah, 36 ans" dans le temoignage + "fictif" dans les NOTES | Judith fournit un vrai temoignage ou confirme suppression |
| `acupuncture-grossesse-montreal` | "Marie-Eve 32 ans" — marque "fictif" dans les NOTES | Idem |
| `acupuncture-pediatrique-enfants-bebes` | Temoignage marque "fictif" dans les NOTES | Idem |
| `acupuncture-sante-mentale-anxiete` | Temoignage marque "fictif" dans les NOTES | Idem |
| `acupuncture-sociale-montreal` | Temoignage marque "fictif" dans les NOTES | Idem |

**Procedure pour publier** : Judith fournit un vrai temoignage anonymise avec consentement (ou confirme la suppression definitive du bloc temoignage). Puis Benoit :
1. Met a jour le champ `testimonial` dans la console Firebase (ou corrige le source file et relance le script)
2. Flip `status` de `'draft'` a `'published'`

---

## Points bloquants rencontres

1. **FAQ 02-06 sans champ `question`** : les fichiers 02-06 utilisent un format simplifie (seulement `slug`, `detailedAnswer`, quelques relations) sans champ `question` explicite. La question est dans le H1 du fichier (`# FAQ #N — [question]`). Corrige en parsant le H1 comme fallback.

2. **`faqJson` avec suffixe parenthetique** : le champ dans le fichier 01 est `### CHAMP: faqJson (pour Schema FAQPage)` — l'extracteur `extractField('faqJson')` matchait le debut mais incluait le suffixe dans le contenu. Corrige en essayant le nom complet d'abord.

3. **Tous les temoignages sont fictifs** : les NOTES de validation des 5 fichiers source mentionnent toutes que le temoignage est "fictif" et a remplacer. Le PROMPT initial ne prevoyait que le fichier 01 (Sarah, 36 ans), mais en realite les 5 ressources sont concernees. Les 5 sont correctement passees en `status: 'draft'`.

---

## Statistiques

- **6 FAQ** : `status: 'published'`, categories seance (1), fertilite (3), grossesse (2)
- **5 ressources** : `status: 'draft'` (temoignages fictifs), piliers fertilite, grossesse, pediatrie, transversal, acupuncture-sociale
- **Sections riches** : 7/7 non-vides pour les 5 ressources
- **faqEntries** : 8 pour fertilite, 0 pour les 4 autres (seul le fichier 01 a un champ faqJson)

---

## Livrables crees

| # | Livrable | Fichier(s) |
|---|----------|------------|
| L1 | Script d'import | `scripts/import-seo-geo-content.mjs` |
| L2 | Rapport | `MW-D3_import-faq-existantes/artefacts/import-report.md` |
