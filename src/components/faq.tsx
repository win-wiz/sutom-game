'use client';

import { memo, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronDown, ChevronUp, MessageCircleQuestion, Search, Tag, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  tags: string[];
}

const faqData: FAQItem[] = [
  {
    id: 'what-is-sutom',
    question: 'Qu\'est-ce que le Sutom Game exactement ?',
    answer: 'Le Sutom Game est un jeu de devinettes de mots français inspiré du célèbre Wordle. Dans le Sutom Game, vous devez deviner un mot mystère en 6 tentatives maximum. Chaque tentative vous donne des indices colorés pour vous rapprocher de la solution dans ce passionnant Sutom Game.',
    category: 'Général',
    tags: ['jeu', 'wordle', 'français']
  },
  {
    id: 'how-to-play',
    question: 'Comment commencer à jouer au Sutom Game ?',
    answer: 'Pour jouer au Sutom Game, choisissez d\'abord votre mode : Défi Quotidien ou Mode Classique. Dans le Sutom Game, tapez simplement votre première tentative de mot français. Le système du Sutom Game vous donnera des indices colorés pour vous guider vers la bonne réponse.',
    category: 'Gameplay',
    tags: ['débutant', 'mode', 'jouer']
  },
  {
    id: 'daily-challenge',
    question: 'À quelle heure le défi quotidien du Sutom Game se renouvelle-t-il ?',
    answer: 'Le défi quotidien du Sutom Game se renouvelle chaque jour à minuit (00h00) heure française. Tous les joueurs du Sutom Game dans le monde entier jouent avec le même mot du jour, ce qui permet de comparer les performances dans le Sutom Game.',
    category: 'Défi Quotidien',
    tags: ['quotidien', 'horaire', 'renouvellement']
  },
  {
    id: 'difficulty-levels',
    question: 'Quels sont les niveaux de difficulté disponibles dans le Sutom Game ?',
    answer: 'Le Sutom Game propose trois niveaux de difficulté : Facile (mots de 4-5 lettres), Moyen (mots de 6-7 lettres), et Difficile (mots de 8 lettres ou plus). Chaque niveau du Sutom Game offre un défi adapté à votre niveau de maîtrise du français.',
    category: 'Gameplay',
    tags: ['difficulté', 'niveaux', 'lettres']
  },
  {
    id: 'color-meaning',
    question: 'Que signifient les couleurs dans le Sutom Game ?',
    answer: 'Dans le Sutom Game, les couleurs ont des significations précises : Rouge = lettre correcte à la bonne position, Jaune = lettre correcte mais mal placée, Gris = lettre absente du mot. Ces indices colorés sont essentiels pour réussir dans le Sutom Game.',
    category: 'Gameplay',
    tags: ['couleurs', 'indices', 'règles']
  },
  {
    id: 'valid-words',
    question: 'Quels mots sont acceptés dans le Sutom Game ?',
    answer: 'Le Sutom Game accepte uniquement les mots français valides présents dans notre dictionnaire. Les noms propres, abréviations et mots étrangers ne sont pas acceptés dans le Sutom Game. Tous les mots du Sutom Game sont des mots communs de la langue française.',
    category: 'Règles',
    tags: ['mots', 'dictionnaire', 'validation']
  },
  {
    id: 'statistics',
    question: 'Comment sont calculées les statistiques du Sutom Game ?',
    answer: 'Les statistiques du Sutom Game incluent votre taux de réussite, le nombre moyen de tentatives, et votre série de victoires consécutives. Ces données du Sutom Game sont sauvegardées localement sur votre appareil et vous permettent de suivre vos progrès dans le Sutom Game.',
    category: 'Statistiques',
    tags: ['stats', 'progression', 'données']
  },
  {
    id: 'mobile-support',
    question: 'Le Sutom Game fonctionne-t-il sur mobile ?',
    answer: 'Oui ! Le Sutom Game est entièrement optimisé pour les appareils mobiles. Vous pouvez jouer au Sutom Game sur votre smartphone ou tablette avec la même expérience fluide que sur ordinateur. Le Sutom Game s\'adapte parfaitement à tous les écrans.',
    category: 'Technique',
    tags: ['mobile', 'responsive', 'compatibilité']
  },
  {
    id: 'hints-strategy',
    question: 'Existe-t-il des stratégies pour améliorer ses performances au Sutom Game ?',
    answer: 'Absolument ! Pour exceller au Sutom Game, commencez par des mots riches en voyelles, utilisez les consonnes fréquentes, et analysez soigneusement les indices colorés. La pratique régulière du Sutom Game vous aidera à développer votre intuition et améliorer vos résultats.',
    category: 'Stratégie',
    tags: ['conseils', 'amélioration', 'tactiques']
  },
  {
    id: 'technical-issues',
    question: 'Que faire si je rencontre des problèmes techniques avec le Sutom Game ?',
    answer: 'Si vous rencontrez des difficultés avec le Sutom Game, essayez d\'abord de rafraîchir la page. La plupart des problèmes du Sutom Game se résolvent ainsi. Assurez-vous également que votre navigateur est à jour pour une expérience optimale du Sutom Game.',
    category: 'Technique',
    tags: ['problèmes', 'dépannage', 'support']
  }
];

