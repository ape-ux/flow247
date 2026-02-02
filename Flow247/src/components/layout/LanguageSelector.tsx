import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'pt-BR', name: 'Português', flag: '🇧🇷' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
];

export function LanguageSelector() {
  const { i18n } = useTranslation();

  const currentLanguage = languages.find((lang) => lang.code === i18n.language) || languages[0];

  const handleLanguageChange = () => {
    const currentIndex = languages.findIndex((lang) => lang.code === i18n.language);
    const nextIndex = (currentIndex + 1) % languages.length;
    i18n.changeLanguage(languages[nextIndex].code);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleLanguageChange}
      className="gap-2"
    >
      <Globe className="h-4 w-4" />
      <span className="hidden sm:inline">{currentLanguage.flag} {currentLanguage.name}</span>
      <span className="sm:hidden">{currentLanguage.flag}</span>
    </Button>
  );
}

export function LanguageDropdown() {
  const { i18n } = useTranslation();

  return (
    <div className="flex gap-1">
      {languages.map((lang) => (
        <Button
          key={lang.code}
          variant={i18n.language === lang.code ? 'default' : 'ghost'}
          size="sm"
          onClick={() => i18n.changeLanguage(lang.code)}
          className="px-2"
        >
          {lang.flag}
        </Button>
      ))}
    </div>
  );
}
