import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import './styles.css';
import './styles/starry-background.css';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Add mouse position state
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Add smooth spring animation
  const springConfig = { damping: 30, stiffness: 200 };
  const spotlightX = useSpring(mouseX, springConfig);
  const spotlightY = useSpring(mouseY, springConfig);

  // Handle mouse move for the entire page
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { clientX, clientY } = e;
    mouseX.set(clientX);
    mouseY.set(clientY);
  };

  // Check if already authenticated
  useEffect(() => {
    if (localStorage.getItem('isAuthenticated') === 'true') {
      navigate('/history');
    }
  }, [navigate]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'VCET' && password === 'VCET@123') {
      localStorage.setItem('isAuthenticated', 'true');
      const from = location.state?.from?.pathname || sessionStorage.getItem('redirectPath') || '/history';
      sessionStorage.removeItem('redirectPath');
      navigate(from);
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    <div 
      className="min-h-screen w-full bg-[#0a0b1a] bg-mesh p-4 relative overflow-hidden starry-background"
      onMouseMove={handleMouseMove}
    >
      <div className="stars"></div>
      <div className="stars2"></div>
      <div className="stars3"></div>
      <div className="stars4"></div>

      <motion.div
        className="pointer-events-none fixed inset-0"
        style={{
          background: "radial-gradient(600px circle at var(--x) var(--y), rgba(139, 92, 246, 0.07), transparent 40%)",
          x: spotlightX,
          y: spotlightY,
        }}
        animate={{
          '--x': spotlightX,
          '--y': spotlightY,
        } as any}
      />
      
      <motion.div
        className="pointer-events-none fixed inset-0"
        style={{
          background: "radial-gradient(800px circle at var(--x) var(--y), rgba(99, 102, 241, 0.05), transparent 40%)",
          x: spotlightX,
          y: spotlightY,
        }}
        animate={{
          '--x': spotlightX,
          '--y': spotlightY,
        } as any}
      />

      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md mx-4"
        >
          <div className="gradient-border">
            <div className="glass-effect p-8 rounded-xl relative bg-[#0a0b1a]/95 backdrop-blur-md">
              <div className="spotlight"></div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-center mb-8"
              >
                <h1 className="text-3xl font-bold mb-2 text-white">
                  Login
                </h1>
                <p className="text-indigo-300/50">
                  Please sign in to continue
                </p>
              </motion.div>

              <form onSubmit={handleLogin} className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <label className="block text-indigo-300/70 text-sm font-medium mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-[#0a0b1a]/95 text-white rounded-lg px-4 py-3
                      border border-[#1a103f]/30 focus:outline-none focus:ring-2 focus:ring-[#1a103f]/30 
                      transition-all backdrop-blur-sm placeholder-indigo-300/30"
                    placeholder="Enter your username"
                    required
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <label className="block text-indigo-300/70 text-sm font-medium mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#0a0b1a]/95 text-white rounded-lg px-4 py-3
                      border border-[#1a103f]/30 focus:outline-none focus:ring-2 focus:ring-[#1a103f]/30 
                      transition-all backdrop-blur-sm placeholder-indigo-300/30"
                    placeholder="Enter your password"
                    required
                  />
                </motion.div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#0a0b1a]/95 border border-red-500/20 rounded-lg p-3 text-red-400/80 text-sm text-center backdrop-blur-sm"
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
                    className="w-full bg-gradient-to-r from-indigo-500/10 to-purple-500/10 text-white py-3 rounded-lg font-medium
                      hover:from-indigo-500/20 hover:to-purple-500/20 transition-all duration-200 backdrop-blur-sm
                      border border-indigo-500/20 hover:border-indigo-500/30"
                  >
                    Login
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate('/')}
                    className="w-full bg-[#0a0b1a]/95 text-white/80 py-3 rounded-lg font-medium
                      hover:bg-[#0a0b1a]/90 transition-all duration-200 backdrop-blur-sm
                      border border-[#1a103f]/30 hover:border-[#1a103f]/40"
                  >
                    Back to Dashboard
                  </button>
                </motion.div>
              </form>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login; 