const FAQComponent = () => {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Tous');

  const categories = useMemo(() => {
    const cats = Array.from(new Set(faqData.map(item => item.category)));
    return ['Tous', ...cats];
  }, []);

  const filteredData = useMemo(() => {
    return faqData.filter(item => {
      const matchesSearch = item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = selectedCategory === 'Tous' || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory]);

  const toggleItem = (id: string) => {
    setOpenItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
      {/* Stunning Header */}
      <div className="relative bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900 p-6 border-b border-gray-600">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_70%)]" />
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-gradient-to-br from-blue-600/30 to-purple-600/30 rounded-xl border border-blue-500/40 backdrop-blur-sm">
              <MessageCircleQuestion className="h-7 w-7 text-blue-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                Centre d'Aide Sutom Game
              </h2>
              <p className="text-gray-400 text-sm mt-1">Explorez nos réponses détaillées et conseils d'experts</p>
            </div>
          </div>
          
          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher dans la FAQ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
            />
          </div>
          
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-medium transition-all duration-200",
                  selectedCategory === category
                    ? "bg-blue-600/30 text-blue-300 border border-blue-500/50"
                    : "bg-gray-700/50 text-gray-400 border border-gray-600/50 hover:bg-gray-600/50 hover:text-gray-300"
                )}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ Items */}
      <div className="p-6 space-y-4">
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="h-5 w-5 text-yellow-400" />
          <span className="text-white font-semibold">Questions Fréquentes ({filteredData.length})</span>
        </div>
        
        {filteredData.map((item, index) => {
          const isOpen = openItems.has(item.id);
          return (
            <div
              key={item.id}
              className="bg-gray-700/30 border border-gray-600/50 rounded-lg overflow-hidden transition-all duration-300 hover:border-gray-500/70"
            >
              <button
                onClick={() => toggleItem(item.id)}
                className="w-full p-4 text-left flex items-center justify-between group hover:bg-gray-600/20 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-600/30 to-purple-600/30 rounded-lg flex items-center justify-center border border-blue-500/40">
                    <span className="text-blue-300 font-bold text-sm">{index + 1}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-medium text-base group-hover:text-blue-300 transition-colors">
                      {item.question}
                    </h3>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="px-2 py-1 bg-blue-600/20 text-blue-300 rounded-full text-xs font-medium border border-blue-500/30">
                        {item.category}
                      </span>
                      <div className="flex gap-1">
                        {item.tags.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-600/30 text-gray-400 rounded text-xs"
                          >
                            <Tag className="h-3 w-3" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex-shrink-0 ml-4">
                  {isOpen ? (
                    <ChevronUp className="h-5 w-5 text-gray-400 group-hover:text-blue-300 transition-colors" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400 group-hover:text-blue-300 transition-colors" />
                  )}
                </div>
              </button>
              
              {isOpen && (
                <div className="border-t border-gray-600/50 bg-gray-800/30">
                  <div className="p-6">
                    <div className="prose prose-invert max-w-none">
                      <p className="text-gray-300 leading-relaxed">
                        {item.answer}
                      </p>
                    </div>
                    
                    {/* All Tags */}
                    <div className="flex flex-wrap gap-2 mt-4">
                      {item.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600/20 text-blue-300 rounded-full text-sm border border-blue-500/30"
                        >
                          <Tag className="h-3 w-3" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        
        {/* Call-to-Action */}
        <div className="mt-8 relative overflow-hidden rounded-xl bg-gradient-to-br from-green-600/15 via-blue-600/15 to-purple-600/15 border border-green-500/30 p-6">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-r from-green-400/5 to-blue-400/5 animate-pulse" />
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500/50 via-blue-500/50 to-purple-500/50" />
          </div>
          <div className="relative z-10 text-center">
            <div className="inline-flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4 text-yellow-400 animate-pulse" />
              <span className="text-green-400 font-semibold text-sm uppercase tracking-wide">Conseil d'Expert</span>
              <Sparkles className="h-4 w-4 text-yellow-400 animate-pulse" style={{animationDelay: '0.5s'}} />
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              Vous avez trouvé les réponses que vous cherchiez ? Commencez à jouer au <strong className="text-green-400">Sutom Game</strong> et mettez vos connaissances en pratique !
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export const FAQ = memo(FAQComponent);