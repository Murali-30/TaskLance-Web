import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../../components/ui/Button';
import { Briefcase, CreditCard, Star } from 'lucide-react';

const slides = [
  {
    id: 1,
    title: 'Find work you love',
    description: 'Connect with top clients and discover projects that match your unique skills and passion.',
    icon: Briefcase,
    color: 'text-primary'
  },
  {
    id: 2,
    title: 'Get paid on time, every time',
    description: 'Secure milestone-based payments ensure you are compensated fairly for your hard work.',
    icon: CreditCard,
    color: 'text-success'
  },
  {
    id: 3,
    title: 'Build your reputation',
    description: 'Deliver exceptional work, earn stellar reviews, and grow your freelance career.',
    icon: Star,
    color: 'text-warning'
  }
];

export default function Onboarding() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(prev => prev + 1);
    } else {
      finishOnboarding();
    }
  };

  const finishOnboarding = () => {
    localStorage.setItem('tasklance_onboarding', 'true');
    navigate('/role-select');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative">
      <button 
        onClick={finishOnboarding}
        className="absolute top-6 right-6 text-text-muted hover:text-text-primary font-medium transition-colors"
      >
        Skip
      </button>

      <div className="w-full max-w-md">
        <div className="relative h-80 w-full mb-8 flex justify-center items-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 flex flex-col items-center justify-center text-center"
            >
              <div className="w-40 h-40 rounded-full bg-surface-2 flex items-center justify-center mb-8 shadow-xl">
                {(() => {
                  const Icon = slides[currentSlide].icon;
                  return <Icon className={`w-20 h-20 ${slides[currentSlide].color}`} />;
                })()}
              </div>
              <h2 className="text-3xl font-display font-bold mb-4">{slides[currentSlide].title}</h2>
              <p className="text-text-muted text-lg leading-relaxed px-4">
                {slides[currentSlide].description}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex justify-center gap-2 mb-12">
          {slides.map((_, index) => (
            <div 
              key={index} 
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentSlide ? 'w-8 bg-primary' : 'w-2 bg-surface-2'
              }`} 
            />
          ))}
        </div>

        <Button 
          className="w-full" 
          size="lg"
          onClick={handleNext}
        >
          {currentSlide === slides.length - 1 ? 'Get Started' : 'Next'}
        </Button>
      </div>
    </div>
  );
}
