# Mission CC : Ajouter Éden Yoga Pilates comme deuxième clinique

## ⚠️ Contexte de branche
Tu es sur `feature/site-public-migration`. Le Hub est LIVE sur `main`.
Les modifications touchent le site public (pas encore live) ET le fichier rdvUrl.ts (Hub live).
Fais un commit cherry-pickable pour rdvUrl.ts si nécessaire.

## Contexte

Judith pratique maintenant à DEUX cliniques :

| | La Source en Soi | Éden Yoga Pilates |
|---|---|---|
| Adresse | 2554 Beaubien E, Montréal, QC H1Y 1G3 | 121 Boul. Industriel #225, Repentigny, QC |
| Horaire Judith | Lun-Mar-Jeu-Ven | Mercredi 9h-15h (dernier patient 14h) |
| Services | Acupuncture classique + sociale | Acupuncture classique (PAS de sociale) |
| GRV companyId | 104074 | 141296 |
| GRV eids | 175708 | 192390 |
| GRV stype | — | Acupuncture |
| GRV URL | https://www.gorendezvous.com/lasourceensoi?companyId=104074&eids=175708 | https://www.gorendezvous.com/edenyogapilates?companyId=141296&eids=192390&stype=Acupuncture |
| Site partenaire | lasourceensoi.com | edenyogapilates.ca |

## Ce qu'il faut faire

### 1. Mettre à jour lib/utils/rdvUrl.ts

Ajouter la deuxième URL de réservation. Le fichier doit exporter DEUX fonctions ou accepter un paramètre `clinic` :

```typescript
type Clinic = 'lssi' | 'eden';

export function getRdvUrl(options?: { source?: string; clinic?: Clinic }): string {
  const clinic = options?.clinic || 'lssi';
  // ... base URL selon la clinique
  // LSSI: https://www.gorendezvous.com/lasourceensoi?companyId=104074&eids=175708
  // Eden: https://www.gorendezvous.com/edenyogapilates?companyId=141296&eids=192390&stype=Acupuncture
  // ... UTM params selon source
}
```

Exporter aussi les constantes utiles :
```typescript
export const CLINICS = {
  lssi: {
    name: 'La Source en Soi',
    shortName: 'Rosemont',
    address: '2554 Rue Beaubien E, Montréal, QC H1Y 1G3',
    phone: '(514) 750-3735',
    grvUrl: '...',
  },
  eden: {
    name: 'Éden Yoga Pilates',
    shortName: 'Repentigny',
    address: '121 Boul. Industriel #225, Repentigny, QC',
    phone: '', // à confirmer
    grvUrl: '...',
  }
};
```

### 2. Refaire la page /reserver (app/(public)/reserver/page.tsx)

La page doit présenter les DEUX cliniques côte à côte.

Design : deux cartes (responsive — côte à côte sur desktop, empilées sur mobile).

Chaque carte contient :
- Nom de la clinique
- Adresse
- Jours de disponibilité de Judith
- Services offerts (mention "Acupuncture sociale disponible" pour LSSI seulement)
- Bouton CTA "Réserver à [Rosemont / Repentigny]" pointant vers le bon GRV

Garder le Schema.org (MedicalBusiness + ReserveAction) mais avec 2 locations.

Les autres modes de contact (téléphone, courriel) restent en dessous des deux cartes.

### 3. Mettre à jour la page /contact (app/(public)/contact/page.tsx)

Ajouter la deuxième adresse. Même principe : deux cartes/sections.

Pour LSSI, garder le Google Maps iframe existant.
Pour Eden, ajouter un deuxième iframe Google Maps (chercher "Éden Yoga Pilates Repentigny" ou utiliser les coordonnées).

Mettre à jour le Schema.org avec 2 locations.

### 4. Mettre à jour les pages services

Dans chaque page service (fertilité, grossesse, pédiatrie), ajouter une mention :
"Disponible à Rosemont (La Source en Soi) et à Repentigny (Éden Yoga Pilates)"

Pour la page acupuncture sociale, ajouter :
"Disponible uniquement à Rosemont (La Source en Soi)"

### 5. Mettre à jour le footer (SiteFooter.tsx)

Ajouter la mention des deux adresses si applicable.

### 6. Schema.org global

Dans le layout.tsx ou les pages concernées, le Schema.org MedicalBusiness doit avoir :
```json
{
  "@type": "MedicalBusiness",
  "name": "Judith Dufour-Savard — Acupunctrice",
  "location": [
    {
      "@type": "Place",
      "name": "La Source en Soi",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "2554 Rue Beaubien E",
        "addressLocality": "Montréal",
        "addressRegion": "QC",
        "postalCode": "H1Y 1G3",
        "addressCountry": "CA"
      }
    },
    {
      "@type": "Place",
      "name": "Éden Yoga Pilates",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "121 Boul. Industriel #225",
        "addressLocality": "Repentigny",
        "addressRegion": "QC",
        "addressCountry": "CA"
      }
    }
  ]
}
```

### 7. Vérifications

- [ ] Les CTA "Réserver" partout sur le site (10+ occurrences dans les pages services) devraient pointer vers la page /reserver (pas directement vers GRV) pour que les visiteurs choisissent la clinique
- [ ] OU garder le lien GRV LSSI par défaut et ajouter une mention "Aussi disponible à Repentigny" avec lien vers /reserver
- [ ] Build : npm run build → 76+ pages OK
- [ ] Commit descriptif

### Recommandation pour les CTA existants

Les 18+ CTA "Réserver" sur le site pointent actuellement vers le GRV LSSI direct. 
Option A : Les laisser pointer vers LSSI et ajouter un petit lien "Aussi à Repentigny" 
Option B : Les faire pointer vers /reserver pour que le visiteur choisisse

Recommandation : Option A (moins intrusif, la majorité des patients sont à Rosemont).
Ajouter dans le CtaButton ou en dessous un petit texte discret :
"Aussi disponible à Repentigny le mercredi → Réserver"

