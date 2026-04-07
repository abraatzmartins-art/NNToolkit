'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Menu, Moon, Sun, Settings, Play, ArrowLeft,
  Sparkles, Database, Shield, Zap, Globe, LayoutGrid,
  LogOut, ShieldCheck, Bot,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { useApifyStore } from '@/lib/store';
import { categoryLabels, type ActorCategory } from '@/lib/apify-catalog';
import { ApifySidebar } from '@/components/apify-sidebar';
import { ActorGrid } from '@/components/actor-card';
import { DynamicFormBuilder } from '@/components/dynamic-form-builder';
import { OutputConfig } from '@/components/output-config';
import { ResultsDashboard } from '@/components/results-dashboard';
import { RunStatusIndicator } from '@/components/run-status-indicator';
import { SearchHistory } from '@/components/search-history';
import { ApiKeySettings } from '@/components/api-key-settings';
import { DiscoverActors } from '@/components/discover-actors';
import { LoginForm } from '@/components/auth/login-form';
import { RegisterForm } from '@/components/auth/register-form';
import { AdminPanel } from '@/components/auth/admin-panel';
import { AISearchView } from '@/components/ai-search';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
    >
      <Sun className="h-4 w-4 scale-0 rotate-[-90deg] transition-all dark:scale-100 dark:rotate-0" />
      <Moon className="absolute h-4 w-4 scale-100 rotate-0 transition-all dark:scale-0 dark:rotate-90" />
    </Button>
  );
}

// Auth gate - shows login/register
function AuthGate() {
  const { authView, setAuthView } = useApifyStore();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-emerald-50/30 dark:to-emerald-950/20 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="text-center mb-6">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-500/20">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Apify Research Hub</h1>
          <p className="text-sm text-muted-foreground mt-1">Plataforma de pesquisa e coleta de dados</p>
        </div>

        {authView === 'login' ? (
          <LoginForm onToggleView={setAuthView} />
        ) : (
          <RegisterForm onToggleView={setAuthView} />
        )}
      </motion.div>
    </div>
  );
}

