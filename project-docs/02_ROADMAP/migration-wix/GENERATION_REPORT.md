# Rapport de génération des MILESTONE.md

**Date** : 14 avril 2026
**Nombre de MILESTONE.md créés** : 29
**Branche** : `feature/site-public-migration`

---

## Résumé

29 fichiers MILESTONE.md ont été créés dans les dossiers `MW-A1` à `MW-G2`, couvrant les 7 vagues de la migration Wix → Vercel. Chaque milestone suit le template défini dans `META_PROMPT_GENERATE_MILESTONES.md` et est ancré dans le plan éditorial v0.3 (incluant les amendements A1-A5).

---

## Milestones potentiellement trop gros

### MW-C3 (Pages services) — 4-6h, 5 pages

Ce milestone crée 5 pages (overview + 4 services). C'est le plus gros de la vague 3. **Proposition de découpage si nécessaire** :
- **MW-C3a** : Page overview `/services` + page fertilité + page grossesse (les 2 piliers les plus critiques SEO)
- **MW-C3b** : Page pédiatrie + page acupuncture sociale (niches plus spécifiques)

Cependant, les 4 pages services suivent exactement la même structure — une fois la première écrite, les 3 autres sont du pattern-matching. Le découpage pourrait créer plus de friction qu'il n'en résout. **Recommandation : garder en un seul milestone**, mais s'autoriser à livrer en 2 temps si la session dépasse 5h.

### MW-B3 (Composants base) — 4-6h, 8 composants

8 composants à porter depuis la v4. Le scope a déjà été resserré (les composants décoratifs comme `PaperTexture`, `GrainOverlay`, `BotanicalDeco`, `WatermarkText` sont reportés à MW-C1). **Le scope actuel est correct** — les 8 composants sont tous critiques pour les pages.

### MW-G1 (Pré-flight checklist) — 2-3h, 10 catégories de vérification

La checklist est exhaustive (10 catégories, ~50 vérifications). C'est voulu : c'est le dernier checkpoint avant la production. **Pas de découpage nécessaire** — c'est un milestone de vérification, pas de création.

---

## Dépendances identifiées — aucun problème

Toutes les dépendances respectent l'ordre des vagues :
- Vague 0 (Prep) → aucune dépendance
- Vague 1 (Infra) → MW-B3 dépend de MW-B1 (correct, même vague)
- Vague 2 → MW-B4 dépend de MW-B2 et MW-A1 (vagues 0-1, correct)
- Vague 3 (Pages) → toutes dépendent de MW-B1 + MW-B3 (vague 1, correct)
- Vague 4 (Contenu) → MW-D1 dépend de MW-B4 (vague 2), MW-D2 de MW-D1 (même vague), etc.
- Vague 5 (Admin) → dépendent de MW-B2 (vague 1) — peuvent commencer en parallèle des vagues 3-4
- Vague 6 → MW-F1 dépend de MW-C1 (vague 3), MW-F2 de MW-E1/E2 (vague 5)
- Vague 7 → MW-G1 dépend de tout, MW-G2 de MW-G1

**Aucune dépendance inverse détectée** (pas de milestone vague N qui dépend d'un milestone vague N+1).

---

## Questions ouvertes pour Benoit

### Informations à fournir avant certains milestones

1. **MW-C4 (Tarifs)** : les tarifs exacts de l'échelle solidaire (minimum, maximum, paliers)
2. **MW-C6 (Contact)** : l'adresse exacte, les horaires, et le téléphone/email à afficher
3. **MW-C2 (À propos)** : les diplômes/formations spécifiques de Judith
4. **MW-A3 (Guide de ton)** : est-ce que Judith a des sujets tabous ? Quand est-elle dispo pour l'entretien de 30 min ?
5. **MW-A4 (Audit GEO)** : est-ce que Judith a déjà une relation formelle avec la direction de La Source en Soi ?
6. **MW-B3 (Composants)** : y a-t-il un logo graphique ou juste le nom en serif ?
7. **MW-E1 (Admin FAQ)** : où placer le lien "Site public" dans la nav du Hub ?
8. **MW-C3 (Services)** : la pratique pédiatrique de Judith est-elle confirmée et active ?

### Décisions architecturales en attente

9. **MW-B1 (Route group)** : le root layout `app/layout.tsx` applique-t-il une font globale qui pourrait interférer avec Cormorant Garamond ?
10. **MW-D3 (Import FAQ)** : le fichier `04-acupuncture-sante-mentale-anxiete.md` doit-il être importé comme FAQ, comme ressource, ou comme page service ?
11. **MW-E4 (Review)** : "Rejeter" un contenu = supprimer définitivement ou = remettre en draft ?
12. **MW-F3 (Plausible)** : Plausible hosted (~9 $/mois) ou self-hosted (gratuit mais maintenance) ?
13. **MW-G2 (Switch DNS)** : Google Search Console est-il déjà configuré avec la propriété `acupuncturejudith.ca` ?

### Notes de qualité

14. **MW-D5 (Ressources)** : les pages ressources risquent d'être vides au lancement si aucune ressource n'est pré-créée. Faut-il produire 1-2 ressources avant le lancement ?
15. **MW-E3 (Blog publish double)** : la publication vers Wix passe-t-elle par la route API Next.js ou par une Cloud Function Firebase ? Le code à modifier dépend de la réponse.
16. **MW-F2 (Cron refresh)** : la génération Claude automatique est-elle souhaitée au lancement ou uniquement la revalidation ISR ?

---

## Fichiers modifiés

Aucun fichier existant n'a été modifié. 29 fichiers MILESTONE.md créés + ce rapport.

---

*Pas de commit effectué — changements en local pour review Benoit.*
