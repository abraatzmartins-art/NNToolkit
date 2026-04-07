'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useApifyStore, type HistoryItem } from '@/lib/store';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Clock, CheckCircle2, XCircle, Loader2, Trash2, RotateCcw,
  Search, ArrowLeft,
} from 'lucide-react';
import { toast } from 'sonner';
import { getActorById } from '@/lib/apify-catalog';

const statusIcons: Record<string, React.ComponentType<any>> = {
  pending: Clock,
  running: Loader2,
  completed: CheckCircle2,
  failed: XCircle,
};

const statusColors: Record<string, string> = {
  pending: 'text-amber-500 bg-amber-50 dark:bg-amber-950',
  running: 'text-blue-500 bg-blue-50 dark:bg-blue-950',
  completed: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950',
  failed: 'text-destructive bg-destructive/10',
};

const statusLabels: Record<string, string> = {
  pending: 'Pendente',
  running: 'Executando',
  completed: 'Concluído',
  failed: 'Falhou',
};

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return 'Agora mesmo';
  if (diffMin < 60) return `Há ${diffMin} min`;
  if (diffHr < 24) return `Há ${diffHr}h`;
  if (diffDay < 7) return `Há ${diffDay}d`;
  return date.toLocaleDateString('pt-BR');
}

export function SearchHistory() {
  const { searchHistory, setSearchHistory, setView, setActor } = useApifyStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/history');
      const data = await res.json();
      if (res.ok) {
        setSearchHistory(data.map((item: any) => ({
          ...item,
          createdAt: item.createdAt,
          completedAt: item.completedAt,
        })));
      }
    } catch {
      // Error fetching history
    } finally {
      setLoading(false);
    }
  };

  const deleteItem = async (id: string) => {
    try {
      const res = await fetch(`/api/history?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSearchHistory(searchHistory.filter((h) => h.id !== id));
        toast.success('Item removido do histórico');
      }
    } catch {
      toast.error('Erro ao remover item');
    }
  };

  const clearAll = async () => {
    try {
      const res = await fetch('/api/history', { method: 'DELETE' });
      if (res.ok) {
        setSearchHistory([]);
        toast.success('Histórico limpo');
      }
    } catch {
      toast.error('Erro ao limpar histórico');
    }
  };

  const handleReRun = (item: HistoryItem) => {
    const actor = getActorById(item.actorId);
    if (actor) {
      try {
        const params = JSON.parse(item.inputParams);
        useApifyStore.getState().setActor(actor);
        // Apply saved params
        Object.entries(params).forEach(([key, val]) => {
          useApifyStore.getState().updateFormField(key, val);
        });
        useApifyStore.getState().setView('configure');
      } catch {
        toast.error('Erro ao carregar parâmetros salvos');
      }
    } else {
      toast.error('Ator não encontrado no catálogo');
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setView('catalog')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-lg font-semibold">Histórico de Pesquisas</h2>
            <p className="text-xs text-muted-foreground">{searchHistory.length} execuções registradas</p>
          </div>
        </div>
        {searchHistory.length > 0 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="text-xs gap-1.5">
                <Trash2 className="h-3 w-3" />
                Limpar tudo
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Limpar histórico?</AlertDialogTitle>
                <AlertDialogDescription>
                  Isso removerá todos os registros de histórico permanentemente.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={clearAll}>Limpar</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      {/* History List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      ) : searchHistory.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-muted-foreground">Histórico vazio</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Suas execuções de atores aparecerão aqui
          </p>
          <Button variant="outline" className="mt-4" onClick={() => setView('catalog')}>
            Explorar Atores
          </Button>
        </div>
      ) : (
        <ScrollArea className="max-h-[600px]">
          <div className="space-y-2 pr-3">
            {searchHistory.map((item, i) => {
              const StatusIcon = statusIcons[item.status] || Clock;
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <Card className="hover:shadow-sm transition-shadow">
                    <CardContent className="p-3">
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          'h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5',
                          statusColors[item.status]
                        )}>
                          <StatusIcon className={cn('h-4 w-4',
                            item.status === 'running' && 'animate-spin'
                          )} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <p className="text-sm font-medium truncate">{item.actorName || item.actorId}</p>
                            <Badge
                              variant="secondary"
                              className="text-[10px] flex-shrink-0"
                            >
                              {statusLabels[item.status] || item.status}
                            </Badge>
                          </div>
                          <p className="text-[11px] text-muted-foreground">
                            {formatRelativeDate(item.createdAt)}
                            {item.resultsCount > 0 && ` · ${item.resultsCount} resultados`}
                          </p>
                          {item.inputParams && (
                            <p className="text-[10px] text-muted-foreground mt-1 truncate font-mono">
                              {item.inputParams.substring(0, 100)}
                              {item.inputParams.length > 100 && '...'}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {item.status === 'completed' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => handleReRun(item)}
                              title="Reexecutar"
                            >
                              <RotateCcw className="h-3.5 w-3.5" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-destructive"
                            onClick={() => deleteItem(item.id)}
                            title="Remover"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
