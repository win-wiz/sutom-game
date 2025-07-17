'use client';

import { memo, useMemo } from 'react';
import { useGame } from '@/contexts/GameContext';

// Optimisation: extraire les données statiques pour éviter la re-création à chaque rendu
const NAVIGATION_LINKS = [
  {
    href: '/privacy',
    label: 'Politique de confidentialité',
    text: 'Politique de Confidentialité'
  },
  {
    href: '/terms',
    label: 'Conditions d\'utilisation',
    text: 'Conditions d\'Utilisation'
  }
] as const;

const FRIEND_LINKS = [
  {
    href: 'https://wordless.online',
    label: 'Lien ami 1',
    text: 'Wordless'
  },
  {
    href: 'https://emojis.click',
    label: 'Lien ami 2',
    text: 'EmojiClick'
  }
] as const;

// Optimisation: extraire le SVG GitHub en tant que constante pour éviter la re-création
const GitHubIcon = () => (
  <svg 
    className="w-6 h-6" 
    fill="currentColor" 
    viewBox="0 0 24 24" 
    aria-hidden="true"
  >
    <path 
      fillRule="evenodd" 
      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" 
      clipRule="evenodd" 
    />
  </svg>
);

/**
 * Composant Footer optimisé pour les performances
 * Utilise React.memo pour éviter les re-rendus inutiles
 * Design cohérent avec le thème sombre du site
 * Se cache automatiquement quand le jeu est en cours
 */
const FooterComponent = () => {
  const { gameMode } = useGame();
  
  // Optimisation: calculer l'année une seule fois et la mettre en cache
  const currentYear = useMemo(() => new Date().getFullYear(), []);
  
  // Ne pas afficher le footer quand le jeu est en cours
  if (gameMode === 'playing') {
    return null;
  }

  return (
    <footer className="bg-gray-800 border-t border-gray-700/50 py-12 mt-auto">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center space-y-6">
          {/* Titre principal */}
          <h3 className="text-2xl font-bold text-white">
            Sutom
          </h3>
          
          {/* Description */}
          <p className="text-gray-400 max-w-2xl leading-relaxed">
            Un jeu de devinettes de mots amusant et stimulant pour tester votre vocabulaire et vos compétences de déduction.
          </p>
          
          {/* Navigation links */}
          <nav className="flex flex-wrap justify-center gap-8 py-4">
            {NAVIGATION_LINKS.map((link) => (
              <a 
                key={link.href}
                href={link.href} 
                className="text-gray-400 hover:text-white transition-colors duration-200"
                aria-label={link.label}
              >
                {link.text}
              </a>
            ))}
          </nav>
          
          {/* Friends info */}
          <div className="text-center">
            <div className="text-gray-500 text-sm mb-3">Amis:</div>
            <div className="flex flex-wrap justify-center gap-4">
              {FRIEND_LINKS.map((link) => (
                <a 
                  key={link.href}
                  href={link.href} 
                  className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={link.label}
                >
                  {link.text}
                </a>
              ))}
            </div>
          </div>
          
          {/* GitHub icon */}
          <a 
            href="https://github.com/win-wiz/sutom-game" 
            className="text-gray-500 hover:text-gray-300 transition-colors duration-200"
            aria-label="Voir sur GitHub"
            target="_blank"
            rel="noopener noreferrer"
          >
            <GitHubIcon />
          </a>
          
          {/* Copyright */}
          <div className="text-xs text-gray-500 pt-4">
            © {currentYear} Sutom. Tous droits réservés.
          </div>
        </div>
      </div>
    </footer>
  );
};

// Utilise memo pour optimiser les performances et éviter les re-rendus inutiles
export const Footer = memo(FooterComponent);