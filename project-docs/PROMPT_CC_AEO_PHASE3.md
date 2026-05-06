# Mission CC : Phase 3 AEO — Nettoyage final + pont admin + réseaux sociaux

## Contexte
Le site est LIVE sur main. Score AEO ~80/100. Cette phase corrige les incohérences finales.
Le site est en production — chaque commit est déployé automatiquement sur Vercel.

---

## 1. Réseaux sociaux — URLs officielles (appliquer PARTOUT)

Les URLs officielles de Judith sont :
- Instagram : `https://www.instagram.com/mon_acupunctrice/`
- YouTube : `https://www.youtube.com/@JudithDufourSavard`
- Facebook : `https://www.facebook.com/profile.php?id=61562614934143`
- LinkedIn : `https://www.linkedin.com/in/judith-dufour-savard-acu/`
- Wikidata : `https://www.wikidata.org/wiki/Q139677208`

### Appliquer ces URLs dans :

**Schema JSON-LD sameAs** (GlobalJsonLd.tsx et tout autre JSON-LD) :
```json
"sameAs": [
  "https://www.wikidata.org/wiki/Q139677208",
  "https://www.instagram.com/mon_acupunctrice/",
  "https://www.youtube.com/@JudithDufourSavard",
  "https://www.facebook.com/profile.php?id=61562614934143",
  "https://www.linkedin.com/in/judith-dufour-savard-acu/"
]
```

**Footer (SiteFooter.tsx)** — mettre les mêmes URLs exactes.

**llms.txt** — section social profiles.

**Vérification** : chercher toutes les mentions de ces réseaux et uniformiser :
```bash
grep -rn "instagram\|youtube\|facebook\|linkedin\|judith.acupuncture\|mon_acupunctrice" app/(public)/ public/ --include="*.tsx" --include="*.txt"
```
Retirer tout lien générique (ex: `https://www.youtube.com` sans profil spécifique).

---

## 2. Schema JSON-LD — Dédupliquer et nettoyer

### 2A. Retirer les schemas hérités dupliqués
Le `GlobalJsonLd.tsx` injecte WebSite + Person + MedicalBusiness sur TOUTES les pages.
Certaines pages ajoutent encore LEURS PROPRES schemas Organization/MedicalBusiness hérités.

Pour chaque page publique, vérifier s'il y a des schemas dupliqués avec le GlobalJsonLd :
```bash
grep -rn "MedicalBusiness\|Organization" app/(public)/ --include="*.tsx" | grep -v GlobalJsonLd | grep -v node_modules
```

Si une page a un schema MedicalBusiness ou Organization EN PLUS du GlobalJsonLd, retirer le schema local.
Garder UNIQUEMENT les schemas SPÉCIFIQUES à la page (BreadcrumbList, FAQPage, Article, etc.).

### 2B. Image .jpg → .webp
```bash
grep -rn "\.jpg" app/(public)/ --include="*.tsx" | grep -v node_modules
```
Remplacer toute occurrence de `judith-portrait-01.jpg` par `judith-portrait-01.webp`.

### 2C. Schema améliorations
Dans GlobalJsonLd.tsx, retirer `SearchAction` si le site n'a pas de vraie barre de recherche fonctionnelle.

---

## 3. Pont admin — Bouton flottant conditionnel (remplace le lien footer)

### 3A. Retirer le lien "Espace admin" du footer
Retirer complètement le lien `/calendrier` du SiteFooter.tsx.
Il ne doit y avoir AUCUN lien vers des routes admin dans le HTML public.

### 3B. Créer un composant AdminFloatingButton
Créer `app/(public)/_components/AdminFloatingButton.tsx` :

```tsx
'use client';

import { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirebaseApp } from '@/lib/firebase';

const ADMIN_UID = 'UID_DE_BENOIT'; // hardcodé, décision R2

export default function AdminFloatingButton() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const app = getFirebaseApp();
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAdmin(user?.uid === ADMIN_UID);
    });
    return unsubscribe;
  }, []);

  if (!isAdmin) return null;

  return (
    <a
      href="/calendrier"
      className="fixed bottom-4 right-4 z-50 bg-gray-900/80 text-white text-xs px-3 py-2 rounded-full shadow-lg hover:bg-gray-900 transition-colors backdrop-blur-sm"
    >
      ☰ Hub admin
    </a>
  );
}
```

Note : trouver le UID de Benoit dans le code existant. Chercher :
```bash
grep -rn "ADMIN_UID\|adminUid\|hardcod" app/ lib/ --include="*.ts" --include="*.tsx"
```

### 3C. Ajouter dans le layout public
Dans `app/(public)/layout.tsx`, importer et ajouter le composant :
```tsx
import AdminFloatingButton from './_components/AdminFloatingButton';
// ... dans le JSX :
<AdminFloatingButton />
```

Ce composant est invisible pour les visiteurs et les crawlers (rendu côté client, conditionnel).
Seul Benoit (et Judith si elle a accès) voit le bouton.

---

## 4. H1 orientés recherche

Les H1 actuels sont poétiques. Les remplacer par des H1 SEO avec le texte poétique en sous-titre.

| Page | H1 actuel | Nouveau H1 | Sous-titre (ancien H1) |
|---|---|---|---|
| Homepage | "Venez comme vous êtes" | "Judith Dufour-Savard — Acupunctrice à Rosemont, Montréal" | "Venez comme vous êtes" |
| Fertilité | "Votre parcours fertilité, accompagné" | "Acupuncture fertilité à Rosemont et Montréal" | "Votre parcours fertilité, accompagné" |
| Grossesse | "Votre grossesse, accompagnée en douceur" | "Acupuncture grossesse et périnatalité à Montréal" | "Votre grossesse, accompagnée en douceur" |
| Sociale | "La santé est un droit" | "Acupuncture sociale à Rosemont — tarif solidaire" | "La santé est un droit" |
| Pédiatrie | (vérifier l'actuel) | "Acupuncture pédiatrique à Montréal — bébés et enfants" | (garder l'actuel en sous-titre) |

