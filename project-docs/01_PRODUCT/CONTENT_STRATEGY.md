# Stratégie de contenu & conversion — Mon Acupunctrice Hub

## Objectif final
**Stimuler la prise de rendez-vous** chez La Source en Soi avec Judith.
Chaque post, chaque Reel, chaque story doit rapprocher la personne de cliquer "Prendre RDV".

---

## Constat actuel

### Ce qu'on a
- Hub de création de contenu (idées → éditeur → publication multi-plateforme)
- Instagram, Facebook, YouTube connectés
- Site Wix (acupuncturejudith.ca / mon-acupunctrice.ca)
- Go Rendez-Vous (via La Source en Soi, clinique multi-praticiens)
- Judith employee ID: 7556837

### Le gap
- Pas de lien direct vers la prise de RDV avec Judith spécifiquement
- Le contenu n'a pas encore de stratégie de conversion structurée
- Pas de call-to-action systématique dans les captions
- Le bio Instagram n'est pas optimisé pour la conversion

---

## La stratégie en 3 piliers

### PILIER 1 — Contenu qui parle aux problèmes réels
**Principe clé de 2026 :** "Si ton post ne fait pas penser 'c'est exactement
ce que je vis', les gens scrollent." — La spécificité bat l'esthétique.

**Catégories de contenu pour Judith :**

1. **"Tu savais que..." (Éducation)**
   - Acupuncture et fertilité : mythes vs réalité
   - Ce qui se passe dans ton corps pendant une séance
   - Pourquoi l'OMS recommande l'acupuncture pour X
   → But : Établir la crédibilité, SEO YouTube

2. **"Moi aussi je..." (Connexion personnelle)**
   - Judith qui prépare sa salle, ses aiguilles
   - Sa routine avant/après une journée de consultations
   - Ses boucles d'oreilles (le contenu qu'elle voulait faire!)
   → But : Créer un lien humain, "je veux être traitée par ELLE"

3. **"Voici comment..." (Solutions)**
   - 3 points d'acupression à faire chez soi pour les nausées de grossesse
   - Comment préparer sa première séance d'acupuncture
   - Exercice de respiration pour l'anxiété pré-natale
   → But : Donner de la valeur, démontrer l'expertise

4. **"Témoignage / Résultat" (Preuve sociale)**
   - Avant/après (avec consentement) — pas physique, mais état de bien-être
   - Texte de remerciement d'une patiente (anonymisé)
   - "3 séances plus tard, elle dort enfin"
   → But : Preuve que ça fonctionne → conversion directe

**Ratio recommandé :** 2 éducation : 2 connexion : 1 solution : 1 preuve sociale

### PILIER 2 — Call-to-Action systématique

**Chaque post doit avoir UN CTA clair.** Pas deux, pas zéro. UN.

**CTAs rotatifs par type de contenu :**

| Type | CTA |
|------|-----|
| Éducation | "Enregistre ce post pour t'en rappeler 📌" |
| Connexion | "Tu vis ça aussi? Dis-le moi en commentaire 💬" |
| Solution | "Essaie et dis-moi comment ça s'est passé! 🌿" |
| Preuve sociale | "Prête à essayer? Lien pour prendre RDV dans ma bio ✨" |

**Règle importante :** Seulement 1 post sur 4-5 devrait avoir un CTA direct
vers la prise de RDV. Les autres construisent l'engagement et la confiance.

**CTA pour la prise de RDV (quand utilisé) :**
```
📍 La Source en Soi — Rosemont
🔗 Lien de prise de rendez-vous dans ma bio
Ou cherche "Judith Dufour-Savard" sur gorendezvous.com
```

### PILIER 3 — Optimiser le chemin vers le RDV

**Bio Instagram optimisée :**
```
Judith Dufour-Savard, Ac. 🌿
Acupuncture | Fertilité | Prénatal | Enfant
📍 La Source en Soi — Rosemont, Montréal
⬇️ Prends rendez-vous ici ⬇️
[lien]
```

**Le lien dans la bio — options par priorité :**

