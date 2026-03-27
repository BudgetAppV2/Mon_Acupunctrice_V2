# Mon Acupunctrice Hub V2 — Résumé pour session Stratégie

## Le projet en bref
Hub de création et publication de contenu pour Judith Dufour-Savard,
acupunctrice solo à Montréal (La Source en Soi, Rosemont).
Stack : Next.js 15 + Firebase + Vercel.
Repo : `/Users/benoitarchambault/Desktop/Mon_Acupunctrice_V2`
GitHub : `github.com/BudgetAppV2/Mon_Acupunctrice_V2`
Déployé : `mon-acupunctrice-v2.vercel.app`

## État actuel — Milestones techniques COMPLÉTÉS

| # | Feature | Status |
|---|---------|--------|
| M01-M08 | Auth, PWA, Idées, Calendrier, Éditeur vidéo, Sous-titres, Publication IG, Deploy | ✅ |
| M09 | OAuth Instagram (Business Login) | ✅ |
| M10 | Facebook Reels OAuth + publication | ✅ |
| M11 | YouTube Shorts OAuth + publication | ✅ |
| M12 | Stats & Analytics (Instagram Insights, recharts, cron) | ✅ |
| R | Refinements UX (9 fixes en 3 one-shots) | ✅ |
| R2 | Transcription vocale d'idées (Whisper + Claude) | ✅ |
| R3 | Éditeur texte multi-blocs (narration, duplication, timeline) | ✅ |
| SCHEDULER | Cron Vercel (publication automatique) | ✅ |

## Phase actuelle : STRATÉGIE

On est passés de "construire l'outil" à "construire le système qui guide
Judith à créer du contenu régulier et efficace". 

## Documents clés à lire (dans project-docs/)

### Documents stratégie (LES PLUS IMPORTANTS)
1. `01_PRODUCT/STRATEGIE/CENTRE_NEVRALGIQUE.md`
   → Vision globale : tous les canaux, pipelines blogue→story→reel,
   features S1-S10 à construire, connexion Go Rendez-Vous

2. `01_PRODUCT/CALENDRIER_CADRE.md`
   → Structure 6 mois : 4 types de posts (Éduquer/Connecter/Aider/Prouver),
   3 piliers (Fertilité/Grossesse/Bien-être), gradation du rythme,
   rotation mensuelle, structure hebdomadaire

3. `01_PRODUCT/CONTENT_STRATEGY.md`
   → Stratégie de contenu : règles de posting, templates de CTA,
   optimisation bio Instagram

4. `01_PRODUCT/SEO_DISTRIBUTION_KB.md`
   → Mots-clés, hashtags (3-5 max en 2026), stratégie distribution

### Documents techniques (référence)
5. `03_TECH/ARCHITECTURE.md` → Architecture Next.js + Firebase
6. `03_TECH/DATA_MODEL.md` → Firestore schema (contentItems, users, analytics)

## Ce qu'on veut construire ce soir

### L'idée principale
Hardcoder un plan de missions dans le calendrier du Hub. Pas de pipeline
automatique, mais des missions pré-placées aux bonnes dates que Judith
voit et complète comme un jeu.

### Les questions à détailler
1. **Le calendrier gamifié** — Comment représenter les missions dans le
   calendrier existant? Quels états (à faire → en cours → fait)?
   Comment rendre ça motivant visuellement?

2. **Les séquences** — Quand Judith publie un article de blogue,
   les missions suivantes sont déjà programmées :
   - Jour J : Story de promo (auto via API)
   - Jour J+1 : Reel résumé (Judith le crée)
   - Jour J+3 : Reel pratique (Judith le crée)
   - Jour J+7 : Story rappel (auto via API)

3. **Lier les idées aux missions** — Comment Judith assigne une idée
   de sa banque à une mission du calendrier?

4. **Gamification** — Streaks, badges, progression, score?
   Qu'est-ce qui motive sans être infantilisant?

5. **Stories via l'API** — L'API Instagram supporte media_type=STORIES.
   On peut publier des Stories automatiquement (images/vidéos, pas de
   stickers interactifs).

## Découvertes clés de la session précédente

### Go Rendez-Vous
- La Source en Soi : companyId=104074
- Judith : employeeId=7556837
- Paramètre URL `eids=7556837` reconnu par le widget JS mais ne skip
  pas la sélection du professionnel (limitation clinique multi-praticiens)
- Solution : l'admin de La Source en Soi doit configurer le bouton embed
  dans Paramètres → Promouvoir → Bouton → Avancé → sélectionner Judith

### Instagram Stories API
- `media_type=STORIES` dans le Content Publishing API (depuis 2023)
- Le Hub PEUT publier des Stories automatiquement
- Limitation : pas de stickers interactifs (liens, sondages)
- Workaround : texte "Lien dans ma bio 👆" dans la Story

### Vercel
- Webhook GitHub→Vercel cassé depuis le 22 mars 2026
- Déployer via `npx vercel --prod` en attendant
- Ou reconnecter le repo dans Settings → Git

## Canaux de Judith
- Instagram : Reels + Stories
- Facebook : Reels (republication)
- YouTube : Shorts (SEO Google)
- Site Wix : acupuncturejudith.ca (vitrine + blogue ~10 articles)
- Go Rendez-Vous : gorendezvous.com/lasourceensoi

## Les 3 piliers de contenu
1. FERTILITÉ — préconception, PMA, cycle menstruel
2. GROSSESSE — prénatal, postnatal, accouchement
3. BIEN-ÊTRE — menstruations, ménopause, stress, anxiété

## Les 4 types de posts
- ÉDUQUER → Judith enseigne quelque chose
- CONNECTER → Judith montre qui elle est
- AIDER → Judith donne un truc concret à essayer
- PROUVER → Résultat, témoignage

## Profil de Judith (pour la stratégie)
- À l'aise devant la caméra
- Écrit ~1 article de blogue par mois
- Fait déjà des Stories (mais pas liées au blogue)
- Clientèle cible : femmes en général
- Objectif : plus de clients
- Rythme visé : gradation 1→4 posts/semaine sur 6 mois
- Commence cette semaine

## Features à construire (priorité)
| # | Feature | Description |
|---|---------|-------------|
| S1 | Stories API | Publier des Stories Instagram via l'API |
| S2 | Pipeline blogue | Lien d'article → missions auto dans le calendrier |
| S3 | Missions hebdomadaires | Calendrier gamifié avec missions à compléter |
| S4 | Catégorisation idées | Pilier + type sur chaque idée |
| S5 | Tableau d'inspiration | Sauvegarder des posts Instagram comme référence |
| S6 | Calendrier amélioré | Code couleur, indicateur pilier du mois |
| S7 | Stories auto blogue | Générer et publier une Story quand article sort |
| S8 | Hashtags configurables | Par catégorie, dans generateCaption |
| S9 | Page lien RDV | Page publique avec lien Go Rendez-Vous |
| S10 | Refonte blogue Wix | Nouvelle disposition (Judith a un exemple) |
