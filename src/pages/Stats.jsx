import React from 'react';
import { useSubscriptions } from '../context/SubscriptionContext';
import { formatCurrency, convertCurrency, calculateMonthlyCost } from '../utils/storage';
import { CATEGORY_LABELS, CATEGORY_COLORS } from '../constants';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { TrendingUp, Award, Clock, PieChart as PieIcon } from 'lucide-react';

const Stats = () => {
  const { subscriptions, settings, exchangeRates } = useSubscriptions();
  
  if (subscriptions.length === 0) {
    return (
      <div className="glass-panel" style={{ padding: '40px', textAlign: 'center' }}>
        <h2>Brak danych do statystyk</h2>
        <p>Dodaj pierwszą subskrypcję, aby zobaczyć analizę swoich wydatków.</p>
      </div>
    );
  }

  const totalMonthly = calculateMonthlyCost(subscriptions, settings.currency, exchangeRates);
  const activeSubs = subscriptions.filter(s => s.status !== 'paused');
  
  // Expenses by category for the pie chart
  const categoryData = activeSubs.reduce((acc, sub) => {
    let monthlyCost = parseFloat(sub.cost);
    if (sub.billingCycle === 'yearly') monthlyCost /= 12;
    if (sub.billingCycle === 'quarterly') monthlyCost /= 3;
    if (sub.billingCycle === 'weekly') monthlyCost *= 4.33;
    
    const subCurrency = sub.currency || 'PLN';
    monthlyCost = convertCurrency(monthlyCost, subCurrency, settings.currency, exchangeRates);
    
    acc[sub.category] = (acc[sub.category] || 0) + monthlyCost;
    return acc;
  }, {});

  const pieData = Object.entries(categoryData).map(([key, value]) => ({
    name: CATEGORY_LABELS[key] || key,
    value: parseFloat(value.toFixed(2)),
    color: CATEGORY_COLORS[key] || CATEGORY_COLORS.other
  })).sort((a, b) => b.value - a.value);

  // Top 5 most expensive subscriptions
  const topSubscriptions = activeSubs
    .map(sub => {
      let monthlyCost = parseFloat(sub.cost);
      if (sub.billingCycle === 'yearly') monthlyCost /= 12;
      if (sub.billingCycle === 'quarterly') monthlyCost /= 3;
      if (sub.billingCycle === 'weekly') monthlyCost *= 4.33;
      
      const subCurrency = sub.currency || 'PLN';
      const convertedCost = convertCurrency(monthlyCost, subCurrency, settings.currency, exchangeRates);
      
      return { ...sub, convertedMonthly: convertedCost };
    })
    .sort((a, b) => b.convertedMonthly - a.convertedMonthly)
    .slice(0, 5);

  const barData = topSubscriptions.map(sub => ({
    name: sub.name.length > 10 ? sub.name.substring(0, 8) + '...' : sub.name,
    fullName: sub.name,
    value: parseFloat(sub.convertedMonthly.toFixed(2))
  }));

  return (
    <div className="stats-page" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <h2 style={{ fontSize: '1.6rem', marginBottom: '8px' }}>Analiza Wydatków</h2>

      <div className="stats-summary-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
        <div className="glass-panel stat-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'rgba(123, 66, 246, 0.15)', padding: '12px', borderRadius: '12px' }}>
            <TrendingUp color="#b08dff" size={24} />
          </div>
          <div>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Średni koszt dzienny</p>
            <p style={{ margin: 0, fontSize: '1.4rem', fontWeight: '700' }}>{formatCurrency(totalMonthly / 30, settings.currency)}</p>
          </div>
        </div>

        <div className="glass-panel stat-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'rgba(46, 213, 115, 0.15)', padding: '12px', borderRadius: '12px' }}>
            <Award color="#2ed573" size={24} />
          </div>
          <div>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Najdroższa usługa</p>
            <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: '700' }}>{topSubscriptions[0]?.name || '-'}</p>
          </div>
        </div>

        <div className="glass-panel stat-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'rgba(255, 165, 2, 0.15)', padding: '12px', borderRadius: '12px' }}>
            <Clock color="#ffa502" size={24} />
          </div>
          <div>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Liczba wszystkich usług</p>
            <p style={{ margin: 0, fontSize: '1.4rem', fontWeight: '700' }}>{subscriptions.length}</p>
          </div>
        </div>
      </div>

      <div className="charts-main-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
        <div className="glass-panel" style={{ padding: '24px', height: '400px' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', fontSize: '1.1rem' }}>
            <PieIcon size={18} /> Udział kategorii
          </h3>
          <ResponsiveContainer width="100%" height="80%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => formatCurrency(value, settings.currency)}
                contentStyle={{ backgroundColor: 'var(--bg-color)', border: '1px solid var(--surface-border)', borderRadius: '8px' }}
              />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-panel" style={{ padding: '24px', height: '400px' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', fontSize: '1.1rem' }}>
             TOP 5 najdroższych (miesięcznie)
          </h3>
          <ResponsiveContainer width="100%" height="80%">
            <BarChart data={barData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => val.toFixed(0)} />
              <Tooltip 
                formatter={(value) => formatCurrency(value, settings.currency)}
                contentStyle={{ backgroundColor: 'var(--bg-color)', border: '1px solid var(--surface-border)', borderRadius: '8px' }}
              />
              <Bar dataKey="value" fill="var(--accent-color)" radius={[4, 4, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ marginBottom: '20px', fontSize: '1.1rem' }}>Szczegółowy podział kosztów</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <th style={{ padding: '12px 16px' }}>Kategoria</th>
                <th style={{ padding: '12px 16px' }}>Miesięcznie</th>
                <th style={{ padding: '12px 16px' }}>Rocznie</th>
                <th style={{ padding: '12px 16px' }}>% całkowitych</th>
              </tr>
            </thead>
            <tbody>
              {pieData.map((cat, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: cat.color }}></div>
                    {cat.name}
                  </td>
                  <td style={{ padding: '12px 16px' }}>{formatCurrency(cat.value, settings.currency)}</td>
                  <td style={{ padding: '12px 16px' }}>{formatCurrency(cat.value * 12, settings.currency)}</td>
                  <td style={{ padding: '12px 16px' }}>{((cat.value / totalMonthly) * 100).toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Stats;
