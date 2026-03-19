# CONTENT_STRATEGY.md
# Stratégie de contenu — Distribution & croissance
*Version 1.0 — Mars 2026*

---

## Principe

> Judith crée une fois. L'app distribue partout.
> Chaque publication ramène du trafic vers judithtremblay.com

---

## Plateformes de distribution

### Phase 1 — V1 (maintenant)
- ✅ **Instagram Reels** — plateforme principale, token hardcodé

### Phase 2 — V2 (après usage réel)
- 🔜 **YouTube Shorts** — même fichier MP4, API YouTube Data v3
- 🔜 **Facebook Reels** — via Meta Graph API (même token que IG)

### Phase 3 — V3 (futur)
- TikTok (API séparée, vérification plus complexe)

---

## Stratégie SEO Instagram 2026

### Hashtags — La réalité en 2026

> Judith a raison : le hashtag stuffing est mort.
> Adam Mosseri (CEO Instagram) l'a confirmé officiellement.

**Nouvelle approche :**
- Instagram fonctionne comme un moteur de recherche
- Les **mots-clés dans la caption** sont le signal #1
- Les hashtags : max **3-5**, ultra-ciblés, pas plus
- L'alt-text des images/vidéos est indexé par l'algorithme

**Ce qu'on fait dans les captions générées :**
```
❌ Avant (hashtag stuffing) :
"L'acupuncture peut aider la fertilité!
#acupuncture #fertilite #montreal #sante #bienetre
#MTC #grossesse #naturel #holistique #yoga..."

✅ Maintenant (SEO-first) :
"L'acupuncture aide la fertilité en régulant les cycles
hormonaux et en améliorant la circulation vers les organes
reproducteurs. Si tu es à Montréal et que tu cherches une
approche naturelle pour concevoir, voilà comment je peux t'aider.

Prends rendez-vous → lien en bio

#acupuncturemontreal #fertilitenatuelle #MTC"
```

### Les 5 éléments SEO d'une bonne caption

1. **Hook (première ligne)** — question ou fait surprenant
   *L'algorithme indexe les premiers mots*
   Ex: "Saviez-vous que l'acupuncture peut doubler les chances de FIV?"

2. **Corps riche en mots-clés naturels** — parler comme ses patients cherchent
   Ex: "douleurs menstruelles", "stress et fertilité", "acupuncture Montréal"

3. **CTA explicite** — toujours une action claire
   Ex: "Prends rendez-vous →", "Lis l'article complet →"

4. **Mention du lien en bio** — Instagram ne permet pas de liens cliquables
   Ex: "Lien en bio pour réserver ta consultation gratuite"

5. **3 hashtags max** — ultra-ciblés, pas de hashtags génériques
   Ex: #acupuncturemontreal #fertiliteMTC #acupunctriceMontreal

---

## Stratégie CTA — Amener du trafic vers le site Wix

### Pourquoi c'est difficile sur Instagram

Instagram ne permet pas de liens cliquables dans les posts.
Le seul lien cliquable est dans la **bio du profil**.

### Stratégie en 3 couches (baked-in dans l'app)

**Couche 1 — Caption textuelle (générée automatiquement)**
```
"Pour en savoir plus sur mes services, le lien est dans ma bio.
→ [URL du site Wix]"
```

