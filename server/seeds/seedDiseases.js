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
      'Stake or trellis plants to elevate foliage off moist soil',
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
,
{
  "crop": "Corn",
  "diseaseName": "Common Rust",
  "scientificName": "Puccinia sorghi",
  "classId": "Corn_(maize)___Common_rust_",
  "isHealthy": false,
  "severity": "High",
  "symptoms": [
    "Small, powdery cinnamon-brown to golden-brown pustules on both upper and lower leaf surfaces",
    "Pustules rupture epidermal leaf tissue, releasing rust-colored fungal urediniospores",
    "Severe chlorosis, leaf blighting, and premature senescence in susceptible maize hybrids"
  ],
  "causes": [
    "Puccinia sorghi fungal spores carried over long distances on high altitude southern winds",
    "Prolonged cool to moderate temperatures (16°C to 25°C) and high relative humidity (>95%)",
    "Heavy morning dew and fog lasting 6+ hours"
  ],
  "treatment": [
    "Scout lower leaves before tasseling; count pustules per leaf collar",
    "Apply protective foliar bio-fungicides or strobilurin fungicides at first sign of pustules",
    "Maintain balanced plant nutrition to avoid excessive nitrogen stress"
  ],
  "organicTreatment": [
    "Liquid sulfur formulation (3g/L) during early vegetative stages",
    "Neem seed kernel extract (NSKE 5%) foliar spray",
    "Bacillus subtilis bio-fungicide foliar application"
  ],
  "chemicalTreatment": [
    "Azoxystrobin 18.2% + Difenoconazole 11.4% SC (1ml/L)",
    "Pyraclostrobin 20% WG or Mancozeb 75 WP (2.5g/L)"
  ],
  "chemicalWarning": "Apply when pustules appear on lower leaves before silking. Strictly observe pre-harvest interval.",
  "preventiveMeasures": [
    "Plant rust-resistant corn hybrid varieties with Rp gene resistance",
    "Early planting to avoid peak mid-season airborne spore migrations",
    "Balanced potassium fertilization to strengthen stalk and leaf cell walls"
  ],
  "affectedParts": [
    "Leaves",
    "Leaf sheaths",
    "Husk leaves"
  ],
  "simpleExplanation": "Powdery reddish-brown rust spots on corn leaves caused by wind-borne fungus during cool, damp weather.",
  "regionalNames": {
    "ta": "சோளம் பொது துரு நோய் (Common Rust)",
    "hi": "मक्का का सामान्य रतुआ रोग (Common Rust)",
    "te": "మొక్కజొన్న సాధారణ తుప్పు తెగులు",
    "kn": "ಮೆಕ್ಕೆಜೋಳದ ಸಾಮಾನ್ಯ ತುಕ್ಕು ರೋಗ",
    "ml": "ചോളം തുരുമ്പ് രോഗം",
    "mr": "मका तांबेरा रोग",
    "bn": "ভুট্টার সাধারণ মরিচা রোগ"
  }
},
{
  "crop": "Corn",
  "diseaseName": "Cercospora Leaf Spot",
  "scientificName": "Cercospora zeae-maydis",
  "classId": "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot",
  "isHealthy": false,
  "severity": "High",
  "symptoms": [
    "Small, tan or gray rectangular lesions parallel to leaf veins",
    "Lesions enlarge into long, rectangular block-shaped gray spots bounded by veins",
    "Entire leaf tissue turns gray and blighted under high disease pressure"
  ],
  "causes": [
    "Cercospora fungal spores surviving in corn surface residues",
    "Warm, humid weather (24°C to 30°C) with persistent fog or dew",
    "Continuous minimum-tillage corn farming"
  ],
  "treatment": [
    "Bury infected crop residues after harvest through clean tillage",
    "Apply foliar fungicide if lesions reach the third leaf below the ear leaf before pollination",
    "Ensure adequate row spacing for canopy airflow"
  ],
  "organicTreatment": [
    "Copper oxychloride 50 WP (2.5g/L)",
    "Trichoderma viride foliar spray (5g/L)"
  ],
  "chemicalTreatment": [
    "Azoxystrobin + Propiconazole (1ml/L)",
    "Trifloxystrobin + Tebuconazole 75 WG (0.7g/L)"
  ],
  "chemicalWarning": "Fungicide application is most cost-effective between tasseling (VT) and early silking (R1).",
  "preventiveMeasures": [
    "Plant resistant maize hybrids",
    "Rotate fields away from corn for at least 1-2 years",
    "Manage surface residue with post-harvest chopping"
  ],
  "affectedParts": [
    "Lower leaves",
    "Middle canopy leaves",
    "Leaf sheaths"
  ],
  "simpleExplanation": "Rectangular gray spots running between corn leaf veins, common in humid, foggy conditions.",
  "regionalNames": {
    "ta": "சோளம் சாம்பல் இலைப்புள்ளி நோய் (Gray Leaf Spot)",
    "hi": "मक्का का धूसर पत्ती धब्बा (Gray Leaf Spot)",
    "te": "మొక్కజొన్న బూడిద ఆకుమచ్చ తెగులు",
    "kn": "ಮೆಕ್ಕೆಜೋಳದ ಬೂದು ಎಲೆ ಕಲೆ ರೋಗ",
    "ml": "ചോളം ചാരനിറത്തിലുള്ള ഇലപ്പുള്ളി",
    "mr": "मका करपा रोग",
    "bn": "ভুট্টার ধূসর পাতার দাগ"
  }
},
{
  "crop": "Corn",
  "diseaseName": "Northern Leaf Blight",
  "scientificName": "Exserohilum turcicum",
  "classId": "Corn_(maize)___Northern_Leaf_Blight",
  "isHealthy": false,
  "severity": "High",
  "symptoms": [
    "Long, elliptical, cigar-shaped grayish-green to tan lesions (2.5cm to 15cm long)",
    "Lesions show dark dusty fungal spore layers in damp mornings",
    "Leaves become shredded, dry, and brittle"
  ],
  "causes": [
    "Fungus surviving in corn debris over winter",
    "Moderate temperatures (18°C - 27°C) with frequent rain or overhead irrigation",
    "Extended leaf wetness (6 to 12 hours)"
  ],
  "treatment": [
    "Deep tillage of infected stubble post-harvest",
    "Foliar fungicide application if lesions appear before silking stage",
    "Avoid overhead sprinkler irrigation late in the evening"
  ],
  "organicTreatment": [
    "Pseudomonas fluorescens foliar spray (5g/L)",
    "Liquid copper formulation (2.5ml/L)"
  ],
  "chemicalTreatment": [
    "Mancozeb 75 WP (2.5g/L) or Propiconazole 25 EC (1ml/L)",
    "Azoxystrobin 23% SC (1ml/L)"
  ],
  "chemicalWarning": "Spray at first sign on lower leaves before disease moves up into the ear zone.",
  "preventiveMeasures": [
    "Plant resistant corn hybrids carrying Ht genes",
    "Rotate with non-host crops (soybean, vegetables)",
    "Avoid excess plant population densities"
  ],
  "affectedParts": [
    "Leaves",
    "Ear husks"
  ],
  "simpleExplanation": "Large cigar-shaped grayish-tan blighted patches on corn leaves caused by fungus during damp weather.",
  "regionalNames": {
    "ta": "சோளம் வட இலை கருகல் நோய் (Northern Leaf Blight)",
    "hi": "मक्का का उत्तरी पत्ती झुलसा रोग",
    "te": "మొక్కజొన్న ఉత్తర ఆకు ఎండు తెగులు",
    "kn": "ಮೆಕ್ಕೆಜೋಳದ ಉತ್ತರ ಎಲೆ ಕಮಟು ರೋಗ",
    "ml": "ചോളം ഇല കരിച്ചിൽ",
    "mr": "मका तुरा करपा",
    "bn": "ভুট্টার উত্তর পাতার ধসা রোগ"
  }
},
{
  "crop": "Corn",
  "diseaseName": "Healthy",
  "scientificName": "Zea mays",
  "classId": "Corn_(maize)___healthy",
  "isHealthy": true,
  "severity": "None",
  "symptoms": [
    "Broad, deep green leaves with strong central midribs, upright stalks, and clean silk"
  ],
  "causes": [
    "Optimal soil nutrients, balanced moisture, and good weed control"
  ],
  "treatment": [
    "No treatment required. Maintain standard corn crop agronomy."
  ],
  "organicTreatment": [
    "Apply vermicompost or jeevamrutha during knee-high and tasseling stages."
  ],
  "chemicalTreatment": [
    "None required."
  ],
  "preventiveMeasures": [
    "Side-dress nitrogen according to growth stage (V6 and V10)",
    "Monitor for fall armyworm and rust symptoms weekly"
  ],
  "affectedParts": [
    "None"
  ],
  "simpleExplanation": "Your maize/corn crop displays vigorous, dark green foliage with excellent health.",
  "regionalNames": {
    "ta": "ஆரோக்கியமான சோளப் பயிர் (Healthy Corn)",
    "hi": "स्वस्थ मक्का (Healthy Corn)",
    "te": "ఆరోగ్యకరమైన మొక్కజొన్న",
    "kn": "ಆರೋಗ್ಯಕರ ಮೆಕ್ಕೆಜೋಳ",
    "ml": "ആരോഗ്യമുള്ള ചോളം",
    "mr": "निरोगी मका",
    "bn": "স্বাস্থ্যকর ভুট্টা"
  }
},
{
  "crop": "Peach",
  "diseaseName": "Bacterial Spot",
  "scientificName": "Xanthomonas arboricola pv. pruni",
  "classId": "Peach___Bacterial_spot",
  "isHealthy": false,
  "severity": "High",
  "symptoms": [
    "Small angular water-soaked dark spots on leaves, becoming purple-black",
    "Centers of spots drop out giving a shot-hole appearance",
    "Deep pitted cracks and gummy lesions on ripening peach fruit"
  ],
  "causes": [
    "Bacterium overwintering in twig cankers and bud scales",
    "Warm, wet, windy weather (21°C - 30°C) with blowing rain",
    "Sandy soil causing nutrient stress and wind abrasions"
  ],
  "treatment": [
    "Prune out infected twig cankers during winter dormancy",
    "Apply protective copper or oxytetracycline sprays starting at shuck split",
    "Avoid overhead sprinkler irrigation"
  ],
  "organicTreatment": [
    "Copper hydroxide spray during dormancy and bud swell",
    "Zinc sulfate + hydrated lime spray mix (Bordeaux analog)"
  ],
  "chemicalTreatment": [
    "Oxytetracycline (Mycoshield) at 150-200 ppm",
    "Copper octanoate (low-rate copper to avoid phytotoxicity on peach leaves)"
  ],
  "chemicalWarning": "Peach leaves are sensitive to copper injury. Never apply high-rate copper after petal fall.",
  "preventiveMeasures": [
    "Plant bacterial spot-resistant peach cultivars",
    "Erect windbreaks around orchard perimeters in sandy sites",
    "Maintain balanced potassium and nitrogen nutrition"
  ],
  "affectedParts": [
    "Leaves",
    "Fruit",
    "Twigs"
  ],
  "simpleExplanation": "Angular dark spots that fall out leaving shot-holes in peach leaves, and cracking fruit.",
  "regionalNames": {
    "ta": "பீச் பாக்டீரியா புள்ளி நோய் (Bacterial Spot)",
    "hi": "आड़ू का जीवाणु धब्बा रोग",
    "te": "పీచ్ బ్యాక్టీరియల్ మచ్చ తెగులు",
    "kn": "ಪೀಚ್ ಬ್ಯಾಕ್ಟೀರಿಯಾ ಕಲೆ ರೋಗ",
    "ml": "പീച്ച് ബാക്ടീരിയൽ സ്പോട്ട്",
    "mr": "पीच जिवाणूजन्य ठिपके",
    "bn": "পিচ ফলের ব্যাক্টেরিয়াল দাগ"
  }
},
{
  "crop": "Peach",
  "diseaseName": "Healthy",
  "scientificName": "Prunus persica",
  "classId": "Peach___healthy",
  "isHealthy": true,
  "severity": "None",
  "symptoms": [
    "Lush, spear-shaped green peach leaves with smooth margins, no spotting or leaf curl"
  ],
  "causes": [
    "Good orchard sanitation, dormant spray coverage, and balanced fertilization"
  ],
  "treatment": [
    "No treatment required. Maintain routine orchard management."
  ],
  "organicTreatment": [
    "Apply organic mulch around drip lines; spray seaweed extract for fruit sizing."
  ],
  "chemicalTreatment": [
    "None required."
  ],
  "preventiveMeasures": [
    "Maintain open-center canopy pruning for maximum sunlight penetration",
    "Monitor for peach leaf curl and aphids in spring"
  ],
  "affectedParts": [
    "None"
  ],
  "simpleExplanation": "Your peach foliage is clean, healthy, and developing vigorously.",
  "regionalNames": {
    "ta": "ஆரோக்கியமான பீச் மரம் (Healthy Peach)",
    "hi": "स्वस्थ आड़ू (Healthy Peach)",
    "te": "ఆరోగ్యకరమైన పీచ్",
    "kn": "ಆರೋಗ್ಯಕರ ಪೀಚ್",
    "ml": "ആരോഗ്യമുള്ള പീച്ച്",
    "mr": "निरोगी पीच",
    "bn": "স্বাস্থ্যকর পিচ"
  }
},
{
  "crop": "Grape",
  "diseaseName": "Black Rot",
  "scientificName": "Guignardia bidwellii",
  "classId": "Grape___Black_rot",
  "isHealthy": false,
  "severity": "High",
  "symptoms": [
    "Small, round reddish-brown spots with dark borders on grape leaves",
    "Tiny black fruiting bodies (pycnidia) arranged in a ring inside spots",
    "Grape berries turn brown, shrivel into hard, black wrinkled mummies"
  ],
  "causes": [
    "Fungus overwintering in mummified berries left on the vine or ground",
    "Warm, wet weather (21°C - 32°C) with 6-7 hours of continuous leaf wetness",
    "Splashing rain dispersing ascospores in early spring"
  ],
  "treatment": [
    "Rake and remove all mummified berries from the vine and vineyard floor",
    "Prune vines in dormancy to increase sun exposure and rapid drying",
    "Apply protective fungicides from bud break through 4 weeks post-bloom"
  ],
  "organicTreatment": [
    "Liquid copper sprays at 5cm shoot growth and before bloom",
    "Neem seed kernel extract or bio-fungicide formulations"
  ],
  "chemicalTreatment": [
    "Myclobutanil 40 WP (0.5g/L) or Mancozeb 75 WP (2g/L)",
    "Kresoxim-methyl 44.3% SC or Difenoconazole 25 EC"
  ],
  "chemicalWarning": "Critical protection period is from early bloom until berries develop natural resistance.",
  "preventiveMeasures": [
    "Keep grape clusters open to air using shoot thinning and leaf pulling",
    "Eliminate wild grapevines within 500 meters of the vineyard",
    "Avoid overhead sprinkler irrigation"
  ],
  "affectedParts": [
    "Leaves",
    "Shoots",
    "Tendrils",
    "Grape berries"
  ],
  "simpleExplanation": "Red-brown spots with tiny black rings on grape leaves, causing grapes to shrivel into black mummies.",
  "regionalNames": {
    "ta": "திராட்சை கருப்பு அழுகல் நோய் (Black Rot)",
    "hi": "अंगूर का काला सड़न रोग (Black Rot)",
    "te": "ద్రాక్ష నల్ల కుళ్ళు తెగులు",
    "kn": "ದ್ರಾಕ್ಷಿ ಕಪ್ಪು ಕೊಳೆ ರೋಗ",
    "ml": "മുന്തിരി കറുത്ത അഴുകൽ",
    "mr": "द्राक्ष काळा कुजवा",
    "bn": "আঙুরের কালো পচা রোগ"
  }
},
{
  "crop": "Grape",
  "diseaseName": "Esca (Black Measles)",
  "scientificName": "Phaeomoniella chlamydospora",
  "classId": "Grape___Esca_(Black_Measles)",
  "isHealthy": false,
  "severity": "Critical",
  "symptoms": [
    "Distinctive 'tiger-stripe' leaf pattern: yellow and brown necrosis between green veins",
    "Grape berries show dark purple/black spots resembling measles",
    "Vines show sudden apoplexy (sudden vine wilt and death during midsummer heat)"
  ],
  "causes": [
    "Complex fungal trunk disease infecting large pruning wounds",
    "Wood-rotting fungi spreading through xylem vessels",
    "Drought stress followed by intense summer heat"
  ],
  "treatment": [
    "Prune infected arms down to clean, healthy wood; sterilize pruning shears",
    "Seal all large pruning wounds immediately with pruning wound sealant or Trichoderma",
    "Uproot and burn dead or collapsed vines"
  ],
  "organicTreatment": [
    "Trichoderma atroviride pruning wound protectant",
    "Foliar calcium and seaweed extracts to reduce heat stress"
  ],
  "chemicalTreatment": [
    "No systemic curative chemical exists for deep wood necrosis. Prevent wound infections with Thiophanate-methyl or pyraclostrobin wound sprays."
  ],
  "chemicalWarning": "Prune late in dormancy when wounds heal fastest. Paint wounds within 24 hours of cutting.",
  "preventiveMeasures": [
    "Adopt double-pruning or delayed pruning techniques",
    "Sanitize shears between vines with 70% alcohol or 10% bleach",
    "Use certified disease-free rootstocks and grafted benchgrafts"
  ],
  "affectedParts": [
    "Leaves",
    "Vascular wood",
    "Grape bunches"
  ],
  "simpleExplanation": "Trunk disease causing tiger-stripe leaves and measles spots on grapes. Prevent through clean pruning.",
  "regionalNames": {
    "ta": "திராட்சை எஸ்கா / கருப்பு தட்டம்மை (Esca)",
    "hi": "अंगूर का एस्का रोग (Black Measles)",
    "te": "ద్రాక్ష ఎస్కా తెగులు",
    "kn": "ದ್ರಾಕ್ಷಿ ಎಸ್ಕಾ ರೋಗ",
    "ml": "മുന്തിരി എസ്ക രോഗം",
    "mr": "द्राक्ष एस्का रोग",
    "bn": "আঙুরের এসকা রোগ"
  }
},
{
  "crop": "Grape",
  "diseaseName": "Leaf Blight",
  "scientificName": "Pseudocercospora vitis",
  "classId": "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)",
  "isHealthy": false,
  "severity": "Medium",
  "symptoms": [
    "Irregular brown to black angular lesions on grape leaves",
    "Dark olive to brownish-gray velvety spore mat on the underside of spots",
    "Severe premature defoliation exposing grape clusters to sunscald"
  ],
  "causes": [
    "Fungus surviving in fallen leaves and dormant cane crevices",
    "Warm temperatures (22°C - 28°C) accompanied by high relative humidity",
    "Dense canopy with poor air movement"
  ],
  "treatment": [
    "Remove fallen leaves after harvest and cultivate vineyard soil",
    "Apply protective copper or triazole fungicide after fruit set",
    "Summer leaf removal around the fruiting zone"
  ],
  "organicTreatment": [
    "Bordeaux mixture (1%) post-pruning and after berry set",
    "Copper hydroxide spray (2g/L)"
  ],
  "chemicalTreatment": [
    "Mancozeb 75 WP (2g/L) or Carbendazim 50 WP (1g/L)",
    "Azoxystrobin 23% SC (1ml/L)"
  ],
  "chemicalWarning": "Spray thoroughly on both upper and lower leaf surfaces. Observe pre-harvest safety interval.",
  "preventiveMeasures": [
    "Ensure trellis orientation captures prevailing summer winds",
    "Maintain adequate vine spacing and shoot thinning",
    "Avoid excess nitrogen fertilizer that creates dense foliage"
  ],
  "affectedParts": [
    "Leaves",
    "Canes"
  ],
  "simpleExplanation": "Angular brown spots with velvety underside mats that cause grape leaves to drop prematurely.",
  "regionalNames": {
    "ta": "திராட்சை இலை கருகல் நோய் (Leaf Blight)",
    "hi": "अंगूर का पत्ती झुलसा रोग (Leaf Blight)",
    "te": "ద్రాక్ష ఆకు ఎండు తెగులు",
    "kn": "ದ್ರಾಕ್ಷಿ ಎಲೆ ಕಮಟು ರೋಗ",
    "ml": "മുന്തിരി ഇല കരിച്ചിൽ",
    "mr": "द्राक्ष पानावरील करपा",
    "bn": "আঙুরের পাতার ধসা রোগ"
  }
},
{
  "crop": "Grape",
  "diseaseName": "Healthy",
  "scientificName": "Vitis vinifera",
  "classId": "Grape___healthy",
  "isHealthy": true,
  "severity": "None",
  "symptoms": [
    "Lush, bright green palmately-lobed grape leaves with smooth edges and vigorous tendrils"
  ],
  "causes": [
    "Proper canopy management, balanced fertigation, and regular scouting"
  ],
  "treatment": [
    "No treatment required. Continue regular canopy upkeep."
  ],
  "organicTreatment": [
    "Foliar spray of fish amino acid or cow urine (5%) to enhance leaf luster."
  ],
  "chemicalTreatment": [
    "None required."
  ],
  "preventiveMeasures": [
    "Keep canopies open to light and wind through canopy hedging",
    "Maintain drip fertigation based on vine vegetative vigor"
  ],
  "affectedParts": [
    "None"
  ],
  "simpleExplanation": "Your grape foliage is healthy, clean, and carrying strong photosynthesizing canopy.",
  "regionalNames": {
    "ta": "ஆரோக்கியமான திராட்சை கொடி (Healthy Grape)",
    "hi": "स्वस्थ अंगूर (Healthy Grape)",
    "te": "ఆరోగ్యకరమైన ద్రాక్ష",
    "kn": "ಆರೋಗ್ಯಕರ ದ್ರಾಕ್ಷಿ",
    "ml": "ആരോഗ്യമുള്ള മുന്തിരി",
    "mr": "निरोगी द्राक्ष",
    "bn": "স্বাস্থ্যকর আঙুর"
  }
},
{
  "crop": "Tomato",
  "diseaseName": "Yellow Leaf Curl Virus",
  "scientificName": "Tomato yellow leaf curl virus (TYLCV)",
  "classId": "Tomato___Tomato_Yellow_Leaf_Curl_Virus",
  "isHealthy": false,
  "severity": "Critical",
  "symptoms": [
    "Severe upward cupping and curling of tomato leaflets",
    "Interveinal yellowing (chlorosis) and distinct bright yellow leaf margins",
    "Severe stunting of plant height; bushy dwarf appearance",
    "Complete flower drop resulting in total yield loss if infected early"
  ],
  "causes": [
    "Begomovirus transmitted exclusively by the sweetpotato whitefly (Bemisia tabaci)",
    "Warm tropical and Mediterranean climates favoring rapid whitefly multiplication",
    "Weed reservoirs and nearby infected solanaceous plantings"
  ],
  "treatment": [
    "No chemical cure exists for viral infection; rogue and bury infected tomato plants immediately",
    "Target whitefly vectors rigorously using physical barriers and systemic control",
    "Hang yellow sticky cards (15-20 per acre) across the field"
  ],
  "organicTreatment": [
    "Install 50-mesh insect-proof netting in nurseries",
    "Neem oil spray (5ml/L) or Pongamia oil to deter whiteflies",
    "Beauveria bassiana entomopathogenic fungus against whitefly nymphs"
  ],
  "chemicalTreatment": [
    "Thiamethoxam 25 WG (0.3g/L) or Imidacloprid 17.8 SL (0.5ml/L)",
    "Spiromesifen 22.9 SC or Diafenthiuron 50 WP for whitefly resistance management"
  ],
  "chemicalWarning": "Rotate insecticide modes of action to prevent rapid whitefly resistance development.",
  "preventiveMeasures": [
    "Plant TYLCV-resistant hybrid tomato varieties (Ty-1, Ty-2, Ty-3 genes)",
    "Use yellow sticky traps to detect whitefly incursions early",
    "Eliminate alternative weed hosts (datura, nightshade, parthenium) around fields"
  ],
  "affectedParts": [
    "Young leaves",
    "Apical growing points",
    "Flower blossoms"
  ],
  "simpleExplanation": "Devastating viral disease spread by tiny whiteflies causing leaves to curl upward and turn yellow.",
  "regionalNames": {
    "ta": "தக்காளி இலை சுருட்டல் வைரஸ் நோய் (Leaf Curl)",
    "hi": "टमाटर का पीली पत्ती मरोड़ रोग (Yellow Leaf Curl)",
    "te": "టమోటా ఆకు ముడుత వైరస్ తెగులు",
    "kn": "ಟೊಮ್ಯಾಟೊ ಹಳದಿ ಎಲೆ ಸುರುಟು ರೋಗ",
    "ml": "തക്കാളി ഇല മുരടിപ്പ് രോഗം",
    "mr": "टोमॅटो पर्णगुच्छ रोग",
    "bn": "টমেটোর পাতা কোঁকড়ানো রোগ"
  }
},
{
  "crop": "Squash",
  "diseaseName": "Powdery Mildew",
  "scientificName": "Podosphaera xanthii",
  "classId": "Squash___Powdery_mildew",
  "isHealthy": false,
  "severity": "Medium",
  "symptoms": [
    "White talcum powder-like fungal patches on upper and lower leaf surfaces",
    "Powdery spots expand, cover whole leaves, stems, and petioles",
    "Leaves turn yellow, brown, and become dry and crispy like paper"
  ],
  "causes": [
    "Airborne fungal spores thriving in warm, dry weather with high relative humidity",
    "Dense shade and overcrowded plantings",
    "Lack of direct sunlight in bottom foliage"
  ],
  "treatment": [
    "Prune crowded older leaves to allow direct sunlight onto lower stems",
    "Apply foliar bio-fungicides at very first appearance of white powdery spots",
    "Maintain adequate soil irrigation; drought stress accelerates powdery mildew"
  ],
  "organicTreatment": [
    "Potassium bicarbonate or baking soda spray (5g/L + 2ml liquid soap)",
    "Milk spray (1 part milk to 9 parts water) in bright sunlight",
    "Wettable sulfur (2g/L) - do not spray above 32°C"
  ],
  "chemicalTreatment": [
    "Difenoconazole 25 EC (0.5ml/L) or Myclobutanil",
    "Azoxystrobin 23% SC or Kresoxim-methyl"
  ],
  "chemicalWarning": "Do not apply sulfur when temperatures exceed 32°C to prevent foliar scorch.",
  "preventiveMeasures": [
    "Plant powdery mildew-resistant squash and pumpkin varieties",
    "Space vines widely for maximum sun and breeze",
    "Clean post-harvest squash vine debris"
  ],
  "affectedParts": [
    "Leaves",
    "Petioles",
    "Stems"
  ],
  "simpleExplanation": "White powdery dusting on squash leaves that dries them out. Spray early with bio-fungicide or sulfur.",
  "regionalNames": {
    "ta": "பூசணி சாம்பல் நோய் (Powdery Mildew)",
    "hi": "कद्दू का चूर्णिल फफूंद रोग (Powdery Mildew)",
    "te": "గుమ్మడి బూడిద తెగులు",
    "kn": "ಕುಂಬಳಕಾಯಿ ಬೂದಿ ರೋಗ",
    "ml": "മത്തൻ ചാരം പൂപ്പൽ",
    "mr": "भोपळ्यावरील भुरी रोग",
    "bn": "কুমড়ার সাদা গুঁড়ো রোগ"
  }
},
{
  "crop": "Strawberry",
  "diseaseName": "Leaf Scorch",
  "scientificName": "Diplocarpon earlianum",
  "classId": "Strawberry___Leaf_scorch",
  "isHealthy": false,
  "severity": "Medium",
  "symptoms": [
    "Small, irregular purple or dark red spots on the upper leaf surface",
    "Spots coalesce, leaf margins turn brown, dry, and curl upwards as if burned/scorched",
    "Affected leaves wither and die, reducing crown vigor"
  ],
  "causes": [
    "Fungus surviving in dead strawberry leaves and crowns",
    "Frequent rain, overhead irrigation, and prolonged leaf wetness",
    "Warm humid spring weather (20°C - 26°C)"
  ],
  "treatment": [
    "Remove and destroy spotted or scorched leaves after harvest renovation",
    "Switch from overhead sprinkler to drip irrigation under plastic mulch",
    "Apply protective foliar fungicides before flowering"
  ],
  "organicTreatment": [
    "Copper hydroxide spray (2g/L) during early spring growth",
    "Bacillus amyloliquefaciens biological spray"
  ],
  "chemicalTreatment": [
    "Captan 50 WP (2g/L) or Thiophanate-methyl 70 WP (1g/L)",
    "Pyraclostrobin + Boscalid"
  ],
  "chemicalWarning": "Apply during early vegetative leaf flush before heavy flowering begins.",
  "preventiveMeasures": [
    "Plant certified disease-free strawberry runners",
    "Ensure strawberry beds are well-drained and mulched with clean straw",
    "Thin out runners to avoid dense matting"
  ],
  "affectedParts": [
    "Leaves",
    "Petioles",
    "Runners",
    "Sepals"
  ],
  "simpleExplanation": "Purple spots on strawberry leaves that turn brown and curl up, looking like the leaf was scorched by fire.",
  "regionalNames": {
    "ta": "ஸ்ட்ராபெரி இலை கருகல் நோய் (Leaf Scorch)",
    "hi": "स्ट्रॉबेरी का पत्ती झुलसा रोग (Leaf Scorch)",
    "te": "స్ట్రాబెర్రీ ఆకు ఎండిపోవు తెగులు",
    "kn": "ಸ್ಟ್ರಾಬೆರಿ ಎಲೆ ಸುಟ್ಟ ರೋಗ",
    "ml": "സ്ട്രോബെറി ഇല കരിച്ചിൽ",
    "mr": "स्ट्रॉबेरी पानावरील करपा",
    "bn": "স্ট্রবেরি পাতার পোড়া রোগ"
  }
},
{
  "crop": "Strawberry",
  "diseaseName": "Healthy",
  "scientificName": "Fragaria × ananassa",
  "classId": "Strawberry___healthy",
  "isHealthy": true,
  "severity": "None",
  "symptoms": [
    "Lush, trifoliate dark-green strawberry leaves with clean serrated margins and white blossoms"
  ],
  "causes": [
    "Clean runner planting, proper drip irrigation under plastic mulch, and good air flow"
  ],
  "treatment": [
    "No treatment required. Continue regular strawberry bed scouting."
  ],
  "organicTreatment": [
    "Apply foliar seaweed spray and organic mulch around crowns."
  ],
  "chemicalTreatment": [
    "None required."
  ],
  "preventiveMeasures": [
    "Keep fruit elevated off bare soil using straw or silver plastic mulch",
    "Monitor crown moisture to prevent crown rot"
  ],
  "affectedParts": [
    "None"
  ],
  "simpleExplanation": "Your strawberry plants are vibrant, clean, and in prime fruiting condition.",
  "regionalNames": {
    "ta": "ஆரோக்கியமான ஸ்ட்ராபெரி பயிர் (Healthy Strawberry)",
    "hi": "स्वस्थ स्ट्रॉबेरी (Healthy Strawberry)",
    "te": "ఆరోగ్యకరమైన స్ట్రాబెర్రీ",
    "kn": "ಆರೋಗ್ಯಕರ ಸ್ಟ್ರಾಬೆರಿ",
    "ml": "ആരോഗ്യമുള്ള സ്ട്രോബെറി",
    "mr": "निरोगी स्ट्रॉबेरी",
    "bn": "স্বাস্থ্যকর স্ট্রবেরি"
  }
},
{
  "crop": "Cherry",
  "diseaseName": "Powdery Mildew",
  "scientificName": "Podosphaera clandestina",
  "classId": "Cherry_(including_sour)___Powdery_mildew",
  "isHealthy": false,
  "severity": "Medium",
  "symptoms": [
    "Circular patches of white powdery fungal mycelium on new terminal leaves",
    "Leaves become distorted, puckered, and curl upward",
    "White fungal patches on green cherry fruit leading to fruit deformation"
  ],
  "causes": [
    "Overwintering chasmothecia on orchard bark and leaf litter",
    "Warm dry days (20°C - 28°C) with humid nights",
    "Excessive irrigation and rapid flush of tender succulent foliage"
  ],
  "treatment": [
    "Prune canopy in dormancy to improve internal sunlight and air movement",
    "Apply protective bio-fungicide or sulfur sprays starting at petal fall",
    "Avoid excessive nitrogen fertilization"
  ],
  "organicTreatment": [
    "Wettable sulfur (2g/L) starting at shuck fall",
    "Potassium bicarbonate spray (3g/L) as a curative knockdown",
    "Neem seed oil (3ml/L)"
  ],
  "chemicalTreatment": [
    "Myclobutanil 40 WP or Tebuconazole 25.9 EC",
    "Trifloxystrobin or Quinoxyfen"
  ],
  "chemicalWarning": "Protect new emerging green leaves. Do not apply sulfur in hot weather above 32°C.",
  "preventiveMeasures": [
    "Irrigate early in the day so foliage remains dry overnight",
    "Monitor rootstock suckers and prune them out promptly",
    "Scout shoot terminals weekly in late spring"
  ],
  "affectedParts": [
    "Young leaves",
    "Shoots",
    "Cherries"
  ],
  "simpleExplanation": "White powdery patches on cherry leaves and young fruit that cause leaf curling and deformation.",
  "regionalNames": {
    "ta": "செர்ரி சாம்பல் நோய் (Powdery Mildew)",
    "hi": "चेरी का चूर्णिल फफूंद रोग",
    "te": "చెర్రీ బూడిద తెగులు",
    "kn": "ಚೆರ್ರಿ ಬೂದಿ ರೋಗ",
    "ml": "ചെറി ചാരം പൂപ്പൽ",
    "mr": "चेरीवरील भुरी रोग",
    "bn": "চেরির সাদা গুঁড়ো রোগ"
  }
},
{
  "crop": "Cherry",
  "diseaseName": "Healthy",
  "scientificName": "Prunus avium",
  "classId": "Cherry_(including_sour)___healthy",
  "isHealthy": true,
  "severity": "None",
  "symptoms": [
    "Lush, deep green serrated leaves with strong branch growth and clean developing fruit"
  ],
  "causes": [
    "Good orchard pruning, dormant copper sprays, and balanced fertigation"
  ],
  "treatment": [
    "No treatment required. Maintain standard cherry orchard care."
  ],
  "organicTreatment": [
    "Apply organic compost around root drip line; spray foliar micro-nutrients."
  ],
  "chemicalTreatment": [
    "None required."
  ],
  "preventiveMeasures": [
    "Ensure annual dormant pruning for open canopy architecture",
    "Keep bird netting ready as cherries begin color break"
  ],
  "affectedParts": [
    "None"
  ],
  "simpleExplanation": "Your cherry trees display healthy, vibrant leaves and strong vigor.",
  "regionalNames": {
    "ta": "ஆரோக்கியமான செர்ரி மரம் (Healthy Cherry)",
    "hi": "स्वस्थ चेरी (Healthy Cherry)",
    "te": "ఆరోగ్యకరమైన చెర్రీ",
    "kn": "ಆರೋಗ್ಯಕರ ಚೆರ್ರಿ",
    "ml": "ആരോഗ്യമുള്ള ചെറി",
    "mr": "निरोगी चेरी",
    "bn": "স্বাস্থ্যকর চেরি"
  }
},
{
  "crop": "Orange",
  "diseaseName": "Citrus Greening",
  "scientificName": "Candidatus Liberibacter asiaticus",
  "classId": "Orange___Haunglongbing_(Citrus_greening)",
  "isHealthy": false,
  "severity": "Critical",
  "symptoms": [
    "Asymmetrical blotchy yellow mottle on leaves crossing leaf veins",
    "Small, upright, chlorotic leaves resembling zinc deficiency",
    "Yellow shoots ('yellow dragon') standing out in a single branch",
    "Lopsided, small, bitter fruit that stays green at the bottom ('greening')"
  ],
  "causes": [
    "Fastidious phloem-limited bacterium transmitted by the Asian citrus psyllid (Diaphorina citri)",
    "Graft transmission from infected budwood",
    "Warm subtropical conditions accelerating psyllid populations"
  ],
  "treatment": [
    "No cure exists for greening. Remove and destroy infected trees to safeguard the grove",
    "Control Asian citrus psyllids aggressively across all neighboring trees",
    "Apply foliar nutritional sprays (Zinc, Iron, Manganese) to prolong productive life of asymptomatic trees"
  ],
  "organicTreatment": [
    "Release Tamarixia radiata parasitoid wasps for biological psyllid control",
    "Neem oil (5ml/L) or horticultural mineral oil (1-2%) to suffocate psyllid nymphs"
  ],
  "chemicalTreatment": [
    "Imidacloprid soil drench in young trees",
    "Thiamethoxam 25 WG or Dimethoate 30 EC foliar spray during new feather flushes"
  ],
  "chemicalWarning": "Psyllid control must be timed during new leaf flushes when eggs and nymphs are present.",
  "preventiveMeasures": [
    "Plant only certified disease-free citrus nursery trees from screened polyhouses",
    "Control psyllid vectors year-round using area-wide management",
    "Eradicate infected citrus trees promptly"
  ],
  "affectedParts": [
    "Leaves",
    "Shoots",
    "Vascular phloem",
    "Citrus fruit"
  ],
  "simpleExplanation": "Devastating bacterial disease spread by tiny citrus psyllid bugs causing blotchy yellow leaves and sour, bitter fruit.",
  "regionalNames": {
    "ta": "ஆரஞ்சு சிட்ரஸ் கிரீனிங் நோய் (Citrus Greening)",
    "hi": "संतरा का सिट्रस ग्रीनिंग रोग (Citrus Greening)",
    "te": "నారింజ సిట్రస్ గ్రీనింగ్ తెగులు",
    "kn": "ಕಿತ್ತಳೆ ಸಿಟ್ರಸ್ ಹಸಿರು ರೋಗ",
    "ml": "ഓറഞ്ച് സിട്രസ് ഗ്രീനിംഗ്",
    "mr": "संत्र्यावरील सिट्रस ग्रीनिंग",
    "bn": "কমলার সিট্রাস গ্রিনিং রোগ"
  }
},
{
  "crop": "Blueberry",
  "diseaseName": "Healthy",
  "scientificName": "Vaccinium corymbosum",
  "classId": "Blueberry___healthy",
  "isHealthy": true,
  "severity": "None",
  "symptoms": [
    "Lush, glossy ovate green leaves with no chlorosis, strong woody canes, and healthy berry clusters"
  ],
  "causes": [
    "Acidic soil conditions (pH 4.5 - 5.5), pine bark mulch, and uniform drip moisture"
  ],
  "treatment": [
    "No treatment required. Continue standard berry maintenance."
  ],
  "organicTreatment": [
    "Apply pine bark mulch and acidic compost to maintain low soil pH."
  ],
  "chemicalTreatment": [
    "None required."
  ],
  "preventiveMeasures": [
    "Check soil pH biannually with a soil test kit",
    "Maintain drip irrigation with acid injection if water is alkaline"
  ],
  "affectedParts": [
    "None"
  ],
  "simpleExplanation": "Your blueberry foliage is vibrant, healthy, and thriving in ideal soil conditions.",
  "regionalNames": {
    "ta": "ஆரோக்கியமான ப்ளூபெர்ரி பயிர் (Healthy Blueberry)",
    "hi": "स्वस्थ ब्लूबेरी (Healthy Blueberry)",
    "te": "ఆరోగ్యకరమైన బ్లూబెర్రీ",
    "kn": "ಆರೋಗ್ಯಕರ ಬ್ಲೂಬೆರಿ",
    "ml": "ആരോഗ്യമുള്ള ബ്ലൂബെറി",
    "mr": "निरोगी ब्लूबेरी",
    "bn": "স্বাস্থ্যকর ব্লুবেরি"
  }
},
{
  "crop": "Raspberry",
  "diseaseName": "Healthy",
  "scientificName": "Rubus idaeus",
  "classId": "Raspberry___healthy",
  "isHealthy": true,
  "severity": "None",
  "symptoms": [
    "Vigorous green compound leaves with serrated edges, strong primocanes, and healthy flower buds"
  ],
  "causes": [
    "Well-drained soil, adequate trellis support, and balanced organic fertilization"
  ],
  "treatment": [
    "No treatment required. Maintain standard cane management."
  ],
  "organicTreatment": [
    "Foliar compost tea or fish emulsion during early cane extension."
  ],
  "chemicalTreatment": [
    "None required."
  ],
  "preventiveMeasures": [
    "Prune out spent floricanes immediately after summer harvest",
    "Trellis canes firmly to prevent wind whipping against wires"
  ],
  "affectedParts": [
    "None"
  ],
  "simpleExplanation": "Your raspberry canes show vigorous green growth and healthy foliage.",
  "regionalNames": {
    "ta": "ஆரோக்கியமான ராஸ்பெர்ரி பயிர் (Healthy Raspberry)",
    "hi": "स्वस्थ रास्पबेरी (Healthy Raspberry)",
    "te": "ఆరోగ్యకరమైన రాస్ప్బెర్రీ",
    "kn": "ಆರೋಗ್ಯಕರ ರಾಸ್ಪ್ಬೆರಿ",
    "ml": "ആരോഗ്യമുള്ള റാസ്ബെറി",
    "mr": "निरोगी रास्पबेरी",
    "bn": "স্বাস্থ্যকর রাস্পবেরি"
  }
},
{
  "crop": "Soybean",
  "diseaseName": "Healthy",
  "scientificName": "Glycine max",
  "classId": "Soybean___healthy",
  "isHealthy": true,
  "severity": "None",
  "symptoms": [
    "Trifoliate dark green leaves with active rhizobial nitrogen nodulation and upright vigorous stems"
  ],
  "causes": [
    "Proper seed inoculation, balanced phosphorus and potassium, and weed-free seedbed"
  ],
  "treatment": [
    "No treatment required. Maintain regular field scouting."
  ],
  "organicTreatment": [
    "Foliar spray of Panchagavya (3%) at flowering and pod filling."
  ],
  "chemicalTreatment": [
    "None required."
  ],
  "preventiveMeasures": [
    "Scout for defoliating caterpillars and stem flies during vegetative stages",
    "Maintain good field drainage during heavy monsoon rains"
  ],
  "affectedParts": [
    "None"
  ],
  "simpleExplanation": "Your soybean crop displays clean, deep green leaves with strong vegetative growth.",
  "regionalNames": {
    "ta": "ஆரோக்கியமான சோயாபீன் பயிர் (Healthy Soybean)",
    "hi": "स्वस्थ सोयाबीन (Healthy Soybean)",
    "te": "ఆరోగ్యకరమైన సోయాబీన్",
    "kn": "ಆರೋಗ್ಯಕರ ಸೋಯಾಬೀನ್",
    "ml": "ആരോഗ്യമുള്ള സോയാബീൻ",
    "mr": "निरोगी सोयाबीन",
    "bn": "স্বাস্থ্যকর সয়াবিন"
  }
}
,
{
  "crop": "Rose",
  "diseaseName": "Black Spot",
  "scientificName": "Diplocarpon rosae",
  "classId": "Rose___Black_spot",
  "isHealthy": false,
  "severity": "High",
  "symptoms": [
    "Circular black spots with feathery, fringed margins on the upper surface of rose leaves",
    "Leaf tissue surrounding black spots turns bright yellow (chlorotic)",
    "Severe premature defoliation leaving lower rose canes completely bare",
    "Purplish-black blistered cankers on young green rose stems"
  ],
  "causes": [
    "Fungal pathogen Diplocarpon rosae surviving in fallen rose leaves and stem cankers",
    "Splashing water from overhead watering or rainfall onto lower rose foliage",
    "Warm, humid conditions (20°C - 27°C) with at least 7 hours of continuous leaf wetness"
  ],
  "treatment": [
    "Prune out infected rose canes 5cm below cankers using sharp, sterilized shears",
    "Rake up and discard all fallen black-spotted rose leaves and petals; do NOT compost them",
    "Always water rose bushes at the ground level using drip pipes or soaker hoses; keep foliage dry"
  ],
  "organicTreatment": [
    "Neem oil spray (5ml/L) or potassium bicarbonate spray (3g/L) every 7-10 days",
    "Wettable sulfur spray (2g/L) during cool morning hours (below 28°C)",
    "Bacillus subtilis bio-fungicide foliar application"
  ],
  "chemicalTreatment": [
    "Myclobutanil 20 EW (0.75ml/L) or Tebuconazole 25.9% EC (1ml/L) at first sign of spots",
    "Difenoconazole 25% EC (0.5ml/L) or Mancozeb 75 WP (2g/L) as a protective barrier",
    "Trifloxystrobin + Tebuconazole combination spray"
  ],
  "chemicalWarning": "Do not apply sulfur when temperatures exceed 30°C to prevent petal and foliage scorch. Rotate fungicides to prevent resistance.",
  "preventiveMeasures": [
    "Plant black spot-resistant rose varieties (e.g., Knock Out, rugosa, or modern shrub roses)",
    "Ensure at least 90cm spacing between rose bushes for full sunlight and rapid air drying",
    "Apply a 5cm layer of clean mulch around rose bases to stop soil-splash spore dispersal"
  ],
  "affectedParts": [
    "Leaves",
    "Canes",
    "Flower sepals"
  ],
  "environmentalConditions": {
    "idealTemp": "20°C - 27°C",
    "humidityRisk": "Relative humidity above 85% with standing leaf moisture",
    "rainfallImpact": "Rain splash is the primary method of spore dispersal onto upper foliage"
  },
  "simpleExplanation": "Very common rose disease causing feathery black spots on yellowing leaves and causing rose bushes to lose their leaves prematurely.",
  "regionalNames": {
    "ta": "ரோஜா கருப்பு புள்ளி நோய் (Rose Black Spot)",
    "hi": "गुलाब का काला धब्बा रोग (Rose Black Spot)",
    "te": "గులాబీ నల్ల మచ్చ తెగులు",
    "kn": "ಗುಲಾಬಿ ಕಪ್ಪು ಕಲೆ ರೋಗ",
    "ml": "റോസ് കറുത്ത പുള്ളി രോഗം",
    "mr": "गुलाबावरील काळे ठिपके",
    "bn": "গোলাপের কালো দাগ রোগ"
  }
},
{
  "crop": "Rose",
  "diseaseName": "Powdery Mildew",
  "scientificName": "Podosphaera pannosa",
  "classId": "Rose___Powdery_mildew",
  "isHealthy": false,
  "severity": "Medium",
  "symptoms": [
    "White to grayish powdery fungal growth on young leaves, shoots, and flower buds",
    "Young rose leaves become puckered, twisted, blistered, or curled upward",
    "Infected rose buds fail to open or produce distorted, stunted blooms"
  ],
  "causes": [
    "Fungal spores carried on gentle air currents",
    "Warm days (22°C - 28°C) followed by cool, humid nights",
    "Dense planting with poor air circulation and shady microclimates"
  ],
  "treatment": [
    "Prune out crowded center canes to let sunlight into the rose bush",
    "Apply foliar bio-fungicides or sulfur early in the season",
    "Wash foliage with early morning water spray to disrupt spore germination"
  ],
  "organicTreatment": [
    "Potassium bicarbonate spray (3g/L) with mild vegetable oil emulsifier",
    "Wettable sulfur (2g/L) during morning hours",
    "Dilute milk spray (1 part milk : 9 parts water) in bright sunlight"
  ],
  "chemicalTreatment": [
    "Myclobutanil 20 EW (0.75ml/L) or Penconazole 10% EC",
    "Azoxystrobin 23% SC or Difenoconazole"
  ],
  "chemicalWarning": "Apply protective sprays during active spring growth. Avoid spraying in hot midday sun.",
  "preventiveMeasures": [
    "Plant powdery mildew-resistant rose cultivars",
    "Ensure rose beds receive at least 6 hours of direct daily sunlight",
    "Avoid high-nitrogen fertilizers that produce excess tender, succulent shoots"
  ],
  "affectedParts": [
    "Young leaves",
    "Stems",
    "Flower buds"
  ],
  "simpleExplanation": "White powdery dusting on rose leaves and flower buds that curls foliage and prevents roses from blooming properly.",
  "regionalNames": {
    "ta": "ரோஜா சாம்பல் நோய் (Rose Powdery Mildew)",
    "hi": "गुलाब का चूर्णिल फफूंद रोग",
    "te": "గులాబీ బూడిద తెగులు",
    "kn": "ಗುಲಾಬಿ ಬೂದಿ ರೋಗ",
    "ml": "റോസ് ചാരം പൂപ്പൽ",
    "mr": "गुलाबावरील भुरी रोग",
    "bn": "গোলাপের সাদা গুঁড়ো রোগ"
  }
},
{
  "crop": "Rose",
  "diseaseName": "Healthy",
  "scientificName": "Rosa",
  "classId": "Rose___healthy",
  "isHealthy": true,
  "severity": "None",
  "symptoms": [
    "Glossy, dark green serrated leaflets, strong thorned canes, and vibrant undamaged flower blossoms"
  ],
  "causes": [
    "Adequate sunlight (6+ hours), balanced rose fertigation, good airflow, and routine deadheading"
  ],
  "treatment": [
    "No corrective action needed. Continue regular rose garden care and deadheading spent blooms."
  ],
  "organicTreatment": [
    "Apply organic compost mulch around drip line and spray seaweed extract monthly."
  ],
  "chemicalTreatment": [
    "None required."
  ],
  "preventiveMeasures": [
    "Deadhead faded blooms down to a 5-leaflet leaf to promote continuous flower flush",
    "Water at the base with drip irrigation to keep foliage clean and dry"
  ],
  "affectedParts": [
    "None"
  ],
  "simpleExplanation": "Your rose bush has healthy, glossy leaves and vibrant blooms with no fungal spots.",
  "regionalNames": {
    "ta": "ஆரோக்கியமான ரோஜா செடி (Healthy Rose)",
    "hi": "स्वस्थ गुलाब (Healthy Rose)",
    "te": "ఆరోగ్యకరమైన గులాబీ",
    "kn": "ಆರೋಗ್ಯಕರ ಗುಲಾಬಿ",
    "ml": "ಆರೋಗ്യമുള്ള റോസ്",
    "mr": "निरोगी गुलाब",
    "bn": "স্বাস্থ্যকর গোলাপ"
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
