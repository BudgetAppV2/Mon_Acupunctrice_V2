# Milestone MW-G2 : Switch DNS Wix → Vercel + lancement

**Type** : Launch
**Vague** : 7
**Priorité** : Critical
**Temps estimé Claude Code** : 1-2h + monitoring 2-4 semaines
**Dépendances** : MW-G1
**Status** : 🔴 Not started

---

## Objectif

Basculer `acupuncturejudith.ca` de Wix vers Vercel en modifiant les records DNS dans le dashboard Wix, soumettre le sitemap à Google Search Console, mettre à jour les profils externes, et monitorer les 2-4 premières semaines post-lancement.

---

## Contexte minimal

Le site est prêt en staging, le pré-flight (MW-G1) est passé. Le DNS est hébergé chez Wix (nameservers `ns8.wixdns.net`). Le bouton "Transférer Domaine" chez Wix est destructif (coupe le site immédiatement) — on modifie uniquement les records DNS dans le dashboard Wix pour pointer vers Vercel, sans transfert de registrar.

---

## Livrables

- [ ] **CHECKLIST.md** (au lieu de PROMPT.md) — procédure step-by-step du switch, avec rollback documenté
- [ ] **Switch DNS effectué** — `acupuncturejudith.ca` pointe vers Vercel
- [ ] **Sitemap soumis** à Google Search Console
- [ ] **Profils externes mis à jour** — backlink La Source en Soi, Ordre des acupuncteurs, Lumino, réseaux sociaux
- [ ] **Document de monitoring** — KPIs à suivre pendant 2-4 semaines

---

## Approche technique

Ce milestone est **majoritairement manuel** — pas de PROMPT.md pour Claude Code, mais un CHECKLIST.md détaillé que Benoit exécute.

### CHECKLIST de switch (à créer dans le dossier du milestone)

**Pré-switch (J-1)**
- [ ] Vérifier que MW-G1 est passé (rapport pré-flight clean)
- [ ] Configurer le domaine `acupuncturejudith.ca` dans le projet Vercel (dashboard → Settings → Domains)
- [ ] Noter les records DNS actuels chez Wix (avant modification, pour rollback)
- [ ] Préparer les records Vercel à configurer :
  - `A` record pointant vers l'IP Vercel (`76.76.21.21`)
  - `CNAME` record pour `www` pointant vers `cname.vercel-dns.com`
