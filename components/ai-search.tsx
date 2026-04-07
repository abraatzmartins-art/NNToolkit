'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApifyStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles, Send, Loader2, Play, ArrowRight, RotateCcw,
  AlertCircle, CheckCircle2, Bot, History,
} from 'lucide-react';
import { toast } from 'sonner';

interface AISearchResult {
  actorId: string;
  actorName: string;
  input: Record<string, any>;
  explanation: string;
  warning: string | null;
  runId: string | null;
  runError: string | null;
  autoExecuted: boolean;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  result?: AISearchResult;
}

export function AISearchView() {
  const { setActor, setView, setFormValues, setSelectedFields, setRun, currentRun, actors: catalogActors } = useApifyStore();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [autoExecute, setAutoExecute] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSearch = async () => {
    if (!query.trim()) return;

    const userMessage: ChatMessage = { role: 'user', content: query.trim() };
    setMessages(prev => [...prev, userMessage]);
    setQuery('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userMessage.content, autoExecute }),
      });

      const data = await res.json();

      if (!res.ok) {
        const assistantMsg: ChatMessage = {
          role: 'assistant',
          content: `Erro: ${data.error}`,
        };
        setMessages(prev => [...prev, assistantMsg]);
        toast.error('Erro na busca IA', { description: data.error });
        setLoading(false);
        return;
      }

      const assistantMsg: ChatMessage = {
        role: 'assistant',
        content: data.explanation || `A IA selecionou o ator "${data.actorName}" para sua busca.`,
        result: data,
      };
      setMessages(prev => [...prev, assistantMsg]);

      if (data.runError) {
        toast.error('Erro ao executar', { description: data.runError });
      } else if (data.runId) {
        toast.success('Execução iniciada pela IA!', {
          description: `Run ID: ${data.runId.substring(0, 12)}...`,
        });
        // If auto-executed, switch to results view
        setRun({ status: 'running', progress: 0, elapsed: 0, error: null, runId: data.runId });
        setView('results');
      }
    } catch {
      const assistantMsg: ChatMessage = {
        role: 'assistant',
        content: 'Erro de conexão com o servidor.',
      };
      setMessages(prev => [...prev, assistantMsg]);
      toast.error('Erro de conexão');
    } finally {
      setLoading(false);
    }
  };

  const handleUseActor = (result: AISearchResult) => {
    // Find the actor in catalog
    const actor = catalogActors.find(a => a.id === result.actorId);
    if (!actor) {
      toast.error('Ator não encontrado no catálogo');
      return;
    }

    // Set the actor and pre-fill form values
    setActor(actor);

    // Override form values with AI suggestions
    Object.entries(result.input).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        useApifyStore.getState().updateFormField(key, value);
      }
    });

    setView('configure');
    toast.success('Ator selecionado!', { description: 'Parâmetros preenchidos pela IA. Revise e execute.' });
  };

  const handleExecuteFromResult = (result: AISearchResult) => {
    handleUseActor(result);
    // Will auto-navigate to configure view
  };

  const handleReset = () => {
    setMessages([]);
    setQuery('');
  };

  const suggestions = [
    'Buscar perfis de CTOs no LinkedIn que trabalham em fintechs em São Paulo',
    'Encontrar restaurantes bem avaliados no Google Maps em Copacabana',
    'Coletar preços de iPhones na Amazon Brasil',
    'Buscar imóveis à venda em Curitiba com até 500 mil reais',
    'Scrapar reviews de hotéis em Fernando de Noronha no Booking',
  ];

  return (
    <div className="space-y-4 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Busca com IA</h2>
            <p className="text-xs text-muted-foreground">Descreva o que procura em linguagem natural</p>
          </div>
        </div>
        {messages.length > 0 && (
          <Button variant="ghost" size="sm" onClick={handleReset} className="gap-1 text-xs">
            <RotateCcw className="h-3 w-3" />
            Limpar
          </Button>
        )}
      </div>

      {/* Chat Messages */}
      {messages.length > 0 && (
        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
          <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="h-7 w-7 rounded-lg bg-purple-100 dark:bg-purple-950 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="h-3.5 w-3.5 text-purple-600" />
                  </div>
                )}
                <div className={`max-w-[85%] rounded-xl px-4 py-3 ${
                  msg.role === 'user'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-muted border'
                }`}>
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>

                  {/* AI Result Card */}
                  {msg.result && (
                    <div className="mt-3 space-y-2">
                      {msg.result.warning && (
                        <p className="text-[11px] text-amber-600 dark:text-amber-400 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {msg.result.warning}
                        </p>
                      )}

                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="secondary" className="text-xs bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                          <Sparkles className="h-3 w-3 mr-1" />
                          {msg.result.actorName}
                        </Badge>
                        {msg.result.autoExecuted && (
                          <Badge variant="secondary" className="text-xs bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Executado automaticamente
                          </Badge>
                        )}
                      </div>

                      {/* Parameters preview */}
                      {Object.keys(msg.result.input).length > 0 && (
                        <div className="bg-background/50 rounded-lg p-2 mt-1">
                          <p className="text-[10px] font-medium text-muted-foreground mb-1">Parâmetros sugeridos:</p>
                          <div className="space-y-0.5">
                            {Object.entries(msg.result.input).map(([key, value]) => (
                              <p key={key} className="text-[11px]">
                                <span className="font-mono text-muted-foreground">{key}:</span>{' '}
                                <span className="font-medium">
                                  {typeof value === 'string' && value.length > 50
                                    ? value.substring(0, 50) + '...'
                                    : JSON.stringify(value)}
                                </span>
                              </p>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Action buttons */}
                      <div className="flex gap-2 mt-2">
                        {!msg.result.autoExecuted && msg.result.actorId && (
                          <>
                            <Button size="sm" onClick={() => handleUseActor(msg.result!)} className="gap-1 text-xs h-7">
                              <ArrowRight className="h-3 w-3" />
                              Usar este ator
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => {
                              setAutoExecute(true);
                              // Re-execute the search with autoExecute
                            }} className="gap-1 text-xs h-7">
                              <Play className="h-3 w-3" />
                              Executar direto
                            </Button>
                          </>
                        )}
                      </div>

                      {/* Error */}
                      {msg.result.runError && (
                        <p className="text-[11px] text-destructive flex items-center gap-1 mt-1">
                          <AlertCircle className="h-3 w-3" />
                          {msg.result.runError}
                        </p>
                      )}
                    </div>
                  )}
                </div>
                {msg.role === 'user' && (
                  <div className="h-7 w-7 rounded-lg bg-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                    <History className="h-3.5 w-3.5 text-white" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-3"
            >
              <div className="h-7 w-7 rounded-lg bg-purple-100 dark:bg-purple-950 flex items-center justify-center shrink-0">
                <Bot className="h-3.5 w-3.5 text-purple-600" />
              </div>
              <div className="bg-muted border rounded-xl px-4 py-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Analisando sua busca e selecionando o melhor ator...
                </div>
              </div>
            </motion.div>
          )}
          <div ref={chatEndRef} />
        </div>
      )}

      {/* Suggestions (show when no messages) */}
      {messages.length === 0 && !loading && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground font-medium">Exemplos — a busca será executada automaticamente:</p>
          <div className="grid gap-2">
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => setQuery(s)}
                className="text-left text-xs p-2.5 rounded-lg border bg-muted/30 hover:bg-muted/60 transition-colors flex items-start gap-2"
              >
                <Sparkles className="h-3.5 w-3.5 text-purple-500 shrink-0 mt-0.5" />
                <span>{s}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input area */}
      <Card>
        <CardContent className="p-3">
          <div className="flex gap-2">
            <Textarea
              ref={textareaRef}
              placeholder="Descreva o que você quer buscar... (ex: perfis de desenvolvedores no LinkedIn)"
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="min-h-[60px] max-h-[120px] text-sm resize-none"
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSearch();
                }
              }}
            />
          </div>
          <div className="flex items-center justify-between mt-2">
            <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={autoExecute}
                onChange={e => setAutoExecute(e.target.checked)}
                className="rounded"
              />
              Executar automaticamente (ativado)
            </label>
            <Button
              onClick={handleSearch}
              disabled={loading || !query.trim()}
              className="gap-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs"
              size="sm"
            >
              {loading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Send className="h-3.5 w-3.5" />
              )}
              {loading ? 'Analisando...' : 'Buscar com IA'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
