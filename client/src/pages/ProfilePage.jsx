import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  User, Mail, Phone, MapPin, Leaf, Edit3, Save, X,
  LogOut, Shield, Settings, AlertCircle, CheckCircle2, Loader2
} from 'lucide-react';
import { useAuth } from '../context/useAuth';

const STATES = [
  'Andhra Pradesh','Assam','Bihar','Chhattisgarh','Gujarat','Haryana','Himachal Pradesh',
  'Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Odisha','Punjab',
  'Rajasthan','Tamil Nadu','Telangana','Uttar Pradesh','Uttarakhand','West Bengal','Other'
];

const LANGS = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिंदी' },
  { code: 'ta', label: 'தமிழ்' },
  { code: 'te', label: 'తెలుగు' },
  { code: 'kn', label: 'ಕನ್ನಡ' },
  { code: 'ml', label: 'മലയാളം' },
  { code: 'mr', label: 'मराठी' },
  { code: 'bn', label: 'বাংলা' },
];

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 py-3" style={{ borderBottom: '1px solid #EAF4E4' }}>
      <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: '#EAF4E4' }}>
        <Icon className="w-4 h-4" style={{ color: '#527A5A' }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium" style={{ color: '#899B6A' }}>{label}</p>
        <p className="text-sm font-semibold truncate" style={{ color: '#294333' }}>{value || '—'}</p>
      </div>
    </div>
  );
}

const inputStyle = {
  background: '#F4F8EF', border: '1.5px solid #C9DEC1',
  borderRadius: 12, padding: '0.6rem 0.875rem',
  fontSize: '0.875rem', color: '#294333', outline: 'none', width: '100%',
};

