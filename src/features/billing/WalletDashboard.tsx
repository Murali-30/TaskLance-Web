import { useState, useEffect, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { getTransactions, createTransaction } from '../../lib/db';
import { ArrowUpRight, Download, Plus, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { PaymentModal } from '../../components/ui/PaymentModal';

export default function WalletDashboard() {
  const { role, user } = useAuth();
  const { addToast } = useToast();
  
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const fetchTxs = async () => {
    if (!user?.id) return;
    try {
      const txs = await getTransactions(user.id);
      setTransactions(txs);
    } catch (err) {
      console.error(err);
      addToast('Failed to load transactions', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTxs();
  }, [user?.id]);

  const balance = useMemo(() => {
    return transactions.reduce((acc, tx) => acc + (tx.amount || 0), 0);
  }, [transactions]);

  const chartData = useMemo(() => {
    // Group transactions by date string
    const groups: Record<string, number> = {};
    const now = Date.now();
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
    
    // Create base 30 days
    for(let i=30; i>=0; i--) {
      const d = new Date(now - i * 24 * 60 * 60 * 1000);
      const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      groups[dateStr] = 0;
    }
    
    transactions.forEach(tx => {
      if (tx.createdAt >= thirtyDaysAgo) {
        const d = new Date(tx.createdAt);
        const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        if (groups[dateStr] !== undefined) {
          groups[dateStr] += tx.amount > 0 ? tx.amount : 0;
        }
      }
    });

    let cumulative = 0;
    return Object.entries(groups).map(([name, val]) => {
      cumulative += val;
      return { name, value: cumulative };
    });
  }, [transactions]);

  const handleFundsAction = async () => {
    if (!user?.id) return;
    if (role === 'client') {
      setIsPaymentModalOpen(true);
      return;
    }
    setIsProcessing(true);
    try {
      if (balance > 0) {
        await createTransaction(user.id, -balance, 'Withdrawal to Bank Account', 'completed');
        addToast('Funds withdrawn successfully to your linked bank account.', 'success');
      } else {
        addToast('No funds available to withdraw.', 'error');
      }
      await fetchTxs();
    } catch (err) {
      addToast('Transaction failed', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentSuccess = async () => {
    if (!user?.id) return;
    try {
      await createTransaction(user.id, 500, 'Deposit via Credit Card', 'completed');
      addToast('$500.00 added to your wallet balance.', 'success');
      await fetchTxs();
    } catch (err) {
      addToast('Transaction failed', 'error');
    }
  };

  const handleExport = () => {
    addToast('Generating export file...', 'info');
    setTimeout(() => {
      const csvContent = "data:text/csv;charset=utf-8,Date,Description,Status,Amount\n" 
        + transactions.map(tx => `${new Date(tx.createdAt).toLocaleDateString()},${tx.description},${tx.status},${tx.amount}`).join("\n");
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "tasklance_transactions.csv");
      document.body.appendChild(link); // Required for FF
      
      link.click();
      document.body.removeChild(link);
      
      addToast('Export completed.', 'success');
    }, 800);
  };

  if (loading) {
    return (
      <div className="p-6 md:p-8 max-w-7xl mx-auto w-full flex justify-center mt-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold mb-2">Wallet</h1>
          <p className="text-text-muted">Manage your earnings, payments, and invoices.</p>
        </div>
        <div className="flex gap-3">
          {role === 'freelancer' ? (
            <Button onClick={handleFundsAction} disabled={isProcessing} className="gap-2">
              <ArrowUpRight className="w-4 h-4" /> {isProcessing ? 'Processing...' : 'Withdraw Funds'}
            </Button>
          ) : (
            <Button onClick={handleFundsAction} disabled={isProcessing} className="gap-2">
              <Plus className="w-4 h-4" /> {isProcessing ? 'Processing...' : 'Add $500'}
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="bg-gradient-primary text-white border-none shadow-lg lg:col-span-1">
          <CardContent className="p-6 h-full flex flex-col justify-between">
            <div>
              <p className="text-white/80 font-medium mb-1">Available Balance</p>
              <h2 className="text-4xl font-display font-bold mb-6">${balance.toFixed(2)}</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-4 border-b border-white/20">
                <span className="text-white/80 text-sm">{role === 'client' ? 'Pending Escrow' : 'Pending Clearance'}</span>
                <span className="font-semibold">$450.00</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/80 text-sm">{role === 'client' ? 'Total Spent' : 'Total Earned'}</span>
                <span className="font-semibold">$12,450.00</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Earnings Overview (30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6C47FF" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6C47FF" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#2A2A3D" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#7A7A9A', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#7A7A9A', fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#16161F', borderColor: '#2A2A3D', borderRadius: '8px' }}
                    itemStyle={{ color: '#F2F2F7' }}
                  />
                  <Area type="monotone" dataKey="value" stroke="#6C47FF" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between border-b border-border-color pb-4">
          <CardTitle>Recent Transactions</CardTitle>
          <Button onClick={handleExport} variant="outline" size="sm" className="gap-2"><Download className="w-4 h-4" /> Export</Button>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-2">
                <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Description</th>
                <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-color">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-text-muted">
                    No transactions found.
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-surface/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{new Date(tx.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <p className="font-medium">{tx.description}</p>
                      <p className="text-xs text-text-muted">{tx.id}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        tx.status === 'completed' || tx.status === 'paid' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
                      }`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-right font-mono font-medium ${
                      tx.amount > 0 ? 'text-success' : 'text-text-primary'
                    }`}>
                      {tx.amount > 0 ? '+' : ''}${Math.abs(tx.amount).toFixed(2)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <PaymentModal 
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onSuccess={handlePaymentSuccess}
        amount={500}
        title="Add Funds to Wallet"
        description="Securely deposit $500.00 into your TaskLance account."
      />
    </div>
  );
}
