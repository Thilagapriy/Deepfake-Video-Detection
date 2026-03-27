import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Ui from './Ui';
import Ui1 from './Ui1';
import Dashboard from './Dashboard';
import HistoryPage from './History';
import './index.css';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/" />;
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Ui />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/detect" element={<ProtectedRoute><Ui1 /></ProtectedRoute>} />
        <Route path="/history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}

export default App;
