import React from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles, X, Check, AlertCircle } from 'lucide-react';

export const DEMO_SAMPLES = [
  {
    id: 'tomato_early_blight',
    crop: 'Tomato',
    diseaseName: 'Early Blight',
    imagePath: '/demo_leaves/tomato_early_blight_demo.jpg',
    description: 'Concentric brown target rings on leaf blade with yellow halo.',
    tag: 'Fungal Infection'
  },
  {
    id: 'tomato_healthy',
    crop: 'Tomato',
    diseaseName: 'Healthy Leaf',
    imagePath: '/demo_leaves/tomato_healthy_demo.jpg',
    description: 'Vibrant green, clean leaf tissue without lesions.',
    tag: 'Healthy Crop'
  },
  {
    id: 'potato_early_blight',
    crop: 'Potato',
    diseaseName: 'Early Blight',
    imagePath: '/demo_leaves/potato_early_blight_demo.jpg',
    description: 'Alternaria target spots on older potato foliage.',
    tag: 'Fungal Infection'
  },
  {
    id: 'apple_scab',
    crop: 'Apple',
    diseaseName: 'Apple Scab',
    imagePath: '/demo_leaves/apple_scab_demo.jpg',
    description: 'Olive-black velvety scab spots on leaf surface.',
    tag: 'Fungal Scab'
  },
  {
    id: 'pepper_bacterial_spot',
    crop: 'Pepper',
    diseaseName: 'Bacterial Spot',
    imagePath: '/demo_leaves/pepper_bacterial_spot_demo.jpg',
    description: 'Small dark water-soaked bacterial spots with halo.',
    tag: 'Bacterial Disease'
  }
];

export default function DemoPickerModal({ isOpen, onClose, onSelectDemo }) {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full p-6 sm:p-8 border border-amber-200 relative max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-900 rounded-full text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Evaluator & Presentation Quick Mode</span>
          </div>
          <h2 className="text-2xl font-black text-gray-900">
            Select a Demo Leaf
          </h2>
          <p className="text-gray-500 text-xs sm:text-sm mt-1">
            Choose a verified sample image to run through the live MobileNetV2 ML pipeline
          </p>
        </div>

        {/* Demo Notice */}
        <div className="bg-amber-50/80 rounded-2xl p-3 border border-amber-200 text-amber-900 text-xs flex items-start gap-2 mb-4">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>
            <strong>Note for Evaluators:</strong> Selecting a demo leaf fetches the real image file and passes it to the Python ML model for live inference.
          </span>
        </div>

        {/* Demo Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6">
          {DEMO_SAMPLES.map((sample) => (
            <div
              key={sample.id}
              onClick={() => {
                onSelectDemo(sample);
                onClose();
              }}
              className="cursor-pointer group flex flex-col p-3 rounded-2xl border-2 border-gray-200 hover:border-agri-600 hover:bg-agri-50/40 transition shadow-xs hover:shadow-md"
            >
              <div className="relative h-32 rounded-xl overflow-hidden bg-gray-100 mb-2.5">
                <img
                  src={sample.imagePath}
                  alt={sample.diseaseName}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
                <span className="absolute top-2 left-2 px-2 py-0.5 bg-black/70 backdrop-blur-xs text-white text-[10px] font-bold rounded-md uppercase tracking-wider">
                  Demo Image
                </span>
                <span className={`absolute bottom-2 right-2 px-2 py-0.5 text-[10px] font-bold rounded-md ${
                  sample.tag.includes('Healthy') ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
                }`}>
                  {sample.tag}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-agri-800">{sample.crop}</span>
                <span className="text-[11px] font-semibold text-gray-500">{sample.diseaseName}</span>
              </div>
              <p className="text-[11px] text-gray-600 mt-1 line-clamp-2 leading-relaxed">
                {sample.description}
              </p>
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-2xl transition text-sm"
        >
          {t('common.close', 'Close')}
        </button>
      </div>
    </div>
  );
}
