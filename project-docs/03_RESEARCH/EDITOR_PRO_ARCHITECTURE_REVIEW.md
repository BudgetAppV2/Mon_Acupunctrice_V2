# Review Stratégique — Architecture Éditeur Pro

**Date :** 23 mars 2026
**Projet :** Mon Acupunctrice Hub V2
**Rôle :** Directeur technique senior & Stratège produit

---

## 1. Ce qui est solide (Les bonnes décisions)

- **Le pipeline asymétrique "Preview DOM/CSS + Export Canvas 2D" :** C'est la meilleure décision pour une PWA. Essayer de faire un éditeur WebGL/Canvas temps réel sur Safari iOS avec du React amènerait trop de lenteurs. Le DOM est parfait pour l'UI, et le Canvas 2D frame-by-frame (seek-based) garantit une qualité d'export parfaite, même si c'est plus lent.
- **La librairie `WebCodecs` :** C'est natif, c'est léger, et ça permet de contrôler le framerate et la qualité.
- **Le modèle de composition plat (Zustand) :** Un Scene Graph complexe (Layer > Track > Node) n'est pas nécessaire pour des Reels de 30 à 90 secondes. Le store actuel avec les entités `overlays`, `subtitles` et `clips` est lisible et suffisant.
- **La décision de "Build" vs "Buy" (Remotion/SDKs) :** Payer un SDK ou une infrastructure serveur (Lambda) pour une seule utilisatrice qui crée des vidéos courtes est overkill.

## 2. Problèmes critiques à corriger avant de coder