export default function ProfilePage() {
  const { user, updateProfile, logout } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error,   setError]   = useState('');
  const [form, setForm] = useState({
    name:              user?.name                || '',
    phone:             user?.phone               || '',
    state:             user?.location?.state     || '',
    district:          user?.location?.district  || '',
    farmSize:          user?.farmSize            || '',
    preferredLanguage: user?.preferredLanguage   || 'en',
  });

  const handleSave = async () => {
    setLoading(true); setError('');
    try {
      await updateProfile({
        name: form.name, phone: form.phone,
        location: { state: form.state, district: form.district },
        farmSize: form.farmSize ? parseFloat(form.farmSize) : undefined,
        preferredLanguage: form.preferredLanguage
      });
      setSuccess(true); setEditing(false);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Profile update failed.');
    } finally { setLoading(false); }
  };

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-5"
      style={{ background: '#EAF4E4', minHeight: '100vh' }}>

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #2E4D35, #527A5A)' }}>
          <User className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#294333' }}>
            {t('profile.title', 'My Profile')}
          </h1>
          <p className="text-xs" style={{ color: '#6B7D70' }}>Manage your farmer account settings</p>
        </div>
      </div>

      {/* Avatar Card */}
      <div className="rounded-[22px] p-6 flex items-center gap-5"
        style={{ background: 'linear-gradient(135deg, #2E4D35 0%, #527A5A 100%)', boxShadow: '0 8px 32px rgba(41,67,51,0.22)' }}>
        <div className="w-18 h-18 w-[72px] h-[72px] rounded-2xl flex items-center justify-center text-3xl font-bold text-white flex-shrink-0"
          style={{ background: 'rgba(255,255,255,0.15)' }}>
          {user?.name?.charAt(0)?.toUpperCase() || '🌱'}
        </div>
        <div className="min-w-0">
          <h2 className="text-xl font-bold text-white truncate">{user?.name}</h2>
          <p className="text-sm truncate" style={{ color: '#B5D1B0' }}>{user?.email}</p>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className="text-xs px-2.5 py-1 rounded-lg font-semibold"
              style={user?.role === 'admin'
                ? { background: 'rgba(216,184,106,0.25)', color: '#FAF0D2' }
                : { background: 'rgba(255,255,255,0.15)', color: '#DDEBDD' }}>
              {user?.role === 'admin' ? '👑 Admin' : '🌱 Farmer'}
            </span>
            <span className="text-xs" style={{ color: '#90BA8A' }}>
              Member since {new Date(user?.createdAt || Date.now()).getFullYear()}
            </span>
          </div>
        </div>
      </div>

      {/* Feedback */}
      {success && (
        <div className="flex items-center gap-2.5 p-3.5 rounded-2xl text-sm"
          style={{ background: '#EAF4E4', border: '1px solid #C9DEC1', color: '#2E4D35' }}>
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: '#527A5A' }} />
          Profile updated successfully!
        </div>
      )}
      {error && (
        <div className="flex items-start gap-2.5 p-3.5 rounded-2xl text-sm"
          style={{ background: '#FAEEED', border: '1px solid #E5B3B0', color: '#5A2C2C' }}>
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#C98282' }} /> {error}
        </div>
      )}

      {/* Details Card */}
      <div className="rounded-[20px] overflow-hidden"
        style={{ background: '#FFFFFF', border: '1px solid #C9DEC1', boxShadow: '0 4px 20px rgba(70,95,75,0.06)' }}>
        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid #EAF4E4' }}>
          <h2 className="text-sm font-semibold flex items-center gap-2" style={{ color: '#294333' }}>
            <Settings className="w-4 h-4" style={{ color: '#899B6A' }} /> Account Details
          </h2>
          {!editing ? (
            <button onClick={() => setEditing(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl transition-all min-h-0"
              style={{ background: '#EAF4E4', border: '1px solid #C9DEC1', color: '#527A5A' }}>
              <Edit3 className="w-3.5 h-3.5" /> Edit
            </button>
          ) : (
            <div className="flex gap-2">
              <button onClick={() => { setEditing(false); setError(''); }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl transition-all min-h-0"
                style={{ background: '#F4F8EF', border: '1px solid #C9DEC1', color: '#4A5E52' }}>
                <X className="w-3.5 h-3.5" /> Cancel
              </button>
              <button onClick={handleSave} disabled={loading}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white rounded-xl transition-all min-h-0 disabled:opacity-60"
                style={{ background: '#527A5A' }}>
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                Save
              </button>
            </div>
          )}
        </div>

        <div className="px-5 pb-2">
          {!editing ? (
            <>
              <InfoRow icon={User}   label="Full Name"          value={user?.name} />
              <InfoRow icon={Mail}   label="Email"              value={user?.email} />
              <InfoRow icon={Phone}  label="Mobile"             value={user?.phone} />
              <InfoRow icon={MapPin} label="Location"           value={[user?.location?.district, user?.location?.state].filter(Boolean).join(', ')} />
              <InfoRow icon={Leaf}   label="Farm Size"          value={user?.farmSize ? `${user.farmSize} acres` : null} />
              <InfoRow icon={Shield} label="Preferred Language" value={LANGS.find(l => l.code === user?.preferredLanguage)?.label || 'English'} />
            </>
          ) : (
            <div className="space-y-4 py-4">
              {[
                { key: 'name',  label: 'Full Name',   type: 'text' },
                { key: 'phone', label: 'Mobile',      type: 'tel'  },
              ].map(({ key, label, type }) => (
                <div key={key}>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: '#294333' }}>{label}</label>
                  <input type={type} value={form[key]} style={inputStyle}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    onFocus={e => { e.currentTarget.style.borderColor = '#527A5A'; e.currentTarget.style.background = '#FFFFFF'; }}
                    onBlur={e => { e.currentTarget.style.borderColor = '#C9DEC1'; e.currentTarget.style.background = '#F4F8EF'; }} />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: '#294333' }}>State</label>
                  <select value={form.state} style={{ ...inputStyle, appearance: 'none' }}
                    onChange={e => setForm(f => ({ ...f, state: e.target.value }))}>
                    <option value="">Select State</option>
                    {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: '#294333' }}>District</label>
                  <input type="text" value={form.district} style={inputStyle}
                    onChange={e => setForm(f => ({ ...f, district: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: '#294333' }}>Farm Size (acres)</label>
                <input type="number" value={form.farmSize} min="0" step="0.1" style={inputStyle}
                  onChange={e => setForm(f => ({ ...f, farmSize: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: '#294333' }}>Preferred Language</label>
                <select value={form.preferredLanguage} style={{ ...inputStyle, appearance: 'none' }}
                  onChange={e => setForm(f => ({ ...f, preferredLanguage: e.target.value }))}>
                  {LANGS.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Logout */}
      <button onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-[14px] text-sm font-semibold transition-all min-h-0"
        style={{ background: '#FAEEED', border: '1.5px solid #E5B3B0', color: '#5A2C2C' }}
        onMouseEnter={e => e.currentTarget.style.background = '#F3D9D8'}
        onMouseLeave={e => e.currentTarget.style.background = '#FAEEED'}>
        <LogOut className="w-4 h-4" />
        Sign Out of AgriGuard AI
      </button>
    </div>
  );
}
