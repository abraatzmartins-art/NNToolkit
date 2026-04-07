'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useApifyStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Loader2, CheckCircle2, XCircle, Clock, Ban,
  RotateCcw,
} from 'lucide-react';

const statusConfig: Record<string, { label: string; color: string; icon: React.ComponentType<any> }> = {
  idle: { label: 'Aguardando', color: 'text-muted-foreground', icon: Clock },
  running: { label: 'Executando', color: 'text-blue-500', icon: Loader2 },
  completed: { label: 'Concluído', color: 'text-emerald-500', icon: CheckCircle2 },
  failed: { label: 'Falhou', color: 'text-destructive', icon: XCircle },
  pending: { label: 'Pendente', color: 'text-amber-500', icon: Clock },
};

export function RunStatusIndicator() {
  const { currentRun, setRun, results } = useApifyStore();
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  const config = statusConfig[currentRun.status] || statusConfig.idle;
  const Icon = config.icon;

  // Poll for status updates
  useEffect(() => {
    if (currentRun.status === 'running' && currentRun.runId) {
      startTimeRef.current = Date.now();

      pollIntervalRef.current = setInterval(async () => {
        try {
          const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
          setRun({ elapsed });

          const res = await fetch(`/api/apify/status/${currentRun.runId}`);
          const data = await res.json();

          if (data.status === 'SUCCEEDED') {
            setRun({ status: 'completed', progress: 100 });

            // Fetch results
            const resultsRes = await fetch(`/api/apify/results/${currentRun.runId}?limit=200`);
            const resultsData = await resultsRes.json();
            if (resultsRes.ok) {
              useApifyStore.getState().setResults(resultsData.items || []);
            }

            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
          } else if (data.status === 'FAILED' || data.status === 'ABORTED' || data.status === 'TIMED-OUT') {
            setRun({ status: 'failed', error: 'Execução falhou' });
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
          } else {
            setRun({
              progress: typeof data.progress === 'number' ? data.progress : Math.min(elapsed * 2, 95),
            });
          }
        } catch {
          // Continue polling
        }
      }, 3000);

      return () => {
        if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      };
    }
  }, [currentRun.status, currentRun.runId, setRun]);

  if (currentRun.status === 'idle') return null;

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'rounded-xl border p-4',
        currentRun.status === 'completed' && 'border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20',
        currentRun.status === 'failed' && 'border-destructive/30 bg-destructive/5',
        currentRun.status === 'running' && 'border-blue-500/30 bg-blue-50/50 dark:bg-blue-950/20'
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={cn('h-8 w-8 rounded-lg flex items-center justify-center',
            currentRun.status === 'running' && 'bg-blue-100 dark:bg-blue-950',
            currentRun.status === 'completed' && 'bg-emerald-100 dark:bg-emerald-950',
            currentRun.status === 'failed' && 'bg-destructive/10'
          )}>
            <Icon className={cn('h-4 w-4', config.color,
              currentRun.status === 'running' && 'animate-spin'
            )} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{config.label}</span>
              {currentRun.runId && (
                <Badge variant="outline" className="text-[10px] font-mono">
                  {currentRun.runId.substring(0, 8)}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {currentRun.status === 'running' && `Tempo: ${formatTime(currentRun.elapsed)}`}
              {currentRun.status === 'completed' && `${results.length} resultados obtidos`}
              {currentRun.status === 'failed' && currentRun.error}
            </p>
          </div>
        </div>
        {currentRun.status === 'running' && (
          <Button
            variant="outline"
            size="sm"
            className="text-xs"
            onClick={() => {
              if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
              setRun({ status: 'idle', runId: null, progress: 0, elapsed: 0 });
            }}
          >
            <Ban className="h-3 w-3 mr-1" />
            Cancelar
          </Button>
        )}
      </div>

      {currentRun.status === 'running' && (
        <div className="mt-3">
          <Progress value={currentRun.progress} className="h-1.5" />
          <p className="text-[10px] text-muted-foreground mt-1 text-right">
            {currentRun.progress}%
          </p>
        </div>
      )}
    </motion.div>
  );
}