- **L'absence de prévisualisation "vraie" :** Dans l'architecture proposée, les effets de texte avancés (néon, gradients), les LUTs et le grain *n'apparaissent que dans l'export*. Si l'export prend 2 minutes, l'UX est inacceptable. Judith va devoir faire des exports d'essai.
  👉 **Solution :** Il faut un mode "Preview Haute Qualité" (un bouton pause qui génère via Canvas la frame courante avec tous ses effets et l'affiche au-dessus de la vidéo).
- **L'illusion de la personnalisation vs la fatigue cognitive :** Judith veut de la structure. Lui donner 30 polices × 8 effets × 11 animations, c'est créer l'éditeur Canva complet qu'elle n'a probablement pas le temps d'apprendre.
  👉 **Solution :** Cacher ces options individuelles dans un mode "Avancé", et créer des **"Style Presets" globaux (Thèmes)** applicables en 1 clic.
- **L'Auto-Sizing des textes :** Le scale du Canvas 2D actuel (`scale = w / 375`) est rudimentaire. Si Judith tape un texte trop long, il sortira de l'écran car le `fillText` n'a pas de retour à la ligne automatique (word-wrap).

## 3. Risques techniques avec estimations de performance

- **Goulot d'étranglement CPU (LUTs et `getImageData`) :**
  - **Données :** Vidéo 1080×1920 = ~2 millions de pixels. Frame rate = 30 fps. Durée = 60s. Soit **1800 frames**.
  - **Coût Canvas 2D :** Appliquer une LUT 3D pixel-par-pixel via `getImageData/putImageData` prend environ 50ms par frame en JS pur sur un mobile.
  - **Estimation :** 1800 frames × 50ms = **90 secondes justes pour traiter les LUTs**, sans compter le décodage vidéo, le dessin des textes et l'encodage H.264. L'export complet d'un Reel de 1 minute prendra 2 à 3 minutes.
  - **Mitigation :** Soit repousser les LUTs, soit faire le rendu dans un **Web Worker (`OffscreenCanvas`)** pour ne pas bloquer l'UI de l'app.
- **Lottie frame-by-frame (`goToAndStop`) :** Fonctionne très bien, mais il est impératif que les assets JSON Lottie soient complètement *loadés* avant que la boucle WebCodecs ne démarre, sinon les premières frames de l'export seront vides.

## 4. Réordonnancement proposé des phases (Roadmap)

L'ordre actuel mise trop sur la technique pure avant la valeur perçue. Voici le nouvel ordre orienté "Impact Utilisateur" :

1. **Phase 1 : Thèmes & Typographie pro (Quick Win Immédiat)**
   - 10-15 Polices Google clés.
   - 3 styles de sous-titres pro (le Karaoke amélioré, Pill, Outline).
   - "Style Presets" : 1 clic applique (Police, Style Sous-titre, Palette de couleurs).
   - *Pourquoi : Impact visuel immédiat. Les vidéos ont l'air "Pro" sans effort.*
2. **Phase 2 : Optimisation Qualité & Web Worker**
   - Augmentation du bitrate H.264 à 8Mbps.
   - Déplacement de l'export WebCodecs vers un Web Worker (OffscreenCanvas) = l'UI ne gèle plus.
   - Les animations de texte (simples, gérées dans le worker).
3. **Phase 3 : Templates de Narration & Audio**
   - Templates structurels JSON (Hook, 3 points, Outro).
   - Audio Ducking (via Web Audio API, très fort impact pro).
4. **Phase 4 : Les "Nice to Have" Cinématiques**
   - LUTs, Grain, Lottie Stickers.

## 5. Features manquantes ("Wow" features à ajouter)

- **Auto-silence removal :** Une feature d'édition qui scanne l'audio pour couper automatiquement les silences de plus de 0.8s. Sur des face-caméras de 90s, ça donne un rythme extrêmement pro immédiatement (style CapCut "Cut silences").
- **Auto-sizing Text (Word-wrap) :** Indispensable. Le Canvas doit avoir une fonction utilitaire `wrapText()` qui gère les retours à la ligne si le texte dépasse `maxWidth`.

## 6. Architecture révisée : Le Concept de "Thème" (Style Preset)

Plutôt que d'avoir des `TextOverlayItem` avec des propriétés infinies, nous introduisons le concept de **`Theme`** dans l'architecture :

```typescript
// Un "Thème" contrôle l'esthétique globale de la vidéo
interface VideoTheme {
  id: string;               // ex: 'minimal_chic'
  name: string;             // ex: 'Minimal & Chic'
  fontFamily: {
    primary: string;        // Pour les titres
    secondary: string;      // Pour le corps de texte
  };
  subtitleStyle: SubtitleStyle; // ex: 'pill'
  colorPalette: {
    text: string;           // Couleur principale (ex: Noir)
    accent: string;         // Couleur pour Karaoke/mots-clés (ex: Beige sage)
    background: string;     // Couleur pour les fonds (ex: rgba(255,255,255,0.8))
  };
  defaultTextAnimation: TextAnimation; // ex: 'fade_in'
}
```
*Le Store `useEditorStore` aura un `activeTheme: 'minimal_chic'`. Judith choisit le thème, l'éditeur fait le reste.*

## 7. Premier Milestone Concret (L'action immédiate)

Pour le prochain "One-Shot" avec Claude Code, voici **exactement** ce qu'il faut coder pour que Judith voie un changement radical :

**Action : Le "Subtitle & Font Upgrade" (Impact maximum, 0 risque de perf)**
1. **Ajouter 10 fonts Google :** Insérer le chargement dynamique dans l'éditeur.
2. **Refaire `drawSubtitles.ts` :** Implémenter deux nouveaux styles :
   - `bold_outline` : Contour de 6px noir, remplissage blanc, très gras.
   - `karaoke_pro` : Le mot courant est mis en évidence (`accent color` du thème) et est *légèrement plus grand (scale 1.1)* que les autres.
3. **Ajouter le Word-Wrap :** Une fonction utilitaire dans `drawOverlays.ts` qui s'assure que le texte ne déborde jamais du Canvas.
4. **Augmenter la qualité :** Passer le Bitrate de 3.5Mbps à 8Mbps dans `exportWebCodecs.ts`.

Ce milestone prend 1-2 heures à coder, ajoute 0 dépendance, ne ralentit pas l'export, et rend les Reels instantanément dignes des créateurs pros.
