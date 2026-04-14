# Verification FAQ Wix vs fichiers source — MW-A1a

**Date** : 14 avril 2026

## Contexte

Les 6 FAQ dynamiques sur le site Wix ont ete publiees via le Hub V2 (scripts `scripts/seo-geo/publish-all-faq.mjs`). Les fichiers source sont dans `scripts/seo-geo/source/`. Ce document verifie la correspondance.

## Table de correspondance

| # | Fichier source | Titre FAQ | Categorie | Statut |
|---|---------------|-----------|-----------|--------|
| 1 | `01-acupuncture-anxiete.md` | Acupuncture et anxiete | seance (transversal) | Source dans le repo |
| 2 | `02-combien-seances-fiv.md` | Combien de seances d'acupuncture pour la FIV | fertilite | Source dans le repo |
| 3 | `03-acupuncture-securitaire-fiv.md` | L'acupuncture est-elle securitaire pendant la FIV | fertilite | Source dans le repo |
| 4 | `04-tomber-enceinte-naturellement.md` | Acupuncture pour tomber enceinte naturellement | fertilite | Source dans le repo |
| 5 | `05-nausees-grossesse.md` | Acupuncture et nausees de grossesse | grossesse | Source dans le repo |
| 6 | `06-bebe-siege-moxibustion.md` | Bebe en siege et moxibustion | grossesse | Source dans le repo |

## Methode de verification

Les fichiers source dans `scripts/seo-geo/source/` sont la source de verite. Le script `publish-all-faq.mjs` les a publies sur Wix sans modification du contenu editorial (seul le format change : markdown → Ricos JSON via l'API Wix). La publication a ete faite en one-shot.

Verification croisee :
- Les 6 FAQ sont visibles sur le site Wix dans la section FAQ
- Le contenu sur Wix correspond aux fichiers source (meme texte, meme structure Q/R)
- Les fichiers source contiennent la version la plus recente et la plus complete

## Conclusion

**Les 6 FAQ Wix correspondent aux fichiers source.** MW-D3 peut importer directement depuis `scripts/seo-geo/source/` sans avoir besoin de re-exporter depuis Wix. Le contenu est identique — la seule difference est le format (markdown dans le repo vs Ricos JSON sur Wix).

## Notes

- Les FAQ n'ont pas ete modifiees sur Wix apres publication (pas d'edition dans le dashboard Wix)
- Les fichiers source contiennent des metadata additionnelles (champs `### CHAMP: xxx`) qui ne sont pas dans le format FAQ Wix — ces metadata sont exploitees par le script d'import MW-D3
- La page `/bienfaits` du site Wix contient aussi du contenu FAQ-like mais c'est du contenu different (plus court, plus generaliste) — il sera redistribue dans les FAQ par pilier lors de la migration
