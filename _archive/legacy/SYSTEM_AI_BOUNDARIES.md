# SYSTEM_AI_BOUNDARIES.md
# Frontières de l'IA — Règles strictes
*Version 1.0 — Mars 2026*

---

## Principe

> L'IA observe et recadre. Elle n'invente pas.

Cette règle protège la voix de Judith et évite la dérive vers
un produit générique.

---

## Liste 1 — IA autorisée en automatique

Ces actions se font sans demander la permission de Judith.

```
✅ Détecter les trous dans le calendrier
✅ Calculer la cadence de publication
✅ Identifier les items bloqués trop longtemps
✅ Envoyer un rappel basé sur des règles heuristiques
✅ Générer un thumbnail à partir de la vidéo exportée
✅ Transcrire l'audio (Whisper) quand demandé
✅ Mettre à jour le statut après publication réussie
✅ Classer une idée dans une catégorie existante (si confiance > 0.9)
```

---

## Liste 2 — IA autorisée sur demande explicite

Ces actions nécessitent que Judith clique sur un bouton.

```
✅ Générer une caption (bouton "Générer une légende")
✅ Reformuler une caption existante (bouton "Reformuler")
✅ Proposer 2-3 variantes de CTA (bouton "Suggérer un CTA")
✅ Générer des sous-titres (bouton "Auto-générer")
✅ Résumer l'état du pipeline (bouton "Résumé de la semaine")
✅ Suggérer des idées de contenu (bouton "Nouvelles idées")
✅ Corriger le français QC dans les sous-titres
```

---

## Liste 3 — IA interdite

Ces actions ne doivent jamais être automatisées.

```
❌ Publier du contenu sans confirmation explicite de Judith
❌ Écrire un script complet à la place de Judith
❌ Modifier une caption après validation
❌ Choisir une date de publication automatiquement
❌ Supprimer ou archiver des idées
❌ Générer des images ou visuels "à la place de" Judith
❌ Envoyer des messages aux abonnés
❌ Modifier le ton ou la voix de Judith dans les captions
❌ Décider quelle idée mérite d'être produite
```

---

## Règle de dérive

> Si une nouvelle feature IA est proposée, elle doit
> explicitement appartenir à l'une des trois listes.
>
> Si elle n'est pas clairement dans Liste 1 ou 2,
> elle est automatiquement dans Liste 3.

---

## Protection contre la dérive créative

Le système ne doit jamais :
- proposer de titres accrocheurs à la place de Judith
- générer des scripts ou des plans de tournage
- suggérer des tendances ou hashtags "viraux"
- optimiser automatiquement pour l'algorithme

Ces actions retirent à Judith le contrôle de sa voix.

---

## Critère de DONE
- [ ] Chaque feature IA est classifiée dans l'une des 3 listes
- [ ] Aucune action Liste 3 n'est implémentée
- [ ] Judith peut désactiver chaque feature Liste 2

## Critère de STOP
> Ne pas ajouter de features IA sans d'abord les classifier.
