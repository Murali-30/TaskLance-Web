import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Bell, Lock, CreditCard, Palette, HelpCircle, FileText, Info, ChevronRight } from 'lucide-react';
import { Card } from '../../components/ui/Card';

export default function Settings() {
  const settingGroups = [
    {
      title: 'Preferences',
      items: [
        { name: 'Account', icon: User, path: '/profile', desc: 'Manage your personal information' },
        { name: 'Appearance', icon: Palette, path: '/settings/appearance', desc: 'Customize theme and colors' },
        { name: 'Notifications', icon: Bell, path: '/settings/notifications', desc: 'Choose what you get notified about' },
      ]
    },
    {
      title: 'Security & Billing',
      items: [
        { name: 'Privacy & Security', icon: Lock, path: '/settings/privacy', desc: 'Control your visibility and data' },
        { name: 'Payment Methods', icon: CreditCard, path: '/wallet', desc: 'Manage cards and billing history' },
      ]
    },
    {
      title: 'About TaskLance',
      items: [
        { name: 'Help & Support', icon: HelpCircle, path: '/support', desc: 'Get help with your account' },
        { name: 'Terms & Conditions', icon: FileText, path: '/terms', desc: 'Read our platform rules' },
        { name: 'About Application', icon: Info, path: '/about', desc: 'Version info and credits' },
      ]
    }
  ];

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto w-full">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-display font-bold mb-2">Settings</h1>
        <p className="text-text-muted">Manage your account preferences and application settings.</p>
      </motion.div>

      <div className="space-y-8">
        {settingGroups.map((group, groupIdx) => (
          <motion.div 
            key={group.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: groupIdx * 0.1 }}
          >
            <h2 className="text-lg font-semibold mb-4 px-1">{group.title}</h2>
            <Card className="overflow-hidden p-0">
              <div className="divide-y divide-border-color">
                {group.items.map((item) => (
                  <Link 
                    key={item.name} 
                    to={item.path}
                    className="flex items-center p-4 hover:bg-surface-2 transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-surface-2 flex items-center justify-center text-text-muted group-hover:text-primary group-hover:bg-primary/10 transition-colors">
                      <item.icon className="w-5 h-5" />
                    </div>
                    <div className="ml-4 flex-1">
                      <h3 className="font-medium text-text-primary group-hover:text-primary transition-colors">{item.name}</h3>
                      <p className="text-sm text-text-muted">{item.desc}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-border-color group-hover:text-primary transition-colors" />
                  </Link>
                ))}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
