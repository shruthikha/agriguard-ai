import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { BookOpen, Leaf, ChevronDown, ChevronUp, AlertCircle, Filter, CheckCircle2 } from 'lucide-react';
import api from '../services/api';

const CROP_EMOJI = { Tomato: '🍅', Potato: '🥔', Apple: '🍎', Pepper: '🌶️', General: '🌾' };
const PRIORITY_STYLE = {
  High:   { bg: '#FAEEED', border: '#E5B3B0', color: '#5A2C2C', dot: '#C98282' },
  Medium: { bg: '#FDF8EC', border: '#F3DFA0', color: '#4E3D18', dot: '#D8B86A' },
  Low:    { bg: '#EAF4E4', border: '#C9DEC1', color: '#2E4D35', dot: '#527A5A' },
};

const STATIC_ADVISORIES = [
  {
    _id: 'static-1', crop: 'Tomato', disease: 'Early Blight', priority: 'High',
    recommendation: 'Apply copper-based fungicide every 7-10 days during humid weather. Remove infected leaves promptly.',
    actionSteps: ['Inspect plants every 2-3 days for brown spots with concentric rings','Remove and dispose of infected leaves away from the field','Apply Mancozeb or Copper Oxychloride at recommended doses','Ensure adequate plant spacing (30-45cm) for air circulation','Avoid overhead irrigation; use drip irrigation instead'],
    createdAt: new Date().toISOString()
  },
  {
    _id: 'static-2', crop: 'Potato', disease: 'Late Blight', priority: 'High',
    recommendation: 'Late Blight spreads rapidly in cool, wet conditions. Act immediately with systemic fungicides.',
    actionSteps: ['Use certified disease-free seed tubers','Apply Metalaxyl or Cymoxanil-based fungicides preventively','Destroy infected plant material by burning or deep burial','Harvest tubers as soon as tops die down','Monitor neighboring fields for potential spread'],
    createdAt: new Date().toISOString()
  },
  {
    _id: 'static-3', crop: 'General', disease: null, priority: 'Medium',
    recommendation: 'General pre-monsoon crop protection advisory for Kharif season crops.',
    actionSteps: ['Treat seeds with fungicides and insecticides before sowing','Maintain field records of fertilizer and pesticide applications','Keep irrigation channels clean to prevent water-borne diseases','Collect soil samples and test pH and nutrient levels','Store pesticides safely in cool, dry, and locked areas'],
    createdAt: new Date().toISOString()
  },
  {
    _id: 'static-4', crop: 'Apple', disease: 'Apple Scab', priority: 'Medium',
    recommendation: 'Apple Scab is best prevented during early spring when leaves are emerging. Use protective fungicide sprays.',
    actionSteps: ['Apply lime sulfur spray during dormant season','Use Captan or Myclobutanil fungicide at petal fall stage','Rake and remove fallen leaves to reduce spore load','Plant scab-resistant varieties for new orchards','Maintain orchard records for spray timing and effectiveness'],
    createdAt: new Date().toISOString()
  }
];

