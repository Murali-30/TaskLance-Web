import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Splash() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      // Check if user has seen onboarding, else go to onboarding
      const hasSeenOnboarding = localStorage.getItem('tasklance_onboarding');
      if (hasSeenOnboarding) {
        navigate('/login', { replace: true });
      } else {
        navigate('/onboarding', { replace: true });
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="fixed inset-0 bg-background flex flex-col items-center justify-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="flex flex-col items-center"
      >
        <div className="w-20 h-20 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-[0_0_40px_rgba(108,71,255,0.4)] mb-6">
          <span className="text-white text-5xl font-bold font-display">T</span>
        </div>
        <motion.h1 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-4xl font-display font-bold tracking-tight mb-2"
        >
          TaskLance
        </motion.h1>
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="text-text-muted text-lg"
        >
          Where talent meets opportunity
        </motion.p>
      </motion.div>
    </div>
  );
}
