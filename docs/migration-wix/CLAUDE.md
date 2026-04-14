# CLAUDE.md — Migration Wix → Vercel
*Contexte permanent pour Claude Code. Lu au début de chaque session de migration.*

---

## Tu travailles sur quoi exactement

Migration du site public de Judith Dufour-Savard (`acupuncturejudith.ca`) depuis Wix vers une **section publique du Hub V2** (ce repo Next.js). Pas un nouveau repo, pas un nouveau projet Vercel — une extension du Hub existant via un route group `(public)/`.

**Objectif produit** : augmenter le SEO/GEO local pour générer un flux constant de nouvelles patientes vers la réservation Go Rendez-Vous, tout en unifiant l'écosystème numérique dans un seul stack contrôlé.

**Statut actuel** : plan stratégique v0.3 finalisé, rapports de scouting complets, prêt à attaquer les milestones de build.

---

## Les 3 documents à connaître

Tu dois lire ces 3 documents **avant** toute session de travail sur la migration, dans cet ordre :

1. **Ce fichier** (`docs/migration-wix/CLAUDE.md`) — invariants et contraintes
2. **`docs/migration-wix/01-strategie/PLAN_EDITORIAL_SEO_GEO_v0.3.md`** — plan stratégique complet (1 350 lignes, source de vérité)
3. **Le milestone en cours** dans `project-docs/02_ROADMAP/migration-wix/` — ton instruction d'exécution

Si quelque chose n'est pas clair dans le milestone, réfère-toi au plan éditorial. Si le plan est ambigu, arrête et demande à Benoit avant de coder.


---

## Les 4 piliers de contenu (non-négociables)

Le site est structuré autour de 4 piliers thématiques. **Ne jamais en inventer un 5e**. Les 4 sont :

1. **Fertilité** — `/services/fertilite` (hub), `/faq/fertilite`, articles blog et ressources associés
2. **Grossesse & périnatalité** — `/services/grossesse` (hub), `/faq/grossesse`, etc.
3. **Acupuncture pédiatrique** — `/services/pediatrie` (hub), `/faq/pediatrie`, etc.
4. **Acupuncture sociale** — `/services/acupuncture-sociale` (hub + manifeste), `/faq/acupuncture-sociale`, etc.

Chaque pilier fonctionne en **hub-and-spoke** : la page service est le hub, tous les contenus liés (FAQ, articles, ressources) sont des spokes qui pointent vers le hub. Le maillage interne est décrit en détail dans le plan éditorial (section 4.4).

---

## Les invariants qu'on ne remet jamais en question

Ces décisions ont été prises et validées. Ne pas les re-débattre dans chaque session.

### Positionnement & contenu

- **Emprunt de réputation La Source en Soi** : Judith n'a pas de Google Business Profile en propre. La clinique La Source en Soi en a une à **4,9/5 avec ~1 215 avis**. Toutes les pages du site doivent mentionner la clinique et afficher ce signal de confiance (voir plan §8.1b).
- **Schema.org** : `Person` (Judith) + `MedicalClinic` (La Source en Soi), reliés par `Person.worksFor`. Pas de `LocalBusiness` autonome pour Judith (fragmenterait le signal NAP).
- **Funnel Go Rendez-Vous** : la page `/reserver` est une **landing de confiance** qui explique à l'utilisateur qu'il va atterrir sur la page de la clinique et doit sélectionner Judith manuellement. Pas un simple bouton (voir plan §9.1).
- **Tonalité** : vouvoiement par défaut sur le site, "je" de Judith comme signature personnelle. Tutoiement réservé à Instagram. Guide de ton détaillé dans `docs/migration-wix/01-strategie/GUIDE_DE_TON.md` (à produire en milestone M3).
- **Claire Thomas** (rédactrice co-autrice) continue à collaborer pour les articles de fond du blog. Sa voix est préservée.

### Technique

