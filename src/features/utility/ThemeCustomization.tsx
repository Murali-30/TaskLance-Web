import { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Sun, Moon, Monitor, Check } from 'lucide-react';

const colors = [
  { name: 'Violet', value: '#6C47FF', from: 'from-[#6C47FF]', to: 'to-[#FF6B35]' },
  { name: 'Blue', value: '#3B82F6', from: 'from-blue-500', to: 'to-cyan-400' },
  { name: 'Green', value: '#10B981', from: 'from-emerald-500', to: 'to-teal-400' },
  { name: 'Rose', value: '#F43F5E', from: 'from-rose-500', to: 'to-orange-400' },
  { name: 'Amber', value: '#F59E0B', from: 'from-amber-500', to: 'to-yellow-400' },
  { name: 'Indigo', value: '#6366F1', from: 'from-indigo-500', to: 'to-purple-400' },
];

export default function ThemeCustomization() {
  const { theme, setTheme } = useTheme();
  const [activeColor, setActiveColor] = useState(colors[0].name);

  // In a real app we'd update CSS variables here
  const handleColorChange = (colorName: string) => {
    setActiveColor(colorName);
  };

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold mb-2">Appearance</h1>
        <p className="text-text-muted">Customize how TaskLance looks on your device.</p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Theme Mode</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => setTheme('light')}
                className={`p-4 rounded-xl border-2 flex flex-col items-center gap-3 transition-colors ${
                  theme === 'light' ? 'border-primary bg-primary/5' : 'border-border-color hover:bg-surface-2'
                }`}
              >
                <div className="p-3 bg-surface-2 rounded-full"><Sun className="w-6 h-6" /></div>
                <span className="font-medium">Light</span>
              </button>
              
              <button
                onClick={() => setTheme('dark')}
                className={`p-4 rounded-xl border-2 flex flex-col items-center gap-3 transition-colors ${
                  theme === 'dark' ? 'border-primary bg-primary/5' : 'border-border-color hover:bg-surface-2'
                }`}
              >
                <div className="p-3 bg-surface-2 rounded-full"><Moon className="w-6 h-6" /></div>
                <span className="font-medium">Dark</span>
              </button>

              <button
                onClick={() => setTheme('system')}
                className={`p-4 rounded-xl border-2 flex flex-col items-center gap-3 transition-colors ${
                  theme === 'system' ? 'border-primary bg-primary/5' : 'border-border-color hover:bg-surface-2'
                }`}
              >
                <div className="p-3 bg-surface-2 rounded-full"><Monitor className="w-6 h-6" /></div>
                <span className="font-medium">System</span>
              </button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Accent Color</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              {colors.map((c) => (
                <button
                  key={c.name}
                  onClick={() => handleColorChange(c.name)}
                  className={`relative w-14 h-14 rounded-full flex items-center justify-center transition-transform hover:scale-110 ${
                    activeColor === c.name ? 'ring-2 ring-offset-4 ring-offset-background ring-text-primary' : ''
                  }`}
                  style={{ backgroundColor: c.value }}
                >
                  {activeColor === c.name && <Check className="w-6 h-6 text-white drop-shadow-md" />}
                </button>
              ))}
            </div>
            
            <div className="mt-8 p-6 rounded-xl border border-border-color bg-surface-2">
              <p className="text-sm text-text-muted mb-4 font-medium uppercase tracking-wider">Preview</p>
              <div className="flex items-center gap-4">
                <Button>Primary Button</Button>
                <div className={`text-transparent bg-clip-text bg-gradient-to-r ${colors.find(c => c.name === activeColor)?.from} ${colors.find(c => c.name === activeColor)?.to} font-bold text-xl`}>
                  Gradient Text
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
