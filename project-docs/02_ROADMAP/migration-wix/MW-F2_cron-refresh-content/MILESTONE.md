# Milestone MW-F2 : Cron `/api/cron/refresh-content` + revalidation ISR

**Type** : Automation
**Vague** : 6
**Priorité** : High
**Temps estimé Claude Code** : 2-3h
**Dépendances** : MW-E1, MW-E2
**Status** : 🔴 Not started

---

## Objectif

Créer un cron Vercel quotidien qui revalide les pages ISR du site public et, optionnellement, génère de nouvelles FAQ/ressources en `draft` via l'API Claude pour garder le contenu frais.

---

## Contexte minimal

L'amendement A2 prévoit un cron `/api/cron/refresh-content` qui maintient la fraîcheur du contenu SEO. Il a deux rôles : (1) revalider les pages ISR pour que les modifications faites via l'admin Hub apparaissent sur le site public, et (2) générer du nouveau contenu programmatiquement pour enrichir le silo SEO. Le plan Hobby supporte 100 crons, 1×/jour max chacun.

---

## Livrables

- [ ] **Route API `app/api/cron/refresh-content/route.ts`** — cron quotidien avec vérification CRON_SECRET
- [ ] **Revalidation ISR** — appel à `revalidatePath` ou `revalidateTag` pour les pages publiques qui ont du contenu dynamique
- [ ] **Génération optionnelle de contenu** (phase 2) — appel à l'API Claude pour générer N nouvelles FAQ en `draft`, stockées dans Firestore pour review par Judith
- [ ] **Configuration cron dans `vercel.json`** — ajout du nouveau cron à la liste existante

---

## Approche technique

**Route API** (`app/api/cron/refresh-content/route.ts`) :

```typescript
export async function GET(request: Request) {
  // Vérification CRON_SECRET (pattern existant dans le repo)
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Phase 1 : Revalidation ISR
  revalidatePath('/blog');
  revalidatePath('/faq');
  revalidatePath('/ressources');
  revalidatePath('/'); // homepage (RecentPosts)
  // + pages individuelles si nécessaire via revalidateTag

  // Phase 2 (optionnel au lancement) : Génération de contenu
  // - Lire siteConfig/contentRefresh pour la dernière exécution
  // - Appeler Claude API pour générer 1-3 nouvelles FAQ
  // - Écrire en status: 'draft' dans Firestore
  // - Mettre à jour siteConfig/contentRefresh

  return Response.json({ revalidated: true, timestamp: new Date().toISOString() });
}
```

**Revalidation ISR** :
- `revalidatePath('/blog')` : revalide la liste des articles
- `revalidatePath('/faq')` : revalide la vue d'ensemble FAQ
- `revalidatePath('/faq/fertilite')`, etc. : revalide chaque catégorie FAQ
- `revalidatePath('/ressources')` : revalide la liste des ressources
- `revalidatePath('/')` : revalide la homepage (RecentPosts)
- Alternative : utiliser `revalidateTag` avec des tags par collection pour un ciblage plus fin

**Génération de contenu** (phase 2, optionnel au lancement) :
- Lire `siteConfig/contentRefresh` pour savoir quand et combien de contenu a été produit
- Appeler l'API Claude (via la Cloud Function `generateCaption` existante ou un nouvel endpoint) avec un prompt spécialisé FAQ
- Injecter le guide de ton (MW-A3) dans le prompt système
- Écrire les FAQ générées en `status: 'draft'` dans Firestore
- Judith les review via la vue review (MW-E4)

**Configuration vercel.json** :
```json
{
  "path": "/api/cron/refresh-content",
  "schedule": "0 14 * * *"
}
```
(14h UTC = 10h Montréal, après le cron fetch-insights à 10h UTC)

---

## Fichiers impactés

```
📄 NEW (fichiers à créer) :
- app/api/cron/refresh-content/route.ts

✏️ MODIFY (fichiers existants) :
- vercel.json (ajout du nouveau cron)
```

---

## Definition of Done

