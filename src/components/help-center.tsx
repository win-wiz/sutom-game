'use client';

import { memo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HelpCircle, Target, Clock, Trophy } from 'lucide-react';

interface HelpCenterProps {
  onClose?: () => void;
}

// 静态内容常量，避免重复渲染
const GAME_STEPS = [
  {
    number: 1,
    title: "Choisissez votre premier mot",
    description: "Tapez un mot français valide de la longueur demandée. Par exemple, si le mot fait 5 lettres, tapez \"CHIEN\" ou \"MAISON\".",
    bgColor: "from-blue-600/20 to-blue-800/20",
    borderColor: "border-blue-500/30",
    iconBg: "bg-blue-500",
    titleColor: "text-blue-400"
  },
  {
    number: 2,
    title: "Observez les couleurs",
    description: "Après avoir validé votre mot, chaque lettre se colore pour vous donner des indices (voir le code couleur ci-dessous).",
    bgColor: "from-green-600/20 to-green-800/20",
    borderColor: "border-green-500/30",
    iconBg: "bg-green-500",
    titleColor: "text-green-400"
  },
  {
    number: 3,
    title: "Utilisez les indices",
    description: "Basez-vous sur les couleurs pour choisir votre prochain mot. Répétez jusqu'à trouver le mot ou épuiser vos 6 tentatives.",
    bgColor: "from-purple-600/20 to-purple-800/20",
    borderColor: "border-purple-500/30",
    iconBg: "bg-purple-500",
    titleColor: "text-purple-400"
  }
];

const COLOR_CODES = [
  {
    letter: "A",
    color: "Rouge",
    description: "Lettre correcte, bonne position",
    bgColor: "from-red-600/20 to-red-800/20",
    borderColor: "border-red-500/30",
    iconBg: "bg-red-600",
    titleColor: "text-red-400"
  },
  {
    letter: "B",
    color: "Jaune",
    description: "Lettre correcte, mauvaise position",
    bgColor: "from-yellow-600/20 to-yellow-800/20",
    borderColor: "border-yellow-500/30",
    iconBg: "bg-yellow-600",
    titleColor: "text-yellow-400"
  },
  {
    letter: "C",
    color: "Gris",
    description: "Lettre absente du mot",
    bgColor: "from-gray-600/20 to-gray-800/20",
    borderColor: "border-gray-500/30",
    iconBg: "bg-gray-600",
    titleColor: "text-gray-400"
  }
];

const STRATEGY_TIPS = [
  {
    number: 1,
    title: "Voyelles Communes",
    description: "Commencez par des mots contenant des voyelles communes (A, E, I, O, U) pour maximiser vos chances dans le Sutom Game."
  },
  {
    number: 2,
    title: "Consonnes Fréquentes",
    description: "Utilisez les consonnes fréquentes (R, S, T, L, N) dans vos premières tentatives du Sutom Game."
  },
  {
    number: 3,
    title: "Analysez les Indices",
    description: "Analysez les indices de couleur après chaque tentative pour optimiser votre stratégie dans le Sutom Game."
  },
  {
    number: 4,
    title: "Évitez les Répétitions",
    description: "Évitez de répéter les lettres grises déjà testées dans le Sutom Game pour économiser vos tentatives."
  }
];

const FAQ_ITEMS = [
  {
    question: "Que se passe-t-il si je ne trouve pas le mot ?",
    answer: "Pas de panique ! Après 6 tentatives, le Sutom Game vous révèle le mot mystère. C'est une excellente façon d'apprendre de nouveaux mots français."
  },
  {
    question: "Quels types de mots sont acceptés ?",
    answer: "Le Sutom Game accepte les mots français communs, y compris les pluriels s'ils correspondent à la longueur requise. Pas de noms propres, d'abréviations ou de mots très techniques."
  },
  {
    question: "Comment savoir si mon mot est valide ?",
    answer: "Si votre mot n'est pas dans notre dictionnaire, le Sutom Game vous l'indiquera et vous pourrez essayer un autre mot sans perdre de tentative."
  },
  {
    question: "Y a-t-il une limite de temps ?",
    answer: "Non ! Prenez tout le temps nécessaire pour réfléchir dans le Sutom Game. Seul le défi quotidien change chaque jour à minuit."
  }
];

