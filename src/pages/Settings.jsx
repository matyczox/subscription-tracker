import React, { useState } from 'react';
import { useSubscriptions } from '../context/SubscriptionContext';
import { exportData, importData } from '../utils/storage';
import { Download, Save, Upload } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Settings = () => {
  const { subscriptions, settings, updateSettings, importSubscriptions } = useSubscriptions();
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
    const budgetValue = Number(formData.budget);
    if (budgetValue <= 0) {
      toast.error('Budżet musi być większy od zera');
      return;
    }
    updateSettings({ ...formData, budget: budgetValue });
    toast.success('Zapisano ustawienia');
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      const data = await importData(file);
      if (window.confirm(`Czy na pewno chcesz zaimportować ${data.length} subskrypcji? Obecne dane zostaną nadpisane.`)) {
        importSubscriptions(data);
      }
    } catch (err) {
      toast.error(err.message);
    }
    e.target.value = ''; // Reset input
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
            <option value="CHF">CHF (fr)</option>
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
        <div style={{ display: 'flex', gap: '12px' }}>
          <button type="button" onClick={handleExport} className="secondary-btn" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Download size={18} /> Eksportuj JSON
          </button>
          <label className="secondary-btn" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <Upload size={18} /> Importuj JSON
            <input type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />
          </label>
        </div>
      </div>
    </div>
  );
};

export default Settings;
