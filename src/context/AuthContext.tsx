import type { ReactNode } from 'react';
import { createContext, useContext, useState, useEffect } from 'react';

export type Role = 'freelancer' | 'client' | null;

interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  role: Role;
  login: (userData: User) => void;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
  setRole: (role: Role) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRoleState] = useState<Role>(null);

  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    import('../lib/firebase').then(({ auth, db }) => {
      import('firebase/auth').then(({ onAuthStateChanged }) => {
        import('firebase/firestore').then(({ doc, getDoc }) => {
          const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            // Check if current user is an E2E bypass user
            const stored = localStorage.getItem('tasklance_user');
            if (stored) {
              try {
                const parsed = JSON.parse(stored);
                if (parsed.email && parsed.email.endsWith('@example.com')) {
                  // Do not let Firebase overwrite E2E test session
                  setUser(parsed);
                  setRoleState(parsed.role);
                  setIsInitializing(false);
                  return;
                }
              } catch (e) {}
            }

            if (firebaseUser) {
              const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
              const userData = userDoc.exists() ? userDoc.data() : {};
              
              const appUser = {
                id: firebaseUser.uid,
                name: userData.name || firebaseUser.displayName || 'User',
                email: firebaseUser.email || '',
                role: (userData.role || 'freelancer') as Role,
                avatar: userData.avatar || `https://i.pravatar.cc/150?u=${firebaseUser.email}`
              };
              
              setUser(appUser);
              setRoleState(appUser.role);
              localStorage.setItem('tasklance_user', JSON.stringify(appUser));
              setIsInitializing(false);
            } else {
              setUser(null);
              setRoleState(null);
              localStorage.removeItem('tasklance_user');
              setIsInitializing(false);
            }
          });
          return () => unsubscribe();
        });
      });
    });
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    setRoleState(userData.role);
    localStorage.setItem('tasklance_user', JSON.stringify(userData));
  };

  const logout = async () => {
    const { auth } = await import('../lib/firebase');
    const { signOut } = await import('firebase/auth');
    await signOut(auth);
    setUser(null);
    setRoleState(null);
    localStorage.removeItem('tasklance_user');
  };

  const updateUser = (data: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...data };
      localStorage.setItem('tasklance_user', JSON.stringify(updated));
      return updated;
    });
  };

  const setRole = (newRole: Role) => {
    setRoleState(newRole);
    if (user) {
      const updatedUser = { ...user, role: newRole };
      setUser(updatedUser);
      localStorage.setItem('tasklance_user', JSON.stringify(updatedUser));
    }
  };

  if (isInitializing) {
    return <div className="min-h-screen bg-background flex items-center justify-center text-primary font-display font-semibold">Loading TaskLance...</div>;
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        login,
        logout,
        updateUser,
        setRole,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
