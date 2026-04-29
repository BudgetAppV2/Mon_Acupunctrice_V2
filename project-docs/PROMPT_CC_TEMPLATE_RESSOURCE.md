# Mission CC : Améliorer le template ressource — ordre, citations, maillage

## Contexte
Le template `app/(public)/ressources/[slug]/page.tsx` rend les pages ressources.
Actuellement il manque des éléments importants et l'ordre des sections ne correspond pas
à ce que Judith souhaite.

## 1. Réordonner les sections (priorité)

Judith veut : d'abord ce que l'acupuncture fait (approche), ensuite les preuves scientifiques.

**Ordre actuel** (lignes 125-131) :
```
introSection → scienceSection → mechanismSection → judithApproach → whatToExpect → protocolSection → testimonial
```

**Nouvel ordre** :
```
introSection → judithApproach → whatToExpect → protocolSection → scienceSection → mechanismSection → testimonial
```

Modifier le tableau à la ligne 124 pour refléter ce nouvel ordre.
Cela affectera TOUTES les ressources existantes (fertilité, grossesse, pédiatrie, sociale, santé mentale) — c'est voulu.

## 2. Ajouter la section Citations scientifiques

Les citations sont stockées dans `ressource.citations` (type Citation[]) mais ne sont pas affichées.

Ajouter une section "Sources scientifiques" entre les FAQ et le CTA, qui affiche les citations :

```tsx
{ressource.citations && ressource.citations.length > 0 && (
  <section className="bg-white py-[48px] px-5 md:px-8 border-t border-public-border-subtle">
    <div className="max-w-[780px] mx-auto">
      <h2 className="font-public-serif text-[22px] font-medium text-public-text-dark mb-6">
        Sources scientifiques
      </h2>
      <ol className="space-y-3 text-[14px] text-public-text-medium leading-relaxed">
        {ressource.citations.map((c, i) => (
          <li key={i} className="pl-2">
            <span className="font-medium">{c.authors}</span>
            {' — '}
            <em>{c.title}</em>
            {'. '}
            {c.journal}, {c.year}.
            {c.url && (
              <>
                {' '}
                <a href={c.url} target="_blank" rel="noopener noreferrer"
                   className="text-public-accent-taupe-dark underline underline-offset-2">
                  Lire l'étude
                </a>
              </>
            )}
          </li>
        ))}
      </ol>
    </div>
  </section>
)}
```

## 3. Ajouter les liens de maillage interne (MW-E6)

Les champs `relatedArticles`, `relatedFaqs`, `relatedResources` existent dans le type Ressource
mais ne sont pas rendus. Ajouter une section de maillage interne.

### Liens vers les articles de blog associés

Si `ressource.relatedArticles` contient des slugs d'articles blog, afficher une section
"Articles de blog sur ce sujet" avec des liens vers les articles.

```tsx
{ressource.relatedArticles && ressource.relatedArticles.length > 0 && (
  <div className="mt-8">
    <h3 className="text-[16px] font-semibold text-public-text-dark mb-3">
      Articles de blog sur ce sujet
    </h3>
    <ul className="space-y-2">
      {ressource.relatedArticles.map((slug) => (
        <li key={slug}>
          <Link href={`/blog/${slug}`} className="text-public-accent-taupe-dark underline underline-offset-2">
            {slug.replace(/-/g, ' ')}
          </Link>
        </li>
      ))}
    </ul>
  </div>
)}
```

Note : idéalement on chargerait les titres des articles depuis Firestore plutôt que d'utiliser le slug.
Si c'est simple à implémenter (query les publicBlog par slug), fais-le. Sinon, le slug reformaté suffit pour l'instant.

### La section "Ressources associées" existe déjà
La section `getRelatedRessources()` en bas de page fonctionne bien. La garder telle quelle.

## 4. Ordre dans le preview du Hub CMS

Vérifier dans `app/(app)/contenu/ressources/[id]/page.tsx` et `app/(app)/contenu/ressources/new/page.tsx`
que les sections du formulaire sont dans le même ordre que le template public :
intro → approche Judith → ce à quoi s'attendre → protocole → science → mécanismes

## Vérifications

- [ ] L'ordre des sections est : intro → judithApproach → whatToExpect → protocolSection → scienceSection → mechanismSection → testimonial
- [ ] Les citations scientifiques s'affichent avec liens PubMed
- [ ] Les ressources existantes (fertilité, grossesse, etc.) ne sont pas cassées
- [ ] Le formulaire CMS dans le Hub a le même ordre de sections
- [ ] Build OK

## Commit
"feat(public): template ressource — ordre sections (approche avant science) + citations + maillage

1. Sections réordonnées : intro → approche → séances → protocole → science → mécanismes
   (Judith veut montrer ce que l'acupuncture fait AVANT les preuves scientifiques)
2. Section 'Sources scientifiques' ajoutée (affiche citations[] avec liens PubMed)
3. Section 'Articles de blog sur ce sujet' ajoutée (affiche relatedArticles[])
4. Formulaire CMS Hub aligné sur le même ordre
5. Affecte toutes les ressources existantes"
