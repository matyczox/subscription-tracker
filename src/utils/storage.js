export const getSubscriptions = () => {
  const data = localStorage.getItem('subtrack_subscriptions');
  return data ? JSON.parse(data) : [];
};

export const saveSubscriptions = (subscriptions) => {
  localStorage.setItem('subtrack_subscriptions', JSON.stringify(subscriptions));
};

export const generateId = () => {
  return Math.random().toString(36).substr(2, 9);
};

export const calculateMonthlyCost = (subscriptions) => {
  return subscriptions.reduce((total, sub) => {
    let monthlyCost = parseFloat(sub.cost);
    if (sub.billingCycle === 'yearly') {
      monthlyCost = monthlyCost / 12;
    } else if (sub.billingCycle === 'weekly') {
      monthlyCost = monthlyCost * 4.33;
    }
    return total + monthlyCost;
  }, 0);
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency: 'PLN'
  }).format(amount);
};
