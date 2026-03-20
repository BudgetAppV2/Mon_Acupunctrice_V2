# ROADMAP_SIMPLIFIÉE.md
# La vraie roadmap — 3 niveaux
*Version 1.0 — Mars 2026*

---

## Principe

> On ne construit pas un système parfait.
> On construit un système utilisé.

---

## Milestones V1 — Ce qu'on code maintenant
*Objectif : Judith utilise l'app 3x/semaine dès cette semaine*

### V1.1 — Auth Google (1 session)
- Bouton "Se connecter avec Google"
- ProtectedRoute sur toutes les pages
- Migration données existantes vers userId
- Firestore rules sécurisées

**DONE quand :** Judith peut se connecter et voir ses données.
**STOP :** Pas de gestion multi-utilisateurs, pas de rôles.

### V1.2 — Publier en 1 clic (1 session)
- Bouton "Publier sur Instagram" dans EditorToolbar
- Caption générée (éditable avant envoi)
- Confirmation simple → publication
- Status → 'publié'

**DONE quand :** Judith publie une vidéo sans quitter l'éditeur.
**STOP :** Pas de scheduling, pas de multi-plateforme.

### V1.3 — Dashboard minimal (0.5 session)
- 1 ligne en haut du calendrier :
  `📊 Cette semaine : X publiés · X planifiés · X prêts · X idées`
- Pas de graphiques, pas d'analytics

**DONE quand :** Judith comprend son état en 5 secondes.
**STOP :** Pas de métriques Instagram, pas d'historique.

### V1.4 — Nettoyer les console.log (15 min)
- Retirer tous les logs de debug de production
- Garder seulement les erreurs réelles

---

## Milestones V2 — Après usage réel (4-6 semaines)
*Objectif : Judith publie régulièrement sans effort*

### V2.1 — Publication programmée
- Setter une date + heure depuis l'éditeur
- Scheduler publie automatiquement
- Notification email si échec

### V2.2 — Rappel hebdomadaire simple
- 1 email par semaine (dimanche soir)
- Format fixe : "Tu as X vidéos prêtes. Prochain contenu : dans Y jours."
- Pas de logique adaptative, pas de cooldown complexe
- On/Off dans les settings

### V2.3 — Statuts métier clarifiés
- Migrer workflowState (idea → shot → editing → ready)
- Migrer distributionStatus (draft → scheduled → published)
- UI mise à jour

### V2.4 — Éditeur polish minimal
- 3 filtres CSS (Normal / Lumineux / Chaud) — 30 minutes de code
- 5 polices Google (Montserrat, Bebas Neue, Playfair, DM Sans, Pacifico)
- Voilà, c'est tout pour les polices et filtres

---

## Milestones V3 — Vision avancée (déjà documentée)
*Objectif : Système apprenant, guide Judith sur la durée*

Tout ce qui est dans les documents SYSTEM_* :
- Moteur de guidance éditoriale (V3/V4)
- Mémoire comportementale
- Attribution des actions
- Profil de cadence adaptatif
- Boucle de valeur complète
- Intégration API Instagram Insights

**Ces documents sont en réserve.**
On y revient quand V1 + V2 sont stables et utilisés.

---

## Ce qui ne sera jamais construit (hors scope)

- Génération automatique de contenu
- Multi-utilisateurs complexes
- Export CapCut professionnel avancé
- Tendances / hashtags / optimisation algorithme
- Collaboration d'équipe

---

## Règle de gel (rappel)

> Aucune nouvelle feature éditeur tant que :
> - V1.1 Auth ✅
> - V1.2 Publier en 1 clic ✅
> - V1.3 Dashboard minimal ✅
