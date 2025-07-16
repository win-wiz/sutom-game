import { MOCK_WORDS } from './wordService';

// Interface de résultat de validation du dictionnaire
export interface DictionaryValidationResult {
  isValid: boolean;
  error?: string;
  source?: string;
  suggestion?: string;
  message?: string;
  [key: string]: unknown;
}

export interface DictionaryProvider {
  name: string;
  validate: (word: string) => Promise<DictionaryValidationResult>;
}

// Définition du type de réponse API
interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

// Validateur API tiers (utilisant des données mock)
class ThirdPartyValidator implements DictionaryProvider {
  name = 'ThirdParty';
  
  // Données de dictionnaire mock
  private mockDictionary = new Set([
    // Vocabulaire de base
    'bonjour', 'merci', 'oui', 'non', 'chat', 'chien', 'maison',
    // Vocabulaire intermédiaire
    'ordinateur', 'téléphone', 'voiture', 'jardin', 'cuisine',
    // Vocabulaire avancé
    'cacophonie', 'épiphénomène', 'parallélépipède', 'anticonstitutionnellement',
    // Vocabulaire importé de wordService.ts
    ...Object.values(MOCK_WORDS).flat()
  ]);

  // Simuler le délai de l'API
  private async simulateApiDelay(): Promise<void> {
    const delay = Math.random() * 300 + 100; // Délai aléatoire de 100-400ms
    return new Promise(resolve => setTimeout(resolve, delay));
  }

  async validate(word: string): Promise<DictionaryValidationResult> {
    await this.simulateApiDelay();
    
    const isValid = this.mockDictionary.has(word.toLowerCase());
    
    return {
      isValid,
      message: isValid ? 'Mot valide' : 'Mot non trouvé dans le dictionnaire tiers',
      source: 'ThirdParty',
      error: !isValid ? 'Mot non trouvé dans le dictionnaire tiers' : undefined
    };
  }
}

// Validateur IA (utilisant OpenAI ou d'autres modèles IA)
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
        message: isValid ? 'Mot valide' : 'Mot jugé invalide par l\'IA',
        source: 'AI',
        suggestion,
        error: !isValid ? 'Mot jugé invalide par l\'IA' : undefined
      };
    } catch (error) {
      throw new Error(`AI validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Validateur de dictionnaire local de base (comme solution de repli)
class LocalValidator implements DictionaryProvider {
  name = 'Local';
  
  // Liste de vocabulaire français de base (version étendue)
  private commonWords = new Set([
    // Vocabulaire courant
    'le', 'de', 'et', 'à', 'un', 'il', 'être', 'en', 'avoir', 'que', 'pour',
    'dans', 'ce', 'son', 'une', 'sur', 'avec', 'ne', 'se', 'pas', 'tout', 'plus',
    'par', 'grand', 'je', 'vous', 'la', 'tu', 'si', 'son', 'ce', 'dans',
    
    // Salutations
    'bonjour', 'bonsoir', 'bonne', 'nuit', 'salut', 'merci', 'oui', 'non',
    'au revoir', 'pardon', 'excusez', 'moi', 'comment', 'allez', 'vous',
    
    // Temps
    'jour', 'soir', 'matin', 'midi', 'temps', 'année', 'mois', 'semaine',
    'heure', 'minute', 'seconde', 'aujourd', 'hui', 'demain', 'hier',
    
    // Famille
    'maison', 'famille', 'enfant', 'parent', 'ami', 'personne', 'homme', 'femme',
    'père', 'mère', 'fils', 'fille', 'frère', 'sœur', 'grand', 'père', 'mère',
    
    // Technologie
    'téléphone', 'ordinateur', 'clavier', 'souris', 'écran', 'internet', 'site',
    'email', 'message', 'application', 'programme', 'fichier', 'dossier',
    
    // Lié au jeu
    'cacophonie', 'jeu', 'jouer', 'gagner', 'perdre', 'essayer', 'deviner',
    'mot', 'lettre', 'alphabet', 'langue', 'français', 'dictionary',
    
    // Verbes
    'faire', 'dire', 'aller', 'voir', 'savoir', 'prendre', 'venir', 'vouloir',
    'pouvoir', 'falloir', 'devoir', 'croire', 'trouver', 'donner', 'parler',
    'aimer', 'passer', 'regarder', 'demander', 'rester', 'sembler', 'laisser',
    
    // Adjectifs
    'bon', 'nouveau', 'premier', 'dernier', 'grand', 'petit', 'autre', 'même',
    'jeune', 'français', 'long', 'gros', 'fort', 'public', 'certain', 'social',
    
    // Couleurs
    'rouge', 'bleu', 'vert', 'jaune', 'noir', 'blanc', 'rose', 'violet',
    'orange', 'gris', 'marron', 'beige',
    
    // Nombres
    'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix',
    'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'vingt', 'cent', 'mille',
    
    // Autres mots courants
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
      message: isValid ? 'Mot valide' : 'Mot non trouvé dans le dictionnaire',
      source: 'Local',
      error: !isValid ? 'Mot non trouvé dans le dictionnaire local' : undefined
    };
  }
}

// Service principal de validation du dictionnaire
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
        message: 'Le mot ne peut pas être vide',
        error: 'Le mot ne peut pas être vide'
      };
    }

    // Essayer chaque validateur
    for (const validator of this.validators) {
      try {
        const result = await validator.validate(normalizedWord);
        if (result.isValid) {
          return {
            ...result,
            message: result.message ?? 'Mot valide'
          };
        }
      } catch (error) {
        console.warn(`${validator.name} validator failed:`, error);
        continue;
      }
    }

    // Si tous les validateurs ont échoué
    return {
      isValid: false,
      message: 'Impossible de vérifier la validité du mot, veuillez réessayer plus tard',
      error: 'Impossible de vérifier la validité du mot, veuillez réessayer plus tard',
      source: 'None'
    };
  }

  // Validation en lot des mots
  async validateWords(words: string[]): Promise<DictionaryValidationResult[]> {
    const results: DictionaryValidationResult[] = [];
    
    for (const word of words) {
      const result = await this.validateWord(word);
      results.push(result);
    }
    
    return results;
  }
}

// Exporter l'instance singleton
export const dictionaryService = new DictionaryService();