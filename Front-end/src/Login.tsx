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
    if (username === 'natpu' && password === 'natpu@123') {
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
        className="w-full max-w-md mx-4 sm:mx-auto"
      >
        <div className="bg-gray-800 rounded-xl p-6 sm:p-8 shadow-2xl border border-pink-500/20">
          <h2 className="text-xl sm:text-2xl font-bold text-center bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent mb-6">
            Login Required
          </h2>
          
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
              <label className="block text-gray-400 text-sm font-medium mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-2
                  focus:outline-none focus:border-pink-500 transition-colors"
                placeholder="Enter password"
                required
              />
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-red-500 text-center text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-2"
              >
                {error}
              </motion.div>
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
        </div>
      </motion.div>
    </div>
  );
};

export default Login; 