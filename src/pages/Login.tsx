import { useAuth } from '../AuthContext';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Zap, Shield, Rocket, Globe } from 'lucide-react';
import { motion } from 'motion/react';

export default function Login() {
  const { user, signIn, loading } = useAuth();

  if (loading) return null;
  if (user) return <Navigate to="/" />;

  const features = [
    { icon: Zap, title: 'Entrega Instantânea', desc: 'Resultados em minutos após o pedido.' },
    { icon: Shield, title: '100% Seguro', desc: 'Não pedimos senhas das suas redes.' },
    { icon: Globe, title: 'Foco em Angola', desc: 'Pagamentos locais e suporte em PT.' },
    { icon: Rocket, title: 'Crescimento Real', desc: 'Aumente sua autoridade digital hoje.' },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row">
      {/* Left Side - Branding & Features */}
      <div className="flex-1 p-10 lg:p-20 flex flex-col justify-center bg-gradient-to-br from-primary/5 via-background to-background relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full" />
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10"
        >
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)]">
              <Zap className="text-background w-6 h-6" />
            </div>
            <span className="text-2xl font-black tracking-tighter text-white uppercase">
              SEGUIDORES<span className="text-primary">EXPRESS</span>
            </span>
          </div>

          <h1 className="text-4xl lg:text-6xl font-black text-white mb-6 leading-[1.1] tracking-tight">
            Acelere seu <span className="text-primary">Sucesso Digital</span> em Angola.
          </h1>
          <p className="text-zinc-400 text-lg mb-12 max-w-xl leading-relaxed">
            A plataforma líder em SMM Panel para criadores e empresas angolanas. 
            Cresça suas redes de forma segura, rápida e acessível.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {features.map((f, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * i }}
                className="flex gap-4"
              >
                <div className="w-10 h-10 rounded-xl bg-card flex items-center justify-center shrink-0 border border-border">
                  <f.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm mb-1">{f.title}</h3>
                  <p className="text-zinc-500 text-xs leading-relaxed">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-[480px] bg-card border-l border-border flex flex-col justify-center p-10 lg:p-16">
        <div className="max-w-sm mx-auto w-full">
          <div className="mb-12">
            <h2 className="text-2xl font-black text-white mb-2 tracking-tight">Bem-vindo de volta</h2>
            <p className="text-sm text-zinc-500">Entre na sua conta para gerenciar seus pedidos.</p>
          </div>

          <div className="space-y-4">
            <Button 
              onClick={signIn}
              className="w-full h-14 bg-white hover:bg-zinc-200 text-black font-black rounded-xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] text-sm"
            >
              <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
              ENTRAR COM GOOGLE
            </Button>
            
            <p className="text-center text-[10px] text-zinc-600 mt-8 leading-relaxed uppercase font-bold tracking-widest">
              Ao entrar, você concorda com nossos <br />
              <a href="#" className="text-primary hover:underline">Termos de Serviço</a> e <a href="#" className="text-primary hover:underline">Privacidade</a>.
            </p>
          </div>

          <div className="mt-20 pt-10 border-t border-border">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest">
              <span className="text-zinc-500">Precisa de ajuda?</span>
              <a href="https://wa.me/244957061345" className="text-primary hover:underline">Falar no WhatsApp</a>
            </div>
          </div>
        </div>
      </div>
    </div>

  );
}
