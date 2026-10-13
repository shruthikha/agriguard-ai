import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  CloudSun, Thermometer, Droplets, Wind, Eye, Umbrella,
  Sun, CloudRain, Cloud, MapPin, RefreshCw, AlertCircle
} from 'lucide-react';
import api from '../services/api';

function WeatherIcon({ condition }) {
  const c = condition?.toLowerCase() || '';
  if (c.includes('rain') || c.includes('drizzle')) return <CloudRain className="w-12 h-12" style={{ color: '#6B9AAF' }} />;
  if (c.includes('cloud')) return <Cloud className="w-12 h-12" style={{ color: '#899B6A' }} />;
  if (c.includes('sun') || c.includes('clear')) return <Sun className="w-12 h-12" style={{ color: '#D8B86A' }} />;
  return <CloudSun className="w-12 h-12" style={{ color: '#527A5A' }} />;
}

function FarmAdvisoryCard({ type, icon, message }) {
  const styles = {
    warning: { bg: '#FDF8EC', border: '#F3DFA0', color: '#4E3D18' },
    safe:    { bg: '#EAF4E4', border: '#C9DEC1', color: '#2E4D35' },
    info:    { bg: '#F4F8EF', border: '#C9DEC1', color: '#294333' },
  };
  const s = styles[type] || styles.info;
  return (
    <div className="flex items-start gap-3 p-4 rounded-2xl transition-all"
      style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.color }}>
      <span className="text-xl flex-shrink-0 mt-0.5">{icon}</span>
      <p className="text-sm leading-relaxed font-medium">{message}</p>
    </div>
  );
}

