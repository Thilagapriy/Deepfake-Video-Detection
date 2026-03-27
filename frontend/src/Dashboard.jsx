import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Ui1.css'; // Reusing styles

const Dashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <div className="ui1-page">
      <span className="orb orb-one" aria-hidden="true" />
      <span className="orb orb-two" aria-hidden="true" />
      <span className="orb orb-three" aria-hidden="true" />

      <div className="upload-card">
        <span className="sheen" aria-hidden="true" />
        <h1 className="title">Dashboard</h1>
        <p className="subtitle">Welcome to True Vision Deepfake Detection.</p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '30px' }}>
          <button className="submit-btn" onClick={() => navigate('/detect')} style={{ width: '100%', fontSize: '18px', padding: '16px' }}>
            New Detection
          </button>
          
          <button className="choose-btn nav-btn" onClick={() => navigate('/history')} style={{ width: '100%', padding: '16px' }}>
            View History
          </button>

          <button className="choose-btn nav-btn" onClick={handleLogout} style={{ width: '100%', padding: '16px', background: 'transparent', borderColor: '#444' }}>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
