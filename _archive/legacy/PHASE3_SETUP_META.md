# Phase 3a — Guide de setup Meta Developer (pour Benoit)

## Étapes à suivre dans le navigateur

### 1. Créer une Meta Developer App
1. Va sur https://developers.facebook.com/
2. Connecte-toi avec le compte Facebook lié au profil business de Judith
3. Clique **"Créer une app"**
4. Type d'app : **"Business"**
5. Nom de l'app : `Mon Acupunctrice Hub`
6. Email de contact : l'email de Judith ou le tien
7. **Important** : Associe l'app au Business Account qui possède le compte IG de Judith

### 2. Ajouter les produits à l'app
Dans le dashboard de l'app :
1. Ajoute le produit **"Facebook Login for Business"**
2. Ajoute le produit **"Instagram Graph API"**
3. Dans Facebook Login > Settings, ajoute l'URI de redirection :
   - `https://mon-acupunctrice-hub.onrender.com/auth/meta/callback`
   - `http://localhost:5173/auth/meta/callback` (pour le dev local)

### 3. Noter les identifiants
Dans Settings > Basic, copie :
- **App ID** : `_______________`
- **App Secret** : `_______________`

### 4. Vérifier le compte Instagram Business
- Le compte @Mon_acupunctrice doit être un **compte professionnel** (pas personnel)
- Il doit être **connecté à une Page Facebook**
- Va dans Instagram > Settings > Account > Switch to professional account (si pas déjà fait)

### 5. Obtenir le Page ID et l'Instagram Business Account ID
Dans le Graph API Explorer (https://developers.facebook.com/tools/explorer/) :
1. Sélectionne ton app
2. Génère un User Token avec les permissions :
   - `instagram_basic`
   - `instagram_content_publish`
   - `pages_show_list`
   - `pages_read_engagement`
3. Requête : `GET /me/accounts` → note le **Page ID**
4. Requête : `GET /{page-id}?fields=instagram_business_account` → note l'**IG Account ID**

### 6. Stocker les secrets dans Firebase
```bash
# App ID et App Secret
printf 'TON_APP_ID' | firebase functions:secrets:set META_APP_ID --project mon-acupunctrice-hub
printf 'TON_APP_SECRET' | firebase functions:secrets:set META_APP_SECRET --project mon-acupunctrice-hub

# Page ID et IG Account ID 
printf 'TON_PAGE_ID' | firebase functions:secrets:set META_PAGE_ID --project mon-acupunctrice-hub
printf 'TON_IG_ACCOUNT_ID' | firebase functions:secrets:set META_IG_ACCOUNT_ID --project mon-acupunctrice-hub
```

### 7. Obtenir un Long-Lived Token (après le setup OAuth)
Le flow OAuth dans l'app va gérer ça automatiquement, mais pour tester :
1. Dans le Graph API Explorer, génère un Short-Lived User Token
2. Échange-le pour un Long-Lived Token (60 jours) via l'API
3. Stocke-le : `printf 'TOKEN' | firebase functions:secrets:set META_USER_TOKEN --project mon-acupunctrice-hub`

---

## Checklist
- [ ] Meta Developer App créée
- [ ] Facebook Login + Instagram Graph API ajoutés
- [ ] App ID et App Secret notés
- [ ] Compte IG de Judith = Business/Creator
- [ ] Page Facebook connectée au compte IG
- [ ] Page ID et IG Account ID obtenus
- [ ] Secrets stockés dans Firebase
- [ ] Long-Lived Token généré et stocké
