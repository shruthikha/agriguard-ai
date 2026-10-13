import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Camera, Leaf, CloudSun, BookOpen, Activity,
  CheckCircle2, AlertTriangle, Clock, ArrowRight,
  Mic, TrendingUp, BarChart2
} from 'lucide-react';
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis,
  Tooltip, ResponsiveContainer
} from 'recharts';
import api from '../services/api';
import { useAuth } from '../context/useAuth';

const PIE_COLORS = ['#527A5A','#90BA8A','#C9DEC1','#D8B86A','#C98282','#899B6A'];

function SkeletonCard() {
  return (
    <div className="rounded-[20px] h-28 animate-pulse" style={{ background: '#DDEBDD' }} />
  );
}

export default function DashboardPage({ onOpenVoiceModal }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/scans/stats/summary')
      .then((res) => { if (res.data.success) setStats(res.data.stats); })
      .catch(() => setStats({ totalScans:0, healthyScans:0, diseasedScans:0, healthRatio:0, diseaseBreakdown:[], cropBreakdown:[], recentScans:[] }))
      .finally(() => setLoading(false));
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const quickLinks = [
    { to: '/detect',     label: 'Check Your Crop',   icon: Camera,   desc: 'Upload a leaf photo', emoji: '🌿' },
    { to: '/weather',    label: 'Weather',            icon: CloudSun, desc: 'Today\'s conditions',  emoji: '☁️' },
    { to: '/advisories', label: 'Farm Advisories',   icon: BookOpen, desc: 'Farming guidance',     emoji: '💡' },
    { to: '/history',    label: 'Scan History',      icon: Activity, desc: 'Previous scans',       emoji: '📋' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6" style={{ background: '#EAF4E4', minHeight: '100vh' }}>

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: '#294333' }}>
            {greeting} 👋{user?.name ? `, ${user.name.split(' ')[0]}` : ''}
          </h1>
          <p className="text-sm mt-0.5" style={{ color: '#6B7D70' }}>
            Let's check how your crops are doing today ·{' '}
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <button onClick={onOpenVoiceModal}
          className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold flex-shrink-0 transition-all"
          style={{ background: '#FFFFFF', border: '1px solid #C9DEC1', color: '#527A5A' }}
          onMouseEnter={e => e.currentTarget.style.background = '#EAF4E4'}
          onMouseLeave={e => e.currentTarget.style.background = '#FFFFFF'}>
          <Mic className="w-4 h-4" /> Voice
        </button>
      </div>

      {/* ── Primary CTA ── */}
      <Link to="/detect"
        className="flex items-center justify-between p-6 rounded-[22px] transition-all hover:-translate-y-0.5 group"
        style={{ background: 'linear-gradient(135deg, #2E4D35 0%, #527A5A 100%)', boxShadow: '0 8px 32px rgba(41,67,51,0.22)' }}>
        <div className="space-y-1.5">
          <div className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#C9DEC1' }}>
            AI Crop Disease Detection
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">Check Your Crop</h2>
          <p className="text-sm" style={{ color: '#B5D1B0' }}>
            Upload a photo of a leaf and get instant AI analysis
          </p>
        </div>
        <div className="flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110"
          style={{ background: 'rgba(255,255,255,0.12)' }}>
          <Camera className="w-7 h-7 text-white" />
        </div>
      </Link>

      {/* ── Quick Links ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {quickLinks.map(link => (
          <Link key={link.to} to={link.to}
            className="p-4 rounded-[18px] flex flex-col gap-2.5 transition-all hover:-translate-y-1 group"
            style={{ background: '#FFFFFF', border: '1px solid #C9DEC1', boxShadow: '0 4px 16px rgba(70,95,75,0.06)' }}>
            <span className="text-2xl">{link.emoji}</span>
            <div>
              <p className="text-sm font-semibold" style={{ color: '#294333' }}>{link.label}</p>
              <p className="text-xs mt-0.5" style={{ color: '#899B6A' }}>{link.desc}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* ── Stats ── */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[1,2,3,4].map(i => <SkeletonCard key={i} />)}
        </div>
      ) : stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: Activity,      value: stats.totalScans,   label: 'Total Scans',    accent: '#527A5A' },
            { icon: CheckCircle2,  value: stats.healthyScans, label: 'Healthy',        accent: '#527A5A' },
            { icon: AlertTriangle, value: stats.diseasedScans,label: 'Diseased',       accent: '#C98282' },
            { icon: BarChart2,     value: `${stats.healthRatio ?? 0}%`, label: 'Health Rate', accent: '#899B6A' },
          ].map(({ icon: Icon, value, label, accent }) => (
            <div key={label} className="p-4 rounded-[18px]"
              style={{ background: '#FFFFFF', border: '1px solid #C9DEC1', boxShadow: '0 4px 16px rgba(70,95,75,0.06)' }}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-2"
                style={{ background: '#EAF4E4' }}>
                <Icon className="w-4 h-4" style={{ color: accent }} />
              </div>
              <div className="text-2xl font-bold" style={{ color: '#294333' }}>{value ?? 0}</div>
              <div className="text-xs mt-0.5" style={{ color: '#6B7D70' }}>{label}</div>
            </div>
          ))}
        </div>
      )}

      {/* ── Charts ── */}
      {stats && (stats.diseaseBreakdown?.length > 0 || stats.cropBreakdown?.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {stats.diseaseBreakdown?.length > 0 && (
            <div className="p-5 rounded-[20px]" style={{ background: '#FFFFFF', border: '1px solid #C9DEC1' }}>
              <h3 className="text-sm font-semibold mb-4" style={{ color: '#294333' }}>Top Detected Diseases</h3>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={stats.diseaseBreakdown} layout="vertical">
                  <XAxis type="number" fontSize={11} tick={{ fill: '#899B6A' }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" width={110} fontSize={10} tick={{ fill: '#527A5A' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #C9DEC1', fontSize: 12 }} formatter={v => [`${v} scans`, 'Count']} />
                  <Bar dataKey="count" fill="#527A5A" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
          {stats.cropBreakdown?.length > 0 && (
            <div className="p-5 rounded-[20px]" style={{ background: '#FFFFFF', border: '1px solid #C9DEC1' }}>
              <h3 className="text-sm font-semibold mb-4" style={{ color: '#294333' }}>Crop Distribution</h3>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={stats.cropBreakdown} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={72}
                    label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`} labelLine={false} fontSize={10}>
                    {stats.cropBreakdown.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #C9DEC1', fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* ── Recent Scans ── */}
      {stats?.recentScans?.length > 0 && (
        <div className="rounded-[20px] overflow-hidden" style={{ background: '#FFFFFF', border: '1px solid #C9DEC1' }}>
          <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid #EAF4E4' }}>
            <h3 className="text-sm font-semibold flex items-center gap-2" style={{ color: '#294333' }}>
              <Clock className="w-4 h-4" style={{ color: '#527A5A' }} /> Recent Scans
            </h3>
            <Link to="/history" className="text-xs font-semibold flex items-center gap-1 transition-all"
              style={{ color: '#527A5A' }}>View All <ArrowRight className="w-3.5 h-3.5" /></Link>
          </div>
          <div>
            {stats.recentScans.map((scan, i) => (
              <Link key={scan._id} to={`/result/${scan._id}`}
                className="flex items-center gap-4 px-5 py-3.5 transition-all"
                style={{ borderTop: i > 0 ? '1px solid #EAF4E4' : 'none' }}
                onMouseEnter={e => e.currentTarget.style.background = '#F4F8EF'}
                onMouseLeave={e => e.currentTarget.style.background = ''}>
                {scan.imageUrl ? (
                  <img src={scan.imageUrl} alt={scan.crop}
                    className="w-11 h-11 rounded-xl object-cover flex-shrink-0"
                    style={{ border: '1px solid #C9DEC1' }}
                    onError={e => e.target.style.display = 'none'} />
                ) : (
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: '#EAF4E4' }}>
                    <Leaf className="w-5 h-5" style={{ color: '#527A5A' }} />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold" style={{ color: '#294333' }}>{scan.crop}</span>
                    <span className="text-xs px-2 py-0.5 rounded-lg"
                      style={scan.isHealthy
                        ? { background: '#DDEBDD', color: '#2E4D35' }
                        : { background: '#FAEEED', color: '#5A2C2C' }}>
                      {scan.isHealthy ? '✓ Healthy' : scan.disease}
                    </span>
                  </div>
                  <p className="text-xs mt-0.5" style={{ color: '#899B6A' }}>
                    {new Date(scan.createdAt).toLocaleDateString('en-IN')} · {scan.confidence}% confidence
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 flex-shrink-0" style={{ color: '#C9DEC1' }} />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ── Empty state ── */}
      {!loading && stats?.totalScans === 0 && (
        <div className="text-center py-16 px-4 rounded-[22px]" style={{ background: '#FFFFFF', border: '1px solid #C9DEC1' }}>
          <div className="text-5xl mb-4">🌱</div>
          <h2 className="text-xl font-bold mb-2" style={{ color: '#294333' }}>No Scans Yet</h2>
          <p className="text-sm mb-6 max-w-xs mx-auto" style={{ color: '#6B7D70' }}>
            Start by scanning your first crop leaf to get AI disease analysis and personalised advice.
          </p>
          <Link to="/detect"
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white rounded-[14px] transition-all"
            style={{ background: '#527A5A' }}
            onMouseEnter={e => e.currentTarget.style.background = '#3F6246'}
            onMouseLeave={e => e.currentTarget.style.background = '#527A5A'}>
            <Camera className="w-4 h-4" /> Start First Scan
          </Link>
        </div>
      )}
    </div>
  );
}
