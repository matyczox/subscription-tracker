import React from 'react';
import { calculateMonthlyCost, formatCurrency } from '../utils/storage';

const Dashboard = ({ subscriptions }) => {
  const totalMonthly = calculateMonthlyCost(subscriptions);
  const totalYearly = totalMonthly * 12;
  const activeCount = subscriptions.length;

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
      
      {/* Visual Progress Bar for categories could be added here in the future */}
    </section>
  );
};

export default Dashboard;
