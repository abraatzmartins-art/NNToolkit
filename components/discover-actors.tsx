'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Download, Trash2, ExternalLink, Sparkles, Flag,
  Building2, Globe, TrendingUp, Users, ShoppingCart, Star,
  Home, MessageCircle, Camera, Mail, Package, Rss, Youtube,
  MapPin, Briefcase, Plane, MessageSquare, FileSearch, Landmark,
  Zap, Settings, Code, Database, BarChart3, Shield, Bot, Wifi,
  FileText, Monitor, Smartphone, Layers, Link, Image, Video,
  Terminal, Cpu, HardDrive, Cloud, Lock, Fingerprint,
  Plus, Check, X, ChevronDown, Loader2, ArrowLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useApifyStore } from '@/lib/store';
import { apifyActors, categoryLabels, type ActorCategory, type ApifyActor, type ActorParamField } from '@/lib/apify-catalog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

// Icon map for selection
const allIcons: Record<string, React.ComponentType<any>> = {
  Globe, Search, MapPin, Camera, MessageCircle, ShoppingCart, Users,
  Briefcase, Youtube, Plane, Home, Star, Mail, Package, Rss,
  Building2, TrendingUp, FileSearch, Landmark, Settings, Code,
  Database, BarChart3, Shield, Bot, Wifi, FileText, Monitor,
  Smartphone, Layers, Link, Image, Video, Terminal, Cpu,
  HardDrive, Cloud, Lock, Fingerprint, Zap, Plus,
};

// Preset colors
const presetColors = [
  { name: 'Esmeralda', value: '#059669' },
  { name: 'Verde Bandeira', value: '#009C3B' },
  { name: 'Azul Royal', value: '#005AA0' },
  { name: 'Roxo', value: '#7C3AED' },
  { name: 'Rosa', value: '#EC4899' },
  { name: 'Vermelho', value: '#EF4444' },
  { name: 'Laranja', value: '#F97316' },
  { name: 'Âmbar', value: '#D97706' },
  { name: 'Ciano', value: '#06B6D4' },
  { name: 'Azul Celeste', value: '#0EA5E9' },
  { name: 'Azul Escuro', value: '#2563EB' },
  { name: 'Amarelo Ouro', value: '#CA8A04' },
];

interface DiscoveredActor {
  id: string;
  actorId: string;
  name: string;
  description: string;
  username: string;
  stats: {
    totalRuns: number;
    uniqueUsers: number;
  };
  url?: string;
  image?: string | null;
}

// Brazilian pre-configured actors
const brazilianActors = apifyActors.filter((a) => a.category === 'brazil-data');

interface InstallDialogState {
  open: boolean;
  actor: DiscoveredActor | null;
  info: any | null;
  loading: boolean;
  // Form fields
  name: string;
  description: string;
  category: ActorCategory;
  icon: string;
  color: string;
  selectedFields: Set<string>;
  fieldLabels: Record<string, string>;
}

