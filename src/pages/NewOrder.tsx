import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { SERVICES, PLATFORMS } from '../constants';
import { Service, Order } from '../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Instagram, Music2, Facebook, Twitter, Info, AlertCircle, CheckCircle2 } from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, addDoc, doc, updateDoc, increment, runTransaction } from 'firebase/firestore';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';

export default function NewOrder() {
  const { profile } = useAuth();
  const [selectedPlatform, setSelectedPlatform] = useState<string>('instagram');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [link, setLink] = useState('');
  const [quantity, setQuantity] = useState<number>(100);
  const [totalPrice, setTotalPrice] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredServices = SERVICES.filter(s => s.platform === selectedPlatform);

  useEffect(() => {
    // Auto-select the first service for the selected platform
    const platformService = SERVICES.find(s => s.platform === selectedPlatform);
    if (platformService) {
      setSelectedService(platformService);
      setQuantity(platformService.minQuantity);
    }
  }, [selectedPlatform]);

  useEffect(() => {
    if (selectedService) {
      const price = (quantity / 1000) * selectedService.pricePer1000;
      setTotalPrice(price);
    }
  }, [quantity, selectedService]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !selectedService) return;

    if (profile.balance < totalPrice) {
      toast.error('Saldo insuficiente. Por favor, recarregue sua carteira.');
      return;
    }

    if (quantity < selectedService.minQuantity || quantity > selectedService.maxQuantity) {
      toast.error(`Quantidade inválida. Mínimo: ${selectedService.minQuantity}, Máximo: ${selectedService.maxQuantity}`);
      return;
    }

    setIsSubmitting(true);

    try {
      // Use a transaction to ensure balance is deducted and order is created atomically
      await runTransaction(db, async (transaction) => {
        const userRef = doc(db, 'users', profile.uid);
        const userSnap = await transaction.get(userRef);
        
        if (!userSnap.exists()) throw new Error('Usuário não encontrado');
        
        const currentBalance = userSnap.data().balance;
        if (currentBalance < totalPrice) throw new Error('Saldo insuficiente');

        // Deduct balance
        transaction.update(userRef, { balance: increment(-totalPrice) });

        // Create order
        const orderData: Omit<Order, 'id'> = {
          userId: profile.uid,
          serviceId: selectedService.id,
          serviceName: selectedService.name,
          platform: selectedService.platform,
          type: selectedService.type,
          link,
          quantity,
          totalPrice,
          status: 'pending',
          createdAt: new Date().toISOString(),
        };
        
        const orderRef = doc(collection(db, 'orders'));
        transaction.set(orderRef, orderData);
      });

      toast.success('Pedido realizado com sucesso!');
      setLink('');
      setQuantity(selectedService?.minQuantity || 100);
    } catch (error: any) {
      console.error('Order error:', error);
      toast.error(error.message || 'Erro ao processar pedido.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'instagram': return <Instagram className="w-5 h-5 text-pink-500" />;
      case 'tiktok': return <Music2 className="w-5 h-5 text-cyan-400" />;
      case 'facebook': return <Facebook className="w-5 h-5 text-blue-600" />;
      case 'twitter': return <Twitter className="w-5 h-5 text-sky-400" />;
      default: return null;
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <header className="flex items-center justify-between">
        <div className="header-title">
          <h1 className="text-2xl font-bold text-white">Criar Novo Pedido</h1>
          <p className="text-sm text-zinc-400">O que vamos impulsionar hoje?</p>
        </div>
        <div className="bg-card border border-border px-6 py-2 rounded-full flex items-center gap-3">
          <span className="text-[10px] font-bold text-zinc-500 tracking-widest uppercase">Saldo Disponível</span>
          <span className="text-sm font-bold text-primary">
            {profile?.balance?.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}
          </span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3 space-y-6">
          <Card className="bg-card border-border p-8 rounded-2xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Platform Selection */}
              <div className="space-y-3">
                <Label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Selecione a Rede Social</Label>
                <div className="grid grid-cols-2 gap-3">
                  {PLATFORMS.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setSelectedPlatform(p.id);
                      }}
                      className={`
                        flex flex-col items-center justify-center gap-2 p-6 rounded-xl border transition-all
                        ${selectedPlatform === p.id 
                          ? 'bg-primary/10 border-primary text-primary shadow-[0_0_15px_rgba(16,185,129,0.1)]' 
                          : 'bg-secondary border-border text-zinc-500 hover:border-zinc-700'}
                      `}
                    >
                      {getPlatformIcon(p.id)}
                      <span className="text-xs font-bold uppercase tracking-tighter">{p.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Service Selection Removed - Auto-selected based on platform */}
              {selectedService && (
                <div className="bg-primary/5 border border-primary/20 p-4 rounded-xl flex items-center justify-between">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Serviço Ativo</span>
                  <span className="text-xs font-bold text-white">{selectedService.name}</span>
                </div>
              )}

              {/* Link Input */}
              <div className="space-y-3">
                <Label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Link do Perfil ou Postagem</Label>
                <Input 
                  placeholder="https://instagram.com/usuario..." 
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  required
                  className="bg-secondary border-border h-12 rounded-xl focus:ring-primary/20 text-xs"
                />
              </div>

              {/* Quantity Input */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Quantidade</Label>
                  <Input 
                    type="number" 
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    min={selectedService?.minQuantity || 100}
                    max={selectedService?.maxQuantity || 100000}
                    className="bg-secondary border-border h-12 rounded-xl focus:ring-primary/20 text-xs font-bold"
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Tempo de Entrega</Label>
                  <Input 
                    value="~15 Minutos" 
                    disabled
                    className="bg-secondary border-border h-12 rounded-xl text-xs font-bold opacity-50"
                  />
                </div>
              </div>

              <div className="bg-secondary p-5 rounded-xl flex justify-between items-center">
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Custo Total Estimado</span>
                <span className="text-xl font-bold text-primary">
                  {totalPrice.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}
                </span>
              </div>

              <Button 
                type="submit" 
                disabled={isSubmitting || !selectedService || !link}
                className="w-full h-14 bg-primary hover:bg-primary/90 text-background font-black rounded-xl text-sm shadow-[0_0_20px_rgba(16,185,129,0.2)] disabled:opacity-50"
              >
                {isSubmitting ? 'Processando...' : 'CONFIRMAR PEDIDO AGORA'}
              </Button>
            </form>
          </Card>
        </div>

        {/* Order Info Sidebar */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-card border-border p-6 rounded-2xl">
            <h3 className="text-sm font-bold text-white mb-4">Resumo do Pedido</h3>
            <div className="space-y-4">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-500">Serviço:</span>
                <span className="text-zinc-300 font-medium">{selectedService?.name || 'Não selecionado'}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-zinc-500">Quantidade:</span>
                <span className="text-zinc-300 font-medium">{quantity.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-zinc-500">Velocidade:</span>
                <span className="text-primary font-bold uppercase tracking-widest">Instantânea</span>
              </div>
              <div className="pt-4 border-t border-border flex justify-between items-center">
                <span className="text-sm font-bold text-white uppercase tracking-widest">Total:</span>
                <span className="text-2xl font-bold text-primary">
                  {totalPrice.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}
                </span>
              </div>
            </div>
          </Card>

          <div className="space-y-4">
            <div className="flex gap-3 p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl">
              <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
              <p className="text-[10px] text-amber-200/70 leading-relaxed">
                Não altere o nome de usuário ou coloque o perfil em privado enquanto o pedido estiver em processamento.
              </p>
            </div>
            <div className="flex gap-3 p-4 bg-primary/5 border border-primary/20 rounded-2xl">
              <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
              <p className="text-[10px] text-emerald-200/70 leading-relaxed">
                Garantia de reposição de 30 dias para serviços selecionados.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

}
