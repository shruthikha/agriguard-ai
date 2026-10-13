import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ShieldCheck, AlertTriangle, CheckCircle2, ArrowLeft, Volume2,
  Thermometer, Droplets, Wind, Cloud, Leaf, Zap, RefreshCw,
  ChevronDown, ChevronUp, BookOpen, Sprout, Star, MapPin
} from 'lucide-react';
import api from '../services/api';
import ConfidenceMeter from '../components/ConfidenceMeter';
import { speakText } from '../utils/speech';

function StatusBadge({ isHealthy, confidence }) {
  if (isHealthy) return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold"
      style={{ background: '#DDEBDD', color: '#2E4D35', border: '1px solid #C9DEC1' }}>
      <CheckCircle2 className="w-3.5 h-3.5" /> Healthy Plant
    </span>
  );
  if (confidence >= 75) return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold"
      style={{ background: '#FAEEED', color: '#5A2C2C', border: '1px solid #E5B3B0' }}>
      <AlertTriangle className="w-3.5 h-3.5" /> Disease Detected
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold"
      style={{ background: '#FDF8EC', color: '#4E3D18', border: '1px solid #F3DFA0' }}>
      <AlertTriangle className="w-3.5 h-3.5" /> Possibly Diseased
    </span>
  );
}

function WeatherCard({ weather }) {
  if (!weather) return null;
  return (
    <div className="rounded-[20px] p-5" style={{ background: '#F4F8EF', border: '1px solid #C9DEC1' }}>
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: '#EAF4E4' }}>
          <Cloud className="w-4 h-4" style={{ color: '#527A5A' }} />
        </div>
        <div>
          <p className="text-xs font-semibold" style={{ color: '#294333' }}>Weather at Scan Location</p>
          {weather.location && (
            <p className="text-xs flex items-center gap-1" style={{ color: '#6B7D70' }}>
              <MapPin className="w-3 h-3" /> {weather.location}
            </p>
          )}
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: Thermometer, value: `${weather.temperature}°C`, label: 'Temperature' },
          { icon: Droplets,    value: `${weather.humidity}%`,      label: 'Humidity' },
          { icon: Wind,        value: `${weather.windSpeed} m/s`,  label: 'Wind' },
          { icon: Cloud,       value: weather.weatherCondition,    label: 'Condition' },
        ].map(({ icon: Icon, value, label }) => (
          <div key={label} className="rounded-xl p-3 text-center" style={{ background: '#FFFFFF', border: '1px solid #C9DEC1' }}>
            <Icon className="w-4 h-4 mx-auto mb-1.5" style={{ color: '#527A5A' }} />
            <div className="text-sm font-bold" style={{ color: '#294333' }}>{value}</div>
            <div className="text-xs" style={{ color: '#6B7D70' }}>{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ScanResultPage({ scanResult }) {
  const { scanId } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [result, setResult] = useState(scanResult);
  const [loading, setLoading] = useState(!scanResult);
  const [error, setError] = useState('');
  const [expandedSection, setExpandedSection] = useState('advisory');
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    if (!scanResult && scanId) {
      api.get(`/scans/${scanId}`)
        .then((res) => {
          if (res.data.success) {
            const scan = res.data.scan;
            setResult({
              crop: scan.crop, disease: scan.disease, confidence: scan.confidence,
              confidenceLevel: scan.confidenceLevel, isHealthy: scan.isHealthy,
              imageUrl: scan.imageUrl, topPredictions: scan.topPredictions,
              diseaseDetails: scan.diseaseDetails, advisory: scan.advisory,
              weather: scan.weatherAtScan
            });
          }
        })
        .catch(() => setError('Could not load scan result.'))
        .finally(() => setLoading(false));
    }
  }, [scanId, scanResult]);

  const handleSpeak = () => {
    if (!result?.advisory?.listenText) return;
    setIsSpeaking(true);
    speakText(result.advisory.listenText, i18n.language || 'en', () => setIsSpeaking(false));
  };

  const toggleSection = (s) => setExpandedSection(expandedSection === s ? null : s);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center space-y-3">
        <div className="w-12 h-12 rounded-full border-4 border-t-transparent animate-spin mx-auto"
          style={{ borderColor: '#C9DEC1', borderTopColor: '#527A5A' }} />
        <p className="text-sm font-medium" style={{ color: '#6B7D70' }}>Loading scan result...</p>
      </div>
    </div>
  );

  if (error || !result) return (
    <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-5">
      <AlertTriangle className="w-12 h-12 mx-auto" style={{ color: '#D8B86A' }} />
      <h2 className="text-xl font-bold" style={{ color: '#294333' }}>Result Not Found</h2>
      <p className="text-sm" style={{ color: '#6B7D70' }}>{error || 'Could not load the scan result.'}</p>
      <Link to="/detect" className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white rounded-[14px]"
        style={{ background: '#527A5A' }}>
        <ArrowLeft className="w-4 h-4" /> Try Another Scan
      </Link>
    </div>
  );

  const isHealthy = result.isHealthy;
  const headerBg = isHealthy ? 'linear-gradient(135deg, #2E4D35, #527A5A)' : result.confidence >= 75 ? 'linear-gradient(135deg, #5A2C2C, #C98282)' : 'linear-gradient(135deg, #4E3D18, #D8B86A)';

  const sections = [
    { id: 'advisory',    label: '💡 Farming Advisory',  icon: Zap },
    { id: 'disease',     label: '🦠 Disease Details',   icon: BookOpen },
    { id: 'treatment',   label: '💊 Treatment Plan',    icon: Sprout },
    { id: 'predictions', label: '📊 Top Predictions',   icon: Star },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-5" style={{ background: '#EAF4E4', minHeight: '100vh' }}>

      {/* Back */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-medium transition-all"
        style={{ color: '#6B7D70' }}
        onMouseEnter={e => e.currentTarget.style.color = '#294333'}
        onMouseLeave={e => e.currentTarget.style.color = '#6B7D70'}>
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      {/* ── Hero Result Card ── */}
      <div className="rounded-[22px] overflow-hidden" style={{ boxShadow: '0 8px 32px rgba(41,67,51,0.12)' }}>
        {/* Header bar */}
        <div className="px-6 py-5 flex items-center justify-between text-white" style={{ background: headerBg }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.15)' }}>
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium opacity-75">Crop Health Report</p>
              <h1 className="text-xl font-bold leading-tight">
                {isHealthy ? `Healthy ${result.crop}` : `${result.crop} — ${result.disease}`}
              </h1>
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-3xl font-bold">{result.confidence}%</div>
            <div className="text-xs opacity-75">Confidence</div>
          </div>
        </div>

        {/* Body */}
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5" style={{ background: '#FFFFFF' }}>
          <div className="space-y-3">
            {result.imageUrl && (
              <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #C9DEC1' }}>
                <img src={result.imageUrl} alt="Scanned crop leaf" className="w-full h-52 object-cover"
                  onError={e => e.target.style.display = 'none'} />
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              <StatusBadge isHealthy={isHealthy} confidence={result.confidence} />
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold"
                style={{ background: '#EAF4E4', color: '#294333', border: '1px solid #C9DEC1' }}>
                <Leaf className="w-3.5 h-3.5" style={{ color: '#527A5A' }} /> {result.crop}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <ConfidenceMeter confidence={result.confidence} />
            {result.advisory?.weatherRiskNotice && (
              <div className="p-3 rounded-xl text-xs" style={{ background: '#FDF8EC', border: '1px solid #F3DFA0', color: '#4E3D18' }}>
                <span className="font-semibold">⚠️ Weather Alert: </span>{result.advisory.weatherRiskNotice}
              </div>
            )}
            {result.advisory?.listenText && (
              <button onClick={handleSpeak} disabled={isSpeaking}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all min-h-0"
                style={isSpeaking
                  ? { background: '#EAF4E4', color: '#527A5A', cursor: 'not-allowed' }
                  : { background: '#527A5A', color: '#FFFFFF' }}
                onMouseEnter={e => { if (!isSpeaking) e.currentTarget.style.background = '#3F6246'; }}
                onMouseLeave={e => { if (!isSpeaking) e.currentTarget.style.background = '#527A5A'; }}>
                <Volume2 className={`w-4 h-4 ${isSpeaking ? 'animate-pulse' : ''}`} />
                {isSpeaking ? 'Speaking...' : '🔊 Listen to Advisory'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Weather ── */}
      {result.weather && <WeatherCard weather={result.weather} />}

      {/* ── Collapsible Sections ── */}
      <div className="space-y-2.5">
        {sections.map(({ id, label }) => (
          <div key={id} className="rounded-[18px] overflow-hidden"
            style={{ background: '#FFFFFF', border: '1px solid #C9DEC1' }}>
            <button onClick={() => toggleSection(id)}
              className="w-full flex items-center justify-between px-5 py-4 transition-all"
              style={{ color: '#294333' }}
              onMouseEnter={e => e.currentTarget.style.background = '#F4F8EF'}
              onMouseLeave={e => e.currentTarget.style.background = ''}>
              <span className="text-sm font-semibold">{label}</span>
              {expandedSection === id
                ? <ChevronUp className="w-4 h-4" style={{ color: '#899B6A' }} />
                : <ChevronDown className="w-4 h-4" style={{ color: '#899B6A' }} />}
            </button>

            {expandedSection === id && (
              <div className="px-5 pb-5 space-y-4" style={{ borderTop: '1px solid #EAF4E4' }}>

                {id === 'advisory' && result.advisory && (
                  <div className="space-y-3 pt-4">
                    <div className="px-4 py-3 rounded-xl text-sm font-semibold"
                      style={result.advisory.priority === 'High'
                        ? { background: '#FAEEED', color: '#5A2C2C', border: '1px solid #E5B3B0' }
                        : result.advisory.priority === 'Medium'
                        ? { background: '#FDF8EC', color: '#4E3D18', border: '1px solid #F3DFA0' }
                        : { background: '#EAF4E4', color: '#2E4D35', border: '1px solid #C9DEC1' }}>
                      Priority: {result.advisory.priority} — {result.advisory.headline}
                    </div>
                    {result.advisory.recommendations?.length > 0 && (
                      <ul className="space-y-2">
                        {result.advisory.recommendations.map((rec, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm" style={{ color: '#4A5E52' }}>
                            <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#527A5A' }} />
                            {rec}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}

                {id === 'disease' && (
                  <div className="space-y-4 pt-4">
                    {result.diseaseDetails?.symptoms?.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold mb-2" style={{ color: '#294333' }}>Symptoms</h3>
                        <ul className="space-y-1.5">
                          {result.diseaseDetails.symptoms.map((s, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm" style={{ color: '#4A5E52' }}>
                              <span style={{ color: '#C98282' }}>·</span>{s}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {result.diseaseDetails?.causes?.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold mb-2" style={{ color: '#294333' }}>Causes</h3>
                        <ul className="space-y-1.5">
                          {result.diseaseDetails.causes.map((c, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm" style={{ color: '#4A5E52' }}>
                              <span style={{ color: '#D8B86A' }}>·</span>{c}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {result.diseaseDetails?.severity && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold" style={{ color: '#294333' }}>Severity:</span>
                        <span className="px-2 py-0.5 rounded-lg text-xs font-semibold"
                          style={result.diseaseDetails.severity === 'High'
                            ? { background: '#FAEEED', color: '#5A2C2C' }
                            : result.diseaseDetails.severity === 'Medium'
                            ? { background: '#FDF8EC', color: '#4E3D18' }
                            : { background: '#EAF4E4', color: '#2E4D35' }}>
                          {result.diseaseDetails.severity}
                        </span>
                      </div>
                    )}
                    {!result.diseaseDetails?.symptoms?.length && !result.diseaseDetails?.causes?.length && (
                      <p className="text-sm pt-2" style={{ color: '#6B7D70' }}>Disease details available after seeding the database.</p>
                    )}
                  </div>
                )}

                {id === 'treatment' && (
                  <div className="space-y-4 pt-4">
                    {result.diseaseDetails?.organicTreatment?.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold mb-2 flex items-center gap-1.5" style={{ color: '#294333' }}>
                          🌿 Organic Treatment
                        </h3>
                        <ul className="space-y-1.5">
                          {result.diseaseDetails.organicTreatment.map((t, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm" style={{ color: '#4A5E52' }}>
                              <Sprout className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: '#527A5A' }} />{t}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {result.diseaseDetails?.chemicalTreatment?.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold mb-2" style={{ color: '#294333' }}>🧪 Chemical Treatment</h3>
                        <ul className="space-y-1.5">
                          {result.diseaseDetails.chemicalTreatment.map((t, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm" style={{ color: '#4A5E52' }}>
                              <span style={{ color: '#899B6A' }}>·</span>{t}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {result.diseaseDetails?.preventiveMeasures?.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold mb-2" style={{ color: '#294333' }}>🛡️ Prevention</h3>
                        <ul className="space-y-1.5">
                          {result.diseaseDetails.preventiveMeasures.map((m, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm" style={{ color: '#4A5E52' }}>
                              <ShieldCheck className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: '#527A5A' }} />{m}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {!result.diseaseDetails?.organicTreatment?.length && (
                      <p className="text-sm pt-2" style={{ color: '#6B7D70' }}>Treatment details available after seeding the disease database.</p>
                    )}
                  </div>
                )}

                {id === 'predictions' && result.topPredictions?.length > 0 && (
                  <div className="space-y-3 pt-4">
                    {result.topPredictions.map((pred, i) => (
                      <div key={i} className="space-y-1.5">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium" style={{ color: '#294333' }}>
                            {i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'} {pred.crop} — {pred.disease || 'Healthy'}
                          </span>
                          <span className="font-bold" style={{ color: '#527A5A' }}>{pred.confidence}%</span>
                        </div>
                        <div className="w-full rounded-full h-1.5" style={{ background: '#EAF4E4' }}>
                          <div className="h-1.5 rounded-full" style={{ width: `${pred.confidence}%`, background: i === 0 ? '#527A5A' : '#C9DEC1' }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ── Actions ── */}
      <div className="grid grid-cols-2 gap-3">
        <Link to="/detect" className="flex items-center justify-center gap-2 py-3.5 text-sm font-semibold text-white rounded-[14px] transition-all"
          style={{ background: '#527A5A' }}
          onMouseEnter={e => e.currentTarget.style.background = '#3F6246'}
          onMouseLeave={e => e.currentTarget.style.background = '#527A5A'}>
          <RefreshCw className="w-4 h-4" /> New Scan
        </Link>
        <Link to="/history" className="flex items-center justify-center gap-2 py-3.5 text-sm font-semibold rounded-[14px] transition-all"
          style={{ background: '#FFFFFF', border: '1.5px solid #C9DEC1', color: '#294333' }}
          onMouseEnter={e => e.currentTarget.style.background = '#EAF4E4'}
          onMouseLeave={e => e.currentTarget.style.background = '#FFFFFF'}>
          📋 View History
        </Link>
      </div>

      <p className="text-center text-xs pb-2" style={{ color: '#899B6A' }}>
        ⚠️ AI results are estimates. For uncertain cases, consult your local agricultural expert.
      </p>
    </div>
  );
}
