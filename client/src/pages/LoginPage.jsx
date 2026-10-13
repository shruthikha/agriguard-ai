import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff, Leaf, Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/useAuth';

const inputStyle = {
  background: '#F4F8EF', border: '1.5px solid #C9DEC1', borderRadius: 12,
  padding: '0.7rem 0.875rem', fontSize: '0.9rem', color: '#294333',
  outline: 'none', width: '100%', minHeight: 'unset',
};

export default function LoginPage() {
  const { t }          = useTranslation();
  const { login }      = useAuth();
  const navigate       = useNavigate();
  const [form, setForm]       = useState({ email: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { setError('Please enter your email and password.'); return; }
    setLoading(true); setError('');
    try {
      const user = await login(form.email, form.password);
      navigate(user?.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ background: '#EAF4E4' }}>

      <div className="w-full max-w-sm space-y-6 animate-slideUp">

        {/* Logo */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto"
            style={{ background: 'linear-gradient(135deg, #2E4D35, #527A5A)' }}>
            <Leaf className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold" style={{ color: '#294333' }}>
            Welcome back
          </h1>
          <p className="text-sm" style={{ color: '#6B7D70' }}>
            Sign in to your AgriGuard AI account
          </p>
        </div>

        {/* Card */}
        <div className="rounded-[22px] p-6 space-y-4"
          style={{ background: '#FFFFFF', border: '1px solid #C9DEC1', boxShadow: '0 8px 32px rgba(70,95,75,0.10)' }}>

          {error && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl text-sm"
              style={{ background: '#FAEEED', border: '1px solid #E5B3B0', color: '#5A2C2C' }}>
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#C98282' }} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: '#294333' }}>
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 w-4 h-4 pointer-events-none" style={{ color: '#899B6A' }} />
                <input type="email" placeholder="farmer@example.com" value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  style={{ ...inputStyle, paddingLeft: '2.25rem' }}
                  onFocus={e => { e.currentTarget.style.borderColor = '#527A5A'; e.currentTarget.style.background = '#FFFFFF'; }}
                  onBlur={e => { e.currentTarget.style.borderColor = '#C9DEC1'; e.currentTarget.style.background = '#F4F8EF'; }} />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold" style={{ color: '#294333' }}>Password</label>
                <Link to="/forgot-password" className="text-xs" style={{ color: '#527A5A' }}>Forgot password?</Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 w-4 h-4 pointer-events-none" style={{ color: '#899B6A' }} />
                <input type={showPwd ? 'text' : 'password'} placeholder="••••••••" value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  style={{ ...inputStyle, paddingLeft: '2.25rem', paddingRight: '2.75rem' }}
                  onFocus={e => { e.currentTarget.style.borderColor = '#527A5A'; e.currentTarget.style.background = '#FFFFFF'; }}
                  onBlur={e => { e.currentTarget.style.borderColor = '#C9DEC1'; e.currentTarget.style.background = '#F4F8EF'; }} />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3.5 top-3.5 min-h-0"
                  style={{ color: '#899B6A', background: 'none', border: 'none', padding: 0, height: 'auto' }}>
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3.5 text-sm font-semibold text-white rounded-[14px] transition-all flex items-center justify-center gap-2 min-h-0 disabled:opacity-60"
              style={{ background: '#527A5A', boxShadow: '0 4px 16px rgba(82,122,90,0.28)' }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#3F6246'; }}
              onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#527A5A'; }}>
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm" style={{ color: '#6B7D70' }}>
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold transition-all" style={{ color: '#527A5A' }}>
              Create one
            </Link>
          </p>
        </div>

        {/* Demo hint */}
        <div className="text-center text-xs rounded-2xl py-3 px-4"
          style={{ background: '#FDF8EC', border: '1px solid #F3DFA0', color: '#4E3D18' }}>
          <strong>Demo:</strong> farmer@demo.com / Demo@1234
        </div>
      </div>
    </div>
  );
}
