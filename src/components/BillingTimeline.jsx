import React, { useMemo } from 'react';
import { useSubscriptions } from '../context/SubscriptionContext';
import { getNextPaymentDate, formatCurrency, determineServiceLogo } from '../utils/storage';
import { format, differenceInDays, addDays, isSameDay, isAfter, isBefore } from 'date-fns';
import { pl } from 'date-fns/locale';
import { Calendar, ChevronRight } from 'lucide-react';

const BillingTimeline = () => {
  const { subscriptions, settings, exchangeRates } = useSubscriptions();

  const timelineItems = useMemo(() => {
    const items = [];
    const now = new Date();
    const thirtyDaysFromNow = addDays(now, 30);

    subscriptions
      .filter(sub => sub.status !== 'paused')
      .forEach(sub => {
        let nextDate = getNextPaymentDate(sub.startDate, sub.billingCycle);
        
        // If the next payment is within 30 days, add it
        // We might want to check multiple occurrences if it's weekly
        let checkDate = nextDate;
        const limit = 5; // Safety limit for occurrences in 30 days
        let count = 0;

        while (isBefore(checkDate, thirtyDaysFromNow) && count < limit) {
          if (isAfter(checkDate, now) || isSameDay(checkDate, now)) {
            items.push({
              ...sub,
              paymentDate: checkDate,
              daysLeft: differenceInDays(checkDate, now)
            });
          }
          
          // Calculate next occurrence for this sub to see if it's also within 30 days
          if (sub.billingCycle === 'weekly') {
            checkDate = addDays(checkDate, 7);
          } else {
            break; // Monthly/Yearly/Quarterly usually only occur once in 30 days
          }
          count++;
        }
      });

    return items.sort((a, b) => a.paymentDate - b.paymentDate);
  }, [subscriptions]);

  if (timelineItems.length === 0) return null;

  return (
    <div className="billing-timeline glass-panel" style={{ padding: '24px', marginTop: '24px', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Calendar size={18} color="var(--accent-color)" /> Nadchodzące płatności (30 dni)
        </h3>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{timelineItems.length} zdarzeń</span>
      </div>

      <div className="timeline-scroll" style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '12px', scrollbarWidth: 'thin' }}>
        {timelineItems.map((item, idx) => {
          const logo = determineServiceLogo(item.name);
          const isSoon = item.daysLeft <= 3;

          return (
            <div 
              key={`${item.id}-${idx}`} 
              className="timeline-card"
              style={{ 
                minWidth: '180px',
                padding: '16px',
                borderRadius: '12px',
                background: isSoon ? 'rgba(123, 66, 246, 0.1)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${isSoon ? 'rgba(123, 66, 246, 0.3)' : 'rgba(255,255,255,0.05)'}`,
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                transition: 'transform 0.2s ease',
                cursor: 'default'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ 
                  fontSize: '0.75rem', 
                  fontWeight: '600', 
                  color: isSoon ? 'var(--accent-color)' : 'var(--text-secondary)',
                  textTransform: 'uppercase'
                }}>
                  {item.daysLeft === 0 ? 'Dzisiaj' : item.daysLeft === 1 ? 'Jutro' : `Za ${item.daysLeft} dni`}
                </span>
                {isSoon && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-color)', boxShadow: '0 0 8px var(--accent-color)' }}></div>}
              </div>

              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                {logo ? (
                  <img src={logo} alt="" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
                ) : (
                  <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 'bold' }}>
                    {item.name[0]}
                  </div>
                )}
                <div style={{ overflow: 'hidden' }}>
                  <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</p>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{format(item.paymentDate, 'd MMM', { locale: pl })}</p>
                </div>
              </div>

              <div style={{ marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '8px' }}>
                <p style={{ margin: 0, fontSize: '1rem', fontWeight: '700' }}>{formatCurrency(item.cost, item.currency || 'PLN')}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BillingTimeline;
