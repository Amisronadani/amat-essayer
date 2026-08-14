import fr from './fr';
import ki from './ki';
import { useLanguage } from '../context/LanguageContext';

const dictionaries = {
  fr,
  ki,
};

/**
 * Fonction de traduction avec support de fallback.
 * Supporte : t('clé'), t('clé', 'texte par défaut'), t('clé', { defaultValue: 'texte' })
 */
export const t = (key, fallbackOrOptions, lang = 'fr') => {
  const dictionary = dictionaries[lang] || dictionaries['fr'];
  const result = dictionary[key] || dictionaries['fr'][key];

  if (result) return result;

  // Support du fallback string ou objet { defaultValue: '...' }
  if (typeof fallbackOrOptions === 'string') return fallbackOrOptions;
  if (typeof fallbackOrOptions === 'object' && fallbackOrOptions?.defaultValue) return fallbackOrOptions.defaultValue;

  return key;
};

export const useTranslation = () => {
  const { langue } = useLanguage();
  return {
    t: (key, fallbackOrOptions) => t(key, fallbackOrOptions, langue),
  };
};
