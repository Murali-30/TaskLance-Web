import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { getProject, getProposals, createProposal, acceptProposal, createChat, getProjectInvoices, createInvoice, payInvoice, createDeliverable, getProjectDeliverables, updateDeliverableStatus } from '../../lib/db';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Calendar, DollarSign, Users, FileText, Activity, Send, CheckCircle, Loader2, UploadCloud } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { PaymentModal } from '../../components/ui/PaymentModal';

export default function ProjectDetails() {
  const { id } = useParams();
  const { role, user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  
  const [project, setProject] = useState<any>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [deliverables, setDeliverables] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('Overview');
  const [loading, setLoading] = useState(true);

  // Proposal State
  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);
  const [bidAmount, setBidAmount] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [proposals, setProposals] = useState<any[]>([]);

  // Invoice State
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [invoiceAmount, setInvoiceAmount] = useState('');
  const [invoiceDescription, setInvoiceDescription] = useState('');
  
  // Payment Modal State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [payingInvoice, setPayingInvoice] = useState<any>(null);

  // Deliverables State
  const [isDeliverableModalOpen, setIsDeliverableModalOpen] = useState(false);
  const [deliverableDescription, setDeliverableDescription] = useState('');
  const [deliverableFiles, setDeliverableFiles] = useState<File[]>([]);
  const [isSubmittingDeliverable, setIsSubmittingDeliverable] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!id) return;
      try {
        const pData = await getProject(id);
        setProject(pData);
        
        const propsData = await getProposals(id);
        setProposals(propsData);

        const invsData = await getProjectInvoices(id);
        setInvoices(invsData);

        const delivsData = await getProjectDeliverables(id);
        setDeliverables(delivsData);
      } catch (err) {
        console.error('Failed to load project details', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center mt-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-6 md:p-8 max-w-6xl mx-auto w-full text-center text-text-muted mt-20">
        <h2 className="text-2xl font-display font-semibold mb-2">Project Not Found</h2>
        <p>This project might have been deleted or does not exist.</p>
      </div>
    );
  }

  const baseTabs = ['Overview', 'Invoices', 'Files', 'Team', 'Activity'];
  const tabs = role === 'client' ? ['Overview', 'Proposals', 'Invoices', 'Files', 'Team', 'Activity'] : baseTabs;

  const handleGenerateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !project || !id) return;

    try {
      const amt = Number(invoiceAmount);
      if (isNaN(amt) || amt <= 0) throw new Error('Invalid amount');
      
      const invoiceId = await createInvoice(id, user.id, project.clientId, amt, invoiceDescription);
      const newInvoice = {
        id: invoiceId,
        projectId: id,
        freelancerId: user.id,
        clientId: project.clientId,
        amount: amt,
        description: invoiceDescription,
        status: 'pending',
        createdAt: Date.now()
      };
      setInvoices([newInvoice, ...invoices]);
      setIsInvoiceModalOpen(false);
      setInvoiceAmount('');
      setInvoiceDescription('');
      addToast('Invoice generated successfully.', 'success');
    } catch (err: any) {
      addToast(err.message || 'Failed to generate invoice.', 'error');
    }
  };

  const handlePaymentSuccess = async () => {
    if (!user || !payingInvoice) return;
    try {
      await payInvoice(payingInvoice.id, user.id, payingInvoice.freelancerId, payingInvoice.amount, payingInvoice.description || 'Project Invoice');
      setInvoices(invoices.map(inv => inv.id === payingInvoice.id ? { ...inv, status: 'paid' } : inv));
      addToast('Invoice paid successfully. Funds have been transferred.', 'success');
    } catch (err: any) {
      addToast('Failed to process payment.', 'error');
    } finally {
      setPayingInvoice(null);
    }
  };

  const handleSubmitDeliverableForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !project || !id) return;
    
    if (deliverableFiles.length === 0) {
      addToast('Please select at least one file to upload.', 'error');
      return;
    }

    setIsSubmittingDeliverable(true);
    try {
      // Simulate file upload delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const fileNames = deliverableFiles.map(f => f.name);
      const delivId = await createDeliverable(id, user.id, deliverableDescription, fileNames);
      
      const newDeliv = {
        id: delivId,
        projectId: id,
        freelancerId: user.id,
        description: deliverableDescription,
        files: fileNames,
        status: 'pending_review',
        createdAt: Date.now()
      };
      
      setDeliverables([newDeliv, ...deliverables]);
      setIsDeliverableModalOpen(false);
      setDeliverableDescription('');
      setDeliverableFiles([]);
      addToast('Deliverable submitted for review.', 'success');
    } catch (err: any) {
      addToast('Failed to submit deliverable.', 'error');
    } finally {
      setIsSubmittingDeliverable(false);
    }
  };

  const handleUpdateDeliverableStatus = async (deliverableId: string, status: string) => {
    try {
      await updateDeliverableStatus(deliverableId, status);
      setDeliverables(deliverables.map(d => d.id === deliverableId ? { ...d, status } : d));
      if (status === 'approved') {
        addToast('Deliverable approved!', 'success');
      } else {
        addToast('Changes requested on deliverable.', 'info');
      }
    } catch (err) {
      addToast('Failed to update deliverable status.', 'error');
    }
  };

  const handleSendProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !project) return;
    
    try {
      const newProposal = {
        projectId: project.id,
        freelancerId: user.id,
        coverLetter,
        bidAmount: Number(bidAmount),
        status: 'pending',
        createdAt: Date.now()
      };
      
      const propId = await createProposal(newProposal);
      setProposals([{ id: propId, ...newProposal }, ...proposals]);
      setIsProposalModalOpen(false);
      addToast('Proposal sent successfully!', 'success');
    } catch (err: any) {
      addToast(err.message || 'Failed to send proposal', 'error');
    }
  };

  const handleAcceptProposal = async (proposalId: string, freelancerId: string) => {
    if (!user || !project) return;
    try {
      await acceptProposal(project.id, proposalId, freelancerId);
      
      // Create a chat
      await createChat(
        user.id, 
        freelancerId, 
        project.id, 
        `Hi! I just accepted your proposal for "${project.title}". Let's get started!`
      );

      // Local state update
      setProject({ ...project, status: 'in-progress', freelancerId });
      setProposals(proposals.map(p => p.id === proposalId ? { ...p, status: 'accepted' } : p));
      addToast('Proposal accepted. Project is now In Progress!', 'success');
    } catch (err: any) {
      addToast(err.message || 'Failed to accept proposal', 'error');
    }
  };

  const isAssignedToMe = project.freelancerId === user?.id;
  const hasSubmittedProposal = proposals.some(p => p.freelancerId === user?.id);

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto w-full relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-display font-bold">{project.title}</h1>
            <span className="px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary capitalize">
              {project.status?.replace('-', ' ')}
            </span>
          </div>
          <p className="text-text-muted">{project.category} • Posted recently</p>
        </div>
        <div className="flex gap-3">
          {role === 'client' && <Button variant="outline">Edit Project</Button>}
          
          {role === 'freelancer' && isAssignedToMe && (
            <Button onClick={() => setIsDeliverableModalOpen(true)}>Submit Deliverable</Button>
          )}
          
          {role === 'freelancer' && !isAssignedToMe && !hasSubmittedProposal && (
            <Button onClick={() => setIsProposalModalOpen(true)} className="gap-2">
              <Send className="w-4 h-4" /> Send Proposal
            </Button>
          )}

          {role === 'freelancer' && !isAssignedToMe && hasSubmittedProposal && (
            <Button variant="outline" disabled className="gap-2 border-success text-success bg-success/10">
              <CheckCircle className="w-4 h-4" /> Proposal Sent
            </Button>
          )}
        </div>
      </div>

      <div className="flex overflow-x-auto gap-2 mb-8 pb-2 scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl font-medium transition-colors whitespace-nowrap ${
              activeTab === tab
                ? 'bg-surface-2 text-primary shadow-sm border border-border-color'
                : 'text-text-muted hover:text-text-primary hover:bg-surface/50'
            }`}
          >
            {tab}
            {tab === 'Proposals' && proposals.filter(p => p.status === 'pending').length > 0 && (
              <span className="ml-2 bg-primary text-white text-xs px-2 py-0.5 rounded-full">
                {proposals.filter(p => p.status === 'pending').length}
              </span>
            )}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'Overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-text-primary leading-relaxed">{project.description}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Skills Required</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {project.skills.map((skill: string) => (
                      <span key={skill} className="px-3 py-1 rounded-full bg-surface-2 text-sm font-medium border border-border-color">
                        {skill}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardContent className="p-6 space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-surface-2 flex items-center justify-center text-primary shrink-0">
                      <DollarSign className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm text-text-muted">Budget ({project.budgetType})</p>
                      <p className="font-semibold text-lg">${project.budget}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-surface-2 flex items-center justify-center text-primary shrink-0">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm text-text-muted">Deadline</p>
                      <p className="font-semibold text-lg">{project.deadline}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}

        {activeTab === 'Proposals' && role === 'client' && (
          <motion.div
            key="proposals"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {proposals.length === 0 ? (
              <div className="p-8 text-center border-2 border-dashed border-border-color rounded-xl">
                <p className="text-text-muted">No proposals received yet.</p>
              </div>
            ) : (
              proposals.map(proposal => (
                <Card key={proposal.id}>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row justify-between gap-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 rounded-full bg-surface-2 flex items-center justify-center font-bold text-primary">
                            {proposal.freelancerId.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <h4 className="font-semibold text-lg">Freelancer ({proposal.freelancerId})</h4>
                            <span className={`text-xs px-2 py-1 rounded-full ${proposal.status === 'accepted' ? 'bg-success/10 text-success' : 'bg-surface-2 text-text-muted'}`}>
                              {proposal.status}
                            </span>
                          </div>
                        </div>
                        <h5 className="font-medium text-sm text-text-muted mb-2">Cover Letter</h5>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{proposal.coverLetter}</p>
                      </div>
                      <div className="flex flex-col items-end justify-between min-w-[150px]">
                        <div className="text-right mb-4">
                          <p className="text-sm text-text-muted">Bid Amount</p>
                          <p className="text-xl font-mono font-bold">${proposal.bidAmount}</p>
                        </div>
                        {proposal.status === 'pending' && project.status?.toLowerCase() === 'open' && (
                          <Button onClick={() => handleAcceptProposal(proposal.id, proposal.freelancerId)}>
                            Accept Proposal
                          </Button>
                        )}
                        {proposal.status === 'accepted' && (
                          <Button variant="outline" onClick={() => navigate('/messages')}>
                            Message
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </motion.div>
        )}

        {activeTab === 'Invoices' && (
          <motion.div
            key="invoices"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Project Invoices</CardTitle>
                {role === 'freelancer' && isAssignedToMe && (
                  <Button variant="outline" size="sm" onClick={() => setIsInvoiceModalOpen(true)}>Generate Invoice</Button>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {invoices.length === 0 ? (
                     <p className="text-text-muted">No invoices have been generated yet.</p>
                  ) : invoices.map((inv: any) => (
                    <div key={inv.id} className="p-4 rounded-xl border border-border-color bg-surface flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div>
                        <h4 className="font-semibold">{inv.description || 'Project Invoice'}</h4>
                        <p className="text-sm text-text-muted">Date: {new Date(inv.createdAt).toLocaleDateString()}</p>
                        <p className="text-sm text-text-muted mt-1">Status: <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${inv.status === 'paid' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>{inv.status}</span></p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-mono font-bold text-lg">${inv.amount.toFixed(2)}</span>
                        {inv.status === 'pending' && role === 'client' && (
                          <Button 
                            size="sm" 
                            onClick={() => {
                              setPayingInvoice(inv);
                              setIsPaymentModalOpen(true);
                            }}
                          >
                            Pay Now
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
        
        {activeTab === 'Files' && (
          <motion.div
            key="files"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Project Files & Deliverables</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {deliverables.length === 0 ? (
                    <div className="text-center p-8 border-2 border-dashed border-border-color rounded-xl">
                      <FileText className="w-12 h-12 text-text-muted mx-auto mb-4" />
                      <p className="text-text-muted">No deliverables have been submitted yet.</p>
                    </div>
                  ) : deliverables.map((deliv: any) => (
                    <div key={deliv.id} className="p-4 rounded-xl border border-border-color bg-surface flex flex-col md:flex-row justify-between items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold text-lg">Deliverable</h4>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${deliv.status === 'approved' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                            {deliv.status === 'pending_review' ? 'Pending Review' : deliv.status}
                          </span>
                        </div>
                        <p className="text-sm text-text-muted mb-3">{new Date(deliv.createdAt).toLocaleDateString()}</p>
                        <p className="text-sm leading-relaxed mb-4">{deliv.description}</p>
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-text-muted uppercase tracking-wider">Attached Files</p>
                          <div className="flex flex-wrap gap-2">
                            {deliv.files.map((file: string, idx: number) => (
                              <div key={idx} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border-color bg-background text-sm">
                                <FileText className="w-4 h-4 text-primary" />
                                <span className="font-medium truncate max-w-[200px]">{file}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      {role === 'client' && deliv.status === 'pending_review' && (
                        <div className="flex flex-col gap-2 shrink-0">
                          <Button size="sm" className="w-full" onClick={() => handleUpdateDeliverableStatus(deliv.id, 'approved')}>Approve</Button>
                          <Button size="sm" variant="outline" className="w-full border-error text-error hover:bg-error/10" onClick={() => handleUpdateDeliverableStatus(deliv.id, 'changes_requested')}>Request Changes</Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
        
        {/* Placeholders for other tabs */}
        {(activeTab === 'Team' || activeTab === 'Activity') && (
          <motion.div
            key="placeholder"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-border-color rounded-xl"
          >
            {activeTab === 'Team' && <Users className="w-12 h-12 text-text-muted mb-4" />}
            {activeTab === 'Activity' && <Activity className="w-12 h-12 text-text-muted mb-4" />}
            <p className="text-text-muted">No content available for {activeTab} yet.</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Proposal Modal */}
      <AnimatePresence>
        {isProposalModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
              onClick={() => setIsProposalModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg z-50 p-4"
            >
              <Card className="shadow-2xl">
                <CardHeader>
                  <CardTitle>Submit Proposal</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSendProposal} className="space-y-4">
                    <Input
                      label="Bid Amount ($)"
                      type="number"
                      placeholder="e.g. 500"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      required
                      min="1"
                    />
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-text-primary ml-1">
                        Cover Letter
                      </label>
                      <textarea
                        required
                        placeholder="Explain why you're a great fit for this project..."
                        value={coverLetter}
                        onChange={(e) => setCoverLetter(e.target.value)}
                        className="w-full bg-surface-2 border border-border-color rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-text-muted min-h-[150px] resize-y"
                      />
                    </div>
                    <div className="flex gap-3 pt-4">
                      <Button type="button" variant="outline" className="flex-1" onClick={() => setIsProposalModalOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" className="flex-1 gap-2">
                        <Send className="w-4 h-4" /> Send Proposal
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      {/* Invoice Modal */}
      <AnimatePresence>
        {isInvoiceModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
              onClick={() => setIsInvoiceModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg z-50 p-4"
            >
              <Card className="shadow-2xl">
                <CardHeader>
                  <CardTitle>Generate Invoice</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleGenerateInvoice} className="space-y-4">
                    <Input
                      label="Amount ($)"
                      type="number"
                      placeholder="e.g. 250"
                      value={invoiceAmount}
                      onChange={(e) => setInvoiceAmount(e.target.value)}
                      required
                      min="1"
                    />
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-text-primary ml-1">
                        Description
                      </label>
                      <Input
                        placeholder="e.g. Initial Milestone Completion"
                        value={invoiceDescription}
                        onChange={(e) => setInvoiceDescription(e.target.value)}
                        required
                      />
                    </div>
                    <div className="flex gap-3 pt-4">
                      <Button type="button" variant="outline" className="flex-1" onClick={() => setIsInvoiceModalOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" className="flex-1 gap-2">
                        <DollarSign className="w-4 h-4" /> Generate
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Deliverable Modal */}
      <AnimatePresence>
        {isDeliverableModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
              onClick={() => !isSubmittingDeliverable && setIsDeliverableModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg z-50 p-4"
            >
              <Card className="shadow-2xl">
                <CardHeader>
                  <CardTitle>Submit Deliverable</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmitDeliverableForm} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-text-primary ml-1">
                        Files
                      </label>
                      <div className="border-2 border-dashed border-border-color rounded-xl p-8 text-center hover:bg-surface-2 transition-colors relative">
                        <input 
                          type="file" 
                          multiple 
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                          onChange={(e) => {
                            if (e.target.files) {
                              setDeliverableFiles(Array.from(e.target.files));
                            }
                          }}
                        />
                        <UploadCloud className="w-10 h-10 text-primary mx-auto mb-2" />
                        <p className="text-sm font-medium text-text-primary">Click to upload or drag and drop</p>
                        <p className="text-xs text-text-muted mt-1">SVG, PNG, JPG, PDF or ZIP (max. 10MB)</p>
                      </div>
                      {deliverableFiles.length > 0 && (
                        <div className="mt-3 space-y-2 max-h-32 overflow-y-auto pr-1 custom-scrollbar">
                          {deliverableFiles.map((file, idx) => (
                            <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-surface border border-border-color text-sm">
                              <span className="truncate max-w-[250px] font-medium">{file.name}</span>
                              <span className="text-xs text-text-muted">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-text-primary ml-1">
                        Description
                      </label>
                      <textarea
                        required
                        placeholder="Describe what you're submitting..."
                        value={deliverableDescription}
                        onChange={(e) => setDeliverableDescription(e.target.value)}
                        className="w-full bg-surface-2 border border-border-color rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-text-muted min-h-[100px] resize-y"
                      />
                    </div>
                    <div className="flex gap-3 pt-4">
                      <Button type="button" variant="outline" className="flex-1" onClick={() => setIsDeliverableModalOpen(false)} disabled={isSubmittingDeliverable}>
                        Cancel
                      </Button>
                      <Button type="submit" className="flex-1 gap-2" disabled={isSubmittingDeliverable}>
                        {isSubmittingDeliverable ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />} 
                        {isSubmittingDeliverable ? 'Uploading...' : 'Submit'}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <PaymentModal 
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onSuccess={handlePaymentSuccess}
        amount={payingInvoice?.amount || 0}
        title="Pay Invoice"
        description={payingInvoice?.description || 'Project Invoice'}
      />
    </div>
  );
}
