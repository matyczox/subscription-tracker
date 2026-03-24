import React from 'react';
import { formatCurrency } from '../utils/storage';

const SubscriptionList = ({ subscriptions, onEdit, onDelete }) => {
  if (subscriptions.length === 0) {
    return (
      <div className="empty-state glass-panel">
        <p>Brak aktywnych subskrypcji. Dodaj pierwszą!</p>
      </div>
    );
  }

  return (
    <div className="subscription-list glass-panel">
      <h2>Twoje Subskrypcje</h2>
      <div className="table-responsive">
        <table className="sub-table">
          <thead>
            <tr>
              <th>Nazwa</th>
              <th>Koszt</th>
              <th>Cykl</th>
              <th>Kategoria</th>
              <th>Akcje</th>
            </tr>
          </thead>
          <tbody>
            {subscriptions.map((sub) => (
              <tr key={sub.id} className="sub-row">
                <td className="sub-name">{sub.name}</td>
                <td className="sub-cost">{formatCurrency(sub.cost)}</td>
                <td className="sub-cycle">
                  <span className={`badge cycle-${sub.billingCycle}`}>
                    {sub.billingCycle === 'monthly' ? 'Miesięcznie' : sub.billingCycle === 'yearly' ? 'Rocznie' : 'Tygodniowo'}
                  </span>
                </td>
                <td className="sub-category">
                  <span className={`badge category-${sub.category}`}>
                    {{
                      entertainment: 'Rozrywka',
                      software: 'Oprogramowanie',
                      cloud: 'Chmura',
                      gym: 'Sport',
                      other: 'Inne'
                    }[sub.category] || sub.category}
                  </span>
                </td>
                <td className="sub-actions">
                  <button onClick={() => onEdit(sub)} className="icon-btn edit-btn" title="Edytuj">✏️</button>
                  <button onClick={() => onDelete(sub.id)} className="icon-btn delete-btn" title="Usuń">🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SubscriptionList;