Le nouveau H1 utilise `SectionHeading` avec `as="h1"`.
L'ancien texte devient un `<p>` stylé en italique ou en plus petit sous le H1.

---

## 5. Liens legacy dans le contenu

### 5A. Vérifier le code
```bash
grep -rn "/post/\|/contactez-moi" app/(public)/ --include="*.tsx"
```
Remplacer `/post/` → `/blog/` et `/contactez-moi` → `/contact`.

### 5B. Vérifier Firestore
Les articles blog dans Firestore ont DÉJÀ été nettoyés (liens /post/ et /contactez-moi corrigés).
Mais vérifier que les ressources Firestore n'ont pas ces liens aussi.

---

## 6. Sitemap — Vérifier slugs ASCII

Le sitemap (`app/sitemap.ts`) lit les slugs depuis Firestore.
Les 3 slugs accentués ont été migrés vers ASCII dans Firestore.

**Vérifier** que le sitemap ne contient AUCUN slug accentué :
- Le filtre `status === 'published'` doit fonctionner
- Les slugs doivent être les versions ASCII

Si le sitemap est encore caché par ISR, ajouter un revalidate plus court ou forcer un redéploiement.

---

## 7. llms-full.txt — Ne référencer que le contenu live

Modifier `scripts/generate-llms-full.mjs` pour :
1. Exclure les ressources avec `status: "pending"` ou `status: "draft"` dans le frontmatter
2. Ne pas référencer d'URLs qui retournent 404

Après modification, régénérer :
```bash
node scripts/generate-llms-full.mjs
```

Vérifier que la ressource ménopause (status: pending) N'EST PAS dans le fichier généré.

---

## 8. FAQ schema — Réponses complètes

Vérifier que les réponses FAQ dans le JSON-LD ne sont pas tronquées.
Si elles sont coupées à 500 caractères, augmenter la limite ou ne pas tronquer du tout.

Chercher le code de troncation :
```bash
grep -rn "500\|truncat\|slice\|substring" app/(public)/ --include="*.tsx" | grep -i "faq\|answer"
```

---

## 9. Double H1 dans articles blog

Vérifier ces 2 articles :
- `acupuncture-baby-blues-post-partum`
- `acupuncture-fertilite-montreal-preparer-conception`

S'assurer qu'il n'y a qu'UN SEUL H1 par page.
Le template blog `app/(public)/blog/[slug]/page.tsx` ne devrait avoir qu'un H1 (le titre).
Si le contenu markdown contient un `# Titre` (H1 markdown), le convertir en H2.

---

## 10. Fichiers dupliqués " 2" (nettoyage)

Le repo contient des dizaines de fichiers dupliqués avec le suffixe " 2" :
```bash
find . -name "* 2.*" -not -path "./node_modules/*" -not -path "./.next/*" -not -path "./.next_old*"
```

Supprimer TOUS ces fichiers dupliqués. Aussi supprimer :
- `.next_old_*/` (anciens builds)
- `public/sw *.js` (service workers parasites)

```bash
rm -rf .next_old_*
find . -name "sw [0-9]*.js" -path "./public/*" -delete
find . -name "* 2.*" -not -path "./node_modules/*" -not -path "./.next/*" -delete
find . -name "* 2.md" -not -path "./node_modules/*" -not -path "./.next/*" -delete
```

Ajouter au `.gitignore` :
```
.next_old*/
```

---

## Vérifications finales

```bash
# 1. Aucun schema dupliqué
grep -rn "MedicalBusiness\|Organization" app/(public)/ --include="*.tsx" | grep -v GlobalJsonLd | grep -v node_modules

# 2. Aucun .jpg dans les schemas
grep -rn "\.jpg" app/(public)/ --include="*.tsx" | grep -v node_modules

# 3. Aucun /post/ ou /contactez-moi
grep -rn "/post/\|/contactez-moi" app/(public)/ --include="*.tsx"

# 4. Aucun lien /calendrier dans le footer
grep -rn "calendrier" app/(public)/_components/SiteFooter.tsx

# 5. Profils sociaux cohérents (même URLs dans schema + footer)
grep -rn "instagram\|youtube\|facebook" app/(public)/_components/SiteFooter.tsx app/(public)/_components/GlobalJsonLd.tsx

# 6. llms-full.txt ne contient pas ménopause
grep "menopause" public/llms-full.txt

# 7. Pas de fichiers " 2" restants
find . -name "* 2.*" -not -path "./node_modules/*" -not -path "./.next/*" | head -5

# 8. Build OK
npm run build
```

## Commit
"fix(aeo): Phase 3 — réseaux sociaux, schema cleanup, pont admin, H1 SEO, nettoyage

1. Réseaux sociaux unifiés : IG mon_acupunctrice, YT @JudithDufourSavard, FB, LI, Wikidata
   (même URLs dans Schema sameAs + Footer + llms.txt)
2. Schema dédupliqué : retrait schemas hérités, image .webp, retrait SearchAction
3. Pont admin : lien footer retiré → AdminFloatingButton conditionnel (Firebase Auth)
4. H1 SEO : poétiques → orientés recherche avec géolocalisation
5. Liens legacy nettoyés
6. llms-full.txt : exclut contenu non publié
7. FAQ schema : réponses non tronquées
8. Blog : double H1 corrigé
9. Fichiers dupliqués supprimés (*.2.*, .next_old, sw*.js)"

