import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/useAuth';
import { SUPPORTED_LANGUAGES } from '../i18n';
import {
  Sprout, Shield, CloudSun, Lightbulb, History,
  LayoutDashboard, Settings, LogOut, LogIn,
  Globe, Mic, Sparkles, Menu, X, Leaf, ChevronDown
} from 'lucide-react';

export default function Navbar({ onOpenLanguageModal, onOpenVoiceModal, onOpenDemoModal }) {
  const { t, i18n } = useTranslation();
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMobileMenuOpen(false); setLangDropdownOpen(false); }, [location.pathname]);

  const currentLang = SUPPORTED_LANGUAGES.find(l => l.code === i18n.language) || SUPPORTED_LANGUAGES[0];

  const navLinks = [
    { to: '/', label: t('nav.home', 'Home'), icon: Sprout },
    { to: '/detect', label: t('nav.checkCrop', 'Check Crop'), icon: Shield, highlight: true },
    { to: '/weather', label: t('nav.weather', 'Weather'), icon: CloudSun },
    { to: '/advisories', label: t('nav.advisories', 'Advisories'), icon: Lightbulb },
    { to: '/history', label: t('nav.history', 'History'), icon: History },
    { to: '/dashboard', label: t('nav.dashboard', 'Dashboard'), icon: LayoutDashboard },
  ];
  if (isAdmin) navLinks.push({ to: '/admin', label: 'Admin', icon: Settings });

  const handleLangSelect = (code) => {
    i18n.changeLanguage(code);
    localStorage.setItem('i18nextLng', code);
    setLangDropdownOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 ${
        scrolled
          ? 'bg-white/92 backdrop-blur-lg shadow-soft border-b border-sage-200'
          : 'bg-white/80 backdrop-blur-md border-b border-sage-100'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-[68px]">

          {/* ── Logo ── */}
          <Link to="/" className="flex items-center gap-2.5 group flex-shrink-0">
            <div className="w-9 h-9 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #2E4D35 0%, #527A5A 100%)' }}>
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight" style={{ color: '#294333' }}>
                Agri<span style={{ color: '#527A5A' }}>Guard</span>{' '}
                <span className="text-xs font-semibold px-1.5 py-0.5 rounded-md"
                  style={{ background: '#DDEBDD', color: '#2E4D35' }}>AI</span>
              </span>
              <p className="text-[10px] font-medium hidden sm:block -mt-0.5" style={{ color: '#6B7D70' }}>
                Smart Crop Advisory
              </p>
            </div>
          </Link>

          {/* ── Desktop Nav ── */}
          <nav className="hidden md:flex items-center gap-0.5">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                    active
                      ? 'bg-sage-50 text-forest-600 font-semibold border border-sage-200'
                      : item.highlight
                      ? 'text-white font-semibold shadow-sm'
                      : 'text-body hover:bg-sage-50 hover:text-forest-600'
                  }`}
                  style={item.highlight && !active ? { background: '#527A5A' } : {}}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* ── Right Actions ── */}
          <div className="flex items-center gap-1.5 sm:gap-2">

            {/* Demo Button */}
            <button
              onClick={onOpenDemoModal}
              title="Try demo leaf images"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl transition-all"
              style={{ background: '#FDF8EC', color: '#4E3D18', border: '1px solid #F3DFA0' }}
            >
              <Sparkles className="w-3.5 h-3.5" style={{ color: '#D8B86A' }} />
              <span>Demo</span>
            </button>

            {/* Voice */}
            <button
              onClick={onOpenVoiceModal}
              title="Voice assistant"
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
              style={{ background: '#EAF4E4', border: '1px solid #C9DEC1' }}
              onMouseEnter={e => e.currentTarget.style.background = '#DDEBDD'}
              onMouseLeave={e => e.currentTarget.style.background = '#EAF4E4'}
            >
              <Mic className="w-4 h-4" style={{ color: '#527A5A' }} />
            </button>

            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all"
                style={{ background: '#F4F8EF', border: '1px solid #C9DEC1', color: '#294333' }}
              >
                <span className="text-base leading-none">{currentLang.flag}</span>
                <span className="hidden sm:inline">{currentLang.native}</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${langDropdownOpen ? 'rotate-180' : ''}`}
                  style={{ color: '#6B7D70' }} />
              </button>

              {langDropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl border overflow-hidden shadow-card z-50 animate-fadeIn"
                  style={{ borderColor: '#C9DEC1' }}>
                  <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider"
                    style={{ background: '#F4F8EF', color: '#6B7D70', borderBottom: '1px solid #C9DEC1' }}>
                    Choose Language
                  </div>
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleLangSelect(lang.code)}
                      className="w-full px-3 py-2.5 text-left flex items-center justify-between text-sm transition-all"
                      style={i18n.language === lang.code
                        ? { background: '#EAF4E4', color: '#294333', fontWeight: 600 }
                        : { color: '#4A5E52' }}
                      onMouseEnter={e => { if (i18n.language !== lang.code) e.currentTarget.style.background = '#F4F8EF'; }}
                      onMouseLeave={e => { if (i18n.language !== lang.code) e.currentTarget.style.background = ''; }}
                    >
                      <span className="flex items-center gap-2">
                        <span>{lang.flag}</span>
                        <span>{lang.native}</span>
                      </span>
                      <span className="text-xs" style={{ color: '#899B6A' }}>{lang.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Auth */}
            {user ? (
              <div className="flex items-center gap-1.5">
                <Link
                  to="/dashboard"
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl transition-all"
                  style={{ background: '#EAF4E4', border: '1px solid #C9DEC1' }}
                >
                  <div className="w-7 h-7 rounded-lg text-white flex items-center justify-center font-bold text-xs uppercase flex-shrink-0"
                    style={{ background: '#527A5A' }}>
                    {user.name?.charAt(0)}
                  </div>
                  <div className="hidden lg:block text-left">
                    <div className="text-xs font-semibold truncate max-w-[90px]" style={{ color: '#294333' }}>{user.name}</div>
                    <div className="text-[10px] capitalize" style={{ color: '#6B7D70' }}>{user.role}</div>
                  </div>
                </Link>
                <button
                  onClick={logout}
                  title="Logout"
                  className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
                  style={{ background: '#F4F8EF', border: '1px solid #C9DEC1' }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#FAEEED'; e.currentTarget.style.borderColor = '#E5B3B0'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#F4F8EF'; e.currentTarget.style.borderColor = '#C9DEC1'; }}
                >
                  <LogOut className="w-4 h-4" style={{ color: '#899B6A' }} />
                </button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link to="/login" className="px-3 py-1.5 text-sm font-medium transition-all rounded-xl"
                  style={{ color: '#4A5E52' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#294333'}
                  onMouseLeave={e => e.currentTarget.style.color = '#4A5E52'}>
                  {t('nav.login', 'Login')}
                </Link>
                <Link to="/register" className="px-4 py-1.5 text-sm font-semibold text-white rounded-xl transition-all"
                  style={{ background: '#527A5A' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#3F6246'}
                  onMouseLeave={e => e.currentTarget.style.background = '#527A5A'}>
                  {t('nav.register', 'Get Started')}
                </Link>
              </div>
            )}

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden w-10 h-10 rounded-xl flex items-center justify-center transition-all"
              style={{ background: '#EAF4E4', border: '1px solid #C9DEC1' }}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" style={{ color: '#294333' }} /> : <Menu className="w-5 h-5" style={{ color: '#294333' }} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 pt-2 pb-5 space-y-1 animate-slideUp"
          style={{ background: '#FFFFFF', borderTop: '1px solid #C9DEC1' }}>
          {navLinks.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all"
                style={active
                  ? { background: '#EAF4E4', color: '#294333', fontWeight: 600, border: '1px solid #C9DEC1' }
                  : { color: '#4A5E52' }}
              >
                <Icon className="w-5 h-5" style={{ color: active ? '#527A5A' : '#899B6A' }} />
                <span>{item.label}</span>
              </Link>
            );
          })}

          <div className="pt-2 flex gap-2" style={{ borderTop: '1px solid #C9DEC1' }}>
            <button
              onClick={() => { setMobileMenuOpen(false); onOpenDemoModal(); }}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5"
              style={{ background: '#FDF8EC', color: '#4E3D18', border: '1px solid #F3DFA0' }}>
              <Sparkles className="w-4 h-4" style={{ color: '#D8B86A' }} />
              Demo Mode
            </button>
            {!user && (
              <Link to="/login" onClick={() => setMobileMenuOpen(false)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-center"
                style={{ background: '#527A5A', color: '#FFFFFF' }}>
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
