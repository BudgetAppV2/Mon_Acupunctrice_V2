# Scouting — Intégrations techniques (Repo Hub V2)

**Date** : 13 avril 2026
**Temps passé** : 35 min
**Statut global** : 🟢 Vert

## TL;DR

Le repo est bien structuré et prêt à accueillir des routes publiques. L'intégration Wix Blog via API REST est fonctionnelle et réutilisable pour l'import. Firestore n'a aucun conflit avec les nouvelles collections proposées. L'auth Firebase est client-side uniquement — les pages publiques cohabiteront facilement via un route group `(public)`. Aucun bloqueur technique identifié.

## Ce qu'on savait (hypothèses du plan)

- Le Hub V2 est un Next.js 15 / Firebase / Vercel
- L'intégration Wix Blog existe dans le repo
- Go Rendez-Vous utilise `gorendezvous.com/lasourceensoi`
- Le domaine `acupuncturejudith.ca` est chez Wix
- Le plan propose des collections Firestore `faqs`, `ressources`, `servicePages`

## Ce qu'on a trouvé

### 1. Structure des routes Next.js

**Routes actuelles :**
```
app/
  (app)/          → Routes protégées (calendrier, idées, blogue, editeur, stats, profil, inspiration, blitz)
  (auth)/         → Login (Google Sign-In)
  api/            → Routes API (cron, blog, publish, generate-caption, voice-idea)
  politique-de-confidentialite/  → Seule page publique existante
  layout.tsx      → Root layout (PWA, fonts)
```

**Mécanisme d'auth :** Client-side uniquement dans `(app)/layout.tsx` via `useAuth()`. Pas de `middleware.ts`. Les Firestore rules bloquent côté serveur.

**Pattern pour les routes publiques :** Créer un route group `(public)/` au même niveau que `(app)/` et `(auth)/`. Ce group aura son propre layout (header public, footer, CTA sticky) sans auth check. C'est le pattern standard Next.js 15 App Router — aucune modification de l'existant requise.

**Design tokens :** Pas de système de tokens formel. Couleurs dans `tailwind.config.ts` :
- `sage: '#5C7A5F'` (primaire)
- `sand: '#F5F1E9'` (fond)
- Status colors (idea, planned, shot, editing, ready, published)

Le site public pourra réutiliser `sage` et `sand` comme base, avec des tokens additionnels pour le site vitrine.

### 2. Schéma Firestore

**Collections existantes :** `contentItems`, `users`, `calendarSlots`, `blogSequences`, `analytics`

**Conflits avec le plan :** Aucun. Les collections `faqs`, `ressources`, `servicePages` n'existent pas — zéro risque de collision.

**Règles de sécurité :** Toutes les collections exigent `request.auth.uid == resource.data.userId`. Pour les nouvelles collections publiques, il faudra ajouter des règles de lecture publique :
```
match /faqs/{faqId} { allow read: if true; }
match /ressources/{resId} { allow read: if true; }
match /servicePages/{pageId} { allow read: if true; }
```
L'écriture restera protégée (admin seulement, via Cloud Functions ou auth Judith).

**Indexes :** Les indexes existants sont tous sur `contentItems` et `calendarSlots`. Nouvelles collections = nouveaux indexes à créer, mais aucun conflit.

### 3. Intégration Wix Blog

**Localisation :** `app/api/blog/list/`, `app/api/blog/carousel/`, `app/api/blog/publish/`, `app/api/blog/stats/`

**API utilisée :** REST directe sur `https://www.wixapis.com/blog/v3/` — pas de Wix SDK installé.

**Fonctionnalités :**
- `GET /api/blog/list` → liste les posts (paging 50, tri par date DESC)
- `GET /api/blog/carousel` → 8 posts optimisés pour carousel (cache 1h)
- `POST /api/blog/publish` → crée un draft puis le publie (convertit texte en Ricos JSON)
- Génération auto de FAQ via `/api/generate-blog-faq`

**Credentials :** `WIX_API_KEY`, `WIX_SITE_ID`, `WIX_MEMBER_ID`, `CMS_PUBLICATION_KEY` dans `.env.local`

**Réutilisabilité pour l'import :** Oui. L'endpoint `/api/blog/list` peut récupérer tous les articles. Il faudra ajouter un endpoint qui récupère le contenu complet (Ricos JSON) d'un article individuel — le code actuel ne le fait pas, mais l'API Wix v3 `/blog/v3/posts/{postId}` le supporte. Le code de conversion Ricos → texte devra être écrit.

### 4. Go Rendez-Vous

- URL confirmée : `https://gorendezvous.com/lasourceensoi`
- `companyId=104074`, `employeeId=7556837`
- Le deep-linking vers un praticien spécifique par paramètre URL ne fonctionne pas de manière fiable — la stratégie de la page `/reserver` comme landing de confiance est la bonne approche
- Pas de paramètres UTM supportés nativement — le tracking se fera via events côté site (Plausible/GA4)

