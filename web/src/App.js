import React, { useState, useEffect } from 'react';
import './App.css';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Items from './pages/Items';
import Purchases from './pages/Purchases';
import Requests from './pages/Requests';
import Locations from './pages/Locations';

function App() {
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('dashboard');

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogin = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setCurrentPage('dashboard');
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard user={user} />;
      case 'inventory':
        return <Inventory user={user} />;
      case 'items':
        return <Items user={user} />;
      case 'purchases':
        return <Purchases user={user} />;
      case 'requests':
        return <Requests user={user} />;
      case 'locations':
        return <Locations user={user} />;
      default:
        return <Dashboard user={user} />;
    }
  };

  return (
    <div className="App">
      <nav className="navbar">
        <div className="nav-brand">
          <h2>📦 Inventory Tracker</h2>
        </div>
        <div className="nav-links">
          <button onClick={() => setCurrentPage('dashboard')} className={currentPage === 'dashboard' ? 'active' : ''}>
            Dashboard
          </button>
          <button onClick={() => setCurrentPage('inventory')} className={currentPage === 'inventory' ? 'active' : ''}>
            Stock
          </button>
          <button onClick={() => setCurrentPage('items')} className={currentPage === 'items' ? 'active' : ''}>
            Items
          </button>
          <button onClick={() => setCurrentPage('purchases')} className={currentPage === 'purchases' ? 'active' : ''}>
            Purchases
          </button>
          <button onClick={() => setCurrentPage('requests')} className={currentPage === 'requests' ? 'active' : ''}>
            Requests
          </button>
          <button onClick={() => setCurrentPage('locations')} className={currentPage === 'locations' ? 'active' : ''}>
            Locations
          </button>
        </div>
        <div className="nav-user">
          <span>👤 {user.username}</span>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </nav>
      <main className="main-content">
        {renderPage()}
      </main>
    </div>
  );
}

export default App;
