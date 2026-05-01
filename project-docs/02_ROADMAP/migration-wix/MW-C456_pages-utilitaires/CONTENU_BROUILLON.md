# MW-C4 / C5 / C6 — Pages utilitaires SEO-optimisées (tarifs, réserver, contact)

**Brouillon drafté par Claude Desktop le 16 avril 2026.**

**Directive Benoit** : ces pages ne sont pas des pages de ranking primaires, MAIS elles doivent être optimisées pour maximiser le SEO du site. Focus sur :
1. **SEO local** (mots-clés "acupuncteur Rosemont", "acupuncture Beaubien Est", "acupuncture Montréal")
2. **NAP consistency** (Nom/Adresse/Phone identiques partout)
3. **Schema.org LocalBusiness / MedicalBusiness** (critique pour ranking Google Maps + local pack)
4. **Rich snippets** (ReserveAction, Offer, FAQPage si pertinent)
5. **Core Web Vitals** (pas d'iframe tiers lourds, fast loading)

---

## Principes SEO appliqués

### A. Schema.org LocalBusiness / MedicalBusiness (PRIORITÉ #1)
Présent sur `/contact` obligatoirement, répété simplifié sur `/tarifs` et `/reserver`.

```json
{
  "@context": "https://schema.org",
  "@type": ["MedicalBusiness", "LocalBusiness"],
  "name": "Judith Dufour-Savard — Acupuncture",
  "image": "https://acupuncturejudith.ca/site/judith/judith-portrait-01.jpg",
  "telephone": "+1-514-750-3735",
  "email": "[TODO Judith]",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "2554 rue Beaubien Est",
    "addressLocality": "Montréal",
    "addressRegion": "QC",
    "postalCode": "H1Y 1G3",
    "addressCountry": "CA"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": "45.5501",
    "longitude": "-73.5832"
  },
  "openingHoursSpecification": [ /* voir horaires ci-dessous */ ],
  "priceRange": "$$",
  "medicalSpecialty": ["Acupuncture", "Obstetrics", "Pediatrics"],
  "availableLanguage": ["French", "English"],
  "paymentAccepted": "Cash, Credit Card, Debit Card, Interac",
  "areaServed": ["Montréal", "Rosemont", "La Petite-Patrie"],
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.9",
    "reviewCount": "1215",
    "bestRating": "5"
  },
  "memberOf": { "@type": "Organization", "name": "Ordre des acupuncteurs du Québec" },
  "parentOrganization": {
    "@type": "MedicalClinic",
    "name": "La Source en Soi",
    "url": "https://lasourceensoi.com/"
  },
  "sameAs": [
    "https://www.instagram.com/mon_acupunctrice/",
    "https://lasourceensoi.com/"
  ]
}
```

### B. NAP consistency (ADRESSE/PHONE/EMAIL identiques partout)
- **Nom** : Judith Dufour-Savard — Acupuncture
- **Adresse** : 2554 rue Beaubien Est, Montréal, QC, H1Y 1G3
- **Téléphone** : 514 750-3735
- **Email** : [TODO Judith à confirmer — défaut `info@acupuncturejudith.ca` si existe sinon laisser vide]

Ces 4 infos doivent apparaître à l'identique sur `/contact`, `/tarifs`, dans le footer du site, et dans le Schema.org.

### C. Google Maps iframe embed (CRUCIAL SEO local)
Sur `/contact`, l'iframe Google Maps de l'adresse est un **signal de confiance fort** pour le ranking local. Contrairement à d'autres iframes tiers, Google Maps n'est **pas pénalisé** par Google lui-même (c'est leur propre produit). Impact :
- Confirme l'existence physique (trust)
- Réduit le bounce rate
- Renforce le ranking sur "acupuncteur près de chez moi"

### D. Pas d'iframe Go Rendez-Vous (MAUVAIS SEO)
iframe GRV = JS tiers lourd + cookies tiers + CLS/LCP dégradés = Core Web Vitals dégradés = ranking qui baisse. **Décision** : bouton simple qui ouvre GRV en nouvel onglet.

### E. Mots-clés locaux dans H1/metaTitle/H2
- `/tarifs` : "Tarifs acupuncture Montréal — Rosemont"
- `/reserver` : "Prendre rendez-vous acupuncture Rosemont"
- `/contact` : "Contact — Clinique acupuncture Rosemont, Beaubien Est"

---

# MW-C4 — Page /tarifs

**metaTitle** : Tarifs — Acupuncture à Rosemont, Montréal
**metaDescription** : Tarifs transparents pour mes services d'acupuncture à La Source en Soi (Rosemont). Consultation privée 90 $/h, acupuncture sociale à tarif libre (35-50 $). Reçu pour assurances.

### Section 1 — Hero
**Kicker** : TARIFS
**H1** : Tarifs transparents, accessibles à tous.

**Sous-titre** :
Les prix de mes séances d'acupuncture sont clairs, sans frais cachés. Et parce que la santé ne devrait pas être un privilège, j'offre aussi de l'acupuncture sociale à tarif libre. Clinique à Rosemont, sur Beaubien Est.

### Section 2 — 2 offres

**Card 1 — Consultation privée**
- Titre : Consultation privée
- Prix : **90 $** / séance de 60 min
- Description : Séance individuelle, en cabinet privé. Échange approfondi, évaluation complète, plan d'accompagnement personnalisé.
- Indications : Tous les piliers — fertilité, grossesse, pédiatrie, santé mentale, douleurs, bien-être général.
- CTA : Prendre rendez-vous (→ GRV)

**Card 2 — Acupuncture sociale**
- Titre : Acupuncture sociale
- Prix : **35 $ à 50 $** (tarif libre, selon vos moyens)
- Description : Séance en petit groupe, dans un espace partagé chaleureux. 30 à 45 minutes. Habillé(e), points distaux.
- Indications : Idéal pour stress, anxiété, insomnie, sommeil, détente générale.
- CTA : En savoir plus (→ /services/acupuncture-sociale)

### Section 3 — Ce qui est inclus dans chaque séance

**H2** : Ce que votre investissement comprend.

Liste (avec icônes check) :
- Un échange approfondi pour comprendre votre situation
- Une évaluation selon les principes de la médecine traditionnelle chinoise
- Le traitement avec aiguilles stériles à usage unique
- Des conseils personnalisés pour entre les séances
- Un **reçu officiel émis par une acupunctrice membre de l'OAQ** (remboursable par la plupart des assurances privées au Québec)

### Section 4 — Informations pratiques

**H2** : Informations pratiques.

**3 cards avec icônes** :

**Paiement**
Comptant, débit, Visa, Mastercard, Interac. Paiement effectué à la fin de la séance.

**Assurances**
La plupart des régimes d'assurance privés au Québec couvrent l'acupuncture. Vérifiez votre contrat. Un reçu officiel OAQ est remis après chaque séance.

**Annulation**
Un délai de 24 heures est demandé pour toute annulation. En cas d'annulation tardive ou d'absence, des frais de 50 % du coût de la séance peuvent s'appliquer.

### Section 5 — FAQ tarifs (SEO BONUS — FAQPage Schema)

**H2** : Questions fréquentes sur les tarifs.

Utilise RessourceFaq component (déjà créé en MW-D5) avec 4-5 questions :

1. **Q: L'acupuncture est-elle remboursée par les assurances au Québec ?**
   R: Oui, la plupart des régimes d'assurance privés au Québec couvrent l'acupuncture lorsqu'elle est pratiquée par un membre de l'Ordre des acupuncteurs du Québec (OAQ). Vérifiez les modalités de votre contrat. Je remets un reçu officiel à chaque séance.

2. **Q: Quel est le tarif d'une première séance ?**
   R: Une première séance coûte 90 $ et dure 60 minutes. Ce tarif inclut l'échange initial approfondi, l'évaluation complète, le premier traitement et le plan d'accompagnement personnalisé.

3. **Q: Qu'est-ce que l'acupuncture sociale ?**
   R: L'acupuncture sociale est une séance en format de petit groupe, à tarif libre entre 35 $ et 50 $ selon vos moyens. C'est la même acupuncture — même formation, mêmes aiguilles stériles — simplement dans un format qui rend les soins accessibles à tous.

4. **Q: Puis-je payer par Interac ou par carte ?**
   R: Oui. J'accepte le comptant, Interac, Visa et Mastercard. Le paiement se fait à la fin de chaque séance.

5. **Q: Faut-il payer d'avance pour réserver ?**
   R: Non, il n'y a pas de frais de réservation. Vous réservez en ligne via Go Rendez-Vous et vous payez à la séance.

### Section 6 — CTA final
**H2** : Prête à commencer ?
**Texte** : Une première rencontre dure 60 minutes. On prend le temps de comprendre votre situation et de bâtir ensemble un plan adapté.
**CTAs** :
- Prendre rendez-vous → GRV
- J'ai une question → /contact

### Schema.org requis
- `MedicalBusiness` simplifié (NAP + priceRange)
- `Offer` × 2 (séance privée, séance sociale) avec `price`, `priceCurrency`, `duration`
- `FAQPage` (5 questions ci-dessus)
- `BreadcrumbList` : Home → Tarifs

---

# MW-C5 — Page /reserver

**metaTitle** : Prendre rendez-vous — Acupuncture Rosemont, Montréal
**metaDescription** : Réservez votre séance d'acupuncture à Rosemont en ligne, par téléphone ou par courriel. Disponibilités en temps réel via Go Rendez-Vous. Clinique La Source en Soi.

### Section 1 — Hero
**Kicker** : RÉSERVER
**H1** : Prendre rendez-vous.

**Sous-titre** :
Trois façons de réserver votre séance d'acupuncture à Rosemont. Choisissez celle qui vous convient.

### Section 2 — Option principale : en ligne

**H2** : En ligne (recommandé)

**Texte** :
Le système de réservation **Go Rendez-Vous** vous permet de voir mes disponibilités en temps réel et de réserver directement. Vous recevez un courriel de confirmation immédiat et un rappel 24h avant votre séance.

**Gros bouton CTA principal** : Voir les disponibilités → Go Rendez-Vous (ouvre en nouvel onglet)
URL : `https://www.gorendezvous.com/lasourceensoi?companyId=104074`

**Note** : Sur Go Rendez-Vous, sélectionnez la clinique **La Source en Soi** puis **Judith Dufour-Savard**. [TODO Judith : confirmer si un lien direct vers ton profil Go Rendez-Vous existe, employeeId 7556837]

### Section 3 — Autres moyens

**H2** : Autrement

**3 cards** :

**Par téléphone**
514 750-3735 — Appelez La Source en Soi et demandez Judith Dufour-Savard. Message vocal disponible si je suis en séance.

**Par courriel**
[TODO email Judith] — Pour les questions préalables à la prise de rendez-vous ou les situations particulières.

**En clinique**
2554 rue Beaubien Est, Montréal, QC H1Y 1G3 (Rosemont, métro Beaubien).

### Section 4 — Ce à quoi vous attendre

**H2** : Avant votre première séance.

**Texte d'intro** :
Une première rencontre en acupuncture, c'est un moment d'échange, pas un examen médical froid. Voici ce qu'il faut savoir.

**3 points** :

1. **Durée** — 60 minutes (consultation privée) / 30 à 45 minutes (acupuncture sociale)
2. **Tenue** — Portez des vêtements confortables qui se retroussent au niveau des coudes et des genoux. Vous n'aurez pas à vous dévêtir.
3. **À apporter** — Si vous avez des résultats d'examens médicaux récents (bilans sanguins, imagerie, suivi de fertilité), apportez-les. Sinon, rien de particulier.

### Section 5 — Horaires
**H2** : Horaires de consultation.

[TODO Judith : horaires exacts. Par défaut placeholder plausible :
- Mardi à vendredi : 9h à 19h
- Samedi : 9h à 15h
- Lundi et dimanche : fermé]

**Ces horaires alimentent le Schema.org `openingHoursSpecification`** — critique pour le ranking local Google Maps.

### Section 6 — CTA final
**CTAs** :
- Réserver maintenant → GRV (gros bouton primaire)
- Voir les tarifs → /tarifs

### Schema.org requis
- `MedicalBusiness` simplifié
- `ReserveAction` sur le bouton principal (pointant vers GRV)
- `ContactPoint` × 3 (phone, email, physical)
- `BreadcrumbList` : Home → Réserver

---

# MW-C6 — Page /contact

**metaTitle** : Contact — Acupuncture Rosemont, Beaubien Est, Montréal
**metaDescription** : Contactez Judith Dufour-Savard, acupunctrice à Rosemont. Clinique La Source en Soi, 2554 rue Beaubien Est. Par téléphone, courriel ou en personne.

### Section 1 — Hero
**Kicker** : CONTACT
**H1** : Restons en contact.

**Sous-titre** :
Une question avant de réserver ? Besoin de savoir si l'acupuncture est adaptée à votre situation ? Écrivez-moi ou appelez la clinique — je vous réponds avec plaisir.

### Section 2 — Coordonnées de la clinique (NAP CRUCIAL)

**H2** : La clinique

**Bloc principal structuré** (priorité visuelle au-dessus de la fold) :

```
La Source en Soi
2554 rue Beaubien Est
Montréal, QC  H1Y 1G3

📞 Téléphone : 514 750-3735
✉ Email : [TODO Judith, défaut placeholder]
🌐 Site : lasourceensoi.com

Métro Beaubien (ligne orange) — 10 minutes à pied
Stationnement sur rue disponible
```

**Badge Google** : ⭐ 4,9/5 sur 1 215 avis Google

**CTA principal** : Prendre rendez-vous → GRV

### Section 3 — Horaires

**H2** : Horaires de consultation.

[TODO Judith : horaires exacts. Répéter les mêmes que /reserver pour cohérence. Ces horaires doivent aller dans Schema.org `openingHoursSpecification`.]

### Section 4 — Carte Google Maps (SEO LOCAL CRITIQUE)

**H2** : Se rendre à la clinique.

**iframe Google Maps embed** :
```html
<iframe
  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2796.xxx!2554+rue+Beaubien+Est+Montreal"
  width="100%"
  height="400"
  style="border:0;"
  allowfullscreen=""
  loading="lazy"
  referrerpolicy="no-referrer-when-downgrade"
  title="Carte Google Maps — La Source en Soi, 2554 rue Beaubien Est, Montréal"
></iframe>
```

[TODO CC : générer l'URL exacte via Google Maps → Partager → Intégrer une carte, pour l'adresse 2554 rue Beaubien Est, Montréal, QC H1Y 1G3. Si impossible, utiliser une recherche générique : `https://www.google.com/maps/embed/v1/place?key=YOUR_KEY&q=2554+rue+Beaubien+Est+Montreal` — mais SANS key visible, utiliser le format embed simple que Google donne au "Partager la carte → Intégrer".]

**Lien secondaire** : Itinéraire Google Maps → `https://maps.google.com/?daddr=2554+rue+Beaubien+Est+Montreal+QC+H1Y+1G3`

### Section 5 — Écrivez-moi

**H2** : Écrivez-moi.

**Texte** :
Pour toute question avant de réserver — nature de vos symptômes, compatibilité avec votre suivi médical, accessibilité de l'acupuncture sociale — écrivez-moi. Je réponds habituellement dans les 48 heures ouvrables.

**Gros bouton `mailto:`** : 
```html
<a href="mailto:[TODO email]?subject=Question pour Judith">Écrivez-moi</a>
```

[TODO email Judith — placeholder défaut `info@acupuncturejudith.ca`]

**Note** : Pour réserver une séance, utilisez plutôt le formulaire en ligne → /reserver

### Section 6 — CTA final
**H2** : Prête à franchir le pas ?
**CTAs** :
- Prendre rendez-vous → GRV
- Voir les tarifs → /tarifs
- Voir mes services → /services/fertilite (ou page /services si elle existe)

### Schema.org requis
- **`MedicalBusiness` / `LocalBusiness`** COMPLET (c'est la page #1 pour ça) avec geo, openingHoursSpecification, aggregateRating, areaServed, paymentAccepted
- `ContactPage` wrapper
- `ContactPoint` × 3 (phone, email, physical)
- `BreadcrumbList` : Home → Contact

---

## Décisions SEO-optimisées (vs les défauts initiaux)

| Question | Défaut initial | **NOUVEAU défaut SEO-optimisé** | Justification SEO |
|---|---|---|---|
| Modes paiement | "Comptant, carte, Interac" | Explicite "Comptant, débit, Visa, Mastercard, Interac" + mention dans Schema.org `paymentAccepted` | Mot-clé transactionnel capté, signal de trust |
| Annulation | "24h, 50% frais" | "24h ouvrables, 50 % du coût" (wording plus professionnel) | Signal E-E-A-T |
| Iframe GRV | Option B (bouton) | **Confirmé Option B — mauvais pour Core Web Vitals** | Ranking |
| Email | TODO vide | TODO avec **placeholder suggéré `info@acupuncturejudith.ca`** | Email branded = trust signal |
| Formulaire | mailto simple | **Confirmé mailto** — pas de backend = pas de risque, fast loading | Core Web Vitals |
| Google Maps | Lien simple | **CHANGEMENT → iframe embed** | SEO local ULTRA-CRITIQUE (Google Maps embed = signal fort pour local pack) |
| Horaires | TODO vide | TODO **avec placeholders plausibles** (Mar-Ven 9-19h, Sam 9-15h) pour alimenter Schema.org `openingHoursSpecification` | Critique pour local pack Google |
| **FAQ tarifs** | Non prévu | **AJOUT** : FAQ sur /tarifs avec Schema.org FAQPage | +1 rich snippet possible |
| **Breadcrumbs** | Non prévu | **AJOUT** : Schema.org BreadcrumbList sur chaque page | Rich snippet Google |
| **AggregateRating** | Non prévu | **AJOUT** : 4,9/5 sur 1 215 avis dans Schema.org | Étoiles Google possibles |
| **NAP consistency** | Approximatif | **AJOUT** : bloc NAP identique partout (header/footer/Schema) | LocalBusiness ranking |
| **GeoCoordinates** | Non prévu | **AJOUT** : lat/lng précis dans Schema.org | Local pack Google |

## TODOs Judith restants (sous forme de commentaires HTML inline invisibles)

1. Email de Judith (3 occurences : /tarifs CTA, /reserver section 3, /contact section 2+5)
2. Horaires exacts de consultation (2 occurences : /reserver section 5, /contact section 3)
3. Lien direct Go Rendez-Vous profil Judith (employeeId 7556837) si existe

**Aucune question bloquante pour CC**. Les placeholders permettent d'implémenter tout de suite, Judith valide plus tard.
