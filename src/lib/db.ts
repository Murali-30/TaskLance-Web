import { collection, doc, getDocs, getDoc, setDoc, addDoc, query, where, updateDoc, onSnapshot, arrayUnion } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';

export async function getProjects() {
  const projectsRef = collection(db, 'projects');
  // Order by createdAt desc, but we'll sort locally to avoid needing compound indexes immediately
  const q = query(projectsRef);
  const snapshot = await getDocs(q);
  
  const projects = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as any[];
  
  return projects.sort((a, b) => b.createdAt - a.createdAt);
}

export async function getProject(projectId: string) {
  const docRef = doc(db, 'projects', projectId);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as any;
  }
  return null;
}

export async function getUser(userId: string) {
  const docRef = doc(db, 'users', userId);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as any;
  }
  return null;
}

export async function getUsers(roleFilter?: string) {
  const usersRef = collection(db, 'users');
  let q = query(usersRef);
  if (roleFilter) {
    q = query(usersRef, where('role', '==', roleFilter));
  }
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
}

export async function createProject(projectData: any) {
  // Use setDoc with a custom ID (like mockData did) or let Firestore generate one
  const docId = `p${Date.now()}`;
  await setDoc(doc(db, 'projects', docId), projectData);
  return docId;
}

export async function getProposals(projectId: string) {
  const proposalsRef = collection(db, 'proposals');
  const q = query(proposalsRef, where('projectId', '==', projectId));
  const snapshot = await getDocs(q);
  
  const proposals = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as any[];
  
  return proposals.sort((a, b) => b.createdAt - a.createdAt);
}

export async function createProposal(proposalData: any) {
  const docId = `pr${Date.now()}`;
  await setDoc(doc(db, 'proposals', docId), proposalData);
  return docId;
}

export async function acceptProposal(projectId: string, proposalId: string, freelancerId: string) {
  // Update Project
  await updateDoc(doc(db, 'projects', projectId), {
    status: 'in-progress',
    acceptedProposalId: proposalId,
    freelancerId: freelancerId
  });
  
  // Update Proposal
  await updateDoc(doc(db, 'proposals', proposalId), {
    status: 'accepted'
  });
}

export async function createChat(clientId: string, freelancerId: string, projectId: string, initialMessage: string) {
  const conversationsRef = collection(db, 'conversations');
  const chatDocRef = await addDoc(conversationsRef, {
    participants: [clientId, freelancerId],
    projectId: projectId,
    updatedAt: Date.now()
  });

  const messagesRef = collection(db, 'messages');
  await addDoc(messagesRef, {
    conversationId: chatDocRef.id,
    senderId: clientId,
    text: initialMessage,
    timestamp: Date.now()
  });

  return chatDocRef.id;
}

