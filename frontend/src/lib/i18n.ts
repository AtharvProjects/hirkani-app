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
    "cat.Proteins": "Proteins",
    
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

    // New additions
    "home.greeting.morning": "GOOD MORNING",
    "home.greeting.afternoon": "GOOD AFTERNOON",
    "home.greeting.evening": "GOOD EVENING",
    "home.hydrationTitle": "Hydration Target",
    "home.hydrationDesc": "Drink at least 8-10 glasses of water today. Proper hydration is critical to support your baby's amniotic fluid levels.",
    "home.checkCravings": "Check your cravings",
    "home.allergiesWarningTitle": "⚠️ Your scans can't detect allergens yet",
    "home.allergiesWarningDesc": "Without your allergy & condition info, we can't warn you about dairy, nuts, gluten, or medication interactions.",
    "home.completeProfile": "Complete My Profile",
    "home.illRiskIt": "I'll risk it",
    "home.streakWarningTitle": "Your streak is at risk!",
    "home.streakWarningDesc": "You've been consistent. Scan any food to keep it alive.",
    "home.scanNow": "Scan Now",
    "home.letStreakReset": "Let my streak reset",
    "home.pregnancyBenefit": "Pregnancy Benefit",
    "home.detailedSafetyReasons": "Detailed Safety Reasons",
    "home.scanFullSafetyProfile": "Scan Full Safety Profile",
    "home.quickSearches": "Quick Searches",
    "home.findingSuggestions": "Finding suggestions...",
    "home.analyzingWithAI": "Analysing with AI...",
    "home.checkingSafety": "Checking pregnancy safety 🌸",
    "home.couldNotIdentify": "Couldn't identify that food",
    "home.tryAgain": "Try Again",
    "home.pregnancyFoodsList": "Pregnancy Foods List",
    "home.clearedItems": "Cleared items for trimester & conditions",
    "home.searchClearedFoods": "Search cleared foods...",
    "home.safeToConsume": "SAFE TO CONSUME",
    "home.consumeInModeration": "CONSUME IN MODERATION",
    "home.cautionLabelShort": "CAUTION",
    "home.safeLabelShort": "SAFE"
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
    "cat.Proteins": "प्रथिने (Proteins)",
    
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

    "home.greeting.morning": "शुभ सकाळ",
    "home.greeting.afternoon": "शुभ दुपार",
    "home.greeting.evening": "शुभ संध्याकाळ",
    "home.hydrationTitle": "पाण्याचे ध्येय",
    "home.hydrationDesc": "आज किमान ८-१० ग्लास पाणी प्या. बाळच्या अ‍ॅम्नियोटिक द्रवाची पातळी टिकवण्यासाठी योग्य हायड्रेशन आवश्यक आहे.",
    "home.checkCravings": "तुमची लालसा तपासा",
    "home.allergiesWarningTitle": "⚠️ तुमचे स्कॅन अद्याप ॲलर्जी शोधू शकत नाहीत",
    "home.allergiesWarningDesc": "तुमच्या ॲलर्जी आणि आजाराच्या माहितीशिवाय, आम्ही डेअरी, काजू, ग्लूटेन किंवा औषधांच्या परस्परसंवादांबद्दल चेतावणी देऊ शकत नाही.",
    "home.completeProfile": "प्रोफाइल पूर्ण करा",
    "home.illRiskIt": "मी जोखीम घेईन",
    "home.streakWarningTitle": "तुमची स्ट्रीक धोक्यात आहे!",
    "home.streakWarningDesc": "तुम्ही सातत्यपूर्ण आहात. ती जिवंत ठेवण्यासाठी कोणत्याही अन्नाचे स्कॅन करा.",
    "home.scanNow": "आता स्कॅन करा",
    "home.letStreakReset": "माझी स्ट्रीक रीसेट होऊ द्या",
    "home.pregnancyBenefit": "गरोदरपणातील फायदा",
    "home.detailedSafetyReasons": "सविस्तर सुरक्षितता कारणे",
    "home.scanFullSafetyProfile": "पूर्ण सुरक्षितता प्रोफाइल स्कॅन करा",
    "home.quickSearches": "जलद शोध",
    "home.findingSuggestions": "सूचना शोधत आहे...",
    "home.analyzingWithAI": "एआय (AI) सह विश्लेषण करत आहे...",
    "home.checkingSafety": "गरोदरपणाची सुरक्षितता तपासत आहे 🌸",
    "home.couldNotIdentify": "ते अन्न ओळखता आले नाही",
    "home.tryAgain": "पुन्हा प्रयत्न करा",
    "home.pregnancyFoodsList": "गरोदरपणातील खाद्यपदार्थ",
    "home.clearedItems": "त्रैमासिक आणि आजारासाठी मंजूर केलेले पदार्थ",
    "home.searchClearedFoods": "मंजूर केलेले पदार्थ शोधा...",
    "home.safeToConsume": "खाण्यास सुरक्षित",
    "home.consumeInModeration": "प्रमाणात खा",
    "home.cautionLabelShort": "सावधगिरी",
    "home.safeLabelShort": "सुरक्षित"
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
    "cat.Proteins": "प्रोटीन",
    
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

    "home.greeting.morning": "शुभ प्रभात",
    "home.greeting.afternoon": "शुभ दोपहर",
    "home.greeting.evening": "शुभ संध्या",
    "home.hydrationTitle": "पानी का लक्ष्य",
    "home.hydrationDesc": "आज कम से कम 8-10 गिलास पानी पिएं। बच्चे के एमनियोटिक द्रव स्तर का समर्थन करने के लिए उचित जलयोजन महत्वपूर्ण है।",
    "home.checkCravings": "अपनी लालसा की जाँच करें",
    "home.allergiesWarningTitle": "⚠️ आपके स्कैन अभी एलर्जी का पता नहीं लगा सकते",
    "home.allergiesWarningDesc": "आपकी एलर्जी और स्थिति की जानकारी के बिना, हम डेयरी, नट्स, ग्लूटेन या दवा के अंतःक्रियाओं के बारे में चेतावनी नहीं दे सकते।",
    "home.completeProfile": "प्रोफ़ाइल पूरी करें",
    "home.illRiskIt": "मैं जोखिम लूंगी",
    "home.streakWarningTitle": "आपकी स्ट्रीक खतरे में है!",
    "home.streakWarningDesc": "आप सुसंगत रही हैं। इसे जीवित रखने के लिए किसी भी भोजन को स्कैन करें।",
    "home.scanNow": "अभी स्कैन करें",
    "home.letStreakReset": "मेरी स्ट्रीक रीसेट होने दें",
    "home.pregnancyBenefit": "गर्भावस्था लाभ",
    "home.detailedSafetyReasons": "विस्तृत सुरक्षा कारण",
    "home.scanFullSafetyProfile": "पूरी सुरक्षा प्रोफ़ाइल स्कैन करें",
    "home.quickSearches": "त्वरित खोजें",
    "home.findingSuggestions": "सुझाव ढूंढ रहे हैं...",
    "home.analyzingWithAI": "एआई (AI) के साथ विश्लेषण...",
    "home.checkingSafety": "गर्भावस्था की सुरक्षा की जाँच कर रहे हैं 🌸",
    "home.couldNotIdentify": "उस भोजन की पहचान नहीं हो सकी",
    "home.tryAgain": "पुनः प्रयास करें",
    "home.pregnancyFoodsList": "गर्भावस्था खाद्य सूची",
    "home.clearedItems": "तिमाही और स्थितियों के लिए साफ़ किए गए आइटम",
    "home.searchClearedFoods": "साफ़ किए गए खाद्य पदार्थ खोजें...",
    "home.safeToConsume": "खाने के लिए सुरक्षित",
    "home.consumeInModeration": "संयम में खाएं",
    "home.cautionLabelShort": "सावधानी",
    "home.safeLabelShort": "सुरक्षित"
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
