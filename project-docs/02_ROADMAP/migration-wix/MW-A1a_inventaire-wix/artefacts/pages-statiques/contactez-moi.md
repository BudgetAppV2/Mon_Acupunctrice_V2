# Contactez-moi
**URL source** : https://www.acupuncturejudith.ca/contactez-moi
**Methode d'extraction** : SSR HTML body + meta tags

## Metadonnees SEO

- **Title** : Contactez Judith Dufour Savard | Acupuncture a Montreal
- **Meta description** : Vous avez des questions ou souhaitez prendre rendez-vous? Contactez-moi via le formulaire en ligne ou reservez directement votre seance sur Go Rendez-Vous.
- **OG:image** : `https://static.wixstatic.com/media/7c47c5_4632701c9a794d33b34c5cc7e22bfad1%7Emv2.jpg/v1/fit/w_2500,h_1330,al_c/7c47c5_4632701c9a794d33b34c5cc7e22bfad1%7Emv2.jpg`

## Contenu

### H1 : Me contacter

Vous avez des questions ou des commentaires ?

Vous ne savez pas si l'acupuncture est faite pour vous ?

Votre cas est particulier et vous souhaitez m'en parler ?

Remplissez le formulaire suivant et je me ferai un plaisir de vous repondre.

Si vous souhaitez prendre rendez-vous, cliquez sur le bouton ci-dessous pour acceder a la plateforme Go Rendez-Vous de La Source en Soi, dans le quartier de Rosemont, a Montreal, ou j'offre mes traitements. Planifiez votre soin en quelques clics !

Bouton : "Je prends rendez-vous"

### Informations de contact

- **Adresse** : 2554 Rue Beaubien E, Montreal, QC H1Y 1G3, Canada
- **Telephone** : 514 750-3735

### Formulaire de contact (Wix Forms)

Champs :
- Nom
- E-mail
- Objet
- Message
- Bouton : "Envoyer"

Message de succes : "Merci pour votre envoi !"

## Images

Aucune image specifique a cette page (uniquement les images communes nav/footer).

## Notes

- **Structure** : H1 + texte d'introduction + CTA Go Rendez-Vous + adresse + formulaire de contact
- **Wix components** :
  - **Formulaire de contact Wix** (Wix Forms) : 4 champs (Nom, E-mail, Objet, Message)
  - Probablement une **carte Google Maps** integree (non visible dans le SSR HTML car CSR)
- **CTA externe** : Lien vers Go Rendez-Vous (plateforme de reservation externe)
- **Adresse clinique** : La Source en Soi, 2554 Rue Beaubien E, Montreal, QC H1Y 1G3
- **Migration** : Le formulaire devra etre recree (soit Next.js natif, soit service tiers comme Formspree/Resend). La carte Google Maps devra etre reimplementee.
