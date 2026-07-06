"use client";

import { useAppStore } from "@/store/useAppStore";

export type LanguageCode = "en" | "mr" | "hi";

type Translations = {
  [key in LanguageCode]: {
    [key: string]: string;
  };
};

export const translations: Translations = {
  en: {
    // Nav
    "nav.home": "Home",
    "nav.scan": "Scan",
    "nav.settings": "Settings",
    "nav.profile": "Profile",
    
    // Home
    "home.waterGoal": "Water Goal",
    "home.tapToDrink": "Tap to drink",
    "home.vitamins": "Vitamins",
    "home.takenToday": "Taken today",
    "home.notTaken": "Not taken",
    "home.searchFood": "Search any food...",
    "home.recommended": "Recommended",
    "home.bestForWeek": "Best for Week",
    "home.seeAll": "See all →",
    
    // Categories
    "cat.Veggies": "Veggies",
    "cat.Dairy": "Dairy",
    "cat.Vitamins": "Vitamins",
    "cat.Fruits": "Fruits",
    
    // Settings
    "settings.title": "Settings",
    "settings.language": "Language",
    "settings.logout": "Log out",
    "settings.changeLanguage": "Change Language",
    
    // Scan
    "scan.title": "Scan Product",
    "scan.subtitle": "Tap camera or enter label details",
    "scan.recent": "Recent Scans",
    "scan.analyze": "Analyzing nutritional profile...",
    "scan.safe": "SAFE",
    "scan.caution": "CONSUME WITH CAUTION",
    "scan.avoid": "AVOID DURING PREGNANCY",
    "scan.safeLabel": "SAFE TO EAT",
    "scan.safeSub": "Safe to consume during pregnancy 🌟",
    "scan.cautionLabel": "EAT IN MODERATION",
    "scan.cautionSub": "Enjoy in moderation — ask your doctor 💛",
    "scan.avoidLabel": "NOT RECOMMENDED",
    "scan.avoidSub": "Not recommended for expecting mothers 🚫",
    
    // Onboarding
    "onboarding.chooseLanguage": "Choose your preferred language",
    "onboarding.next": "Continue",
    "onboarding.back": "Back",
  },
  mr: {
    "nav.home": "मुख्यपृष्ठ",
    "nav.scan": "स्कॅन करा",
    "nav.settings": "सेटिंग्ज",
    "nav.profile": "प्रोफाइल",
    
    "home.waterGoal": "पाण्याचे ध्येय",
    "home.tapToDrink": "पिण्यासाठी टॅप करा",
    "home.vitamins": "जीवनसत्त्वे",
    "home.takenToday": "आज घेतले",
    "home.notTaken": "घेतले नाही",
    "home.searchFood": "कोणताही अन्नपदार्थ शोधा...",
    "home.recommended": "शिफारस केलेले",
    "home.bestForWeek": "आठवड्यासाठी सर्वोत्तम",
    "home.seeAll": "सर्व पहा →",
    
    "cat.Veggies": "भाज्या",
    "cat.Dairy": "दुग्धजन्य",
    "cat.Vitamins": "जीवनसत्त्वे",
    "cat.Fruits": "फळे",
    
    "settings.title": "सेटिंग्ज",
    "settings.language": "भाषा (Language)",
    "settings.logout": "लॉग आउट करा",
    "settings.changeLanguage": "भाषा बदला",
    
    "scan.title": "उत्पादन स्कॅन करा",
    "scan.subtitle": "कॅमेरा टॅप करा किंवा लेबल प्रविष्ट करा",
    "scan.recent": "अलीकडील स्कॅन",
    "scan.analyze": "पौष्टिक प्रोफाइलचे विश्लेषण करत आहे...",
    "scan.safe": "सुरक्षित",
    "scan.caution": "सावधगिरीने सेवन करा",
    "scan.avoid": "गरोदरपणात टाळा",
    "scan.safeLabel": "खाण्यास सुरक्षित",
    "scan.safeSub": "गरोदरपणात सेवन करण्यास सुरक्षित 🌟",
    "scan.cautionLabel": "प्रमाणात खा",
    "scan.cautionSub": "प्रमाणात आनंद घ्या — तुमच्या डॉक्टरांना विचारा 💛",
    "scan.avoidLabel": "शिफारस केलेली नाही",
    "scan.avoidSub": "गरोदर मातांसाठी शिफारस केलेली नाही 🚫",
    
    "onboarding.chooseLanguage": "तुमची पसंतीची भाषा निवडा",
    "onboarding.next": "पुढे जा",
    "onboarding.back": "मागे",
  },
  hi: {
    "nav.home": "होम",
    "nav.scan": "स्कैन",
    "nav.settings": "सेटिंग्स",
    "nav.profile": "प्रोफ़ाइल",
    
    "home.waterGoal": "पानी का लक्ष्य",
    "home.tapToDrink": "पीने के लिए टैप करें",
    "home.vitamins": "विटामिन",
    "home.takenToday": "आज लिया गया",
    "home.notTaken": "नहीं लिया",
    "home.searchFood": "कोई भी खाना खोजें...",
    "home.recommended": "सुझाए गए",
    "home.bestForWeek": "सप्ताह के लिए सर्वश्रेष्ठ",
    "home.seeAll": "सभी देखें →",
    
    "cat.Veggies": "सब्जियां",
    "cat.Dairy": "डेयरी",
    "cat.Vitamins": "विटामिन",
    "cat.Fruits": "फल",
    
    "settings.title": "सेटिंग्स",
    "settings.language": "भाषा (Language)",
    "settings.logout": "लॉग आउट करें",
    "settings.changeLanguage": "भाषा बदलें",
    
    "scan.title": "उत्पाद स्कैन करें",
    "scan.subtitle": "कैमरा टैप करें या लेबल दर्ज करें",
    "scan.recent": "हाल के स्कैन",
    "scan.analyze": "पोषण प्रोफ़ाइल का विश्लेषण कर रहा है...",
    "scan.safe": "सुरक्षित",
    "scan.caution": "सावधानी के साथ सेवन करें",
    "scan.avoid": "गर्भावस्था में बचें",
    "scan.safeLabel": "खाने के लिए सुरक्षित",
    "scan.safeSub": "गर्भावस्था के दौरान सेवन करने के लिए सुरक्षित 🌟",
    "scan.cautionLabel": "संयम में खाएं",
    "scan.cautionSub": "संयम से आनंद लें — अपने डॉक्टर से पूछें 💛",
    "scan.avoidLabel": "अनुशंसित नहीं",
    "scan.avoidSub": "गर्भवती माताओं के लिए अनुशंसित नहीं है 🚫",
    
    "onboarding.chooseLanguage": "अपनी पसंदीदा भाषा चुनें",
    "onboarding.next": "आगे बढ़ें",
    "onboarding.back": "पीछे",
  }
};

export function getTranslation(key: string, lang: LanguageCode = "en"): string {
  if (translations[lang] && translations[lang][key]) {
    return translations[lang][key];
  }
  // Fallback to English
  if (translations["en"][key]) {
    return translations["en"][key];
  }
  return key; // return key if completely missing
}

export function useTranslation() {
  const language = useAppStore(state => state.language) || "en";
  
  const t = (key: string) => {
    return getTranslation(key, language as LanguageCode);
  };
  
  return { t, language: language as LanguageCode };
}
