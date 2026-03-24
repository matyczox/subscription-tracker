import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { useSubscriptions } from './context/SubscriptionContext';
import Home from './pages/Home';
import Settings from './pages/Settings';
import './App.css';
import { Settings as SettingsIcon, Home as HomeIcon } from 'lucide-react';

function App() {
  const { isLoaded, settings } = useSubscriptions();

  if (!isLoaded) return <div className="loader">Ładowanie...</div>;

  return (
    <div className={`app-container ${settings.darkTheme ? 'dark-theme' : 'light-theme'}`}>
      <header className="app-header">
        <Link to="/" className="logo-container" style={{ textDecoration: 'none' }}>
          <div className="logo-icon">💳</div>
          <h1>SubTrack</h1>
        </Link>
        <div className="nav-links">
          <Link to="/" className="icon-btn" title="Strona główna"><HomeIcon size={20} /></Link>
          <Link to="/settings" className="icon-btn" title="Ustawienia"><SettingsIcon size={20} /></Link>
        </div>
      </header>

      <main className="app-main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