**Couche 2 — CTA verbal dans la vidéo (reminder à l'éditeur)**
L'app affiche un reminder dans l'éditeur :
"💡 Conseil : mentionne ton site verbalement dans ta vidéo
pour maximiser le trafic vers judithtremblay.com"

**Couche 3 — Texte overlay dans la vidéo**
Template de texte overlay disponible dans l'éditeur :
"📍 Lien en bio pour réserver" (style, position, animation pré-configurés)

### Types de CTA par objectif

```typescript
const CTA_TEMPLATES = {
  // Prise de rendez-vous (objectif principal)
  appointment: [
    "Prends rendez-vous → lien en bio",
    "Consultation gratuite disponible → lien en bio",
    "Reserve ta place → lien en bio",
  ],

  // Découverte du site (objectif secondaire)
  discovery: [
    "En savoir plus → lien en bio",
    "Tous mes services → lien en bio",
    "Lis l'article complet → lien en bio",
  ],

  // Contenu éducatif (brand awareness)
  education: [
    "Télécharge mon guide gratuit → lien en bio",
    "Plus de conseils sur mon site → lien en bio",
  ],
}
```

L'IA sélectionne automatiquement le type de CTA selon la catégorie du contenu :
- Fertilité / Grossesse → CTA appointment
- Bien-être général → CTA education
- MTC explicatif → CTA discovery

---

## YouTube Shorts — Planification

### Pourquoi YouTube en V2

- Même fichier MP4 9:16 → zéro travail supplémentaire pour Judith
- Audience différente d'Instagram → double la portée
- YouTube = moteur de recherche Google → SEO long terme
- Les Shorts apparaissent dans Google Search — énorme pour une acupunctrice locale

### Architecture technique YouTube Data API v3

```typescript
// Cloud Function: publishToYouTube
// Nécessite OAuth par utilisateur (pas de token hardcodé)
// → Judith doit connecter son compte YouTube une fois dans le Profil

// Upload flow:
// 1. POST videos.insert (multipart upload)
//    title: titre de l'idée
//    description: caption + CTA Wix
//    tags: ['acupuncture', 'montreal', 'MTC'] // max 500 chars
//    categoryId: '26' // Howto & Style
//    privacyStatus: 'public'
//    madeForKids: false
// 2. Video classifiée Shorts automatiquement si:
//    - Durée ≤ 60 secondes
//    - Ratio 9:16
//    - Titre contient #Shorts (optionnel mais aide)
```

### Quotas YouTube API (contrainte importante)
```
10 000 units/jour (projet Google Cloud)
1 upload = ~1600 units
→ Max ~6 uploads/jour en gratuit
Pour Judith (3 posts/semaine) → largement suffisant
```

### Description YouTube (différente d'Instagram)

YouTube permet les liens cliquables dans la description :
```
[Caption complète]

🔗 Prends rendez-vous : https://judithtremblay.com/rdv
📍 Clinique à Montréal
📸 Instagram : @judithtremblay_acupuncture

#acupuncture #montreal #Shorts
```

---

## SEO Wix — Connexion contenu → site

### Comment le contenu Instagram alimente le SEO du site

Instagram et YouTube indexent les mots-clés des captions.
Ces mots-clés doivent être alignés avec les pages du site Wix.

**Mapping suggéré (configurable dans le Profil) :**
```
Catégorie Fertilité  → judithtremblay.com/fertilite
Catégorie Grossesse  → judithtremblay.com/grossesse
Catégorie Bien-être  → judithtremblay.com/bienetre
Catégorie MTC        → judithtremblay.com/acupuncture
```

Le CTA généré pointe vers la bonne page selon la catégorie :
```
Post sur la fertilité → "Prends rdv → judithtremblay.com/fertilite"
Post sur la grossesse → "Prends rdv → judithtremblay.com/grossesse"
```

### URL configurable dans le Profil

```typescript
interface UserProfile {
  wixSiteUrl: string           // URL de base du site
  categoryUrls: {              // URLs par catégorie (optionnel)
    fertilite?: string
    grossesse?: string
    bien_etre?: string
    mtc?: string
  }
  defaultCTA: CTAType          // Type de CTA préféré
}
```

---

## Prompt Claude pour caption SEO-optimisée

```
Tu es l'assistante de Judith Tremblay, acupunctrice à Montréal.
Rédige une caption Instagram SEO-optimisée pour un Reel sur: {titre}
Catégorie: {catégorie}

RÈGLES STRICTES:
1. Première ligne = hook percutant (question ou fait surprenant)
2. Corps = 3-4 phrases riches en mots-clés naturels que ses patients chercheraient
   Exemples: "acupuncture Montréal", "fertilité naturelle", "douleurs menstruelles"
3. Ton: professionnel ET chaleureux, français québécois authentique
   ("rendez-vous" pas "appointment", naturel et organique)
4. CTA explicite: "{cta}" + "lien en bio"
5. Max 3 hashtags ultra-ciblés à la fin (pas de hashtags génériques)
6. 150-200 mots maximum

URL à mentionner: {categoryUrl}
```

---

## Ce qu'on NE fait PAS

- ❌ Hashtag stuffing (30 hashtags) — mort en 2026
- ❌ Même caption copiée-collée sur YouTube et Instagram
  (adapter légèrement — YouTube peut avoir des liens cliquables)
- ❌ Liens cliquables dans la caption Instagram (pas supporté)
- ❌ CTA trop agressif ou commercial ("ACHETEZ MAINTENANT")
- ❌ Automatisation TikTok en V1 (API trop complexe)
