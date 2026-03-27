import './Ui.css';
import { useState } from 'react';
import Dashboard from './Dashboard';

const Ui = () => {
  const [email, setEmail] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert('Please enter a valid email address.');
      return;
    }
    // Proceed with login logic here
    setIsLoggedIn(true);
  };

  if (isLoggedIn) {
    return <Dashboard />;
  }

  return (
    <div className="ui-container">
      <div className="brand-title">
        <h1>True Vision</h1>
        <p>A trustworthy team for your issues</p>
      </div>
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Login</h2>
        <label htmlFor="username">User Name</label>
        <input id="username" type="text" />
        <label htmlFor="email">Email ID</label>
        <input id="email" type="email" value={email} onChange={handleEmailChange} />
        <label htmlFor="password">Password</label>
        <input id="password" type="password" />
        <button type="submit">Login</button>
      </form>
      <div className="copyright">
        © 2026 True Vision. All rights reserved.
      </div>
    </div>
  );
};

export default Ui;