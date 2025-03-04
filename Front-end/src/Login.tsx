import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

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
    <div className="min-h-screen w-full p-4 sm:p-6 bg-[#0a0a0a] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md p-6 sm:p-8 bg-gray-800 rounded-xl shadow-2xl border border-pink-500/20"
      >
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-2">
          <span className="animate-gradient bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-[length:200%_auto] 
            bg-clip-text text-transparent inline-block">
            Login Required
          </span>
        </h1>
        <p className="text-center mb-8 animate-gradient bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-[length:200%_auto] 
          bg-clip-text text-transparent inline-block">
          Please enter your password to view attendance history
        </p>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-gray-400 text-sm font-medium mb-2">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-2
                focus:outline-none focus:border-pink-500 transition-colors"
              placeholder="Enter username"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              <span className="animate-gradient bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-[length:200%_auto] 
                bg-clip-text text-transparent">
                Password
              </span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-2.5
                focus:outline-none focus:border-pink-500 transition-colors"
              placeholder="Enter password"
              required
            />
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-500 text-sm text-center"
            >
              {error}
            </motion.p>
          )}

          <div className="space-y-4">
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-2.5 rounded-lg
                shadow-lg hover:from-pink-600 hover:to-purple-600 transition-all duration-200"
            >
              Login
            </button>

            <button
              type="button"
              onClick={() => navigate('/')}
              className="w-full bg-gray-700 text-white py-2.5 rounded-lg shadow-lg hover:bg-gray-600
                transition-all duration-200"
            >
              Back to Dashboard
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default Login; 