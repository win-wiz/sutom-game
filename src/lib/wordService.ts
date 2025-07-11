import { type Difficulty, type WordResponse } from '@/types/game';

// Mock数据 - 不同难度的单词
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
  // 模拟API延迟
  private async simulateApiDelay(): Promise<void> {
    const delay = Math.random() * 500 + 200; // 200-700ms 随机延迟
    return new Promise(resolve => setTimeout(resolve, delay));
  }

  // 根据难度获取随机单词
  async getWordByDifficulty(difficulty: Difficulty): Promise<WordResponse> {
    await this.simulateApiDelay();
    
    const words = MOCK_WORDS[difficulty];
    const randomIndex = Math.floor(Math.random() * words.length);
    const word = words[randomIndex]!;
    
    console.log(`🎯 从${difficulty}难度获取单词: ${word}`);
    
    return {
      word,
      difficulty
    };
  }

  // 批量获取多个单词（可用于预加载）
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

  // 验证单词是否属于指定难度
  async validateWordDifficulty(word: string, expectedDifficulty: Difficulty): Promise<boolean> {
    await this.simulateApiDelay();
    
    const words = MOCK_WORDS[expectedDifficulty];
    return words.includes(word.toLowerCase());
  }

  // 获取所有可用的难度级别信息
  getDifficultyLevels() {
    return [
      {
        level: 'easy' as Difficulty,
        name: '初级',
        description: '3-6个字母的常用单词',
        color: 'text-green-400'
      },
      {
        level: 'medium' as Difficulty,
        name: '中级',
        description: '6-10个字母的中等难度单词',
        color: 'text-yellow-400'
      },
      {
        level: 'hard' as Difficulty,
        name: '高级',
        description: '10+个字母的复杂单词',
        color: 'text-red-400'
      }
    ];
  }

  // 获取所有单词（用于每日挑战）
  getAllWords(): Array<{ word: string; difficulty: Difficulty }> {
    const allWords: Array<{ word: string; difficulty: Difficulty }> = [];
    
    // 添加所有难度的单词
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

  // 获取难度级别统计信息
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

// 导出单例实例
export const wordService = new WordService(); 