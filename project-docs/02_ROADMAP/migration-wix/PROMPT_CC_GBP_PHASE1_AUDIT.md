# PROMPT À COPIER-COLLER DANS CLAUDE IN CHROME — PHASE 1 AUDIT GBP JUDITH

---

Tu es un consultant Google Business Profile expert pour les professionnels de la santé au Québec. Tu vas AUDITER le GBP de Judith Dufour-Savard (acupunctrice membre OAQ A-008-24).

**RÈGLE ABSOLUE** : NE MODIFIE RIEN. Tu fais uniquement un audit. La Phase 2 (exécution) viendra après validation utilisateur.

## CONTEXTE

- Site web officiel migré hier vers `https://acupuncturejudith.ca`
- Adresse principale : La Source en Soi, 2554 rue Beaubien Est, Montréal QC H1Y 1G3
- Adresse secondaire : Éden Yoga Pilates, 121 Boulevard Industriel suite 225, Repentigny QC J6A 7K4
- Téléphone : 514-750-3735
- Concurrence : Judith Shedleur (judithacupuncture.com) ranke plus haut grâce à son GBP très optimisé (10 avis, sitelinks, photos, bouton appel direct, gorendezvous intégré)

## MISSION

1. Va sur `https://business.google.com/`
2. Sélectionne le profil "Judith Dufour-Savard" (le compte est déjà loggé)
3. Audit chaque section ci-dessous, **rapporte l'état actuel** (rempli / vide / incorrect)

### Sections à auditer

**A. Infos de base** : Nom exact, Catégorie principale, Catégories secondaires, Adresse, Téléphone, URL site web (doit être `https://acupuncturejudith.ca`), Date d'ouverture

**B. Description** : copier le texte complet, compter les caractères (max 750), noter les mots-clés présents (acupuncture, fertilité, grossesse, pédiatrie, Rosemont, Repentigny, OAQ)

**C. Heures** : Horaires réguliers chaque jour, Heures spéciales (jours fériés), Marquage fermé samedi/dimanche

**D. Photos** : Logo, Couverture, Extérieur LSSI, Intérieur cabinet, Portrait Judith, Total photos

**E. Services** : Liste complète des services configurés (nom + description + prix si visible)

**F. Attributs** : Online appointments, Wheelchair accessible, Women-owned, Languages, Payment methods, Appointment required

**G. Bouton réservation** : URL configurée (devrait être `https://gorendezvous.com/lasourceensoi`)

**H. Q&A** : Nombre de questions, questions sans réponse

**I. Posts** : Date du dernier post, fréquence

**J. Avis** : Nombre total, note moyenne, avis sans réponse, date du plus récent

**K. Insights** : Vues 28 derniers jours, clics site, appels, demandes itinéraire (si visible)

**L. Locations** : Y a-t-il une seconde location pour Repentigny ?

## LIVRABLE — RAPPORT D'AUDIT

À la fin de l'audit, génère un rapport markdown avec cette structure exacte :

```markdown
# Audit GBP Judith Dufour-Savard — 4 mai 2026

## Score global : X/10

## Forces
- ...

## Faiblesses CRITIQUES (priorité haute)
- ...

## Faiblesses secondaires (priorité moyenne)
- ...

## Détail par section
### A. Infos de base
[état actuel + écart vs cible]

### B. Description
[texte actuel intégral + analyse]

[...etc pour toutes les sections]

## Plan d'optimisation proposé pour Phase 2
1. [Action prioritaire 1]
2. [Action prioritaire 2]
[...]
```

## TÉLÉCHARGER LE RAPPORT — IMPORTANT

Une fois le rapport markdown rédigé dans ta réponse, **exécute ce JavaScript dans la page** pour le télécharger sur le laptop de l'utilisateur :

```js
const reportContent = `<COLLE ICI LE CONTENU MARKDOWN COMPLET DU RAPPORT>`;
const blob = new Blob([reportContent], { type: 'text/markdown;charset=utf-8' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'audit_gbp_judith_2026-05-04.md';
document.body.appendChild(a);
a.click();
document.body.removeChild(a);
URL.revokeObjectURL(url);
console.log('Rapport téléchargé : audit_gbp_judith_2026-05-04.md');
```

⚠️ Remplace `<COLLE ICI LE CONTENU...>` par le rapport complet en utilisant des template literals (backticks) pour préserver le formatage markdown sur plusieurs lignes. Échappe les backticks éventuels dans le contenu avec `\``.

## RÈGLES STRICTES

- NE MODIFIE AUCUN champ du GBP — c'est un audit pur
- Si tu trouves une donnée sensible/incorrecte (ex : mauvais téléphone), notes-la dans le rapport mais ne la corrige pas
- Si une section est inaccessible (ex : pas de droits admin), notes-le clairement
- À la fin : affiche le rapport dans le sidepanel ET déclenche le téléchargement
- Termine par : "Phase 1 terminée. En attente de validation utilisateur pour Phase 2."

