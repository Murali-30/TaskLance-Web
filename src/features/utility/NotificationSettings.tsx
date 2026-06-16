import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Smartphone, ArrowLeft, Save } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../context/ToastContext';

import { useAuth } from '../../context/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export default function NotificationSettings() {
  const { user, updateUser } = useAuth();
  const { addToast } = useToast();
  const [emailNotifs, setEmailNotifs] = useState(user?.emailNotifs ?? true);
  const [pushNotifs, setPushNotifs] = useState(user?.pushNotifs ?? true);
  const [marketingNotifs, setMarketingNotifs] = useState(user?.marketingNotifs ?? false);

  const handleSave = async () => {
    if (updateUser && user?.id) {
      updateUser({ emailNotifs, pushNotifs, marketingNotifs });
      try {
        await updateDoc(doc(db, 'users', user.id), {
          emailNotifs,
          pushNotifs,
          marketingNotifs,
        });
        addToast('Notification preferences updated.', 'success');
      } catch (err) {
        addToast('Failed to update preferences.', 'error');
      }
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto w-full">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <Link to="/settings" className="text-sm text-text-muted hover:text-primary transition-colors flex items-center gap-1 mb-4 w-fit">
          <ArrowLeft className="w-4 h-4" /> Back to Settings
        </Link>
        <h1 className="text-3xl font-display font-bold mb-2">Notifications</h1>
        <p className="text-text-muted">Choose how and when you want to be notified.</p>
      </motion.div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Mail className="w-5 h-5" /> Email Notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="font-medium text-text-primary">Important Updates</p>
                <p className="text-sm text-text-muted">Account security, billing, and legal notices.</p>
              </div>
              <input type="checkbox" checked disabled className="w-5 h-5 rounded border-border-color bg-surface-2 text-primary opacity-50 cursor-not-allowed" />
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="font-medium text-text-primary">Project Activity</p>
                <p className="text-sm text-text-muted">Messages, milestones, and project updates.</p>
              </div>
              <input type="checkbox" checked={emailNotifs} onChange={(e) => setEmailNotifs(e.target.checked)} className="w-5 h-5 rounded border-border-color bg-surface text-primary focus:ring-primary focus:ring-offset-background" />
            </label>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Smartphone className="w-5 h-5" /> Push Notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="font-medium text-text-primary">Direct Messages</p>
                <p className="text-sm text-text-muted">Get instantly notified when someone messages you.</p>
              </div>
              <input type="checkbox" checked={pushNotifs} onChange={(e) => setPushNotifs(e.target.checked)} className="w-5 h-5 rounded border-border-color bg-surface text-primary focus:ring-primary focus:ring-offset-background" />
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="font-medium text-text-primary">Marketing & Promos</p>
                <p className="text-sm text-text-muted">Special offers, new features, and tips.</p>
              </div>
              <input type="checkbox" checked={marketingNotifs} onChange={(e) => setMarketingNotifs(e.target.checked)} className="w-5 h-5 rounded border-border-color bg-surface text-primary focus:ring-primary focus:ring-offset-background" />
            </label>
          </CardContent>
        </Card>

        <div className="flex justify-end pt-4">
          <Button onClick={handleSave} className="gap-2">
            <Save className="w-4 h-4" /> Save Preferences
          </Button>
        </div>
      </div>
    </div>
  );
}
