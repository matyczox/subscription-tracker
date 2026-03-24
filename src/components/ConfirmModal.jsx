import React from 'react';

const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" style={{ zIndex: 2000 }}>
      <div className="modal-content glass-panel" style={{ textAlign: 'center', maxWidth: '400px' }}>
        <h3 style={{ marginBottom: '16px', fontSize: '1.2rem' }}>{title}</h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>{message}</p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button className="secondary-btn" onClick={onCancel}>Anuluj</button>
          <button className="primary-btn" onClick={onConfirm} style={{ background: 'var(--danger-color)', boxShadow: '0 4px 15px rgba(255, 71, 87, 0.4)' }}>
            Usuń
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
