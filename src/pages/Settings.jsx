import React, { useState } from 'react';
import { useSubscriptions } from '../context/SubscriptionContext';
import { exportData } from '../utils/storage';
import { Download, Save } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Settings = () => {
  const { subscriptions, settings, updateSettings } = useSubscriptions();
  const [formData, setFormData] = useState(settings);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    updateSettings({ ...formData, budget: Number(formData.budget) });
    toast.success('Zapisano ustawienia');
  };

  const handleExport = () => {
    exportData(subscriptions);
    toast.success('Pobrano plik z subskrypcjami');
  };

  return (
    <div className="glass-panel" style={{ padding: '24px', maxWidth: '600px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '24px', fontSize: '1.4rem' }}>Ustawienia</h2>
      
      <form onSubmit={handleSave} className="custom-form" style={{ marginBottom: '30px' }}>
        <div className="form-group">
          <label>Miesięczny budżet (PLN)</label>
          <input
            type="number"
            step="10"
            name="budget"
            value={formData.budget}
            onChange={handleChange}
            placeholder="np. 500"
          />
        </div>

        <div className="form-group">
          <label>Waluta główna</label>
          <select name="currency" value={formData.currency} onChange={handleChange}>
            <option value="PLN">PLN (zł)</option>
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
          </select>
        </div>

        <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
          <input
            type="checkbox"
            name="darkTheme"
            checked={formData.darkTheme}
            onChange={handleChange}
            style={{ width: 'auto' }}
            id="darkThemeCheck"
          />
          <label htmlFor="darkThemeCheck" style={{ cursor: 'pointer' }}>Ciemny motyw (Dark Mode)</label>
        </div>

        <div className="form-actions" style={{ marginTop: '20px' }}>
          <button type="submit" className="primary-btn" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Save size={18} /> Zapisz Ustawienia
          </button>
        </div>
      </form>

      <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.1)', margin: '30px 0' }} />

      <div>
        <h3 style={{ marginBottom: '15px', fontSize: '1.1rem', color: 'var(--text-secondary)' }}>Eksport danych</h3>
        <p style={{ marginBottom: '15px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Pobierz wszystkie swoje subskrypcje w formacie JSON jako kopię zapasową.
        </p>
        <button type="button" onClick={handleExport} className="secondary-btn" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Download size={18} /> Eksportuj JSON
        </button>
      </div>
    </div>
  );
};

export default Settings;
