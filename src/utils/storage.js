import { addDays, addMonths, addYears, isAfter, isBefore, isSameDay } from 'date-fns';

export const getSubscriptions = () => {
  try {
    const data = localStorage.getItem('subtrack_subscriptions');
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Błąd wczytywania z localStorage:', error);
    return [];
  }
};

export const saveSubscriptions = (subscriptions) => {
  try {
    localStorage.setItem('subtrack_subscriptions', JSON.stringify(subscriptions));
  } catch (error) {
    console.error('Błąd zapisu do localStorage:', error);
  }
};

export const getSettings = () => {
  try {
    const data = localStorage.getItem('subtrack_settings');
    return data ? JSON.parse(data) : { currency: 'PLN', budget: 500, darkTheme: true };
  } catch (e) {
    return { currency: 'PLN', budget: 500, darkTheme: true };
  }
};

export const saveSettings = (settings) => {
  try {
    localStorage.setItem('subtrack_settings', JSON.stringify(settings));
  } catch (e) {}
};

export const generateId = () => {
  return crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9);
};

export const calculateMonthlyCost = (subscriptions) => {
  return subscriptions
    .filter(sub => sub.status !== 'paused')
    .reduce((total, sub) => {
      let monthlyCost = parseFloat(sub.cost);
      if (sub.billingCycle === 'yearly') {
        monthlyCost = monthlyCost / 12;
      } else if (sub.billingCycle === 'weekly') {
        monthlyCost = monthlyCost * 4.33;
      }
      return total + monthlyCost;
    }, 0);
};

export const formatCurrency = (amount, currency = 'PLN') => {
  return new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency: currency
  }).format(amount);
};

// Calculate the next payment date based on start date and cycle
export const getNextPaymentDate = (startDate, billingCycle) => {
  if (!startDate) return new Date();
  
  const start = new Date(startDate);
  const now = new Date();
  let next = new Date(startDate);

  // Keep adding billing cycle until we surpass today
  while (isBefore(next, now) || isSameDay(next, now)) {
    if (billingCycle === 'monthly') {
      next = addMonths(next, 1);
    } else if (billingCycle === 'yearly') {
      next = addYears(next, 1);
    } else if (billingCycle === 'weekly') {
      next = addDays(next, 7);
    } else {
      break;
    }
  }

  return next;
};

// Return array of objects for trend line graph (e.g. past 6 months costs)
export const generateHistoryData = (subscriptions, months = 6) => {
  const data = [];
  const now = new Date();
  
  for (let i = months - 1; i >= 0; i--) {
    const targetMonth = addMonths(now, -i);
    const monthName = targetMonth.toLocaleString('pl-PL', { month: 'short' });
    
    // Simplification: assume active subscriptions cost their monthly cost in the past.
    // Realistically you'd check `startDate`.
    const cost = activeCostInMonth(subscriptions, targetMonth);
    data.push({ name: monthName, uv: parseFloat(cost.toFixed(2)) });
  }

  return data;
};

const activeCostInMonth = (subscriptions, targetMonth) => {
  return subscriptions
    .filter(sub => sub.status !== 'paused')
    .filter(sub => {
      const start = sub.startDate ? new Date(sub.startDate) : new Date(0);
      return isBefore(start, targetMonth) || isSameDay(start, targetMonth);
    })
    .reduce((total, sub) => {
      let monthlyCost = parseFloat(sub.cost);
      if (sub.billingCycle === 'yearly') monthlyCost /= 12;
      if (sub.billingCycle === 'weekly') monthlyCost *= 4.33;
      return total + monthlyCost;
    }, 0);
};

export const exportData = (data) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `subtrack_backup_${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

export const determineServiceLogo = (name) => {
  const normalized = name.toLowerCase();
  if (normalized.includes('netflix')) return 'https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg';
  if (normalized.includes('spotify')) return 'https://upload.wikimedia.org/wikipedia/commons/2/26/Spotify_logo_with_text.svg';
  if (normalized.includes('youtube')) return 'https://upload.wikimedia.org/wikipedia/commons/b/b8/YouTube_Logo_2017.svg';
  if (normalized.includes('amazon') || normalized.includes('prime')) return 'https://upload.wikimedia.org/wikipedia/commons/4/44/Amazon-Prime-Video-Logo.png';
  if (normalized.includes('apple')) return 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg';
  return null;
}