- **Cohabitation avec le Hub V2** : ajouter un route group `(public)/` dans `app/`, au même niveau que `(app)/` et `(auth)/`. Layout dédié, pas d'auth check, pas de modification de l'existant.
- **Firestore collections nouvelles** : `faqs`, `ressources`, `servicePages`, `publicBlog`, `siteConfig`. Lecture publique, écriture admin seulement. Règles à ajouter dans `firestore.rules`.
- **Rendu** : SSG + ISR pour toutes les pages publiques, via `generateMetadata` pour les meta tags dynamiques.
- **Plan Vercel** : Hobby. 100 crons disponibles, 1×/jour max chacun. Pas d'upgrade Pro prévu.
- **DNS** : reste chez Wix pour l'instant. Le bouton "Transférer Domaine" chez Wix est **destructif** (coupe le site immédiatement). On modifiera les records DNS dans le dashboard Wix pour pointer vers Vercel uniquement le jour du switch final, quand le nouveau site est prêt. Transfert registrar → Cloudflare seulement après ce switch si souhaité.
- **Analytics** : Plausible (pas GA4), cohérent avec positionnement privacy-friendly. Pas de consentement cookies requis.
- **Pas de lead magnet** : les ressources sont en accès libre, cohérent avec le positionnement "acupuncture sociale".


---

## Design system (homepage-v4 comme source canonique)

La maquette de référence est **`~/Documents/Judith_SEO_GEO/05_maquettes/nouveau-site/homepage-v4.html`**. Elle définit le système de design complet : palette, typographie, composants, décorations SVG, photos Eric Bates Images.

### Palette (à namespacer dans `tailwind.config.ts`)

Ne pas écraser les tokens existants du Hub admin (`sage: #5C7A5F`, `sand: #F5F1E9`). Ajouter un namespace `judith-*` ou `public-*` pour les tokens de la v4 :

- `--beige-bg: #F5F0E8` (fond principal sections chaudes)
- `--beige-light: #FAF6EF` (fond clair, cartes)
- `--accent-taupe: #8A9A7B` (**accent primaire** : boutons, CTA, hover)
- `--accent-taupe-dark: #6F8566` (hover sur accent primaire)
- `--accent-warm: #B8694A` (**accent secondaire terracotta** : soulignés italiques, numéros de section, citations)
- `--text-dark: #2C2A26`, `--text-medium: #5C5852`, `--text-light: #8A857C`

Palette complète dans le plan §4.6.2.

### Typographie

- **Serif** : `Cormorant Garamond` (titres, H1/H2/H3, numéros de section, citations, logo)
- **Sans** : `Inter` (body, navigation, boutons, UI)

### Composants à porter en React

La v4 définit 6 composants nommés dans `app/(public)/_components/` :

| Composant v4 | Fichier React | Rôle |
|---|---|---|
| `judith-header` | `<SiteHeader />` | Header sticky, logo serif, nav, CTA Réserver |
| `judith-footer` | `<SiteFooter />` | Footer 4 colonnes + mention "En partenariat avec La Source en Soi ★ 4,9/5" |
| `judith-cta-button` | `<CtaButton />` | Bouton Réserver (variantes : primary, secondary, lg, sticky mobile) |
| `judith-pilier-card` | `<PilierCard />` | Carte pilier avec image, titre, description, état featured |
| `judith-testimonial` | `<TestimonialCard />` | Carte témoignage (citation serif italique + avatar) |
| `judith-section-heading` | `<SectionHeading />` | Kicker + titre + subtitle, version center/left |

Composants additionnels à créer (voir plan §4.6.3) : `<ClinicBadge />`, `<SectionNumber />`, `<WatermarkText />`, `<PaperTexture />`, `<GrainOverlay />`, `<BotanicalDeco />`, `<RelatedContent />`, `<ContextualLink />`.

### Philosophie visuelle (ne pas dériver)

