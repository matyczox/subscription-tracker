import React, { createContext, useState, useEffect, useContext } from 'react';
import { getSubscriptions, saveSubscriptions, getSettings, saveSettings, generateId } from '../utils/storage';
import { toast } from 'react-hot-toast';

const SubscriptionContext = createContext();

export const SubscriptionProvider = ({ children }) => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [settings, setSettings] = useState({});
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setSubscriptions(getSubscriptions());
    setSettings(getSettings());
    setIsLoaded(true);
  }, []);

  const updateSubscriptions = (newSubs) => {
    setSubscriptions(newSubs);
    saveSubscriptions(newSubs);
  };

  const updateSettings = (newSettings) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    saveSettings(updated);
  };

  const addSubscription = (subData) => {
    const newSub = {
      ...subData,
      id: generateId(),
      status: 'active',
      startDate: subData.startDate || new Date().toISOString()
    };
    const updated = [...subscriptions, newSub];
    updateSubscriptions(updated);
    toast.success('Dodano nową subskrypcję!');
  };

  const editSubscription = (id, subData) => {
    const updated = subscriptions.map((sub) =>
      sub.id === id ? { ...sub, ...subData } : sub
    );
    updateSubscriptions(updated);
    toast.success('Zaktualizowano subskrypcję');
  };

  const deleteSubscription = (id) => {
    const updated = subscriptions.filter((sub) => sub.id !== id);
    updateSubscriptions(updated);
    toast.success('Usunięto subskrypcję');
  };

  const toggleStatus = (id) => {
    const updated = subscriptions.map((sub) => {
      if (sub.id === id) {
        return { ...sub, status: sub.status === 'paused' ? 'active' : 'paused' };
      }
      return sub;
    });
    updateSubscriptions(updated);
    toast.success('Zmieniono status subskrypcji');
  };

  return (
    <SubscriptionContext.Provider value={{
      subscriptions,
      settings,
      updateSettings,
      addSubscription,
      editSubscription,
      deleteSubscription,
      toggleStatus,
      isLoaded
    }}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscriptions = () => useContext(SubscriptionContext);
