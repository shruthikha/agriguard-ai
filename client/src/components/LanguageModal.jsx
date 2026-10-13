import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Check } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../i18n';

export default function LanguageModal({ isOpen, onClose }) {
  const { t, i18n } = useTranslation();

  if (!isOpen) return null;

  const handleSelectLanguage = (code) => {
    i18n.changeLanguage(code);
    localStorage.setItem('agriguard_has_chosen_lang', 'true');
    localStorage.setItem('i18nextLng', code);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-8 border border-agri-100">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-agri-100 text-agri-700 rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner">
            <Globe className="w-8 h-8" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            {t('chooseLanguage', 'Choose Your Language')}
          </h2>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">
            {t('chooseLanguageSub', 'Select your preferred regional language to use the application comfortably')}
          </p>
        </div>

        {/* 8 Regional Language Large Cards */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6">
          {SUPPORTED_LANGUAGES.map((lang) => {
            const isSelected = i18n.language === lang.code;
            return (
              <button
                key={lang.code}
                onClick={() => handleSelectLanguage(lang.code)}
                className={`relative flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-200 text-center ${
                  isSelected
                    ? 'border-agri-600 bg-agri-50 text-agri-900 shadow-md scale-[1.02]'
                    : 'border-gray-200 hover:border-agri-300 hover:bg-gray-50 text-gray-800'
                }`}
              >
                {isSelected && (
                  <span className="absolute top-2 right-2 w-5 h-5 bg-agri-600 text-white rounded-full flex items-center justify-center text-xs">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </span>
                )}
                <span className="text-2xl mb-1">{lang.flag}</span>
                <span className="text-lg font-bold text-gray-900 leading-tight">
                  {lang.native}
                </span>
                <span className="text-xs text-gray-500 font-medium mt-0.5">
                  {lang.name}
                </span>
              </button>
            );
          })}
        </div>

        <button
          onClick={onClose}
          className="w-full py-3.5 px-4 bg-agri-700 hover:bg-agri-800 text-white font-semibold rounded-2xl transition shadow-md hover:shadow-lg active:scale-[0.99]"
        >
          {t('continueBtn', 'Continue')}
        </button>
      </div>
    </div>
  );
}
