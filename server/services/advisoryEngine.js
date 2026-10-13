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
 * Generates structured, prioritized advisory combining disease diagnosis and weather.
 */
function generateAdvisory({ crop, disease, confidence, isHealthy, weather = {}, language = 'en', diseaseModel = null }) {
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

  // 1. Diagnose Health vs Disease
  if (isHealthy || disease.toLowerCase() === 'healthy') {
    headline = `${crop}: ${loc.healthyTitle}`;
    whatHappened = `Your ${crop} leaf shows clean, green tissues with no visible signs of fungal or bacterial lesions.`;
    recommendations.push(loc.healthyMsg);
    actionSteps.push('Continue balanced drip/furrow watering without splashing muddy water on leaves.');
    actionSteps.push('Scout fields weekly, especially the lower leaf canopy, for any early changes.');
    actionSteps.push('Apply organic compost or balanced N-P-K according to crop growth stage.');
    priority = 'Low';
  } else {
    // Diseased crop
    if (confidence >= 75) {
      headline = `${crop} – ${disease} detected with high confidence (${confidence}%)`;
      whatHappened = `Your ${crop} leaf displays characteristic symptoms of ${disease}. Prompt management will prevent field-wide spread.`;
      priority = 'High';
    } else if (confidence >= 50) {
      headline = `Possible ${disease} in ${crop} (Moderate confidence: ${confidence}%)`;
      whatHappened = `The visual patterns match ${disease}, but please cross-check physical symptoms carefully before major spray treatments.`;
      priority = 'Medium';
    } else {
      headline = `Uncertain diagnosis for ${crop} (Low confidence: ${confidence}%)`;
      whatHappened = `AI confidence is below optimal threshold. The image may be blurry or shows multiple overlapping stresses.`;
      recommendations.push('Please take a clear, well-lit photo of the affected leaf in bright daylight or consult an agricultural officer.');
      priority = 'Low';
    }

    // Pull from disease model seed if available
    if (diseaseModel && diseaseModel.treatment && diseaseModel.treatment.length > 0) {
      diseaseModel.treatment.forEach(t => actionSteps.push(t));
    } else {
      actionSteps.push(`Carefully prune and remove leaves showing visible ${disease} spots.`);
      actionSteps.push(`Sanitize cutting shears and dispose of infected foliage outside the crop field.`);
      actionSteps.push(`Avoid excessive overhead irrigation that leaves water sitting on leaf blades.`);
      actionSteps.push(`Ensure adequate spacing between crop rows to foster dry airflow.`);
    }

    if (diseaseModel && diseaseModel.preventiveMeasures) {
      diseaseModel.preventiveMeasures.slice(0, 3).forEach(p => recommendations.push(p));
    }
  }

  // 2. Weather Correlation Rules
  const weatherTips = [];
  if (rainfall > 0) {
    weatherTips.push('Rain is occurring or forecasted. Do NOT apply foliar sprays today as rain will wash away treatments. Check drainage channels.');
    if (!isHealthy) priority = 'High';
  }

  if (humidity >= 75) {
    weatherTips.push(`Current humidity is elevated (${humidity}%). Moist air fosters spore germination. Increase plant row spacing and avoid night watering.`);
    if (!isHealthy && priority !== 'Urgent') priority = 'High';
  }

  if (temp >= 34) {
    weatherTips.push(`High ambient temperature (${temp}°C). Provide morning irrigation to avoid heat-stress induced leaf scorch.`);
  }

  if (windSpeed >= 20) {
    weatherTips.push(`Breezy winds (${windSpeed} km/h). Delay any chemical or bio-spray to prevent drift wastage.`);
  }

  if (weatherTips.length > 0) {
    weatherRiskNotice = weatherTips.join(' ');
  } else {
    weatherRiskNotice = 'Current weather conditions are temperate and stable for normal field activities.';
  }

  // 3. Simple voice read-out text (clean punctuation for TTS)
  const listenText = `${headline}. ${whatHappened} ${actionSteps.slice(0, 3).join('. ')}. ${weatherRiskNotice}`;

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