// Welcome view when no actor is selected and user is on catalog
function WelcomeHero({ onExplore, onDiscover, onAISearch }: { onExplore: () => void; onDiscover: () => void; onAISearch: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="text-center py-12 lg:py-20"
    >
      <div className="relative max-w-2xl mx-auto">
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/20">
            <Sparkles className="h-8 w-8 text-white" />
          </div>

          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight mb-3">
            Apify Research Hub
          </h1>
          <p className="text-muted-foreground text-base lg:text-lg max-w-md mx-auto mb-8 leading-relaxed">
            Plataforma completa para pesquisa e coleta de dados.
            Extraia informações de múltiplas fontes com apenas alguns cliques.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-8 max-w-xl mx-auto">
            {[
              { icon: Database, label: '20+ Atores', desc: 'Fontes de dados' },
              { icon: Bot, label: 'Busca IA', desc: 'Linguagem natural' },
              { icon: Shield, label: 'Seguro', desc: 'Chaves protegidas' },
              { icon: Zap, label: 'Rápido', desc: 'Resultados rápidos' },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex flex-col items-center gap-1 p-3 rounded-lg bg-muted/50">
                <Icon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs font-semibold">{label}</span>
                <span className="text-[10px] text-muted-foreground">{desc}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button
              onClick={onAISearch}
              size="lg"
              className="gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
            >
              <Bot className="h-4 w-4" />
              Buscar com IA
            </Button>
            <Button
              onClick={onDiscover}
              size="lg"
              className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Sparkles className="h-4 w-4" />
              Explorar Atores
            </Button>
            <Button
              onClick={onExplore}
              size="lg"
              variant="outline"
              className="gap-2"
            >
              <LayoutGrid className="h-4 w-4" />
              Ver Catálogo
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Catalog view
function CatalogView() {
  const { searchQuery, setSearchQuery, activeCategory, setActiveCategory, allActors } = useApifyStore();

  const categories = ['search-engines', 'social-media', 'ecommerce', 'real-estate', 'reviews', 'general', 'brazil-data', 'custom'] as ActorCategory[];
  const actors = allActors();
  const filteredActors = actors.filter(
    (a) =>
      (activeCategory === 'all' || a.category === activeCategory) &&
      (searchQuery === '' ||
        a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar atores por nome ou descrição..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 h-10"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <Badge
          variant={activeCategory === 'all' ? 'default' : 'outline'}
          className="cursor-pointer px-3 py-1"
          onClick={() => setActiveCategory('all')}
        >
          <LayoutGrid className="h-3 w-3 mr-1" />
          Todos ({actors.length})
        </Badge>
        {categories.map((cat) => {
          const count = actors.filter((a) => a.category === cat).length;
          if (count === 0) return null;
          return (
            <Badge
              key={cat}
              variant={activeCategory === cat ? 'default' : 'outline'}
              className="cursor-pointer px-3 py-1"
              onClick={() => setActiveCategory(cat)}
            >
              {categoryLabels[cat]} ({count})
            </Badge>
          );
        })}
      </div>

      <p className="text-xs text-muted-foreground">
        {filteredActors.length} ator{filteredActors.length !== 1 ? 'es' : ''} encontrado{filteredActors.length !== 1 ? 's' : ''}
      </p>

      <ActorGrid actors={filteredActors} />
    </motion.div>
  );
}

// Configure view with form and output config
function ConfigureView() {
  const { selectedActor, formValues, currentRun, setActor, setView, setRun } = useApifyStore();

  if (!selectedActor) return null;

  const isRunning = currentRun.status === 'running';

  const requiredFields = selectedActor.inputSchema.filter(f => f.required);
  const isValid = requiredFields.every(f => {
    const val = formValues[f.key];
    if (typeof val === 'string') return val.trim() !== '';
    return val != null && val !== '';
  });

  const handleRun = async () => {
    if (!isValid) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    const input: Record<string, any> = { ...formValues };

    selectedActor.inputSchema.forEach(field => {
      if (field.type === 'textarea' && input[field.key]) {
        if (['startUrls', 'feedUrls', 'urls', 'profileUrls', 'usernames', 'searchQueries', 'cnpjs', 'tickers'].includes(field.key)) {
          input[field.key] = input[field.key].split('\n').map((s: string) => s.trim()).filter(Boolean);
        }
      }
    });

    try {
      setRun({ status: 'running', progress: 0, elapsed: 0, error: null, runId: null });

      const apiKey = typeof window !== 'undefined' ? localStorage.getItem('apify_api_key') || '' : '';
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (apiKey) headers['x-apify-key'] = apiKey;

      const res = await fetch('/api/apify/run', {
        method: 'POST',
        headers,
        body: JSON.stringify({ actorId: selectedActor.id, input }),
      });

      const data = await res.json();

      if (!res.ok) {
        setRun({ status: 'failed', error: data.error || `Erro ${res.status}` });
        toast.error('Erro ao executar ator', { description: data.error || `Erro HTTP ${res.status}` });
        return;
      }

      if (!data.runId) {
        setRun({ status: 'failed', error: 'Resposta do servidor sem runId.' });
        toast.error('Erro', { description: 'Resposta sem ID de execução.' });
        return;
      }

      setRun({ runId: data.runId });
      toast.success('Execução iniciada!', { description: `Run ID: ${data.runId.substring(0, 12)}...` });
      setView('results');
    } catch (err: any) {
      console.error('handleRun error:', err);
      setRun({ status: 'failed', error: `Erro de conexão: ${err.message || 'Desconhecido'}` });
      toast.error('Erro de conexão', { description: err.message });
    }
  };

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setActor(null); setView('catalog'); }}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h2 className="text-lg font-semibold">{selectedActor.name}</h2>
          <p className="text-xs text-muted-foreground">{selectedActor.description}</p>
        </div>
        <Button onClick={handleRun} disabled={isRunning || !isValid} className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white">
          {isRunning ? (<><div className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Executando...</>) : (<><Play className="h-3.5 w-3.5" /> Executar</>)}
        </Button>
      </div>
      <RunStatusIndicator />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card><CardContent className="p-5"><DynamicFormBuilder /></CardContent></Card>
        <Card><CardContent className="p-5"><OutputConfig /></CardContent></Card>
      </div>
    </motion.div>
  );
}

// Results view
function ResultsView() {
  const { selectedActor, setView } = useApifyStore();
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { if (selectedActor) setView('configure'); else setView('catalog'); }}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            Resultados
            {selectedActor && <Badge variant="secondary" className="text-xs font-normal">{selectedActor.name}</Badge>}
          </h2>
        </div>
      </div>
      <RunStatusIndicator />
      <ResultsDashboard />
    </motion.div>
  );
}