1. **Idéal (nécessite admin La Source en Soi) :**
   Bouton Go Rendez-Vous embed avec `eids=7556837` pré-sélectionné
   → L'admin configure dans Paramètres → Promouvoir → Bouton → Avancé

2. **Solution intermédiaire — Page de lien dans le Hub :**
   Créer une page `/rdv` dans le Hub (ou sur le site Wix) qui :
   - Affiche le nom et la photo de Judith
   - Explique les services disponibles (Régulier, Prénatal, Fertilité, Enfant)
   - Chaque service a un bouton "Prendre RDV" qui pointe vers Go Rendez-Vous
   - Instructions claires : "Sélectionnez Judith Dufour-Savard"

3. **Minimum viable :**
   Lien direct `gorendezvous.com/lasourceensoi` avec dans la bio :
   "Demandez Judith Dufour-Savard"

**YouTube Shorts :**
Le lien est cliquable dans la description → inclure systématiquement
le lien vers Go Rendez-Vous + le site web de Judith.

---

## Implémentation dans le Hub

### Modifications à faire (par priorité)

#### P1 — Templates de CTA dans la génération de caption
Modifier le prompt `generateCaption` pour inclure automatiquement un CTA
adapté au type de contenu. Le prompt utilise la KB SEO déjà créée.

**Fichier :** `app/api/generate-caption/route.ts` (ou Cloud Function)
**Action :** Ajouter au prompt système les CTAs par catégorie (ci-dessus)

#### P2 — Page de lien "Prendre RDV" 
Créer une page publique (pas derrière le login) accessible depuis la bio IG.
Options : 
- Page sur le site Wix de Judith (plus simple)
- Ou page `/rdv` dans le Hub (plus contrôlé)

#### P3 — Hashtags configurables dans le profil
Judith configure ses hashtags par catégorie dans le profil du Hub.
Le generateCaption les inclut automatiquement (3-5 max, ciblés).

#### P4 — Calendrier éditorial dans le Hub
Ajouter une vue "Semaine" dans le calendrier qui montre le ratio de contenu :
- Code couleur par catégorie (éducation=bleu, connexion=vert, solution=jaune, preuve=rose)
- Alerte si trop de posts dans la même catégorie
- Suggestion : "Tu n'as pas posté de contenu 'connexion' cette semaine"

#### P5 — Statistiques orientées conversion (extension M12)
Ajouter dans la page Stats :
- "Engagement moyen par catégorie de contenu"
- "Quel type de post génère le plus de sauvegardes?"
- Les sauvegardes (saves) sont le signal #1 sur Instagram en 2026

---

## Calendrier éditorial — Première semaine type

| Jour | Type | Idée de contenu | CTA |
|------|------|----------------|-----|
| Lundi | Éducation | "3 choses que l'acupuncture peut faire pour ta fertilité" | Enregistre 📌 |
| Mercredi | Connexion | Judith met ses boucles d'oreilles + texte narratif "ma journée commence..." | Commente 💬 |
| Vendredi | Solution | "Point d'acupression pour les nausées — essaie maintenant" | Essaie et dis-moi 🌿 |
| Dimanche | Preuve sociale | Texte témoignage anonymisé + musique douce | Lien RDV dans bio ✨ |

**Fréquence recommandée :** 3-4 posts/semaine minimum, régularité > quantité.

---

## Action items immédiats

- [ ] Judith demande à l'admin de La Source en Soi le bouton embed avec son profil
- [ ] Optimiser la bio Instagram de Judith (texte ci-dessus)
- [ ] Mettre à jour le prompt generateCaption avec les CTAs par catégorie
- [ ] Créer une page de lien simple sur le site Wix ou dans le Hub
- [ ] Planifier la première semaine de contenu avec Judith

---

## Métriques de succès (à suivre dans M12 Stats)

1. **Saves par post** — le signal #1 en 2026, montre que le contenu a de la valeur
2. **Reach par Reel** — portée organique
3. **Engagement rate** — (likes + comments + saves + shares) / reach
4. **Clics vers le profil** — disponible via Instagram Insights
5. **Prises de RDV** — demander à Judith de tracker manuellement au début
   ("Comment avez-vous entendu parler de moi?" → Instagram/YouTube)
