export const getLocalizedTier = (tier: string, lang: string): string => {
  if (!tier) return "";

  const lowerTier = tier.toLowerCase();

  const translations: Record<string, { am: string; ao: string; [key: string]: string }> = {
    bronze: {
      am: "ነሐስ",
      ao: "Nahasa",
    },
    silver: {
      am: "ብር",
      ao: "Meetii",
    },
    gold: {
      am: "ወርቅ",
      ao: "Warqee",
    },
    platinum: {
      am: "ፕላቲነም",
      ao: "Pilaatiinamii",
    },
    diamond: {
      am: "አልማዝ",
      ao: "Daayimandii",
    },
    ruby: {
      am: "ሩቢ",
      ao: "Ruubii",
    },
    sapphire: {
      am: "ሳፋየር",
      ao: "Saafaayerii",
    },
    amethyst: {
      am: "አሜቲስት",
      ao: "Ameetistii",
    },
    pearl: {
      am: "ዕንቁ",
      ao: "Inquu",
    },
    obsidian: {
      am: "የእሳተ ገሞራ ድንጋይ",
      ao: "Obsiidiyaan",
    },
    emerald: {
      am: "ኤመራልድ",
      ao: "Eemeraaldii",
    },
  };

  if (translations[lowerTier] && translations[lowerTier][lang]) {
    return translations[lowerTier][lang];
  }

  return tier; 
};