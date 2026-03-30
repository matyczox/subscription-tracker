import React, { useState } from 'react';
import { useSubscriptions } from '../context/SubscriptionContext';
import { formatCurrency, calculateMonthlyCost, convertCurrency } from '../utils/storage';
import { TrendingDown, Info, DollarSign } from 'lucide-react';

const FinancialInsights = () => {
  const { subscriptions, settings, exchangeRates } = useSubscriptions();
  const [savingsPercent, setSavingsPercent] = useState(10);

  const totalMonthly = calculateMonthlyCost(subscriptions, settings.currency, exchangeRates);
  const potentialMonthlySavings = totalMonthly * (savingsPercent / 100);
  const potentialYearlySavings = potentialMonthlySavings * 12;

  if (subscriptions.length === 0) return null;

  return (
    <div className="financial-insights" style={{ marginTop: '24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
      
      {/* Savings Simulator */}
      <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingDown size={18} color="var(--success-color)" /> Planer oszczędności
          </h3>
          <div style={{ background: 'rgba(46, 213, 115, 0.1)', padding: '4px 10px', borderRadius: '12px', fontSize: '0.85rem', color: 'var(--success-color)', fontWeight: '600' }}>
            -{savingsPercent}%
          </div>
        </div>

        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
          Gdybyś ograniczył wydatki w tej kategorii o {savingsPercent}%, zaoszczędziłbyś:
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <input 
            type="range" 
            min="0" 
            max="100" 
            step="5" 
            value={savingsPercent} 
            onChange={(e) => setSavingsPercent(parseInt(e.target.value))}
            style={{ 
              width: '100%', 
              height: '6px', 
              borderRadius: '3px', 
              appearance: 'none', 
              background: 'rgba(255,255,255,0.1)',
              accentColor: 'var(--success-color)',
              cursor: 'pointer'
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>

        <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Oszczędność roczna</p>
            <p style={{ margin: 0, fontSize: '1.4rem', fontWeight: '700', color: 'var(--success-color)' }}>{formatCurrency(potentialYearlySavings, settings.currency)}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Miesięcznie</p>
            <p style={{ margin: 0, fontSize: '1rem', fontWeight: '600' }}>{formatCurrency(potentialMonthlySavings, settings.currency)}</p>
          </div>
        </div>
      </div>

      {/* Currency Status */}
      <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
         <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <DollarSign size={18} color="var(--accent-color)" /> Kursy walut
          </h3>
          
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
            Aktualne przeliczniki (Frankfurter API) względem waluty głównej ({settings.currency}):
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            {['PLN', 'USD', 'EUR', 'GBP', 'CHF']
              .filter(curr => curr !== settings.currency)
              .map(curr => {
                const rate = convertCurrency(1, curr, settings.currency, exchangeRates);
                return (
                  <div key={curr} style={{ padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>{curr}</span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{rate?.toFixed(2)} {settings.currency}</span>
                  </div>
                );
              })}
          </div>

          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 'auto', background: 'rgba(123, 66, 246, 0.05)', padding: '6px 10px', borderRadius: '8px' }}>
            <Info size={14} /> <span>Kursy są aktualizowane przy każdym odświeżeniu aplikacji.</span>
          </div>
      </div>
    </div>
  );
};

export default FinancialInsights;
