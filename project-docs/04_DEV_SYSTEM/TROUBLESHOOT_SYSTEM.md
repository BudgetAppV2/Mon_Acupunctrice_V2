# TROUBLESHOOT_SYSTEM.md
# Système de debugging et troubleshooting
*Claude Desktop + Claude in Chrome + Dev local*

---

## Vue d'ensemble

Le système de troubleshoot repose sur 3 outils MCP combinés :

| Outil | Rôle |
|-------|------|
| **Claude Desktop** | Stratégiste — lit le code, analyse, propose les fixes |
| **Claude in Chrome** | Observateur — lit la console, injecte des logs, voit l'UI |
| **Desktop Commander** | Exécuteur — modifie les fichiers directement, redémarre les process |

---

## Setup dev local (Next.js V2)

```bash
# Terminal 1 — Next.js dev server
cd /Users/benoitarchambault/Desktop/Mon_Acupunctrice_V2
npm run dev
# → http://localhost:3000

# Terminal 2 — Firebase emulators
firebase emulators:start --only functions
# → Functions: http://127.0.0.1:5001
```

Vite (V1) avait besoin d'un 3ème terminal pour le proxy Express.
Next.js V2 — plus besoin : les proxys sont des API routes `/app/api/`.

---

## Workflow de debugging standard

### Étape 1 — Observer

Claude in Chrome lit la console en temps réel :
```
read_console_messages(tabId, pattern="error|Error|warning")
```

### Étape 2 — Comprendre

Claude Desktop lit le code source avec Desktop Commander :
```
start_process("cat /path/to/component.tsx")
```

### Étape 3 — Injecter des logs ciblés

Claude Desktop modifie directement le fichier pour ajouter des logs :
```js
// Ajout temporaire dans le composant
console.log('[DEBUG ComponentName] state:', JSON.stringify(state))
console.log('[DEBUG ComponentName] props:', JSON.stringify(props))
```

Next.js hot-reload → logs visibles immédiatement dans Chrome.

### Étape 4 — Lire les logs

```
read_console_messages(tabId, pattern="DEBUG")
```

### Étape 5 — Fixer et nettoyer

Desktop Commander modifie le fichier avec le fix + retire les logs.

---

## Patterns de debugging fréquents

### Bug Firebase Auth
```js
// Injecter dans AuthContext
console.log('[AUTH] user:', user?.uid, 'loading:', loading)
console.log('[AUTH] currentPath:', window.location.pathname)
```

### Bug Firestore query
```js
// Injecter avant la query
console.log('[FIRESTORE] query params:', { userId, status })
// Injecter dans le callback
console.log('[FIRESTORE] result:', docs.length, 'items')
```

### Bug composant React
```js
// Injecter dans useEffect
console.log('[EFFECT ComponentName] deps changed:', { dep1, dep2 })
// Injecter dans les handlers
console.log('[CLICK handlerName] event:', e.target.value)
```

### Bug API route Next.js
```js
// Dans /app/api/route.ts
console.log('[API /route] request body:', await req.json())
console.log('[API /route] response:', result)
```

---

## Outils MCP disponibles

### Claude in Chrome (troubleshoot UI)
```
tabs_context_mcp()           → voir les onglets ouverts
read_console_messages()      → lire la console Chrome
javascript_tool()            → exécuter du JS dans la page
computer(screenshot)         → screenshot de l'état actuel
navigate()                   → naviguer vers une page
```

### Desktop Commander (fichiers et process)
```
start_process(command)       → lancer une commande shell
write_file(path, content)    → modifier un fichier
edit_block(file, old, new)   → chirurgie de fichier
start_search(path, pattern)  → chercher dans le code
```

---

## Convention de logs temporaires

Préfixer tous les logs de debug avec `[DEBUG ...]` pour les retrouver facilement :
```js
console.log('[DEBUG NomComposant] message:', variable)
```

Avant de commit → chercher et supprimer tous les `[DEBUG` :
```bash
grep -r "\[DEBUG" src/ --include="*.tsx" --include="*.ts"
```

---

## Scénarios typiques Claude Desktop + Chrome

### Scénario 1 : Bug silencieux (pas d'erreur mais ça ne marche pas)
1. `read_console_messages` → rien d'utile
2. Desktop Commander lit le composant suspect
3. Injecte des logs dans le flow de données
4. `read_console_messages(pattern="DEBUG")` → trouve le point de rupture
5. Fix + nettoyage des logs

### Scénario 2 : Erreur console connue
1. `read_console_messages(onlyErrors=true)` → stack trace
2. Desktop Commander lit le fichier pointé dans la stack trace
3. Fix direct sans logs supplémentaires

### Scénario 3 : Bug visuel (UI incorrecte)
1. `computer(screenshot)` → voir l'état actuel
2. `javascript_tool()` → inspecter les valeurs dans le DOM
3. Desktop Commander lit le composant CSS/Tailwind
4. Fix inline

---

## Règle de nettoyage

> Avant chaque commit : 0 console.log de debug en production.
> Garder seulement les console.error pour les erreurs réelles.
```bash
# Vérifier avant commit
grep -r "console.log" src/ --include="*.tsx" --include="*.ts"
```
