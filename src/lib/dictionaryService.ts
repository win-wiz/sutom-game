import { MOCK_WORDS } from './wordService';

// 词典验证结果接口
export interface DictionaryValidationResult {
  isValid: boolean;
  error?: string;
  source?: string;
  suggestion?: string;
}

export interface DictionaryProvider {
  name: string;
  validate: (word: string) => Promise<DictionaryValidationResult>;
}

// API 响应类型定义
interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

// 第三方 API 验证器 (使用 mock 数据)
class ThirdPartyValidator implements DictionaryProvider {
  name = 'ThirdParty';
  
  // Mock 词典数据
  private mockDictionary = new Set([
    // 基础词汇
    'bonjour', 'merci', 'oui', 'non', 'chat', 'chien', 'maison',
    // 中级词汇
    'ordinateur', 'téléphone', 'voiture', 'jardin', 'cuisine',
    // 高级词汇
    'cacophonie', 'épiphénomène', 'parallélépipède', 'anticonstitutionnellement',
    // 从 wordService.ts 导入的词汇
    ...Object.values(MOCK_WORDS).flat()
  ]);

  // 模拟 API 延迟
  private async simulateApiDelay(): Promise<void> {
    const delay = Math.random() * 300 + 100; // 100-400ms 随机延迟
    return new Promise(resolve => setTimeout(resolve, delay));
  }

  async validate(word: string): Promise<DictionaryValidationResult> {
    await this.simulateApiDelay();
    
    const isValid = this.mockDictionary.has(word.toLowerCase());
    
    return {
      isValid,
      source: 'ThirdParty',
      error: !isValid ? '单词未在第三方词典中找到' : undefined
    };
  }
}

// AI 验证器 (使用 OpenAI 或其他 AI 模型)
class AIValidator implements DictionaryProvider {
  name = 'AI';
  private apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;

  async validate(word: string): Promise<DictionaryValidationResult> {
    if (!this.apiKey) {
      throw new Error('AI API key not configured');
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'Tu es un expert en langue française. Tu dois valider si un mot donné est un mot français valide. Réponds uniquement par "VALIDE" ou "INVALIDE", suivi optionnellement d\'une suggestion si le mot est invalide.'
            },
            {
              role: 'user',
              content: `Le mot "${word}" est-il un mot français valide? Si non, peux-tu suggérer une correction?`
            }
          ],
          max_tokens: 50,
          temperature: 0.1
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json() as OpenAIResponse;
      const aiResponse = data.choices[0]?.message?.content?.trim() ?? '';
      
      const isValid = aiResponse.startsWith('VALIDE');
      const suggestion = aiResponse.includes('suggestion') ? 
        aiResponse.split('suggestion')[1]?.trim() : undefined;

      return {
        isValid,
        source: 'AI',
        suggestion,
        error: !isValid ? '单词被 AI 判定为无效' : undefined
      };
    } catch (error) {
      throw new Error(`AI validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// 本地基础词典验证器 (作为备选方案)
class LocalValidator implements DictionaryProvider {
  name = 'Local';
  
  // 基础法语词汇列表 (扩展版本)
  private commonWords = new Set([
    // 常用词汇
    'le', 'de', 'et', 'à', 'un', 'il', 'être', 'en', 'avoir', 'que', 'pour',
    'dans', 'ce', 'son', 'une', 'sur', 'avec', 'ne', 'se', 'pas', 'tout', 'plus',
    'par', 'grand', 'je', 'vous', 'la', 'tu', 'si', 'son', 'ce', 'dans',
    
    // 问候语
    'bonjour', 'bonsoir', 'bonne', 'nuit', 'salut', 'merci', 'oui', 'non',
    'au revoir', 'pardon', 'excusez', 'moi', 'comment', 'allez', 'vous',
    
    // 时间
    'jour', 'soir', 'matin', 'midi', 'temps', 'année', 'mois', 'semaine',
    'heure', 'minute', 'seconde', 'aujourd', 'hui', 'demain', 'hier',
    
    // 家庭
    'maison', 'famille', 'enfant', 'parent', 'ami', 'personne', 'homme', 'femme',
    'père', 'mère', 'fils', 'fille', 'frère', 'sœur', 'grand', 'père', 'mère',
    
    // 技术
    'téléphone', 'ordinateur', 'clavier', 'souris', 'écran', 'internet', 'site',
    'email', 'message', 'application', 'programme', 'fichier', 'dossier',
    
    // 游戏相关
    'cacophonie', 'jeu', 'jouer', 'gagner', 'perdre', 'essayer', 'deviner',
    'mot', 'lettre', 'alphabet', 'langue', 'français', 'dictionary',
    
    // 动词
    'faire', 'dire', 'aller', 'voir', 'savoir', 'prendre', 'venir', 'vouloir',
    'pouvoir', 'falloir', 'devoir', 'croire', 'trouver', 'donner', 'parler',
    'aimer', 'passer', 'regarder', 'demander', 'rester', 'sembler', 'laisser',
    
    // 形容词
    'bon', 'nouveau', 'premier', 'dernier', 'grand', 'petit', 'autre', 'même',
    'jeune', 'français', 'long', 'gros', 'fort', 'public', 'certain', 'social',
    
    // 颜色
    'rouge', 'bleu', 'vert', 'jaune', 'noir', 'blanc', 'rose', 'violet',
    'orange', 'gris', 'marron', 'beige',
    
    // 数字
    'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix',
    'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'vingt', 'cent', 'mille',
    
    // 其他常用词
    'eau', 'pain', 'lait', 'fromage', 'viande', 'légume', 'fruit', 'pomme',
    'orange', 'banane', 'tomate', 'carotte', 'patate', 'salade', 'soupe',
    'restaurant', 'hôtel', 'magasin', 'école', 'université', 'hôpital',
    'banque', 'poste', 'gare', 'aéroport', 'métro', 'bus', 'voiture',
    'train', 'avion', 'bateau', 'vélo', 'marcher', 'courir', 'nager'
  ]);

  async validate(word: string): Promise<DictionaryValidationResult> {
    const isValid = this.commonWords.has(word.toLowerCase());
    
    return {
      isValid,
      source: 'Local',
      error: !isValid ? '单词未在本地词典中找到' : undefined
    };
  }
}

// 主词典验证服务
export class DictionaryService {
  private validators: DictionaryProvider[] = [
    new ThirdPartyValidator(),
    new AIValidator(),
    new LocalValidator()
  ];

  async validateWord(word: string): Promise<DictionaryValidationResult> {
    const normalizedWord = word.toLowerCase().trim();
    
    if (!normalizedWord) {
      return {
        isValid: false,
        error: '单词不能为空'
      };
    }

    // 尝试每个验证器
    for (const validator of this.validators) {
      try {
        const result = await validator.validate(normalizedWord);
        if (result.isValid) {
          return result;
        }
      } catch (error) {
        console.warn(`${validator.name} validator failed:`, error);
        continue;
      }
    }

    // 如果所有验证器都失败了
    return {
      isValid: false,
      error: '无法验证单词的有效性，请稍后再试',
      source: 'None'
    };
  }

  // 批量验证单词
  async validateWords(words: string[]): Promise<DictionaryValidationResult[]> {
    const results: DictionaryValidationResult[] = [];
    
    for (const word of words) {
      const result = await this.validateWord(word);
      results.push(result);
    }
    
    return results;
  }
}

// 导出单例实例
export const dictionaryService = new DictionaryService(); 