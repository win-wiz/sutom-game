'use client';

import { memo, useEffect } from 'react';
import Link from 'next/link';

/**
 * Page des Conditions d'Utilisation
 * Contenu en français selon les exigences légales
 */
const TermsOfServicePage = () => {
  // 确保页面可以滚动
  useEffect(() => {
    const body = document.body;
    const main = document.querySelector('main');
    
    // 强制设置滚动样式
    body.style.overflow = 'auto';
    body.style.height = 'auto';
    if (main) {
      main.style.overflow = 'auto';
      main.style.height = 'auto';
    }
    
    // 清理函数
    return () => {
      // 保持滚动状态，不重置
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* En-tête */}
        <div className="text-center mb-12">
          <Link 
            href="/" 
            className="inline-flex items-center text-blue-400 hover:text-blue-300 transition-colors duration-200 mb-6"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Retour au jeu
          </Link>
          <h1 className="text-4xl font-bold text-white mb-4">
            Conditions d'Utilisation
          </h1>
          <p className="text-gray-400 text-lg">
            Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
          </p>
        </div>

        {/* Contenu */}
        <div className="bg-gray-800 rounded-lg p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">1. Acceptation des Conditions</h2>
            <p className="text-gray-300 leading-relaxed">
              En accédant et en utilisant Sutom ("le Service"), vous acceptez d'être lié par ces conditions d'utilisation. 
              Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser notre service. Ces conditions s'appliquent 
              à tous les utilisateurs du jeu.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">2. Description du Service</h2>
            <p className="text-gray-300 leading-relaxed">
              Sutom est un jeu de devinettes de mots en ligne gratuit qui permet aux utilisateurs de tester leur vocabulaire 
              et leurs compétences de déduction. Le service comprend des modes de jeu classiques, des défis quotidiens, 
              et des fonctionnalités de suivi des statistiques.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">3. Utilisation Acceptable</h2>
            <div className="text-gray-300 leading-relaxed space-y-3">
              <p>Vous vous engagez à :</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Utiliser le service uniquement à des fins légales et appropriées</li>
                <li>Ne pas tenter de contourner les mécanismes de sécurité</li>
                <li>Ne pas utiliser de bots ou d'automatisation pour jouer</li>
                <li>Respecter les autres utilisateurs et maintenir un environnement positif</li>
                <li>Ne pas reproduire, distribuer ou modifier le contenu sans autorisation</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">4. Propriété Intellectuelle</h2>
            <p className="text-gray-300 leading-relaxed">
              Tous les droits de propriété intellectuelle relatifs au jeu Sutom, y compris mais sans s'y limiter, 
              le code source, les graphiques, les sons, et le contenu textuel, sont la propriété de leurs détenteurs respectifs. 
              Vous ne pouvez pas copier, modifier, distribuer ou créer des œuvres dérivées sans autorisation explicite.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">5. Disponibilité du Service</h2>
            <p className="text-gray-300 leading-relaxed">
              Nous nous efforçons de maintenir le service disponible 24h/24 et 7j/7, mais nous ne garantissons pas 
              une disponibilité ininterrompue. Le service peut être temporairement indisponible pour maintenance, 
              mises à jour ou en raison de circonstances indépendantes de notre volonté.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">6. Limitation de Responsabilité</h2>
            <div className="text-gray-300 leading-relaxed space-y-3">
              <p>Dans les limites autorisées par la loi :</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Le service est fourni "en l'état" sans garantie d'aucune sorte</li>
                <li>Nous ne sommes pas responsables des dommages directs ou indirects</li>
                <li>Nous ne garantissons pas l'exactitude du contenu du dictionnaire</li>
                <li>Votre utilisation du service est à vos propres risques</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">7. Données Utilisateur</h2>
            <p className="text-gray-300 leading-relaxed">
              Vos données de jeu (statistiques, préférences, progression) sont stockées localement dans votre navigateur. 
              Nous ne collectons pas d'informations personnelles identifiables. Pour plus de détails, consultez notre 
              <Link href="/privacy" className="text-blue-400 hover:text-blue-300 underline">
                Politique de Confidentialité
              </Link>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">8. Modifications du Service</h2>
            <p className="text-gray-300 leading-relaxed">
              Nous nous réservons le droit de modifier, suspendre ou interrompre tout ou partie du service à tout moment, 
              avec ou sans préavis. Nous pouvons également mettre à jour les règles du jeu, ajouter de nouvelles fonctionnalités 
              ou modifier l'interface utilisateur.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">9. Résiliation</h2>
            <p className="text-gray-300 leading-relaxed">
              Vous pouvez cesser d'utiliser le service à tout moment. Nous nous réservons le droit de suspendre ou 
              de résilier votre accès au service si vous violez ces conditions d'utilisation ou si nous déterminons 
              que votre utilisation nuit au service ou à d'autres utilisateurs.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">10. Modifications des Conditions</h2>
            <p className="text-gray-300 leading-relaxed">
              Nous pouvons modifier ces conditions d'utilisation à tout moment. Les modifications prendront effet 
              immédiatement après leur publication sur cette page. Votre utilisation continue du service après 
              la publication des modifications constitue votre acceptation des nouvelles conditions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">11. Droit Applicable</h2>
            <p className="text-gray-300 leading-relaxed">
              Ces conditions d'utilisation sont régies par le droit français. Tout litige relatif à ces conditions 
              ou à l'utilisation du service sera soumis à la juridiction exclusive des tribunaux français compétents.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">12. Contact</h2>
            <p className="text-gray-300 leading-relaxed">
              Si vous avez des questions concernant ces conditions d'utilisation, vous pouvez nous contacter via 
              notre page GitHub ou par email. Nous nous efforcerons de répondre à vos questions dans les meilleurs délais.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default memo(TermsOfServicePage);