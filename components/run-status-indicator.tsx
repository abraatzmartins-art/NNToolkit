'use client';

import { useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useApifyStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Loader2, CheckCircle2, XCircle, Clock, Ban,
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
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const runIdRef = useRef<string | null>(null);

  // Keep runIdRef in sync
  useEffect(() => {
    if (currentRun.runId) {
      runIdRef.current = currentRun.runId;
    }
  }, [currentRun.runId]);

  // Cancel polling helper
  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  }, []);

  // Reset on idle
  useEffect(() => {
    if (currentRun.status === 'idle') {
      stopPolling();
      runIdRef.current = null;
      startTimeRef.current = Date.now();
    }
  }, [currentRun.status, stopPolling]);

  // Poll for status updates
  useEffect(() => {
    if (currentRun.status !== 'running' || !currentRun.runId) return;

    startTimeRef.current = Date.now();
    const runId = currentRun.runId;

    const poll = async () => {
      try {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setRun({ elapsed });

        // Send x-apify-key only if available in localStorage
        // Server will fallback to process.env.APIFY_API_KEY
        const apiKey = typeof window !== 'undefined' ? localStorage.getItem('apify_api_key') : null;
        const headers: Record<string, string> = {};
        if (apiKey) {
          headers['x-apify-key'] = apiKey;
        }

        const res = await fetch(`/api/apify/status/${runId}`, { headers });

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          setRun({
            status: 'failed',
            error: errorData.error || `Erro do servidor: ${res.status}`,
          });
          stopPolling();
          return;
        }

        const data = await res.json();

        if (data.status === 'SUCCEEDED') {
          setRun({ status: 'completed', progress: 100 });
          stopPolling();

          // Fetch results
          const resultHeaders: Record<string, string> = {};
          if (apiKey) resultHeaders['x-apify-key'] = apiKey;

          try {
            const resultsRes = await fetch(`/api/apify/results/${runId}?limit=200`, {
              headers: resultHeaders,
            });
            const resultsData = await resultsRes.json();
            if (resultsRes.ok && resultsData.items) {
              useApifyStore.getState().setResults(resultsData.items);
            }
          } catch (fetchErr) {
            console.error('Error fetching results:', fetchErr);
          }
        } else if (data.status === 'FAILED' || data.status === 'ABORTED' || data.status === 'TIMED-OUT') {
          const errorMsg = data.status === 'FAILED'
            ? (data.message || data.error || 'Falha na execução do ator')
            : `Execução ${data.status}`;
          setRun({ status: 'failed', error: errorMsg });
          stopPolling();
        } else {
          // RUNNING, READY, PENDING etc.
          const estimatedProgress = typeof data.progress === 'number'
            ? data.progress
            : Math.min(elapsed * 2, 95);
          setRun({ progress: estimatedProgress });
        }
      } catch (err: any) {
        console.error('Poll error:', err);
        // Don't fail on network errors - keep polling
      }
    };

    // Poll immediately, then every 3 seconds
    poll();
    pollIntervalRef.current = setInterval(poll, 3000);

    return () => {
      stopPolling();
    };
  }, [currentRun.status, currentRun.runId, setRun, stopPolling]);

  if (currentRun.status === 'idle') return null;

  const config = statusConfig[currentRun.status] || statusConfig.idle;
  const Icon = config.icon;

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
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{config.label}</span>
              {currentRun.runId && (
                <Badge variant="outline" className="text-[10px] font-mono">
                  {currentRun.runId.substring(0, 8)}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground break-words">
              {currentRun.status === 'running' && (
                <>
                  Tempo: {formatTime(currentRun.elapsed)}
                  {!currentRun.runId && ' • Aguardando resposta do servidor...'}
                </>
              )}
              {currentRun.status === 'completed' && `${results.length} resultados obtidos`}
              {currentRun.status === 'failed' && (
                <>
                  {currentRun.error || 'Erro desconhecido'}
                  {!currentRun.runId && ' • Verifique se a chave API está configurada'}
                </>
              )}
            </p>
          </div>
        </div>
        {(currentRun.status === 'running' || currentRun.status === 'failed') && (
          <Button
            variant="outline"
            size="sm"
            className="text-xs shrink-0"
            onClick={() => {
              stopPolling();
              setRun({ status: 'idle', runId: null, progress: 0, elapsed: 0, error: null });
            }}
          >
            {currentRun.status === 'running' ? (
              <>
                <Ban className="h-3 w-3 mr-1" />
                Cancelar
              </>
            ) : (
              <>
                <XCircle className="h-3 w-3 mr-1" />
                Fechar
              </>
            )}
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
