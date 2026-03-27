import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import './Ui1.css';

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
const API_URL = `${BASE_URL}/api/video`;

const loadingMessages = [
  "input is cleaned...",
  "frame conversion activates...",
  "analysing...",
  "reporting..."
];

const Ui1 = () => {
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  const [result, setResult] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    let interval;
    if (loading) {
      interval = setInterval(() => {
        setLoadingMsgIdx((prev) => (prev + 1) % loadingMessages.length);
      }, 2500); // cycle messages every 2.5s
    } else {
      setLoadingMsgIdx(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedVideo(file);
      setResult(null); // Reset previous result if new file selected
    }
  };

  const handleSubmit = async () => {
    if (!selectedVideo) return;

    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedVideo);

    setLoading(true);
    setResult(null);

    try {
      const response = await axios.post(`${API_URL}/analyze`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });
      setResult(response.data);
    } catch (err) {
      console.error(err);
      alert('Failed to analyze video. Make sure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const getChartData = () => {
    if (!result) return [];
    return [
      { name: 'Fake', value: result.fake_percentage },
      { name: 'Real', value: 100 - result.fake_percentage }
    ];
  };

  return (
    <div className="ui1-page">
      <span className="orb orb-one" aria-hidden="true" />
      <span className="orb orb-two" aria-hidden="true" />
      <span className="orb orb-three" aria-hidden="true" />

      <button className="nav-btn" onClick={() => navigate('/dashboard')} style={{ position: 'absolute', top: 20, left: 20, zIndex: 10 }}>
        &larr; Back to Dashboard
      </button>

      <div className="upload-card">
        <span className="sheen" aria-hidden="true" />
        
        {!result && !loading && (
          <>
            <h1 className="title">Upload Video for Detection</h1>
            <p className="subtitle">
              Upload a deepfake or authentic video. Our ViT, MDNet, and Bi-GRU models will analyze the frames and spot the exact manipulations.
            </p>

            <div className="actions">
              <label className="choose-btn" htmlFor="video-input">
                Choose video
              </label>
              <input
                id="video-input"
                type="file"
                accept="video/*"
                onChange={handleFileChange}
              />
            </div>

            {selectedVideo && (
              <div className="selection">
                <div className="file-pill">
                  <span className="status-dot" aria-hidden="true" />
                  <span className="file-name">{selectedVideo.name}</span>
                </div>
                <button className="submit-btn" onClick={handleSubmit}>
                  Analyze Video
                </button>
              </div>
            )}
          </>
        )}

        {loading && (
          <div className="loading-container">
            <h1 className="title">Processing...</h1>
            <div className="loader-msg">{loadingMessages[loadingMsgIdx]}</div>
            <p className="subtitle" style={{marginTop: "10px"}}>Please wait approximately 10 seconds.</p>
          </div>
        )}

        {result && (
          <div className="results-area">
            <h1 className="title">Analysis Complete</h1>
            <div className={`result-header ${result.is_fake === 'Fake' ? 'fake' : 'real'}`}>
              Prediction: {result.is_fake} ({result.is_fake === 'Fake' ? result.fake_percentage : parseFloat((100 - result.fake_percentage).toFixed(2))}%)
            </div>

            <div style={{ height: 200, width: '100%', marginTop: '20px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={getChartData()}>
                  <XAxis dataKey="name" stroke="#fff" />
                  <YAxis stroke="#fff" />
                  <Tooltip />
                  <Bar dataKey="value" radius={[4,4,0,0]}>
                    {getChartData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.name === 'Fake' ? '#ff334e' : '#33ffaa'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <h3 style={{marginTop: 20, marginBottom: 10}}>Extracted Anomalous Frames</h3>
            <div className="frames-row" style={{ overflowX: 'auto', display: 'flex', gap: '15px' }}>
              {result.frames.map((frame, idx) => (
                <div key={idx} className={`frame-box-img ${frame.startsWith('gradcam') ? 'gradcam-highlight' : ''}`} style={{ position: 'relative' }}>
                  <img 
                    src={`${BASE_URL}/static/frames/${frame}`} 
                    alt={`Frame ${idx}`} 
                    style={{ height: '120px', width: 'auto', borderRadius: '8px', border: frame.startsWith('gradcam') ? '3px solid #ff334e' : '1px solid #444' }} 
                  />
                  {frame.startsWith('gradcam') && (
                    <div style={{ position: 'absolute', top: -10, right: -10, background: '#ff334e', padding: '4px 8px', borderRadius: '12px', fontSize: '10px', fontWeight: 'bold' }}>
                      Anomaly Spotted
                    </div>
                  )}
                </div>
              ))}
            </div>

            <button className="submit-btn" style={{marginTop: 20}} onClick={() => { setResult(null); setSelectedVideo(null); }}>
              Analyze Another Video
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Ui1;
