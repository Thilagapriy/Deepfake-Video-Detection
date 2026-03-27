import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Ui.css';

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
const API_URL = `${BASE_URL}/api/auth`;

const Ui = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1); // 1 = Email, 2 = Verify OTP
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/send-otp`, { email });
      setSuccess(response.data.message || 'OTP sent to your email!');
      setStep(2); // Switch to OTP input
    } catch (err) {
      if (err.response?.status === 429) {
        setError("Rate limit exceeded. Please wait a minute before requesting another OTP.");
      } else {
        setError(err.response?.data?.detail || 'Failed to send OTP. Try again.');
      }
    }
    setLoading(false);
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    
    if (otp.length < 5) {
      setError('Please enter the full validation code.');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/verify-otp`, { email, otp });
      localStorage.setItem('token', response.data.access_token);
      navigate('/dashboard');
    } catch (err) {
      if (err.response?.status === 429) {
        setError("Too many attempts. Please try again later.");
      } else {
        setError(err.response?.data?.detail || 'Invalid or expired OTP.');
      }
    }
    setLoading(false);
  };

  return (
    <div className="ui-container">
      <div className="brand-title">
        <h1>True Vision</h1>
        <p>A trustworthy team for your issues</p>
      </div>
      
      {step === 1 ? (
        <form className="login-form" onSubmit={handleSendOtp}>
          <h2>Secure Login</h2>
          <p>We use a safe and passwordless OTP verification system.</p>
          
          {error && <p className="error-msg">{error}</p>}
          
          <label htmlFor="email">Email ID</label>
          <input 
            id="email" 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            placeholder="Enter your email"
            required
          />

          <button type="submit" disabled={loading} style={{ marginTop: '10px' }}>
            {loading ? 'Generating Code...' : 'Send Secure OTP'}
          </button>
        </form>
      ) : (
        <form className="login-form" onSubmit={handleVerifyOtp}>
          <h2>Enter Authentication Code</h2>
          <p style={{fontSize: "12px", color: "#ccc"}}>
            Check your email (or the backend python console) for the 6-digit code. Valid for 5 minutes.
          </p>
          {success && <p style={{color: '#33ffaa', fontWeight: 'bold'}}>{success}</p>}
          {error && <p className="error-msg">{error}</p>}
          
          <label htmlFor="otp">Code</label>
          <input 
            id="otp" 
            type="text" 
            value={otp} 
            onChange={(e) => setOtp(e.target.value)} 
            placeholder="e.g. 123456"
            maxLength={6}
            required
          />

          <button type="submit" disabled={loading} style={{ marginTop: '10px' }}>
            {loading ? 'Verifying...' : 'Sign In'}
          </button>
          
          <button 
            type="button" 
            onClick={() => { setStep(1); setError(''); setSuccess(''); setOtp(''); }} 
            style={{marginTop: 10, background: 'transparent', border: '1px solid #fff', color: '#fff'}}
          >
            Go Back
          </button>
        </form>
      )}

      <div className="copyright">
        © 2026 True Vision. All rights reserved.
      </div>
    </div>
  );
};

export default Ui;
