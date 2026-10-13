const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const bcrypt = require('bcryptjs');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const User = require('../models/User');
const Disease = require('../models/Disease');
const Scan = require('../models/Scan');
const Advisory = require('../models/Advisory');
const RegionalAdvisory = require('../models/RegionalAdvisory');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/agriguard';

const DISEASES_DATA = [
  {
    crop: 'Apple',
    diseaseName: 'Apple Scab',
    scientificName: 'Venturia inaequalis',
    classId: 'Apple___Apple_scab',
    isHealthy: false,
    severity: 'High',
    symptoms: [
      'Olive-green to dull black spots on leaves',
      'Velvety texture on upper leaf surface',
      'Leaves become distorted, puckered, and drop prematurely',
      'Crusty scabby lesions on developing apple fruit'
    ],
    causes: [
      'Overwintering fungus in fallen dead apple leaves',
      'Prolonged cool, wet spring weather (15°C to 20°C)',
      'Free moisture sitting on leaf surface for 6+ hours'
    ],
    treatment: [
      'Rake up and destroy or compost all fallen leaves in autumn',
      'Prune the canopy during dormancy to promote fast drying',
      'Apply protective bio-fungicides or wettable sulfur before blossom bursts'
    ],
    organicTreatment: [
      'Liquid copper spray at green tip stage',
      'Neem oil foliar application (2-3ml/L) as a deterrent',
      'Bacillus subtilis biological bio-fungicide formulations'
    ],
    chemicalTreatment: [
      'Captan 50 WP or Mancozeb 75 WP at pink bud stage',
      'Myclobutanil or Difenoconazole for systemic curative action'
    ],
    chemicalWarning: 'Always read product label. Wear protective mask and gloves. Observe required pre-harvest intervals (PHI).',
    preventiveMeasures: [
      'Select scab-resistant apple cultivars like Enterprise or Liberty',
      'Ensure wide tree spacing for maximum sun exposure and wind flow',
      'Avoid overhead sprinkler irrigation'
    ],
    affectedParts: ['Leaves', 'Blossoms', 'Fruit stems', 'Fruit'],
    environmentalConditions: {
      idealTemp: '16°C - 24°C',
      humidityRisk: 'Humidity above 70% with rain showers accelerates spore dissemination',
      rainfallImpact: 'Rain splashes release ascospore clouds onto young foliage'
    },
    simpleExplanation: 'A fungal disease causing black scabby spots on apple leaves and fruit. It thrives when leaves remain wet for several hours.',
    regionalNames: {
      ta: 'ஆப்பிள் சொறி நோய் (Apple Scab)',
      hi: 'सेब का पपड़ी रोग (Apple Scab)',
      te: 'యాపిల్ స్కాబ్ తెగులు',
      kn: 'ಸೇಬು ತುರುಚು ರೋಗ',
      ml: 'ആപ്പിൾ ചൊറി രോഗം',
      mr: 'सफरचंद खवले रोग',
      bn: 'আপেলের খোসপাঁচড়া রোগ'
    }
  },
  {
    crop: 'Apple',
    diseaseName: 'Black Rot',
    scientificName: 'Botryosphaeria obtusa',
    classId: 'Apple___Black_rot',
    isHealthy: false,
    severity: 'High',
    symptoms: [
      'Purple spots on leaves enlarging into frog-eye leaf spots with brown centers',
      'Cankers on twigs and tree bark',
      'Firm black rotting zones on fruit with concentric dark rings'
    ],
    causes: [
      'Fungal spores overwintering in mummified fruit and dead wood',
      'Insect punctures or mechanical pruning wounds',
      'Warm humid rainy weather (20°C to 27°C)'
    ],
    treatment: [
      'Remove all dead twigs and mummified fruit hanging on trees',
      'Prune out cankers 15cm below infected tissue and sterilize tools',
      'Apply preventive copper sprays early in the season'
    ],
    organicTreatment: [
      'Bordeaux mixture (1%) post-pruning',
      'Potassium bicarbonate sprays during humid periods',
      'Neem oil botanical sprays'
    ],
    chemicalTreatment: [
      'Thiophanate-methyl or Captan sprays during petal fall',
      'Pyraclostrobin + Boscalid combination fungicides'
    ],
    preventiveMeasures: [
      'Keep orchard clean of fallen leaves and rotten apples',
      'Maintain tree vigor with balanced fertilizer; avoid excess nitrogen',
      'Protect fruit from insect bites and hail injuries'
    ],
    affectedParts: ['Leaves', 'Branches', 'Fruit'],
    simpleExplanation: 'A damaging fungus that causes circular frog-eye spots on leaves and rots developing apples into black mummies.',
    regionalNames: {
      ta: 'ஆப்பிள் கறுப்பு அழுகல் (Black Rot)',
      hi: 'सेब का काला सड़न रोग (Black Rot)',
      te: 'యాపిల్ బ్లాక్ రాట్',
      kn: 'ಸೇಬು ಕಪ್ಪು ಕೊಳೆತ',
      ml: 'ആപ്പിൾ കറുത്ത ചീയൽ',
      mr: 'सफरचंद काळी सड',
      bn: 'আপেলের কালো পচন'
    }
  },
  {
    crop: 'Apple',
    diseaseName: 'Cedar Apple Rust',
    scientificName: 'Gymnosporangium juniperi-virginianae',
    classId: 'Apple___Cedar_apple_rust',
    isHealthy: false,
    severity: 'Medium',
    symptoms: [
      'Bright yellow-orange circular spots on upper leaf surfaces',
      'Small black dots inside orange spots',
      'Raised rust pustules (aecia) on the underside of leaves',
      'Premature defoliation in severe outbreaks'
    ],
    causes: [
      'Alternating fungal cycle between apple and red cedar/juniper trees',
      'Spring rainstorms blowing spores from cedar galls',
      'Temperatures between 12°C and 24°C'
    ],
    treatment: [
      'Remove nearby wild juniper or cedar trees within 500 meters if practical',
      'Rake and dispose of fallen infected leaves',
      'Apply fungicide sprays from tight cluster stage until blossom petal drop'
    ],
    organicTreatment: [
      'Sulfur dust or wettable sulfur sprays before rain events',
      'Copper soap fungicide applied at early bloom'
    ],
    chemicalTreatment: [
      'Myclobutanil (Immunox) or Propiconazole at pink bud stage',
      'Mancozeb protective sprays'
    ],
    preventiveMeasures: [
      'Plant rust-immune varieties such as Redfree, Liberty, or Freedom',
      'Monitor nearby ornamental cedars for gelatinous orange galls in spring'
    ],
    affectedParts: ['Leaves', 'Young twigs', 'Fruit'],
    simpleExplanation: 'Causes bright orange-yellow rust spots on leaves. It needs both apple trees and nearby cedar trees to survive.',
    regionalNames: {
      ta: 'ஆப்பிள் துரு நோய் (Cedar Apple Rust)',
      hi: 'सेब का रतुआ रोग (Cedar Apple Rust)',
      te: 'యాపిల్ తుప్పు తెగులు',
      kn: 'ಸೇಬು ತುಕ್ಕು ರೋಗ',
      ml: 'ആപ്പിൾ തുരുമ്പ് രോഗം',
      mr: 'सफरचंद तांबेरा रोग',
      bn: 'আপেলের মরচে রোগ'
    }
  },
  {
    crop: 'Apple',
    diseaseName: 'Healthy',
    classId: 'Apple___healthy',
    isHealthy: true,
    severity: 'None',
    symptoms: [
      'Deep green glossy foliage',
      'Uniform leaf margin and texture',
      'No spots, lesions, chlorosis or insect webs'
    ],
    causes: ['Optimal orchard management and balanced nutrition'],
    treatment: ['No corrective action needed. Continue routine orchard maintenance.'],
    organicTreatment: ['Monthly bio-fertilizer foliar spray (panchagavya or seaweed extract) to sustain vigor.'],
    chemicalTreatment: ['None required.'],
    preventiveMeasures: [
      'Maintain regular drip irrigation during fruit swell',
      'Practice annual winter pruning for air circulation',
      'Apply balanced N-P-K fertilizer based on soil testing'
    ],
    affectedParts: ['None'],
    simpleExplanation: 'Your apple tree leaves are vibrant and healthy with zero sign of infection.',
    regionalNames: {
      ta: 'ஆரோக்கியமான ஆப்பிள் பயிர் (Healthy)',
      hi: 'स्वस्थ सेब (Healthy)',
      te: 'ఆరోగ్యకరమైన యాపిల్',
      kn: 'ಆರೋಗ್ಯಕರ ಸೇಬು',
      ml: 'ആരോഗ്യമുള്ള ആപ്പിൾ',
      mr: 'निरोगी सफरचंद',
      bn: 'স্বাস্থ্যকর আপেল'
    }
  },
  {
    crop: 'Pepper',
    diseaseName: 'Bacterial Spot',
    scientificName: 'Xanthomonas campestris pv. vesicatoria',
    classId: 'Pepper__bell___Bacterial_spot',
    isHealthy: false,
    severity: 'High',
    symptoms: [
      'Small, circular, water-soaked spots on leaves turning dark brown with yellow halos',
      'Leaves turn yellow and drop prematurely, causing sunscald on fruits',
      'Raised brown scabby blister-like spots on chilli/bell pepper fruit'
    ],
    causes: [
      'Seed-borne or soil-borne Xanthomonas bacteria',
      'Splashing rain and high relative humidity (>85%)',
      'Warm weather with temperatures between 24°C and 30°C'
    ],
    treatment: [
      'Immediately remove and safely destroy heavily infected plants',
      'Switch strictly to furrow or drip irrigation to stop water splashing',
      'Disinfect stakes, pruning clippers, and equipment with bleach solution'
    ],
    organicTreatment: [
      'Copper hydroxide or copper oxychloride (2.5g/L) mixed with agricultural lime',
      'Trichoderma viride soil drenching',
      'Neem seed kernel extract (NSKE 5%)'
    ],
    chemicalTreatment: [
      'Streptocycline (1g in 10L water) combined with Copper Oxychloride (25g in 10L water)',
      'Kasugamycin 3% SL'
    ],
    chemicalWarning: 'Observe strict 14-day pre-harvest waiting period when using bactericides. Do not overdose antibiotics.',
    preventiveMeasures: [
      'Use certified pathogen-free seeds treated with hot water (50°C for 25 min)',
      'Practice 2-3 year crop rotation away from solanaceous crops (tomato, potato, brinjal)',
      'Maintain adequate spacing between rows for good ventilation'
    ],
    affectedParts: ['Leaves', 'Stems', 'Fruit'],
    simpleExplanation: 'A bacterial disease that creates dark water-soaked spots with yellow edges, causing leaves to drop and fruit to blister.',
    regionalNames: {
      ta: 'மிளகாய் பாக்டீரியா இலைப்புள்ளி நோய் (Bacterial Spot)',
      hi: 'मिर्च का जीवाणु धब्बा रोग (Bacterial Spot)',
      te: 'మిరప బ్యాక్టీరియల్ మచ్చ తెగులు',
      kn: 'ಮೆಣಸಿನಕಾಯಿ ಬ್ಯಾಕ್ಟೀರಿಯಾ ಕಲೆ ರೋಗ',
      ml: 'മുളക് ബാക്ടീരിയൽ ഇലപ്പുള്ളി',
      mr: 'मिरचीवरील जिवाणूजन्य ठिपके',
      bn: 'মরিচের ব্যাক্টেরিয়াল দাগ রোগ'
    }
  },
  {
    crop: 'Pepper',
    diseaseName: 'Healthy',
    classId: 'Pepper__bell___healthy',
    isHealthy: true,
    severity: 'None',
    symptoms: ['Lush dark green leaves, smooth surface, robust stems, no spots'],
    causes: ['Healthy soil biology and optimal farm practices'],
    treatment: ['No treatment needed. Keep scouting weekly.'],
    organicTreatment: ['Foliar spray of vermiwash (10%) or panchagavya (3%) every 2 weeks.'],
    chemicalTreatment: ['None required.'],
    preventiveMeasures: ['Mulch soil surface with straw or plastic mulch to suppress weeds and retain moisture.'],
    affectedParts: ['None'],
    simpleExplanation: 'The pepper leaf is healthy and displaying normal vegetative development.',
    regionalNames: {
      ta: 'ஆரோக்கியமான மிளகாய் (Healthy)',
      hi: 'स्वस्थ मिर्च (Healthy)',
      te: 'ఆరోగ్యకరమైన మిరప',
      kn: 'ಆರೋಗ್ಯಕರ ಮೆಣಸಿನಕಾಯಿ',
      ml: 'ആരോഗ്യമുള്ള മുളക്',
      mr: 'निरोगी मिरची',
      bn: 'স্বাস্থ্যকর মরিচ'
    }
  },
  {
    crop: 'Potato',
    diseaseName: 'Early Blight',
    scientificName: 'Alternaria solani',
    classId: 'Potato___Early_blight',
    isHealthy: false,
    severity: 'Medium',
    symptoms: [
      'Characteristic concentric ring "target-board" brown spots on older lower leaves',
      'Yellow halo surrounding target spots',
      'Leaves wither, turn crispy brown, but often remain hanging on stems'
    ],
    causes: [
      'Alternaria fungal spores carried by wind and rain splash',
      'Alternating wet and dry periods with temperatures around 24°C - 29°C',
      'Plants under nitrogen deficit or drought stress'
    ],
    treatment: [
      'Remove lower infected leaves before the disease reaches upper canopy',
      'Ensure steady drip irrigation to avoid cyclical soil moisture stress',
      'Apply protective fungicide before flowering and row closure'
    ],
    organicTreatment: [
      'Copper oxychloride (3g/L) spray at 10-day intervals',
      'Bacillus amyloliquefaciens bio-fungicide',
      'Panchagavya foliar feed to boost plant immunity'
    ],
    chemicalTreatment: [
      'Mancozeb 75% WP (2.5g/L) or Chlorothalonil 75% WP',
      'Azoxystrobin + Difenoconazole (Amistar Top) for systemic control'
    ],
    preventiveMeasures: [
      'Plant certified disease-free seed tubers',
      'Practice minimum 3-year crop rotation without potatoes or tomatoes',
      'Maintain adequate potassium and nitrogen balance in soil'
    ],
    affectedParts: ['Older leaves', 'Stems', 'Tubers (dark sunken dry rot)'],
    simpleExplanation: 'Causes dark brown spots with circular target rings on older leaves. Common when warm weather alternates between rain and dry spells.',
    regionalNames: {
      ta: 'உருளைக்கிழங்கு ஆரம்பகால கருகல் நோய் (Early Blight)',
      hi: 'आलू का अगेती झुलसा रोग (Early Blight)',
      te: 'బంగాళాదుంప ముందస్తు తెగులు',
      kn: 'ಆಲೂಗಡ್ಡೆ ಆರಂಭಿಕ ಮುದುಡು ರೋಗ',
      ml: 'ഉരുളക്കിഴങ്ങ് പ്രാരംഭ കരിഞ്ഞുണങ്ങൽ',
      mr: 'बटाट्यावरील करपा (अगेती)',
      bn: 'আলুর আগাম ধসা রোগ'
    }
  },
  {
    crop: 'Potato',
    diseaseName: 'Late Blight',
    scientificName: 'Phytophthora infestans',
    classId: 'Potato___Late_blight',
    isHealthy: false,
    severity: 'Critical',
    symptoms: [
      'Water-soaked, dark green to purplish-black lesions appearing rapidly on leaf tips',
      'White cottony fungal downy growth on leaf undersides in high humidity',
      'Entire potato vines rapidly rot, collapse, and give off a strong foul odor',
      'Brown granular dry rot inside tubers'
    ],
    causes: [
      'Phytophthora infestans water mold oomycete',
      'Cool temperatures (15°C to 20°C) with persistent humidity >90% or fog/drizzle',
      'Wind-blown sporangia travelling miles during damp spells'
    ],
    treatment: [
      'Immediate action required! Apply curative systemic fungicide within 24 hours of first spot',
      'Cut off infected haulms (stems) 2 weeks before harvest to prevent tuber infection',
      'Destroy all infected foliage; do NOT leave in field compost'
    ],
    organicTreatment: [
      'Bordeaux mixture (1%) or Copper hydroxide before wet weather onset',
      'Potassium phosphite foliar drenching to stimulate systemic acquired resistance'
    ],
    chemicalTreatment: [
      'Metalaxyl + Mancozeb (Ridomil Gold 2.5g/L) or Cymoxanil + Mancozeb',
      'Dimethomorph 50% WP or Mandipropamid'
    ],
    chemicalWarning: 'Critical crop emergency. Treat immediately to avoid total field loss. Follow label protective gears.',
    preventiveMeasures: [
      'Use certified late-blight resistant potato varieties (e.g., Kufri Girdhari, Kufri Himalini)',
      'Hill up potato rows deeply to provide a soil barrier protecting tubers from washing spores',
      'Never irrigate late in the evening'
    ],
    affectedParts: ['Leaves', 'Stems', 'Tubers', 'Whole canopy'],
    simpleExplanation: 'The most dangerous potato disease. Causes rapid black water-soaked rotting of leaves and stems during cool, misty weather. Act immediately!',
    regionalNames: {
      ta: 'உருளைக்கிழங்கு பின்கால கருகல் நோய் (Late Blight)',
      hi: 'आलू का पछेती झुलसा रोग (Late Blight)',
      te: 'బంగాళాదుంప లేట్ బ్లైట్ తెగులు',
      kn: 'ಆಲೂಗಡ್ಡೆ ತಡವಾದ ಮುದುಡು ರೋಗ',
      ml: 'ഉരുളക്കിഴങ്ങ് പിൽക്കാല കരിഞ്ഞുണങ്ങൽ',
      mr: 'बटाट्यावरील पछेती करपा',
      bn: 'আলুর নাবি ধসা রোগ'
    }
  },
  {
    crop: 'Potato',
    diseaseName: 'Healthy',
    classId: 'Potato___healthy',
    isHealthy: true,
    severity: 'None',
    symptoms: ['Crisp green compound leaves, upright bushy canopy, clean stems'],
    causes: ['Balanced soil fertility, clean seed tubers, and optimal watering'],
    treatment: ['No treatment required.'],
    organicTreatment: ['Apply seaweed extract spray (2ml/L) at tuber initiation.'],
    chemicalTreatment: ['None required.'],
    preventiveMeasures: ['Hill up soil around plants to support tuber development and prevent greening.'],
    affectedParts: ['None'],
    simpleExplanation: 'Your potato foliage is in excellent health with no signs of blight.',
    regionalNames: {
      ta: 'ஆரோக்கியமான உருளைக்கிழங்கு (Healthy)',
      hi: 'स्वस्थ आलू (Healthy)',
      te: 'ఆరోగ్యకరమైన బంగాళాదుంప',
      kn: 'ಆರೋಗ್ಯಕರ ಆಲೂಗಡ್ಡೆ',
      ml: 'ആരോഗ്യമുള്ള ഉരുളക്കിഴങ്ങ്',
      mr: 'निरोगी बटाटा',
      bn: 'স্বাস্থ্যকর আলু'
    }
  },
  {
    crop: 'Tomato',
    diseaseName: 'Bacterial Spot',
    scientificName: 'Xanthomonas perforans',
    classId: 'Tomato___Bacterial_spot',
    isHealthy: false,
    severity: 'High',
    symptoms: [
      'Small, dark, greasy or water-soaked spots on leaves with yellow halos',
      'Shot-hole appearance as spot centers dry and drop out',
      'Small dark raised scabs on green tomatoes'
    ],
    causes: [
      'Bacterial pathogen surviving in crop residue or infected seed',
      'High humidity, splashing rain, and overhead sprinkler irrigation',
      'Warm temperatures (24°C - 32°C)'
    ],
    treatment: [
      'Avoid working in wet fields to prevent spreading bacteria between plants',
      'Remove severely affected lower branches',
      'Switch to ground-level drip irrigation'
    ],
    organicTreatment: [
      'Copper-based bactericide sprays (Copper hydroxide)',
      'Pseudomonas fluorescens bio-agent foliar application'
    ],
    chemicalTreatment: [
      'Copper Oxychloride (2.5g/L) + Streptocycline (100ppm / 1g in 10L)',
      'Kasugamycin 3% SL'
    ],
    preventiveMeasures: [
      'Rotate crops for at least 2 seasons away from solanaceous plants',
      'Use certified disease-free transplants',
      'Mulch soil to prevent rain splashing spores onto lower leaves'
    ],
    affectedParts: ['Leaves', 'Stems', 'Fruit calyx', 'Fruit'],
    simpleExplanation: 'Small dark water-soaked spots with yellow rings on tomato leaves caused by bacteria during warm, wet weather.',
    regionalNames: {
      ta: 'தக்காளி பாக்டீரியா இலைப்புள்ளி நோய் (Bacterial Spot)',
      hi: 'टमाटर का जीवाणु धब्बा रोग (Bacterial Spot)',
      te: 'టమోటా బ్యాక్టీరియల్ మచ్చ తెగులు',
      kn: 'ಟೊಮ್ಯಾಟೊ ಬ್ಯಾಕ್ಟೀರಿಯಾ ಕಲೆ ರೋಗ',
      ml: 'തക്കാളി ബാക്ടീരിയൽ ഇലപ്പുള്ളി',
      mr: 'टोमॅटोवरील जिवाणूजन्य ठिपके',
      bn: 'টমেটোর ব্যাক্টেরিয়াল দাগ রোগ'
    }
  },
  {
    crop: 'Tomato',
    diseaseName: 'Early Blight',
    scientificName: 'Alternaria linariae',
    classId: 'Tomato___Early_blight',
    isHealthy: false,
    severity: 'High',
    symptoms: [
      'Dark brown circular spots with concentric target-like rings on older leaves',
      'Surrounding leaf tissue turns yellow and eventually wilts',
      'Dark sunken leathery cankers on stems near the soil line',
      'Dark sunken rot at the stem-end of ripe tomato fruit'
    ],
    causes: [
      'Fungus surviving in soil and infected crop debris',
      'Frequent rain or dew with temperatures between 24°C and 29°C',
      'Splashing water from soil onto lower foliage'
    ],
    treatment: [
      'Prune and discard infected bottom leaves up to 30cm from the ground',
      'Stake or trellis tomato plants to elevate foliage off moist soil',
      'Apply organic mulch (straw or plastic) around the plant base'
    ],
    organicTreatment: [
      'Neem oil spray (3-5 ml/L) mixed with mild liquid soap',
      'Bordeaux mixture (1%) or Copper oxychloride (2.5g/L)',
      'Trichoderma harzianum bio-control agent'
    ],
    chemicalTreatment: [
      'Mancozeb 75 WP (2g/L) or Chlorothalonil 75 WP at first sign',
      'Azoxystrobin 23% SC (1ml/L) or Difenoconazole 25% EC (0.5ml/L) for established infections'
    ],
    chemicalWarning: 'Observe safety waiting period. Do not spray during peak midday heat. Follow label guidelines.',
    preventiveMeasures: [
      'Ensure 60cm - 90cm spacing between plants for airflow',
      'Always water at the base of the plant using drip pipes, never spray overhead',
      'Rotate crops for at least 3 years'
    ],
    affectedParts: ['Lower leaves', 'Stems', 'Fruit stem-ends'],
    simpleExplanation: 'Very common tomato disease with target-like brown rings on lower leaves. Remove affected lower leaves and avoid wetting leaves when watering.',
    regionalNames: {
      ta: 'தக்காளி ஆரம்பகால கருகல் நோய் (Early Blight)',
      hi: 'टमाटर का अगेती झुलसा रोग (Early Blight)',
      te: 'టమోటా ముందస్తు మాడు తెగులు',
      kn: 'ಟೊಮ್ಯಾಟೊ ಆರಂಭಿಕ ಮುದುಡು ರೋಗ',
      ml: 'തക്കാളി പ്രാരംഭ കരിഞ്ഞുണങ്ങൽ',
      mr: 'टोमॅटोवरील करपा (अगेती)',
      bn: 'টমেটোর আগাম ধসা রোগ'
    }
  },
  {
    crop: 'Tomato',
    diseaseName: 'Late Blight',
    scientificName: 'Phytophthora infestans',
    classId: 'Tomato___Late_blight',
    isHealthy: false,
    severity: 'Critical',
    symptoms: [
      'Large, irregular greasy water-soaked brown lesions on leaves and stems',
      'White fuzzy fungal growth on the underside of leaves during damp mornings',
      'Entire canopy collapses and turns brown as if hit by frost within days',
      'Firm, dark, greasy brown patches on green and ripe tomato fruit'
    ],
    causes: [
      'Destructive oomycete pathogen blown by wind from potato/tomato fields',
      'Cool, moist weather (15°C - 22°C) with persistent fog, cloud cover, or heavy rain',
      'High relative humidity above 90%'
    ],
    treatment: [
      'Emergency intervention: spray systemic fungicide immediately to protect green crop',
      'Remove and bury severely blighted plants away from the field',
      'Do not throw infected vines into household compost piles'
    ],
    organicTreatment: [
      'Copper soap or Copper hydroxide at 5-day intervals during wet weather',
      'Foliar potassium silicate sprays to strengthen leaf cuticles'
    ],
    chemicalTreatment: [
      'Metalaxyl-M + Mancozeb (Ridomil Gold 2g/L)',
      'Cymoxanil + Mancozeb (Curzate M8 2g/L)',
      'Dimethomorph (1g/L) for rapid curative knockdown'
    ],
    preventiveMeasures: [
      'Avoid planting tomatoes near potato fields',
      'Plant resistant tomato varieties like Mountain Magic, Defiant, or Iron Lady',
      'Maintain wide spacing and prune suckers to optimize wind circulation'
    ],
    affectedParts: ['Leaves', 'Stems', 'Green and ripe fruit'],
    simpleExplanation: 'Devastating disease that rots leaves and fruit within days in cool, rainy weather. Shows white fuzz underneath leaves. Immediate spray is essential!',
    regionalNames: {
      ta: 'தக்காளி பின்கால கருகல் நோய் (Late Blight)',
      hi: 'टमाटर का पछेती झुलसा रोग (Late Blight)',
      te: 'టమోటా లేట్ బ్లైట్ తెగులు',
      kn: 'ಟೊಮ್ಯಾಟೊ ತಡವಾದ ಮುದುಡು ರೋಗ',
      ml: 'തക്കാളി പിൽക്കാല കരിഞ്ഞുണങ്ങൽ',
      mr: 'टोमॅटोवरील पछेती करपा',
      bn: 'টমেটোর নাবি ধসা রোগ'
    }
  },
  {
    crop: 'Tomato',
    diseaseName: 'Leaf Mold',
    scientificName: 'Passalora fulva',
    classId: 'Tomato___Leaf_Mold',
    isHealthy: false,
    severity: 'Medium',
    symptoms: [
      'Pale green or yellowish spots on upper leaf surfaces',
      'Dense olive-green to brownish velvety mold growth on the leaf underside',
      'Leaves turn completely yellow, curl, wither, and drop prematurely'
    ],
    causes: [
      'Fungus thriving in warm, poorly ventilated conditions with humidity >85%',
      'Common in greenhouses, polyhouses, or tightly packed field plantings'
    ],
    treatment: [
      'Increase ventilation by rolling up greenhouse side curtains or pruning lower foliage',
      'Remove all leaves exhibiting velvety mold',
      'Reduce planting density and improve row air movement'
    ],
    organicTreatment: [
      'Sulfur dust or wettable sulfur spray (2g/L)',
      'Bio-fungicide containing Bacillus subtilis',
      'Potassium bicarbonate foliar wash'
    ],
    chemicalTreatment: [
      'Chlorothalonil 75 WP or Mancozeb 75 WP',
      'Difenoconazole 25 EC'
    ],
    preventiveMeasures: [
      'Keep greenhouse relative humidity below 80% with exhaust fans',
      'Avoid evening irrigation; ensure leaves are dry before sundown',
      'Plant leaf-mold resistant cultivars'
    ],
    affectedParts: ['Older and middle leaves', 'Occasionally stems and flowers'],
    simpleExplanation: 'Velvety olive-brown mold under the leaf with yellow spots on top. Highly common in humid, stuffy gardens or polyhouses.',
    regionalNames: {
      ta: 'தக்காளி இலை பூஞ்சை நோய் (Leaf Mold)',
      hi: 'टमाटर का पत्ता फफूंद रोग (Leaf Mold)',
      te: 'టమోటా ఆకు బూజు తెగులు',
      kn: 'ಟೊಮ್ಯಾಟೊ ಎಲೆ ಬೂಸ್ಟು ರೋಗ',
      ml: 'തക്കാളി ഇല പൂപ്പൽ',
      mr: 'टोमॅटोवरील पानावरील बुरशी',
      bn: 'টমেটোর পাতার ছত্রাক'
    }
  },
  {
    crop: 'Tomato',
    diseaseName: 'Septoria Leaf Spot',
    scientificName: 'Septoria lycopersici',
    classId: 'Tomato___Septoria_leaf_spot',
    isHealthy: false,
    severity: 'High',
    symptoms: [
      'Numerous small circular spots (2-3mm) with dark brown borders and grayish-white centers',
      'Tiny black specks (pycnidia fruiting bodies) visible inside spot centers with a hand lens',
      'Rapid progressive yellowing and defoliation from bottom of plant upwards'
    ],
    causes: [
      'Fungus surviving in infected tomato solanaceous weeds (nightshade) and crop residues',
      'Extended periods of warm (20°C - 25°C) wet weather with rain splash'
    ],
    treatment: [
      'Pinch off infected lower leaves as soon as first spots appear',
      'Clean stakes and trellis wires with mild disinfectant before replanting',
      'Stake plants firmly to avoid soil contact'
    ],
    organicTreatment: [
      'Liquid copper fungicide spray every 7-10 days',
      'Neem oil emulsion as a preventive deterrent'
    ],
    chemicalTreatment: [
      'Chlorothalonil 75 WP (2g/L) or Mancozeb (2.5g/L)',
      'Tebuconazole 25.9% EC (1ml/L) or Pyraclostrobin'
    ],
    preventiveMeasures: [
      'Spread a thick layer of straw mulch beneath plants to block soil splashes',
      'Eradicate nightshade and other solanaceous weeds around field borders',
      'Allow 3 years between tomato family crops in the same plot'
    ],
    affectedParts: ['Leaves', 'Stems', 'Calyx (rarely on fruit itself)'],
    simpleExplanation: 'Lots of tiny round spots with gray centers and black specks. It strips leaves from the ground up, exposing tomatoes to sunscald.',
    regionalNames: {
      ta: 'தக்காளி செப்டோரியா இலைப்புள்ளி (Septoria Leaf Spot)',
      hi: 'टमाटर का सेप्टोरिया पत्ती धब्बा (Septoria Leaf Spot)',
      te: 'టమోటా సెప్టోరియా ఆకుమచ్చ తెగులు',
      kn: 'ಟೊಮ್ಯಾಟೊ ಸೆಪ್ಟೋರಿಯಾ ಎಲೆ ಕಲೆ ರೋಗ',
      ml: 'തക്കാളി സെപ്റ്റോറിയ ഇലപ്പുള്ളി',
      mr: 'टोमॅटो सेप्टोरिया पानावरील ठिपके',
      bn: 'টমেটোর সেপ্‌টোরিয়া পাতার দাগ'
    }
  },
  {
    crop: 'Tomato',
    diseaseName: 'Spider Mites',
    scientificName: 'Tetranychus urticae',
    classId: 'Tomato___Spider_mites_Two_spotted_spider_mite',
    isHealthy: false,
    severity: 'Medium',
    symptoms: [
      'Fine white, yellow, or bronze speckling/stippling on leaf upper surface',
      'Delicate silky webs visible on leaf undersides and shoot tips',
      'Leaves turn dry, crispy, bronze, and fall off in heavy infestations'
    ],
    causes: [
      'Microscopic eight-legged sap-sucking pests (two-spotted spider mites)',
      'Hot, dry, dusty environmental conditions (>30°C and low humidity)',
      'Excessive broad-spectrum insecticide sprays killing natural predator insects'
    ],
    treatment: [
      'Spray strong jet of water on leaf undersides to dislodge mites and disrupt webbing',
      'Prune and destroy heavily webbed branch tips',
      'Increase local humidity and avoid excessive road dust on field edges'
    ],
    organicTreatment: [
      'Neem oil (5ml/L) or insecticidal potassium soap spray',
      'Release predatory mites (Phytoseiulus persimilis)',
      'Wettable sulfur spray (2g/L) when temperature is below 32°C'
    ],
    chemicalTreatment: [
      'Abamectin 1.9% EC (0.5ml/L) or Spiromesifen 22.9% SC (1ml/L)',
      'Fenazaquin 10% EC'
    ],
    preventiveMeasures: [
      'Maintain adequate soil moisture so crops do not enter drought stress',
      'Avoid excessive chemical sprays that eliminate beneficial predatory bugs',
      'Keep field borders weed-free'
    ],
    affectedParts: ['Underside of leaves', 'Growing shoot tips', 'Flowers'],
    simpleExplanation: 'Tiny sap-sucking bugs that spin fine webs under leaves and make them look speckled and dusty. Common during hot, dry weather.',
    regionalNames: {
      ta: 'தக்காளி சிலந்திப் பேன் (Spider Mites)',
      hi: 'टमाटर का लाल मकड़ी कीट (Spider Mites)',
      te: 'టమోటా ఎర్ర నల్లి పురుగు',
      kn: 'ಟೊಮ್ಯಾಟೊ ಕೆಂಪು ಜೇಡ ನುಸಿ',
      ml: 'തക്കാളി ചിലന്തി പുഴു',
      mr: 'टोमॅटोवरील लाल कोळी',
      bn: 'টমেটোর লাল মাকড়'
    }
  },
  {
    crop: 'Tomato',
    diseaseName: 'Target Spot',
    scientificName: 'Corynespora cassiicola',
    classId: 'Tomato___Target_Spot',
    isHealthy: false,
    severity: 'Medium',
    symptoms: [
      'Brown circular spots on leaves with distinct light-brown concentric rings',
      'Spots may coalesce into large blighted areas causing leaf drop',
      'Dark sunken pitted spots on green and ripe tomato fruit'
    ],
    causes: [
      'Fungal infection favored by warm, humid tropical and subtropical weather (24°C - 30°C)',
      'Frequent rainfall and prolonged leaf wetness'
    ],
    treatment: [
      'Remove lower infected leaves to improve canopy aeration',
      'Stake tomatoes and tie up shoots',
      'Avoid overhead watering'
    ],
    organicTreatment: [
      'Copper oxychloride (2.5g/L) combined with Trichoderma bio-agent',
      'Neem formulation (10,000 ppm at 2ml/L)'
    ],
    chemicalTreatment: [
      'Chlorothalonil 75 WP or Mancozeb 75 WP',
      'Fluopyram + Trifloxystrobin or Azoxystrobin'
    ],
    preventiveMeasures: [
      'Maintain wide plant spacing for fast morning leaf drying',
      'Practice 3-year crop rotation',
      'Use drip irrigation instead of sprinklers'
    ],
    affectedParts: ['Leaves', 'Stems', 'Fruit'],
    simpleExplanation: 'Brown circular spots with target rings that damage leaves and create sunken pitted sores on tomato fruit.',
    regionalNames: {
      ta: 'தக்காளி இலக்கு புள்ளி நோய் (Target Spot)',
      hi: 'टमाटर का टार्गेट स्पॉट रोग (Target Spot)',
      te: 'టమోటా టార్గెట్ స్పాట్ తెగులు',
      kn: 'ಟೊಮ್ಯಾಟೊ ಟಾರ್ಗೆಟ್ ಸ್ಪಾಟ್ ರೋಗ',
      ml: 'തക്കാളി ടാർഗറ്റ് സ്പോട്ട്',
      mr: 'टोमॅटो टार्गेट स्पॉट',
      bn: 'টমেটোর টার্গেট স্পট রোগ'
    }
  },
  {
    crop: 'Tomato',
    diseaseName: 'Mosaic Virus',
    scientificName: 'Tomato mosaic virus (ToMV)',
    classId: 'Tomato___Tomato_mosaic_virus',
    isHealthy: false,
    severity: 'High',
    symptoms: [
      'Mottled light green and dark green mosaic patterns on leaves',
      'Leaves curled, crinkled, distorted, or strap-like ("shoestring" symptom)',
      'Severe stunting of young tomato plants and poor fruit set',
      'Uneven fruit ripening with internal brown browning rings'
    ],
    causes: [
      'Extremely contagious, mechanically transmitted Tobamovirus',
      'Transmitted via workers hands, tools, grafting clippers, and tobacco smokers',
      'Survives in seed coats and dried plant debris for years'
    ],
    treatment: [
      'No chemical cure exists for viruses. Immediately rogue (uproot) and burn infected plants',
      'Wash hands thoroughly with soap/milk before handling healthy plants',
      'Sterilize pruning scissors with 20% non-fat dry milk solution or 10% bleach'
    ],
    organicTreatment: [
      'Spray non-fat dry milk solution (100g/L) as a mechanical transmission inhibitor',
      'Neem-based sprays to repel sap-feeding vector pests'
    ],
    chemicalTreatment: [
      'No chemical fungicide or bactericide works on viruses. Control aphid/thrip vectors with systemic insecticides if present.'
    ],
    preventiveMeasures: [
      'Plant certified virus-resistant varieties (labeled with "Tm" or "ToMV")',
      'Enforce strict handwashing before entering polyhouses; prohibit smoking in the field',
      'Collect and destroy all post-harvest roots and crop residues'
    ],
    affectedParts: ['Leaves', 'Growing tips', 'Flowers', 'Fruit'],
    simpleExplanation: 'A viral disease causing crinkled, patchy light and dark green leaves. Cannot be cured with spray; infected plants must be removed immediately to protect the field.',
    regionalNames: {
      ta: 'தக்காளி மொசைக் வைரஸ் நோய் (Mosaic Virus)',
      hi: 'टमाटर का मोज़ेक वायरस रोग (Mosaic Virus)',
      te: 'టమోటా మొజాయిక్ వైరస్ తెగులు',
      kn: 'ಟೊಮ್ಯಾಟೊ ಮೊಸಾಯಿಕ್ ವೈರಸ್',
      ml: 'തക്കാളി മൊസൈക് വൈറസ്',
      mr: 'टोमॅटो मोझॅक विषाणू रोग',
      bn: 'টমেটোর মোজাইক ভাইরাস'
    }
  },
  {
    crop: 'Tomato',
    diseaseName: 'Healthy',
    classId: 'Tomato___healthy',
    isHealthy: true,
    severity: 'None',
    symptoms: ['Vigorous green foliage, healthy leaflets, strong upright stem, no spots or pests'],
    causes: ['Balanced fertility, optimal watering, and good pest management'],
    treatment: ['No corrective action needed. Continue regular field scouting.'],
    organicTreatment: ['Weekly foliar spray with diluted jeevamrutha or panchagavya (3%) to sustain leaf gloss and vigor.'],
    chemicalTreatment: ['None required.'],
    preventiveMeasures: [
      'Continue drip irrigation scheduling based on soil tensiometer readings',
      'Prune lower suckers to maintain balance between fruit load and foliage'
    ],
    affectedParts: ['None'],
    simpleExplanation: 'Your tomato plant leaf is vibrant, clean, and in prime condition.',
    regionalNames: {
      ta: 'ஆரோக்கியமான தக்காளி பயிர் (Healthy)',
      hi: 'स्वस्थ टमाटर (Healthy)',
      te: 'ఆరోగ్యకరమైన టమోటా',
      kn: 'ಆರೋಗ್ಯಕರ ಟೊಮ್ಯಾಟೊ',
      ml: 'ആരോഗ്യമുള്ള തക്കാളി',
      mr: 'निरोगी टोमॅटो',
      bn: 'স্বাস্থ্যকর টমেটো'
    }
  }
];

