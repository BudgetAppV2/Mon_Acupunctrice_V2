# Blog
**URL source** : https://www.acupuncturejudith.ca/blog
**Methode d'extraction** : SSR HTML body + meta tags

## Metadonnees SEO

- **Title** : Blog | Judith Dufour Savard
- **Meta description** : Blog traitant de differents sujets d'acupuncture, grossesse, naissance, post-partum, fertilite, acupuncture sociale et acupuncture pour les enfants
- **OG:image** : `https://static.wixstatic.com/media/7c47c5_4632701c9a794d33b34c5cc7e22bfad1%7Emv2.jpg/v1/fit/w_2500,h_1330,al_c/7c47c5_4632701c9a794d33b34c5cc7e22bfad1%7Emv2.jpg`

## Contenu

### H1 : Blogue d'acupuncture

### Categories (filtres)

- Blogue d'acupuncture (tous)
- fertilite
- grossesse
- post-partum
- enfant
- Acupuncture pour tous
- Sante generale

### Articles de blog (4 articles identifies)

#### 1. L'acupuncture pour les nausees de grossesse : un soulagement naturel au premier trimestre

- **URL** : `/post/acupuncture-nausees-grossesse`
- **Auteure** : Judith Dufour-Savard
- **Date** : 29 janv. (2026)
- **Temps de lecture** : 8 min
- **Extrait** : Se sentir avec le coeur au bord des levres sans repit, ce n'est pas facile -- surtout quand ton ventre n'est pas encore rond et que tu n'as peut-etre pas encore annonce ta grossesse. La bonne nouvelle : cette periode n'est pas une fatalite. Si l'acupuncture pour les nausees de grossesse pouvait t'apporter un vrai soulagement ?
- **Image** : `6745f7_1a29cb1923b246b38fa4d11e45995db8~mv2.png`

#### 2. Acupuncture et systeme immunitaire : renforcez vos defenses naturellement

- **URL** : `/post/acupuncture-systeme-immunitaire`
- **Auteure** : Judith Dufour-Savard
- **Date** : 28 oct. 2025
- **Temps de lecture** : 6 min
- **Extrait** : Saviez-vous que l'acupuncture peut agir en prevention pour renforcer le systeme immunitaire avant l'apparition des symptomes et soutenir le corps pour qu'il puisse mieux resister aux agressions externes ?
- **Image** : `6745f7_36afbcf92a7c479985e8878465f6fc15~mv2.jpg`

#### 3. Coliques du nouveau-ne : l'acupuncture est-elle efficace ?

- **URL** : `/post/acupuncture-coliques-nourrisson`
- **Auteure** : Judith Dufour-Savard
- **Date** : 9 juil. 2025
- **Temps de lecture** : 6 min
- **Extrait** : Parmi les periodes les plus redoutees par les parents lors des premieres semaines de vie du bebe se trouvent les fameuses coliques ! Et bien que plusieurs personnes vous disent "il n'y a rien a faire, ca va passer", l'acupuncture peut se reveler une alliee de choix pour soulager, de maniere naturelle, les maux digestifs de votre nouveau-ne.
- **Image** : `6745f7_b717810c6c0144029f1e7b12027b6e0f~mv2.png`

#### 4. Stress et anxiete chez l'enfant : les bienfaits meconnus de l'acupuncture

- **URL** : `/post/stress-anxiete-enfant-bienfaits-acupuncture`
- **Auteure** : Judith Dufour-Savard
- **Date** : 10 juin 2025
- **Temps de lecture** : 8 min
- **Extrait** : Vous cherchez une methode douce et naturelle pour aider un enfant stresse ou anxieux, sans medicaments ? Dans cet article, decouvrez comment le stress se manifeste chez les enfants et les methodes efficaces pour soutenir leur systeme nerveux, notamment grace a l'acupuncture pediatrique.
- **Image** : `6745f7_7d1059cb69124a03ad453ebeb2312f89~mv2.png`

## Images

### Images de couverture des articles

| Article | URL base |
|---------|----------|
| Nausees grossesse | `https://static.wixstatic.com/media/6745f7_1a29cb1923b246b38fa4d11e45995db8~mv2.png` |
| Systeme immunitaire | `https://static.wixstatic.com/media/6745f7_36afbcf92a7c479985e8878465f6fc15~mv2.jpg` |
| Coliques nourrisson | `https://static.wixstatic.com/media/6745f7_b717810c6c0144029f1e7b12027b6e0f~mv2.png` |
| Stress enfant | `https://static.wixstatic.com/media/6745f7_7d1059cb69124a03ad453ebeb2312f89~mv2.png` |

## Notes

- **Structure** : Listing de blog Wix standard avec filtres par categorie + cartes d'articles
- **Wix components** : Wix Blog (composant natif Wix), avec filtres de categories
- **Volume** : 4 articles publies (de juin 2025 a janvier 2026)
- **Frequence** : Environ 1 article tous les 2-3 mois
- **Categories utilisees** : Les filtres sont visibles mais les articles ne montrent pas explicitement leur categorie dans le listing
- **Format articles** : Titre H2 + extrait + auteur + date + temps de lecture + image de couverture
- **Migration** :
  - Le contenu complet de chaque article n'est PAS visible sur la page listing (seulement les extraits)
  - Il faudra fetcher chaque article individuellement (`/post/[slug]`) pour extraire le contenu complet
  - Le systeme de categories devra etre recree
  - Les URLs `/post/[slug]` devront etre redirigees vers les nouvelles URLs