export async function getChats(userId: string) {
  const conversationsRef = collection(db, 'conversations');
  const q = query(conversationsRef, where('participants', 'array-contains', userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
}

export async function getMessages(conversationId: string) {
  const messagesRef = collection(db, 'messages');
  const q = query(messagesRef, where('conversationId', '==', conversationId));
  const snapshot = await getDocs(q);
  const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
  return msgs.sort((a, b) => a.timestamp - b.timestamp);
}

export async function sendMessage(conversationId: string, senderId: string, text: string) {
  const messagesRef = collection(db, 'messages');
  await addDoc(messagesRef, {
    conversationId,
    senderId,
    text,
    timestamp: Date.now()
  });
  
  await updateDoc(doc(db, 'conversations', conversationId), {
    updatedAt: Date.now()
  });
}

// Notifications
export async function createNotification(title: string, message: string, targetRole?: string, targetUserId?: string) {
  const notificationsRef = collection(db, 'notifications');
  await addDoc(notificationsRef, {
    title,
    message,
    targetRole: targetRole || null,
    targetUserId: targetUserId || null,
    timestamp: Date.now(),
    readBy: []
  });
}

export function subscribeToNotifications(userId: string, role: string, callback: (notifications: any[]) => void) {
  const notificationsRef = collection(db, 'notifications');
  // In a real app we might need compound queries, but for simplicity we'll fetch recently created ones and filter
  // We want notifications where targetUserId == userId OR targetRole == role
  const q = query(notificationsRef);
  
  return onSnapshot(q, (snapshot) => {
    const allNotifs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
    
    // Filter locally because Firestore OR queries can be complex
    const relevantNotifs = allNotifs
      .filter(n => n.targetUserId === userId || n.targetRole === role)
      .sort((a, b) => b.timestamp - a.timestamp) // newest first
      .slice(0, 20); // keep it reasonable
      
    callback(relevantNotifs);
  });
}

export async function markNotificationRead(notificationId: string, userId: string) {
  const notifRef = doc(db, 'notifications', notificationId);
  await updateDoc(notifRef, {
    readBy: arrayUnion(userId)
  });
}

// Transactions
export async function getTransactions(userId: string) {
  const transactionsRef = collection(db, 'transactions');
  const q = query(transactionsRef, where('userId', '==', userId));
  const snapshot = await getDocs(q);
  const txs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
  return txs.sort((a, b) => b.createdAt - a.createdAt); // newest first
}

export async function createTransaction(userId: string, amount: number, description: string, status: string = 'paid') {
  const transactionsRef = collection(db, 'transactions');
  await addDoc(transactionsRef, {
    userId,
    amount,
    description,
    status,
    createdAt: Date.now()
  });
}

// Invoices
export async function createInvoice(projectId: string, freelancerId: string, clientId: string, amount: number, description: string) {
  const invoicesRef = collection(db, 'invoices');
  const invoiceDocRef = await addDoc(invoicesRef, {
    projectId,
    freelancerId,
    clientId,
    amount,
    description,
    status: 'pending',
    createdAt: Date.now()
  });
  return invoiceDocRef.id;
}

export async function getProjectInvoices(projectId: string) {
  const invoicesRef = collection(db, 'invoices');
  const q = query(invoicesRef, where('projectId', '==', projectId));
  const snapshot = await getDocs(q);
  const invoices = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
  return invoices.sort((a, b) => b.createdAt - a.createdAt);
}

export async function payInvoice(invoiceId: string, clientId: string, freelancerId: string, amount: number, description: string) {
  // Update invoice status
  await updateDoc(doc(db, 'invoices', invoiceId), {
    status: 'paid',
    paidAt: Date.now()
  });

  // Create transaction for client (deduction)
  await createTransaction(clientId, -amount, `Paid Invoice: ${description}`, 'completed');

  // Create transaction for freelancer (deposit)
  await createTransaction(freelancerId, amount, `Payment Received: ${description}`, 'completed');
  
  // Create notifications
  await createNotification('Payment Sent', `You paid $${amount} for invoice: ${description}`, undefined, clientId);
  await createNotification('Payment Received', `You received $${amount} for invoice: ${description}`, undefined, freelancerId);
}

// Deliverables
export async function createDeliverable(projectId: string, freelancerId: string, description: string, files: string[]) {
  const deliverablesRef = collection(db, 'deliverables');
  const deliverableDocRef = await addDoc(deliverablesRef, {
    projectId,
    freelancerId,
    description,
    files,
    status: 'pending_review',
    createdAt: Date.now()
  });
  return deliverableDocRef.id;
}

export async function getProjectDeliverables(projectId: string) {
  const deliverablesRef = collection(db, 'deliverables');
  const q = query(deliverablesRef, where('projectId', '==', projectId));
  const snapshot = await getDocs(q);
  const deliverables = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
  return deliverables.sort((a, b) => b.createdAt - a.createdAt);
}

export async function updateDeliverableStatus(deliverableId: string, status: string) {
  const deliverableRef = doc(db, 'deliverables', deliverableId);
  await updateDoc(deliverableRef, {
    status
  });
}

// Kanban Tasks
export async function createTask(projectId: string, title: string, columnId: string, assignee: string = 'unassigned') {
  const tasksRef = collection(db, 'tasks');
  await addDoc(tasksRef, {
    projectId,
    title,
    columnId,
    assignee,
    createdAt: Date.now()
  });
}

export async function getProjectTasks(projectId: string) {
  const tasksRef = collection(db, 'tasks');
  const q = query(tasksRef, where('projectId', '==', projectId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
}

export async function updateTaskStatus(taskId: string, columnId: string) {
  const taskRef = doc(db, 'tasks', taskId);
  await updateDoc(taskRef, { columnId });
}

// File Uploads
export async function uploadChatAttachment(file: File, conversationId: string): Promise<string> {
  const storageRef = ref(storage, `chat_attachments/${conversationId}/${Date.now()}_${file.name}`);
  await uploadBytes(storageRef, file);
  return await getDownloadURL(storageRef);
}

export async function uploadDeliverableFile(file: File, projectId: string): Promise<string> {
  const storageRef = ref(storage, `deliverables/${projectId}/${Date.now()}_${file.name}`);
  await uploadBytes(storageRef, file);
  return await getDownloadURL(storageRef);
}

// Global cleanup hook for E2E tests (only available in development)
if (import.meta.env.DEV) {
  (window as any).__cleanupTestData = async () => {
    try {
      const { deleteDoc } = await import('firebase/firestore');
      
      // Clean up projects
      const projectsRef = collection(db, 'projects');
      const projectsSnap = await getDocs(projectsRef);
      for (const d of projectsSnap.docs) {
        const data = d.data();
        if (data.title?.includes('Test Project') || data.clientId?.includes('client') || data.freelancerId?.includes('freelancer')) {
          await deleteDoc(doc(db, 'projects', d.id));
        }
      }

      // Clean up proposals
      const proposalsRef = collection(db, 'proposals');
      const proposalsSnap = await getDocs(proposalsRef);
      for (const d of proposalsSnap.docs) {
        const data = d.data();
        if (data.freelancerId?.includes('fiona') || data.freelancerId?.includes('alice')) {
          await deleteDoc(doc(db, 'proposals', d.id));
        }
      }
      
      console.log('Cleanup completed successfully');
      return true;
    } catch (e) {
      console.error('Cleanup failed:', e);
      return false;
    }
  };
}
