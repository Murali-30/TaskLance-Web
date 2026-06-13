import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Lock } from 'lucide-react';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setIsLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    setIsLoading(false);
    navigate('/login', { replace: true });
  };

  // Password strength logic (simple demo)
  const getStrength = (pass: string) => {
    if (pass.length === 0) return 0;
    let score = 0;
    if (pass.length > 7) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    return score;
  };
  
  const strength = getStrength(password);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-8 w-full max-w-md mx-auto"
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-display font-bold">Set new password</h2>
        <p className="text-text-muted mt-2">Your new password must be different from previous used passwords.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <Input
            label="New Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={<Lock className="w-5 h-5" />}
            required
          />
          {/* Password Strength Indicator */}
          {password.length > 0 && (
            <div className="mt-2 flex gap-1 h-1.5">
              {[1, 2, 3, 4].map((level) => (
                <div 
                  key={level}
                  className={`flex-1 rounded-full ${
                    strength >= level 
                      ? strength < 2 ? 'bg-error' : strength < 4 ? 'bg-warning' : 'bg-success'
                      : 'bg-surface-2'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        <Input
          label="Confirm Password"
          type="password"
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          icon={<Lock className="w-5 h-5" />}
          required
        />

        {error && <p className="text-error text-sm text-center font-medium">{error}</p>}

        <Button type="submit" className="w-full mt-2" size="lg" disabled={isLoading}>
          {isLoading ? 'Resetting...' : 'Reset Password'}
        </Button>
      </form>
    </motion.div>
  );
}
