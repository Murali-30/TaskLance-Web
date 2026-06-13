import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { getProjects } from '../../lib/db';
import { Plus, Briefcase, DollarSign, Clock, ArrowRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { user, role } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await getProjects();
        // If client, only show their projects. If freelancer, show all.
        const filtered = data.filter(p => role === 'client' ? p.clientId === user?.id : true);
        setProjects(filtered);
      } catch (err) {
        console.error("Failed to fetch projects", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);
  
  const StatCard = ({ title, value, icon: Icon, trend }: any) => (
    <Card>
      <CardContent className="p-6 flex items-center justify-between">
        <div>
          <p className="text-sm text-text-muted font-medium mb-1">{title}</p>
          <h3 className="text-3xl font-display font-bold">{value}</h3>
          {trend && <p className="text-xs text-success mt-1">{trend}</p>}
        </div>
        <div className="w-12 h-12 rounded-xl bg-surface-2 flex items-center justify-center text-primary">
          <Icon className="w-6 h-6" />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-3xl font-display font-bold mb-1">Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="text-text-muted">Here's what's happening with your projects today.</p>
        </motion.div>
        
        {role === 'client' && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <Link to="/projects/create">
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Post New Project
              </Button>
            </Link>
          </motion.div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {role === 'freelancer' ? (
          <>
            <StatCard title="Active Projects" value="3" icon={Briefcase} trend="+1 this week" />
            <StatCard title="Available Balance" value="$1,250" icon={DollarSign} />
            <StatCard title="Pending Approvals" value="2" icon={Clock} />
          </>
        ) : (
          <>
            <StatCard title="Total Spent" value="$4,500" icon={DollarSign} />
            <StatCard title="Active Projects" value="2" icon={Briefcase} />
            <StatCard title="Milestones to Review" value="1" icon={Clock} trend="Needs attention" />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Projects</CardTitle>
            <Link to="/projects" className="text-sm text-primary hover:underline font-medium flex items-center">
              View All <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading ? (
                <div className="flex justify-center p-8">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : projects.length === 0 ? (
                <div className="text-center p-8 text-text-muted">
                  No projects found.
                </div>
              ) : (
                projects.slice(0, 3).map((project) => (
                  <Link 
                    key={project.id} 
                    to={`/projects/${project.id}`}
                    className="block p-4 rounded-xl border border-border-color bg-surface hover:bg-surface-2 transition-colors flex flex-col md:flex-row justify-between gap-4 cursor-pointer"
                  >
                    <div>
                      <h4 className="font-semibold text-lg hover:text-primary transition-colors">{project.title}</h4>
                      <p className="text-sm text-text-muted">{project.category} • Due {project.deadline || 'TBD'}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-mono font-medium">${project.budget}</p>
                        <span className={`text-xs px-2 py-1 rounded-full ${project.status?.toLowerCase() === 'in-progress' || project.status?.toLowerCase() === 'in progress' ? 'bg-primary/10 text-primary' : project.status?.toLowerCase() === 'open' ? 'bg-success/10 text-success' : 'bg-surface-2 text-text-muted'}`}>
                          {project.status || 'open'}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Activity Feed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative pl-4 border-l-2 border-surface-2 space-y-6">
              {[
                { time: '2 hours ago', text: 'Alice submitted "Wireframes" for review.' },
                { time: 'Yesterday', text: 'Payment of $500 processed for Project Alpha.' },
                { time: 'Yesterday', text: 'Bob sent you a new message.' },
              ].map((activity, idx) => (
                <div key={idx} className="relative">
                  <div className="absolute -left-[21px] w-3 h-3 rounded-full bg-primary ring-4 ring-background" />
                  <p className="text-sm text-text-primary">{activity.text}</p>
                  <p className="text-xs text-text-muted mt-1">{activity.time}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
