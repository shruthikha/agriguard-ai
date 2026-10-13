import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Eye, EyeOff, Leaf, Mail, Lock, User, Phone,
  MapPin, AlertCircle, Loader2, CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/useAuth';

const STATES = [
  'Andhra Pradesh','Assam','Bihar','Chhattisgarh','Gujarat','Haryana','Himachal Pradesh',
  'Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Odisha','Punjab',
  'Rajasthan','Tamil Nadu','Telangana','Uttar Pradesh','Uttarakhand','West Bengal','Other'
];

const inputStyle = {
  background: '#F4F8EF', border: '1.5px solid #C9DEC1', borderRadius: 12,
  padding: '0.65rem 0.875rem 0.65rem 2.25rem',
  fontSize: '0.875rem', color: '#294333', outline: 'none', width: '100%',
};

export default function RegisterPage() {
  const { t }          = useTranslation();
  const { register }   = useAuth();
  const navigate       = useNavigate();

  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: '', state: '', district: '', farmSize: ''
  });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      setError('Please fill in all required fields.'); return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.'); return;
    }
    setLoading(true); setError('');
    try {
      await register({
        name: form.name, email: form.email, password: form.password,
        phone: form.phone,
        location: { state: form.state, district: form.district },
        farmSize: form.farmSize ? parseFloat(form.farmSize) : undefined
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally { setLoading(false); }
  };

  const Field = ({ icon: Icon, label, required, right, ...props }) => (
    <div>
      <label className="block text-xs font-semibold mb-1.5" style={{ color: '#294333' }}>
        {label}{required && <span style={{ color: '#C98282' }}> *</span>}
      </label>
      <div className="relative">
        <Icon className="absolute left-3.5 top-3.5 w-4 h-4 pointer-events-none" style={{ color: '#899B6A' }} />
        <input style={inputStyle}
          onFocus={e => { e.currentTarget.style.borderColor = '#527A5A'; e.currentTarget.style.background = '#FFFFFF'; }}
          onBlur={e => { e.currentTarget.style.borderColor = '#C9DEC1'; e.currentTarget.style.background = '#F4F8EF'; }}
          {...props} />
        {right && <div className="absolute right-3.5 top-3.5">{right}</div>}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ background: '#EAF4E4' }}>
      <div className="w-full max-w-md space-y-5 animate-slideUp">

        {/* Logo */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto"
            style={{ background: 'linear-gradient(135deg, #2E4D35, #527A5A)' }}>
            <Leaf className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold" style={{ color: '#294333' }}>Join AgriGuard AI</h1>
          <p className="text-sm" style={{ color: '#6B7D70' }}>Create your free farmer account</p>
        </div>

        {/* Card */}
        <div className="rounded-[22px] p-6 space-y-4"
          style={{ background: '#FFFFFF', border: '1px solid #C9DEC1', boxShadow: '0 8px 32px rgba(70,95,75,0.10)' }}>

          {error && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl text-sm"
              style={{ background: '#FAEEED', border: '1px solid #E5B3B0', color: '#5A2C2C' }}>
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#C98282' }} /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Field icon={User} label="Full Name" required type="text" placeholder="Rajesh Kumar"
              value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />

            <Field icon={Mail} label="Email Address" required type="email" placeholder="your@email.com"
              value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: '#294333' }}>
                Password<span style={{ color: '#C98282' }}> *</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 w-4 h-4 pointer-events-none" style={{ color: '#899B6A' }} />
                <input type={showPwd ? 'text' : 'password'} placeholder="Min 6 characters"
                  value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  style={{ ...inputStyle, paddingRight: '2.75rem' }}
                  onFocus={e => { e.currentTarget.style.borderColor = '#527A5A'; e.currentTarget.style.background = '#FFFFFF'; }}
                  onBlur={e => { e.currentTarget.style.borderColor = '#C9DEC1'; e.currentTarget.style.background = '#F4F8EF'; }} />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3.5 top-3.5 min-h-0" style={{ background: 'none', border: 'none', padding: 0, color: '#899B6A', height: 'auto' }}>
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Field icon={Phone} label="Mobile" type="tel" placeholder="9876543210"
              value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />

            <div className="grid grid-cols-2 gap-3">
              {/* State select */}
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: '#294333' }}>State</label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-3.5 w-4 h-4 pointer-events-none" style={{ color: '#899B6A' }} />
                  <select value={form.state} onChange={e => setForm(f => ({ ...f, state: e.target.value }))}
                    style={{ ...inputStyle, appearance: 'none' }}
                    onFocus={e => { e.currentTarget.style.borderColor = '#527A5A'; e.currentTarget.style.background = '#FFFFFF'; }}
                    onBlur={e => { e.currentTarget.style.borderColor = '#C9DEC1'; e.currentTarget.style.background = '#F4F8EF'; }}>
                    <option value="">Select</option>
                    {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <Field icon={MapPin} label="District" type="text" placeholder="e.g. Pune"
                value={form.district} onChange={e => setForm(f => ({ ...f, district: e.target.value }))} />
            </div>

            <Field icon={Leaf} label="Farm Size (acres)" type="number" placeholder="e.g. 2.5" min="0" step="0.1"
              value={form.farmSize} onChange={e => setForm(f => ({ ...f, farmSize: e.target.value }))} />

            <button type="submit" disabled={loading}
              className="w-full py-3.5 text-sm font-semibold text-white rounded-[14px] transition-all flex items-center justify-center gap-2 min-h-0 disabled:opacity-60"
              style={{ background: '#527A5A', boxShadow: '0 4px 16px rgba(82,122,90,0.28)' }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#3F6246'; }}
              onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#527A5A'; }}>
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Creating Account...' : 'Create Free Account →'}
            </button>
          </form>

          {/* Benefits */}
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            {['Free AI Scans', 'Voice Guidance', '8 Languages', 'Weather Alerts'].map(b => (
              <span key={b} className="flex items-center gap-1.5 text-xs" style={{ color: '#6B7D70' }}>
                <CheckCircle2 className="w-3.5 h-3.5" style={{ color: '#527A5A' }} /> {b}
              </span>
            ))}
          </div>

          <p className="text-center text-sm" style={{ color: '#6B7D70' }}>
            Already have an account?{' '}
            <Link to="/login" className="font-semibold" style={{ color: '#527A5A' }}>Sign In</Link>
          </p>
        </div>

        <p className="text-center text-xs" style={{ color: '#899B6A' }}>
          <Link to="/" style={{ color: '#899B6A' }}>← Back to Home</Link>
        </p>
      </div>
    </div>
  );
}
