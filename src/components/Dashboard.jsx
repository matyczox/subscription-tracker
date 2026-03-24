import React from 'react';
import { useSubscriptions } from '../context/SubscriptionContext';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { calculateMonthlyCost, formatCurrency, getNextPaymentDate } from '../utils/storage';
import { CATEGORY_COLORS, CATEGORY_LABELS } from '../constants';
import { format, differenceInDays } from 'date-fns';
import { pl } from 'date-fns/locale';
import { AlertCircle, Calendar, CreditCard, Wallet } from 'lucide-react';

const Dashboard = () => {
  const { subscriptions, settings } = useSubscriptions();
  
  const totalMonthly = calculateMonthlyCost(subscriptions);
  const totalYearly = totalMonthly * 12;
  const activeCount = subscriptions.filter(s => s.status !== 'paused').length;

  const budget = settings.budget || 500;
  const budgetPercentage = Math.min((totalMonthly / budget) * 100, 100);
  const isOverBudget = totalMonthly > budget;

  // Pie chart data
  const categoryData = subscriptions
    .filter(s => s.status !== 'paused')
    .reduce((acc, sub) => {
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
      color: CATEGORY_COLORS[key] || CATEGORY_COLORS.other
    }));

  // Next payment
  const activeSubsWithDates = subscriptions
    .filter(s => s.status !== 'paused' && s.startDate)
    .map(s => {
      const nextDate = getNextPaymentDate(s.startDate, s.billingCycle);
      return { ...s, nextDate, daysLeft: differenceInDays(nextDate, new Date()) };
    })
    .sort((a, b) => a.daysLeft - b.daysLeft);

  const upcomingPayments = activeSubsWithDates.filter(s => s.daysLeft <= 7 && s.daysLeft >= 0);

  return (
    <section className="dashboard glass-panel">
      {upcomingPayments.length > 0 && (
        <div className="alert alert-warning" style={{ marginBottom: '20px', padding: '16px', borderRadius: '12px', background: 'rgba(255, 165, 2, 0.1)', border: '1px solid rgba(255, 165, 2, 0.3)', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
          <AlertCircle color="#ffa502" />
          <div>
            <h4 style={{ color: '#ffa502', margin: '0 0 8px 0' }}>Nadchodzące płatności w tym tygodniu:</h4>
            <ul style={{ paddingLeft: '20px', margin: 0 }}>
              {upcomingPayments.map(sub => (
                <li key={sub.id} style={{ fontSize: '0.9rem' }}>
                  <strong>{sub.name}</strong> - {formatCurrency(sub.cost, settings.currency)} ({format(sub.nextDate, 'd MMMM', { locale: pl })})
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="budget-container" style={{ marginBottom: '30px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontWeight: '500' }}>Wykorzystanie budżetu</span>
          <span>{formatCurrency(totalMonthly, settings.currency)} / {formatCurrency(budget, settings.currency)}</span>
        </div>
        <div className="progress-bar-bg" style={{ height: '12px', background: 'rgba(255,255,255,0.1)', borderRadius: '6px', overflow: 'hidden' }}>
          <div 
            className="progress-bar-fill"
            style={{ 
              height: '100%', 
              width: `${budgetPercentage}%`, 
              background: isOverBudget ? 'var(--danger-color)' : 'var(--success-color)',
              transition: 'width 0.5s ease-out'
            }}
          />
        </div>
        {isOverBudget && <p style={{ color: 'var(--danger-color)', fontSize: '0.85rem', marginTop: '6px' }}>Przekroczyłeś limit budżetu na ten miesiąc!</p>}
      </div>

      <div className="summary-cards">
        <div className="card stat-card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div className="stat-icon" style={{ background: 'rgba(123, 66, 246, 0.15)', padding: '12px', borderRadius: '50%' }}>
            <Wallet color="#b08dff" size={28} />
          </div>
          <div>
            <h3>Miesięczne koszty</h3>
            <p className="amount highlight" style={{ fontSize: '1.8rem' }}>{formatCurrency(totalMonthly, settings.currency)}</p>
          </div>
        </div>
        <div className="card stat-card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div className="stat-icon" style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '12px', borderRadius: '50%' }}>
            <CreditCard color="#a0aab2" size={28} />
          </div>
          <div>
            <h3>Roczne koszty</h3>
            <p className="amount secondary-highlight" style={{ fontSize: '1.8rem' }}>{formatCurrency(totalYearly, settings.currency)}</p>
          </div>
        </div>
        <div className="card stat-card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div className="stat-icon" style={{ background: 'rgba(46, 213, 115, 0.15)', padding: '12px', borderRadius: '50%' }}>
            <Calendar color="#2ed573" size={28} />
          </div>
          <div>
            <h3>Aktywne usługi</h3>
            <p className="amount" style={{ fontSize: '1.8rem' }}>{activeCount}</p>
          </div>
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
                formatter={(value) => formatCurrency(value, settings.currency)}
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
