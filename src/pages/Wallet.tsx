import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { db } from '../firebase';
import { collection, query, where, orderBy, onSnapshot, addDoc, doc, updateDoc, increment } from 'firebase/firestore';
import { Transaction } from '../types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Wallet, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  CreditCard, 
  Smartphone, 
  CheckCircle2, 
  Clock,
  AlertCircle,
  Copy,
  ExternalLink,
  X,
  MessageCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';

export default function WalletPage() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [amount, setAmount] = useState<number>(5000);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'deposit' | 'history'>('deposit');

  useEffect(() => {
    if (!profile?.uid) return;

    const q = query(
      collection(db, 'transactions'),
      where('userId', '==', profile.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const txs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
      setTransactions(txs);
    });

    return () => unsubscribe();
  }, [profile?.uid]);

  const handleDeposit = () => {
    if (!profile) return;

    if (amount < 500) {
      toast.error('O valor mínimo para depósito por WhatsApp é 500 Kz.');
      return;
    }

    const message = `Olá! Gostaria de adicionar saldo à minha conta SeguidoresExpress.
Valor: ${amount.toLocaleString('pt-AO')} Kz
ID do Usuário: ${profile.uid}
Email: ${profile.email}`;

    const encodedMessage = encodeURIComponent(message);
    // WhatsApp number from App.tsx support link
    const whatsappNumber = '244957061345'; 
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
    toast.info('Abrindo WhatsApp para finalizar o depósito...');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copiado para a área de transferência');
  };

  const quickAmounts = [1, 300, 500, 1000];

  return (
    <div className="max-w-5xl mx-auto space-y-6 lg:space-y-8">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="header-title">
          <h1 className="text-xl lg:text-2xl font-bold text-white">Carteira Digital</h1>
          <p className="text-xs lg:text-sm text-zinc-400">Gerencie seu saldo e veja seu histórico de transações.</p>
        </div>
        <div className="bg-card border border-border px-4 lg:px-6 py-2 rounded-full flex items-center justify-between sm:justify-start gap-3 w-full sm:w-auto">
          <span className="text-[9px] lg:text-[10px] font-bold text-zinc-500 tracking-widest uppercase">Saldo Atual</span>
          <span className="text-sm font-bold text-primary">
            {profile?.balance?.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}
          </span>
        </div>
      </header>

      <AnimatePresence>
        {/* Payment Modal Removed - Using WhatsApp redirection now */}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Deposit Section */}
        <div className="space-y-6">
            <Card className="bg-card border-border p-8 rounded-2xl">
            <h3 className="text-sm font-bold text-white mb-4">Adicionar Saldo</h3>
            <p className="text-xs text-zinc-500 mb-6 leading-relaxed">
              Informe o valor que deseja depositar. Você será redirecionado para o nosso WhatsApp para concluir o pagamento.
            </p>

            <div className="space-y-6">
              <div className="space-y-3">
                <Label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Escolha o Valor (Kz)</Label>
                <div className="grid grid-cols-3 gap-2">
                  {[500, 1000, 2000, 5000, 10000, 20000].map((q) => (
                    <button
                      key={q}
                      onClick={() => setAmount(q)}
                      className={`
                        py-3 rounded-xl border text-xs font-bold transition-all
                        ${amount === q 
                          ? 'bg-primary/10 border-primary text-primary shadow-[0_0_15px_rgba(16,185,129,0.1)]' 
                          : 'bg-secondary border-border text-zinc-500 hover:border-zinc-700'}
                      `}
                    >
                      {q} Kz
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Valor do Depósito</Label>
                <div className="relative">
                  <Input 
                    type="number" 
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="bg-secondary border-border h-12 rounded-xl text-sm font-bold pl-4"
                    placeholder="Digite o valor em Kz..."
                  />
                </div>
              </div>

              <Button 
                onClick={handleDeposit}
                className="w-full h-14 bg-[#25D366] hover:bg-[#25D366]/90 text-white font-black rounded-xl text-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(37,211,102,0.2)]"
              >
                <MessageCircle className="w-5 h-5" />
                PAGAR VIA WHATSAPP
              </Button>

              <p className="text-[10px] text-zinc-600 text-center">
                Atendimento Rápido e Seguro
              </p>
            </div>
          </Card>

          <div className="p-6 bg-primary/5 border border-primary/20 rounded-2xl space-y-4">
            <div className="flex items-center gap-3">
              <Smartphone className="w-5 h-5 text-primary" />
              <h4 className="text-xs font-bold text-white uppercase tracking-widest">Como funciona?</h4>
            </div>
            <p className="text-[10px] text-zinc-400 leading-relaxed">
              1. Selecione o valor desejado.<br />
              2. Clique no botão verde de WhatsApp.<br />
              3. Envie a mensagem automática e anexe o comprovante.<br />
              4. Seu saldo será creditado manualmente pela nossa equipa após verificação.
            </p>
          </div>
        </div>

        {/* Transaction History */}
        <div className="lg:col-span-2">
          <Card className="bg-card border-border rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-border">
              <h2 className="text-sm font-bold text-white">Histórico de Transações</h2>
            </div>
            <div className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-secondary/30">
                    <tr className="border-b border-border">
                      <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest h-12">Data</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest h-12">Tipo</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest h-12">Valor</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest h-12">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.length > 0 ? (
                      transactions.map((tx) => (
                        <tr key={tx.id} className="border-b border-border/50 hover:bg-secondary/10 transition-colors">
                          <td className="px-6 py-4 text-xs text-zinc-400">
                            {new Date(tx.createdAt).toLocaleDateString('pt-AO')}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              {tx.type === 'deposit' ? (
                                <ArrowDownCircle className="w-3 h-3 text-primary" />
                              ) : (
                                <ArrowUpCircle className="w-3 h-3 text-red-400" />
                              )}
                              <span className="text-xs font-medium text-white">
                                {tx.type === 'deposit' ? 'Depósito' : 'Pagamento de Pedido'}
                              </span>
                            </div>
                          </td>
                          <td className={`px-6 py-4 text-xs font-bold ${tx.type === 'deposit' ? 'text-primary' : 'text-white'}`}>
                            {tx.type === 'deposit' ? '+' : '-'} {tx.amount.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-sm ${
                              tx.status === 'completed' ? 'bg-primary/10 text-primary' : 'bg-zinc-800 text-zinc-500'
                            }`}>
                              {tx.status === 'completed' ? 'Concluído' : 'Pendente'}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="h-48 text-center text-zinc-500 text-xs italic">
                          Nenhuma transação encontrada.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );

}

function ShieldCheck(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