- [ ] `npm run build` passe sans erreur
- [ ] Le cron vérifie `CRON_SECRET` et rejette les requêtes non autorisées
- [ ] La revalidation ISR fonctionne — modifier une FAQ dans Firestore via l'admin, lancer le cron, vérifier que la page publique est mise à jour
- [ ] Le cron est configuré dans `vercel.json` avec un schedule valide (1×/jour)
- [ ] Pas de conflit avec les crons existants (`publish` à 12h UTC, `fetch-insights` à 10h UTC)
- [ ] Fichier `NOTES.md` créé avec le journal d'exécution
- [ ] Review par Benoit sur la branche (pas de merge automatique)

---

## Tests requis

- **Integration** : appeler la route en local avec le bon CRON_SECRET → vérifier que la réponse est 200
- **Revalidation** : modifier une FAQ dans Firestore → appeler le cron → vérifier que la page `/faq/[category]` reflète le changement
- **Auth** : appeler sans CRON_SECRET → vérifier le 401

---

## Contraintes

- Le cron doit respecter les contraintes du plan Hobby : 1×/jour max, timing imprécis
- Ne pas modifier les crons existants (`publish` et `fetch-insights`)
- La génération de contenu Claude est OPTIONNELLE au lancement — le cron peut se limiter à la revalidation ISR pour le MVP
- Le CRON_SECRET doit être dans les variables d'environnement Vercel (déjà utilisé par les autres crons)
- Ne pas laisser de console.log en production

---

## Références

- Amendement A2 (cron refresh-content)
- CLAUDE.md racine — section "Crons Vercel" (pattern et contraintes Hobby)
- `vercel.json` existant (2 crons déjà configurés)
- `app/api/cron/publish/route.ts` et `app/api/cron/fetch-insights/route.ts` (patterns existants à réutiliser)
- Plan stratégique §4.5 (crons Vercel — plan Hobby conservé)

---

## Notes de planification

- La phase 2 (génération Claude) est ambitieuse et peut être reportée à post-MVP. Le cron de revalidation ISR seul est déjà très utile et simple à implémenter.
- Le `revalidatePath` revalide une page entière. Pour un contrôle plus fin (revalider uniquement les pages qui ont changé), on pourrait utiliser `revalidateTag` avec des tags par collection. Au volume actuel, revalider toutes les pages est acceptable.
- Le cron `refresh-content` à 14h UTC (10h Montréal) laisse 2h entre `fetch-insights` (10h UTC) et lui-même. Le `publish` est à 12h UTC — pas de chevauchement.
- Point à valider avec Benoit : est-ce que la génération Claude doit utiliser le proxy existant `app/api/generate-caption/route.ts` ou un nouvel endpoint dédié ?


---

## Décisions 14 avril 2026 (post-reverse-planning)

**Q16 — Génération automatique Claude au lancement ou juste revalidation ISR ?** → **Juste revalidation ISR au lancement**. Pas de génération automatique de contenu en MVP.

**Scope resserré du cron `/api/cron/refresh-content`** :

```typescript
// /api/cron/refresh-content/route.ts
export async function GET() {
  // 1. Revalider les paths du site public pour rafraîchir le cache ISR
  revalidatePath('/', 'layout')      // homepage + toutes les pages publiques
  revalidatePath('/blog')
  revalidatePath('/blog/[slug]', 'page')
  revalidatePath('/faq')
  revalidatePath('/ressources')

  // 2. Regénérer le sitemap dynamique si nouveaux contenus
  // (sitemap.ts déjà auto-généré par Next, mais on peut forcer)

  // 3. Log dans siteConfig/contentRefresh
  await db.collection('siteConfig').doc('contentRefresh').set({
    lastRun: FieldValue.serverTimestamp(),
    paths: [...]
  })

  return Response.json({ ok: true })
}
```

**Schedule** : `0 6 * * *` (6h du matin Montréal, avant que Judith consulte)

**Ce qu'on ne fait PAS au lancement** :
- ❌ Pas d'appel à l'API Claude pour générer du contenu
- ❌ Pas de création automatique de drafts
- ❌ Pas de notifications Slack/email

Ces fonctionnalités restent documentées dans **MW-H3 (post-MVP Phase 6)** comme extension naturelle de ce cron. Raison : lancer un générateur Claude non surveillé en prod = risque de contenu médiocre publié. On fait la génération via l'admin Hub (MW-E1/E2) au lancement avec review Judith manuelle.

**Référence** : `docs/migration-wix/DECISIONS_Q1-Q16.md` Q16