- [ ] Vérifier que le SSL sera automatique (Vercel gère Let's Encrypt)
- [ ] Préparer le sitemap (`/sitemap.xml`) à soumettre
- [ ] Préparer le compte Google Search Console (avec la propriété du domaine si pas encore fait)

**Switch DNS (Jour J)**
- [ ] Modifier les records DNS dans le dashboard Wix (NE PAS utiliser "Transférer Domaine")
- [ ] Attendre la propagation DNS (2-48h, typiquement 1-4h)
- [ ] Vérifier : `acupuncturejudith.ca` affiche le site Vercel (pas Wix)
- [ ] Vérifier : SSL fonctionne (cadenas vert, pas d'erreur certificat)
- [ ] Vérifier : les redirections 301 des anciennes URLs Wix fonctionnent
- [ ] Soumettre le sitemap à Google Search Console
- [ ] Demander le re-crawl des pages principales via Google Search Console (URL Inspection → Request Indexing)

**Post-switch (J+1 à J+3)**
- [ ] Vérifier que le site Wix est toujours accessible à une URL différente (Wix fournit une URL `.wixsite.com` de fallback)
- [ ] NE PAS supprimer le site Wix — le garder en backup pendant 2-4 semaines
- [ ] Contacter la direction de La Source en Soi pour mettre à jour le backlink vers la nouvelle URL (si différente)
- [ ] Mettre à jour le lien dans : Ordre des acupuncteurs, Lumino Health, Facebook, LinkedIn, Instagram bio
- [ ] Vérifier Google Search Console pour les erreurs de crawl
- [ ] Vérifier Plausible pour les premières visites

**Monitoring post-lancement (Semaines 1-4)**
- [ ] Chaque jour : vérifier les erreurs 404 dans Google Search Console
- [ ] Chaque jour : vérifier le trafic dans Plausible
- [ ] Semaine 1 : vérifier les positions sur 5 mots-clés cibles (acupuncture Rosemont, fertilité, grossesse, tarif solidaire, pédiatrique)
- [ ] Semaine 2 : premier rapport de positions vs baseline
- [ ] Semaine 4 : rapport complet avec comparaison avant/après

**Rollback** (si problème critique)
- [ ] Remettre les anciens records DNS chez Wix (notés en pré-switch)
- [ ] Attendre la propagation (1-4h)
- [ ] Le site Wix redevient actif
- [ ] Documenter le problème dans NOTES.md
- [ ] Corriger et retenter

### KPIs de monitoring post-lancement (plan §9.4)

| KPI | Source | Cible semaine 4 |
|-----|--------|-----------------|
| Sessions organiques / semaine | Plausible | > baseline Wix |
| Pages vues / session | Plausible | > 2 |
| Taux de rebond | Plausible | < 60% |
| Clics CTA "Réserver" / semaine | Plausible events | > 0 (tracking fonctionnel) |
| Clics Go Rendez-Vous / semaine | Plausible events | > 0 |
| Erreurs crawl GSC | Google Search Console | 0 |
| Pages indexées | Google Search Console | ≥ 20 |
| Positions mots-clés top 10 | Google/Ubersuggest | ≥ 3 mots-clés |

---

## Fichiers impactés

```
📄 NEW (dans le dossier du milestone) :
- MW-G2_switch-dns-lancement/CHECKLIST.md (procédure complète)
- MW-G2_switch-dns-lancement/artefacts/monitoring-post-launch.md (template de rapport)
- MW-G2_switch-dns-lancement/artefacts/dns-records-backup.md (records avant switch)
```

---

## Definition of Done

- [ ] `acupuncturejudith.ca` affiche le site Vercel avec SSL valide
- [ ] Sitemap soumis à Google Search Console
- [ ] Les redirections 301 fonctionnent pour les anciennes URLs Wix
- [ ] Le backlink La Source en Soi est mis à jour ou la redirection 301 le préserve
- [ ] Au moins 3 profils externes mis à jour (Ordre, Facebook, Instagram)
- [ ] Plausible reçoit des données de trafic
- [ ] Le site Wix est préservé en backup (non supprimé)
- [ ] Rapport de monitoring semaine 1 produit
- [ ] Fichier `NOTES.md` créé avec le journal d'exécution
- [ ] Review par Benoit (pas de merge automatique)

---

## Critères de validation du livrable

- **Site live** : `acupuncturejudith.ca` charge en < 3s sur mobile
- **SSL** : certificat valide, pas d'erreur mixed content
- **SEO** : sitemap soumis, re-crawl demandé, pas d'erreurs 404 nouvelles
- **Tracking** : Plausible fonctionnel avec les premiers events

---

## Contraintes

- NE PAS utiliser le bouton "Transférer Domaine" de Wix — il coupe le site immédiatement
- NE PAS supprimer le site Wix pendant au moins 4 semaines — backup en cas de problème
- Le switch DNS doit être fait à un moment calme (pas un vendredi soir, pas pendant un pic de trafic si identifié)
- Avoir un plan de rollback documenté et testé avant de commencer
- La mise à jour du backlink La Source en Soi nécessite la coopération de la direction (plan d'action MW-A4)

---

## Références

- CLAUDE.md migration — section "DNS reste chez Wix pour l'instant"
- Plan stratégique §9 (Mission 9 — Lancement & DNS switch)
- Plan stratégique §9.4 (KPIs à tracker)
- MW-G1 (pré-flight — prérequis)
- MW-A4 (plan d'action clinique — pour la mise à jour du backlink)
- MW-A1 (matrice de redirections 301 — pour vérification)

---

## Notes de planification

- Ce milestone n'a PAS de PROMPT.md — c'est un CHECKLIST.md que Benoit exécute manuellement avec l'aide de Claude si nécessaire.
- Le timing du switch est important : éviter les périodes où Judith a beaucoup de patientes (moins de stress si quelque chose ne marche pas). Un mardi ou mercredi matin est idéal.
- La propagation DNS peut prendre 2-48h. Pendant ce temps, certains visiteurs verront le Wix et d'autres le Vercel. C'est normal et inévitable.
- Le transfert de registrar (Wix → Cloudflare) est optionnel et post-lancement. Pour le switch, modifier les records DNS chez Wix suffit.
- Point à valider avec Benoit : est-ce que Google Search Console est déjà configuré avec la propriété `acupuncturejudith.ca` ? Sinon, il faut le faire en avance (vérification DNS).
