'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Search, MapPin, Camera, MessageCircle, ShoppingCart, Globe,
  Briefcase, Youtube, Plane, Home, Star, Mail, Package, Rss, Users,
  ArrowRight, Zap, X, Building2, TrendingUp, FileSearch, Landmark, Plus,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useApifyStore } from '@/lib/store';
import { type ApifyActor, categoryLabels } from '@/lib/apify-catalog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const iconMap: Record<string, React.ComponentType<any>> = {
  Search, MapPin, Camera, MessageCircle, ShoppingCart, Globe,
  Briefcase, Youtube, Plane, Home, Star, Mail, Package, Rss, Users,
  Building2, TrendingUp, FileSearch, Landmark, Plus,
};

const categoryColorMap: Record<string, string> = {
  'search-engines': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
  'social-media': 'bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300',
  'ecommerce': 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300',
  'real-estate': 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300',
  'reviews': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300',
  'general': 'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300',
  'brazil-data': 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300',
  'custom': 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300',
};

interface ActorCardProps {
  actor: ApifyActor;
  index?: number;
}

export function ActorCard({ actor, index = 0 }: ActorCardProps) {
  const { setActor, removeCustomActor } = useApifyStore();
  const [confirmRemove, setConfirmRemove] = useState(false);
  const IconComponent = iconMap[actor.icon] || Globe;

  const handleRemove = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!confirmRemove) {
      setConfirmRemove(true);
      setTimeout(() => setConfirmRemove(false), 3000);
      return;
    }

    if (!actor.customId) return;

    try {
      const res = await fetch(`/api/apify/custom-actors?id=${encodeURIComponent(actor.customId)}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error('Erro ao remover', { description: data.error });
        return;
      }

      removeCustomActor(actor.customId);
      toast.success('Ator removido', { description: `"${actor.name}" foi desinstalado.` });
    } catch {
      toast.error('Erro', { description: 'Não foi possível remover o ator.' });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Card
        className={cn(
          'group relative cursor-pointer transition-all duration-200',
          'hover:shadow-lg hover:shadow-emerald-500/5 hover:border-emerald-500/30',
          'hover:-translate-y-0.5'
        )}
        onClick={() => setActor(actor)}
      >
        {/* Remove button for custom actors */}
        {actor.isCustom && (
          <button
            onClick={handleRemove}
            className={cn(
              'absolute top-2 right-2 z-10 h-6 w-6 rounded-full flex items-center justify-center',
              'transition-all opacity-0 group-hover:opacity-100',
              confirmRemove
                ? 'bg-red-500 text-white scale-110'
                : 'bg-red-100 dark:bg-red-950 text-red-500 hover:bg-red-200 dark:hover:bg-red-900'
            )}
            title={confirmRemove ? 'Clique novamente para confirmar' : 'Remover ator'}
          >
            {confirmRemove ? (
              <span className="text-[10px] font-bold">!</span>
            ) : (
              <X className="h-3 w-3" />
            )}
          </button>
        )}

        <CardContent className="p-5">
          {/* Header */}
          <div className="flex items-start gap-3 mb-3">
            <div
              className="flex-shrink-0 h-10 w-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: actor.color + '18', color: actor.color }}
            >
              <IconComponent className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm leading-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                {actor.name}
              </h3>
              <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                <Badge
                  variant="secondary"
                  className={cn('text-[10px] font-medium', categoryColorMap[actor.category])}
                >
                  {categoryLabels[actor.category]}
                </Badge>
                {actor.isCustom && (
                  <Badge variant="outline" className="text-[9px] border-purple-300 text-purple-600 dark:border-purple-700 dark:text-purple-400">
                    Custom
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          <p className="text-xs text-muted-foreground leading-relaxed mb-3 line-clamp-2">
            {actor.description}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              {actor.pricingInfo}
            </span>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 text-xs text-emerald-600 dark:text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity gap-1"
              onClick={(e) => {
                e.stopPropagation();
                setActor(actor);
              }}
            >
              Configurar
              <ArrowRight className="h-3 w-3" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

interface ActorGridProps {
  actors: ApifyActor[];
}

export function ActorGrid({ actors }: ActorGridProps) {
  if (actors.length === 0) {
    return (
      <div className="text-center py-16">
        <Search className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
        <h3 className="text-lg font-medium text-muted-foreground">Nenhum ator encontrado</h3>
        <p className="text-sm text-muted-foreground mt-1">Tente ajustar os filtros de busca</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
      {actors.map((actor, i) => (
        <ActorCard key={`${actor.id}-${actor.customId || 'builtin'}`} actor={actor} index={i} />
      ))}
    </div>
  );
}
