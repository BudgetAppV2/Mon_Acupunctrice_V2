# Mission CC : AEO avancé — Tactiques pour maximiser les citations LLM

## Contexte
Le prompt PROMPT_CC_AEO_FIXES.md corrige les bases techniques (canonical, OG, JSON-LD, etc.).
Ce prompt-ci ajoute les tactiques de CONTENU qui ont le plus d'impact sur la citabilité par les LLMs.

Sources :
- Étude Princeton/IIT Delhi (KDD 2024) : +41% visibilité avec sources citées, +40% avec statistiques
- Analyse 8400 réponses AI : +340% citation quand réponse directe dans les 100 premiers mots
- FAQ Schema = 3.2× corrélation avec AI Overviews

## ⚠️ Branche
Tu es sur `main`.

---

## 1. Réponse directe ("Answer Block") sur chaque page service

Chaque page service doit commencer par un bloc de réponse directe de 40-60 mots
immédiatement après le H1. Ce bloc doit pouvoir être extrait et cité tel quel par un LLM.

### Pages à modifier :
- `app/(public)/services/fertilite/` — hero section
- `app/(public)/services/grossesse/` — hero section
- `app/(public)/services/pediatrie/` — hero section
- `app/(public)/services/acupuncture-sociale/` — hero section

### Format :
Ajouter un paragraphe de réponse directe juste après le titre H1 de chaque page,
dans un `<p>` avec la classe `text-lg` ou similaire. Ce paragraphe doit :
- Répondre directement à "Qu'est-ce que l'acupuncture pour [sujet] ?"
- Être autonome (faire sens sans le reste de la page)
- Mentionner Montréal/Rosemont et Repentigny
- Inclure 1 statistique concrète si possible

### Exemples :

**Fertilité** :
"L'acupuncture améliore la fertilité en régulant les cycles menstruels, en augmentant le flux sanguin utérin et en réduisant le stress. Des méta-analyses montrent une amélioration des taux de grossesse, en particulier en complément de la FIV. Judith Dufour-Savard, acupunctrice membre de l'OAQ, accompagne les couples en parcours de fertilité à Rosemont (Montréal) et Repentigny."

**Grossesse** :
"L'acupuncture pendant la grossesse soulage les nausées, les douleurs lombaires, prépare le col à l'accouchement et peut aider à la version du bébé en siège. Elle est reconnue comme sécuritaire par les méta-analyses. Judith Dufour-Savard offre un suivi d'acupuncture grossesse à Rosemont (Montréal) et Repentigny."

**Pédiatrie** :
"L'acupuncture pédiatrique utilise des techniques adaptées aux enfants — shonishin (sans aiguilles), ventouses, aimants — pour traiter les coliques, les troubles du sommeil, l'anxiété et l'énurésie. Judith Dufour-Savard pratique l'acupuncture pédiatrique à Rosemont (Montréal) et Repentigny."

**Sociale** :
"L'acupuncture sociale rend les soins accessibles grâce à un tarif solidaire de 35$ à 60$. Les séances de 60 minutes se font en groupe dans un espace calme. Judith Dufour-Savard offre l'acupuncture sociale à La Source en Soi à Rosemont (Montréal)."

---

## 2. Headings en format question (H2 → questions)

Transformer les H2 descriptifs en questions naturelles que les gens posent aux LLMs.
C'est la tactique qui a le plus de corrélation avec les citations : si notre H2 matche la question posée au LLM, le paragraphe qui suit est cité.

### Principe :
- Avant : `<h2>Acupuncture et nausées</h2>`
- Après : `<h2>Comment l'acupuncture soulage-t-elle les nausées de grossesse ?</h2>`

### Pages à modifier :
Transformer les H2 des sections principales des 4 pages services.
NE PAS modifier les H2 qui sont déjà des questions (FAQ, etc.).
NE PAS modifier les titres de sections structurelles (ex: "Mon approche", "Tarifs").

### Exemples par page :

**Fertilité** :
- "Accompagnement en fertilité" → "Comment l'acupuncture aide-t-elle la fertilité ?"
- "FIV et acupuncture" → "L'acupuncture augmente-t-elle les chances de succès en FIV ?"
- "Fertilité masculine" → "L'acupuncture peut-elle améliorer la fertilité masculine ?"

**Grossesse** :
- "Premier trimestre" → "Comment soulager les nausées du premier trimestre avec l'acupuncture ?"
- "Version du siège" → "L'acupuncture peut-elle tourner un bébé en siège ?"
- "Préparation accouchement" → "Comment l'acupuncture prépare-t-elle l'accouchement ?"

**Pédiatrie** :
- "Techniques adaptées" → "Comment se passe une séance d'acupuncture pour un enfant ?"
- "Coliques" → "L'acupuncture peut-elle soulager les coliques de bébé ?"
- "Consultations par âge" → "À quel âge un enfant peut-il recevoir de l'acupuncture ?"

