'use client';

import { memo, useEffect } from 'react';
import Link from 'next/link';

/**
 * Page de Politique de Confidentialité
 * Contenu en français selon les exigences légales
 */
const PrivacyPolicyPage = () => {
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
            Politique de Confidentialité
          </h1>
          <p className="text-gray-400 text-lg">
            Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
          </p>
        </div>

        {/* Contenu */}
        <div className="bg-gray-800 rounded-lg p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">1. Introduction</h2>
            <p className="text-gray-300 leading-relaxed">
              Bienvenue sur Sutom. Nous respectons votre vie privée et nous nous engageons à protéger vos données personnelles. 
              Cette politique de confidentialité vous informe sur la façon dont nous collectons, utilisons et protégeons vos informations 
              lorsque vous utilisez notre jeu de devinettes de mots.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">2. Données Collectées</h2>
            <div className="text-gray-300 leading-relaxed space-y-3">
              <p><strong>Données de jeu :</strong></p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Statistiques de jeu (scores, temps de jeu, niveau de difficulté)</li>
                <li>Préférences de jeu et paramètres</li>
                <li>Progression dans les défis quotidiens</li>
              </ul>
              
              <p><strong>Données techniques :</strong></p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Informations sur votre navigateur et appareil</li>
                <li>Adresse IP (anonymisée)</li>
                <li>Données de performance du jeu</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">3. Utilisation des Données</h2>
            <div className="text-gray-300 leading-relaxed">
              <p>Nous utilisons vos données pour :</p>
              <ul className="list-disc list-inside ml-4 mt-3 space-y-1">
                <li>Fournir et améliorer l'expérience de jeu</li>
                <li>Sauvegarder votre progression et vos statistiques</li>
                <li>Personnaliser le contenu du jeu</li>
                <li>Analyser les performances et corriger les bugs</li>
                <li>Assurer la sécurité de la plateforme</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">4. Stockage des Données</h2>
            <p className="text-gray-300 leading-relaxed">
              Vos données de jeu sont stockées localement dans votre navigateur (localStorage) et ne sont pas transmises 
              à des serveurs externes, sauf pour les fonctionnalités nécessitant une connexion internet (comme la vérification 
              des mots dans le dictionnaire). Nous ne vendons ni ne partageons vos données personnelles avec des tiers.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">5. Cookies et Technologies Similaires</h2>
            <p className="text-gray-300 leading-relaxed">
              Nous utilisons des cookies et des technologies de stockage local pour améliorer votre expérience de jeu, 
              sauvegarder vos préférences et analyser l'utilisation du site. Vous pouvez désactiver les cookies dans 
              les paramètres de votre navigateur, mais cela peut affecter certaines fonctionnalités du jeu.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">6. Vos Droits</h2>
            <div className="text-gray-300 leading-relaxed">
              <p>Conformément au RGPD, vous avez le droit de :</p>
              <ul className="list-disc list-inside ml-4 mt-3 space-y-1">
                <li>Accéder à vos données personnelles</li>
                <li>Rectifier ou supprimer vos données</li>
                <li>Limiter le traitement de vos données</li>
                <li>Vous opposer au traitement</li>
                <li>Portabilité de vos données</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">7. Sécurité</h2>
            <p className="text-gray-300 leading-relaxed">
              Nous mettons en œuvre des mesures de sécurité appropriées pour protéger vos données contre l'accès non autorisé, 
              la modification, la divulgation ou la destruction. Cependant, aucune méthode de transmission sur Internet 
              n'est 100% sécurisée.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">8. Modifications</h2>
            <p className="text-gray-300 leading-relaxed">
              Nous pouvons mettre à jour cette politique de confidentialité de temps à autre. Les modifications seront 
              publiées sur cette page avec une nouvelle date de "dernière mise à jour". Nous vous encourageons à consulter 
              régulièrement cette politique.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">9. Contact</h2>
            <p className="text-gray-300 leading-relaxed">
              Si vous avez des questions concernant cette politique de confidentialité ou vos données personnelles, 
              vous pouvez nous contacter via notre page GitHub ou par email.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default memo(PrivacyPolicyPage);