Le site de Judith est **chaleureux, artisanal, botanique**, à l'opposé des sites cliniques aseptisés. Matérialité des textures papier japonais, asymétrie volontaire des grilles, watermarks serif géants en filigrane, décorations SVG botaniques en background avec `mix-blend-mode: multiply`. Si tu es tenté d'ajouter un framework UI (Material, shadcn, Chakra) : **non**. Tout est construit from scratch sur Tailwind avec les tokens de la v4.


---

## Arborescence du site (cible)

```
/                                    Homepage (port de v4)
├── /a-propos                        Bio Judith + bloc "Ma clinique" (4,9/5 · 1 200+ avis)
├── /services                        Vue d'ensemble des 4 piliers
│   ├── /services/fertilite
│   ├── /services/grossesse
│   ├── /services/pediatrie
│   └── /services/acupuncture-sociale
├── /blog                            Liste articles
│   └── /blog/[slug]
├── /faq                             Vue d'ensemble FAQ
│   ├── /faq/fertilite
│   ├── /faq/grossesse
│   ├── /faq/pediatrie
│   ├── /faq/acupuncture-sociale
│   └── /faq/seance                  À quoi s'attendre, logistique
├── /ressources
│   └── /ressources/[slug]
├── /tarifs                          Cible SEO "combien coûte l'acupuncture"
├── /contact
└── /reserver                        Landing de confiance → CTA Go Rendez-Vous
```

