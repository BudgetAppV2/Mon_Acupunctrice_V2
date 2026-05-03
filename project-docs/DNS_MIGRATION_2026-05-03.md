# DNS Migration Wix → Vercel — 3 mai 2026

Document de backup et de plan pour le switch DNS du domaine principal `acupuncturejudith.ca`.

## Contexte

Le 3 mai 2026, jour de launch officiel du nouveau site Next.js sur Vercel.
Stratégie : on garde les domaines chez Wix (registrar), on change uniquement les enregistrements DNS pour pointer vers Vercel.

Les 3 autres domaines (judithdufoursavardacu.com, grossesseacupuncture.ca, mon-acupunctrice.ca) continuent de rediriger en 301 vers acupuncturejudith.ca via Wix — ils suivent automatiquement.

Plan de transfert vers un autre registrar (Porkbun ou Webnames.ca) prévu d'ici juillet 2026 (avant renouvellement judithdufoursavardacu.com le 8 juillet).

## État DNS AVANT migration (Wix actif)

### A (Hôte)

| Nom de l'hébergeur | Valeur | TTL |
|---|---|---|
| acupuncturejudith.ca | 185.230.63.171 | 1 heure |
| acupuncturejudith.ca | 185.230.63.186 | 1 heure |
| acupuncturejudith.ca | 185.230.63.107 | 1 heure |

### CNAME (Alias)

| Nom de l'hébergeur | Valeur | TTL |
|---|---|---|
| fr.acupuncturejudith.ca | cdn1.wixdns.net | 1 heure |
| www.acupuncturejudith.ca | cdn1.wixdns.net | 1 heure |

### TXT (Texte)
Vide.

### SRV
Vide.

### MX (Échangeur d'e-mail)
Pas de messagerie professionnelle configurée.

### NS (Serveurs de noms) — non modifiables

| Nom de l'hébergeur | Valeur | TTL |
|---|---|---|
| acupuncturejudith.ca | ns8.wixdns.net | 1 jour |
| acupuncturejudith.ca | ns9.wixdns.net | 1 jour |

## État DNS APRÈS migration (Vercel)

### A (Hôte) — REMPLACER

| Nom de l'hébergeur | Valeur | TTL |
|---|---|---|
| acupuncturejudith.ca | **216.198.79.1** | 1 heure |

(Les 3 anciens records vers 185.230.63.x sont supprimés.)

### CNAME (Alias) — MODIFIER www, LAISSER fr

| Nom de l'hébergeur | Valeur | TTL |
|---|---|---|
| fr.acupuncturejudith.ca | cdn1.wixdns.net | 1 heure |
| www.acupuncturejudith.ca | **3ceb1ab32ff342d3.vercel-dns-017.com** | 1 heure |

(`fr.` reste pointé vers Wix — on ne s'en sert pas activement, mais ça ne casse rien si on laisse.)

### TXT, SRV, MX, NS
Inchangés.

## Configuration Vercel correspondante

Project: `mon-acupunctrice-v2`
Team: Default

### Domaine 1 : acupuncturejudith.ca (apex)
- Type : Redirect to Another Domain
- Statut HTTP : 308 Permanent Redirect
- Cible : www.acupuncturejudith.ca
- DNS attendu : A @ → 216.198.79.1

### Domaine 2 : www.acupuncturejudith.ca
- Type : Connect to an environment
- Environnement : Production
- DNS attendu : CNAME www → 3ceb1ab32ff342d3.vercel-dns-017.com

## Comment vérifier la propagation DNS

Une fois les enregistrements modifiés chez Wix, attendre 5 min à 1h pour la propagation.

```bash
# Vérifier que acupuncturejudith.ca pointe vers Vercel (216.198.79.1)
dig +short acupuncturejudith.ca A

# Vérifier que www.acupuncturejudith.ca résoud vers le CNAME Vercel
dig +short www.acupuncturejudith.ca CNAME

# Test HTTP en bout de chaîne (vérifier le 308 + 200)
curl -sI -L --max-redirs 5 https://acupuncturejudith.ca | grep -E "^HTTP|^[Ll]ocation"
```

Résultats attendus après propagation complète :
- A `acupuncturejudith.ca` → `216.198.79.1`
- CNAME `www.acupuncturejudith.ca` → `3ceb1ab32ff342d3.vercel-dns-017.com.` (ou alors il résoud vers une IP Vercel directement selon la config DNS)
- HTTP `https://acupuncturejudith.ca` → 308 → `https://www.acupuncturejudith.ca/` → 200

## Plan de revert (si problème grave)

Si après le switch quelque chose tourne mal et qu'il faut revenir au site Wix :

### Dans Wix → Mes domaines → acupuncturejudith.ca → Avancé → DNS

1. Supprimer le record A `acupuncturejudith.ca` → 216.198.79.1
2. Recréer les 3 records A originaux :
   - acupuncturejudith.ca → 185.230.63.171
   - acupuncturejudith.ca → 185.230.63.186
   - acupuncturejudith.ca → 185.230.63.107
3. Modifier le CNAME `www.acupuncturejudith.ca` :
   - Avant (Vercel) : 3ceb1ab32ff342d3.vercel-dns-017.com
   - Après (revert Wix) : cdn1.wixdns.net

La propagation du revert prend également 5 min à 1h.

## Notes importantes

- **Wix Premium reste actif** pendant la transition pour pouvoir revert si besoin. À canceller seulement quand on est confiant que le site Vercel tourne bien (1-2 semaines après le launch).
- **Les 3 domaines de redirection** (judithdufoursavardacu.com, grossesseacupuncture.ca, mon-acupunctrice.ca) continuent de rediriger via Wix — pas de modification DNS nécessaire pour eux aujourd'hui.
- **Le sous-domaine `fr.acupuncturejudith.ca`** n'est pas utilisé activement mais reste pointé vers Wix par sécurité. On le supprimera lors du transfert de registrar.
- **Renouvellement Wix de judithdufoursavardacu.com** : 8 juillet 2026. Domaines à transférer vers Porkbun ou Webnames.ca AVANT cette date pour éviter de payer Wix.
