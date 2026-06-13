import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from './Card';
import { Button } from './Button';
import { Input } from './Input';
import { CreditCard, Lock, CheckCircle, Loader2, X } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  amount: number;
  title?: string;
  description?: string;
}

export function PaymentModal({ isOpen, onClose, onSuccess, amount, title = 'Complete Payment', description }: PaymentModalProps) {
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [name, setName] = useState('');
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Reset state when opened
  useEffect(() => {
    if (isOpen) {
      setCardNumber('');
      setExpiry('');
      setCvc('');
      setName('');
      setIsProcessing(false);
      setIsSuccess(false);
    }
  }, [isOpen]);

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 16) value = value.slice(0, 16);
    // Add space every 4 digits
    const formatted = value.replace(/(\d{4})/g, '$1 ').trim();
    setCardNumber(formatted);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 4) value = value.slice(0, 4);
    if (value.length >= 2) {
      value = `${value.slice(0, 2)}/${value.slice(2)}`;
    }
    setExpiry(value);
  };

  const handleCvcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 4) value = value.slice(0, 4);
    setCvc(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // Simulate network request
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      
      // Wait for success animation before calling onSuccess
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    }, 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
            onClick={() => !isProcessing && !isSuccess && onClose()}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50 p-4"
          >
            <Card className="shadow-2xl border border-border-color overflow-hidden">
              <div className="absolute top-4 right-4 z-10">
                {!isProcessing && !isSuccess && (
                  <button onClick={onClose} className="p-1 rounded-full hover:bg-surface-2 text-text-muted transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
              
              <CardHeader className="bg-surface-2 border-b border-border-color pb-6">
                <CardTitle className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-text-muted uppercase tracking-wider">{title}</span>
                  <span className="text-3xl font-display font-bold">${amount.toFixed(2)}</span>
                  {description && <span className="text-sm text-text-muted mt-1">{description}</span>}
                </CardTitle>
              </CardHeader>

              <CardContent className="p-6">
                {isSuccess ? (
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex flex-col items-center justify-center py-8 text-center space-y-4"
                  >
                    <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center text-success mb-2">
                      <CheckCircle className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold">Payment Successful</h3>
                    <p className="text-text-muted text-sm">Your transaction has been securely processed.</p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-text-primary ml-1 flex items-center justify-between">
                        Card Information
                        <div className="flex gap-1">
                          <div className="w-8 h-5 rounded bg-[#FF5F00] opacity-80"></div>
                          <div className="w-8 h-5 rounded bg-[#EB001B] opacity-80 -ml-3 mix-blend-multiply"></div>
                        </div>
                      </label>
                      <div className="relative">
                        <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted pointer-events-none" />
                        <input
                          required
                          type="text"
                          placeholder="0000 0000 0000 0000"
                          value={cardNumber}
                          onChange={handleCardNumberChange}
                          className="w-full bg-background border border-border-color rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-text-primary ml-1">Expiry</label>
                        <input
                          required
                          type="text"
                          placeholder="MM/YY"
                          value={expiry}
                          onChange={handleExpiryChange}
                          className="w-full bg-background border border-border-color rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-mono"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-text-primary ml-1">CVC</label>
                        <input
                          required
                          type="text"
                          placeholder="123"
                          value={cvc}
                          onChange={handleCvcChange}
                          className="w-full bg-background border border-border-color rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-mono"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-text-primary ml-1">Name on Card</label>
                      <Input
                        required
                        placeholder="John Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>

                    <div className="pt-2">
                      <Button 
                        type="submit" 
                        className="w-full gap-2 py-6 text-base font-semibold shadow-lg shadow-primary/20"
                        disabled={isProcessing || cardNumber.length < 19} // 16 digits + 3 spaces
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" /> Processing...
                          </>
                        ) : (
                          <>
                            <Lock className="w-4 h-4" /> Pay ${amount.toFixed(2)}
                          </>
                        )}
                      </Button>
                    </div>
                    <p className="text-center text-xs text-text-muted flex items-center justify-center gap-1.5">
                      <Lock className="w-3 h-3" /> Payments are secure and encrypted
                    </p>
                  </form>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
