import { useSearchParams, Link } from 'react-router-dom';
import { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent } from '../../components/ui/Card';
import { getProjects, getUsers } from '../../lib/db';
import { Search, MapPin, Star, Clock, Filter, ChevronDown, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const { role } = useAuth();
  
  // Default active tab based on user role
  const [activeTab, setActiveTab] = useState<'projects' | 'freelancers'>(
    role === 'client' ? 'freelancers' : 'projects'
  );

  const [projects, setProjects] = useState<any[]>([]);
  const [freelancers, setFreelancers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSearchData = async () => {
      try {
        const [pData, uData] = await Promise.all([
          getProjects(),
          getUsers('freelancer')
        ]);
        setProjects(pData);
        setFreelancers(uData);
      } catch (err) {
        console.error('Failed to fetch search data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSearchData();
  }, []);

  const filteredProjects = useMemo(() => {
    const lowerQ = query.toLowerCase();
    return projects.filter(p => 
      p.title?.toLowerCase().includes(lowerQ) || 
      p.category?.toLowerCase().includes(lowerQ) ||
      (p.skills || []).some((s: string) => s.toLowerCase().includes(lowerQ))
    );
  }, [query, projects]);

  const filteredFreelancers = useMemo(() => {
    const lowerQ = query.toLowerCase();
    return freelancers.filter(f => 
      f.name?.toLowerCase().includes(lowerQ) || 
      f.role?.toLowerCase().includes(lowerQ) ||
      (f.skills || []).some((s: string) => s.toLowerCase().includes(lowerQ))
    );
  }, [query, freelancers]);

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold mb-2">Search Results</h1>
        <p className="text-text-muted flex items-center gap-2">
          <Search className="w-4 h-4" /> 
          Showing results for <span className="text-primary font-medium">"{query}"</span>
        </p>
      </div>

      {/* Tabs & Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex bg-surface border border-border-color p-1 rounded-xl w-full sm:w-auto overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('projects')}
            className={`px-6 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
              activeTab === 'projects'
                ? 'bg-primary text-white shadow-md'
                : 'text-text-muted hover:text-text-primary hover:bg-surface-2'
            }`}
          >
            Projects ({filteredProjects.length})
          </button>
          <button
            onClick={() => setActiveTab('freelancers')}
            className={`px-6 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
              activeTab === 'freelancers'
                ? 'bg-primary text-white shadow-md'
                : 'text-text-muted hover:text-text-primary hover:bg-surface-2'
            }`}
          >
            Freelancers ({filteredFreelancers.length})
          </button>
        </div>

        <Button variant="outline" className="gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4" /> Filters <ChevronDown className="w-3 h-3 ml-1" />
        </Button>
      </div>

      {/* Results Content */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : activeTab === 'projects' ? (
        <div className="space-y-4">
          {filteredProjects.length > 0 ? (
            filteredProjects.map((project) => (
              <Link to={`/projects/${project.id}`} key={project.id} className="block group">
                <Card className="hover:border-primary/50 transition-colors bg-surface hover:bg-surface-2">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row justify-between gap-6">
                      <div className="space-y-3">
                        <div>
                          <h3 className="text-xl font-semibold font-display group-hover:text-primary transition-colors">
                            {project.title}
                          </h3>
                          <p className="text-sm text-text-muted">{project.category}</p>
                        </div>
                        <p className="text-text-primary line-clamp-2">{project.description}</p>
                        <div className="flex flex-wrap gap-2">
                          {(project.skills || []).map((skill: string) => (
                            <span key={skill} className="px-2.5 py-1 rounded-md bg-background border border-border-color text-xs font-medium">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-start md:items-end gap-2 md:min-w-[120px]">
                        <div className="text-left md:text-right">
                          <p className="text-lg font-mono font-bold">${project.budget}</p>
                          <p className="text-xs text-text-muted flex items-center justify-start md:justify-end gap-1 mt-1">
                            <Clock className="w-3 h-3" /> {project.deadline}
                          </p>
                        </div>
                        <span className="mt-auto px-3 py-1 rounded-full text-xs font-medium bg-surface-2">
                          {project.status}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          ) : (
            <div className="text-center py-20 bg-surface border border-dashed border-border-color rounded-2xl">
              <Search className="w-12 h-12 text-text-muted mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No projects found</h3>
              <p className="text-text-muted">Try adjusting your search query or filters.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredFreelancers.length > 0 ? (
            filteredFreelancers.map((freelancer) => (
              <Card key={freelancer.id} className="hover:border-primary/50 transition-colors bg-surface">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold text-lg shadow-inner">
                        {freelancer.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg hover:text-primary cursor-pointer transition-colors">{freelancer.name}</h3>
                        <p className="text-sm text-text-muted">{freelancer.role}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-bold text-primary">{freelancer.rate}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-text-muted mb-4">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-warning text-warning" />
                      <span className="font-medium text-text-primary">{freelancer.rating}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {freelancer.location}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-4 border-t border-border-color">
                    {(freelancer.skills || []).map((skill: string) => (
                      <span key={skill} className="px-2 py-1 rounded-md bg-surface-2 text-xs font-medium text-text-primary">
                        {skill}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-1 md:col-span-2 text-center py-20 bg-surface border border-dashed border-border-color rounded-2xl">
              <Search className="w-12 h-12 text-text-muted mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No freelancers found</h3>
              <p className="text-text-muted">Try searching for different skills or roles.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
