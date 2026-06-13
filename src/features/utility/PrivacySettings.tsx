import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';

export default function PrivacySettings() {
  const [settings, setSettings] = useState({
    profileVisibility: true,
    onlineStatus: true,
    readReceipts: false,
    dataSharing: true,
  });

  const toggle = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold mb-2">Privacy & Security</h1>
        <p className="text-text-muted">Control your visibility and how your data is used.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Privacy Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Public Profile</h3>
              <p className="text-sm text-text-muted">Allow your profile to be found in search engines</p>
            </div>
            <button 
              onClick={() => toggle('profileVisibility')}
              className={`w-12 h-6 rounded-full transition-colors relative ${settings.profileVisibility ? 'bg-primary' : 'bg-surface-2 border border-border-color'}`}
            >
              <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${settings.profileVisibility ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Online Status</h3>
              <p className="text-sm text-text-muted">Show others when you are actively using TaskLance</p>
            </div>
            <button 
              onClick={() => toggle('onlineStatus')}
              className={`w-12 h-6 rounded-full transition-colors relative ${settings.onlineStatus ? 'bg-primary' : 'bg-surface-2 border border-border-color'}`}
            >
              <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${settings.onlineStatus ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Read Receipts</h3>
              <p className="text-sm text-text-muted">Let senders know when you have read their messages</p>
            </div>
            <button 
              onClick={() => toggle('readReceipts')}
              className={`w-12 h-6 rounded-full transition-colors relative ${settings.readReceipts ? 'bg-primary' : 'bg-surface-2 border border-border-color'}`}
            >
              <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${settings.readReceipts ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
