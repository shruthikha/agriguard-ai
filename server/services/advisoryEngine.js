/**
 * AgriGuard AI - Smart Farming Advisory Engine
 * Merges disease diagnosis, real-time weather metrics, and agronomic knowledge
 * into actionable, simplified guidance for farmers with multi-language voice support.
 */

const LOCALIZED_ADVISORIES = {
  ta: {
    healthyTitle: 'உங்கள் பயிர் ஆரோக்கியமாக உள்ளது!',
    healthyMsg: 'தொடர்ந்து நல்ல நீர்ப்பாசனம் மற்றும் பராமரிப்பு முறைகளை கடைபிடிக்கவும்.',
    actionHeader: 'நீங்கள் என்ன செய்ய வேண்டும்:',
    weatherWarning: 'வானிலை எச்சரிக்கை:',
    expertAdvice: 'சந்தேகம் இருந்தால் அருகிலுள்ள வேளாண் அலுவலரை அணுகவும்.',
    listenPrefix: 'விவசாய ஆலோசனை:'
  },
  hi: {
    healthyTitle: 'आपकी फसल स्वस्थ दिखाई दे रही है!',
    healthyMsg: 'उचित सिंचाई और नियमित निगरानी जारी रखें।',
    actionHeader: 'आपको क्या करना चाहिए:',
    weatherWarning: 'मौसम सलाह:',
    expertAdvice: 'संदेह की स्थिति में नजदीकी कृषि विज्ञान केंद्र से संपर्क करें।',
    listenPrefix: 'कृषि सलाह:'
  },
  te: {
    healthyTitle: 'మీ పంట ఆరోగ్యంగా ఉంది!',
    healthyMsg: 'సకాలంలో నీటిపారుదల మరియు సరైన పోషణను కొనసాగించండి.',
    actionHeader: 'మీరు తీసుకోవలసిన చర్యలు:',
    weatherWarning: 'వాతావరణ హెచ్చరిక:',
    expertAdvice: 'సందేహం ఉంటే స్థానిక వ్యవసాయ నిపుణుడిని సంప్రదించండి.',
    listenPrefix: 'వ్యవసాయ సలహా:'
  },
  kn: {
    healthyTitle: 'ನಿಮ್ಮ ಬೆಳೆ ಆರೋಗ್ಯಕರವಾಗಿದೆ!',
    healthyMsg: 'ಸರಿಯಾದ ನೀರಾವರಿ ಮತ್ತು ಬೆಳೆ ನಿರ್ವಹಣೆಯನ್ನು ಮುಂದುವರಿಸಿ.',
    actionHeader: 'ನೀವು ಮಾಡಬೇಕಾದ ಕ್ರಮಗಳು:',
    weatherWarning: 'ಹವಾಮಾನ ಮುನ್ನೆಚ್ಚರಿಕೆ:',
    expertAdvice: 'ಅಗತ್ಯವಿದ್ದರೆ ಕೃಷಿ ಅಧಿಕಾರಿಯನ್ನು ಸಂಪರ್ಕಿಸಿ.',
    listenPrefix: 'ಕೃಷಿ ಸಲಹೆ:'
  },
  ml: {
    healthyTitle: 'നിങ്ങളുടെ വിള ആരോഗ്യകരമായിരിക്കുന്നു!',
    healthyMsg: 'ശരിയായ ജലസേചനവും പരിചരണവും തുടരുക.',
    actionHeader: 'നിങ്ങൾ ചെയ്യേണ്ട കാര്യങ്ങൾ:',
    weatherWarning: 'കാലാവസ്ഥാ മുന്നറിയിപ്പ്:',
    expertAdvice: 'സംശയമുണ്ടെങ്കിൽ കൃഷി ഭവനുമായി ബന്ധപ്പെടുക.',
    listenPrefix: 'കാർഷിക ഉപദേശം:'
  },
  mr: {
    healthyTitle: 'आपले पीक निरोगी आहे!',
    healthyMsg: 'वेळेवर पाणी देणे आणि नियमित निगा राखणे सुरू ठेवा.',
    actionHeader: 'आपण काय करावे:',
    weatherWarning: 'हवामान सूचना:',
    expertAdvice: 'शंका असल्यास कृषी सहाय्यकांशी संपर्क साधा.',
    listenPrefix: 'शेती सल्ला:'
  },
  bn: {
    healthyTitle: 'আপনার ফসল স্বাস্থ্যকর রয়েছে!',
    healthyMsg: 'সময়মতো সেচ এবং যত্ন চালিয়ে যান।',
    actionHeader: 'আপনার করণীয় পদক্ষেপ:',
    weatherWarning: 'আবহাওয়া সতর্কতা:',
    expertAdvice: 'প্রয়োজনে নিকটস্থ কৃষি কর্মকর্তার সাথে যোগাযোগ করুন।',
    listenPrefix: 'কৃষি পরামর্শ:'
  },
  en: {
    healthyTitle: 'Your crop appears healthy!',
    healthyMsg: 'Maintain balanced irrigation, good aeration, and routine crop scout checks.',
    actionHeader: 'What should you do:',
    weatherWarning: 'Weather Context & Risk:',
    expertAdvice: 'For uncertain symptoms, consult your local agricultural extension officer (KVK).',
    listenPrefix: 'AgriGuard Advisory:'
  }
};

