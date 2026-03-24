import React, { useState } from 'react';
import Dashboard from '../components/Dashboard';
import SubscriptionList from '../components/SubscriptionList';
import SubscriptionForm from '../components/SubscriptionForm';
import { useSubscriptions } from '../context/SubscriptionContext';
import { PlusCircle } from 'lucide-react';

const Home = () => {
  const { addSubscription, editSubscription } = useSubscriptions();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSub, setEditingSub] = useState(null);

  const handleSave = (subData) => {
    if (editingSub) {
      editSubscription(editingSub.id, subData);
    } else {
      addSubscription(subData);
    }
    setIsFormOpen(false);
    setEditingSub(null);
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
    <>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
        <button className="primary-btn pulse-anim" onClick={() => setIsFormOpen(true)} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <PlusCircle size={20} /> Dodaj Subskrypcję
        </button>
      </div>
      <Dashboard />
      <SubscriptionList onEdit={openEdit} />

      {isFormOpen && (
        <SubscriptionForm
          onClose={closeForm}
          onSave={handleSave}
          initialData={editingSub}
        />
      )}
    </>
  );
};

export default Home;
