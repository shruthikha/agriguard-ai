import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Leaf, CloudSun, Lightbulb, Camera, Sparkles,
  ArrowRight, CheckCircle2, Volume2, ShieldCheck,
  Sprout, MapPin
} from 'lucide-react';

const SUPPORTED_CROPS = [
  { name: 'Tomato', icon: '🍅', count: '9 diseases' },
  { name: 'Potato', icon: '🥔', count: '3 diseases' },
  { name: 'Pepper', icon: '🌶️', count: '2 diseases' },
  { name: 'Apple',  icon: '🍎', count: '4 diseases' },
];

const FEATURES = [
  {
    icon: Camera,
    title: 'Instant Diagnosis',
    desc: 'Upload a leaf photo and receive an AI-powered disease diagnosis in seconds.',
    color: '#EAF4E4',
    iconColor: '#527A5A',
  },
  {
    icon: CloudSun,
    title: 'Weather Intelligence',
    desc: 'Real-time weather data correlated with disease risk for your exact location.',
    color: '#EAF4E4',
    iconColor: '#527A5A',
  },
  {
    icon: Lightbulb,
    title: 'Smart Advisories',
    desc: 'Personalised farming guidance in your regional language — simple and clear.',
    color: '#EAF4E4',
    iconColor: '#527A5A',
  },
  {
    icon: Volume2,
    title: 'Listen in Your Language',
    desc: 'Full voice readout in Tamil, Hindi, Telugu, Kannada, Malayalam and more.',
    color: '#EAF4E4',
    iconColor: '#527A5A',
  },
];

