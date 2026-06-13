import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Link } from 'lucide-react';

export default function AboutApplication() {
  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto w-full">
      <div className="text-center mb-12">
        <div className="w-20 h-20 rounded-2xl bg-gradient-primary flex items-center justify-center mx-auto mb-6 shadow-xl">
          <span className="text-white text-5xl font-bold font-display">T</span>
        </div>
        <h1 className="text-3xl font-display font-bold mb-2">TaskLance</h1>
        <p className="text-text-muted">Version 1.0.0 (Build 2026.06.12)</p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Tech Stack</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {['React', 'TypeScript', 'Vite', 'Tailwind CSS v4', 'Framer Motion', 'React Router v6', 'Lucide React', 'Recharts'].map(tech => (
                <div key={tech} className="px-3 py-1.5 rounded-lg bg-surface-2 text-sm font-medium border border-border-color">
                  {tech}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>The Team</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-text-muted mb-4">Built with passion by the TaskLance founding team to revolutionize the way talent meets opportunity worldwide.</p>
            
            <div className="flex gap-4 mt-6">
              <a href="#" className="p-2 rounded-full bg-surface-2 text-text-muted hover:text-primary transition-colors">
                <Link className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 rounded-full bg-surface-2 text-text-muted hover:text-[#1DA1F2] transition-colors">
                <Link className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 rounded-full bg-surface-2 text-text-muted hover:text-[#0A66C2] transition-colors">
                <Link className="w-5 h-5" />
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
