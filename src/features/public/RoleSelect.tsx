import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../../components/ui/Button';
import { Briefcase, User as UserIcon } from 'lucide-react';

export default function RoleSelect() {
  const [selectedRole, setSelectedRole] = useState<'freelancer' | 'client' | null>(null);
  const navigate = useNavigate();

  const handleContinue = () => {
    if (selectedRole) {
      navigate(`/register?role=${selectedRole}`);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-display font-bold mb-3">Choose your role</h2>
          <p className="text-text-muted">Tell us how you want to use TaskLance</p>
        </div>

        <div className="space-y-4 mb-8">
          {/* Freelancer Card */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedRole('freelancer')}
            className={`p-6 rounded-2xl border-2 cursor-pointer transition-all ${
              selectedRole === 'freelancer' 
                ? 'border-primary bg-primary/10 shadow-[0_0_20px_rgba(108,71,255,0.2)]' 
                : 'border-border-color bg-surface hover:border-primary/50'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${selectedRole === 'freelancer' ? 'bg-primary text-white' : 'bg-surface-2 text-text-muted'}`}>
                <UserIcon className="w-6 h-6" />
              </div>
              <div className="text-left">
                <h3 className="font-display font-semibold text-lg">I'm a Freelancer</h3>
                <p className="text-sm text-text-muted">I want to find projects and get hired</p>
              </div>
              <div className={`ml-auto w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                selectedRole === 'freelancer' ? 'border-primary' : 'border-border-color'
              }`}>
                {selectedRole === 'freelancer' && <div className="w-3 h-3 rounded-full bg-primary" />}
              </div>
            </div>
          </motion.div>

          {/* Client Card */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedRole('client')}
            className={`p-6 rounded-2xl border-2 cursor-pointer transition-all ${
              selectedRole === 'client' 
                ? 'border-secondary bg-secondary/10 shadow-[0_0_20px_rgba(255,107,53,0.2)]' 
                : 'border-border-color bg-surface hover:border-secondary/50'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${selectedRole === 'client' ? 'bg-secondary text-white' : 'bg-surface-2 text-text-muted'}`}>
                <Briefcase className="w-6 h-6" />
              </div>
              <div className="text-left">
                <h3 className="font-display font-semibold text-lg">I'm a Client</h3>
                <p className="text-sm text-text-muted">I want to hire talent for my projects</p>
              </div>
              <div className={`ml-auto w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                selectedRole === 'client' ? 'border-secondary' : 'border-border-color'
              }`}>
                {selectedRole === 'client' && <div className="w-3 h-3 rounded-full bg-secondary" />}
              </div>
            </div>
          </motion.div>
        </div>

        <Button 
          className="w-full" 
          size="lg" 
          disabled={!selectedRole}
          onClick={handleContinue}
        >
          Create Account
        </Button>
        
        <p className="text-center mt-6 text-sm text-text-muted">
          Already have an account?{' '}
          <button onClick={() => navigate('/login')} className="text-primary hover:underline font-medium">
            Log In
          </button>
        </p>
      </div>
    </div>
  );
}
