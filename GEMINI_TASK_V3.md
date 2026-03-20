# GEMINI_TASK_V3.md
# Tâche — Produire les milestones M08 à M13 (Phase 2 : Lancer → Distribuer → Mesurer)
# Usage: gemini puis coller ce contenu

---

Le projet a 7 milestones complétés (M01-M07). L'app fonctionne
de bout en bout : idéation → montage vidéo → publication Instagram.

Lis TOUS ces documents AVANT de générer quoi que ce soit :

**Vision & décisions :**
- `project-docs/00_VISION/VISION_FINALE.md`
- `project-docs/00_VISION/DECISIONS_PRODUIT.md`

**Produit :**
- `project-docs/01_PRODUCT/PRD_V1.md`
- `project-docs/01_PRODUCT/CONTENT_STRATEGY.md` ← stratégie YouTube, CTA, UTM
- `project-docs/01_PRODUCT/COVER_IMAGE_SPEC.md`

**Tech :**
- `project-docs/03_TECH/ARCHITECTURE.md`
- `project-docs/03_TECH/DATA_MODEL.md`
- `project-docs/03_TECH/API_DESIGN.md`
- `project-docs/03_TECH/SECURITY.md`

**Passation :**
- `project-docs/HANDOFF.md` ← résumé complet de l'état du projet

**Dev system :**
- `project-docs/04_DEV_SYSTEM/ONE_SHOT_PLAYBOOK.md`

**Milestones précédents (pour comprendre le pattern) :**
- `project-docs/02_ROADMAP/_completed/MILESTONE_07.md` ← dernier milestone, bon exemple de format

**Codebase actuelle :**
- Parcours `src/` pour comprendre la structure des composants existants
- Parcours `functions/src/` pour les Cloud Functions déployées
- Lis `next.config.ts` pour les headers COOP/COEP
- Lis `firebase.json` et `firestore.indexes.json`

---

## Ce qui change vs. Phase 1 (M01-M07)

1. **Le legacy n'existe plus** — tout est dans le repo Next.js, ne référence rien dans `_archive/`
2. **L'app est fonctionnelle** — chaque milestone AJOUTE à une app qui marche déjà
3. **Le token Instagram est hardcodé** — M09 corrige ça avec OAuth
4. **Pas de déploiement** — M08 met l'app en production sur Vercel
5. **Distribution = Instagram seulement** — M10 ajoute Facebook, M11 YouTube
6. **Aucune analytics** — M12 ajoute les stats Instagram Insights

---

## Tâche

Crée ces 6 fichiers directement dans le filesystem :

---

### project-docs/02_ROADMAP/MILESTONE_08.md
**Déploiement Vercel — Mettre l'app en production**

Phase : LANCER
Dépendances : M01-M07 complétés

Détailler précisément :

**Configuration Vercel :**
- Variables d'environnement à configurer (lire .env.local pour la liste complète)
- Framework preset : Next.js
- Build command, output directory
- Region : iad1 (US East — proche de Firebase us-central1)

**Domaine :**
- Domaine Vercel par défaut d'abord (*.vercel.app)
- Optionnel : domaine custom à brancher plus tard

**Headers COOP/COEP en production :**
- Valider que les headers dans next.config.ts passent en production
- SharedArrayBuffer requis pour FFmpeg.wasm
- Tester que l'export vidéo fonctionne sur Vercel

**PWA en production :**
- Service worker, manifest.json
- Test install sur iPhone réel
- Splash screen iOS
- Icônes 192px et 512px

**Firebase en production :**
- Firestore security rules déployées
- Storage rules : vidéos publiques pour Instagram API
- Vérifier les index Firestore

**Tests de validation :**
- Flow complet : créer idée → monter vidéo → exporter → publier
- Performance : temps de chargement initial < 3s
- Mobile : tester sur iPhone Safari + PWA standalone

**Definition of Done :**
- [ ] App accessible sur URL Vercel
- [ ] Variables d'environnement configurées
- [ ] Login Google fonctionne
- [ ] Export vidéo fonctionne (FFmpeg.wasm avec SharedArrayBuffer)
- [ ] Publication Instagram fonctionne depuis production
- [ ] PWA installable sur iPhone
- [ ] Firestore security rules déployées

---

### project-docs/02_ROADMAP/MILESTONE_09.md
**Token Meta long-lived + OAuth Instagram**

