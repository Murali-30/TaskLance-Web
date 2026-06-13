import { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { MapPin, Globe, Calendar, Star, Edit2, Check, Link, Camera, Loader2 } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export default function Profile() {
  const { user, role, updateUser } = useAuth();
  const { addToast } = useToast();
  
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || 'Jane Doe');
  const [tagline, setTagline] = useState(role === 'freelancer' ? 'Full Stack Developer & UI Designer' : 'Product Manager at TechCorp');
  
  const [githubConnected, setGithubConnected] = useState(false);
  const [linkedinConnected, setLinkedinConnected] = useState(true);
  
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = async () => {
    setIsEditing(false);
    if (updateUser && user?.id) {
      updateUser({ name });
      try {
        await updateDoc(doc(db, 'users', user.id), { name });
      } catch (err) {
        console.error('Failed to update name in Firestore:', err);
      }
    }
    addToast('Profile updated successfully!', 'success');
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;

    if (!file.type.startsWith('image/')) {
      addToast('Please select an image file.', 'error');
      return;
    }
    
    // Check file size (limit to 1MB for local storage)
    if (file.size > 1024 * 1024) {
      addToast('Image must be less than 1MB', 'error');
      return;
    }

    setIsUploading(true);
    
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        
        // Update AuthContext (which saves to localStorage)
        if (updateUser) {
          updateUser({ avatar: base64String });
        }
        
        // Update Firestore
        await updateDoc(doc(db, 'users', user.id), { avatar: base64String });
        addToast('Profile photo updated!', 'success');
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      addToast(err.message || 'Failed to process photo.', 'error');
      setIsUploading(false);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const toggleConnection = (platform: 'github' | 'linkedin') => {
    if (platform === 'github') {
      setGithubConnected(!githubConnected);
      addToast(`GitHub ${!githubConnected ? 'connected' : 'disconnected'}.`, 'info');
    } else {
      setLinkedinConnected(!linkedinConnected);
      addToast(`LinkedIn ${!linkedinConnected ? 'connected' : 'disconnected'}.`, 'info');
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto w-full">
      <div className="relative mb-20">
        <div className="h-48 md:h-64 rounded-3xl bg-gradient-to-r from-[#6C47FF] to-[#FF6B35] relative overflow-hidden group">
          {isEditing && (
            <button className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white gap-2 font-medium">
              <Camera className="w-5 h-5" /> Change Cover
            </button>
          )}
        </div>
        
        <div className="absolute -bottom-16 left-8 md:left-12 flex items-end gap-6">
          <div className="relative group">
            <img 
              src={user?.avatar || "https://i.pravatar.cc/150?u=a042581f4e29026024d"} 
              alt={name} 
              className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-background object-cover bg-surface"
            />
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleAvatarChange} 
            />
            {isEditing && (
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white"
              >
                {isUploading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Camera className="w-6 h-6" />}
              </button>
            )}
            <div className="absolute bottom-2 right-2 w-5 h-5 bg-success border-2 border-background rounded-full" />
          </div>
          
          <div className="mb-4 hidden sm:block">
            {isEditing ? (
              <Input value={name} onChange={(e) => setName(e.target.value)} className="font-display font-bold text-3xl bg-transparent border-none text-white px-0 focus-visible:ring-0" />
            ) : (
              <h1 className="text-3xl font-display font-bold text-white drop-shadow-md">{name}</h1>
            )}
          </div>
        </div>
        
        <div className="absolute top-4 right-4 md:-bottom-4 md:top-auto md:right-8">
          {isEditing ? (
            <Button onClick={handleSave} className="gap-2 shadow-lg"><Check className="w-4 h-4" /> Save Profile</Button>
          ) : (
            <Button onClick={() => setIsEditing(true)} variant="outline" className="gap-2 bg-surface backdrop-blur-sm"><Edit2 className="w-4 h-4" /> Edit Profile</Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-6">
          <div className="sm:hidden mt-16 mb-6">
             <h1 className="text-3xl font-display font-bold">{name}</h1>
          </div>

          <Card>
            <CardContent className="p-6 space-y-4">
              <div>
                <h3 className="text-sm font-medium text-text-muted mb-1">About</h3>
                {isEditing ? (
                  <Input value={tagline} onChange={(e) => setTagline(e.target.value)} />
                ) : (
                  <p className="font-medium">{tagline}</p>
                )}
              </div>
              
              <div className="flex items-center gap-3 text-sm text-text-muted">
                <MapPin className="w-4 h-4" /> San Francisco, CA
              </div>
              <div className="flex items-center gap-3 text-sm text-text-muted">
                <Globe className="w-4 h-4" /> English, Spanish
              </div>
              <div className="flex items-center gap-3 text-sm text-text-muted">
                <Calendar className="w-4 h-4" /> Joined March 2024
              </div>

              {role === 'freelancer' && (
                <div className="pt-4 border-t border-border-color mt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-text-muted">Hourly Rate</span>
                    <span className="font-medium">$50.00/hr</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-text-muted">Job Success</span>
                    <div className="flex items-center gap-1 font-medium text-success">
                      <Star className="w-4 h-4 fill-success" /> 98%
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Linked Accounts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Link className="w-5 h-5 text-text-muted" />
                  <span className="font-medium">GitHub</span>
                </div>
                {githubConnected ? (
                  <Button variant="ghost" size="sm" onClick={() => toggleConnection('github')}>Disconnect</Button>
                ) : (
                  <Button variant="outline" size="sm" onClick={() => toggleConnection('github')}>Connect</Button>
                )}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Link className="w-5 h-5 text-[#0A66C2]" />
                  <span className="font-medium">LinkedIn</span>
                </div>
                {linkedinConnected ? (
                  <Button variant="ghost" size="sm" onClick={() => toggleConnection('linkedin')}>Disconnect</Button>
                ) : (
                  <Button variant="outline" size="sm" onClick={() => toggleConnection('linkedin')}>Connect</Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Overview</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <textarea 
                  className="w-full h-32 rounded-xl border border-border-color bg-surface px-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-all resize-none"
                  defaultValue="Passionate creator with 5+ years of experience building scalable web applications and intuitive user interfaces. I love turning complex problems into elegant solutions."
                />
              ) : (
                <p className="text-text-primary leading-relaxed">
                  Passionate creator with 5+ years of experience building scalable web applications and intuitive user interfaces. I love turning complex problems into elegant solutions.
                </p>
              )}
            </CardContent>
          </Card>

          {role === 'freelancer' && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Skills</CardTitle>
                {isEditing && <Button variant="outline" size="sm">Add Skill</Button>}
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {['React', 'TypeScript', 'Node.js', 'Figma', 'UI/UX Design', 'Tailwind CSS'].map(skill => (
                    <span key={skill} className="px-3 py-1.5 rounded-lg bg-surface-2 text-sm font-medium border border-border-color flex items-center gap-2">
                      {skill}
                      {isEditing && <button className="text-text-muted hover:text-error">&times;</button>}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
