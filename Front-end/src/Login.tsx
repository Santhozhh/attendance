import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import './styles.css';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Check if already authenticated
  useEffect(() => {
    if (localStorage.getItem('isAuthenticated') === 'true') {
      navigate('/history');
    }
  }, [navigate]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'VCET' && password === 'VCET@123') {
      // Set authentication state
      localStorage.setItem('isAuthenticated', 'true');
      
      // Get the redirect path from state or session storage
      const from = location.state?.from?.pathname || sessionStorage.getItem('redirectPath') || '/history';
      sessionStorage.removeItem('redirectPath'); // Clean up
      
      navigate(from);
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0a0a0a] bg-mesh flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="gradient-border">
          <div className="glass-effect p-8 rounded-xl relative overflow-hidden">
            <div className="spotlight"></div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center mb-8"
            >
              <h1 className="text-3xl font-bold mb-2 text-gradient">
                Welcome Back
              </h1>
              <p className="text-gray-400">
                Please sign in to continue
              </p>
            </motion.div>

            <form onSubmit={handleLogin} className="space-y-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-gray-900/50 text-white border border-gray-700 rounded-lg px-4 py-3
                    focus:outline-none focus:border-[#45caff] focus:ring-1 focus:ring-[#45caff] transition-all
                    placeholder-gray-500"
                  placeholder="Enter your username"
                  required
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-900/50 text-white border border-gray-700 rounded-lg px-4 py-3
                    focus:outline-none focus:border-[#45caff] focus:ring-1 focus:ring-[#45caff] transition-all
                    placeholder-gray-500"
                  placeholder="Enter your password"
                  required
                />
              </motion.div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-500 text-sm text-center"
                >
                  {error}
                </motion.div>
              )}

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="space-y-4"
              >
                <button
                  type="submit"
                  className="w-full button-gradient text-white py-3 rounded-lg font-medium hover-glow"
                >
                  Sign in
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="w-full bg-gray-800/50 text-gray-300 py-3 rounded-lg font-medium
                    hover:bg-gray-700/50 transition-all duration-200"
                >
                  Back to Dashboard
                </button>
              </motion.div>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login; 