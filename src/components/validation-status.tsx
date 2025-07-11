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
  if (!isValidating && !validationResult) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        {isValidating && (
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">正在验证单词...</h3>
            <p className="text-gray-600">请稍等，正在检查词典...</p>
          </div>
        )}
        
        {validationResult && (
          <div className="text-center">
            <div className="mb-4">
              {validationResult.isValid ? (
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
              ) : (
                <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </div>
              )}
            </div>
            
            <h3 className={`text-lg font-semibold mb-2 ${
              validationResult.isValid ? 'text-green-800' : 'text-red-800'
            }`}>
              {validationResult.isValid ? '✅ 单词验证成功' : '❌ 单词验证失败'}
            </h3>
            
            <p className="text-gray-600 mb-4">
              {validationResult.isValid 
                ? `单词已通过 ${validationResult.source} 验证` 
                : validationResult.error
              }
            </p>
            
            {validationResult.suggestion && (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
                <p className="text-sm text-blue-800">
                  <strong>建议：</strong> {validationResult.suggestion}
                </p>
              </div>
            )}
            
            <button
              onClick={onClose}
              className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
                validationResult.isValid
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
            >
              {validationResult.isValid ? '继续游戏' : '重新输入'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}; 