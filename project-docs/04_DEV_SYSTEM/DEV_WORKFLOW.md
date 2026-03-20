# DEV WORKFLOW — Pattern de développement à 3 Claude
*Document opérationnel — Mars 2026*

---

## Le pattern

```
┌─────────────────────┐     ┌─────────────────────┐     ┌─────────────────────┐
│   Claude Desktop    │     │     Claude Code      │     │  Claude in Chrome   │
│   (Architecte)      │     │   (Développeur)      │     │  (Testeur/Debugger) │
├─────────────────────┤     ├─────────────────────┤     ├─────────────────────┤
│                     │     │                     │     │                     │
│ 1. Lire les docs    │     │                     │     │                     │
│ 2. Étoffer le       │     │                     │     │                     │
│    milestone        │     │                     │     │                     │
│ 3. Écrire le prompt │────▶│ 4. Recevoir le      │     │                     │
│    one-shot         │     │    prompt            │     │                     │
│                     │     │ 5. Lire la codebase  │     │                     │
│                     │     │ 6. Implémenter       │     │                     │
│                     │     │ 7. npm run build     │────▶│ 8. Ouvrir l'app     │
│                     │     │                     │     │ 9. Tester le flow   │
│                     │     │                     │     │ 10. Lire la console │
│                     │     │                     │◀────│ 11. Reporter les    │
│                     │     │ 12. Fixer les bugs   │     │     bugs            │
│                     │     │ 13. npm run build    │────▶│ 14. Re-tester       │
│                     │     │                     │     │ 15. Valider ✓       │
│                     │     │ 16. git commit       │     │                     │
│                     │     │                     │     │                     │
└─────────────────────┘     └─────────────────────┘     └─────────────────────┘
```

---

## Rôle de chaque Claude

### Claude Desktop (claude.ai) — L'Architecte
- Lit les docs du projet (vision, PRD, data model, milestones précédents)
- Discute les décisions produit et techniques avec Benoît
- Écrit les milestones détaillés avec specs et data model
- Produit les prompts one-shot prêts à copier-coller dans Claude Code
- Peut aussi lire/écrire des fichiers via Filesystem MCP
- **Ne touche PAS à la codebase directement** — il planifie

### Claude Code — Le Développeur
- Reçoit un prompt one-shot et l'implémente
- Lit la codebase existante avant de coder
- Crée/modifie les fichiers
- Lance `npm run build` pour valider
- Fait les corrections sur le code
- Git commit quand le milestone passe

### Claude in Chrome — Le Testeur
- Ouvre l'app sur localhost:3000 (ou URL Vercel)
- Teste les flows complets sur mobile (375px)
- Lit la console pour les erreurs
- Injecte des logs de debug si nécessaire
- Reporte les bugs pour que Claude Code les fixe
- Valide le résultat final visuellement

---

## Cycle par milestone

### Phase 1 — Planification (Claude Desktop)
```
1. Lire le milestone doc dans project-docs/02_ROADMAP/
2. Discuter les questions ouvertes avec Benoît
3. Étoffer les specs si nécessaire
4. Écrire le prompt one-shot (format ONE_SHOT_PLAYBOOK.md)
5. Sauvegarder dans le dossier du milestone
```

### Phase 2 — Implémentation (Claude Code)
```
1. Copier-coller le prompt one-shot
2. Claude Code lit les fichiers référencés AVANT de coder
3. Implémente les livrables un par un
4. npm run build → doit passer
5. Si erreur → fixer avant de continuer
```

### Phase 3 — Validation (Claude in Chrome + Claude Code)
```
1. Claude in Chrome ouvre localhost:3000
2. Teste le flow complet du milestone
3. Vérifie la console (errors, warnings)
4. Teste sur mobile 375px (DevTools)
5. Si bug → Claude Code fixe
6. Boucle jusqu'à DoD complète
```

### Phase 4 — Clôture
```
1. git commit -m "feat: [milestone] description"
2. Vérifier : 0 console.log de debug
3. Cocher le milestone dans ROADMAP_OVERVIEW.md
4. Next milestone
```

---

## Commandes utiles

### Dev local
```bash
cd /Users/benoitarchambault/Desktop/Mon_Acupunctrice_V2
npm run dev          # Démarrer le serveur
npm run dev:clean    # Vider cache .next et redémarrer (si page blanche)
npm run build        # Build production
```

### Firebase
```bash
firebase deploy --only firestore:indexes
firebase deploy --only firestore:rules
firebase deploy --only functions
firebase emulators:start --only functions
```

### Git
```bash
git add -A
git commit -m "feat(milestone-R01): statut automatique"
git push origin main
```

### Debug
```bash
grep -r "console.log" app/ components/ lib/ --include="*.tsx" --include="*.ts"
grep -r "\[DEBUG" app/ components/ lib/ --include="*.tsx" --include="*.ts"
```

---

## Erreurs communes et solutions

| Erreur | Cause | Solution |
|--------|-------|----------|
| Page blanche | Cache .next stale | `npm run dev:clean` |
| SharedArrayBuffer undefined | Headers COOP/COEP manquants | Vérifier next.config.mjs |
| Firebase permission denied | Security rules trop strictes | Vérifier firestore.rules |
| Hydration mismatch | Extension Chrome (Kapture) | Ignorer en dev, absent en prod |
| Module not found | Import path incorrect | Vérifier les alias @ dans tsconfig |