export function DiscoverActors() {
  const { setActor, setView, customActors, setCustomActors, removeCustomActor } = useApifyStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<DiscoveredActor[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const [dialog, setDialog] = useState<InstallDialogState>({
    open: false,
    actor: null,
    info: null,
    loading: false,
    name: '',
    description: '',
    category: 'custom',
    icon: 'Globe',
    color: '#059669',
    selectedFields: new Set(),
    fieldLabels: {},
  });

  const installedIds = new Set(customActors.map((a) => a.id));

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setHasSearched(true);

    try {
      const apiKey = localStorage.getItem('apify_api_key');
      if (!apiKey) {
        toast.error('Chave API não configurada', { description: 'Vá em Configurações e salve sua chave API.' });
        return;
      }
      const res = await fetch(`/api/apify/discover?query=${encodeURIComponent(searchQuery)}&limit=20`, {
        headers: { 'x-apify-key': apiKey },
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error('Erro na busca', { description: data.error });
        return;
      }

      setSearchResults(data.actors || []);
    } catch {
      toast.error('Erro', { description: 'Não foi possível conectar ao servidor.' });
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const openInstallDialog = async (actor: DiscoveredActor) => {
    // Check if already installed
    if (customActors.some((a) => a.id === actor.actorId)) {
      toast.info('Ator já instalado');
      return;
    }

    setDialog((prev) => ({
      ...prev,
      open: true,
      actor,
      loading: true,
      name: actor.name,
      description: actor.description,
      selectedFields: new Set(),
      fieldLabels: {},
    }));

    try {
      const apiKey = localStorage.getItem('apify_api_key');
      const res = await fetch(`/api/apify/actor-info?actorId=${encodeURIComponent(actor.actorId)}`, {
        headers: apiKey ? { 'x-apify-key': apiKey } : {},
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error('Erro ao buscar detalhes', { description: data.error });
        setDialog((prev) => ({ ...prev, loading: false }));
        return;
      }

      const labels: Record<string, string> = {};
      const selected: Set<string> = new Set();
      data.inputSchema?.forEach((f: ActorParamField) => {
        selected.add(f.key);
        labels[f.key] = f.label;
      });

      setDialog((prev) => ({
        ...prev,
        info: data,
        loading: false,
        selectedFields: selected,
        fieldLabels: labels,
        outputFields: data.outputFields || [],
      }));
    } catch {
      toast.error('Erro', { description: 'Não foi possível buscar detalhes do ator.' });
      setDialog((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleInstall = async () => {
    if (!dialog.info || !dialog.actor) return;

    const finalSchema = dialog.info.inputSchema
      ?.filter((f: ActorParamField) => dialog.selectedFields.has(f.key))
      .map((f: ActorParamField) => ({
        ...f,
        label: dialog.fieldLabels[f.key] || f.label,
      })) || [];

    try {
      const res = await fetch('/api/apify/install-actor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actorId: dialog.actor.actorId,
          name: dialog.name,
          description: dialog.description,
          category: dialog.category,
          icon: dialog.icon,
          color: dialog.color,
          inputSchema: finalSchema,
          outputFields: dialog.info.outputFields || [],
          pricingInfo: dialog.info.pricingInfo || '',
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error('Erro ao instalar', { description: data.error });
        return;
      }

      toast.success('Ator instalado com sucesso!', {
        description: `"${dialog.name}" está disponível no catálogo.`,
      });

      // Refresh custom actors
      const customRes = await fetch('/api/apify/custom-actors');
      const customData = await customRes.json();
      if (customRes.ok) {
        setCustomActors(customData.actors || []);
      }

      setDialog((prev) => ({ ...prev, open: false }));
    } catch {
      toast.error('Erro', { description: 'Não foi possível instalar o ator.' });
    }
  };

  const handleUninstall = async (customId: string, name: string) => {
    try {
      const res = await fetch(`/api/apify/custom-actors?id=${encodeURIComponent(customId)}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error('Erro ao remover', { description: data.error });
        return;
      }

      removeCustomActor(customId);
      toast.success('Ator removido', { description: `"${name}" foi desinstalado.` });
    } catch {
      toast.error('Erro', { description: 'Não foi possível remover o ator.' });
    }
  };

  // Quick install a Brazilian actor to custom actors
  const quickInstallBrazilian = (actor: ApifyActor) => {
    // Since these are already in the built-in catalog, just navigate to configure
    setActor(actor);
    toast.info('Ator disponível no catálogo!', { description: `"${actor.name}" já está nos Dados Brasil.` });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold">Marketplace de Atores</h1>
          <p className="text-sm text-muted-foreground">
            Busque, descubra e instale novos atores do Apify Store
          </p>
        </div>
      </div>

      {/* Brazilian Data Section */}
      <Card className="border-emerald-200 dark:border-emerald-900/50">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
              <Flag className="h-4 w-4" />
              <span className="font-semibold text-sm">Fontes de Dados Brasileiras</span>
            </div>
            <Badge variant="secondary" className="text-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              {brazilianActors.length} disponíveis
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mb-4">
            Atores otimizados para dados públicos brasileiros: CNPJ, B3, FIIs, indicadores do Banco Central e mais.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {brazilianActors.map((actor) => {
              const IconComponent = allIcons[actor.icon] || Globe;
              return (
                <motion.div
                  key={actor.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card
                    className="cursor-pointer hover:shadow-md transition-all border-0 bg-muted/50"
                    onClick={() => quickInstallBrazilian(actor)}
                  >
                    <CardContent className="p-3 flex items-center gap-3">
                      <div
                        className="flex-shrink-0 h-9 w-9 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: actor.color + '20', color: actor.color }}
                      >
                        <IconComponent className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{actor.name}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{actor.pricingInfo}</p>
                      </div>
                      <Button size="sm" variant="ghost" className="h-7 text-xs text-emerald-600 dark:text-emerald-400 flex-shrink-0">
                        Usar
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Search Section */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Search className="h-4 w-4 text-muted-foreground" />
            <h2 className="font-semibold text-sm">Buscar no Apify Store</h2>
          </div>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Input
                placeholder="Buscar atores no Apify Store... (ex: web scraper, amazon, linkedin)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="pr-4"
              />
            </div>
            <Button
              onClick={handleSearch}
              disabled={isSearching || !searchQuery.trim()}
              className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
            >
              {isSearching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              Buscar
            </Button>
          </div>

          {/* Quick search suggestions */}
          {!hasSearched && (
            <div className="flex flex-wrap gap-2 mt-3">
              {['web scraper', 'amazon', 'google maps', 'instagram', 'linkedin', 'real estate', 'brazil data', 'email'].map((suggestion) => (
                <Badge
                  key={suggestion}
                  variant="outline"
                  className="cursor-pointer text-xs hover:bg-accent"
                  onClick={() => {
                    setSearchQuery(suggestion);
                    setTimeout(() => {
                      const fakeEvent = { key: 'Enter' } as React.KeyboardEvent;
                      handleKeyDown(fakeEvent);
                    }, 0);
                  }}
                >
                  {suggestion}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Search Results */}
      <AnimatePresence>
        {hasSearched && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            {isSearching ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i}>
                    <CardContent className="p-5">
                      <Skeleton className="h-5 w-3/4 mb-3" />
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-2/3 mb-4" />
                      <div className="flex justify-between">
                        <Skeleton className="h-6 w-24" />
                        <Skeleton className="h-8 w-20" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : searchResults.length > 0 ? (
              <>
                <p className="text-xs text-muted-foreground mb-3">
                  {searchResults.length} ator{searchResults.length !== 1 ? 'es' : ''} encontrado{searchResults.length !== 1 ? 's' : ''}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {searchResults.map((actor, i) => {
                    const isInstalled = installedIds.has(actor.actorId);
                    return (
                      <motion.div
                        key={actor.actorId}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                      >
                        <Card className="group transition-all hover:shadow-lg hover:shadow-emerald-500/5 hover:border-emerald-500/30">
                          <CardContent className="p-5">
                            <div className="flex items-start gap-3 mb-3">
                              {actor.image ? (
                                <img
                                  src={actor.image}
                                  alt={actor.name}
                                  className="h-10 w-10 rounded-xl object-cover flex-shrink-0"
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                                  <Sparkles className="h-5 w-5 text-white" />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-sm leading-tight truncate">{actor.name}</h3>
                                <p className="text-[10px] text-muted-foreground mt-0.5">
                                  por <span className="text-emerald-600 dark:text-emerald-400">@{actor.username}</span>
                                </p>
                              </div>
                            </div>

                            <p className="text-xs text-muted-foreground leading-relaxed mb-3 line-clamp-2">
                              {actor.description}
                            </p>

                            <div className="flex items-center gap-3 mb-3 text-[10px] text-muted-foreground">
                              {actor.stats.totalRuns > 0 && (
                                <span className="flex items-center gap-1">
                                  <Zap className="h-3 w-3" />
                                  {actor.stats.totalRuns.toLocaleString()} execuções
                                </span>
                              )}
                              {actor.stats.uniqueUsers > 0 && (
                                <span className="flex items-center gap-1">
                                  <Users className="h-3 w-3" />
                                  {actor.stats.uniqueUsers.toLocaleString()} usuários
                                </span>
                              )}
                            </div>

                            <div className="flex items-center justify-between">
                              <Badge variant="secondary" className="text-[10px]">
                                Apify Store
                              </Badge>
                              <Button
                                size="sm"
                                variant={isInstalled ? 'secondary' : 'default'}
                                className={cn(
                                  'h-7 text-xs gap-1',
                                  isInstalled
                                    ? ''
                                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                )}
                                disabled={isInstalled}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openInstallDialog(actor);
                                }}
                              >
                                {isInstalled ? (
                                  <>
                                    <Check className="h-3 w-3" />
                                    Instalado
                                  </>
                                ) : (
                                  <>
                                    <Download className="h-3 w-3" />
                                    Instalar
                                  </>
                                )}
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              </>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Search className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
                  <p className="text-sm font-medium text-muted-foreground">Nenhum ator encontrado</p>
                  <p className="text-xs text-muted-foreground mt-1">Tente termos diferentes ou mais específicos</p>
                </CardContent>
              </Card>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* My Installed Actors Section */}
      {customActors.length > 0 && (
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Plus className="h-4 w-4 text-muted-foreground" />
              <h2 className="font-semibold text-sm">Meus Atores Instalados</h2>
              <Badge variant="secondary" className="text-[10px]">{customActors.length}</Badge>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {customActors.map((customActor: any) => {
                const IconComponent = allIcons[customActor.icon] || Globe;
                return (
                  <div
                    key={customActor.id}
                    className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                  >
                    <div
                      className="h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: (customActor.color || '#6366f1') + '20', color: customActor.color || '#6366f1' }}
                    >
                      <IconComponent className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{customActor.name}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{customActor.actorId}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 flex-shrink-0 gap-1"
                      onClick={() => handleUninstall(customActor.id, customActor.name)}
                    >
                      <Trash2 className="h-3 w-3" />
                      Desinstalar
                    </Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Install Dialog */}
      <Dialog open={dialog.open} onOpenChange={(open) => setDialog((prev) => ({ ...prev, open }))}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Download className="h-5 w-5 text-emerald-600" />
              Instalar Ator
            </DialogTitle>
          </DialogHeader>

          {dialog.loading ? (
            <div className="flex-1 flex items-center justify-center py-8">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3 text-emerald-600" />
                <p className="text-sm text-muted-foreground">Buscando informações do ator...</p>
              </div>
            </div>
          ) : dialog.info ? (
            <div className="flex-1 overflow-y-auto space-y-5">
              {/* Basic Info */}
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label>Nome do Ator</Label>
                  <Input
                    value={dialog.name}
                    onChange={(e) => setDialog((prev) => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Descrição</Label>
                  <Textarea
                    value={dialog.description}
                    onChange={(e) => setDialog((prev) => ({ ...prev, description: e.target.value }))}
                    rows={2}
                  />
                </div>
              </div>

              <Separator />

              {/* Category */}
              <div className="space-y-2">
                <Label>Categoria</Label>
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(categoryLabels) as ActorCategory[]).map((cat) => (
                    <Badge
                      key={cat}
                      variant={dialog.category === cat ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => setDialog((prev) => ({ ...prev, category: cat }))}
                    >
                      {categoryLabels[cat]}
                    </Badge>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Icon Selection */}
              <div className="space-y-2">
                <Label>Ícone</Label>
                <div className="grid grid-cols-8 sm:grid-cols-10 gap-1.5">
                  {Object.entries(allIcons).slice(0, 40).map(([name, IconComponent]) => (
                    <button
                      key={name}
                      type="button"
                      className={cn(
                        'h-9 w-9 rounded-lg flex items-center justify-center transition-all border',
                        dialog.icon === name
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600'
                          : 'border-transparent hover:bg-accent'
                      )}
                      onClick={() => setDialog((prev) => ({ ...prev, icon: name }))}
                    >
                      <IconComponent className="h-4 w-4" />
                    </button>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Color Selection */}
              <div className="space-y-2">
                <Label>Cor</Label>
                <div className="flex flex-wrap gap-2">
                  {presetColors.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      className={cn(
                        'h-8 w-8 rounded-full transition-all border-2',
                        dialog.color === c.value ? 'border-foreground scale-110' : 'border-transparent hover:scale-105'
                      )}
                      style={{ backgroundColor: c.value }}
                      title={c.name}
                      onClick={() => setDialog((prev) => ({ ...prev, color: c.value }))}
                    />
                  ))}
                </div>
              </div>

              <Separator />

              {/* Input Fields Selection */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Campos de Entrada ({dialog.selectedFields.size} selecionados)</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs"
                    onClick={() => {
                      const allKeys = new Set(dialog.info.inputSchema?.map((f: ActorParamField) => f.key) || []);
                      setDialog((prev) => ({
                        ...prev,
                        selectedFields: dialog.selectedFields.size === allKeys.size ? new Set() : allKeys,
                      }));
                    }}
                  >
                    {dialog.selectedFields.size === (dialog.info.inputSchema?.length || 0) ? 'Desmarcar todos' : 'Marcar todos'}
                  </Button>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {dialog.info.inputSchema?.map((field: ActorParamField) => (
                    <div
                      key={field.key}
                      className={cn(
                        'flex items-center gap-2 p-2 rounded-lg border transition-colors',
                        dialog.selectedFields.has(field.key) ? 'border-emerald-200 bg-emerald-50/50 dark:border-emerald-800 dark:bg-emerald-950/20' : 'opacity-50'
                      )}
                    >
                      <Checkbox
                        checked={dialog.selectedFields.has(field.key)}
                        onCheckedChange={(checked) => {
                          setDialog((prev) => {
                            const next = new Set(prev.selectedFields);
                            if (checked) next.add(field.key);
                            else next.delete(field.key);
                            return { ...prev, selectedFields: next };
                          });
                        }}
                      />
                      <div className="flex-1">
                        <Input
                          value={dialog.fieldLabels[field.key] || field.label}
                          onChange={(e) =>
                            setDialog((prev) => ({
                              ...prev,
                              fieldLabels: { ...prev.fieldLabels, [field.key]: e.target.value },
                            }))
                          }
                          className="h-7 text-xs"
                          disabled={!dialog.selectedFields.has(field.key)}
                        />
                      </div>
                      <Badge variant="outline" className="text-[10px] flex-shrink-0">
                        {field.type}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}

          <DialogFooter className="flex-shrink-0 pt-2">
            <Button
              variant="outline"
              onClick={() => setDialog((prev) => ({ ...prev, open: false }))}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleInstall}
              disabled={!dialog.info || dialog.selectedFields.size === 0 || !dialog.name.trim()}
              className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
            >
              <Download className="h-4 w-4" />
              Instalar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
