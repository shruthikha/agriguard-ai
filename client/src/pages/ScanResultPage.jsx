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
  const [result, setResult] = useState(() => {
    if (scanResult && (String(scanResult.scanId) === String(scanId) || String(scanResult._id) === String(scanId))) {
      return scanResult;
    }
    return null;
  });
  const [loading, setLoading] = useState(() => !result);
  const [error, setError] = useState('');
  const [expandedSections, setExpandedSections] = useState({
    treatment: true,
    advisory: true,
    disease: false,
    predictions: false
  });
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    const isCurrentScan = scanResult && (
      String(scanResult.scanId) === String(scanId) ||
      String(scanResult._id) === String(scanId)
    );

    if (isCurrentScan) {
      setResult(scanResult);
      setLoading(false);
      setError('');
    } else if (scanId) {
      setLoading(true);
      setError('');
      api.get(`/scans/${scanId}`)
        .then((res) => {
          if (res.data?.success && res.data.scan) {
            const scan = res.data.scan;
            setResult({
              scanId: scan._id || scan.scanId,
              _id: scan._id || scan.scanId,
              crop: scan.crop,
              disease: scan.disease,
              confidence: scan.confidence,
              confidenceLevel: scan.confidenceLevel,
              isHealthy: scan.isHealthy,
              classId: scan.classId,
              userCropHint: scan.userCropHint,
              imageUrl: scan.imageUrl,
              topPredictions: scan.topPredictions || [],
              alternativePredictions: scan.alternativePredictions || (scan.topPredictions ? scan.topPredictions.slice(1) : []),
              quality: scan.quality || {},
              warnings: scan.warnings || [],
              cropHintAnalysis: scan.cropHintAnalysis || null,
              diseaseDetails: scan.diseaseDetails,
              advisory: scan.advisory,
              weather: scan.weatherAtScan || scan.weather,
              regionalNames: scan.regionalNames || {},
              disclaimer: scan.disclaimer
            });
          } else {
            setError('Scan result not found.');
          }
        })
        .catch((err) => {
          setError(err.response?.data?.message || 'Could not load scan result.');
        })
        .finally(() => setLoading(false));
    }
  }, [scanId, scanResult]);

  const handleSpeak = () => {
    if (!result?.advisory?.listenText) return;
    setIsSpeaking(true);
    speakText(result.advisory.listenText, i18n.language || 'en', () => setIsSpeaking(false));
  };

  const toggleSection = (s) => setExpandedSections(prev => ({
    ...prev,
    [s]: !prev[s]
  }));

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
  const isLowConfidence = result.confidence < 50 || result.quality?.isOOD;
  const headerBg = isHealthy
    ? 'linear-gradient(135deg, #2E4D35, #527A5A)'
    : isLowConfidence
    ? 'linear-gradient(135deg, #5A3E1B, #9E6C2E)'
    : result.confidence >= 75
    ? 'linear-gradient(135deg, #5A2C2C, #C98282)'
    : 'linear-gradient(135deg, #4E3D18, #D8B86A)';

  const sections = [
    { id: 'advisory',    label: '💡 Farming Advisory',  icon: Zap },
    { id: 'disease',     label: '🦠 Disease Details',   icon: BookOpen },
    { id: 'treatment',   label: '💊 Treatment Plan',    icon: Sprout },
    { id: 'predictions', label: '📊 Top Predictions',   icon: Star },
  ];

  const currentLang = i18n.language || 'en';
  const regionalName = result.regionalNames?.[currentLang] || result.regionalNames?.ta || '';


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
                {isHealthy
                  ? `Healthy ${result.crop}`
                  : isLowConfidence
                  ? `Possible ${result.crop} — ${result.disease} (Tentative)`
                  : `${result.crop} — ${result.disease}`}
              </h1>
              {regionalName && (
                <p className="text-xs opacity-85 mt-0.5 font-medium">{regionalName}</p>
              )}
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
              {result.userCropHint && result.userCropHint !== result.crop && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold"
                  style={{ background: '#FFF4E5', color: '#8A5D14', border: '1px solid #F3DFA0' }}>
                  Hint: {result.userCropHint}
                </span>
              )}
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

      {/* ── Diagnostic Warnings Banner ── */}
      {result.warnings && result.warnings.length > 0 && (
        <div className="rounded-[18px] p-4 space-y-1.5" style={{ background: '#FFF8EC', border: '1.5px solid #F3DFA0' }}>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider" style={{ color: '#8A5D14' }}>
            <AlertTriangle className="w-4 h-4" /> Diagnostic Quality & Uncertainty Notice
          </div>
          <ul className="space-y-1 text-xs" style={{ color: '#5C4318' }}>
            {result.warnings.map((w, idx) => (
              <li key={idx} className="flex items-start gap-1.5">
                <span className="font-bold">•</span>
                <span>{w}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

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
              {expandedSections[id]
                ? <ChevronUp className="w-4 h-4" style={{ color: '#899B6A' }} />
                : <ChevronDown className="w-4 h-4" style={{ color: '#899B6A' }} />}
            </button>

            {expandedSections[id] && (
              <div className="px-5 pb-5 space-y-4" style={{ borderTop: '1px solid #EAF4E4' }}>

                {id === 'advisory' && result.advisory && (
                  <div className="space-y-4 pt-4">
                    <div className="px-4 py-3 rounded-xl text-sm font-semibold"
                      style={result.advisory.priority === 'High'
                        ? { background: '#FAEEED', color: '#5A2C2C', border: '1px solid #E5B3B0' }
                        : result.advisory.priority === 'Medium'
                        ? { background: '#FDF8EC', color: '#4E3D18', border: '1px solid #F3DFA0' }
                        : { background: '#EAF4E4', color: '#2E4D35', border: '1px solid #C9DEC1' }}>
                      Priority: {result.advisory.priority} — {result.advisory.headline}
                    </div>

                    {result.advisory.actionSteps?.length > 0 && (
                      <div className="space-y-2">
                        <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: '#294333' }}>
                          ⚡ Immediate Action Steps
                        </h3>
                        <ul className="space-y-2">
                          {result.advisory.actionSteps.map((step, i) => (
                            <li key={i} className="flex items-start gap-2.5 p-3 rounded-xl text-sm font-medium"
                              style={{ background: '#F4F8EF', border: '1px solid #C9DEC1', color: '#294333' }}>
                              <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                                style={{ background: '#527A5A', color: '#FFFFFF' }}>
                                {i + 1}
                              </span>
                              <span>{step}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {result.advisory.recommendations?.length > 0 && (
                      <div className="space-y-2">
                        <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: '#6B7D70' }}>
                          Agronomic Guidelines
                        </h3>
                        <ul className="space-y-2">
                          {result.advisory.recommendations.map((rec, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm" style={{ color: '#4A5E52' }}>
                              <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#527A5A' }} />
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
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
                          style={result.diseaseDetails.severity === 'Critical' || result.diseaseDetails.severity === 'High'
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
                    {isHealthy ? (
                      <div className="p-4 rounded-xl text-sm" style={{ background: '#EAF4E4', color: '#2E4D35', border: '1px solid #C9DEC1' }}>
                        <p className="font-semibold mb-1">✅ No Chemical Pesticides Required</p>
                        <p className="text-xs opacity-90 leading-relaxed">
                          Your crop foliage is healthy and free of disease symptoms. Maintain balanced irrigation, weekly field scouting, and routine organic nourishment.
                        </p>
                      </div>
                    ) : (
                      <>
                        {result.diseaseDetails?.treatment?.length > 0 && (
                          <div className="space-y-2">
                            <h3 className="text-sm font-semibold flex items-center gap-1.5" style={{ color: '#294333' }}>
                              ✂️ Cultural Management & Field Sanitation
                            </h3>
                            <ul className="space-y-1.5">
                              {result.diseaseDetails.treatment.map((t, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm" style={{ color: '#4A5E52' }}>
                                  <span className="font-bold" style={{ color: '#527A5A' }}>•</span>
                                  <span>{t}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {result.diseaseDetails?.organicTreatment?.length > 0 && (
                          <div className="p-4 rounded-xl space-y-2.5" style={{ background: '#F4F8EF', border: '1px solid #C9DEC1' }}>
                            <h3 className="text-sm font-semibold flex items-center gap-1.5" style={{ color: '#2E4D35' }}>
                              <Sprout className="w-4 h-4" style={{ color: '#527A5A' }} /> 🌿 Organic & Biological Solutions
                            </h3>
                            <ul className="space-y-1.5">
                              {result.diseaseDetails.organicTreatment.map((t, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm" style={{ color: '#4A5E52' }}>
                                  <span className="font-bold" style={{ color: '#527A5A' }}>•</span>
                                  <span>{t}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {result.diseaseDetails?.chemicalTreatment?.length > 0 && (
                          <div className="p-4 rounded-xl space-y-2.5" style={{ background: '#FFF9F5', border: '1px solid #F5D5C5' }}>
                            <h3 className="text-sm font-semibold flex items-center gap-1.5" style={{ color: '#5A2C2C' }}>
                              🧪 Recommended Chemical Controls & Active Ingredients
                            </h3>
                            <ul className="space-y-1.5">
                              {result.diseaseDetails.chemicalTreatment.map((t, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm" style={{ color: '#4A5E52' }}>
                                  <span className="font-bold" style={{ color: '#C98282' }}>•</span>
                                  <span>{t}</span>
                                </li>
                              ))}
                            </ul>
                            {result.diseaseDetails?.chemicalWarning && (
                              <div className="mt-2.5 pt-2.5 text-xs flex items-start gap-2 border-t" style={{ borderColor: '#F5D5C5', color: '#8A4A4A' }}>
                                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-600" />
                                <span>{result.diseaseDetails.chemicalWarning}</span>
                              </div>
                            )}
                          </div>
                        )}

                        {result.diseaseDetails?.preventiveMeasures?.length > 0 && (
                          <div className="space-y-2">
                            <h3 className="text-sm font-semibold flex items-center gap-1.5" style={{ color: '#294333' }}>
                              <ShieldCheck className="w-4 h-4" style={{ color: '#527A5A' }} /> 🛡️ Long-Term Preventive Measures
                            </h3>
                            <ul className="space-y-1.5">
                              {result.diseaseDetails.preventiveMeasures.map((m, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm" style={{ color: '#4A5E52' }}>
                                  <span className="font-bold" style={{ color: '#527A5A' }}>•</span>
                                  <span>{m}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {!result.diseaseDetails?.organicTreatment?.length && !result.diseaseDetails?.treatment?.length && (
                          <p className="text-sm pt-2" style={{ color: '#6B7D70' }}>Treatment details available after seeding the disease database.</p>
                        )}
                      </>
                    )}
                  </div>
                )}

                {id === 'predictions' && (
                  <div className="space-y-4 pt-4">
                    <p className="text-xs" style={{ color: '#6B7D70' }}>
                      Primary prediction and top alternative candidates evaluated by the AI model for diagnostic transparency:
                    </p>
                    <div className="space-y-3">
                      {(result.topPredictions || []).map((pred, i) => {
                        const rankLabel = i === 0 ? '🥇 Primary' : i === 1 ? '🥈 Alternative 1' : i === 2 ? '🥉 Alternative 2' : '4️⃣ Alternative 3';
                        const isTop = i === 0;
                        return (
                          <div key={i} className="p-3 rounded-xl space-y-1.5" style={{ background: isTop ? '#F4F8EF' : '#FAFCF8', border: isTop ? '1px solid #C9DEC1' : '1px solid #E8EFE5' }}>
                            <div className="flex items-center justify-between text-sm">
                              <span className="font-semibold" style={{ color: '#294333' }}>
                                <span className="mr-1.5">{rankLabel}:</span> {pred.crop} — {pred.disease || 'Healthy'}
                              </span>
                              <span className="font-bold text-xs px-2 py-0.5 rounded-md" style={{ background: isTop ? '#EAF4E4' : '#FFFFFF', color: isTop ? '#2E4D35' : '#527A5A' }}>
                                {pred.confidence}%
                              </span>
                            </div>
                            <div className="w-full rounded-full h-2" style={{ background: '#EAF4E4' }}>
                              <div className="h-2 rounded-full transition-all duration-700" style={{ width: `${Math.max(4, pred.confidence)}%`, background: isTop ? '#527A5A' : '#899B6A' }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
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
