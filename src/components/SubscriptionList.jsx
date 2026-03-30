import React, { useState, useMemo } from 'react';
import { useSubscriptions } from '../context/SubscriptionContext';
import { formatCurrency, determineServiceLogo, getNextPaymentDate, convertCurrency } from '../utils/storage';
import { Search, Filter, ArrowUpDown, Trash2, Edit2, Play, Pause } from 'lucide-react';
import ConfirmModal from './ConfirmModal';
import EmptyState from './EmptyState';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import { CATEGORY_LABELS, BILLING_CYCLES } from '../constants';

const SubscriptionList = ({ onEdit }) => {
  const { subscriptions, deleteSubscription, toggleStatus, settings, exchangeRates } = useSubscriptions();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name'); // name, cost, nextPayment
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, name: '' });

  const categories = ['all', ...Array.from(new Set(subscriptions.map(s => s.category)))];

  const filteredAndSorted = useMemo(() => {
    return subscriptions
      .filter((sub) => {
        const matchesSearch = sub.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === 'all' || sub.category === filterCategory;
        return matchesSearch && matchesCategory;
      })
      .map(sub => {
        const nextDate = getNextPaymentDate(sub.startDate, sub.billingCycle);
        return { ...sub, nextDate };
      })
      .sort((a, b) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'cost') {
          const costA = convertCurrency(parseFloat(a.cost), a.currency || 'PLN', settings.currency, exchangeRates);
          const costB = convertCurrency(parseFloat(b.cost), b.currency || 'PLN', settings.currency, exchangeRates);
          return costB - costA;
        }
        if (sortBy === 'nextPayment') return a.nextDate - b.nextDate;
        return 0;
      });
  }, [subscriptions, searchTerm, filterCategory, sortBy]);

  if (subscriptions.length === 0) return <EmptyState />;

  return (
    <div className="subscription-list glass-panel">
      <div className="list-toolbar" style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '24px', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0, fontSize: '1.4rem' }}>Twoje Subskrypcje ({subscriptions.length})</h2>
        
        <div className="toolbar-actions" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <div className="search-box glass-input" style={{ display: 'flex', alignItems: 'center', background: 'var(--surface-color)', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--surface-border)' }}>
            <Search size={18} color="var(--text-secondary)" style={{ marginRight: '8px' }} />
            <input 
              type="text" 
              placeholder="Szukaj..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', outline: 'none' }}
            />
          </div>

          <div className="filter-box" style={{ display: 'flex', alignItems: 'center', background: 'var(--surface-color)', padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--surface-border)' }}>
            <Filter size={18} color="var(--text-secondary)" style={{ marginRight: '8px' }} />
            <select 
              value={filterCategory} 
              onChange={(e) => setFilterCategory(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', outline: 'none' }}
            >
              <option value="all">Wszystkie kategorie</option>
              {categories.filter(c => c !== 'all').map(c => (
                <option key={c} value={c}>{CATEGORY_LABELS[c] || c}</option>
              ))}
            </select>
          </div>

          <div className="sort-box" style={{ display: 'flex', alignItems: 'center', background: 'var(--surface-color)', padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--surface-border)' }}>
            <ArrowUpDown size={18} color="var(--text-secondary)" style={{ marginRight: '8px' }} />
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', outline: 'none' }}
            >
              <option value="name">Od A do Z</option>
              <option value="cost">Od najdroższej</option>
              <option value="nextPayment">Najbliższa płatność</option>
            </select>
          </div>
        </div>
      </div>

      <div className="sub-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {filteredAndSorted.map((sub) => {
          const logoUri = determineServiceLogo(sub.name);
          const cycleLabel = BILLING_CYCLES.find(c => c.value === sub.billingCycle)?.label || sub.billingCycle;
          return (
            <div key={sub.id} className={`sub-card ${sub.status === 'paused' ? 'paused' : ''}`} style={{ 
              background: 'rgba(255, 255, 255, 0.02)', 
              borderRadius: '16px', 
              padding: '20px',
              border: '1px solid rgba(255,255,255,0.05)',
              opacity: sub.status === 'paused' ? 0.6 : 1,
              transition: 'all 0.3s ease',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  {logoUri ? (
                    <img 
                      src={logoUri} 
                      alt={sub.name} 
                      style={{ width: '40px', height: '40px', objectFit: 'contain', background: '#fff', padding: '4px', borderRadius: '8px' }} 
                      onError={(e) => {
                        e.target.style.display = 'none';
                        if (e.target.nextElementSibling) e.target.nextElementSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div style={{ display: logoUri ? 'none' : 'flex', width: '40px', height: '40px', background: 'var(--accent-gradient)', borderRadius: '8px', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem' }}>
                    {sub.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '600' }}>{sub.name}</h3>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {CATEGORY_LABELS[sub.category] || sub.category}
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button onClick={() => toggleStatus(sub.id)} className="icon-btn" title={sub.status === 'paused' ? 'Wznów' : 'Wstrzymaj'}>
                    {sub.status === 'paused' ? <Play size={16} /> : <Pause size={16} />}
                  </button>
                  <button onClick={() => onEdit(sub)} className="icon-btn" title="Edytuj" style={{ color: '#1e90ff' }}><Edit2 size={16} /></button>
                  <button onClick={() => setDeleteModal({ isOpen: true, id: sub.id, name: sub.name })} className="icon-btn" title="Usuń" style={{ color: 'var(--danger-color)' }}><Trash2 size={16} /></button>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 'auto' }}>
                <div>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Koszt ({cycleLabel})</p>
                  <p style={{ margin: 0, fontSize: '1.4rem', fontWeight: '700' }}>
                    {(sub.currency || 'PLN') !== settings.currency ? (
                      <span style={{ display: 'flex', flexDirection: 'column' }}>
                        <span>{formatCurrency(sub.cost, sub.currency || 'PLN')}</span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 'normal', lineHeight: '1.2' }}>
                          ok. {formatCurrency(convertCurrency(parseFloat(sub.cost), sub.currency || 'PLN', settings.currency, exchangeRates), settings.currency)}
                        </span>
                      </span>
                    ) : (
                      formatCurrency(sub.cost, settings.currency)
                    )}
                  </p>
                </div>
                {sub.status !== 'paused' && (
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Nast. płatność</p>
                    <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: '500' }}>{format(sub.nextDate, 'd MMM yyyy', { locale: pl })}</p>
                  </div>
                )}
                {sub.status === 'paused' && (
                  <div style={{ padding: '4px 12px', background: 'rgba(255,255,255,0.1)', borderRadius: '20px', fontSize: '0.85rem' }}>
                    Wstrzymana
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <ConfirmModal 
        isOpen={deleteModal.isOpen}
        title="Usuń subskrypcję"
        message={`Czy na pewno chcesz usunąć "${deleteModal.name}"? Tego działania nie można cofnąć.`}
        onConfirm={() => {
          deleteSubscription(deleteModal.id);
          setDeleteModal({ isOpen: false, id: null, name: '' });
        }}
        onCancel={() => setDeleteModal({ isOpen: false, id: null, name: '' })}
      />
    </div>
  );
};

export default SubscriptionList;
