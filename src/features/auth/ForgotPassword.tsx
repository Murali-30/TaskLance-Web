import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    setIsLoading(false);
    setIsSubmitted(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-8 w-full max-w-md mx-auto"
    >
      <div className="mb-6">
        <Link to="/login" className="inline-flex items-center text-sm text-text-muted hover:text-primary transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to login
        </Link>
      </div>

      {!isSubmitted ? (
        <>
          <div className="text-center mb-8">
            <h2 className="text-2xl font-display font-bold">Forgot password?</h2>
            <p className="text-text-muted mt-2">No worries, we'll send you reset instructions.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail className="w-5 h-5" />}
              required
            />

            <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
              {isLoading ? 'Sending...' : 'Reset Password'}
            </Button>
          </form>
        </>
      ) : (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-6"
        >
          <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8 text-success" />
          </div>
          <h2 className="text-2xl font-display font-bold mb-3">Check your email</h2>
          <p className="text-text-muted mb-8">
            We sent a password reset link to <span className="font-medium text-text-primary">{email}</span>
          </p>
          <p className="text-sm text-text-muted">
            Didn't receive the email? <button className="text-primary hover:underline font-medium">Click to resend</button>
          </p>
          
          <div className="mt-8">
             <Link to="/reset-password">
               <Button variant="outline" className="w-full">
                 Simulate Email Link Click (Demo)
               </Button>
             </Link>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
