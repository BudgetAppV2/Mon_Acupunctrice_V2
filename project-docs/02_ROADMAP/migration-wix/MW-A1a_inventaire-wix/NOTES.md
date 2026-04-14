# MW-A1a — Notes d'execution

**Date** : 14 avril 2026
**Execute par** : Claude Code (Opus)
**Branche** : `feature/site-public-migration`

---

## Resume

Inventaire Wix complet : 11 articles de blog exportes en Ricos JSON brut avec 40 images (11 covers + 29 inline), 8 pages statiques exportees en markdown, 6 FAQ verifiees contre les fichiers source, matrice de redirections 301 complete (8 pages + 11 articles + 2 pages secondaires + backlink La Source en Soi). Zero modification du code de l'app.

---

## Points bloquants rencontres

1. **API Wix GET individual post avec fieldsets** : le endpoint `GET /blog/v3/posts/{id}?fieldsets=GENERATED_RICH_CONTENT` retourne un 400 "Failed to parse JSON or deserialize protobuf message" quand le header `Content-Type: application/json` est present. Solution : retirer le header Content-Type pour les requetes GET et utiliser `fieldsets=RICH_CONTENT` (pas `GENERATED_RICH_CONTENT`).

2. **Format Ricos IMAGE src** : le champ `imageData.image.src` est un objet `{ id: "hash~mv2.ext" }` (pas un string URL). L'URL se construit : `https://static.wixstatic.com/media/${src.id}`.

3. **Pages statiques Wix CSR** : contrairement a l'hypothese du scouting (100% CSR), Wix Thunderbolt fait un SSR partiel — le contenu textuel est present dans le HTML initial. Extraction par fetch + parsing HTML reussie pour les 8 pages.

---

## Articles les plus interessants

1. **"Acupuncture et nausees de grossesse"** (janv. 2026) : article le plus recent et le plus complet. 4 images inline, contenu structure avec references scientifiques. Seule position organique notable (~position 6). A proteger en priorite avec les redirections 301.

2. **"Acupuncture et fertilite : preparer son corps a la conception"** (avr. 2025) : 4 images inline, contenu detaille sur la FIV et la preparation preconceptionnelle. Bonne base pour le hub SEO `/services/fertilite`.

3. **"L'acupuncture sociale"** (mars 2025) : article court (3 min) mais strategiquement important — c'est le seul contenu qui couvre le positionnement differenciateur de Judith. Le slug Wix contient des accents (`communauté`) — attention aux redirections.

---

## Statistiques

- **Articles blog** : 11 exportes (Ricos JSON + metadata)
- **Images** : 40 telechargees (11 covers + 29 inline), taille totale ~15 MB
- **Pages statiques** : 8 exportees en markdown
- **FAQ** : 6 verifiees (correspondance avec `scripts/seo-geo/source/` confirmee)
- **Redirections** : 22 lignes dans la matrice (8 pages + 11 articles + 2 pages secondaires + 1 backlink)

---

## Gotcha pour MW-B4 (parser Ricos)

Le format Ricos v3 a des specifites decouvertes pendant l'export :
- Les noeuds IMAGE stockent `src` comme objet `{ id: "hash" }`, pas string
- Les covers ne sont PAS dans le Ricos JSON — elles sont dans `post.media.wixMedia.image`
- Les env vars dans le repo utilisent deux noms pour la meme cle API : `WIX_API_KEY` (routes) et `CMS_PUBLICATION_KEY` (scripts seo-geo). Le script supporte les deux.
