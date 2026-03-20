# GEMINI_TASK.md
# Tâche unique à donner à Gemini CLI
# Usage: gemini < GEMINI_TASK.md
# (ou copier-coller dans le prompt interactif)

---

Bonjour! Tu as accès au GEMINI.md qui explique le projet.

Maintenant je veux que tu produises les 10 documents manquants
de la Product Bible, en lisant la codebase legacy et les docs
fondateurs déjà créés.

## Documents à produire

Crée ces fichiers directement dans le filesystem :

### 1. project-docs/01_PRODUCT/USER_FLOWS.md
6 flows utilisateur complets :
- Première connexion
- Ajouter une idée
- Préparer une session Blitz (batch filming)
- Monter une vidéo dans l'éditeur
- Publier sur Instagram
- Consulter le calendrier

Format : étapes numérotées, décisions (si/sinon), états d'erreur.
Lire legacy/hub/src/App.jsx pour comprendre la navigation actuelle.

### 2. project-docs/01_PRODUCT/UX_UI_GUIDELINES.md
- Palette de couleurs (lire legacy/hub/tailwind.config.js)
- Typographie
- Composants de base avec variantes (Button, Input, Card, Badge, Modal)
- Navigation mobile
- Ton de voix (messages d'erreur humains, empty states encourageants)
- Règles mobile first 375px

### 3. project-docs/02_ROADMAP/MILESTONE_01.md
Auth Google + Structure Next.js
- Objectif en 1 phrase
- Livrables précis (liste de fichiers)
- Contraintes
- Definition of Done (checkboxes)
- Prompt one shot complet pour Claude Code
  (suivre le format de project-docs/04_DEV_SYSTEM/ONE_SHOT_PLAYBOOK.md)

### 4. project-docs/02_ROADMAP/MILESTONE_02.md
Banque d'idées + Firestore
Même structure. Lire DATA_MODEL.md pour le schéma.

### 5. project-docs/02_ROADMAP/MILESTONE_03.md
Calendrier éditorial
Même structure. Vue mensuelle, code couleur, navigation vers éditeur.

### 6. project-docs/02_ROADMAP/MILESTONE_04.md
Éditeur vidéo — Partie 1 (import + trim + export)
Même structure.
Réutiliser : legacy/hub/src/editor/hooks/useVideoPlayer.js
             legacy/hub/src/editor/store/useEditorStore.js
Note : les proxys Express deviennent des API routes Next.js dans /app/api/
Headers COOP/COEP dans next.config.ts pour FFmpeg.wasm.

### 7. project-docs/02_ROADMAP/MILESTONE_05.md
Éditeur vidéo — Partie 2 (texte + sous-titres + audio)
Même structure.
Réutiliser : legacy/hub/src/editor/components/SubtitlePanel.jsx
             legacy/hub/src/editor/components/AudioPanel.jsx
             legacy/functions/src/transcribe.ts
             legacy/functions/src/jamendo.ts

### 8. project-docs/02_ROADMAP/MILESTONE_06.md
Publication Instagram + Dashboard minimal
Même structure.
Réutiliser : legacy/functions/src/index.ts (publishToInstagram, generateCaption)
Dashboard = 1 ligne : "X publiés · X planifiés · X prêts · X idées"

### 9. project-docs/03_TECH/API_DESIGN.md
Toutes les API routes Next.js nécessaires :
Proxys (proxy-image, proxy-video, proxy-audio) — lire legacy/hub/server.js
Wrappers Cloud Functions (transcribe, publish, generate-caption, search-music)
Format : method + path + params + response + erreurs

### 10. project-docs/03_TECH/SECURITY.md
- Firebase Auth flow + session persistence
- Firestore security rules (depuis DATA_MODEL.md)
- Storage security rules
- Variables d'environnement requises (liste complète)
- Secrets Firebase Functions à setter

## Instructions

- Créer chaque fichier directement (pas juste afficher le contenu)
- Markdown propre et structuré
- Chaque milestone doit inclure un prompt one shot complet et prêt à utiliser
- Garder les contraintes V1 : 6 features max, mobile first, App Router only
- Réutiliser intelligemment la logique du legacy sans copier les mauvaises parties
