import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  History, Filter, Leaf, AlertTriangle, CheckCircle2,
  Trash2, Eye, ChevronLeft, ChevronRight, Camera
} from 'lucide-react';
import api from '../services/api';

const CROPS  = ['All', 'Tomato', 'Potato', 'Pepper', 'Apple'];
const STATUS = ['All', 'Healthy', 'Action Needed'];

export default function HistoryPage() {
  const { t } = useTranslation();
  const [scans, setScans]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [total, setTotal]           = useState(0);
  const [page, setPage]             = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters]       = useState({ crop: 'All', status: 'All', sort: 'desc' });
  const [deleteId, setDeleteId]     = useState(null);
  const [deleting, setDeleting]     = useState(false);

  const limit = 12;

  const fetchScans = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit, sort: filters.sort });
      if (filters.crop   !== 'All') params.append('crop',   filters.crop);
      if (filters.status !== 'All') params.append('status', filters.status);
      const res = await api.get(`/scans?${params}`);
      if (res.data.success) {
        setScans(res.data.scans);
        setTotal(res.data.total);
        setTotalPages(res.data.totalPages);
      }
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchScans(); }, [page, filters]);

  const handleDelete = async (id) => {
    setDeleting(true);
    try {
      await api.delete(`/scans/${id}`);
      setDeleteId(null);
      fetchScans();
    } catch { alert('Failed to delete. You may not have permission.'); }
    finally { setDeleting(false); }
  };

  const selectStyle = {
    background: '#FFFFFF', border: '1px solid #C9DEC1',
    color: '#294333', outline: 'none', cursor: 'pointer',
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-5"
      style={{ background: '#EAF4E4', minHeight: '100vh' }}>

      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #2E4D35, #527A5A)' }}>
            <History className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#294333' }}>
              {t('history.title', 'Scan History')}
            </h1>
            <p className="text-xs" style={{ color: '#6B7D70' }}>
              {total} scan{total !== 1 ? 's' : ''} recorded
            </p>
          </div>
        </div>
        <Link to="/detect"
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white rounded-[14px] transition-all flex-shrink-0"
          style={{ background: '#527A5A' }}
          onMouseEnter={e => e.currentTarget.style.background = '#3F6246'}
          onMouseLeave={e => e.currentTarget.style.background = '#527A5A'}>
          <Camera className="w-4 h-4" /> New Scan
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        {[
          { key: 'crop',   opts: CROPS,   label: v => v === 'All' ? 'All Crops' : v },
          { key: 'status', opts: STATUS,  label: v => v === 'All' ? 'All Status' : v },
          { key: 'sort',   opts: ['desc','asc'], label: v => v === 'desc' ? 'Newest First' : 'Oldest First' },
        ].map(({ key, opts, label }) => (
          <div key={key} className="flex items-center gap-2 px-3 py-2 rounded-xl"
            style={{ background: '#FFFFFF', border: '1px solid #C9DEC1' }}>
            {key === 'crop' && <Filter className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#899B6A' }} />}
            <select value={filters[key]}
              onChange={e => { setFilters(f => ({ ...f, [key]: e.target.value })); setPage(1); }}
              className="text-sm font-medium bg-transparent outline-none cursor-pointer min-h-0"
              style={{ color: '#294333' }}>
              {opts.map(o => <option key={o} value={o}>{label(o)}</option>)}
            </select>
          </div>
        ))}
        <span className="text-xs" style={{ color: '#899B6A' }}>{scans.length} shown</span>
      </div>

      {/* Skeleton */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-56 rounded-[20px] animate-pulse" style={{ background: '#DDEBDD' }} />
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && scans.length === 0 && (
        <div className="py-16 text-center rounded-[22px]" style={{ background: '#FFFFFF', border: '1px solid #C9DEC1' }}>
          <div className="text-5xl mb-4">📋</div>
          <h2 className="text-xl font-bold mb-2" style={{ color: '#294333' }}>No Scans Found</h2>
          <p className="text-sm mb-6 max-w-xs mx-auto" style={{ color: '#6B7D70' }}>
            {filters.crop !== 'All' || filters.status !== 'All'
              ? 'No scans match your filters. Try clearing them.'
              : "You haven't scanned any crops yet."}
          </p>
          <Link to="/detect"
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white rounded-[14px]"
            style={{ background: '#527A5A' }}>
            <Camera className="w-4 h-4" /> Scan a Crop Leaf
          </Link>
        </div>
      )}

      {/* Cards */}
      {!loading && scans.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {scans.map(scan => (
              <div key={scan._id} className="rounded-[20px] overflow-hidden transition-all hover:-translate-y-0.5 group"
                style={{ background: '#FFFFFF', border: '1px solid #C9DEC1', boxShadow: '0 4px 16px rgba(70,95,75,0.06)' }}>

                {/* Image */}
                <div className="h-40 overflow-hidden" style={{ background: '#EAF4E4' }}>
                  {scan.imageUrl ? (
                    <img src={scan.imageUrl} alt={scan.crop}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={e => { e.target.parentElement.style.display = 'none'; }} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">🌿</div>
                  )}
                </div>

                {/* Info */}
                <div className="p-4 space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold" style={{ color: '#294333' }}>{scan.crop}</span>
                        <span className="text-xs px-2 py-0.5 rounded-lg"
                          style={scan.isHealthy
                            ? { background: '#DDEBDD', color: '#2E4D35' }
                            : { background: '#FAEEED', color: '#5A2C2C' }}>
                          {scan.isHealthy ? '✓ Healthy' : '⚠ Diseased'}
                        </span>
                      </div>
                      <p className="text-xs mt-0.5 truncate" style={{ color: '#899B6A' }}>
                        {scan.isHealthy ? 'No disease detected' : scan.disease}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-lg font-bold" style={{ color: '#527A5A' }}>{scan.confidence}%</div>
                      <div className="text-xs" style={{ color: '#C9DEC1' }}>conf.</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2" style={{ borderTop: '1px solid #EAF4E4' }}>
                    <span className="text-xs" style={{ color: '#899B6A' }}>
                      {new Date(scan.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <Link to={`/result/${scan._id}`}
                        className="w-8 h-8 flex items-center justify-center rounded-xl transition-all min-h-0"
                        style={{ background: '#EAF4E4' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#C9DEC1'}
                        onMouseLeave={e => e.currentTarget.style.background = '#EAF4E4'}
                        title="View Report">
                        <Eye className="w-4 h-4" style={{ color: '#527A5A' }} />
                      </Link>
                      <button onClick={() => setDeleteId(scan._id)}
                        className="w-8 h-8 flex items-center justify-center rounded-xl transition-all min-h-0"
                        style={{ background: '#FAEEED' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#F3D9D8'}
                        onMouseLeave={e => e.currentTarget.style.background = '#FAEEED'}
                        title="Delete">
                        <Trash2 className="w-4 h-4" style={{ color: '#C98282' }} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="w-9 h-9 flex items-center justify-center rounded-xl transition-all min-h-0 disabled:opacity-40"
                style={{ background: '#FFFFFF', border: '1px solid #C9DEC1' }}>
                <ChevronLeft className="w-4 h-4" style={{ color: '#527A5A' }} />
              </button>
              <span className="text-sm font-medium" style={{ color: '#294333' }}>
                Page {page} of {totalPages}
              </span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="w-9 h-9 flex items-center justify-center rounded-xl transition-all min-h-0 disabled:opacity-40"
                style={{ background: '#FFFFFF', border: '1px solid #C9DEC1' }}>
                <ChevronRight className="w-4 h-4" style={{ color: '#527A5A' }} />
              </button>
            </div>
          )}
        </>
      )}

      {/* Delete Confirm Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: 'rgba(41,67,51,0.5)' }}>
          <div className="w-full max-w-sm rounded-[22px] p-6 animate-slideUp"
            style={{ background: '#FFFFFF', border: '1px solid #C9DEC1', boxShadow: '0 20px 60px rgba(41,67,51,0.2)' }}>
            <h3 className="text-lg font-bold mb-1.5" style={{ color: '#294333' }}>Delete Scan?</h3>
            <p className="text-sm mb-5" style={{ color: '#6B7D70' }}>This action is permanent and cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all min-h-0"
                style={{ background: '#F4F8EF', border: '1px solid #C9DEC1', color: '#4A5E52' }}>
                Cancel
              </button>
              <button onClick={() => handleDelete(deleteId)} disabled={deleting}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all min-h-0 disabled:opacity-60"
                style={{ background: '#C98282' }}>
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