const REGIONAL_ADVISORIES_DATA = [
  {
    state: 'Tamil Nadu',
    district: 'Chengalpattu',
    crop: 'Tomato',
    season: 'Kharif',
    language: 'ta',
    advisory: 'தக்காளி பயிரில் ஆரம்பகால கருகல் நோய் தடுப்புக்காக மாலையில் தெளிப்பு நீர் பாசனத்தை தவிர்க்கவும். சொட்டு நீர் பாசனம் பயன்படுத்தவும்.',
    preventiveMeasures: [
      'செடிகளுக்கு இடையே 60 செ.மீ இடைவெளி விடவும்',
      'அடிக்கடி இலைகளை பரிசோதிக்கவும்',
      'வேப்ப எண்ணெய் 3% தெளிக்கவும்'
    ]
  },
  {
    state: 'Tamil Nadu',
    district: 'Chengalpattu',
    crop: 'Tomato',
    season: 'Kharif',
    language: 'en',
    advisory: 'Avoid evening sprinkler irrigation in tomato fields to minimize early blight spore germination. Maintain drip lines and scout weekly.',
    preventiveMeasures: [
      'Maintain 60cm row spacing for good air movement',
      'Scout lower leaves weekly for brown target spots',
      'Apply neem oil 3ml/L preventively'
    ]
  },
  {
    state: 'Maharashtra',
    district: 'Pune',
    crop: 'Potato',
    season: 'Rabi',
    language: 'mr',
    advisory: 'बटाटा पिकावर करपा रोगाचा प्रादुर्भाव रोखण्यासाठी ढगाळ हवामानात प्रतिबंधात्मक बुरशीनाशकाची फवारणी करावी.',
    preventiveMeasures: [
      'प्रमाणित बियाणे वापरा',
      'झाडांच्या बुडाशी माती लावा',
      'ट्रायकोडर्मा व्हिरीडीचा वापर करा'
    ]
  },
  {
    state: 'Punjab',
    district: 'Ludhiana',
    crop: 'Tomato',
    season: 'Rabi',
    language: 'hi',
    advisory: 'सर्दियों की शुरुआत में कोहरे और अधिक नमी से पछेती झुलसा का खतरा बढ़ जाता है। समय पर दवा का छिड़काव सुनिश्चित करें।',
    preventiveMeasures: [
      'नियमित जल निकासी की जांच करें',
      'रोगग्रस्त पौधों को तुरंत खेत से बाहर निकालें',
      'मेन्कोज़ेब का सही मात्रा में छिड़काव करें'
    ]
  }
];

