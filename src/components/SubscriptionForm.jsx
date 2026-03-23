import React, { useState, useEffect } from 'react';

const SubscriptionForm = ({ onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState({
    name: '',
    cost: '',
    billingCycle: 'monthly',
    category: 'entertainment'
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.cost) return;
    onSave(formData);
  };

  const categories = ['entertainment', 'software', 'cloud', 'gym', 'other'];
  const cycles = [
    { value: 'monthly', label: 'Miesięcznie' },
    { value: 'yearly', label: 'Rocznie' },
    { value: 'weekly', label: 'Tygodniowo' }
  ];

  return (
    <div className="modal-overlay">
      <div className="modal-content glass-panel pulse-anim">
        <div className="modal-header">
          <h2>{initialData ? 'Edytuj Subskrypcję' : 'Dodaj Subskrypcję'}</h2>
          <button className="icon-btn close-btn" onClick={onClose}>✖</button>
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
              required 
            />
          </div>

          <div className="form-group">
            <label>Koszt (PLN)</label>
            <input 
              type="number" 
              step="0.01" 
              name="cost" 
              value={formData.cost} 
              onChange={handleChange} 
              placeholder="np. 49.99"
              required 
            />
          </div>

          <div className="form-group">
            <label>Cykl rozliczeniowy</label>
            <select name="billingCycle" value={formData.billingCycle} onChange={handleChange}>
              {cycles.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label>Kategoria</label>
            <select name="category" value={formData.category} onChange={handleChange}>
              {categories.map(c => (
                <option key={c} value={c}>
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="form-actions">
            <button type="button" className="btn secondary-btn" onClick={onClose}>Anuluj</button>
            <button type="submit" className="btn primary-btn">Zapisz</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubscriptionForm;
