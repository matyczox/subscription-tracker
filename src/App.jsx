import React, { useState, useEffect } from 'react';
import './App.css';
import Dashboard from './components/Dashboard';
import SubscriptionList from './components/SubscriptionList';
import SubscriptionForm from './components/SubscriptionForm';
import { getSubscriptions, saveSubscriptions, generateId } from './utils/storage';

function App() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSub, setEditingSub] = useState(null);

  useEffect(() => {
    setSubscriptions(getSubscriptions());
  }, []);

  const handleSave = (subData) => {
    let updatedSubs;
    if (editingSub) {
      updatedSubs = subscriptions.map((sub) =>
        sub.id === editingSub.id ? { ...subData, id: editingSub.id } : sub
      );
    } else {
      updatedSubs = [...subscriptions, { ...subData, id: generateId() }];
    }
    setSubscriptions(updatedSubs);
    saveSubscriptions(updatedSubs);
    setIsFormOpen(false);
    setEditingSub(null);
  };

  const handleDelete = (id) => {
    if (window.confirm('Czy na pewno chcesz usunąć tę subskrypcję?')) {
      const updatedSubs = subscriptions.filter((sub) => sub.id !== id);
      setSubscriptions(updatedSubs);
      saveSubscriptions(updatedSubs);
    }
  };

  const openEdit = (sub) => {
    setEditingSub(sub);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingSub(null);
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="logo-container">
          <div className="logo-icon">💳</div>
          <h1>SubTrack</h1>
        </div>
        <button className="primary-btn pulse-anim" onClick={() => setIsFormOpen(true)}>
          + Dodaj Subskrypcję
        </button>
      </header>

      <main className="app-main">
        <Dashboard subscriptions={subscriptions} />
        <SubscriptionList
          subscriptions={subscriptions}
          onEdit={openEdit}
          onDelete={handleDelete}
        />
      </main>

      {isFormOpen && (
        <SubscriptionForm
          onClose={closeForm}
          onSave={handleSave}
          initialData={editingSub}
        />
      )}
    </div>
  );
}

export default App;
