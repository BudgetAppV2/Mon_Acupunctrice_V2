# Milestone 13 — UTM Tracking & Wix Mapping

## Objectif
Mesurer le trafic réel généré vers le site Wix de Judith en ajoutant automatiquement des paramètres UTM aux liens insérés dans les captions, et permettre un mapping dynamique des catégories vers les pages correspondantes du site.

## Phase
MESURER

## Dépendances
- **M10/M11** : Distribution Facebook/YouTube en place pour justifier le tracking multi-source.

## User stories couvertes
- En tant que Judith, je veux que mes Reels sur la fertilité renvoient directement vers la page "Fertilité" de mon site.
- En tant que Judith, je veux savoir dans Google Analytics quel Reel a généré le plus de prises de rendez-vous.

## Livrables précis

- **UI & Frontend :**
    - `/app/(app)/profil/page.tsx` : Nouvelle section "Configuration Wix".
    - `components/features/profile/WixMappingForm.tsx` : Formulaire pour mapper les catégories aux URLs Wix.
- **Backend (Cloud Functions) :**
    - `functions/src/generateCaption.ts` : Mise à jour de la logique pour inclure les UTM automatiques.
- **Data Model :**
    - `userProfile` : Ajout du champ `wixUrls` (mapping catégorie -> path).

## Spécifications techniques détaillées

### Mapping Catégorie -> Wix
Judith peut configurer une URL de base (ex: `https://judithtremblay.com`) et des chemins spécifiques par catégorie :
- Fertilité -> `/fertilite`
- Grossesse -> `/grossesse`
- Bien-être -> `/acupuncture`

### Génération automatique d'UTM
À chaque génération de caption, l'URL est construite selon ce pattern :
`URL_CATEGORIE?utm_source={platform}&utm_medium={format}&utm_campaign={cat}_{yyyy_mm}`

Plateformes : `instagram`, `facebook`, `youtube`.
Formats : `reel` (IG/FB), `short` (YT).

### Adaptation par plateforme
- **Instagram** : Ajout du texte "Lien en bio" + l'URL complète avec UTM (même si non cliquable).
- **Facebook / YouTube** : Insertion de l'URL complète avec UTM (cliquable).

### Lien en bio
L'app suggère également un lien optimisé pour la bio Instagram de Judith :
`https://judithtremblay.com?utm_source=instagram&utm_medium=bio`

## Data model changes
- **Collection `users`** :
    - `wixBaseUrl`: string
    - `wixCategoryMapping`: Record<string, string> (ex: `{ 'fertilite': '/services/fertilite' }`)

## Cloud Functions
- **`generateCaption` (Modifiée)** : Intègre la logique de construction d'URL avec UTM.

## Definition of Done
- [ ] La section "Configuration Wix" est présente dans le profil.
- [ ] Le mapping des catégories vers des URLs spécifiques fonctionne et est sauvegardé dans Firestore.
- [ ] Les captions générées pour Instagram/Facebook/YouTube incluent les liens UTM corrects.
- [ ] Une preview du lien généré est visible dans l'interface de configuration.
- [ ] Un test de clic sur YouTube/Facebook redirige vers la bonne page avec les bons paramètres UTM.

## Prompt one shot pour Claude Code

```markdown
# Milestone 13 — UTM Tracking & Wix Mapping

## Contexte
Mon Acupunctrice Hub publie sur 3 plateformes. Judith veut mesurer
quel contenu génère du trafic vers son site Wix. Les UTM params
permettent de tracker la source dans Google Analytics.

## Fichiers à lire AVANT de commencer
- `functions/src/index.ts` → generateCaption actuel (modifier)
- `app/(app)/profil/page.tsx` → page profil (ajouter section Wix)
- `project-docs/01_PRODUCT/CONTENT_STRATEGY.md` → stratégie CTA et UTM
- `project-docs/03_TECH/DATA_MODEL.md` → wixConfig sur users

## Architecture UTM
```typescript
// users/{userId}
wixConfig?: {
  baseUrl: string           // ex: 'https://judithtremblay.com'
  categoryMapping: {        // chemin par catégorie
    fertilite?: string      // ex: '/fertilite'
    grossesse?: string
    bien_etre?: string
    mtc?: string
  }
}

// URL générée automatiquement :
// https://judithtremblay.com/fertilite?utm_source=instagram&utm_medium=reel&utm_campaign=fertilite_2026-03&utm_content={itemId}
```

## Livrables
- [ ] `lib/utils/utm.ts` — utilitaire de génération UTM :
      ```typescript
      function buildWixUrl(params: {
        baseUrl: string,
        categoryPath?: string,
        platform: 'instagram' | 'facebook' | 'youtube',
        category: string,
        itemId?: string
      }): string
      ```
      Encode proprement les params. Fallback sur baseUrl si pas de mapping.
- [ ] `components/features/profile/WixConfig.tsx` — section dans /profil :
      - Champ URL de base
      - 4 champs optionnels par catégorie (Fertilité, Grossesse, Bien-être, MTC)
      - Preview du lien généré en temps réel
      - Sauvegarde dans Firestore users/{userId}.wixConfig
      - Suggestion "lien en bio" : URL avec utm_source=instagram&utm_medium=bio
        + bouton Copier (Heroicon clipboard)
- [ ] Modifier `functions/src/index.ts` (generateCaption) :
      - Accepte nouveau param : `wixUrl?: string`
      - Si wixUrl fourni, l'inclure dans le prompt pour que Claude
        l'insère dans la caption
      - L'API route `/api/generate-caption` lit wixConfig depuis Firestore,
        appelle buildWixUrl, passe le résultat à generateCaption
- [ ] Mettre à jour `app/api/generate-caption/route.ts` :
      - Lire wixConfig depuis users/{userId}
      - Construire l'URL UTM selon la plateforme et la catégorie
      - Passer wixUrl à la Cloud Function
- [ ] Mettre à jour `app/(app)/profil/page.tsx` :
      - Intégrer WixConfig dans la section "Mon site Wix"

## Contraintes
- URLs encodées correctement (encodeURIComponent sur les params)
- Fallback sur baseUrl si aucune catégorie n'est mappée
- Ne pas casser le prompt IA — l'URL est passée au prompt, pas générée par l'IA
- Heroicons, 0 console.log, composants < 150 lignes

## Definition of Done
- [ ] Configuration Wix visible dans /profil
- [ ] Preview UTM en temps réel dans la config
- [ ] Captions générées incluent les UTM corrects
- [ ] UTM adapte utm_source selon la plateforme (instagram/facebook/youtube)
- [ ] Suggestion de lien en bio avec bouton Copier
```
