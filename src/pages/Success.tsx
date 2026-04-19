import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc, updateDoc, increment, runTransaction } from 'firebase/firestore';
import { useAuth } from '../AuthContext';
import { CheckCircle2, AlertCircle, Loader2, ArrowRight, Wallet } from 'lucide-react';
import { motion } from 'motion/react';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function SuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [amount, setAmount] = useState<number>(0);
  
  const txId = searchParams.get('tx');

  useEffect(() => {
    async function verifyAndComplete() {
      if (!profile?.uid) return;

      const storedInfoRaw = localStorage.getItem('last_payment_info');
      const storedInfo = storedInfoRaw ? JSON.parse(storedInfoRaw) : null;
      const effectiveTxId = txId || (storedInfo ? storedInfo.transactionId : null);

      if (!effectiveTxId) {
        console.error('No transaction ID found');
        setStatus('error');
        return;
      }

      try {
        await runTransaction(db, async (transaction) => {
          const txRef = doc(db, 'transactions', effectiveTxId);
          const txSnap = await transaction.get(txRef);

          if (!txSnap.exists()) {
            throw new Error('Transação não encontrada');
          }

          const txData = txSnap.data();
          
          // CRITICAL: Integrity Check
          if (txData.userId !== profile.uid) {
            throw new Error('Acesso não autorizado');
          }

          // IF ALREADY COMPLETED: Just show success, don't update balance again
          if (txData.status === 'completed') {
            setAmount(txData.amount);
            setStatus('success');
            return;
          }

          // IF NOT PENDING: Stop (cancelled or failed)
          if (txData.status !== 'pending') {
            throw new Error('Esta transação já não pode ser processada.');
          }

          // ATOMIC UPDATE: Mark as completed and update balance in one go
          // This prevents "Double Spend" attacks or manual URL refreshing
          transaction.update(txRef, { 
            status: 'completed',
            completedAt: new Date().toISOString(),
            verificationSource: 'client_event_confirmed'
          });

          transaction.update(doc(db, 'users', profile.uid), { 
            balance: increment(txData.amount) 
          });

          setAmount(txData.amount);
        });

        setStatus('success');
        localStorage.removeItem('last_payment_info');

        // Auto redirect to dashboard after 5 seconds
        setTimeout(() => {
          navigate('/');
        }, 5000);
      } catch (error) {
        console.error('Success page error:', error);
        setStatus('error');
      }
    }

    if (profile?.uid) {
      verifyAndComplete();
    }
  }, [txId, profile?.uid]);

  if (status === 'loading') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-zinc-400 animate-pulse font-medium">Verificando seu pagamento...</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
          <AlertCircle className="w-10 h-10 text-red-500" />
        </div>
        <h1 className="text-2xl font-black text-white mb-2">Ops! Algo deu errado.</h1>
        <p className="text-zinc-500 max-w-xs mb-8">
          Não conseguimos validar seu pagamento. Se você já pagou, entre em contato com o suporte.
        </p>
        <Link 
          to="/wallet" 
          className={cn(
            buttonVariants({ variant: "outline" }),
            "border-zinc-800 text-zinc-400 hover:text-white"
          )}
        >
          Voltar para Carteira
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-8 shadow-[0_0_40px_rgba(16,185,129,0.2)]"
      >
        <CheckCircle2 className="w-12 h-12 text-primary" />
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <h1 className="text-3xl font-black text-white mb-2 tracking-tight">Pagamento Confirmado!</h1>
        <p className="text-zinc-400 mb-2">
          Seu saldo de <span className="text-primary font-bold">{amount.toLocaleString('pt-AO')} Kz</span> já está disponível.
        </p>
        <p className="text-[10px] text-zinc-500 mb-8 uppercase tracking-widest font-bold">
          Redirecionando para o dashboard em instantes...
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-sm mx-auto">
          <Link 
            to="/new-order" 
            className={cn(
              buttonVariants({ variant: "default" }),
              "bg-primary hover:bg-primary/90 text-background font-black h-12 rounded-xl flex items-center justify-center gap-2"
            )}
          >
            NOVO PEDIDO
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link 
            to="/" 
            className={cn(
              buttonVariants({ variant: "outline" }),
              "border-border bg-card text-white h-12 rounded-xl hover:bg-secondary flex items-center justify-center gap-2"
            )}
          >
            DASHBOARD
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
