# Milestone INSTAGRAPI — Stories Instagram avec mention @lasourceensoi via API privée

## Contexte

Le Hub publie déjà des Stories Instagram via l'API Graph officielle (media_type=STORIES)
dans le cron `/api/cron/publish`. Mais l'API officielle ne supporte PAS les stickers
de mention, de lien, ni de hashtag dans les Stories.

Judith veut que chaque Story publiée par le Hub tague **@lasourceensoi** (La Source en Soi,
pk=923941105, 10 302 followers) — la clinique où elle pratique. La clinique accepte d'être
taggée uniquement dans les Stories, PAS dans les Reels/posts.

On a validé un POC local avec `instagrapi` (Python, API privée Instagram) qui publie
des Stories avec `StoryMention`, `StoryLink`, et `StoryHashtag`. Ça fonctionne.

**Découverte importante (tests du 4 avril 2026) :**
Les stickers instagrapi (mention, lien, hashtag) sont **acceptés par Instagram**
et **cliquables** mais **visuellement invisibles** (bug connu instagrapi #549/#2320).
Instagram enregistre les zones cliquables mais ne dessine pas le sticker graphiquement.

**Solution validée :** Le texte (@lasourceensoi, gorendezvous.com/lasourceensoi)
est baked visuellement dans le template Canva de Judith. Les stickers invisibles
d'instagrapi ajoutent les zones cliquables PAR-DESSUS le texte visuel aux mêmes
coordonnées. Résultat : les gens voient le texte ET peuvent taper dessus.

**Coordonnées validées sur le template Canva actuel (1080x1920) :**
- StoryLink (gorendezvous.com) : x=0.5, y=0.75 (aligné sur le texte GORENDEZVOUS)
- StoryMention (@lasourceensoi) : x=0.5, y=0.86 (aligné sur le texte @LASOURCEENSOI)
- StoryHashtag (#acupuncture) : x=0.5, y=0.93 (bas de l'image)

Le défi : le Hub est en Next.js/TypeScript sur Vercel, et `instagrapi` est Python.
On doit intégrer un micro-service Python qui est appelable depuis le cron Next.js.

## Architecture choisie

**Cloud Function Python (Firebase Gen 2)** appelée par le cron Vercel via HTTPS.

```
Vercel Cron (publish)
  → Détecte un item/slot de type story à publier
  → Au lieu d'appeler publishInstagramStory() (API Graph, pas de mention)
  → Appelle la Cloud Function Python via fetch()
  → La CF Python: login instagrapi → upload story → mention + link + hashtag
  → Retourne le story_pk au cron
```

Pourquoi CF Python et pas un script local :
- Le cron tourne sur Vercel (serverless), il ne peut pas appeler un script local
- Firebase Gen 2 supporte Python nativement
- La session instagrapi est persistée dans Cloud Storage entre les exécutions
- Pas besoin d'un serveur dédié

## Stack

- **Cloud Function** : Python 3.12, Firebase Gen 2, HTTPS callable
- **Librairie** : instagrapi 2.3.0, Pillow
- **Session** : Cloud Storage bucket (session.json persisté)
- **Appelant** : Cron Next.js existant (app/api/cron/publish/route.ts)

## Fichiers à lire AVANT de commencer

- `CLAUDE.md` → Règles du projet
- `app/api/cron/publish/route.ts` → Le cron existant qui publie les stories (lignes 72-83 pour le flow story, lignes 100-120 pour l'auto-publish des slots)
- `lib/utils/publishHelpers.ts` → `publishInstagramStory()` actuelle (API Graph, pas de mention) — c'est ce qu'on remplace pour les stories
- `firebase.json` → Config actuelle (pas de functions configurées)
- `vercel.json` → Config crons existants

## Livrable 1 — Cloud Function Python `publish_story_instagrapi`

Créer le dossier `functions-python/` à la racine du projet.

### Structure

```
functions-python/
  main.py           → La Cloud Function
  requirements.txt  → instagrapi, Pillow, firebase-admin, google-cloud-storage
  .gcloudignore
```

### main.py — Logique

```python
# HTTPS Cloud Function Gen 2
# Endpoint : POST /publish-story-instagrapi
# Body JSON : { videoUrl, imageUrl, caption, clinicUsername, linkUrl, hashtags }
# Response  : { success, storyPk } ou { success: false, error }

# 1. Télécharger le media (videoUrl ou imageUrl) dans /tmp/
# 2. Charger la session instagrapi depuis Cloud Storage (bucket configurable)
#    - Si la session n'existe pas ou est invalide, login avec username/password
#    - Garder les mêmes device UUIDs entre les sessions (best practice)
# 3. Résoudre le compte clinique : cl.user_info_by_username(clinicUsername)
#    → Convertir User en UserShort (StoryMention exige UserShort)
# 4. Construire les stickers : StoryMention, StoryLink, StoryHashtag
# 5. Publier : cl.photo_upload_to_story() ou cl.video_upload_to_story()
# 6. Sauvegarder la session mise à jour dans Cloud Storage
# 7. Retourner { success: true, storyPk: story.pk }
```

### Secrets Firebase requis

```bash
firebase functions:secrets:set IG_USERNAME    # Le username Instagram de Judith
firebase functions:secrets:set IG_PASSWORD    # Le password Instagram de Judith
```

### Env vars

```
STORAGE_BUCKET=mon-acupunctrice-hub.firebasestorage.app
SESSION_BLOB=instagrapi/session.json
DEFAULT_CLINIC=lasourceensoi
DEFAULT_LINK=https://acupuncturejudith.ca
```

### Best practices instagrapi à implémenter

- `cl.delay_range = [1, 3]` — délai aléatoire entre requêtes
- Session persistée dans Cloud Storage (pas re-login à chaque appel)
- Garder les device UUIDs constants entre les sessions
- `user_info_by_username()` → convertir `User` en `UserShort` pour `StoryMention`
- En cas de ChallengeRequired, logger l'erreur et retourner un message clair
- Rate limit : max 2 appels/jour (le cron ne tourne qu'1x/jour de toute façon)

## Livrable 2 — Mise à jour firebase.json

Ajouter la config functions Python :

```json
{
  "firestore": { "rules": "firestore.rules", "indexes": "firestore.indexes.json" },
  "storage": { "rules": "storage.rules" },
  "functions": {
    "source": "functions-python",
    "runtime": "python312",
    "codebase": "python-instagrapi"
  }
}
```

## Livrable 3 — Mise à jour du cron publish

Modifier `app/api/cron/publish/route.ts` :

1. Ajouter une constante `INSTAGRAPI_CF_URL` (env var)
2. Créer une fonction `publishStoryViaInstagrapi(item, igUsername, linkUrl)`
   qui fait un POST vers la Cloud Function Python
3. Dans le flow story existant (lignes ~72-83), remplacer l'appel à
   `publishInstagramStory()` (API Graph) par `publishStoryViaInstagrapi()`
4. Même chose pour l'auto-publish des slots story (lignes ~100-120)
5. Garder `publishInstagramStory()` dans publishHelpers.ts comme fallback
   (si la CF Python échoue, on peut retomber sur l'API Graph sans mention)

### Nouvelle fonction dans publishHelpers.ts

```typescript
export async function publishStoryViaInstagrapi(
  item: Record<string, unknown>,
  options?: {
    clinicUsername?: string;
    linkUrl?: string;
    hashtags?: string[];
  }
): Promise<string | null> {
  const cfUrl = process.env.INSTAGRAPI_CF_URL;
  if (!cfUrl) throw new Error('INSTAGRAPI_CF_URL not set');

  const body = {
    videoUrl: item.videoUrl || null,
    imageUrl: item.coverImageUrl || item.storyImageUrl || null,
    caption: item.caption || '',
    clinicUsername: options?.clinicUsername || 'lasourceensoi',
    linkUrl: options?.linkUrl || 'https://acupuncturejudith.ca',
    hashtags: options?.hashtags || ['acupuncture'],
  };

  const res = await fetch(cfUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (!data.success) throw new Error(`instagrapi_failed: ${data.error}`);
  return data.storyPk;
}
```

### Modification du cron

Remplacer dans le block story (~ligne 72) :

```typescript
// AVANT (API Graph, pas de mention)
const storyId = await publishInstagramStory(item, ...);

// APRÈS (instagrapi via CF Python, avec mention @lasourceensoi)
let storyId: string | null = null;
try {
  storyId = await publishStoryViaInstagrapi(item);
  updates.storyPublishMethod = 'instagrapi';
} catch (e) {
  // Fallback sur l'API Graph (sans mention, mais au moins la story est publiée)
  console.warn('instagrapi failed, falling back to Graph API:', e);
  storyId = await publishInstagramStory(item, igAccountId, igToken);
  updates.storyPublishMethod = 'graph_api_fallback';
}
```

## Contraintes

- Ne PAS modifier le flow de publication des Reels (seulement les Stories)
- Ne PAS modifier l'éditeur vidéo
- Ne PAS modifier les composants UI (pas de changement frontend)
- La Cloud Function Python est INDÉPENDANTE du codebase Next.js
- Garder `publishInstagramStory()` (API Graph) comme fallback — ne pas supprimer
- Ne PAS committer de credentials (session.json, password) dans git
- Le fichier `functions-python/` doit avoir son propre .gitignore avec session.json
- Heroicons uniquement, zéro emoji dans l'UI
- 0 console.log en production (console.warn pour le fallback est OK)

## Livrable 4 — Coordonnées stickers dans la Cloud Function

Dans `main.py`, les coordonnées des stickers doivent être configurables
mais avec des défauts alignés sur le template Canva de Judith :

```python
# Défauts alignés sur le template Canva actuel (1080x1920)
DEFAULT_MENTION_COORDS = {"x": 0.5, "y": 0.86, "width": 0.7, "height": 0.04}
DEFAULT_LINK_COORDS    = {"x": 0.5, "y": 0.75, "width": 0.5, "height": 0.08}
DEFAULT_HASHTAG_COORDS = {"x": 0.5, "y": 0.93, "width": 0.5, "height": 0.04}
```

Le body JSON de la CF peut optionnellement recevoir des coordonnées custom :
```json
{
  "mentionCoords": {"x": 0.5, "y": 0.86, "width": 0.7, "height": 0.04},
  "linkCoords": {"x": 0.5, "y": 0.75, "width": 0.5, "height": 0.08}
}
```

Note : les stickers sont **invisibles visuellement mais cliquables**.
Le texte visible est dans l'image Canva elle-même.

## Livrable 5 — Auto-crop story (9:16) → blog (16:9)

Ajouter une fonction utilitaire dans `lib/utils/storyImageGenerator.ts` :

```typescript
export async function cropStoryToBlogCover(
  storyImageUrl: string
): Promise<Blob> {
  const img = await fetch(storyImageUrl)
    .then(r => r.blob())
    .then(b => createImageBitmap(b));

  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 675; // 16:9
  const ctx = canvas.getContext('2d')!;

  // Crop le centre de l'image 9:16 pour obtenir du 16:9
  const cropH = img.width * (9 / 16); // hauteur du crop dans la source
  const srcY = (img.height - cropH) / 2; // centrer verticalement
  ctx.drawImage(img, 0, srcY, img.width, cropH, 0, 0, 1200, 675);

  return new Promise(resolve =>
    canvas.toBlob(b => resolve(b!), 'image/jpeg', 0.92)
  );
}
```

Cette fonction prend l'image story (1080x1920) uploadée par Judith dans le
BlogEditor et génère automatiquement une version 16:9 (1200x675) pour le blog Wix.
Le crop prend la bande centrale (30-70% de la hauteur) qui contient le titre.

Appeler cette fonction dans `useBlogSequence.ts` quand `blogImageUrl` est fourni,
pour créer automatiquement un `blogCoverUrl` en 16:9 et le passer à l'API Wix.

## Variables d'environnement Vercel à ajouter

```
INSTAGRAPI_CF_URL=https://[region]-mon-acupunctrice-hub.cloudfunctions.net/publish_story_instagrapi
```

## Deploiement

```bash
# Deploy de la Cloud Function Python
cd functions-python
firebase deploy --only functions:publish_story_instagrapi

# Ajouter l'env var Vercel
vercel env add INSTAGRAPI_CF_URL
```

## Definition of Done

### Cloud Function instagrapi (L1-L3)
- [ ] `functions-python/main.py` existe et est syntaxiquement valide
- [ ] `functions-python/requirements.txt` liste instagrapi, Pillow, firebase-admin, google-cloud-storage
- [ ] `firebase.json` inclut la config functions Python
- [ ] `publishStoryViaInstagrapi()` existe dans `lib/utils/publishHelpers.ts`
- [ ] Le cron `publish/route.ts` appelle `publishStoryViaInstagrapi()` pour les stories
- [ ] Le cron a un fallback vers `publishInstagramStory()` (API Graph) si la CF échoue
- [ ] Aucun credential hardcodé dans le code (secrets Firebase uniquement)
- [ ] `functions-python/.gitignore` exclut session.json et __pycache__

### Coordonnées stickers (L4)
- [ ] Coordonnées par défaut alignées sur le template Canva (mention y=0.86, link y=0.75, hashtag y=0.93)
- [ ] Coordonnées configurables via le body JSON de la CF

### Auto-crop (L5)
- [ ] `cropStoryToBlogCover()` existe dans `storyImageGenerator.ts`
- [ ] La fonction crop le centre d'une image 9:16 en 16:9 (1200x675)
- [ ] `useBlogSequence.ts` appelle le crop quand `blogImageUrl` est fourni
