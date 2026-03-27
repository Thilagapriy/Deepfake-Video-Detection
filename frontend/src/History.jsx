import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Ui1.css'; // Reusing styling

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
const API_URL = `${BASE_URL}/api/history`;

const HistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/');
        return;
      }
      try {
        const res = await axios.get(API_URL, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setHistory(res.data);
      } catch (err) {
        console.error("Failed to load history");
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [navigate]);

  return (
    <div className="ui1-page" style={{ alignItems: 'flex-start', paddingTop: '80px' }}>
      <button className="nav-btn" onClick={() => navigate('/dashboard')} style={{ position: 'absolute', top: 20, left: 20, zIndex: 10 }}>
        &larr; Back to Dashboard
      </button>

      <div className="upload-card" style={{ width: 'min(900px, 92vw)' }}>
        <h1 className="title">Your Detection History</h1>
        <p className="subtitle">Previous analyses stored in your account database.</p>
        
        {loading ? (
          <p>Loading history...</p>
        ) : history.length === 0 ? (
          <p>No past detections found.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {history.map((item) => (
              <div key={item.id} style={{ 
                background: 'rgba(255,255,255,0.05)', 
                border: '1px solid rgba(255,255,255,0.1)',
                padding: '20px',
                borderRadius: '12px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <strong style={{ fontSize: '18px' }}>{item.video_filename}</strong>
                  <span style={{ color: item.is_fake === 'Fake' ? '#ff334e' : '#33ffaa', fontWeight: 'bold' }}>
                    {item.is_fake} ({item.fake_percentage}%)
                  </span>
                </div>
                <div style={{ color: '#aaa', fontSize: '14px' }}>
                  User: <span style={{color: '#fff'}}>{item.user_email}</span><br/>
                  Date: {new Date(item.timestamp).toLocaleString()}<br/>
                  Highlight Anomaly: {item.gradcam_frame_path || 'None'}<br/>
                  Stats: {item.stats_json}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;
