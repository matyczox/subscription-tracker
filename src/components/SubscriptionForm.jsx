import React, { useState, useEffect } from 'react';
import { CATEGORY_LABELS, BILLING_CYCLES } from '../constants';
import { X } from 'lucide-react';
import { useSubscriptions } from '../context/SubscriptionContext';

const SubscriptionForm = ({ onClose, onSave, initialData }) => {
  const { settings } = useSubscriptions();
  const [formData, setFormData] = useState({
    name: '',
    cost: '',
    currency: settings?.currency || 'PLN',
    billingCycle: 'monthly',
    category: 'entertainment',
    startDate: new Date().toISOString().split('T')[0]
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        startDate: initialData.startDate 
          ? new Date(initialData.startDate).toISOString().split('T')[0] 
          : new Date().toISOString().split('T')[0]
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Nazwa jest wymagana';
    if (!formData.cost || parseFloat(formData.cost) <= 0) newErrors.cost = 'Podaj poprawny koszt większy od zera';
    if (!formData.startDate) newErrors.startDate = 'Data rozpoczęcia jest wymagana';
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    onSave({
      ...formData,
      cost: parseFloat(formData.cost)
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content glass-panel pulse-anim">
        <div className="modal-header">
          <h2>{initialData ? 'Edytuj Subskrypcję' : 'Dodaj Subskrypcję'}</h2>
          <button type="button" className="icon-btn close-btn" onClick={onClose}><X size={20} /></button>
        </div>
        
        <form onSubmit={handleSubmit} className="custom-form">
          <div className="form-group">
            <label>Nazwa usługi</label>
            <input 
              type="text" 
              name="name" 
              value={formData.name} 
              onChange={handleChange} 
              placeholder="np. Netflix, Spotify"
              className={errors.name ? 'error-input' : ''}
            />
            {errors.name && <span className="error-msg" style={{ color: 'var(--danger-color)', fontSize: '0.8rem' }}>{errors.name}</span>}
          </div>

          <div className="form-group">
            <label>Koszt</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input 
                type="number" 
                step="0.01" 
                name="cost" 
                value={formData.cost} 
                onChange={handleChange} 
                placeholder="np. 49.99"
                className={errors.cost ? 'error-input' : ''}
                style={{ flex: 1 }}
              />
              <select name="currency" value={formData.currency} onChange={handleChange} style={{ width: '100px' }}>
                <option value="PLN">PLN</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="CHF">CHF</option>
              </select>
            </div>
            {errors.cost && <span className="error-msg" style={{ color: 'var(--danger-color)', fontSize: '0.8rem' }}>{errors.cost}</span>}
          </div>

          <div className="form-group">
            <label>Cykl rozliczeniowy</label>
            <select name="billingCycle" value={formData.billingCycle} onChange={handleChange}>
              {BILLING_CYCLES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label>Kategoria</label>
            <select name="category" value={formData.category} onChange={handleChange}>
              {Object.entries(CATEGORY_LABELS).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Data pierwszej płatności</label>
            <input 
              type="date" 
              name="startDate" 
              value={formData.startDate} 
              onChange={handleChange}
            />
          </div>

          <div className="form-actions" style={{ marginTop: '20px' }}>
            <button type="button" className="secondary-btn" onClick={onClose}>Anuluj</button>
            <button type="submit" className="primary-btn">Zapisz</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubscriptionForm;
