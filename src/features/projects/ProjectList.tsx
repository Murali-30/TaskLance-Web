import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getProjects } from '../../lib/db';
import { Card, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Search, Filter, Plus, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function ProjectList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { role, user } = useAuth();
  
  const tabs = ['All', 'In Progress', 'Open', 'Completed'];

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await getProjects();
        setProjects(data);
      } catch (err) {
        console.error("Failed to fetch projects", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const filteredProjects = projects.filter((project) => {
    // If client, only show their projects. If freelancer, show all.
    const isClientMatch = role === 'client' ? project.clientId === user?.id : true;
    const matchesSearch = project.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (project.skills || []).some((s: string) => s.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Normalize status strings for comparison (case-insensitive)
    const pStatus = (project.status || 'open').toLowerCase();
    const tStatus = activeTab.toLowerCase();
    
    const matchesTab = activeTab === 'All' || 
                       (tStatus === 'in progress' && pStatus === 'in-progress') ||
                       (tStatus === 'open' && pStatus === 'open');
                       
    return isClientMatch && matchesSearch && matchesTab;
  });

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold mb-2">Projects</h1>
          <p className="text-text-muted">Manage your projects and discover new opportunities.</p>
        </div>
        {role === 'client' && (
          <Link to="/projects/create">
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Post New Project
            </Button>
          </Link>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1">
          <Input 
            placeholder="Search projects by title or skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search className="w-5 h-5" />}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-colors ${
                activeTab === tab
                  ? 'bg-surface-2 text-primary shadow-sm border border-border-color'
                  : 'text-text-muted hover:text-text-primary hover:bg-surface/50'
              }`}
            >
              {tab}
            </button>
          ))}
          <Button variant="outline" className="gap-2 shrink-0">
            <Filter className="w-4 h-4" /> Filters
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-12 text-text-muted">
            <p className="text-lg">No projects found matching your criteria.</p>
          </div>
        ) : (
          filteredProjects.map((project) => (
            <Link key={project.id} to={`/projects/${project.id}`} className="block">
            <Card className="hover:border-primary/50 transition-colors">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-xl font-display font-semibold hover:text-primary transition-colors">{project.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium shrink-0 capitalize ${
                        project.status?.toLowerCase() === 'in-progress' || project.status?.toLowerCase() === 'in progress' ? 'bg-primary/10 text-primary' :
                        project.status?.toLowerCase() === 'open' ? 'bg-success/10 text-success' : 'bg-surface-2 text-text-muted'
                      }`}>
                        {project.status?.replace('-', ' ')}
                      </span>
                    </div>
                    <p className="text-text-muted mb-4 line-clamp-2">{project.description}</p>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-text-muted mb-4 md:mb-0">
                      <span className="font-medium text-text-primary">{project.budgetType} Budget: ${project.budget}</span>
                      <span>•</span>
                      <span>Due {project.deadline}</span>
                    </div>
                  </div>
                  
                  <div className="md:w-48 shrink-0 border-t md:border-t-0 md:border-l border-border-color pt-4 md:pt-0 md:pl-4 flex flex-col justify-between">
                    <div>
                      <p className="text-sm font-medium mb-2">Skills Needed:</p>
                      <div className="flex flex-wrap gap-1">
                        {(project.skills || []).map((skill: string) => (
                          <span key={skill} className="text-xs px-2 py-1 bg-surface-2 rounded-md">{skill}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
          ))
        )}
      </div>
    </div>
  );
}
