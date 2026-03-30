import React from 'react';
import { useSubscriptions } from '../context/SubscriptionContext';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import { calculateMonthlyCost, formatCurrency, getNextPaymentDate, convertCurrency, generateHistoryData } from '../utils/storage';
import { CATEGORY_COLORS, CATEGORY_LABELS } from '../constants';
import { format, differenceInDays } from 'date-fns';
import { pl } from 'date-fns/locale';
import { AlertCircle, Calendar, CreditCard, Wallet, Activity } from 'lucide-react';
import BillingTimeline from './BillingTimeline';
import FinancialInsights from './FinancialInsights';

const Dashboard = () => {
  const { subscriptions, settings, exchangeRates } = useSubscriptions();
  
  const totalMonthly = calculateMonthlyCost(subscriptions, settings.currency, exchangeRates);
  const totalYearly = totalMonthly * 12;
  const activeCount = subscriptions.filter(s => s.status !== 'paused').length;

  const budget = settings.budget || 500;
  const budgetPercentage = Math.min((totalMonthly / budget) * 100, 100);
  const isOverBudget = totalMonthly > budget;
  const dailyBurn = totalMonthly / 30;

  // Pie chart data
  const categoryData = subscriptions
    .filter(s => s.status !== 'paused')
    .reduce((acc, sub) => {
      let monthlyCost = parseFloat(sub.cost);
      if (sub.billingCycle === 'yearly') monthlyCost /= 12;
      if (sub.billingCycle === 'weekly') monthlyCost *= 4.33;
      
      const subCurrency = sub.currency || 'PLN';
      monthlyCost = convertCurrency(monthlyCost, subCurrency, settings.currency, exchangeRates);
      
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

  const historyData = generateHistoryData(subscriptions, 6, settings.currency, exchangeRates);

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
        {!isOverBudget && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
            <Activity size={14} color="var(--success-color)" />
            <span>Średni koszt dzienny: <strong>{formatCurrency(dailyBurn, settings.currency)}</strong></span>
          </div>
        )}
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
        <div className="chart-container" style={{ marginTop: '30px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          <div style={{ height: '300px' }}>
            <h3 style={{ marginBottom: '15px', color: 'var(--text-secondary)' }}>Wydatki według kategorii</h3>
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
                  contentStyle={{ backgroundColor: 'var(--bg-color)', border: '1px solid var(--surface-border)', borderRadius: '8px', color: 'var(--text-primary)' }}
                  itemStyle={{ color: 'var(--text-primary)' }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  wrapperStyle={{ color: 'var(--text-primary)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ height: '300px' }}>
            <h3 style={{ marginBottom: '15px', color: 'var(--text-secondary)' }}>Trend wydatków (6 miesięcy)</h3>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historyData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <Line type="monotone" dataKey="uv" name="Koszt" stroke="var(--accent-color)" strokeWidth={3} dot={{ r: 4, fill: "var(--accent-color)" }} activeDot={{ r: 6 }} />
                <CartesianGrid stroke="#ccc" strokeDasharray="5 5" opacity={0.1} />
                <XAxis dataKey="name" stroke="var(--text-secondary)" tick={{ fill: 'var(--text-secondary)' }} />
                <YAxis stroke="var(--text-secondary)" tick={{ fill: 'var(--text-secondary)' }} tickFormatter={(value) => value.toFixed(0)} />
                <Tooltip 
                  formatter={(value) => formatCurrency(value, settings.currency)}
                  contentStyle={{ backgroundColor: 'var(--bg-color)', border: '1px solid var(--surface-border)', borderRadius: '8px', color: 'var(--text-primary)' }}
                  itemStyle={{ color: 'var(--text-primary)' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <BillingTimeline />
      <FinancialInsights />
    </section>
  );
};

export default Dashboard;
