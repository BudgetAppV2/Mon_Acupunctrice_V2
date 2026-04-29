# Content Pipeline — acupuncturejudith.ca

## Architecture

Les fichiers markdown dans ce dossier sont la **source de vérité** du contenu du site.
Firestore est un miroir — le contenu est injecté programmatiquement via les scripts.

```
content/
├── ressources/        ← Pages ressources longues (2500+ mots, citations PubMed)
│   ├── _TEMPLATE.md   ← Template avec frontmatter YAML
│   └── *.md           ← Ressources produites
├── faq/               ← FAQ individuelles
├── blog/              ← Articles de blog
├── scripts/
│   ├── inject.mjs     ← Injecte markdown → Firestore
│   ├── audit-freshness.mjs ← Vérifie la fraîcheur des sources
│   └── retire.mjs     ← Archive ou supprime une ressource
└── README.md          ← Ce fichier
```

## Workflow de production

### 1. Produire le contenu
Session Claude Desktop : recherche PubMed + rédaction → fichier markdown dans `content/ressources/`

### 2. Vérifier (dry run)
```bash
node content/scripts/inject.mjs content/ressources/acupuncture-menopause.md --dry-run
```

### 3. Injecter dans Firestore
```bash
node content/scripts/inject.mjs content/ressources/acupuncture-menopause.md
```
Le statut par défaut est `pending` — Judith verra la ressource dans le Hub pour validation.

### 4. Validation Judith
Judith ouvre le Hub → onglet "Contenu" → voit la ressource en attente → Approuver/Commenter.
Si approuvé → statut `published` → ISR rafraîchit le site automatiquement.

### 5. Audit de fraîcheur
```bash
node content/scripts/audit-freshness.mjs
```
Signale les contenus dont la recherche date de > 12 mois ou dont les sources ont > 2 ans.

### 6. Retirer une ressource
```bash
node content/scripts/retire.mjs ressources acupuncture-menopause        # archive (draft)
node content/scripts/retire.mjs ressources acupuncture-menopause --delete  # supprime
```

## Injection en batch
```bash
# Injecter toutes les ressources
node content/scripts/inject.mjs content/ressources/*.md

# Injecter toutes les FAQ
node content/scripts/inject.mjs content/faq/*.md --collection=faqs
```

## Format des fichiers

Chaque fichier utilise le frontmatter YAML pour les métadonnées et des sections `## nomSection` pour le contenu. Voir `_TEMPLATE.md` pour le format complet.

Les champs de fraîcheur (`lastResearchedAt`, `newestSourceYear`, `freshnessNote`) permettent de tracker quand le contenu a été recherché et si les sources sont encore d'actualité.