function AdvisoryCard({ advisory }) {
  const [expanded, setExpanded] = useState(false);
  const ps = PRIORITY_STYLE[advisory.priority] || PRIORITY_STYLE.Low;
  return (
    <div className="rounded-[20px] overflow-hidden transition-all hover:-translate-y-0.5"
      style={{ background: '#FFFFFF', border: '1px solid #C9DEC1', boxShadow: '0 4px 16px rgba(70,95,75,0.06)' }}>
      <button className="w-full p-5 flex items-start gap-4 text-left transition-all"
        onClick={() => setExpanded(!expanded)}
        style={{ minHeight: 'auto' }}
        onMouseEnter={e => e.currentTarget.style.background = '#F4F8EF'}
        onMouseLeave={e => e.currentTarget.style.background = ''}>
        <span className="text-3xl flex-shrink-0">{CROP_EMOJI[advisory.crop] || '🌾'}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            <span className="text-sm font-semibold" style={{ color: '#294333' }}>{advisory.crop}</span>
            {advisory.disease && <span className="text-xs" style={{ color: '#899B6A' }}>→ {advisory.disease}</span>}
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-semibold"
              style={{ background: ps.bg, color: ps.color, border: `1px solid ${ps.border}` }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: ps.dot }} />
              {advisory.priority}
            </span>
          </div>
          <p className="text-sm leading-relaxed line-clamp-2" style={{ color: '#4A5E52' }}>{advisory.recommendation}</p>
          {advisory.createdAt && (
            <p className="text-xs mt-1.5" style={{ color: '#899B6A' }}>
              {new Date(advisory.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          )}
        </div>
        <div className="flex-shrink-0 pt-0.5">
          {expanded ? <ChevronUp className="w-4 h-4" style={{ color: '#899B6A' }} /> : <ChevronDown className="w-4 h-4" style={{ color: '#C9DEC1' }} />}
        </div>
      </button>

      {expanded && advisory.actionSteps?.length > 0 && (
        <div className="px-5 pb-5" style={{ borderTop: '1px solid #EAF4E4' }}>
          <h3 className="text-xs font-semibold uppercase tracking-wide pt-4 mb-3" style={{ color: '#527A5A' }}>Action Steps</h3>
          <ul className="space-y-2">
            {advisory.actionSteps.map((step, i) => (
              <li key={i} className="flex items-start gap-3 text-sm" style={{ color: '#4A5E52' }}>
                <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5"
                  style={{ background: '#EAF4E4', color: '#527A5A' }}>
                  {i + 1}
                </div>
                {step}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function AdvisoriesPage() {
  const { t } = useTranslation();
  const [advisories, setAdvisories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCrop, setFilterCrop] = useState('All');
  const [filterPriority, setFilterPriority] = useState('All');

  const CROPS = ['All', 'Tomato', 'Potato', 'Pepper', 'Apple', 'General'];

  useEffect(() => {
    api.get('/advisories')
      .then((res) => {
        if (res.data.success && res.data.advisories?.length > 0) setAdvisories(res.data.advisories);
        else setAdvisories(STATIC_ADVISORIES);
      })
      .catch(() => setAdvisories(STATIC_ADVISORIES))
      .finally(() => setLoading(false));
  }, []);

  const filtered = advisories.filter((a) => {
    if (filterCrop !== 'All' && a.crop !== filterCrop) return false;
    if (filterPriority !== 'All' && a.priority !== filterPriority) return false;
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-5" style={{ background: '#EAF4E4', minHeight: '100vh' }}>

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #4E3D18, #D8B86A)' }}>
          <BookOpen className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#294333' }}>{t('advisories.title', 'Farming Advisories')}</h1>
          <p className="text-xs" style={{ color: '#6B7D70' }}>Expert crop management guidance and best practices</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl"
          style={{ background: '#FFFFFF', border: '1px solid #C9DEC1' }}>
          <Leaf className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#527A5A' }} />
          <select value={filterCrop} onChange={(e) => setFilterCrop(e.target.value)}
            className="text-sm font-medium bg-transparent outline-none cursor-pointer min-h-0"
            style={{ color: '#294333' }}>
            {CROPS.map(c => <option key={c} value={c}>{c === 'All' ? 'All Crops' : c}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl"
          style={{ background: '#FFFFFF', border: '1px solid #C9DEC1' }}>
          <Filter className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#899B6A' }} />
          <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}
            className="text-sm font-medium bg-transparent outline-none cursor-pointer min-h-0"
            style={{ color: '#294333' }}>
            <option value="All">All Priority</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
        <span className="text-xs" style={{ color: '#899B6A' }}>{filtered.length} advisories</span>
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => (
            <div key={i} className="rounded-[20px] h-24 animate-pulse" style={{ background: '#DDEBDD' }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center rounded-[22px]" style={{ background: '#FFFFFF', border: '1px solid #C9DEC1' }}>
          <BookOpen className="w-12 h-12 mx-auto mb-4" style={{ color: '#C9DEC1' }} />
          <h2 className="text-xl font-bold mb-2" style={{ color: '#294333' }}>No Advisories Found</h2>
          <p className="text-sm" style={{ color: '#6B7D70' }}>Try changing the filter options.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((advisory) => (
            <AdvisoryCard key={advisory._id} advisory={advisory} />
          ))}
        </div>
      )}

      {/* Disclaimer */}
      <div className="flex items-start gap-2.5 p-4 rounded-2xl text-xs"
        style={{ background: '#F4F8EF', border: '1px solid #C9DEC1', color: '#6B7D70' }}>
        <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#899B6A' }} />
        <p>Advisories are AI-generated based on common agricultural knowledge. Always consult a local agronomist or KVK (Krishi Vigyan Kendra) for field-specific guidance.</p>
      </div>
    </div>
  );
}
