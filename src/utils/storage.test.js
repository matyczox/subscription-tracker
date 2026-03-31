import { describe, it, expect } from 'vitest';
import {
  calculateMonthlyCost,
  formatCurrency,
  generateId,
  convertCurrency,
  getNextPaymentDate
} from './storage';

describe('storage.js utils tests', () => {

  it('generates a string id', () => {
    const id = generateId();
    expect(typeof id).toBe('string');
    expect(id.length).toBeGreaterThan(0);
  });

  it('calculates correct monthly cost without currency conversion (PLN implicitly)', () => {
    const subscriptions = [
      { cost: '120', billingCycle: 'yearly', status: 'active', currency: 'PLN' },    // 10 PLN/mo
      { cost: '50', billingCycle: 'monthly', status: 'active', currency: 'PLN' },    // 50 PLN/mo
      { cost: '90', billingCycle: 'quarterly', status: 'active', currency: 'PLN' },  // 30 PLN/mo
      { cost: '10', billingCycle: 'weekly', status: 'active', currency: 'PLN' },     // ~43.3 PLN/mo
    ];
    
    // total = 10 + 50 + 30 + 43.3 = 133.3
    const result = calculateMonthlyCost(subscriptions);
    expect(result).toBeCloseTo(133.3, 1);
  });

  it('ignores paused subscriptions in monthly cost calculation', () => {
    const subscriptions = [
      { cost: '50', billingCycle: 'monthly', status: 'active', currency: 'PLN' },
      { cost: '20', billingCycle: 'monthly', status: 'paused', currency: 'PLN' },
    ];
    
    const result = calculateMonthlyCost(subscriptions);
    expect(result).toBe(50);
  });

  it('handles basic currency conversion logic correctly', () => {
    const exchangeRates = { 'USD': 1.0, 'PLN': 4.0 };
    // Cost 10 USD -> expecting 40 PLN if base is PLN and 1 USD = 4 PLN
    const result = convertCurrency(10, 'USD', 'PLN', exchangeRates);
    expect(result).toBe(40);
  });

  it('calculates the next payment date for monthly cycle properly', () => {
    // Current date might be variable, but if we set start date in the past, it should return future date
    const startDate = new Date('2023-01-01').toISOString();
    const nextDate = getNextPaymentDate(startDate, 'monthly');
    expect(nextDate.getTime()).toBeGreaterThan(new Date('2023-01-01').getTime());
    // It should push the date until it passes the current `now`
    expect(nextDate.getTime()).toBeGreaterThanOrEqual(new Date().setHours(0,0,0,0));
  });

});