export default function WeatherPage() {
  const { t } = useTranslation();
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchCity, setSearchCity] = useState('');

  const fetchWeather = async (query = '') => {
    setLoading(true); setError('');
    try {
      const params = query ? `?city=${encodeURIComponent(query)}` : '';
      const res = await api.get(`/weather${params}`);
      if (res.data.success || res.data.temperature !== undefined) {
        setWeather(res.data.weather || res.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Could not fetch weather data.');
    } finally { setLoading(false); }
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchWeather(`${pos.coords.latitude},${pos.coords.longitude}`),
        () => fetchWeather()
      );
    } else { fetchWeather(); }
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchCity.trim()) fetchWeather(searchCity.trim());
  };

  const getAdvisories = (w) => {
    if (!w) return [];
    const a = [];
    if (w.windSpeed > 15)       a.push({ type: 'warning', icon: '💨', message: 'High wind speed. Avoid spraying pesticides — chemicals may drift to adjacent crops.' });
    else if (w.windSpeed > 8)   a.push({ type: 'info',    icon: '🌬️', message: 'Moderate wind. Spray early morning or evening when winds are calmer.' });
    else                         a.push({ type: 'safe',    icon: '✅', message: 'Wind conditions are suitable for spraying. Apply pesticides or fertilizers as needed.' });
    if (w.humidity > 85)         a.push({ type: 'warning', icon: '💧', message: 'Very high humidity. Fungal diseases are at high risk. Inspect crops regularly.' });
    else if (w.humidity > 70)    a.push({ type: 'info',    icon: '🌫️', message: 'Moderate humidity. Maintain good field drainage to prevent fungal growth.' });
    if (w.temperature > 35)      a.push({ type: 'warning', icon: '🌡️', message: 'Extreme heat. Water crops in the morning and evening. Avoid midday fieldwork.' });
    else if (w.temperature < 15) a.push({ type: 'info',    icon: '🥶', message: 'Cool temperatures. Frost-sensitive crops may need protection.' });
    if (w.rainfall > 20)         a.push({ type: 'warning', icon: '🌧️', message: 'Heavy rainfall. Ensure proper field drainage to prevent waterlogging.' });
    else if (!w.rainfall && w.humidity < 40) a.push({ type: 'info', icon: '🏜️', message: 'Dry conditions. Increase irrigation frequency. Watch for spider mites.' });
    return a;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-5" style={{ background: '#EAF4E4', minHeight: '100vh' }}>

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #2E4D35, #527A5A)' }}>
          <CloudSun className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#294333' }}>{t('weather.title', 'Agro-Weather Advisory')}</h1>
          <p className="text-xs" style={{ color: '#6B7D70' }}>Real-time weather · Farm impact analysis</p>
        </div>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="flex-1 flex items-center gap-2 px-3.5 py-2.5 rounded-2xl"
          style={{ background: '#FFFFFF', border: '1.5px solid #C9DEC1' }}>
          <MapPin className="w-4 h-4 flex-shrink-0" style={{ color: '#899B6A' }} />
          <input type="text" placeholder="Search city (e.g. Mumbai, Delhi)..."
            value={searchCity} onChange={(e) => setSearchCity(e.target.value)}
            className="flex-1 text-sm bg-transparent outline-none"
            style={{ color: '#294333', minHeight: 'auto' }} />
        </div>
        <button type="submit" disabled={loading}
          className="px-4 py-2.5 text-sm font-semibold text-white rounded-2xl transition-all min-h-0"
          style={{ background: '#527A5A' }}
          onMouseEnter={e => e.currentTarget.style.background = '#3F6246'}
          onMouseLeave={e => e.currentTarget.style.background = '#527A5A'}>
          Search
        </button>
        <button type="button" onClick={() => fetchWeather()}
          className="w-10 h-10 flex items-center justify-center rounded-2xl transition-all min-h-0"
          style={{ background: '#FFFFFF', border: '1px solid #C9DEC1' }}>
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} style={{ color: '#527A5A' }} />
        </button>
      </form>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2.5 p-4 rounded-2xl text-sm"
          style={{ background: '#FAEEED', border: '1px solid #E5B3B0', color: '#5A2C2C' }}>
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#C98282' }} />
          <div>
            <p>{error}</p>
            <p className="text-xs mt-1" style={{ color: '#9B5252' }}>
              Add a Weather API key in <code className="px-1 rounded" style={{ background: '#F3D9D8' }}>server/.env</code> → <code className="px-1 rounded" style={{ background: '#F3D9D8' }}>WEATHER_API_KEY</code> from openweathermap.org
            </p>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && !error && (
        <div className="p-12 flex items-center justify-center rounded-[22px]"
          style={{ background: '#FFFFFF', border: '1px solid #C9DEC1' }}>
          <div className="text-center space-y-3">
            <div className="w-12 h-12 rounded-full border-4 border-t-transparent animate-spin mx-auto"
              style={{ borderColor: '#C9DEC1', borderTopColor: '#527A5A' }} />
            <p className="text-sm font-medium" style={{ color: '#6B7D70' }}>Fetching weather data...</p>
          </div>
        </div>
      )}

      {/* Weather Data */}
      {!loading && weather && (
        <>
          {/* Main Weather Card */}
          <div className="rounded-[22px] overflow-hidden" style={{ boxShadow: '0 8px 32px rgba(41,67,51,0.12)' }}>
            <div className="p-6" style={{ background: 'linear-gradient(135deg, #2E4D35 0%, #527A5A 100%)' }}>
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="flex items-center gap-1.5 text-sm font-medium mb-2" style={{ color: '#C9DEC1' }}>
                    <MapPin className="w-4 h-4" /> {weather.location || 'Your Location'}
                  </div>
                  <div className="text-5xl font-bold text-white">{weather.temperature}°C</div>
                  <p className="text-base font-medium mt-1 capitalize" style={{ color: '#B5D1B0' }}>{weather.weatherCondition}</p>
                </div>
                <WeatherIcon condition={weather.weatherCondition} />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { icon: Droplets,    value: `${weather.humidity}%`,      label: 'Humidity' },
                  { icon: Wind,        value: `${weather.windSpeed} m/s`,  label: 'Wind' },
                  { icon: Umbrella,    value: `${weather.rainfall || 0} mm`, label: 'Rainfall' },
                  { icon: Eye,         value: weather.visibility || 'N/A', label: 'Visibility' },
                ].map(({ icon: Icon, value, label }) => (
                  <div key={label} className="rounded-xl p-3 text-white"
                    style={{ background: 'rgba(255,255,255,0.12)' }}>
                    <div className="flex items-center gap-1.5 text-xs mb-1" style={{ color: '#C9DEC1' }}>
                      <Icon className="w-3.5 h-3.5" /> {label}
                    </div>
                    <div className="text-lg font-bold">{value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Farm Advisories */}
          <div className="space-y-3">
            <h2 className="text-base font-semibold" style={{ color: '#294333' }}>🌾 Farm Impact Analysis</h2>
            {getAdvisories(weather).map((adv, i) => (
              <FarmAdvisoryCard key={i} {...adv} />
            ))}
          </div>

          {/* 5-day Forecast */}
          {weather.forecast?.length > 0 && (
            <div className="rounded-[20px] p-5" style={{ background: '#FFFFFF', border: '1px solid #C9DEC1' }}>
              <h2 className="text-sm font-semibold mb-4" style={{ color: '#294333' }}>5-Day Forecast</h2>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {weather.forecast.slice(0, 5).map((day, i) => (
                  <div key={i} className="text-center p-3 rounded-2xl"
                    style={{ background: '#F4F8EF', border: '1px solid #C9DEC1' }}>
                    <p className="text-xs font-medium mb-1.5" style={{ color: '#6B7D70' }}>{day.date}</p>
                    <div className="text-2xl mb-1.5">{day.icon || '🌤️'}</div>
                    <p className="text-sm font-bold" style={{ color: '#294333' }}>{day.maxTemp}°</p>
                    <p className="text-xs" style={{ color: '#899B6A' }}>{day.minTemp}°</p>
                    <p className="text-xs mt-1 font-medium" style={{ color: '#527A5A' }}>{day.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Empty state */}
      {!loading && !weather && !error && (
        <div className="py-16 text-center rounded-[22px]" style={{ background: '#FFFFFF', border: '1px solid #C9DEC1' }}>
          <CloudSun className="w-14 h-14 mx-auto mb-4" style={{ color: '#C9DEC1' }} />
          <h2 className="text-xl font-bold mb-2" style={{ color: '#294333' }}>No Weather Data</h2>
          <p className="text-sm" style={{ color: '#6B7D70' }}>Search for a city or allow location access to get weather information.</p>
        </div>
      )}
    </div>
  );
}
