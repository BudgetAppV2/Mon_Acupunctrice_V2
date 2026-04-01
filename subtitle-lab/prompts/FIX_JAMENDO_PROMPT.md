# FIX — Intégrer Jamendo dans AudioSheet V2

## Objectif
L'AudioSheet V2 n'a que l'import fichier local. Le Hub V1 a déjà
Jamendo intégré — réutiliser exactement le même pattern.

## Code existant dans le Hub V1 (à réutiliser)
- `components/features/editor/panels/AudioPanel.tsx` — le panneau audio V1 complet
  avec recherche Jamendo, preview, moods, import
- `lib/hooks/useMusicSearch.ts` — hook de recherche Jamendo (déjà partagé)
- `app/api/search-music/route.ts` — proxy vers Cloud Function searchJamendo
- `app/api/proxy-audio/route.ts` — proxy audio avec headers CORS

Le hook `useMusicSearch` et les routes API sont déjà dans le Hub —
ils n'ont PAS besoin d'être recréés. Il faut juste les utiliser
dans l'AudioSheet V2.

## Fichier à modifier
- `components/features/editor-v2/AudioSheet.tsx`

## Ce qu'il faut faire
Adapter l'AudioSheet V2 pour avoir le même comportement que l'AudioPanel V1 :
1. Importer `useMusicSearch` de `@/lib/hooks/useMusicSearch`
2. Ajouter la barre de recherche + boutons moods
3. Ajouter la liste de résultats avec preview play/stop
4. Ajouter l'import via `addAudioClip` du store V2
5. Garder le bouton "Fichier local" existant
6. Utiliser `/api/proxy-audio` pour le preview et l'import
7. Style cohérent avec le reste du V2 (Tailwind dark, emerald accent)

## Attention
- Le store V2 utilise `addAudioClip(file, name)` avec un File object
- Pour Jamendo, on n'a pas de File — on a une URL proxy
- Adapter: soit accepter une URL directement dans le store,
  soit fetch le blob et créer un File (comme le V1 fait avec setAudioTrack)
- Regarder comment le V1 fait: `setAudioTrack(proxyUrl, name)` — il passe l'URL directement

## Definition of Done
- [ ] Barre de recherche Jamendo visible dans l'onglet Audio
- [ ] Boutons moods (relaxing, acoustic, ambient, energetic)
- [ ] Résultats avec preview play/stop
- [ ] Import d'un track Jamendo ajoute l'audio à la timeline
- [ ] Le fichier local continue de fonctionner
- [ ] npm run build passe