export default function Home() {
  const { currentView, setView, setCustomActors, isAuthenticated, authLoading, user, logout } = useApifyStore();
  const [initialLoad, setInitialLoad] = useState(true);

  // Check session on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('session_token');
        if (!token) {
          useApifyStore.getState().setAuthLoading(false);
          setInitialLoad(false);
          return;
        }

        const res = await fetch('/api/auth/me', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        const data = await res.json();

        if (data.authenticated && data.user) {
          useApifyStore.getState().setUser(data.user);
        }
      } catch {
        // Not authenticated
      } finally {
        useApifyStore.getState().setAuthLoading(false);
        setInitialLoad(false);
      }
    };

    checkAuth();

    // Load custom actors
    const loadCustomActors = async () => {
      try {
        const res = await fetch('/api/apify/custom-actors');
        if (res.ok) {
          const data = await res.json();
          setCustomActors(data.actors || []);
        }
      } catch { /* silent */ }
    };
    loadCustomActors();
  }, [setCustomActors]);

  // Loading state
  if (authLoading || initialLoad) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center animate-pulse">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
    );
  }

  // Show auth gate if not authenticated
  if (!isAuthenticated) {
    return <AuthGate />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
        <div className="flex items-center h-14 px-4 gap-3">
          <div className="lg:hidden">
            <Sheet>
              <SheetContent side="left" className="p-0 w-72">
                <div className="flex items-center gap-2 p-3 border-b">
                  <div className="h-6 w-6 rounded bg-emerald-600 flex items-center justify-center">
                    <Search className="h-3.5 w-3.5 text-white" />
                  </div>
                  <span className="font-semibold text-sm">Atores</span>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Logo */}
          <div className="flex items-center gap-2.5 mr-4">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center">
              <Sparkles className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="font-bold text-sm tracking-tight hidden sm:inline">Apify Research Hub</span>
          </div>

          <div className="flex-1" />

          {/* User info and actions */}
          <div className="flex items-center gap-1.5">
            {user?.role === 'admin' && (
              <Button
                variant={currentView === 'admin' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setView('admin')}
                className="gap-1 text-xs"
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Admin</span>
              </Button>
            )}
            <Badge variant="outline" className="text-[10px] hidden sm:flex gap-1">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              {user?.name}
            </Badge>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={logout} title="Sair">
              <LogOut className="h-4 w-4" />
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        <ApifySidebar />

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto p-4 lg:p-6">
            <AnimatePresence mode="wait">
              {currentView === 'catalog' && (
                <div key="catalog">
                  <WelcomeHero
                    onExplore={() => {}}
                    onDiscover={() => setView('discover')}
                    onAISearch={() => setView('ai-search')}
                  />
                  <Separator className="my-8" />
                  <CatalogView />
                </div>
              )}
              {currentView === 'discover' && <DiscoverActors key="discover" />}
              {currentView === 'ai-search' && <AISearchView key="ai-search" />}
              {currentView === 'configure' && <ConfigureView key="configure" />}
              {currentView === 'results' && <ResultsView key="results" />}
              {currentView === 'history' && <SearchHistory key="history" />}
              {currentView === 'settings' && <ApiKeySettings key="settings" />}
              {currentView === 'admin' && <AdminPanel key="admin" />}
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}
