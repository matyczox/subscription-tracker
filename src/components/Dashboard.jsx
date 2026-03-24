import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { calculateMonthlyCost, formatCurrency } from '../utils/storage';

const COLORS = {
  entertainment: '#ff4757',
  software: '#1e90ff',
  cloud: '#00d2d1',
  gym: '#2ed573',
  other: '#9ba1b0'
};

const CATEGORY_LABELS = {
  entertainment: 'Rozrywka',
  software: 'Oprogramowanie',
  cloud: 'Chmura',
  gym: 'Sport',
  other: 'Inne'
};

const Dashboard = ({ subscriptions }) => {
  const totalMonthly = calculateMonthlyCost(subscriptions);
  const totalYearly = totalMonthly * 12;
  const activeCount = subscriptions.length;

  const categoryData = subscriptions.reduce((acc, sub) => {
    let monthlyCost = parseFloat(sub.cost);
    if (sub.billingCycle === 'yearly') monthlyCost /= 12;
    if (sub.billingCycle === 'weekly') monthlyCost *= 4.33;
    
    acc[sub.category] = (acc[sub.category] || 0) + monthlyCost;
    return acc;
  }, {});

  const chartData = Object.entries(categoryData)
    .filter(([_, value]) => value > 0)
    .map(([key, value]) => ({
      name: CATEGORY_LABELS[key] || key,
      value: parseFloat(value.toFixed(2)),
      color: COLORS[key] || COLORS.other
    }));

  return (
    <section className="dashboard glass-panel">
      <div className="summary-cards">
        <div className="card stat-card">
          <h3>Miesięczne koszty</h3>
          <p className="amount highlight">{formatCurrency(totalMonthly)}</p>
        </div>
        <div className="card stat-card">
          <h3>Roczne koszty</h3>
          <p className="amount secondary-highlight">{formatCurrency(totalYearly)}</p>
        </div>
        <div className="card stat-card">
          <h3>Aktywne subskrypcje</h3>
          <p className="amount">{activeCount}</p>
        </div>
      </div>
      
      {chartData.length > 0 && (
        <div className="chart-container" style={{ marginTop: '30px', height: '300px' }}>
          <h3 style={{ marginBottom: '15px', color: 'var(--text-secondary)' }}>Wydatki według kategorii (miesięcznie)</h3>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => formatCurrency(value)}
                contentStyle={{ backgroundColor: '#170d24', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                itemStyle={{ color: '#fff' }}
              />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                wrapperStyle={{ color: 'var(--text-primary)' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
};

export default Dashboard;
