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
  } catch (e) { }
};

export const generateId = () => {
  return crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9);
};

export const convertCurrency = (amount, from, to, exchangeRates) => {
  if (!amount || isNaN(amount)) return 0;
  if (from === to || !exchangeRates || Object.keys(exchangeRates).length === 0) return amount;
  
  const rateFrom = exchangeRates[from] || 1;
  const rateTo = exchangeRates[to] || 1;
  
  return (amount / rateFrom) * rateTo;
};

export const calculateMonthlyCost = (subscriptions, baseCurrency = 'PLN', exchangeRates = {}) => {
  return subscriptions
    .filter(sub => sub.status !== 'paused')
    .reduce((total, sub) => {
      let monthlyCost = parseFloat(sub.cost);
      if (sub.billingCycle === 'yearly') {
        monthlyCost = monthlyCost / 12;
      } else if (sub.billingCycle === 'quarterly') {
        monthlyCost = monthlyCost / 3;
      } else if (sub.billingCycle === 'weekly') {
        monthlyCost = monthlyCost * 4.33;
      }
      
      const subCurrency = sub.currency || 'PLN';
      monthlyCost = convertCurrency(monthlyCost, subCurrency, baseCurrency, exchangeRates);

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
    } else if (billingCycle === 'quarterly') {
      next = addMonths(next, 3);
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
export const generateHistoryData = (subscriptions, months = 6, baseCurrency = 'PLN', exchangeRates = {}) => {
  const data = [];
  const now = new Date();

  for (let i = months - 1; i >= 0; i--) {
    const targetMonth = addMonths(now, -i);
    const monthName = targetMonth.toLocaleString('pl-PL', { month: 'short' });

    // Simplification: assume active subscriptions cost their monthly cost in the past.
    // Realistically you'd check `startDate`.
    const cost = activeCostInMonth(subscriptions, targetMonth, baseCurrency, exchangeRates);
    data.push({ name: monthName, uv: parseFloat(cost.toFixed(2)) });
  }

  return data;
};

const activeCostInMonth = (subscriptions, targetMonth, baseCurrency = 'PLN', exchangeRates = {}) => {
  return subscriptions
    .filter(sub => sub.status !== 'paused')
    .filter(sub => {
      const start = sub.startDate ? new Date(sub.startDate) : new Date(0);
      return isBefore(start, targetMonth) || isSameDay(start, targetMonth);
    })
    .reduce((total, sub) => {
      let monthlyCost = parseFloat(sub.cost);
      if (sub.billingCycle === 'yearly') monthlyCost /= 12;
      if (sub.billingCycle === 'quarterly') monthlyCost /= 3;
      if (sub.billingCycle === 'weekly') monthlyCost *= 4.33;
      
      const subCurrency = sub.currency || 'PLN';
      monthlyCost = convertCurrency(monthlyCost, subCurrency, baseCurrency, exchangeRates);
      
      return total + monthlyCost;
    }, 0);
};

export const exportData = (data) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `subtrack_backup_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

export const importData = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        if (!Array.isArray(parsed)) {
          reject(new Error('Nieprawidłowy format pliku – oczekiwana tablica subskrypcji'));
          return;
        }
        resolve(parsed);
      } catch (err) {
        reject(new Error('Błąd parsowania JSON: ' + err.message));
      }
    };
    reader.onerror = () => reject(new Error('Błąd odczytu pliku'));
    reader.readAsText(file);
  });
};

export const determineServiceLogo = (name) => {
  const normalized = name.toLowerCase();
  if (normalized.includes('netflix')) return 'https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg';
  if (normalized.includes('spotify')) return 'https://upload.wikimedia.org/wikipedia/commons/2/26/Spotify_logo_with_text.svg';
  if (normalized.includes('youtube')) return 'https://upload.wikimedia.org/wikipedia/commons/b/b8/YouTube_Logo_2017.svg';
  if (normalized.includes('prime')) return 'https://upload.wikimedia.org/wikipedia/commons/1/11/Amazon_Prime_Video_logo.svg';
  if (normalized.includes('amazon')) return 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg';
  if (normalized.includes('apple')) return 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg';
  if (normalized.includes('google')) return 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg';
  if (normalized.includes('microsoft')) return 'https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg';
  if (normalized.includes('adobe')) return 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Adobe_Systems_logo_and_wordmark.svg';
  if (normalized.includes('disney')) return 'https://upload.wikimedia.org/wikipedia/commons/3/3e/Disney_Plus_logo.svg';
  if (normalized.includes('hbo') || normalized.includes('max')) return 'https://upload.wikimedia.org/wikipedia/commons/1/17/HBO_Max_Logo.svg';
  if (normalized.includes('chatgpt') || normalized.includes('openai')) return 'https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg';
  if (normalized.includes('github')) return 'https://upload.wikimedia.org/wikipedia/commons/9/91/Octicons-mark-github.svg';
  if (normalized.includes('slack')) return 'https://upload.wikimedia.org/wikipedia/commons/b/b9/Slack_Technologies_Logo.svg';
  if (normalized.includes('notion')) return 'https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png';
  if (normalized.includes('zoom')) return 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Zoom_Communications_Logo.svg';
  if (normalized.includes('dropbox')) return 'https://upload.wikimedia.org/wikipedia/commons/c/cb/Dropbox_logo_2017.svg';
  if (normalized.includes('canva')) return 'https://upload.wikimedia.org/wikipedia/commons/0/08/Canva_icon_2021.svg';
  if (normalized.includes('playstation')) return 'https://upload.wikimedia.org/wikipedia/commons/0/00/PlayStation_logo.svg';
  if (normalized.includes('xbox')) return 'https://upload.wikimedia.org/wikipedia/commons/f/f9/Xbox_one_logo.svg';
  if (normalized.includes('nintendo')) return 'https://upload.wikimedia.org/wikipedia/commons/0/0d/Nintendo.svg';
  return null;
}