export default function LandingPage({ onOpenDemoModal }) {
  const { t } = useTranslation();

  return (
    <div style={{ background: '#EAF4E4' }}>

      {/* ══════════════ HERO ══════════════ */}
      <section className="relative overflow-hidden">
        {/* subtle background texture */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 80% 60% at 70% 40%, #DDEBDD 0%, transparent 70%)' }} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16 sm:pt-20 sm:pb-24">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

            {/* Left: headline + CTAs */}
            <div className="space-y-7 animate-slideUp">
              {/* Label pill */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold"
                style={{ background: '#FFFFFF', border: '1px solid #C9DEC1', color: '#527A5A' }}>
                <Sprout className="w-3.5 h-3.5" />
                PlantVillage AI · 18 Crop Disease Classes · 8 Indian Languages
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-[3.25rem] font-bold leading-[1.2] tracking-tight"
                style={{ color: '#294333' }}>
                Protect Every Leaf.{' '}
                <br className="hidden sm:block" />
                <span style={{ color: '#527A5A' }}>Grow With Confidence.</span>
              </h1>

              <p className="text-base sm:text-lg leading-relaxed max-w-lg" style={{ color: '#4A5E52' }}>
                AI-powered crop disease detection and weather-based farming guidance, designed to help
                farmers make better decisions — in their own language.
              </p>

              {/* CTA buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Link to="/detect"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-base font-semibold text-white rounded-[14px] transition-all"
                  style={{ background: '#527A5A', boxShadow: '0 4px 16px rgba(82,122,90,0.28)' }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#3F6246'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#527A5A'; }}>
                  <Camera className="w-5 h-5" />
                  Check Your Crop
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link to="/advisories"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-base font-semibold rounded-[14px] transition-all"
                  style={{ background: '#FFFFFF', border: '1.5px solid #C9DEC1', color: '#294333' }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#EAF4E4'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#FFFFFF'; }}>
                  <Lightbulb className="w-5 h-5" style={{ color: '#527A5A' }} />
                  Explore Advisories
                </Link>
              </div>

              {/* Trust signals */}
              <div className="flex flex-wrap gap-4 pt-1">
                {[
                  '18 crop diseases detected',
                  '8 Indian languages',
                  'Real AI model',
                ].map(t => (
                  <div key={t} className="flex items-center gap-1.5 text-sm" style={{ color: '#527A5A' }}>
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                    <span>{t}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: visual card */}
            <div className="relative flex justify-center lg:justify-end">
              {/* Main visual card */}
              <div className="relative w-full max-w-sm">
                <div className="rounded-[24px] overflow-hidden shadow-elevated"
                  style={{ background: '#FFFFFF', border: '1px solid #C9DEC1' }}>
                  {/* Mock leaf image area */}
                  <div className="h-52 relative flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #C9DEC1 0%, #DDEBDD 60%, #EAF4E4 100%)' }}>
                    <div className="text-8xl select-none">🌿</div>
                    {/* Scan overlay effect */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-32 h-32 rounded-full border-2 border-dashed opacity-30 animate-pulse-soft"
                        style={{ borderColor: '#527A5A' }} />
                    </div>
                    {/* Status badge */}
                    <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shadow-soft"
                      style={{ background: '#FFFFFF', color: '#294333' }}>
                      <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#527A5A' }} />
                      AI Scanning
                    </div>
                  </div>

                  {/* Result preview */}
                  <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium" style={{ color: '#6B7D70' }}>Detected Disease</p>
                        <p className="text-base font-bold" style={{ color: '#294333' }}>Early Blight</p>
                        <p className="text-xs" style={{ color: '#899B6A' }}>Tomato · Fungal</p>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold" style={{ color: '#527A5A' }}>91%</div>
                        <div className="text-xs" style={{ color: '#6B7D70' }}>Confidence</div>
                      </div>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#EAF4E4' }}>
                      <div className="h-full rounded-full" style={{ width: '91%', background: '#527A5A' }} />
                    </div>
                    <p className="text-xs leading-relaxed" style={{ color: '#6B7D70' }}>
                      Apply copper-based fungicide. Remove affected leaves. Improve air circulation.
                    </p>
                  </div>
                </div>

                {/* Floating weather card */}
                <div className="absolute -bottom-5 -left-6 rounded-2xl p-3.5 shadow-card animate-fadeIn"
                  style={{ background: '#FFFFFF', border: '1px solid #C9DEC1', minWidth: 160 }}>
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: '#EAF4E4' }}>
                      <CloudSun className="w-5 h-5" style={{ color: '#527A5A' }} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold" style={{ color: '#294333' }}>Weather Advisory</p>
                      <p className="text-[11px]" style={{ color: '#6B7D70' }}>Rain expected tomorrow</p>
                    </div>
                  </div>
                </div>

                {/* Floating language card */}
                <div className="absolute -top-4 -right-4 rounded-2xl px-3.5 py-2.5 shadow-card animate-fadeIn"
                  style={{ background: '#FFFFFF', border: '1px solid #C9DEC1' }}>
                  <p className="text-xs font-semibold" style={{ color: '#294333' }}>🌐 8 Languages</p>
                  <p className="text-[11px]" style={{ color: '#6B7D70' }}>தமிழ் · हिंदी · বাংলা</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════ FEATURES ══════════════ */}
      <section className="py-14 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#899B6A' }}>
              How it works
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold" style={{ color: '#294333' }}>
              Everything a farmer needs
            </h2>
            <p className="text-sm sm:text-base max-w-xl mx-auto" style={{ color: '#6B7D70' }}>
              From disease detection to personalised farming advice — all in one simple app.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title}
                  className="p-5 rounded-[20px] space-y-3 transition-all duration-200 hover:-translate-y-1"
                  style={{ background: '#FFFFFF', border: '1px solid #C9DEC1', boxShadow: '0 4px 20px rgba(70,95,75,0.06)' }}>
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
                    style={{ background: f.color }}>
                    <Icon className="w-5 h-5" style={{ color: f.iconColor }} />
                  </div>
                  <h3 className="text-sm font-semibold" style={{ color: '#294333' }}>{f.title}</h3>
                  <p className="text-xs leading-relaxed" style={{ color: '#6B7D70' }}>{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════ SUPPORTED CROPS ══════════════ */}
      <section className="py-10 sm:py-14" style={{ background: '#F4F8EF' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-xl sm:text-2xl font-bold" style={{ color: '#294333' }}>Supported Crops</h2>
            <p className="text-sm mt-1" style={{ color: '#6B7D70' }}>
              Our model covers the most common crops and their diseases
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {SUPPORTED_CROPS.map((crop) => (
              <Link key={crop.name} to="/detect"
                className="flex flex-col items-center p-5 rounded-[20px] text-center transition-all hover:-translate-y-1"
                style={{ background: '#FFFFFF', border: '1px solid #C9DEC1', boxShadow: '0 4px 20px rgba(70,95,75,0.06)' }}>
                <span className="text-4xl mb-2">{crop.icon}</span>
                <p className="text-sm font-semibold" style={{ color: '#294333' }}>{crop.name}</p>
                <p className="text-xs mt-0.5" style={{ color: '#899B6A' }}>{crop.count}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ CTA BANNER ══════════════ */}
      <section className="py-12 sm:py-16">
        <div className="max-w-3xl mx-auto px-4 text-center space-y-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold"
            style={{ background: '#DDEBDD', color: '#2E4D35' }}>
            <Leaf className="w-3.5 h-3.5" />
            Free for all farmers
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold" style={{ color: '#294333' }}>
            Start protecting your crops today
          </h2>
          <p className="text-sm sm:text-base" style={{ color: '#6B7D70' }}>
            No registration required for demo. Upload a leaf photo and get instant AI analysis.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-1">
            <Link to="/detect"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 text-base font-semibold text-white rounded-[14px] transition-all"
              style={{ background: '#527A5A', boxShadow: '0 4px 16px rgba(82,122,90,0.28)' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#3F6246'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#527A5A'; }}>
              <Camera className="w-5 h-5" />
              Check Your Crop Now
            </Link>
            <button onClick={onOpenDemoModal}
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 text-base font-semibold rounded-[14px] transition-all"
              style={{ background: '#FDF8EC', border: '1.5px solid #F3DFA0', color: '#4E3D18' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#FAF0D2'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#FDF8EC'; }}>
              <Sparkles className="w-5 h-5" style={{ color: '#D8B86A' }} />
              Try Demo Mode
            </button>
          </div>
        </div>
      </section>

      {/* ══════════════ FOOTER ══════════════ */}
      <footer className="py-8" style={{ borderTop: '1px solid #C9DEC1' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <div className="w-7 h-7 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #2E4D35, #527A5A)' }}>
              <Leaf className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-bold" style={{ color: '#294333' }}>AgriGuard AI</span>
          </div>
          <p className="text-xs" style={{ color: '#899B6A' }}>
            AI-powered crop disease detection for Indian farmers · Built with MobileNetV2 + PlantVillage
          </p>
        </div>
      </footer>

    </div>
  );
}
