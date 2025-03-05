import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import '../styles.css';

const AuthLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const isHistoryLogin = location.pathname === '/login/history';

  // Check if already authenticated
  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    const isHistoryAuthenticated = localStorage.getItem('isHistoryAuthenticated') === 'true';

    if (isAuthenticated && !isHistoryLogin) {
      navigate('/dashboard');
    } else if (isHistoryAuthenticated && isHistoryLogin) {
      navigate('/history');
    }
  }, [navigate, location, isHistoryLogin]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isHistoryLogin) {
      // History login credentials
      if (username === 'VCET' && password === 'VCET@123') {
        localStorage.setItem('isHistoryAuthenticated', 'true');
        navigate('/history');
      } else {
        setError('Invalid username or password');
      }
    } else {
      // Main dashboard login credentials
      if (username === 'admin' && password === 'admin@123') {
        localStorage.setItem('isAuthenticated', 'true');
        navigate('/dashboard');
      } else {
        setError('Invalid username or password');
      }
    }
  };

  const handleBackToDashboard = () => {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#020617] bg-mesh flex items-center justify-center p-4">
      {isHistoryLogin && (
        <div className="fixed top-4 right-4">
          <button
            onClick={handleBackToDashboard}
            className="bg-[#11111b]/50 text-indigo-300 border border-indigo-500/20 px-4 py-2 rounded-lg 
              hover:bg-indigo-500/20 transition-all duration-200"
          >
            Back to Dashboard
          </button>
        </div>
      )}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="gradient-border">
          <div className="glass-effect p-8 rounded-xl relative">
            <div className="spotlight"></div>
            <h2 className="text-3xl font-bold mb-6 text-gradient text-center">
              {isHistoryLogin ? 'View Attendance History' : 'Login'}
            </h2>
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-indigo-300 text-sm font-medium mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-[#11111b]/50 text-white border border-indigo-500/20 rounded-lg px-4 py-2
                    focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all
                    placeholder-indigo-300/50"
                  placeholder="Enter username"
                />
              </div>
              <div>
                <label className="block text-indigo-300 text-sm font-medium mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#11111b]/50 text-white border border-indigo-500/20 rounded-lg px-4 py-2
                    focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all
                    placeholder-indigo-300/50"
                  placeholder="Enter password"
                />
              </div>
              {error && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-red-400 text-sm"
                >
                  {error}
                </motion.p>
              )}
              <button
                type="submit"
                className="w-full button-gradient text-white px-6 py-3 rounded-lg font-medium hover-glow"
              >
                {isHistoryLogin ? 'View History' : 'Login'}
              </button>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthLogin; 