const HelpCenterComponent = ({ onClose }: HelpCenterProps) => {
  // 优化的点击处理函数，包含滚动到游戏区域的逻辑
  const handleStartPlaying = useCallback(() => {
    // 关闭帮助中心
    onClose?.();
    
    // 延迟执行滚动，确保帮助中心已关闭
    setTimeout(() => {
      // 滚动到页面顶部，因为游戏会在主菜单的游戏模式区域开始
      window.scrollTo({ 
        top: 0, 
        behavior: 'smooth' 
      });
      
      // 可选：尝试聚焦到游戏区域（如果存在的话）
      const gameModesSection = document.querySelector('.grid.grid-cols-1.lg\\:grid-cols-2') || 
                              document.querySelector('[class*="grid"][class*="gap-8"]') ||
                              document.querySelector('main');
      
      if (gameModesSection) {
        gameModesSection.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }
    }, 150);
  }, [onClose]);

  return (
    <div className="min-h-screen" data-help-center>
      {/* Header Section */}
      <div className="bg-gray-800/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-8 text-center">
          <div className="flex items-center gap-3 mb-4 justify-center">
            <HelpCircle className="h-8 w-8 text-blue-400" />
            <h1 className="text-3xl font-bold text-white">Centre d'Aide</h1>
          </div>
          <p className="text-xl text-gray-300">Tout ce que vous devez savoir pour maîtriser le Sutom Game</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12 space-y-16">
        {/* Hero Section - Qu'est-ce que le Sutom Game */}
        <section className="text-center">
          <div className="inline-flex items-center gap-3 mb-6">
            <Target className="h-6 w-6 text-blue-400" />
            <h2 className="text-2xl font-bold text-white">Qu'est-ce que le Sutom Game ?</h2>
          </div>
          <div className="max-w-4xl mx-auto space-y-4">
            <p className="text-lg text-gray-300 leading-relaxed">
              Le <strong className="text-blue-400">Sutom Game</strong> est un jeu de devinettes de mots français inspiré du célèbre Wordle. 
              C'est un puzzle quotidien où vous devez deviner un mot mystère en français.
            </p>
            <p className="text-lg text-gray-300 leading-relaxed">
              <strong className="text-yellow-400">Principe simple :</strong> Vous tapez un mot, le jeu vous donne des indices colorés, 
              et vous utilisez ces indices pour deviner le mot correct en 6 tentatives maximum.
            </p>
          </div>
        </section>

        {/* Comment jouer - Étapes */}
        <section>
          <h2 className="text-2xl font-bold text-white text-center mb-12">Comment Jouer - Guide Étape par Étape</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {GAME_STEPS.map((step) => (
              <div key={step.number} className="group hover:scale-105 transition-transform duration-300">
                <div className={`bg-gradient-to-br ${step.bgColor} backdrop-blur-sm border ${step.borderColor} rounded-2xl p-8 h-full`}>
                  <div className={`w-16 h-16 ${step.iconBg} rounded-full flex items-center justify-center mb-6 mx-auto`}>
                    <span className="text-2xl font-bold text-white">{step.number}</span>
                  </div>
                  <h3 className={`text-xl font-semibold ${step.titleColor} mb-4 text-center`}>{step.title}</h3>
                  <p className="text-gray-300 text-center leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Code couleur */}
        <section>
          <h2 className="text-2xl font-bold text-white text-center mb-12">Code Couleur - Les Indices du Jeu</h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {COLOR_CODES.map((colorCode) => (
              <div key={colorCode.letter} className={`bg-gradient-to-br ${colorCode.bgColor} backdrop-blur-sm border ${colorCode.borderColor} rounded-2xl p-6 text-center`}>
                <div className={`w-20 h-20 ${colorCode.iconBg} rounded-2xl flex items-center justify-center mb-4 mx-auto shadow-lg`}>
                  <span className="text-2xl font-bold text-white">{colorCode.letter}</span>
                </div>
                <h3 className={`text-lg font-semibold ${colorCode.titleColor} mb-2`}>{colorCode.color}</h3>
                <p className="text-gray-300 text-sm">{colorCode.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Exemple concret */}
        <section>
          <h2 className="text-2xl font-bold text-white text-center mb-12">Exemple Concret - Comprendre en Pratique</h2>
          <div className="max-w-4xl mx-auto bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-600/50 rounded-3xl p-8">
            <div className="text-center mb-8">
              <p className="text-lg text-gray-300"><strong className="text-blue-400">Supposons que le mot mystère soit "CHIEN" (5 lettres)</strong></p>
            </div>
            
            <div className="space-y-8">
              {/* Tentative 1 */}
              <div className="bg-gray-800/30 rounded-2xl p-6">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <span className="text-yellow-400 font-bold text-lg">Tentative 1 :</span>
                  <span className="text-gray-300 text-lg">Vous tapez "MAISON"</span>
                </div>
                <div className="flex gap-2 justify-center mb-4">
                  <div className="w-12 h-12 bg-gray-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">M</div>
                  <div className="w-12 h-12 bg-gray-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">A</div>
                  <div className="w-12 h-12 bg-yellow-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">I</div>
                  <div className="w-12 h-12 bg-gray-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">S</div>
                  <div className="w-12 h-12 bg-gray-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">O</div>
                  <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">N</div>
                </div>
                <p className="text-center text-gray-400">→ Le I est dans le mot mais pas à la bonne place, le N est à la bonne place (position 6)</p>
              </div>
              
              {/* Tentative 2 */}
              <div className="bg-green-800/20 rounded-2xl p-6 border border-green-500/30">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <span className="text-green-400 font-bold text-lg">Tentative 2 :</span>
                  <span className="text-gray-300 text-lg">Vous tapez "CHIEN" (en utilisant les indices)</span>
                </div>
                <div className="flex gap-2 justify-center mb-4">
                  <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">C</div>
                  <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">H</div>
                  <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">I</div>
                  <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">E</div>
                  <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">N</div>
                </div>
                <p className="text-center text-green-400 font-semibold text-lg">🎉 Félicitations ! Vous avez trouvé le mot !</p>
              </div>
            </div>
          </div>
        </section>

        {/* Comment utiliser l'interface */}
        <section>
          <h2 className="text-2xl font-bold text-white text-center mb-12">Comment Utiliser l'Interface</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="bg-gradient-to-br from-indigo-600/20 to-indigo-800/20 backdrop-blur-sm border border-indigo-500/30 rounded-2xl p-8">
              <div className="text-center mb-6">
                <div className="text-4xl mb-4">💻</div>
                <h3 className="text-xl font-semibold text-indigo-400">Sur Ordinateur</h3>
              </div>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-start gap-3">
                  <span className="text-indigo-400 font-bold">•</span>
                  <span>Tapez directement sur votre clavier pour saisir les lettres</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-indigo-400 font-bold">•</span>
                  <span>Appuyez sur <strong className="text-indigo-300">Entrée</strong> pour valider votre mot</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-indigo-400 font-bold">•</span>
                  <span>Utilisez <strong className="text-indigo-300">Retour arrière</strong> pour effacer une lettre</span>
                </li>
              </ul>
            </div>
            <div className="bg-gradient-to-br from-indigo-600/20 to-indigo-800/20 backdrop-blur-sm border border-indigo-500/30 rounded-2xl p-8">
              <div className="text-center mb-6">
                <div className="text-4xl mb-4">📱</div>
                <h3 className="text-xl font-semibold text-indigo-400">Sur Mobile/Tablette</h3>
              </div>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-start gap-3">
                  <span className="text-indigo-400 font-bold">•</span>
                  <span>Utilisez le clavier virtuel affiché à l'écran</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-indigo-400 font-bold">•</span>
                  <span>Touchez les lettres pour les saisir</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-indigo-400 font-bold">•</span>
                  <span>Touchez <strong className="text-indigo-300">"Valider"</strong> pour soumettre votre mot</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-indigo-400 font-bold">•</span>
                  <span>Touchez <strong className="text-indigo-300">"Effacer"</strong> pour supprimer la dernière lettre</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Modes de jeu */}
        <section>
          <div className="flex items-center justify-center gap-3 mb-12">
            <Clock className="h-6 w-6 text-blue-400" />
            <h2 className="text-2xl font-bold text-white">Modes de Jeu du Sutom Game</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="group hover:scale-105 transition-transform duration-300">
              <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 backdrop-blur-sm border border-blue-500/30 rounded-2xl p-8 h-full">
                <div className="text-center mb-6">
                  <div className="text-4xl mb-4">📅</div>
                  <h3 className="text-xl font-semibold text-blue-400">Défi Quotidien</h3>
                </div>
                <p className="text-gray-300 leading-relaxed text-center">
                  Participez au défi quotidien du <strong className="text-blue-400">Sutom Game</strong> ! Un nouveau mot 
                  chaque jour à minuit. Comparez vos performances avec d'autres joueurs du 
                  <strong className="text-blue-400">Sutom Game</strong> dans le monde entier.
                </p>
              </div>
            </div>
            <div className="group hover:scale-105 transition-transform duration-300">
              <div className="bg-gradient-to-br from-green-600/20 to-green-800/20 backdrop-blur-sm border border-green-500/30 rounded-2xl p-8 h-full">
                <div className="text-center mb-6">
                  <div className="text-4xl mb-4">🎮</div>
                  <h3 className="text-xl font-semibold text-green-400">Mode Classique</h3>
                </div>
                <p className="text-gray-300 leading-relaxed text-center">
                  Jouez au <strong className="text-green-400">Sutom Game</strong> à votre rythme avec trois niveaux de difficulté : 
                  Facile (3-6 lettres), Moyen (6-10 lettres), et Difficile (10+ lettres). 
                  Perfectionnez vos compétences dans le <strong className="text-green-400">Sutom Game</strong> !
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Conseils stratégiques */}
        <section>
          <div className="flex items-center justify-center gap-3 mb-12">
            <Trophy className="h-6 w-6 text-yellow-400" />
            <h2 className="text-2xl font-bold text-white">Conseils pour Maîtriser le Sutom Game</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {STRATEGY_TIPS.map((tip) => (
              <div key={tip.number} className="bg-gradient-to-br from-yellow-600/20 to-yellow-800/20 backdrop-blur-sm border border-yellow-500/30 rounded-2xl p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold">{tip.number}</span>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-yellow-400 mb-2">{tip.title}</h4>
                    <p className="text-gray-300">{tip.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Questions fréquentes */}
        <section>
          <div className="flex items-center justify-center gap-3 mb-12">
            <HelpCircle className="h-6 w-6 text-blue-400" />
            <h2 className="text-2xl font-bold text-white">Questions Fréquentes des Débutants</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {FAQ_ITEMS.map((faq, index) => (
              <div key={index} className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 backdrop-blur-sm border border-blue-500/30 rounded-2xl p-6">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-sm">Q</span>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-blue-400 mb-2">{faq.question}</h4>
                    <p className="text-gray-300">{faq.answer}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Appel à l'action */}
        <section className="text-center">
          <div className="bg-gradient-to-br from-purple-600/20 to-blue-600/20 backdrop-blur-sm border border-purple-500/30 rounded-3xl p-8 max-w-3xl mx-auto">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                <span className="text-2xl">🎯</span>
              </div>
              <h2 className="text-2xl font-bold text-white">Prêt à Relever le Défi du Sutom Game ?</h2>
            </div>
            <p className="text-lg text-gray-300 mb-8 leading-relaxed">
              Maintenant que vous maîtrisez les règles, lancez-vous dans l'aventure du <strong className="text-purple-400">Sutom Game</strong> ! 
              Chaque partie est une nouvelle opportunité d'améliorer votre vocabulaire français.
            </p>
            <div className="flex justify-center">
               <button 
                 onClick={handleStartPlaying}
                 className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl font-semibold text-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105"
               >
                 Commencer à Jouer ! 🚀
               </button>
             </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export const HelpCenter = memo(HelpCenterComponent);