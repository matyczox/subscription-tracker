import React from 'react';
import { PackageOpen } from 'lucide-react';

const EmptyState = () => {
  return (
    <div className="empty-state glass-panel" style={{ padding: '60px 20px', textAlign: 'center' }}>
      <div style={{ display: 'inline-flex', padding: '20px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', marginBottom: '20px' }}>
        <PackageOpen size={48} color="var(--text-secondary)" />
      </div>
      <h3 style={{ fontSize: '1.4rem', marginBottom: '10px' }}>Brak subskrypcji</h3>
      <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', margin: '0 auto' }}>
        Nie masz jeszcze żadnych dodanych subskrypcji. Kliknij przycisk "Dodaj Subskrypcję", aby rozpocząć śledzenie swoich wydatków.
      </p>
    </div>
  );
};

export default EmptyState;
