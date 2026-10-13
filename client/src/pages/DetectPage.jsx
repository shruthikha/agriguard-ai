import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Camera, Upload, X, ChevronDown, MapPin, Loader2,
  Sparkles, ShieldCheck, AlertCircle, Leaf, Info, CheckCircle2
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/useAuth';

const CROPS = ['Tomato', 'Potato', 'Pepper', 'Apple'];

export default function DetectPage({ onScanResult, onOpenDemoModal, selectedDemo, onDemoConsumed }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const fileInputRef = useRef(null);

  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedCrop, setSelectedCrop] = useState('');
  const [location, setLocation] = useState({ lat: '', lon: '', name: '' });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [notes, setNotes] = useState('');
  const [demoLabel, setDemoLabel] = useState('');

  // ── Handle demo image from DemoPickerModal ──
  useEffect(() => {
    if (!selectedDemo) return;
    const loadDemoImage = async () => {
      try {
        setError('');
        setDemoLabel(`${selectedDemo.crop} – ${selectedDemo.diseaseName}`);
        setSelectedCrop(selectedDemo.crop);
        const response = await fetch(selectedDemo.imagePath);
        if (!response.ok) throw new Error('Demo image not found');
        const blob = await response.blob();
        const ext = selectedDemo.imagePath.split('.').pop();
        const mimeType = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : `image/${ext}`;
        const file = new File([blob], `demo_${selectedDemo.id}.${ext}`, { type: mimeType });
        setSelectedImage(file);
        const reader = new FileReader();
        reader.onload = (e) => setImagePreview(e.target.result);
        reader.readAsDataURL(file);
        if (onDemoConsumed) onDemoConsumed();
      } catch {
        setError('Could not load demo image. Please upload a leaf photo manually.');
        if (onDemoConsumed) onDemoConsumed();
      }
    };
    loadDemoImage();
  }, [selectedDemo]);

  const handleImageSelect = useCallback((file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) { setError('Please upload a valid image file (JPG, PNG, WebP).'); return; }
    if (file.size > 15 * 1024 * 1024) { setError('Image is too large. Maximum size is 15MB.'); return; }
    setError(''); setDemoLabel(''); setSelectedImage(file);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target.result);
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault(); setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleImageSelect(file);
  }, [handleImageSelect]);

  const handleGetLocation = () => {
    if (!navigator.geolocation) { setError('Geolocation is not supported.'); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => setLocation({ lat: pos.coords.latitude.toFixed(4), lon: pos.coords.longitude.toFixed(4), name: 'Your Location' }),
      () => setError('Could not get location. You can continue without it.')
    );
  };

  const handleAnalyze = async () => {
    if (!selectedImage) { setError('Please upload a crop leaf image before analyzing.'); return; }
    setIsAnalyzing(true); setError('');
    try {
      const formData = new FormData();
      formData.append('image', selectedImage);
      if (selectedCrop) formData.append('crop', selectedCrop);
      if (location.lat) formData.append('lat', location.lat);
      if (location.lon) formData.append('lon', location.lon);
      if (location.name) formData.append('location', location.name);
      if (notes) formData.append('notes', notes);
      const lang = user?.preferredLanguage || localStorage.getItem('i18nextLng') || 'en';
      formData.append('language', lang);
      const res = await api.post('/predict', formData, { headers: { 'Content-Type': 'multipart/form-data' }, timeout: 90000 });
      if (res.data.success) { onScanResult(res.data); navigate(`/result/${res.data.scanId}`); }
      else setError(res.data.message || 'Analysis failed. Please try again.');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Analysis failed. Please try again.');
    } finally { setIsAnalyzing(false); }
  };

  const clearImage = () => {
    setSelectedImage(null); setImagePreview(null); setDemoLabel(''); setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6" style={{ background: '#EAF4E4', minHeight: '100vh' }}>

      {/* ── Header ── */}
      <div className="space-y-1">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #2E4D35, #527A5A)' }}>
            <Leaf className="w-4 h-4 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: '#294333' }}>
            {t('detect.title', 'Check Your Crop')}
          </h1>
        </div>
        <p className="text-sm" style={{ color: '#6B7D70' }}>
          {t('detect.subtitle', 'Take a clear photo of a leaf to identify possible crop diseases')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

        {/* ── Left: Image Upload ── */}
        <div className="lg:col-span-3 space-y-4">

          {/* Upload card */}
          <div className="rounded-[22px] overflow-hidden"
            style={{ background: '#FFFFFF', border: `2px solid ${dragOver ? '#527A5A' : '#C9DEC1'}`, boxShadow: '0 4px 24px rgba(70,95,75,0.07)' }}>

            <div className="px-5 py-3.5" style={{ borderBottom: '1px solid #EAF4E4' }}>
              <h2 className="text-sm font-semibold flex items-center gap-2" style={{ color: '#294333' }}>
                <Camera className="w-4 h-4" style={{ color: '#527A5A' }} />
                {t('detect.uploadTitle', 'Upload Leaf Image')}
              </h2>
            </div>

            {imagePreview ? (
              <div className="relative">
                <img src={imagePreview} alt="Selected crop leaf" className="w-full h-72 object-cover" />
                {isAnalyzing && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10"
                    style={{ background: 'rgba(41,67,51,0.72)' }}>
                    <div className="animate-scan-line" />
                    <div className="text-center text-white space-y-1.5 z-20">
                      <Loader2 className="w-10 h-10 animate-spin mx-auto" />
                      <p className="font-semibold text-sm">Analyzing with MobileNetV2...</p>
                      <p className="text-xs opacity-70">This may take 15–30 seconds</p>
                    </div>
                  </div>
                )}
                <button onClick={clearImage} disabled={isAnalyzing}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all disabled:opacity-50"
                  style={{ background: '#C98282', color: '#FFFFFF' }}
                  title="Remove image">
                  <X className="w-4 h-4" />
                </button>
                {demoLabel ? (
                  <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
                    style={{ background: 'rgba(216,184,106,0.92)', color: '#2A200D' }}>
                    <Sparkles className="w-3 h-3" /> Demo: {demoLabel}
                  </div>
                ) : (
                  <div className="absolute bottom-3 left-3 px-3 py-1 rounded-full text-xs font-medium max-w-[70%] truncate"
                    style={{ background: 'rgba(41,67,51,0.7)', color: '#FFFFFF' }}>
                    {selectedImage?.name}
                  </div>
                )}
              </div>
            ) : (
              <div
                className="m-4 h-60 rounded-2xl flex flex-col items-center justify-center gap-4 cursor-pointer transition-all"
                style={{ border: `2px dashed ${dragOver ? '#527A5A' : '#C9DEC1'}`, background: dragOver ? '#EAF4E4' : '#F4F8EF' }}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{ background: '#EAF4E4' }}>
                  <Upload className="w-7 h-7" style={{ color: '#527A5A' }} />
                </div>
                <div className="text-center px-4">
                  <p className="text-sm font-semibold" style={{ color: '#294333' }}>
                    {t('detect.dragDrop', 'Drop your leaf photo here')}
                  </p>
                  <p className="text-xs mt-1" style={{ color: '#899B6A' }}>JPG, PNG, WebP · Max 15MB</p>
                </div>
                <div className="flex gap-2.5">
                  <button type="button"
                    className="px-4 py-2 text-sm font-semibold text-white rounded-xl transition-all min-h-0"
                    style={{ background: '#527A5A' }}
                    onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                    onMouseEnter={e => e.currentTarget.style.background = '#3F6246'}
                    onMouseLeave={e => e.currentTarget.style.background = '#527A5A'}>
                    📁 {t('detect.gallery', 'Gallery')}
                  </button>
                  <button type="button"
                    className="px-4 py-2 text-sm font-semibold rounded-xl transition-all min-h-0"
                    style={{ background: '#FDF8EC', border: '1px solid #F3DFA0', color: '#4E3D18' }}
                    onClick={(e) => { e.stopPropagation(); onOpenDemoModal(); }}
                    onMouseEnter={e => e.currentTarget.style.background = '#FAF0D2'}
                    onMouseLeave={e => e.currentTarget.style.background = '#FDF8EC'}>
                    ✨ {t('detect.demo', 'Demo')}
                  </button>
                </div>
              </div>
            )}

            <input ref={fileInputRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp"
              className="hidden" onChange={(e) => handleImageSelect(e.target.files[0])} />
          </div>

          {/* Tips */}
          <div className="rounded-2xl p-4" style={{ background: '#FDF8EC', border: '1px solid #F3DFA0' }}>
            <div className="flex items-start gap-2.5">
              <Info className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#D8B86A' }} />
              <div className="text-xs space-y-1.5" style={{ color: '#4E3D18' }}>
                <p className="font-semibold">📸 {t('detect.tipsTitle', 'Photo Tips for Best Results')}</p>
                <ul className="space-y-1" style={{ color: '#735B24' }}>
                  {['tip1','tip2','tip3','tip4'].map((k,i) => (
                    <li key={k} className="flex items-start gap-1.5">
                      <span>·</span>
                      <span>{t(`detect.${k}`, ['Take close-up photos of a single affected leaf','Use good lighting — avoid shadows or glare','Ensure the leaf fills most of the frame','Avoid blurry or out-of-focus images'][i])}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right: Settings + Action ── */}
        <div className="lg:col-span-2 space-y-4">

          {/* Crop */}
          <div className="rounded-2xl p-4" style={{ background: '#FFFFFF', border: '1px solid #C9DEC1' }}>
            <label className="block text-sm font-semibold mb-2" style={{ color: '#294333' }}>
              🌱 {t('detect.cropLabel', 'Select Crop Type')}
              <span className="font-normal ml-1 text-xs" style={{ color: '#899B6A' }}>({t('detect.optional','optional')})</span>
            </label>
            <div className="relative">
              <select value={selectedCrop} onChange={(e) => setSelectedCrop(e.target.value)}
                className="w-full appearance-none rounded-xl px-3 py-2.5 text-sm font-medium pr-8 outline-none transition-all min-h-0"
                style={{ background: '#F4F8EF', border: '1.5px solid #C9DEC1', color: '#294333' }}
                onFocus={e => { e.currentTarget.style.borderColor = '#527A5A'; e.currentTarget.style.background = '#FFFFFF'; }}
                onBlur={e => { e.currentTarget.style.borderColor = '#C9DEC1'; e.currentTarget.style.background = '#F4F8EF'; }}>
                <option value="">{t('detect.autoDetect', 'Auto-detect crop')}</option>
                {CROPS.map((crop) => <option key={crop} value={crop}>{crop}</option>)}
              </select>
              <ChevronDown className="absolute right-2.5 top-3 w-4 h-4 pointer-events-none" style={{ color: '#899B6A' }} />
            </div>
          </div>

          {/* Location */}
          <div className="rounded-2xl p-4" style={{ background: '#FFFFFF', border: '1px solid #C9DEC1' }}>
            <label className="block text-sm font-semibold mb-2" style={{ color: '#294333' }}>
              📍 {t('detect.locationLabel', 'Farm Location')}
              <span className="font-normal ml-1 text-xs" style={{ color: '#899B6A' }}>({t('detect.forWeather','for weather')})</span>
            </label>
            {location.lat ? (
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium"
                style={{ background: '#EAF4E4', border: '1px solid #C9DEC1', color: '#294333' }}>
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: '#527A5A' }} />
                <span className="truncate flex-1">{location.name} ({location.lat}°, {location.lon}°)</span>
                <button onClick={() => setLocation({ lat:'', lon:'', name:'' })} style={{ color: '#C98282' }}>
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button onClick={handleGetLocation}
                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all min-h-0"
                style={{ background: '#F4F8EF', border: '1.5px solid #C9DEC1', color: '#4A5E52' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#EAF4E4'; e.currentTarget.style.borderColor = '#527A5A'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#F4F8EF'; e.currentTarget.style.borderColor = '#C9DEC1'; }}>
                <MapPin className="w-4 h-4" style={{ color: '#527A5A' }} />
                {t('detect.getLocation', 'Use My Location')}
              </button>
            )}
          </div>

          {/* Notes */}
          <div className="rounded-2xl p-4" style={{ background: '#FFFFFF', border: '1px solid #C9DEC1' }}>
            <label className="block text-sm font-semibold mb-2" style={{ color: '#294333' }}>
              📝 {t('detect.notesLabel', 'Farmer Notes')}
              <span className="font-normal ml-1 text-xs" style={{ color: '#899B6A' }}>({t('detect.optional','optional')})</span>
            </label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
              placeholder={t('detect.notesPlaceholder','Describe symptoms you see, how long, affected area...')}
              rows={3} maxLength={500}
              className="w-full rounded-xl px-3 py-2 text-sm resize-none outline-none transition-all"
              style={{ background: '#F4F8EF', border: '1.5px solid #C9DEC1', color: '#294333', minHeight: 'auto' }}
              onFocus={e => { e.currentTarget.style.borderColor = '#527A5A'; e.currentTarget.style.background = '#FFFFFF'; }}
              onBlur={e => { e.currentTarget.style.borderColor = '#C9DEC1'; e.currentTarget.style.background = '#F4F8EF'; }} />
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl text-sm"
              style={{ background: '#FAEEED', border: '1px solid #E5B3B0', color: '#5A2C2C' }}>
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#C98282' }} />
              <span>{error}</span>
            </div>
          )}

          {/* Analyze button */}
          <button onClick={handleAnalyze} disabled={!selectedImage || isAnalyzing}
            className="w-full py-4 rounded-[14px] font-semibold text-base transition-all flex items-center justify-center gap-2.5 min-h-0"
            style={!selectedImage || isAnalyzing
              ? { background: '#EAF4E4', color: '#899B6A', cursor: 'not-allowed' }
              : { background: '#527A5A', color: '#FFFFFF', boxShadow: '0 4px 20px rgba(82,122,90,0.30)' }}
            onMouseEnter={e => { if (selectedImage && !isAnalyzing) e.currentTarget.style.background = '#3F6246'; }}
            onMouseLeave={e => { if (selectedImage && !isAnalyzing) e.currentTarget.style.background = '#527A5A'; }}>
            {isAnalyzing ? (
              <><Loader2 className="w-5 h-5 animate-spin" />{t('detect.analyzing', 'Analyzing Leaf...')}</>
            ) : (
              <><ShieldCheck className="w-5 h-5" />{t('detect.analyzeBtn', 'Analyze Crop')}</>
            )}
          </button>

          <p className="text-center text-xs" style={{ color: '#899B6A' }}>
            <Sparkles className="w-3 h-3 inline mr-1" style={{ color: '#C9DEC1' }} />
            Powered by MobileNetV2 · PlantVillage · 18 Classes
          </p>
        </div>
      </div>
    </div>
  );
}
