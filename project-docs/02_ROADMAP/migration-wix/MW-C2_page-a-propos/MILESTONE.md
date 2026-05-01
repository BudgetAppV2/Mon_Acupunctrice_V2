# Milestone MW-C2 : Page `/a-propos` avec bloc "Ma clinique"

**Type** : UI
**Vague** : 3
**Priorité** : High
**Temps estimé Claude Code** : 2-3h
**Dépendances** : MW-B1, MW-B3
**Status** : 🔴 Not started

---

## Objectif

Créer la page `/a-propos` qui présente Judith dans sa triple identité (praticienne experte, éducatrice publique, militante de l'accessibilité) avec un bloc "Ma clinique" intégrant le badge 4,9/5 de La Source en Soi.

---

## Contexte minimal

La page À propos est stratégique : c'est la page navigationnelle pour les prospects qui cherchent "Judith acupuncture Rosemont" et la page qui assume le double rôle praticienne + influenceuse (plan §7, option C). Elle doit mentionner La Source en Soi, les 4 piliers de spécialisation, et les réseaux sociaux.

---

## Livrables

- [ ] **Page `app/(public)/a-propos/page.tsx`** — Server Component avec les sections : bio narrative, formation/parcours, bloc "Ma clinique", philosophie d'approche, liens réseaux sociaux
- [ ] **Bloc "Ma clinique"** — encart dédié avec nom La Source en Soi, note 4,9/5, nombre d'avis, catégorie, lien Google Maps, `<ClinicBadge />`
- [ ] **Metadata SEO** via `generateMetadata` — optimisée pour "Judith Dufour-Savard acupunctrice Rosemont"
- [ ] **Schema.org** — `Person` étendu avec `alumniOf`, `memberOf` (Ordre des acupuncteurs), `medicalSpecialty`

---

## Approche technique

**Sections de la page** :

1. **Hero léger** — photo Eric Bates portrait + H1 "Judith Dufour-Savard" + sous-titre "Acupunctrice à Rosemont"
2. **Bio narrative** — texte en "je" de Judith (vouvoiement gardé sauf passages intimes potentiels), couvrant : parcours, pourquoi l'acupuncture, spécialisations, passion pour l'accessibilité. Ton chaleureux, pas un CV clinique (plan §7, option C)
3. **Formation & parcours** — liste structurée (diplômes, formations complémentaires, Ordre des acupuncteurs)
4. **Bloc "Ma clinique"** — fond `beige-light`, photo clinique si dispo (sinon icône), `<ClinicBadge />` prominent, texte : "J'exerce à la clinique La Source en Soi, spécialisée en fertilité et périnatalité à Rosemont, notée 4,9/5 par plus de 1 200 patient·es sur Google.", lien Google Maps
5. **Réseaux sociaux** — section avec liens vers Instagram `@mon_acupunctrice`, Facebook, YouTube, assumant le rôle d'éducatrice publique
6. **CTA** — "Prendre rendez-vous avec Judith" → `/reserver`

**Contenu** : le texte de la bio sera basé sur la page À propos Wix existante (exportée en MW-A1), reformulé pour le vouvoiement + "je". La formation et le parcours seront extraits du même contenu.

---

## Fichiers impactés

```
📄 NEW (fichiers à créer) :
- app/(public)/a-propos/page.tsx

✏️ MODIFY (aucun)
```

---

## Definition of Done

- [ ] `npm run build` passe sans erreur
- [ ] La page affiche les 6 sections dans le bon ordre
- [ ] Le bloc "Ma clinique" affiche le badge 4,9/5 avec lien vers Google Maps
- [ ] La bio mentionne les 4 piliers de spécialisation
- [ ] Les liens réseaux sociaux pointent vers les bons profils
- [ ] Lighthouse 95+ sur la page
- [ ] Schema.org `Person` validé via validator.schema.org
- [ ] Responsive correct à 375px, 768px, 1024px
- [ ] Tonalité en vouvoiement + "je" respectée
- [ ] Fichier `NOTES.md` créé avec le journal d'exécution
- [ ] Review par Benoit sur la branche (pas de merge automatique)

---

## Tests requis

- **Visual** : 375px (sections empilées), 768px, 1024px (layout photo + texte côte à côte)
- **SEO** : meta tags (title "Judith Dufour-Savard — Acupunctrice à Rosemont | La Source en Soi"), schema.org Person
- **Contenu** : vérifier que La Source en Soi est mentionnée, que les 4 piliers sont nommés

---

## Contraintes

- Ne pas modifier le code du Hub admin
- Vouvoiement + "je" — pas de tutoiement sauf si Judith le valide pour cette page spécifiquement
- Mentionner La Source en Soi dans le contenu ET dans les meta tags
- Ne pas inventer de formation ou de diplôme — utiliser uniquement le contenu Wix existant
- Mobile-first 375px
- Pas d'emojis — Heroicons pour les icônes réseaux sociaux

---

## Références

- Plan stratégique §2.1 (narratif de marque), §2.1b (ancrage clinique), §7 (intégration influenceuse, option C), §8.1b (bloc "Ma clinique")
- CLAUDE.md migration — invariants vouvoiement, La Source en Soi
- MW-A1 (export page À propos Wix — source de contenu)
- MW-B3 (`<ClinicBadge />`, `<SectionHeading />`, `<CtaButton />`)

---

## Notes de planification

- Le contenu de la bio sera à finaliser avec Benoit/Judith. Pour le MVP, utiliser le contenu Wix reformulé. Le guide de ton (MW-A3) aide à calibrer le registre.
- La photo hero est différente de celle de la homepage — utiliser un autre portrait Eric Bates parmi les 8 disponibles.
- Point à valider avec Benoit : est-ce que Judith a des diplômes/formations spécifiques à mettre en avant (DEC, certificat universitaire, formations continues) ?
- Point à valider : les handles sociaux exacts (Instagram `@mon_acupunctrice` confirmé, Facebook et YouTube à vérifier — plan §7.3).
