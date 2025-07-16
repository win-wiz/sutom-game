import { type Difficulty, type WordResponse } from '@/types/game';

// Données mock - mots de différentes difficultés
export const MOCK_WORDS = {
  easy: [
    'chat', 'chien', 'maison', 'eau', 'pain', 'lait', 'bleu', 'rouge', 'vert', 'noir',
    'blanc', 'grand', 'petit', 'bon', 'mal', 'vie', 'mort', 'ami', 'papa', 'maman',
    'bébé', 'jour', 'nuit', 'matin', 'soir', 'temps', 'beau', 'laid', 'haut', 'bas',
    'chaud', 'froid', 'sec', 'mouillé', 'dur', 'mou', 'gros', 'mince', 'long', 'court'
  ],
  medium: [
    'ordinateur', 'téléphone', 'voiture', 'jardin', 'cuisine', 'chambre', 'bureau', 'école',
    'hôpital', 'restaurant', 'cinéma', 'musique', 'danse', 'football', 'tennis', 'natation',
    'lecture', 'écriture', 'peinture', 'voyage', 'vacances', 'famille', 'travail', 'argent',
    'santé', 'bonheur', 'tristesse', 'colère', 'surprise', 'peur', 'amour', 'amitié',
    'liberté', 'justice', 'paix', 'guerre', 'histoire', 'géographie', 'mathématiques', 'science'
  ],
  hard: [
    'cacophonie', 'épiphénomène', 'parallélépipède', 'anticonstitutionnellement', 'chrysanthème',
    'pharmaceutique', 'psychologie', 'anthropologie', 'métamorphose', 'philosophie',
    'architecture', 'bureaucratie', 'démocratique', 'authentique', 'sympathique',
    'pathologique', 'chronologique', 'alphabétique', 'mathématique', 'informatique',
    'automatique', 'romantique', 'fantastique', 'dramatique', 'énigmatique',
    'problématique', 'systématique', 'pneumatique', 'acrobatique', 'diplomatique',
    'aristocratique', 'bureaucratique', 'démocratique', 'thérapeutique', 'dialectique'
  ]
};

class WordService {
  // Simuler le délai de l'API
  private async simulateApiDelay(): Promise<void> {
    const delay = Math.random() * 500 + 200; // Délai aléatoire de 200-700ms
    return new Promise(resolve => setTimeout(resolve, delay));
  }

  // Obtenir un mot aléatoire selon la difficulté
  async getWordByDifficulty(difficulty: Difficulty): Promise<WordResponse> {
    await this.simulateApiDelay();
    
    const words = MOCK_WORDS[difficulty];
    const randomIndex = Math.floor(Math.random() * words.length);
    const word = words[randomIndex]!;
    
    console.log(`🎯 Obtenir un mot de difficulté ${difficulty}: ${word}`);
    
    return {
      word,
      difficulty
    };
  }

  // Obtenir plusieurs mots en lot (utilisable pour le préchargement)
  async getWordsByDifficulty(difficulty: Difficulty, count = 5): Promise<WordResponse[]> {
    await this.simulateApiDelay();
    
    const words = MOCK_WORDS[difficulty];
    const shuffled = [...words].sort(() => Math.random() - 0.5);
    const selectedWords = shuffled.slice(0, Math.min(count, words.length));
    
    return selectedWords.map(word => ({
      word,
      difficulty
    }));
  }

  // Vérifier si le mot appartient à la difficulté spécifiée
  async validateWordDifficulty(word: string, expectedDifficulty: Difficulty): Promise<boolean> {
    await this.simulateApiDelay();
    
    const words = MOCK_WORDS[expectedDifficulty];
    return words.includes(word.toLowerCase());
  }

  // Obtenir les informations de tous les niveaux de difficulté disponibles
  getDifficultyLevels() {
    return [
      {
        level: 'easy' as Difficulty,
        name: 'Débutant',
        description: 'Mots courants de 3-6 lettres',
        color: 'text-green-400'
      },
      {
        level: 'medium' as Difficulty,
        name: 'Intermédiaire',
        description: 'Mots de difficulté moyenne de 6-10 lettres',
        color: 'text-yellow-400'
      },
      {
        level: 'hard' as Difficulty,
        name: 'Avancé',
        description: 'Mots complexes de 10+ lettres',
        color: 'text-red-400'
      }
    ];
  }

  // Obtenir tous les mots (pour le défi quotidien)
  getAllWords(): Array<{ word: string; difficulty: Difficulty }> {
    const allWords: Array<{ word: string; difficulty: Difficulty }> = [];
    
    // Ajouter tous les mots de toutes les difficultés
    for (const word of MOCK_WORDS.easy) {
      allWords.push({ word, difficulty: 'easy' });
    }
    for (const word of MOCK_WORDS.medium) {
      allWords.push({ word, difficulty: 'medium' });
    }
    for (const word of MOCK_WORDS.hard) {
      allWords.push({ word, difficulty: 'hard' });
    }
    
    return allWords;
  }

  // Obtenir les statistiques des niveaux de difficulté
  getDifficultyStats() {
    return {
      easy: { count: MOCK_WORDS.easy.length, avgLength: this.calculateAverageLength(MOCK_WORDS.easy) },
      medium: { count: MOCK_WORDS.medium.length, avgLength: this.calculateAverageLength(MOCK_WORDS.medium) },
      hard: { count: MOCK_WORDS.hard.length, avgLength: this.calculateAverageLength(MOCK_WORDS.hard) }
    };
  }

  private calculateAverageLength(words: string[]): number {
    const totalLength = words.reduce((sum, word) => sum + word.length, 0);
    return Math.round(totalLength / words.length);
  }
}

// Exporter l'instance singleton
export const wordService = new WordService();