Pages secondaires à envisager plus tard : `/communaute` (rôle d'influenceuse), `/temoignages`, `/mentions-legales`, `/politique-confidentialite`.

---

## Contenu existant à réutiliser (ne pas ignorer)

**6 FAQ + 5 pages piliers** sont déjà rédigées et validées par Judith dans `scripts/seo-geo/source/` et `scripts/seo-geo/source-resources/`. C'est un actif majeur, à importer directement au lancement des collections Firestore. Ne pas re-générer ce contenu.

**11 articles de blog Wix** (co-écrits avec Claire Thomas) sont de qualité et à migrer tel quel, pas à réécrire. API Wix Blog déjà configurée dans `app/api/blog/*` avec credentials dans `.env.local`.

**8 photos Eric Bates Images** de Judith sont dans `~/Documents/Judith_SEO_GEO/05_maquettes/nouveau-site/assets/photos_Judith/Croped/`. Actif visuel central, à migrer vers Firebase Storage sous `/public/site/judith/` (ou équivalent défini en milestone).

**1 215 avis Google sur La Source en Soi** : pas de widget API, sélection manuelle de 3-5 avis récents pour la page `/reserver` (attribution claire : "Avis Google sur la clinique La Source en Soi").

**Backlink existant** : `lasourceensoi.com/equipe/judith-dufour-savard/` pointe actuellement vers le site Wix. À préserver lors du switch DNS.

---

## Règles d'implémentation (spécifiques à la migration)

### Ne jamais faire

- **Modifier le code du Hub admin** (`app/(app)/`, `app/(auth)/`) sans raison explicite — la migration doit être additive
- **Créer un `middleware.ts`** — le Hub n'en a pas, on n'en ajoute pas
- **Fragmenter le signal NAP** en créant une fiche GBP propre à Judith
- **Générer des témoignages** ou avis inventés — uniquement des vrais avis vérifiables
- **Utiliser un framework UI externe** (Material, shadcn, Chakra) — Tailwind + tokens v4 uniquement
- **Créer des `<form>` HTML classiques dans des React components** — utiliser onClick/onChange
- **Laisser des `console.log` en production**
- **Dépasser 150 lignes** par composant React sans justification
- **Utiliser des emojis dans l'UI** — Heroicons uniquement (comme le reste du Hub)

### Toujours faire

- **Lire le plan éditorial v0.3** si le milestone est ambigu
- **Respecter le vouvoiement** + "je" de Judith dans tous les textes générés
- **Mentionner La Source en Soi** dans toutes les pages (contenu + meta + schema)
- **Utiliser les tokens v4** pour les couleurs, pas de valeurs hardcoded
- **Mobile-first** à 375px
- **Server Components par défaut**, Client Components si nécessaire
- **TypeScript strict**
- **SSG + ISR** pour les pages publiques, pas de rendering dynamique sauf nécessité
- **`generateMetadata`** sur toutes les pages pour les meta tags optimisés
- **Schema.org JSON-LD** injecté via le layout public (Person + MedicalClinic + pages-specific)

### Conventions de naming

- Milestones : `MW-01`, `MW-02`, ... (préfixe Migration Wix)
- Dossiers milestones : `project-docs/02_ROADMAP/migration-wix/MW-XX_nom-court/`
- Fichiers dans un milestone : `MILESTONE.md` (plan), `PROMPT.md` (one-shot pour Claude Code), `NOTES.md` (journal), `artefacts/` (sorties)
- Branch git : rester sur `feature/site-public-migration` pendant toute la migration, ou créer des branches `feature/mw-XX-nom` par milestone si préféré


---

## Stack technique (rappel)

Identique au Hub V2, aucune nouvelle dépendance majeure :

```
Frontend   : Next.js 15 App Router + TypeScript strict
Styling    : Tailwind CSS + Heroicons (pas de framework UI externe)
Fonts      : Cormorant Garamond + Inter (à ajouter dans app/layout.tsx public)
Database   : Firebase Firestore (nouvelles collections publicBlog, faqs, ressources, servicePages, siteConfig)
Storage    : Firebase Storage (images du site sous /public/site/)
Auth       : Firebase Auth (client-side, pas de middleware) — routes publiques sans check
Deployment : Vercel Hobby
Analytics  : Plausible (à installer)
```

Si tu as besoin d'une nouvelle dépendance (parser Ricos JSON, markdown renderer, etc.), mentionne-le explicitement dans le milestone et justifie-le.

---

## Where to look quand tu as un doute

| Question | Où chercher |
|---|---|
| "C'est quoi la stratégie sur X ?" | `docs/migration-wix/01-strategie/PLAN_EDITORIAL_SEO_GEO_v0.3.md` |
| "Ça ressemble à quoi visuellement ?" | `~/Documents/Judith_SEO_GEO/05_maquettes/nouveau-site/homepage-v4.html` |
| "C'est quoi les conventions du repo ?" | `CLAUDE.md` racine du repo |
| "Comment écrire un prompt Claude Code ?" | `skills/oneshot-prompt-writer/SKILL.md` |
| "Est-ce que ce milestone est trop gros ?" | `project-docs/04_DEV_SYSTEM/ONE_SHOT_PLAYBOOK.md` |
| "Qu'est-ce que les rapports de scouting ont trouvé ?" | `docs/migration-wix/02-recherche/scouting/` |
| "C'est quoi le contenu Judith déjà validé ?" | `scripts/seo-geo/source/` et `scripts/seo-geo/source-resources/` |
| "Comment parle Judith ?" | `docs/migration-wix/01-strategie/GUIDE_DE_TON.md` (à créer en MW-03) |

---

## Rappels importants

- **Judith** : Dufour-Savard (pas Dufourd, pas Dufour Savard sans trait d'union). Instagram `@mon_acupunctrice`. Clinique `La Source en Soi` à Rosemont, Montréal.
- **Go Rendez-Vous** : `https://gorendezvous.com/lasourceensoi`, companyId `104074`, employeeId `7556837` (pour référence — pas utilisé en deep-link, la stratégie est landing de confiance).
- **Le site Wix actuel reste en production** jusqu'au milestone de switch DNS. Ne rien casser dessus pendant le développement.
- **On build sur staging Vercel** (`mon-acupunctrice-v2.vercel.app` ou un sous-domaine preview) avant de basculer `acupuncturejudith.ca`.

---

*Dernière mise à jour : 14 avril 2026 — création initiale pour phase MIGRATION WIX*
