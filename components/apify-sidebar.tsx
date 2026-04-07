'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, MapPin, Camera, MessageCircle, ShoppingCart, Globe,
  Briefcase, Youtube, Plane, Home, Star, Mail, Package, Rss,
  Settings, History, ChevronDown, ChevronRight, Users, Sparkles,
  Building2, TrendingUp, FileSearch, Landmark, Flag, Plus,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useApifyStore } from '@/lib/store';
import { apifyActors, categoryLabels, type ActorCategory, type ApifyActor, getCategories } from '@/lib/apify-catalog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';

const iconMap: Record<string, React.ComponentType<any>> = {
  Search, MapPin, Camera, MessageCircle, ShoppingCart, Globe,
  Briefcase, Youtube, Plane, Home, Star, Mail, Package, Rss, Users,
  Building2, TrendingUp, FileSearch, Landmark, Plus,
};

const categoryColorMap: Record<string, string> = {
  'search-engines': 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  'social-media': 'bg-pink-500/10 text-pink-600 dark:text-pink-400',
  'ecommerce': 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
  'real-estate': 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
  'reviews': 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
  'general': 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
  'brazil-data': 'bg-green-500/10 text-green-600 dark:text-green-400',
  'custom': 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
};

export function ApifySidebar() {
  const {
    selectedActor, sidebarOpen, setSidebarOpen, setActor, setView,
    activeCategory, setActiveCategory, searchQuery, setSearchQuery,
    customActors, allActors,
  } = useApifyStore();
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleCategory = (cat: string) => {
    setCollapsedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  const handleSelectActor = (actor: ApifyActor) => {
    setActor(actor);
    setMobileOpen(false);
  };

  const categories = getCategories();
  const actors = allActors();

  const filteredActors = actors.filter(
    (a) =>
      (activeCategory === 'all' || a.category === activeCategory) &&
      (searchQuery === '' ||
        a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const groupedActors = categories.reduce(
    (acc, cat) => {
      acc[cat] = filteredActors.filter((a) => a.category === cat);
      return acc;
    },
    {} as Record<string, ApifyActor[]>
  );

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Discover button */}
      <div className="p-3 border-b">
        <Button
          variant="outline"
          size="sm"
          className={cn(
            'w-full justify-start gap-2 border-emerald-300 dark:border-emerald-800',
            'hover:bg-emerald-50 dark:hover:bg-emerald-950/50',
            'text-emerald-700 dark:text-emerald-400',
          )}
          onClick={() => { setView('discover'); setMobileOpen(false); }}
        >
          <Sparkles className="h-4 w-4" />
          Explorar Atores
          <span className="ml-auto text-[10px] opacity-60">Marketplace</span>
        </Button>
      </div>

      {/* Search */}
      <div className="p-3 border-b">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar atores..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-9 text-sm"
          />
        </div>
      </div>

      {/* Category filter */}
      <div className="p-3 border-b">
        <div className="flex flex-wrap gap-1">
          <Badge
            variant={activeCategory === 'all' ? 'default' : 'outline'}
            className="cursor-pointer text-xs"
            onClick={() => setActiveCategory('all')}
          >
            Todos
          </Badge>
          {categories.map((cat) => (
            <Badge
              key={cat}
              variant={activeCategory === cat ? 'default' : 'outline'}
              className={cn(
                'cursor-pointer text-xs',
                activeCategory !== cat && 'border-0',
                activeCategory === cat && categoryColorMap[cat]?.replace('/10', '/20')
              )}
              onClick={() => setActiveCategory(cat)}
            >
              {cat === 'brazil-data' && <Flag className="h-2.5 w-2.5 mr-0.5" />}
              {categoryLabels[cat]}
            </Badge>
          ))}
        </div>
      </div>

      {/* Actor list */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {categories.map((cat) => {
            const catActors = groupedActors[cat];
            if (!catActors || catActors.length === 0) return null;
            const isCollapsed = collapsedCategories.has(cat);

            return (
              <div key={cat} className="mb-1">
                <button
                  onClick={() => toggleCategory(cat)}
                  className="flex items-center gap-1 w-full px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors"
                >
                  {isCollapsed ? (
                    <ChevronRight className="h-3 w-3" />
                  ) : (
                    <ChevronDown className="h-3 w-3" />
                  )}
                  {cat === 'brazil-data' && <Flag className="h-3 w-3 text-green-500" />}
                  {categoryLabels[cat]}
                  <Badge variant="secondary" className="ml-auto text-[10px] px-1.5 py-0">
                    {catActors.length}
                  </Badge>
                </button>
                <AnimatePresence initial={false}>
                  {!isCollapsed && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {catActors.map((actor) => {
                        const IconComponent = iconMap[actor.icon] || Globe;
                        const isSelected = selectedActor?.id === actor.id;

                        return (
                          <TooltipProvider key={actor.id}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="relative group/actor">
                                  <button
                                    onClick={() => handleSelectActor(actor)}
                                    className={cn(
                                      'flex items-center gap-3 w-full px-2 py-2 rounded-lg text-sm transition-all duration-150',
                                      'hover:bg-accent',
                                      isSelected && 'bg-primary text-primary-foreground hover:bg-primary/90'
                                    )}
                                  >
                                    <IconComponent className={cn(
                                      'h-4 w-4 flex-shrink-0',
                                      isSelected ? 'text-primary-foreground' : 'text-muted-foreground'
                                    )} />
                                    <span className="truncate text-left flex-1">{actor.name}</span>
                                    {actor.isCustom && !isSelected && (
                                      <Badge variant="outline" className="text-[8px] px-1 py-0 border-purple-300 text-purple-600 dark:border-purple-700 dark:text-purple-400 flex-shrink-0">
                                        Custom
                                      </Badge>
                                    )}
                                  </button>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent side="right" className="max-w-xs">
                                <p className="font-medium">{actor.name}</p>
                                <p className="text-xs text-muted-foreground mt-1">{actor.description}</p>
                                {actor.isCustom && (
                                  <Badge variant="outline" className="mt-1.5 text-[9px]">Ator personalizado</Badge>
                                )}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
          {filteredActors.length === 0 && (
            <div className="text-center text-sm text-muted-foreground py-8">
              Nenhum ator encontrado
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Bottom actions */}
      <div className="border-t p-2 space-y-1">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2"
          onClick={() => { setView('history'); setMobileOpen(false); }}
        >
          <History className="h-4 w-4" />
          Histórico
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2"
          onClick={() => { setView('settings'); setMobileOpen(false); }}
        >
          <Settings className="h-4 w-4" />
          Configurações
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          'hidden lg:flex flex-col border-r bg-card transition-all duration-300',
          sidebarOpen ? 'w-64' : 'w-0 overflow-hidden border-r-0'
        )}
      >
        <div className="flex items-center justify-between p-3 border-b">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded bg-emerald-600 flex items-center justify-center">
                <Search className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="font-semibold text-sm">Atores</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <ChevronRight className={cn('h-4 w-4 transition-transform', !sidebarOpen && 'rotate-180')} />
          </Button>
        </div>
        {sidebarOpen && sidebarContent}
      </aside>

      {/* Mobile sidebar */}
      <div className="lg:hidden">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent side="left" className="p-0 w-72">
            <div className="flex items-center gap-2 p-3 border-b">
              <div className="h-6 w-6 rounded bg-emerald-600 flex items-center justify-center">
                <Search className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="font-semibold text-sm">Atores</span>
            </div>
            {sidebarContent}
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
