import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { createProject, createNotification } from '../../lib/db';
import { Card, CardContent } from '../../components/ui/Card';
import { Check, ChevronRight, Upload } from 'lucide-react';

export default function CreateProject() {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    skills: '',
    budgetType: 'Fixed Price',
    budget: '',
    deadline: ''
  });

  const handleNext = () => setStep(s => Math.min(s + 1, 3));
  const handlePrev = () => setStep(s => Math.max(s - 1, 1));

  const handlePost = async () => {
    try {
      const newProject = {
        title: formData.title || 'Untitled Project',
        description: formData.description || 'No description provided.',
        category: formData.category || 'General',
        skills: formData.skills ? formData.skills.split(',').map(s => s.trim()) : [],
        budgetType: formData.budgetType,
        budget: parseInt(formData.budget) || 0,
        status: 'open',
        clientId: user?.id,
        createdAt: Date.now(),
        clientName: user?.name,
        deadline: formData.deadline || 'TBD'
      };

      const docId = await createProject(newProject);
      
      // Broadcast notification to freelancers
      await createNotification(
        'New Project Posted',
        `${user?.name || 'A client'} just posted a new project: "${newProject.title}"`,
        'freelancer'
      );
      
      addToast('Project posted successfully!', 'success');
      navigate(`/projects/${docId}`);
    } catch (err: any) {
      addToast(err.message || 'Failed to post project', 'error');
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold mb-2">Post a New Project</h1>
        <p className="text-text-muted">Tell us what you need done.</p>
      </div>

      {/* Stepper */}
      <div className="flex items-center justify-between mb-8">
        {[1, 2, 3].map((num) => (
          <div key={num} className="flex flex-col items-center flex-1 relative">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold z-10 ${
              step >= num ? 'bg-primary text-white' : 'bg-surface-2 text-text-muted'
            }`}>
              {step > num ? <Check className="w-5 h-5" /> : num}
            </div>
            {num < 3 && (
              <div className={`absolute top-5 left-[50%] right-[-50%] h-1 ${
                step > num ? 'bg-primary' : 'bg-surface-2'
              }`} />
            )}
            <span className="text-xs font-medium mt-2 text-text-muted">
              {num === 1 ? 'Details' : num === 2 ? 'Budget' : 'Review'}
            </span>
          </div>
        ))}
      </div>

      <Card>
        <CardContent className="p-6 md:p-8 overflow-hidden relative min-h-[400px]">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h2 className="text-xl font-display font-semibold">Project Details</h2>
                <Input 
                  label="Project Title" 
                  placeholder="e.g. Build a responsive React dashboard" 
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
                
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-1.5">Description</label>
                  <textarea 
                    className="w-full h-32 rounded-xl border border-border-color bg-surface px-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-all resize-none"
                    placeholder="Describe your project in detail..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input 
                    label="Category" 
                    placeholder="e.g. Web Development" 
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  />
                  <Input 
                    label="Skills Required" 
                    placeholder="e.g. React, Tailwind (comma separated)" 
                    value={formData.skills}
                    onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                  />
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h2 className="text-xl font-display font-semibold">Budget & Timeline</h2>
                
                <div className="grid grid-cols-2 gap-4">
                  <div 
                    onClick={() => setFormData({ ...formData, budgetType: 'Fixed Price' })}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-colors ${formData.budgetType === 'Fixed Price' ? 'border-primary bg-primary/5' : 'border-border-color hover:border-primary/50'}`}
                  >
                    <h3 className="font-semibold mb-1">Fixed Price</h3>
                    <p className="text-sm text-text-muted">Pay a set amount for the project</p>
                  </div>
                  <div 
                    onClick={() => setFormData({ ...formData, budgetType: 'Hourly Rate' })}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-colors ${formData.budgetType === 'Hourly Rate' ? 'border-primary bg-primary/5' : 'border-border-color hover:border-primary/50'}`}
                  >
                    <h3 className="font-semibold mb-1">Hourly Rate</h3>
                    <p className="text-sm text-text-muted">Pay for hours worked</p>
                  </div>
                </div>

                <Input 
                  label="Estimated Budget ($)" 
                  type="number" 
                  placeholder="1500" 
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                />
                <Input 
                  label="Deadline" 
                  type="date" 
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                />
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h2 className="text-xl font-display font-semibold">Attachments & Review</h2>
                
                <div className="border-2 border-dashed border-border-color rounded-xl p-8 flex flex-col items-center justify-center text-center hover:border-primary/50 hover:bg-primary/5 transition-colors cursor-pointer">
                  <div className="w-12 h-12 rounded-full bg-surface-2 flex items-center justify-center mb-4 text-text-muted">
                    <Upload className="w-6 h-6" />
                  </div>
                  <p className="font-medium mb-1">Drag and drop files here</p>
                  <p className="text-sm text-text-muted">or click to browse (Max 50MB)</p>
                </div>

                <div className="bg-surface-2 p-4 rounded-xl space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-text-muted">Title</span><span className="font-medium">{formData.title || 'Untitled'}</span></div>
                  <div className="flex justify-between"><span className="text-text-muted">Budget</span><span className="font-medium">${formData.budget || '0'}</span></div>
                  <div className="flex justify-between"><span className="text-text-muted">Timeline</span><span className="font-medium">{formData.deadline || 'TBD'}</span></div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
        
        <div className="p-6 border-t border-border-color flex justify-between items-center bg-surface/50">
          <Button variant="ghost" onClick={handlePrev} disabled={step === 1}>Back</Button>
          {step < 3 ? (
            <Button onClick={handleNext} className="gap-2">Next <ChevronRight className="w-4 h-4" /></Button>
          ) : (
            <Button onClick={handlePost}>Post Project</Button>
          )}
        </div>
      </Card>
    </div>
  );
}