**Sociale** :
- "Le format social" → "Qu'est-ce que l'acupuncture sociale et comment ça fonctionne ?"
- "Conditions traitées" → "Quelles conditions peut-on traiter en acupuncture sociale ?"

---

## 3. Statistiques concrètes dans le contenu des pages services

L'étude de Princeton montre +40% de visibilité AI avec des statistiques.
Ajouter 2-3 stats concrètes dans le corps de chaque page service.

Les stats doivent être :
- Vérifiables (issues des études PubMed citées dans les ressources)
- Concrètes (chiffres, pas "beaucoup" ou "plusieurs")
- Intégrées naturellement dans le texte

### Exemples :

**Fertilité** : "Une méta-analyse portant sur 49 essais contrôlés et 4 579 participantes montre que l'acupuncture améliore significativement les résultats de fertilité."

**Grossesse** : "Plusieurs de mes patientes voient une amélioration des nausées dès la première ou deuxième séance. Les études portant sur 869 participantes confirment une réduction significative de la fréquence et de la sévérité."

**Pédiatrie** : "La plupart des bébés ne pleurent pas pendant la séance — les aiguilles sont de la grosseur d'un cheveu."

**Sociale** : "Tarif solidaire de 35$ à 60$ — séances de 60 minutes."

---

## 4. Author byline avec credentials sur chaque page

Ajouter un bloc "auteur" en bas de chaque page service et ressource :

```tsx
<div className="mt-12 pt-8 border-t border-public-border-subtle">
  <div className="flex items-center gap-4">
    <img
      src="/site/judith/judith-portrait-01.webp"
      alt="Judith Dufour-Savard"
      className="w-12 h-12 rounded-full object-cover"
    />
    <div>
      <p className="font-medium text-public-text-dark">
        Judith Dufour-Savard, Ac.
      </p>
      <p className="text-sm text-public-text-medium">
        Acupunctrice membre de l'Ordre des acupuncteurs du Québec (OAQ).
        DEC en acupuncture, Collège de Rosemont.
      </p>
    </div>
  </div>
</div>
```

Créer un composant réutilisable `AuthorByline.tsx` et l'ajouter en bas de :
- Les 4 pages services
- La page ressource template (app/(public)/ressources/[slug]/page.tsx)
- Les pages blog (app/(public)/blog/[slug]/page.tsx)

Ajouter aussi le schema Person dans le JSON-LD de ces pages :
```json
{
  "author": {
    "@type": "Person",
    "name": "Judith Dufour-Savard",
    "jobTitle": "Acupunctrice",
    "memberOf": {
      "@type": "Organization",
      "name": "Ordre des acupuncteurs du Québec"
    }
  }
}
```

---

## 5. Paragraphes autonomes (standalone)

Vérifier que chaque paragraphe des pages services peut être compris isolément.
Si un LLM extrait un seul paragraphe, est-ce qu'il répond à une question ?

### Principe :
- Mauvais : "Pour cette raison, nous recommandons..." (dépend du contexte)
- Bon : "L'acupuncture pour la fertilité est recommandée à raison de 1 à 2 séances par semaine pendant 3 mois avant une FIV." (autonome)

Relire les 4 pages services et reformuler les paragraphes qui dépendent du contexte pour les rendre autonomes. Chaque paragraphe devrait mentionner le sujet dont il parle.

---

## 6. BreadcrumbList Schema

Ajouter un schema BreadcrumbList sur toutes les pages du site.
Ça aide les LLMs à comprendre la hiérarchie du site.

```json
{
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Accueil", "item": "https://acupuncturejudith.ca" },
    { "@type": "ListItem", "position": 2, "name": "Services", "item": "https://acupuncturejudith.ca/services" },
    { "@type": "ListItem", "position": 3, "name": "Fertilité", "item": "https://acupuncturejudith.ca/services/fertilite" }
  ]
}
```

Créer un composant ou un helper `generateBreadcrumbs(path)` et l'intégrer dans le JSON-LD de chaque page.

---

## Vérifications

- [ ] Chaque page service a un answer block de 40-60 mots après le H1
- [ ] Les H2 principaux sont formulés en questions
- [ ] 2-3 statistiques concrètes par page service
- [ ] AuthorByline avec photo + credentials sur chaque page service, ressource, blog
- [ ] Schema Person dans le JSON-LD
- [ ] BreadcrumbList Schema sur toutes les pages
- [ ] Les paragraphes principaux sont autonomes (pas de "pour cette raison...")
- [ ] Build OK

## Commit
"feat(public): AEO avancé — answer blocks, question headings, stats, author byline, breadcrumbs

Tactiques AEO basées sur l'étude Princeton (KDD 2024) :
1. Answer blocks 40-60 mots sur les 4 pages services (+340% citation)
2. H2 en format question (+corrélation citations)
3. Statistiques concrètes dans le contenu (+40% visibilité)
4. AuthorByline composant réutilisable + Schema Person
5. BreadcrumbList Schema sur toutes les pages
6. Paragraphes autonomes vérifiés"
