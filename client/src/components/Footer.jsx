import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Sprout, Phone, ShieldCheck, Heart, ExternalLink, Globe } from 'lucide-react';

export default function Footer({ onOpenLanguageModal }) {
  const { t } = useTranslation();

  return (
    <footer className="bg-white border-t border-gray-200 mt-16 pb-20 md:pb-8 pt-12 text-gray-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          
          {/* Brand Info */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl bg-agri-700 text-white flex items-center justify-center">
                <Sprout className="w-5 h-5" />
              </div>
              <span className="text-xl font-black text-gray-900">
                Agri<span className="text-agri-600">Guard</span> AI
              </span>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed mb-4">
              Empowering farmers with early crop disease detection, weather correlation, and multilingual audio advisories.
            </p>
            <button
              onClick={onOpenLanguageModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-xs font-bold text-gray-700 transition"
            >
              <Globe className="w-3.5 h-3.5 text-agri-700" />
              Change Language
            </button>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 mb-3">
              Platform
            </h4>
            <ul className="space-y-2 text-xs font-medium">
              <li><Link to="/detect" className="hover:text-agri-700">Check Crop Disease</Link></li>
              <li><Link to="/weather" className="hover:text-agri-700">Farming Weather</Link></li>
              <li><Link to="/advisories" className="hover:text-agri-700">Daily Advisories</Link></li>
              <li><Link to="/history" className="hover:text-agri-700">Scan History</Link></li>
              <li><Link to="/dashboard" className="hover:text-agri-700">Farmer Dashboard</Link></li>
            </ul>
          </div>

          {/* Farmer Emergency Helplines */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 mb-3">
              National Support Helplines
            </h4>
            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-xl bg-agri-50 border border-agri-200">
                <div className="flex items-center gap-1.5 font-bold text-agri-900">
                  <Phone className="w-3.5 h-3.5 text-agri-700" />
                  Kisan Call Centre (Toll Free)
                </div>
                <div className="text-sm font-extrabold text-agri-700 mt-0.5">
                  1800-180-1551
                </div>
              </div>
              <p className="text-[11px] text-gray-500">
                Available 6:00 AM to 10:00 PM in 22 official languages across India.
              </p>
            </div>
          </div>

          {/* Scientific Disclaimer */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 mb-3">
              Agricultural Disclaimer
            </h4>
            <p className="text-[11px] text-gray-500 leading-relaxed">
              AI crop predictions are advisory estimates based on the PlantVillage deep-learning dataset. Always consult local Krishi Vigyan Kendra (KVK) officers before applying chemical sprays.
            </p>
            <div className="mt-3 text-[11px] font-bold text-gray-700 flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Verified MobileNetV2 Architecture
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400 gap-2">
          <div>
            © {new Date().getFullYear()} AgriGuard AI Platform. Built for Indian Agriculture.
          </div>
          <div className="flex items-center gap-1 text-gray-500 font-medium">
            MERN + Python FastAPI + MobileNetV2
          </div>
        </div>
      </div>
    </footer>
  );
}
