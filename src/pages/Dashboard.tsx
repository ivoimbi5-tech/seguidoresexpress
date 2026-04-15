import { useAuth } from '../AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  TrendingUp, 
  Users, 
  Eye, 
  Heart, 
  ArrowUpRight, 
  Wallet,
  Clock,
  CheckCircle2,
  Instagram,
  Music2,
  PlusCircle
} from 'lucide-react';
import { motion } from 'motion/react';
import { buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import React, { useState, useEffect } from 'react';
import { collection, query, where, limit, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { Order } from '../types';

export default function Dashboard() {
  const { profile } = useAuth();
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (!profile?.uid) return;

    const q = query(
      collection(db, 'orders'),
      where('userId', '==', profile.uid),
      orderBy('createdAt', 'desc'),
      limit(5)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
      setRecentOrders(orders);
    });

    return () => unsubscribe();
  }, [profile?.uid]);

  const stats = [
    { label: 'Saldo Atual', value: profile?.balance?.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' }), icon: Wallet, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'Pedidos Totais', value: recentOrders.length.toString(), icon: TrendingUp, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Em Processamento', value: recentOrders.filter(o => o.status === 'processing').length.toString(), icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { label: 'Concluídos', value: recentOrders.filter(o => o.status === 'completed').length.toString(), icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  ];

  return (
    <div className="space-y-6 lg:space-y-8">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="header-title">
          <h1 className="text-xl lg:text-2xl font-bold text-white">Olá, {profile?.displayName}</h1>
          <p className="text-xs lg:text-sm text-zinc-400">O que vamos impulsionar hoje?</p>
        </div>
        <div className="bg-card border border-border px-4 lg:px-6 py-2 rounded-full flex items-center justify-between sm:justify-start gap-3 w-full sm:w-auto">
          <span className="text-[9px] lg:text-[10px] font-bold text-zinc-500 tracking-widest uppercase">Saldo Disponível</span>
          <span className="text-sm font-bold text-primary">
            {profile?.balance?.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}
          </span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stats Grid */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {stats.slice(1).map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="bg-card border-border p-5 rounded-2xl">
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2 rounded-lg ${stat.bg} ${stat.color}`}>
                    <stat.icon className="w-4 h-4" />
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-zinc-800" />
                </div>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">{stat.label}</p>
                <h3 className="text-xl font-bold text-white">{stat.value}</h3>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Quick Deposit Card */}
        <Card className="bg-card border-border p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white mb-2">Recarga Rápida</h3>
            <p className="text-xs text-zinc-500 mb-4 leading-relaxed">Adicione saldo via Link de Pagamento de forma instantânea.</p>
            <Input placeholder="Valor (300, 500 ou 1000 Kz)" className="bg-secondary border-border h-10 text-xs mb-3" />
          </div>
          <Link 
            to="/wallet" 
            className={cn(
              buttonVariants({ variant: "outline" }), 
              "w-full border-primary text-primary hover:bg-primary/10 h-10 text-xs font-bold"
            )}
          >
            Ir para Carteira
          </Link>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders Table */}
        <div className="lg:col-span-2">
          <Card className="bg-card border-border rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h2 className="text-sm font-bold text-white">Pedidos Recentes</h2>
              <Link to="/history" className="text-[10px] font-bold text-primary uppercase tracking-wider hover:underline">Ver Histórico Completo</Link>
            </div>
            <div className="p-0">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Serviço</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.length > 0 ? (
                    recentOrders.map((order) => (
                      <tr key={order.id} className="border-b border-border/50 hover:bg-secondary/20 transition-colors">
                        <td className="px-6 py-4 text-xs font-mono text-zinc-500">#{order.id.slice(0, 4)}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {order.platform === 'instagram' ? <Instagram className="w-3 h-3 text-pink-500" /> : <Music2 className="w-3 h-3 text-cyan-400" />}
                            <span className="text-xs font-medium text-zinc-300">{order.serviceName}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-sm ${
                            order.status === 'completed' ? 'bg-primary/10 text-primary' : 
                            order.status === 'processing' ? 'bg-blue-500/10 text-blue-500' : 'bg-zinc-800 text-zinc-500'
                          }`}>
                            {order.status === 'completed' ? 'Concluído' : order.status === 'processing' ? 'Processando' : 'Pendente'}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-6 py-10 text-center text-xs text-zinc-600 italic">Nenhum pedido recente.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Quick Action */}
        <div className="space-y-6">
          <Link 
            to="/new-order" 
            className={cn(
              buttonVariants({ variant: "default" }),
              "w-full h-16 bg-primary hover:bg-primary/90 text-background font-black rounded-2xl text-sm shadow-[0_0_20px_rgba(16,185,129,0.2)] flex items-center justify-center gap-3"
            )}
          >
            <PlusCircle className="w-5 h-5" />
            NOVO PEDIDO AGORA
          </Link>

          <Card className="bg-primary/5 border-primary/20 p-6 rounded-2xl">
            <h3 className="text-sm font-bold text-primary mb-2 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              Suporte VIP
            </h3>
            <p className="text-[11px] text-zinc-400 mb-4 leading-relaxed">Precisa de ajuda com um pedido ou quer um serviço personalizado?</p>
            <a href="https://wa.me/244900000000" className="text-[11px] font-bold text-primary hover:underline">Falar no WhatsApp →</a>
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
