import type { Role } from '../context/AuthContext';

export interface User { id: string; name: string; email: string; role: Role; avatar?: string; }
export interface Milestone { id: string; title: string; amount: number; status: string; }
export interface Project { id: string; title: string; description: string; category: string; skills: string[]; budgetType: string; budget: number; status: string; clientId: string; freelancerId?: string; deadline: string; milestones: Milestone[]; }
export interface Transaction { id: string; date: string; project: string; amount: number; status: string; }
export interface Message { id: string; senderId: string; text: string; timestamp: string; }
export interface Proposal { id: string; projectId: string; freelancerId: string; coverLetter: string; bidAmount: number; status: 'pending' | 'accepted' | 'rejected'; }
export interface Chat { id: string; participants: string[]; messages: Message[]; }

const loadFromStorage = <T>(key: string, defaultValue: T): T => {
  const stored = localStorage.getItem(key);
  if (stored) return JSON.parse(stored);
  return defaultValue;
};

export const saveToStorage = (key: string, data: any) => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const mockUsers: User[] = loadFromStorage('tasklance_users', []);
export const mockProjects: Project[] = loadFromStorage('tasklance_projects', []);
export const mockTransactions: Transaction[] = loadFromStorage('tasklance_transactions', []);
export const mockChats: Chat[] = loadFromStorage('tasklance_chats', []);
export const mockProposals: Proposal[] = loadFromStorage('tasklance_proposals', []);

export const persistMockData = () => {
  saveToStorage('tasklance_users', mockUsers);
  saveToStorage('tasklance_projects', mockProjects);
  saveToStorage('tasklance_transactions', mockTransactions);
  saveToStorage('tasklance_chats', mockChats);
  saveToStorage('tasklance_proposals', mockProposals);
};