Phase : DISTRIBUER
Dépendances : M08 (app en production, URL stable)

Contexte technique crucial :
- Actuellement : token hardcodé dans Firebase Secrets (META_USER_TOKEN)
- Problème : les tokens Meta expirent (short-lived = 1h, long-lived = 60j)
- Solution : flow OAuth dans /profil + refresh automatique

Détailler précisément :

**Meta App Configuration :**
- App ID existant : 823305796703895
- IG App ID : 1224688753149053
- Business Login for Instagram (instagram_business_basic + instagram_business_content_publish)
- Redirect URI à configurer pour le domaine Vercel

**Flow OAuth dans /profil :**
- Nouveau composant : InstagramConnectButton
- État : non connecté / connecté (afficher nom du compte + date d'expiration)
- Bouton "Connecter Instagram" → redirect Meta OAuth
- Callback → échange code → token long-lived (60 jours)
- Stockage sécurisé du token dans Firestore (chiffré ou dans une collection sécurisée)
- Affichage de la date d'expiration du token

**Refresh automatique :**
- Cloud Function schedulée : `refreshMetaToken` (cron weekly)
- Appelle l'endpoint Meta pour renouveler le token avant expiration
- Log en cas d'échec + email d'alerte à Benoît
- Si le token expire malgré tout : état "déconnecté" dans le profil avec bouton reconnexion

**Migration :**
- Supprimer le secret META_USER_TOKEN hardcodé après migration
- publishToInstagram et schedulePublisher lisent le token depuis Firestore au lieu des secrets
- Garder META_IG_ACCOUNT_ID dans Firestore aussi (récupéré pendant OAuth)

**Sécurité :**
- Le token ne doit JAMAIS être exposé côté client
- Toute opération utilisant le token passe par une Cloud Function
- Firestore rules : seul le userId propriétaire peut lire son propre token

**Definition of Done :**
- [ ] Bouton "Connecter Instagram" dans /profil
- [ ] Flow OAuth complet (redirect → callback → token stocké)
- [ ] Token long-lived (60 jours) stocké dans Firestore
- [ ] Cloud Function de refresh automatique déployée
- [ ] publishToInstagram utilise le token Firestore
- [ ] schedulePublisher utilise le token Firestore
- [ ] État déconnecté visible si token expiré
- [ ] Publication fonctionne avec le nouveau flow

---

### project-docs/02_ROADMAP/MILESTONE_10.md
**Facebook Reels — Distribution Meta étendue**

Phase : DISTRIBUER
Dépendances : M09 (OAuth Meta en place, token long-lived)

Contexte :
- Facebook Reels utilise la MÊME Meta Graph API que Instagram
- Le token Meta de M09 donne déjà accès à Facebook (si les permissions sont bonnes)
- C'est le milestone le plus "gratuit" — peu de nouveau code

Détailler précisément :

**Permissions Meta additionnelles :**
- Vérifier que le token OAuth de M09 inclut les permissions Facebook Pages
- Si non : ajouter `pages_manage_posts` et `pages_read_engagement` au flow OAuth
- Récupérer le Page ID Facebook de Judith pendant le flow OAuth

**UI — Toggle de distribution dans PublishSheet :**
- Étape supplémentaire ou toggle dans PublishSheet : "Publier aussi sur Facebook"
- Checkbox on/off (off par défaut — Judith active si elle veut)
- Aperçu de la caption Facebook (peut différer légèrement d'Instagram)

**Cloud Function : publishToFacebook :**
- Endpoint : POST /{page-id}/video_reels
- Params : source (video URL), description (caption)
- Même pattern que publishToInstagram : upload → poll → publish
- Mise à jour Firestore : nouveau champ `facebookStatus` sur le contentItem

**Caption Facebook :**
- Légère adaptation de la caption Instagram :
  - Facebook supporte les liens cliquables → insérer l'URL Wix directement
  - Pas besoin de "lien en bio"
  - Mêmes hashtags mais possibilité d'en mettre plus (Facebook est moins strict)
- Adapter le prompt generateCaption pour accepter un param `platform: 'instagram' | 'facebook'`

**Scheduler :**
- Étendre schedulePublisher pour vérifier un champ `platforms: string[]` sur l'item
- Si `platforms` inclut 'facebook' → appeler publishToFacebook en plus

**Data model updates :**
- contentItem : ajouter `facebookStatus?: string`, `facebookPostId?: string`, `platforms?: string[]`
- userProfile : ajouter `facebookPageId?: string`, `facebookPageName?: string`

**Definition of Done :**
- [ ] Toggle "Facebook" dans PublishSheet
- [ ] Cloud Function publishToFacebook déployée
- [ ] Caption adaptée (liens cliquables, pas de "lien en bio")
- [ ] Scheduler publie sur Facebook si demandé
- [ ] Firestore mis à jour avec le statut Facebook
- [ ] Historique dans /profil montre les publications Facebook
- [ ] Publication test réussie sur la page Facebook de Judith

---

### project-docs/02_ROADMAP/MILESTONE_11.md
**YouTube Shorts — Nouvelle plateforme de distribution**

Phase : DISTRIBUER
Dépendances : M08 (Vercel déployé), M09 (pattern OAuth en place)

Contexte :
- YouTube est un moteur de recherche Google → SEO long terme pour Judith
- Les Shorts apparaissent dans Google Search
- Même fichier MP4 9:16 → zéro travail supplémentaire pour Judith
- Audience différente d'Instagram → double la portée
- YouTube permet les liens cliquables dans la description (gros avantage)

Détailler précisément :

**Google Cloud / YouTube API setup :**
- YouTube Data API v3 à activer dans le projet Google Cloud
- OAuth Google (scope : youtube.upload, youtube.readonly)
- Quota : 10 000 units/jour, 1 upload ≈ 1600 units → max ~6 uploads/jour
- Pour Judith (3 posts/semaine) → largement suffisant

**Flow OAuth YouTube dans /profil :**
- Nouveau composant : YouTubeConnectButton (à côté de InstagramConnectButton)
- Bouton "Connecter YouTube" → OAuth Google avec scope youtube
- Callback → stocker le refresh_token dans Firestore
- Afficher le nom de la chaîne YouTube connectée
- Les tokens Google ont un refresh_token permanent (pas d'expiration comme Meta)

**Cloud Function : publishToYouTube :**
- Upload flow :
  1. Télécharger la vidéo depuis Firebase Storage
  2. POST videos.insert (resumable upload)
  3. Metadata :
     - title : titre de l'idée
     - description : caption adaptée + URL Wix cliquable + hashtags
     - tags : ['acupuncture', 'montreal', 'MTC', catégorie] (max 500 chars)
     - categoryId : '26' (Howto & Style)
     - privacyStatus : 'public'
     - madeForKids : false
  4. Video classée Shorts automatiquement si ≤ 60s + 9:16
- Timeout plus long que Instagram (YouTube peut prendre 1-2 min à traiter)

**Caption YouTube (différente d'Instagram) :**
- YouTube SUPPORTE les liens cliquables dans la description
- Format :
  ```
  [Caption complète avec mots-clés SEO]

  🔗 Prends rendez-vous : https://judithtremblay.com/[categorie]
  📍 Clinique à Montréal
  📸 Instagram : @[handle]

  #acupuncture #montreal #Shorts
  ```
- Adapter generateCaption pour platform: 'youtube'

**UI — Toggle YouTube dans PublishSheet :**
- Même pattern que Facebook (M10) : checkbox "Publier sur YouTube"
- Si YouTube non connecté → afficher "Connecte ton compte YouTube dans Profil"

**Scheduler :**
- Étendre schedulePublisher : si `platforms` inclut 'youtube' → publishToYouTube

**Data model updates :**
- contentItem : ajouter `youtubeStatus?: string`, `youtubeVideoId?: string`
- userProfile : ajouter `youtubeChannelId?: string`, `youtubeChannelName?: string`, `youtubeRefreshToken?: string` (chiffré)

**Definition of Done :**
- [ ] Bouton "Connecter YouTube" dans /profil
- [ ] Flow OAuth Google avec scope youtube.upload
- [ ] Cloud Function publishToYouTube déployée
- [ ] Toggle "YouTube" dans PublishSheet
- [ ] Description YouTube avec liens cliquables
- [ ] Scheduler publie sur YouTube si demandé
- [ ] Firestore mis à jour avec le statut YouTube
- [ ] Upload test réussi → vidéo visible comme Short sur YouTube

---

### project-docs/02_ROADMAP/MILESTONE_12.md
**Stats & Analytics — Feedback loop pour Judith**

Phase : MESURER
Dépendances : M09 (token Meta avec permissions Insights)

Contexte :
- Judith n'a aucune visibilité sur l'impact de son contenu
- Instagram Insights API donne accès aux métriques par Reel et par compte
- Objectif : motivation par les résultats → constance de publication

Détailler précisément :

**Permissions Meta additionnelles :**
- Vérifier que le token OAuth de M09 inclut `instagram_basic` et `instagram_manage_insights`
- Si non : ajouter les scopes au flow OAuth

**Instagram Insights API :**
- Par média : GET /{media-id}/insights?metric=plays,reach,likes,comments,shares,saved
- Par compte : GET /{ig-user-id}/insights?metric=follower_count,reach&period=day
- Rate limits : 200 calls/user/hour (largement suffisant)
- Les métriques ne sont disponibles qu'après 24h

**Cloud Function : fetchInsights :**
- Trigger : cron quotidien (1x/jour à 6h du matin)
- Pour chaque contentItem publié dans les 30 derniers jours :
  - GET /{media-id}/insights
  - Stocker les métriques dans un sous-document Firestore
- Pour le compte global :
  - GET /{ig-user-id}/insights (follower_count, reach)
  - Stocker dans un document séparé (analytics/{userId}/daily/{date})

**Data model :**
- contentItem : ajouter `insights?: { plays: number, reach: number, likes: number, comments: number, shares: number, saved: number, fetchedAt: Timestamp }`
- Nouvelle collection : `analytics/{userId}/daily/{date}` → { followerCount, reach, impressions }

**UI — Cartes stats enrichies dans /profil :**
- Remplacer les compteurs simples actuels par :
  - Carte "Vues totales" (somme plays des 30 derniers jours) avec sparkline
  - Carte "Engagement" (likes + comments + shares + saved)
  - Carte "Followers" avec tendance (↑ ou ↓ vs semaine précédente)
  - Carte "Constance" : publications par semaine (sparkline 4 semaines)

**Page /stats (nouvelle page) :**
- Accessible depuis le profil ou via un 5e onglet
- Graphique : vues par Reel (7 derniers Reels, bar chart)
- Graphique : reach par jour (ligne, 30 derniers jours)
- Meilleure heure de publication (basé sur l'engagement réel)
- Liste des "best performers" (top 3 Reels par engagement)
- Bibliothèque légère pour les graphiques : recharts ou Chart.js (évaluer le bundle size)

**Bottom Tab Bar :**
- Évaluer si on ajoute un 5e onglet "Stats" ou si on garde dans Profil
- Recommandation : garder dans Profil avec un lien "Voir toutes les stats →"
  (5 onglets = limite acceptable mais Judith n'est pas data-driven, pas besoin de surinvestir l'UI stats)

**Definition of Done :**
- [ ] Cloud Function fetchInsights déployée (cron quotidien)
- [ ] Métriques par Reel stockées dans Firestore
- [ ] Métriques compte global stockées quotidiennement
- [ ] Cartes stats dans /profil avec sparklines
- [ ] Page /stats avec graphiques (vues par Reel, reach, meilleure heure)
- [ ] Données visibles pour les Reels publiés depuis > 24h
- [ ] Pas de crash si aucune donnée disponible (empty state encourageant)

---

### project-docs/02_ROADMAP/MILESTONE_13.md
**UTM Tracking + Wix Mapping — Mesurer le trafic réel**

Phase : MESURER
Dépendances : M10 + M11 (multi-plateforme pour que les UTM soient utiles)

Contexte :
- Judith publie du contenu pour attirer des patients vers son site Wix
- Actuellement aucune mesure du trafic Instagram → Wix
- Les UTM params permettent de tracker la source dans Google Analytics (sur le site Wix)
- YouTube supporte les liens cliquables → UTM encore plus utiles

Détailler précisément :

**Mapping catégorie → URL Wix :**
- Dans /profil : nouvelle section "Mon site Wix"
- Champ URL de base : `https://judithtremblay.com`
- Champs optionnels par catégorie :
  - Fertilité → `/fertilite`
  - Grossesse → `/grossesse`
  - Bien-être → `/bienetre`
  - MTC → `/acupuncture`
  - Autre → URL de base
- Stocker dans userProfile Firestore

**Génération automatique des UTM :**
- Quand generateCaption est appelée, les URLs dans la caption incluent automatiquement :
  ```
  https://judithtremblay.com/fertilite?utm_source=instagram&utm_medium=reel&utm_campaign=fertilite_2026-03
  ```
- Paramètres UTM :
  - utm_source : `instagram`, `facebook`, ou `youtube`
  - utm_medium : `reel` ou `short`
  - utm_campaign : `{categorie}_{YYYY-MM}` (auto-généré)
  - utm_content : `{itemId}` (optionnel, pour tracker par Reel individuel)

**Adaptation des captions par plateforme :**
- Instagram : UTM dans le texte mais pas cliquable (rappel "lien en bio")
- Facebook : URL complète avec UTM, cliquable
- YouTube : URL complète avec UTM dans la description, cliquable

**UI — Configuration dans /profil :**
- Section "Mon site Wix" avec les champs URL
- Preview de ce que donnera un UTM link
- Toggle "Ajouter les paramètres UTM automatiquement" (on par défaut)

**Lien en bio Instagram :**
- Recommandation dans /profil : "Met ce lien dans ta bio Instagram :"
  → `https://judithtremblay.com?utm_source=instagram&utm_medium=bio`
- Copier en 1 tap

**Definition of Done :**
- [ ] Configuration URL Wix par catégorie dans /profil
- [ ] Paramètres UTM générés automatiquement dans les captions
- [ ] UTM adaptés par plateforme (instagram/facebook/youtube)
- [ ] Preview UTM dans la config
- [ ] Suggestion de lien en bio avec UTM
- [ ] Test : lien dans une publication réelle contient les UTM corrects
- [ ] Documentation : comment voir les UTM dans Google Analytics Wix

---

## Format exigé pour chaque milestone

Chaque document MILESTONE_XX.md doit contenir :

1. **Objectif** — 1 phrase claire
2. **Phase** — Lancer / Distribuer / Mesurer
3. **Dépendances** — milestones précédents requis
4. **User stories couvertes** — si applicable (les M08+ n'ont pas de US formelles, mais lister les besoins)
5. **Livrables précis** — liste de tous les fichiers à créer/modifier
6. **Spécifications techniques détaillées** — par feature
7. **Data model changes** — nouveaux champs ou collections Firestore
8. **Cloud Functions** — nouvelles ou modifiées
9. **Contraintes** — ce qu'on ne fait PAS dans ce milestone
10. **Definition of Done** — checkboxes vérifiables
11. **Prompt one shot pour Claude Code** — complet, copy-paste ready

Le prompt one shot doit être suffisamment détaillé pour que
Claude Code puisse l'implémenter sans poser de questions.
Inclure les noms de fichiers exacts, les interfaces TypeScript,
les configurations importantes, et les fichiers existants à lire
dans la codebase AVANT de commencer.

---

## Contraintes globales à respecter dans tous les milestones

- Next.js 15 App Router ONLY (jamais Pages Router)
- TypeScript strict
- Tailwind CSS + Heroicons uniquement (zéro emoji dans l'UI)
- Mobile first 375px
- PWA standalone
- Session Firebase persistante
- 0 console.log en production
- Composants < 150 lignes (sinon découper)
- Commits sémantiques : feat/fix/chore

---

## Fichiers à mettre à jour en même temps

Après avoir créé les 6 milestones, mets aussi à jour :

### project-docs/03_TECH/API_DESIGN.md
Ajouter les nouvelles Cloud Functions :
- publishToFacebook (M10)
- publishToYouTube (M11)
- refreshMetaToken (M09)
- fetchInsights (M12)

### project-docs/03_TECH/DATA_MODEL.md
Ajouter les nouveaux champs :
- contentItem : facebookStatus, youtubeStatus, platforms[], insights{}
- userProfile : facebookPageId, youtubeChannelId, wixUrls{}, tokens{}
- Nouvelle collection : analytics/{userId}/daily/{date}

### project-docs/05_LATER/BACKLOG_LATER.md
Retirer les items qui sont maintenant dans M08-M13 (stats, YouTube, Facebook, UTM)
et ajouter ce qui reste en V3+ :
- TikTok
- Offline partiel
- Rappels email
- Moteur d'assistance opérationnelle