### 5. Images Wix

- Toutes les images sont sur `static.wixstatic.com/media`
- URLs publiques et téléchargeables directement
- Wix applique des transformations dynamiques dans l'URL (resize, crop) — il faudra télécharger les originaux
- Estimation : 30-60 images à migrer (8 pages x 2-4 images + 11 articles x 1-3 images)
- Stratégie recommandée : re-upload vers Firebase Storage sous `/public/site/` — indépendance totale de Wix, et le bucket existe déjà

### 6. Domaine et DNS

- `acupuncturejudith.ca` est probablement géré par Wix (DNS inclus dans l'abonnement Wix)
- Il faudra soit transférer le domaine chez un registrar externe (Cloudflare, Namecheap), soit pointer les DNS directement vers Vercel
- Si DNS chez Wix : il faudra modifier les nameservers avant de couper Wix — risque de downtime

### 7. Stack technique confirmée

```
Next.js 15.2 / React 19 / TypeScript 5.7
Tailwind 3.4 / Heroicons 2.2
Firebase 11 (Auth, Firestore, Storage, Cloud Functions Gen 2)
Zustand 5 / recharts 3.8 / TipTap 3.22
PWA via @ducanh2912/next-pwa
Vercel Hobby plan (2 crons max)
```

## Surprises et découvertes

1. **Le dossier `scripts/seo-geo/`** contient déjà 6 FAQ et 5 pages piliers SEO rédigées localement, avec un `blog-inventory.json`. Du travail de contenu SEO a déjà été fait en amont du scouting.

2. **Pas de middleware.ts** — la protection est 100% client-side + Firestore rules. C'est un choix délibéré pour un single-user app, mais ça simplifie énormément l'ajout de pages publiques (pas de middleware à configurer pour exclure les routes publiques).

3. **Le blog Wix génère automatiquement des FAQ** lors de la publication via `/api/generate-blog-faq`. Ce mécanisme pourra être réutilisé pour le site public.

4. **Les 2 crons Vercel sont occupés** (publish + fetch-insights). Le plan mentionne un cron de "fraîcheur SEO" — il faudra upgrader le plan Vercel ou combiner les crons dans un seul endpoint.

## Risques identifiés

1. **DNS chez Wix** 🟡 : si le domaine est géré par Wix, la migration DNS est un point de friction. Downtime possible pendant le transfert. Mitigation : préparer tout sur un sous-domaine de staging, puis basculer le DNS en une seule opération.

2. **Firestore rules publiques** 🟡 : ajouter `allow read: if true` sur les nouvelles collections ouvre une surface d'attaque. Mitigation : s'assurer que ces collections ne contiennent rien de sensible et limiter les writes.

3. **Crons Vercel saturés** 🟡 : pas de slot disponible pour un cron SEO. Mitigation : upgrader vers plan Pro, ou combiner le cron publish avec un check de fraîcheur.

## Recommandations d'ajustement du plan

1. **Ajouter une section "Route Group (public)"** dans le plan d'architecture — documenter le pattern `(public)/` avec son layout dédié

2. **Prévoir un endpoint d'import Wix Blog** : l'API `/blog/v3/posts/{postId}` existe, il suffit d'ajouter une route `/api/blog/import/[postId]` qui récupère le contenu complet

3. **Ajouter la question DNS** dans les décisions à prendre — transférer le domaine avant la migration, pas après

4. **Le contenu SEO dans `scripts/seo-geo/`** devrait être inventorié et intégré au plan de contenu — c'est du travail déjà fait

5. **Plan Vercel Hobby** : documenter la contrainte des 2 crons max et décider si l'upgrade Pro est nécessaire

## Questions à ramener à Benoit

1. **Le domaine `acupuncturejudith.ca` est-il géré chez Wix ou chez un registrar externe ?** C'est le premier point à clarifier pour planifier la migration DNS.

2. **Le contenu dans `scripts/seo-geo/source/` et `source-resources/` — est-ce du contenu validé par Judith ou des drafts ?** S'il est validé, on peut l'intégrer directement dans la migration.

3. **Upgrade Vercel Pro prévu ?** Le plan Hobby bloque l'ajout de crons supplémentaires. Le coût est ~20 $/mois mais ouvre aussi d'autres fonctionnalités utiles (analytics, protection DDoS améliorée, durée de fonction étendue).

4. **L'écriture dans les collections publiques Firestore sera réservée à qui ?** Judith via un admin dans le Hub, Benoit via Cloud Functions, ou les deux ?

5. **Le `NEXT_PUBLIC_WIX_URL` pointe vers `mon-acupunctrice.ca`** — est-ce un alias de `acupuncturejudith.ca` ou un autre domaine ?