/**
 * Generates structured, prioritized advisory combining disease diagnosis, image quality, and weather.
 */
function generateAdvisory({
  crop,
  disease,
  confidence,
  isHealthy,
  weather = {},
  language = 'en',
  diseaseModel = null,
  quality = {},
  warnings = [],
  userCropHint = ''
}) {
  const langKey = LOCALIZED_ADVISORIES[language] ? language : 'en';
  const loc = LOCALIZED_ADVISORIES[langKey];
  
  const temp = weather.temperature || 28;
  const humidity = weather.humidity || 70;
  const rainfall = weather.rainfall || 0;
  const windSpeed = weather.windSpeed || 10;
  
  const recommendations = [];
  const actionSteps = [];
  let weatherRiskNotice = '';
  let priority = 'Medium';
  let headline = '';
  let whatHappened = '';

  const isLowConfidence = confidence < 50 || quality?.isOOD;
  const isModerateConfidence = confidence >= 50 && confidence < 75 && !quality?.isOOD;

  // 1. Diagnose Health vs Disease
  if (isHealthy || disease.toLowerCase() === 'healthy') {
    headline = `${crop}: ${loc.healthyTitle}`;
    whatHappened = `Your ${crop} leaf shows clean, green tissues with no visible signs of fungal or bacterial lesions.`;
    recommendations.push(loc.healthyMsg);
    
    if (diseaseModel?.preventiveMeasures?.length > 0) {
      diseaseModel.preventiveMeasures.forEach(p => recommendations.push(p));
    } else {
      recommendations.push('Maintain balanced irrigation, good aeration, and routine crop scout checks.');
    }
    
    actionSteps.push('Continue balanced drip/furrow watering without splashing muddy water on leaves.');
    actionSteps.push('Scout fields weekly, especially the lower leaf canopy, for any early changes.');
    actionSteps.push('Apply organic compost or balanced N-P-K according to crop growth stage.');
    priority = 'Low';
  } else {
    // Diseased crop
    if (confidence >= 75 && !quality?.isOOD) {
      headline = `${crop} – ${disease} detected with high confidence (${confidence}%)`;
      whatHappened = `Your ${crop} leaf displays characteristic symptoms of ${disease}. Prompt management will prevent field-wide spread.`;
      priority = 'High';
    } else if (isModerateConfidence) {
      headline = `Probable ${disease} in ${crop} (${confidence}%)`;
      whatHappened = `Visual patterns indicate suspected ${disease}. Inspect leaf undersides and neighboring plants for confirming signs.`;
      priority = 'Medium';
    } else {
      headline = `Low Confidence Detection: Suspected ${disease} (${confidence}%)`;
      whatHappened = `AI confidence is low (${confidence}%). Visual features partially resemble ${disease}, but please verify physical symptoms carefully before applying chemical treatments.`;
      priority = 'Low';
      recommendations.push('For uncertain diagnosis, inspect physical leaves or consult your local Krishi Vigyan Kendra (KVK) officer.');
    }

    // Pull disease-specific symptoms for farmer confirmation
    if (diseaseModel?.symptoms && diseaseModel.symptoms.length > 0) {
      const topSymptoms = diseaseModel.symptoms.slice(0, 2).join('; ');
      recommendations.push(`Physical symptom check for ${disease}: ${topSymptoms}.`);
    }

    // Pull disease-specific treatments
    if (diseaseModel?.treatment && diseaseModel.treatment.length > 0) {
      diseaseModel.treatment.forEach(t => actionSteps.push(t));
    } else if (diseaseModel?.organicTreatment && diseaseModel.organicTreatment.length > 0) {
      diseaseModel.organicTreatment.forEach(t => actionSteps.push(`Organic measure: ${t}`));
    } else {
      actionSteps.push(`Carefully isolate and remove leaves showing visible ${disease} symptoms.`);
      actionSteps.push(`Sanitize cutting shears and dispose of infected foliage outside the crop field.`);
      actionSteps.push(`Ensure adequate spacing between crop rows to foster dry airflow.`);
    }

    // Pull disease-specific preventive measures
    if (diseaseModel?.preventiveMeasures && diseaseModel.preventiveMeasures.length > 0) {
      diseaseModel.preventiveMeasures.slice(0, 2).forEach(p => recommendations.push(p));
    }
  }

  // 2. Add input quality notices if applicable
  if (quality?.isBlurry) {
    recommendations.unshift('⚠️ Image blur detected: Re-take a sharp, close-up photo in bright daylight for higher diagnostic certainty.');
  }
  if (quality && quality.isLeafDetected === false) {
    recommendations.unshift('⚠️ Foliage warning: Photo lacks clear leaf foliage. Ensure the camera focuses on the leaf surface.');
  }

  // 3. Weather Correlation Rules (Tailored to disease biology)
  const weatherTips = [];
  const isFungal = ['scab', 'blight', 'rust', 'mold', 'spot'].some(k => disease.toLowerCase().includes(k));
  const isBacterial = disease.toLowerCase().includes('bacterial');
  const isViral = disease.toLowerCase().includes('mosaic') || disease.toLowerCase().includes('virus');
  const isMite = disease.toLowerCase().includes('mite');

  if (rainfall > 0) {
    weatherTips.push('Rainfall occurring or forecasted. Do NOT apply foliar sprays today to prevent wash-off.');
    if (!isHealthy) priority = 'High';
  }

  if (humidity >= 75) {
    if (isFungal) {
      weatherTips.push(`High humidity (${humidity}%) creates prime conditions for fungal spore germination. Ensure good canopy ventilation and avoid overhead irrigation.`);
    } else if (isBacterial) {
      weatherTips.push(`High humidity (${humidity}%) promotes bacterial lesion expansion. Avoid handling wet plants.`);
    } else {
      weatherTips.push(`Elevated ambient humidity (${humidity}%). Monitor lower canopy foliage closely.`);
    }
    if (!isHealthy && priority !== 'Urgent') priority = 'High';
  }

  if (temp >= 33) {
    if (isMite) {
      weatherTips.push(`High temperature (${temp}°C) and dry air accelerate spider mite reproduction. Keep plants well-hydrated.`);
    } else {
      weatherTips.push(`Warm temperature (${temp}°C). Provide early morning irrigation to avoid heat-stress induced wilt.`);
    }
  }

  if (windSpeed >= 20) {
    weatherTips.push(`Wind speed is ${windSpeed} km/h. Delay spraying treatments to prevent drift waste.`);
  }

  if (isViral) {
    weatherTips.push('Viral diseases are vector-transmitted (aphids/thrips). Control insect vectors and sanitize tools.');
  }

  if (weatherTips.length > 0) {
    weatherRiskNotice = weatherTips.join(' ');
  } else {
    weatherRiskNotice = 'Current weather conditions are temperate and stable for normal field activities.';
  }

  // 4. Simple voice read-out text (clean punctuation for TTS)
  const listenText = `${headline}. ${whatHappened} ${actionSteps.slice(0, 2).join('. ')}. ${weatherRiskNotice}`;

  return {
    crop,
    disease,
    confidence,
    isHealthy,
    headline,
    whatHappened,
    actionSteps,
    recommendations,
    weatherRiskNotice,
    priority,
    listenText,
    language: langKey,
    expertAdviceNotice: loc.expertAdvice,
    regulatoryWarning: 'Chemical recommendations must be verified with certified product labels and local pesticide regulatory guidance.'
  };
}

module.exports = {
  generateAdvisory,
  LOCALIZED_ADVISORIES
};

