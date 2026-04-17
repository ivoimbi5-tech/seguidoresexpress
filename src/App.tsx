import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import { Toaster } from 'sonner';
import { 
  LayoutDashboard, 
  PlusCircle, 
  History, 
  Wallet, 
  LogOut, 
  Menu, 
  X,
  Instagram,
  Music2,
  Facebook,
  Twitter,
  TrendingUp,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// Pages
import Dashboard from './pages/Dashboard';
import NewOrder from './pages/NewOrder';
import OrderHistory from './pages/OrderHistory';
import WalletPage from './pages/Wallet';
import Login from './pages/Login';
import SuccessPage from './pages/Success';

function Sidebar({ isOpen, setIsOpen }: { isOpen: boolean, setIsOpen: (v: boolean) => void }) {
  const { logout, profile } = useAuth();
  const location = useLocation();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: PlusCircle, label: 'Novo Pedido', path: '/new-order' },
    { icon: History, label: 'Histórico', path: '/history' },
    { icon: Wallet, label: 'Carteira', path: '/wallet' },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 bottom-0 w-[240px] bg-card border-r border-border z-50
        transition-transform duration-300 ease-in-out lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full p-8">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              <Zap className="text-background w-5 h-5" />
            </div>
            <span className="text-lg font-extrabold tracking-tighter text-white">
              SEGUIDORES<span className="text-primary">EXPRESS</span>
            </span>
          </div>

          <nav className="flex-1 space-y-2">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-sm
                    ${isActive 
                      ? 'bg-secondary text-primary border border-border' 
                      : 'text-zinc-400 hover:text-white hover:bg-secondary/50'}
                  `}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="pt-6 border-t border-border">
            <div className="flex items-center gap-3 mb-6 px-2">
              <Avatar className="w-8 h-8 border border-primary/20">
                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                  {profile?.displayName?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col overflow-hidden">
                <span className="text-xs font-bold text-white truncate">{profile?.displayName}</span>
                <span className="text-[10px] text-primary font-bold">
                  {profile?.balance?.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}
                </span>
              </div>
            </div>
            <a 
              href="https://wa.me/244900000000"
              className="w-full flex items-center justify-center gap-2 py-3 bg-[#25D366] text-white font-bold rounded-xl text-xs mb-4 hover:opacity-90 transition-opacity"
            >
              Suporte WhatsApp
            </a>
            <Button 
              variant="ghost" 
              onClick={logout}
              className="w-full justify-start text-zinc-500 hover:text-red-400 hover:bg-red-400/10 gap-3 rounded-lg h-10 text-xs"
            >
              <LogOut className="w-4 h-4" />
              <span>Sair</span>
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
    </div>
  );
  
  return user ? <>{children}</> : <Navigate to="/login" />;
}

function AppLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 font-sans selection:bg-emerald-500/30">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      <main className="lg:pl-[240px] min-h-screen flex flex-col">
        {/* Header */}
        <header className="h-16 lg:h-20 border-b border-border px-4 lg:px-6 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-md z-30">
          <div className="flex items-center gap-3 lg:hidden">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 text-zinc-400 hover:text-white"
            >
              <Menu className="w-6 h-6" />
            </button>
            <span className="text-sm font-black tracking-tighter text-white">
              S<span className="text-primary">E</span>
            </span>
          </div>
          
          <div className="flex items-center gap-4 ml-auto">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/5 border border-primary/20 rounded-full">
              <ShieldCheck className="w-3.5 h-3.5 text-primary" />
              <span className="text-[10px] lg:text-xs font-bold text-primary uppercase tracking-wider">Seguro</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 p-4 lg:p-10 max-w-7xl w-full mx-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/new-order" element={<NewOrder />} />
            <Route path="/history" element={<OrderHistory />} />
            <Route path="/wallet" element={<WalletPage />} />
            <Route path="/success" element={<SuccessPage />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/*" element={
            <PrivateRoute>
              <AppLayout />
            </PrivateRoute>
          } />
        </Routes>
      </Router>
      <Toaster position="top-right" theme="dark" closeButton richColors />
    </AuthProvider>
  );
}
