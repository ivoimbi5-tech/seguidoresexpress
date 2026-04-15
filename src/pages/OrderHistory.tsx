import { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { db } from '../firebase';
import { collection, query, where, orderBy, onSnapshot, doc, runTransaction, increment } from 'firebase/firestore';
import { Order } from '../types';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Instagram, Music2, Search, Filter, ExternalLink, XCircle, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';

export default function OrderHistory() {
  const { profile } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    if (!profile?.uid) return;

    const q = query(
      collection(db, 'orders'),
      where('userId', '==', profile.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
      setOrders(ordersData);
    });

    return () => unsubscribe();
  }, [profile?.uid]);

  const handleCancelOrder = async (order: Order) => {
    if (!profile || order.status !== 'pending') return;

    setCancellingId(order.id);
    try {
      await runTransaction(db, async (transaction) => {
        const orderRef = doc(db, 'orders', order.id);
        const userRef = doc(db, 'users', profile.uid);
        
        const orderSnap = await transaction.get(orderRef);
        if (!orderSnap.exists()) throw new Error('Pedido não encontrado');
        
        const orderData = orderSnap.data() as Order;
        if (orderData.status !== 'pending') throw new Error('O pedido já não está pendente');

        // Update order status
        transaction.update(orderRef, { status: 'cancelled' });
        
        // Refund balance
        transaction.update(userRef, { balance: increment(orderData.totalPrice) });
      });

      toast.success('Pedido cancelado e valor reembolsado!');
    } catch (error: any) {
      console.error('Cancel error:', error);
      toast.error(error.message || 'Erro ao cancelar pedido');
    } finally {
      setCancellingId(null);
    }
  };

  const filteredOrders = orders.filter(o => 
    o.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Concluído</Badge>;
      case 'processing': return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">Processando</Badge>;
      case 'pending': return <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20">Pendente</Badge>;
      case 'cancelled': return <Badge className="bg-red-500/10 text-red-500 border-red-500/20">Cancelado</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Histórico de Pedidos</h1>
          <p className="text-sm text-zinc-500">Acompanhe o status de todos os seus pedidos realizados.</p>
        </div>
        
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <Input 
            placeholder="Buscar pedido..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-card border-border rounded-xl h-10 text-xs"
          />
        </div>
      </header>

      <Card className="bg-card border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-secondary/30">
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest h-12">ID</TableHead>
                <TableHead className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest h-12">Data</TableHead>
                <TableHead className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest h-12">Serviço</TableHead>
                <TableHead className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest h-12">Quantidade</TableHead>
                <TableHead className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest h-12">Preço</TableHead>
                <TableHead className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest h-12">Status</TableHead>
                <TableHead className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest h-12 text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <TableRow key={order.id} className="border-border hover:bg-secondary/10 transition-colors">
                    <TableCell className="font-mono text-[10px] text-zinc-500">#{order.id.slice(0, 4)}</TableCell>
                    <TableCell className="text-zinc-300 text-xs">
                      {new Date(order.createdAt).toLocaleDateString('pt-AO')}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                          {order.platform === 'instagram' ? <Instagram className="w-3 h-3 text-pink-500" /> : <Music2 className="w-3 h-3 text-cyan-400" />}
                        </div>
                        <span className="text-xs font-medium text-white line-clamp-1">{order.serviceName}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-zinc-300 text-xs">{order.quantity.toLocaleString()}</TableCell>
                    <TableCell className="text-zinc-300 text-xs font-bold">
                      {order.totalPrice.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}
                    </TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-3">
                        <a 
                          href={order.link} 
                          target="_blank" 
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[10px] text-zinc-400 hover:text-primary font-bold uppercase tracking-widest transition-colors"
                        >
                          Link <ExternalLink className="w-3 h-3" />
                        </a>
                        
                        {order.status === 'pending' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCancelOrder(order)}
                            disabled={cancellingId === order.id}
                            className="h-7 px-2 text-[9px] font-black uppercase tracking-tighter text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-md"
                          >
                            {cancellingId === order.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <>
                                <XCircle className="w-3 h-3 mr-1" />
                                Cancelar
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-48 text-center text-zinc-500 text-xs italic">
                    Nenhum pedido encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
