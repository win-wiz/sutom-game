import { useMemo, useCallback } from 'react';
import { type DictionaryValidationResult } from '@/lib/dictionaryService';

interface ValidationStatusProps {
  isValidating: boolean;
  validationResult: DictionaryValidationResult | null;
  onClose: () => void;
}

export const ValidationStatus = ({ 
  isValidating, 
  validationResult, 
  onClose 
}: ValidationStatusProps) => {
  // Mémoriser les informations de validation pour éviter les recalculs
  const validationInfo = useMemo(() => {
    if (!validationResult) return null;
    
    return {
      isValid: validationResult.isValid,
      iconClass: validationResult.isValid ? 'text-green-600' : 'text-red-600',
      bgClass: validationResult.isValid ? 'bg-green-100' : 'bg-red-100',
      titleClass: validationResult.isValid ? 'text-green-800' : 'text-red-800',
      buttonClass: validationResult.isValid 
        ? 'bg-green-600 hover:bg-green-700 text-white'
        : 'bg-red-600 hover:bg-red-700 text-white',
      title: validationResult.isValid ? '✅ Validation du mot réussie' : '❌ Échec de la validation du mot',
      message: validationResult.isValid 
        ? `Mot validé par ${validationResult.source}` 
        : validationResult.error,
      buttonText: validationResult.isValid ? 'Continuer le jeu' : 'Ressaisir'
    };
  }, [validationResult]);

  // Optimiser le gestionnaire d'événement avec useCallback
  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  if (!isValidating && !validationResult) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        {isValidating && (
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Validation du mot en cours...</h3>
            <p className="text-gray-600">Veuillez patienter, vérification du dictionnaire...</p>
          </div>
        )}
        
        {validationResult && validationInfo && (
          <div className="text-center">
            <div className="mb-4">
              <div className={`inline-flex items-center justify-center w-16 h-16 ${validationInfo.bgClass} rounded-full mb-4`}>
                <svg className={`w-8 h-8 ${validationInfo.iconClass}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {validationInfo.isValid ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  )}
                </svg>
              </div>
            </div>
            
            <h3 className={`text-lg font-semibold mb-2 ${validationInfo.titleClass}`}>
              {validationInfo.title}
            </h3>
            
            <p className="text-gray-600 mb-4">
              {validationInfo.message}
            </p>
            
            {validationResult.suggestion && (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
                <p className="text-sm text-blue-800">
                  <strong>Suggestion :</strong> {validationResult.suggestion}
                </p>
              </div>
            )}
            
            <button
              onClick={handleClose}
              className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${validationInfo.buttonClass}`}
            >
              {validationInfo.buttonText}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};