async function seed() {
  try {
    console.log('🌱 Connecting to MongoDB for seeding...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB.');

    // 1. Clear old diseases and insert 18 PlantVillage classes
    await Disease.deleteMany({});
    const insertedDiseases = await Disease.insertMany(DISEASES_DATA);
    console.log(`✅ Successfully seeded ${insertedDiseases.length} disease classes into MongoDB!`);

    // 2. Clear old regional advisories and insert
    await RegionalAdvisory.deleteMany({});
    const insertedReg = await RegionalAdvisory.insertMany(REGIONAL_ADVISORIES_DATA);
    console.log(`✅ Seeded ${insertedReg.length} regional advisories!`);

    // 3. Create Admin and Farmer users
    await User.deleteMany({ email: { $in: ['admin@agriguard.com', 'farmer@agriguard.com'] } });
    
    const adminUser = new User({
      name: 'Dr. Ramesh Kumar (Agri Admin)',
      email: 'admin@agriguard.com',
      password: 'Admin@12345',
      role: 'admin',
      phone: '+91 98401 23456',
      location: {
        state: 'Tamil Nadu',
        district: 'Chengalpattu',
        village: 'Kattankulathur',
        lat: 12.823,
        lon: 80.044
      },
      preferredLanguage: 'en',
      farmDetails: {
        primaryCrop: 'Multiple Crops',
        farmSize: 'Research Farm',
        irrigationType: 'Smart Drip'
      }
    });
    await adminUser.save();

    const farmerUser = new User({
      name: 'Murugan Farmer',
      email: 'farmer@agriguard.com',
      password: 'Farmer@12345',
      role: 'farmer',
      phone: '+91 94440 98765',
      location: {
        state: 'Tamil Nadu',
        district: 'Chengalpattu',
        village: 'Maraimalai Nagar',
        lat: 12.798,
        lon: 80.021
      },
      preferredLanguage: 'ta',
      farmDetails: {
        primaryCrop: 'Tomato',
        farmSize: '3.5 Acres',
        irrigationType: 'Drip Irrigation'
      }
    });
    await farmerUser.save();
    console.log('✅ Created Admin (admin@agriguard.com / Admin@12345) and Farmer (farmer@agriguard.com / Farmer@12345)');

    // 4. Create sample initial scans for demo & charts
    await Scan.deleteMany({ userId: farmerUser._id });
    const sampleScans = [
      {
        userId: farmerUser._id,
        imageUrl: '/demo_leaves/tomato_early_blight_demo.jpg',
        crop: 'Tomato',
        disease: 'Early Blight',
        confidence: 94.52,
        confidenceLevel: 'High',
        isHealthy: false,
        topPredictions: [
          { crop: 'Tomato', disease: 'Early Blight', confidence: 94.52, isHealthy: false },
          { crop: 'Tomato', disease: 'Target Spot', confidence: 3.84, isHealthy: false },
          { crop: 'Potato', disease: 'Early Blight', confidence: 1.12, isHealthy: false }
        ],
        diseaseDetails: {
          symptoms: ['Dark brown concentric rings on lower leaves', 'Yellow halos', 'Leaf drop'],
          causes: ['Alternaria fungus', 'High humidity (>80%)', 'Overhead watering'],
          severity: 'High',
          treatment: ['Prune lower leaves', 'Use drip watering', 'Apply recommended fungicide'],
          organicTreatment: ['Neem oil spray (3-5 ml/L)', 'Copper oxychloride 2.5g/L'],
          chemicalTreatment: ['Chlorothalonil 75 WP or Mancozeb 75 WP'],
          preventiveMeasures: ['60cm plant spacing', 'Drip irrigation', 'Crop rotation']
        },
        advisory: {
          headline: 'Tomato – Early Blight detected with high confidence (94.52%)',
          recommendations: ['Maintain 60cm plant spacing', 'Drip irrigation', 'Rotate solanaceous crops'],
          weatherRiskNotice: 'High humidity (>75%) increases fungal spore germination. Ensure good row ventilation.',
          priority: 'High',
          listenText: 'Early Blight detected in Tomato with 94% confidence. Prune lower infected leaves and avoid wetting leaves when watering.'
        },
        weatherAtScan: {
          temperature: 29.5,
          humidity: 82,
          condition: 'Humid & Overcast',
          windSpeed: 12,
          rainfall: 2.5,
          locationName: 'Chengalpattu, Tamil Nadu'
        },
        status: 'Action Needed',
        notes: 'Observed on field plot B during morning inspection',
        createdAt: new Date(Date.now() - 3 * 86400000)
      },
      {
        userId: farmerUser._id,
        imageUrl: '/demo_leaves/tomato_healthy_demo.jpg',
        crop: 'Tomato',
        disease: 'Healthy',
        confidence: 98.15,
        confidenceLevel: 'High',
        isHealthy: true,
        topPredictions: [
          { crop: 'Tomato', disease: 'Healthy', confidence: 98.15, isHealthy: true },
          { crop: 'Pepper', disease: 'Healthy', confidence: 1.25, isHealthy: true }
        ],
        diseaseDetails: {
          symptoms: ['Clean green leaf canopy', 'No spots or lesions'],
          causes: ['Optimal fertility and drip irrigation'],
          severity: 'None',
          treatment: ['Continue regular crop scout checks'],
          organicTreatment: ['Panchagavya 3% foliar spray'],
          chemicalTreatment: ['None required'],
          preventiveMeasures: ['Balanced N-P-K', 'Weed control']
        },
        advisory: {
          headline: 'Tomato: Your crop appears healthy!',
          recommendations: ['Maintain balanced irrigation and routine scout checks'],
          weatherRiskNotice: 'Weather is favorable for crop growth.',
          priority: 'Low',
          listenText: 'Your tomato plant leaf is healthy with no sign of disease.'
        },
        weatherAtScan: {
          temperature: 28.0,
          humidity: 68,
          condition: 'Partly Cloudy',
          windSpeed: 14,
          rainfall: 0,
          locationName: 'Chengalpattu, Tamil Nadu'
        },
        status: 'Healthy',
        notes: 'Plot A tomatoes after flowering stage',
        createdAt: new Date(Date.now() - 1 * 86400000)
      },
      {
        userId: farmerUser._id,
        imageUrl: '/demo_leaves/potato_early_blight_demo.jpg',
        crop: 'Potato',
        disease: 'Early Blight',
        confidence: 88.40,
        confidenceLevel: 'High',
        isHealthy: false,
        topPredictions: [
          { crop: 'Potato', disease: 'Early Blight', confidence: 88.40, isHealthy: false },
          { crop: 'Potato', disease: 'Late Blight', confidence: 7.20, isHealthy: false }
        ],
        diseaseDetails: {
          symptoms: ['Target-board brown spots on older potato leaves', 'Yellow margins'],
          causes: ['Alternaria fungus', 'Moisture fluctuations'],
          severity: 'Medium',
          treatment: ['Remove lower spotted leaves', 'Ensure regular soil moisture'],
          organicTreatment: ['Copper oxychloride 3g/L'],
          chemicalTreatment: ['Mancozeb 75 WP'],
          preventiveMeasures: ['Hill up soil properly', 'Plant certified tubers']
        },
        advisory: {
          headline: 'Potato – Early Blight detected with 88% confidence',
          recommendations: ['Hill up potato rows', 'Avoid overhead water splashes'],
          weatherRiskNotice: 'Humid weather with warm afternoons fosters Alternaria development.',
          priority: 'Medium',
          listenText: 'Early Blight detected in Potato. Remove lower affected leaves and spray protective bio-fungicide.'
        },
        weatherAtScan: {
          temperature: 27.2,
          humidity: 76,
          condition: 'Scattered Clouds',
          windSpeed: 10,
          rainfall: 0,
          locationName: 'Chengalpattu, Tamil Nadu'
        },
        status: 'Treated',
        notes: 'Treated with bio-copper formulation',
        createdAt: new Date()
      }
    ];

    await Scan.insertMany(sampleScans);
    console.log(`✅ Seeded ${sampleScans.length} historical scans for dashboard analytics!`);

    console.log('========================================================');
    console.log('🌾 AgriGuard AI Seed Completed Successfully!');
    console.log('  • Admin:  admin@agriguard.com  / Admin@12345');
    console.log('  • Farmer: farmer@agriguard.com / Farmer@12345');
    console.log('========================================================');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
}

seed();
