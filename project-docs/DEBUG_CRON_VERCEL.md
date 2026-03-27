# Problème : Cron Vercel ne s'exécute pas

## Contexte
Mon Acupunctrice Hub V2 — PWA déployée sur Vercel (mon-acupunctrice-v2.vercel.app).
Judith avait du contenu planifié pour le 27 mars à 6h du matin dans le Hub.
Le cron de publication `/api/cron/publish` (schedule: `0 12 * * *` = 8h Montréal)
n'a PAS tourné — 0 Cron Job visible dans les logs Vercel.

## Ce qu'il faut investiguer

1. **Vérifier que le déploiement production est sur `main`**
   - On a travaillé toute la soirée sur la branche `feature/editor-pro`
   - Les crons Vercel ne roulent QUE sur le déploiement de production (branche main)
   - Vérifier : est-ce que le dernier deploy sur main a le vercel.json avec les crons?

2. **Vérifier les logs Vercel**
   - Aller sur https://vercel.com → projet mon-acupunctrice-v2 → Logs
   - Filtrer par `/api/cron/publish`
   - Voir si le cron a tourné mais a échoué

3. **Vérifier le plan Vercel**
   - Plan Hobby = 1 exécution/jour/route max pour les crons
   - Vérifier dans Settings → Cron Jobs si les crons sont actifs

4. **Vérifier le contenu planifié dans Firestore**
   - Collection `contentItems`
   - Champ `scheduledAt` <= maintenant ET `workflowState` = 'scheduled'
   - L'item planifié existe-t-il?

5. **Tester le cron manuellement**
   - Appeler directement : `curl -H "Authorization: Bearer $CRON_SECRET" https://mon-acupunctrice-v2.vercel.app/api/cron/publish`
   - Ou dans le navigateur

## Fichiers à lire
- `vercel.json` — config cron
- `app/api/cron/publish/route.ts` — logique du cron
- `.env.local` ou Vercel dashboard → CRON_SECRET

## Hypothèses probables
1. **Pas de contenu avec scheduledAt** — le plus probable si le contenu a été planifié
   avec un format de date différent ou un scheduledAt dans le futur
2. **Cron pas actif sur plan Hobby** — vérifier les settings Vercel
3. **CRON_SECRET mismatch** — le secret dans vercel.json vs env vars
