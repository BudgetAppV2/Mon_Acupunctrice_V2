export default function PolitiqueDeConfidentialite() {
  return (
    <div className="min-h-screen bg-sand px-6 py-12 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Politique de confidentialite</h1>

      <p className="text-sm text-gray-500 mb-8">Derniere mise a jour : 3 avril 2026</p>

      <div className="space-y-6 text-sm text-gray-700 leading-relaxed">
        <section>
          <h2 className="text-base font-semibold text-gray-900 mb-2">Application</h2>
          <p>
            Mon Acupunctrice Hub est une application de creation et de publication de contenu
            video sur les reseaux sociaux, developpee pour un usage personnel et professionnel.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-gray-900 mb-2">Donnees collectees</h2>
          <p>L&apos;application collecte et utilise les donnees suivantes :</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Compte Google (authentification via Google Sign-In)</li>
            <li>Compte Instagram Business (pour la publication de Reels et Stories)</li>
            <li>Page Facebook (pour la publication de Reels Facebook)</li>
            <li>Chaine YouTube (pour la publication de Shorts YouTube)</li>
            <li>Videos et images creees dans l&apos;editeur</li>
            <li>Statistiques de performance des publications (vues, likes, commentaires)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-semibold text-gray-900 mb-2">Utilisation des donnees</h2>
          <p>
            Les donnees sont utilisees exclusivement pour permettre la creation, la planification
            et la publication de contenu sur les plateformes connectees, ainsi que le suivi des
            statistiques de performance.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-gray-900 mb-2">Stockage</h2>
          <p>
            Les donnees sont stockees de maniere securisee via Firebase (Google Cloud Platform).
            Les videos sont stockees dans Firebase Storage. Les tokens d&apos;acces aux plateformes
            sont chiffres et stockes dans une collection Firestore privee.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-gray-900 mb-2">Partage avec des tiers</h2>
          <p>
            Aucune donnee personnelle n&apos;est partagee, vendue ou transmise a des tiers.
            Les donnees sont uniquement transmises aux plateformes connectees (Instagram,
            Facebook, YouTube) dans le cadre de la publication de contenu autorisee par
            l&apos;utilisateur.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-gray-900 mb-2">Suppression des donnees</h2>
          <p>
            L&apos;utilisateur peut a tout moment deconnecter ses comptes de reseaux sociaux
            depuis la page Profil de l&apos;application. Pour demander la suppression complete
            de vos donnees, contactez-nous a l&apos;adresse ci-dessous.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-gray-900 mb-2">Contact</h2>
          <p>
            Pour toute question concernant cette politique de confidentialite :<br />
            <a href="https://acupuncturejudith.ca" target="_blank" rel="noopener noreferrer"
              className="text-sage underline">acupuncturejudith.ca</a>
          </p>
        </section>
      </div>
    </div>
  );
}
