import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { GoogleLogin } from '@react-oauth/google';
import './Ui.css';

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
const API_URL = `${BASE_URL}/api/auth`;

const Ui = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [activeTab, setActiveTab] = useState('login'); // 'login' or 'signup'
  const [step, setStep] = useState(1); // 1 = Email, 2 = Verify OTP
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  
  const navigate = useNavigate();

  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setLoading(true);
      const res = await axios.post(`${API_URL}/google-login`, { token: credentialResponse.credential });
      localStorage.setItem('token', res.data.access_token);
      navigate('/dashboard');
    } catch (err) {
      setError('Google Login Failed. Please try again.');
      setLoading(false);
    }
  };

  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
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
      setStep(2); 
      setResendTimer(60); // 60s countdown
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
      setError(err.response?.data?.detail || 'Invalid or expired OTP.');
    }
    setLoading(false);
  };

  return (
    <div className="ui-container">
      <div className="brand-title">
        <h1>True Vision</h1>
        <p>A trustworthy team for your issues</p>
      </div>
      
      <div className="login-form">
        <div className="tab-buttons">
          <button 
            type="button" 
            className={activeTab === 'login' ? 'tab-btn active-tab' : 'tab-btn inactive-tab'}
            onClick={() => { setActiveTab('login'); setError(''); setSuccess(''); }}
          >
            Login
          </button>
          <button 
            type="button" 
            className={activeTab === 'signup' ? 'tab-btn active-tab' : 'tab-btn inactive-tab'}
            onClick={() => { setActiveTab('signup'); setStep(1); setError(''); setSuccess(''); setOtp(''); }}
          >
            Sign Up
          </button>
        </div>

        {error && <p className="error-msg">{error}</p>}
        {success && <p style={{color: '#33ffaa', fontWeight: 'bold'}}>{success}</p>}

        {activeTab === 'login' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', alignItems: 'center' }}>
            <h2>Welcome Back</h2>
            <p>Log in securely with your Google account.</p>
            <div style={{ marginTop: '20px', width: '100%', display: 'flex', justifyContent: 'center' }}>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError('Google Login Failed')}
                theme="filled_black"
                size="large"
                shape="rectangular"
              />
            </div>
            {loading && <p>Authenticating...</p>}
          </div>
        ) : (
          <>
            {step === 1 ? (
              <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <h2>Create Account</h2>
                <p>Register using a secure email OTP.</p>
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
                  {loading ? 'Sending...' : 'Send Secure OTP'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <h2>Enter OTP</h2>
                
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
                  {loading ? 'Verifying...' : 'Login'}
                </button>
                
                {resendTimer > 0 ? (
                  <p style={{fontSize: '12px', textAlign: 'center'}}>Resend code in {resendTimer}s</p>
                ) : (
                  <button type="button" onClick={() => handleSendOtp()} disabled={loading} style={{ background: 'transparent', border: '1px solid #fff', color: '#fff' }}>
                    Resend OTP
                  </button>
                )}

                <button 
                  type="button" 
                  onClick={() => { setStep(1); setError(''); setSuccess(''); setOtp(''); }} 
                  style={{ background: 'transparent', border: 'none', color: '#aaa', textDecoration: 'underline', marginTop: '10px', boxShadow: 'none' }}
                >
                  Change Email
                </button>
              </form>
            )}
          </>
        )}
      </div>

      <div className="copyright">
        © 2026 True Vision. All rights reserved.
      </div>
    </div>
  );
};

export default Ui;
