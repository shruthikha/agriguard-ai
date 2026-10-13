import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Shield, Users, Activity, Database, ChevronRight,
  Trash2, Eye, CheckCircle2, AlertTriangle, RefreshCw,
  UserCheck, BarChart3, Sprout, BookOpen
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/useAuth';

function StatCard({ icon: Icon, value, label, accent }) {
  return (
    <div className="p-4 rounded-[18px]"
      style={{ background: '#FFFFFF', border: '1px solid #C9DEC1', boxShadow: '0 4px 16px rgba(70,95,75,0.06)' }}>
      <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-2.5" style={{ background: '#EAF4E4' }}>
        <Icon className="w-4 h-4" style={{ color: accent || '#527A5A' }} />
      </div>
      <div className="text-2xl font-bold" style={{ color: '#294333' }}>{value ?? '...'}</div>
      <div className="text-xs mt-0.5" style={{ color: '#6B7D70' }}>{label}</div>
    </div>
  );
}

export default function AdminPage() {
  const { user }     = useAuth();
  const navigate     = useNavigate();
  const { t }        = useTranslation();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats,    setStats]      = useState(null);
  const [scans,    setScans]      = useState([]);
  const [users,    setUsers]      = useState([]);
  const [diseases, setDiseases]   = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [seedLoading,   setSeedLoading]   = useState(false);
  const [seedMsg,       setSeedMsg]       = useState('');

  useEffect(() => { fetchOverview(); }, []);
  useEffect(() => {
    if (activeTab === 'scans')    fetchScans();
    if (activeTab === 'users')    fetchUsers();
    if (activeTab === 'diseases') fetchDiseases();
  }, [activeTab]);

  const fetchOverview = async () => {
    setLoading(true);
    try {
      const [scanStats, adminStats] = await Promise.all([
        api.get('/scans/stats/summary').catch(() => ({ data: {} })),
        api.get('/admin/stats').catch(() => ({ data: {} }))
      ]);
      setStats({ ...(scanStats.data.stats || {}), ...(adminStats.data || {}) });
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  const fetchScans    = async () => { try { const r = await api.get('/scans?limit=20'); if (r.data.success) setScans(r.data.scans); } catch {} };
  const fetchUsers    = async () => { try { const r = await api.get('/admin/users'); if (r.data.success) setUsers(r.data.users); } catch {} };
  const fetchDiseases = async () => { try { const r = await api.get('/diseases'); if (r.data.success) setDiseases(r.data.diseases); } catch {} };

  const handleSeedDB = async () => {
    setSeedLoading(true); setSeedMsg('');
    try {
      const res = await api.post('/admin/seed');
      setSeedMsg(res.data.message || 'Database seeded successfully!');
      fetchOverview();
    } catch (err) {
      setSeedMsg(err.response?.data?.message || 'Seeding failed. Check server logs.');
    } finally { setSeedLoading(false); }
  };

  const handleDeleteScan = async (id) => {
    if (!window.confirm('Delete this scan?')) return;
    try { await api.delete(`/scans/${id}`); fetchScans(); } catch { alert('Delete failed'); }
  };

  const handleToggleRole = async (userId, currentRole) => {
    try {
      await api.patch(`/admin/users/${userId}/role`, { role: currentRole === 'admin' ? 'farmer' : 'admin' });
      fetchUsers();
    } catch { alert('Role change failed'); }
  };

  const TABS = [
    { id: 'overview',  label: 'Overview',  icon: BarChart3  },
    { id: 'scans',     label: 'Scans',     icon: Activity   },
    { id: 'users',     label: 'Users',     icon: Users      },
    { id: 'diseases',  label: 'Diseases',  icon: Database   },
  ];

  const tableHeaderStyle = {
    padding: '0.75rem 1rem', fontSize: '0.6875rem', fontWeight: 600,
    textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6B7D70', background: '#F4F8EF',
    textAlign: 'left',
  };

  const tdStyle = { padding: '0.75rem 1rem', borderBottom: '1px solid #EAF4E4', verticalAlign: 'middle' };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-5"
      style={{ background: '#EAF4E4', minHeight: '100vh' }}>

      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #4E3D18, #D8B86A)' }}>
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#294333' }}>Admin Dashboard</h1>
            <p className="text-xs" style={{ color: '#6B7D70' }}>AgriGuard AI Control Panel</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs px-3 py-1.5 rounded-xl font-semibold"
            style={{ background: '#FDF8EC', border: '1px solid #F3DFA0', color: '#4E3D18' }}>
            👑 {user?.name}
          </span>
          <Link to="/" className="text-xs font-medium transition-all" style={{ color: '#899B6A' }}>← Home</Link>
        </div>
      </div>

      {/* Tab Nav */}
      <div className="flex gap-1 p-1 rounded-2xl w-fit" style={{ background: '#DDEBDD' }}>
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all min-h-0"
            style={activeTab === tab.id
              ? { background: '#FFFFFF', color: '#294333', boxShadow: '0 2px 8px rgba(70,95,75,0.12)' }
              : { background: 'transparent', color: '#6B7D70' }}>
            <tab.icon className="w-3.5 h-3.5" /> {tab.label}
          </button>
        ))}
      </div>

      {/* ── Overview ── */}
      {activeTab === 'overview' && (
        <div className="space-y-5">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[1,2,3,4].map(i => <div key={i} className="h-24 rounded-[18px] animate-pulse" style={{ background: '#DDEBDD' }} />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatCard icon={Activity}      value={stats?.totalScans}    label="Total Scans"       accent="#527A5A" />
              <StatCard icon={Users}         value={stats?.totalUsers}    label="Registered Users"  accent="#6B9AAF" />
              <StatCard icon={Database}      value={stats?.totalDiseases} label="Disease Records"   accent="#D8B86A" />
              <StatCard icon={AlertTriangle} value={stats?.diseasedScans} label="Diseased Scans"    accent="#C98282" />
            </div>
          )}

          {/* Seed */}
          <div className="rounded-[20px] p-5"
            style={{ background: '#FFFFFF', border: '1px solid #C9DEC1' }}>
            <h2 className="text-sm font-semibold mb-1 flex items-center gap-2" style={{ color: '#294333' }}>
              <Database className="w-4 h-4" style={{ color: '#527A5A' }} /> Database Management
            </h2>
            <p className="text-xs mb-4" style={{ color: '#6B7D70' }}>
              Seed MongoDB with 18 PlantVillage disease records, treatments, and regional names.
            </p>
            {seedMsg && (
              <div className="mb-4 flex items-start gap-2.5 p-3.5 rounded-xl text-sm"
                style={seedMsg.toLowerCase().includes('success') || seedMsg.toLowerCase().includes('seeded')
                  ? { background: '#EAF4E4', border: '1px solid #C9DEC1', color: '#2E4D35' }
                  : { background: '#FAEEED', border: '1px solid #E5B3B0', color: '#5A2C2C' }}>
                {seedMsg.toLowerCase().includes('success') || seedMsg.toLowerCase().includes('seeded')
                  ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: '#527A5A' }} />
                  : <AlertTriangle className="w-4 h-4 flex-shrink-0" style={{ color: '#C98282' }} />}
                {seedMsg}
              </div>
            )}
            <button onClick={handleSeedDB} disabled={seedLoading}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white rounded-[12px] transition-all min-h-0 disabled:opacity-60"
              style={{ background: '#527A5A' }}
              onMouseEnter={e => { if (!seedLoading) e.currentTarget.style.background = '#3F6246'; }}
              onMouseLeave={e => { if (!seedLoading) e.currentTarget.style.background = '#527A5A'; }}>
              {seedLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sprout className="w-4 h-4" />}
              {seedLoading ? 'Seeding...' : '🌱 Seed Disease Database'}
            </button>
          </div>
        </div>
      )}

      {/* ── Scans Table ── */}
      {activeTab === 'scans' && (
        <div className="rounded-[20px] overflow-hidden"
          style={{ background: '#FFFFFF', border: '1px solid #C9DEC1' }}>
          <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid #EAF4E4' }}>
            <h2 className="text-sm font-semibold" style={{ color: '#294333' }}>All Scans</h2>
            <button onClick={fetchScans} className="w-8 h-8 flex items-center justify-center rounded-xl min-h-0"
              style={{ background: '#EAF4E4' }}>
              <RefreshCw className="w-4 h-4" style={{ color: '#527A5A' }} />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table style={{ width: '100%', fontSize: '0.8125rem', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Crop / Disease','Status','Confidence','User','Date','Actions'].map(h => (
                    <th key={h} style={tableHeaderStyle}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {scans.map(scan => (
                  <tr key={scan._id}
                    onMouseEnter={e => e.currentTarget.style.background = '#F4F8EF'}
                    onMouseLeave={e => e.currentTarget.style.background = ''}>
                    <td style={tdStyle}>
                      <div className="font-semibold" style={{ color: '#294333' }}>{scan.crop}</div>
                      <div className="text-xs mt-0.5" style={{ color: '#899B6A' }}>{scan.disease}</div>
                    </td>
                    <td style={tdStyle}>
                      <span className="text-xs px-2 py-0.5 rounded-lg font-semibold"
                        style={scan.isHealthy
                          ? { background: '#DDEBDD', color: '#2E4D35' }
                          : { background: '#FAEEED', color: '#5A2C2C' }}>
                        {scan.isHealthy ? '✓ Healthy' : '⚠ Diseased'}
                      </span>
                    </td>
                    <td style={{ ...tdStyle, fontWeight: 600, color: '#527A5A' }}>{scan.confidence}%</td>
                    <td style={{ ...tdStyle, color: '#899B6A', fontSize: '0.75rem' }}>{scan.userId?.name || 'Guest'}</td>
                    <td style={{ ...tdStyle, color: '#899B6A', fontSize: '0.75rem' }}>
                      {new Date(scan.createdAt).toLocaleDateString('en-IN')}
                    </td>
                    <td style={tdStyle}>
                      <div className="flex items-center gap-1.5">
                        <Link to={`/result/${scan._id}`}
                          className="w-7 h-7 flex items-center justify-center rounded-lg min-h-0"
                          style={{ background: '#EAF4E4' }}>
                          <Eye className="w-3.5 h-3.5" style={{ color: '#527A5A' }} />
                        </Link>
                        <button onClick={() => handleDeleteScan(scan._id)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg min-h-0"
                          style={{ background: '#FAEEED' }}>
                          <Trash2 className="w-3.5 h-3.5" style={{ color: '#C98282' }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {scans.length === 0 && (
                  <tr><td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: '#899B6A', fontSize: '0.875rem' }}>No scans found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Users Table ── */}
      {activeTab === 'users' && (
        <div className="rounded-[20px] overflow-hidden"
          style={{ background: '#FFFFFF', border: '1px solid #C9DEC1' }}>
          <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid #EAF4E4' }}>
            <h2 className="text-sm font-semibold" style={{ color: '#294333' }}>Registered Users</h2>
            <button onClick={fetchUsers} className="w-8 h-8 flex items-center justify-center rounded-xl min-h-0"
              style={{ background: '#EAF4E4' }}>
              <RefreshCw className="w-4 h-4" style={{ color: '#527A5A' }} />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table style={{ width: '100%', fontSize: '0.8125rem', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Name / Email','Role','Location','Registered','Actions'].map(h => (
                    <th key={h} style={tableHeaderStyle}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id}
                    onMouseEnter={e => e.currentTarget.style.background = '#F4F8EF'}
                    onMouseLeave={e => e.currentTarget.style.background = ''}>
                    <td style={tdStyle}>
                      <div className="font-semibold" style={{ color: '#294333' }}>{u.name}</div>
                      <div className="text-xs mt-0.5" style={{ color: '#899B6A' }}>{u.email}</div>
                    </td>
                    <td style={tdStyle}>
                      <span className="text-xs px-2 py-0.5 rounded-lg font-semibold"
                        style={u.role === 'admin'
                          ? { background: '#FDF8EC', color: '#4E3D18', border: '1px solid #F3DFA0' }
                          : { background: '#EAF4E4', color: '#2E4D35' }}>
                        {u.role === 'admin' ? '👑 Admin' : '🌱 Farmer'}
                      </span>
                    </td>
                    <td style={{ ...tdStyle, color: '#899B6A', fontSize: '0.75rem' }}>
                      {[u.location?.district, u.location?.state].filter(Boolean).join(', ') || '—'}
                    </td>
                    <td style={{ ...tdStyle, color: '#899B6A', fontSize: '0.75rem' }}>
                      {new Date(u.createdAt).toLocaleDateString('en-IN')}
                    </td>
                    <td style={tdStyle}>
                      {u._id !== user?._id && (
                        <button onClick={() => handleToggleRole(u._id, u.role)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all min-h-0"
                          style={{ background: '#EAF4E4', color: '#294333', border: '1px solid #C9DEC1' }}>
                          <UserCheck className="w-3.5 h-3.5" /> Toggle
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr><td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: '#899B6A' }}>No users found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Diseases ── */}
      {activeTab === 'diseases' && (
        <div className="rounded-[20px] overflow-hidden"
          style={{ background: '#FFFFFF', border: '1px solid #C9DEC1' }}>
          <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid #EAF4E4' }}>
            <h2 className="text-sm font-semibold" style={{ color: '#294333' }}>
              Disease Database <span style={{ color: '#899B6A' }}>({diseases.length} records)</span>
            </h2>
            <button onClick={fetchDiseases} className="w-8 h-8 flex items-center justify-center rounded-xl min-h-0"
              style={{ background: '#EAF4E4' }}>
              <RefreshCw className="w-4 h-4" style={{ color: '#527A5A' }} />
            </button>
          </div>

          {diseases.length === 0 ? (
            <div className="py-14 text-center px-4">
              <Database className="w-12 h-12 mx-auto mb-3" style={{ color: '#C9DEC1' }} />
              <p className="font-semibold mb-2" style={{ color: '#294333' }}>Disease database is empty</p>
              <p className="text-sm mb-5" style={{ color: '#6B7D70' }}>
                Click "Seed Disease Database" in Overview to populate it.
              </p>
              <button onClick={() => setActiveTab('overview')}
                className="px-5 py-2.5 text-sm font-semibold text-white rounded-[12px] min-h-0"
                style={{ background: '#527A5A' }}>
                Go to Overview →
              </button>
            </div>
          ) : (
            <div>
              {diseases.map(d => (
                <div key={d._id} className="flex items-center gap-4 px-5 py-3.5"
                  style={{ borderBottom: '1px solid #EAF4E4' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#F4F8EF'}
                  onMouseLeave={e => e.currentTarget.style.background = ''}>
                  <span className="text-2xl flex-shrink-0">
                    {d.crop === 'Tomato' ? '🍅' : d.crop === 'Potato' ? '🥔' : d.crop === 'Apple' ? '🍎' : '🌶️'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold" style={{ color: '#294333' }}>{d.crop}</span>
                      <ChevronRight className="w-3.5 h-3.5" style={{ color: '#C9DEC1' }} />
                      <span className="text-sm" style={{ color: '#4A5E52' }}>{d.diseaseName}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs px-1.5 py-0.5 rounded font-semibold"
                        style={d.severity === 'High'
                          ? { background: '#FAEEED', color: '#5A2C2C' }
                          : d.severity === 'Medium'
                          ? { background: '#FDF8EC', color: '#4E3D18' }
                          : { background: '#EAF4E4', color: '#2E4D35' }}>
                        {d.severity}
                      </span>
                      <span className="text-xs" style={{ color: '#C9DEC1' }}>{d.classId}</span>
                    </div>
                  </div>
                  <div className="text-xs flex-shrink-0" style={{ color: '#899B6A' }}>
                    {d.symptoms?.length || 0} symptoms
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
