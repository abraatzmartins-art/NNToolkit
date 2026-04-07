'use client';

import { useEffect, useState } from 'react';
import { useApifyStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Key, CheckCircle2, XCircle, Eye, EyeOff, Loader2, ExternalLink, Trash2, Server, Monitor, Database, HardDrive, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';

const STORAGE_KEY = 'apify_api_key';

interface ServerInfo {
  configured: boolean;
  isEnvVar: boolean;
  isDb: boolean;
  stats: {
    totalRuns: number;
    completedRuns: number;
    totalResults: number;
    customActors: number;
    savedQueries: number;
    totalStorage: string;
  } | null;
}

export function ApiKeySettings() {
  const { setView } = useApifyStore();
  const [apiKey, setApiKey] = useState('');
  const [savedKey, setSavedKey] = useState<string | null>(null);
  const [showKey, setShowKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [serverInfo, setServerInfo] = useState<ServerInfo | null>(null);
  const [checking, setChecking] = useState(true);
  const [savingToDb, setSavingToDb] = useState(false);

  useEffect(() => {
    // Load key from localStorage
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setSavedKey(stored);
      useApifyStore.getState().setApiKeyConfigured(true);
    }

    // Check server status
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        setServerInfo(data);
        if (!stored && data.configured) {
          useApifyStore.getState().setApiKeyConfigured(true);
        }
        setChecking(false);
      })
      .catch(() => {
        setChecking(false);
      });
  }, []);

  const testAndSave = async () => {
    const key = apiKey.trim();
    if (!key || !key.startsWith('apify_api_')) {
      toast.error('Formato inválido', { description: 'A chave deve começar com "apify_api_"' });
      return;
    }

    setTesting(true);
    try {
      const res = await fetch('https://api.apify.com/v2/me', {
        headers: { 'Authorization': `Bearer ${key}` },
      });

      if (!res.ok) {
        toast.error('Chave inválida', { description: 'Verifique sua chave API e tente novamente.' });
        setTesting(false);
        return;
      }

      const data = await res.json();

      // Save to localStorage
      localStorage.setItem(STORAGE_KEY, key);
      setSavedKey(key);
      setApiKey('');
      useApifyStore.getState().setApiKeyConfigured(true);

      // Also save to DB for persistence
      try {
        await fetch('/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ apiKey: key }),
        });
      } catch {
        // DB save is optional
      }

      toast.success('Chave API salva!', {
        description: `Conectado como: ${data.username || data.email || 'usuário Apify'}. Salva no navegador e no banco de dados.`,
      });
    } catch {
      toast.error('Erro de conexão', { description: 'Não foi possível conectar ao Apify.' });
    } finally {
      setTesting(false);
    }
  };

  const removeKey = () => {
    localStorage.removeItem(STORAGE_KEY);
    setSavedKey(null);
    useApifyStore.getState().setApiKeyConfigured(!!serverInfo?.configured);
    toast.success('Chave API removida do navegador');
  };

  const maskedKey = savedKey
    ? savedKey.substring(0, 10) + '...' + savedKey.substring(savedKey.length - 4)
    : null;

  const isConfigured = savedKey || serverInfo?.configured;

  const stats = serverInfo?.stats;

  return (
    <div className="space-y-6 max-w-lg">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setView('catalog')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-lg font-semibold">Configurações</h2>
          <p className="text-xs text-muted-foreground">Gerenciar chave API e banco de dados</p>
        </div>
      </div>

      {/* Status Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Key className="h-4 w-4" />
            Status da Chave API
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            {isConfigured ? (
              <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 text-xs gap-1.5 py-1.5 px-3">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {savedKey
                  ? <>Chave configurada: {maskedKey}</>
                  : <>Chave configurada via {serverInfo?.isEnvVar ? 'Environment Variable' : 'Banco de Dados'}</>}
              </Badge>
            ) : (
              <Badge variant="secondary" className="bg-destructive/10 text-destructive text-xs gap-1.5 py-1.5 px-3">
                <XCircle className="h-3.5 w-3.5" />
                Não configurada
              </Badge>
            )}
          </div>

          {/* Source indicators */}
          <div className="grid grid-cols-3 gap-2 text-[11px]">
            <div className="flex flex-col items-center gap-1 p-2 rounded-md bg-muted/50">
              <Server className="h-3.5 w-3.5 text-muted-foreground" />
              <span className={serverInfo?.isEnvVar ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-muted-foreground'}>
                {checking ? '...' : serverInfo?.isEnvVar ? '✓ Env Var' : '✗ Env Var'}
              </span>
            </div>
            <div className="flex flex-col items-center gap-1 p-2 rounded-md bg-muted/50">
              <Monitor className="h-3.5 w-3.5 text-muted-foreground" />
              <span className={savedKey ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-muted-foreground'}>
                {savedKey ? '✓ Navegador' : '✗ Navegador'}
              </span>
            </div>
            <div className="flex flex-col items-center gap-1 p-2 rounded-md bg-muted/50">
              <Database className="h-3.5 w-3.5 text-muted-foreground" />
              <span className={serverInfo?.isDb ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-muted-foreground'}>
                {checking ? '...' : serverInfo?.isDb ? '✓ Banco' : '✗ Banco'}
              </span>
            </div>
          </div>

          {(serverInfo?.isEnvVar || serverInfo?.isDb) && (
            <p className="text-[11px] text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 p-2 rounded-md">
              {serverInfo?.isEnvVar && 'Environment Variable configurada no Vercel. '}
              {serverInfo?.isDb && 'Chave salva no banco de dados Turso. '}
              Você já pode executar atores sem configurar no navegador.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Database Stats */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Database className="h-4 w-4" />
            Banco de Dados (Turso)
          </CardTitle>
          <CardDescription className="text-xs">
            Dados persistidos na nuvem — não perdem ao reiniciar
          </CardDescription>
        </CardHeader>
        <CardContent>
          {stats ? (
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: BarChart3, label: 'Execuções', value: stats.totalRuns, sub: `${stats.completedRuns} concluídas` },
                { icon: HardDrive, label: 'Resultados', value: stats.totalResults, sub: `Armazenados` },
                { icon: Database, label: 'Atores Custom', value: stats.customActors, sub: 'Instalados' },
                { icon: Server, label: 'Templates', value: stats.savedQueries, sub: 'Salvos' },
              ].map(({ icon: Icon, label, value, sub }) => (
                <div key={label} className="flex items-center gap-2.5 p-2.5 rounded-lg bg-muted/50">
                  <div className="h-8 w-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center shrink-0">
                    <Icon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">{value}</p>
                    <p className="text-[10px] text-muted-foreground">{label}</p>
                    <p className="text-[9px] text-muted-foreground">{sub}</p>
                  </div>
                </div>
              ))}
              <div className="col-span-2 text-[10px] text-muted-foreground text-center pt-1">
                Armazenamento usado: <span className="font-medium">{stats.totalStorage}</span> de 5 GB
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-4 text-xs text-muted-foreground">
              {checking ? 'Carregando...' : 'Banco de dados não conectado'}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save Key Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Key className="h-4 w-4" />
            Salvar Chave API
          </CardTitle>
          <CardDescription className="text-xs">
            Salva no navegador E no banco de dados. Funciona mesmo após limpar cache do navegador.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs">{savedKey ? 'Nova chave (para trocar):' : 'Chave API do Apify:'}</Label>
            <div className="relative">
              <Input
                type={showKey ? 'text' : 'password'}
                placeholder="apify_api_..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="pr-20 font-mono text-sm"
              />
              <div className="absolute right-1 top-1/2 -translate-y-1/2 flex gap-1">
                <button onClick={() => setShowKey(!showKey)} className="p-1 text-muted-foreground hover:text-foreground">
                  {showKey ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={testAndSave} size="sm" disabled={!apiKey.trim() || testing} className="gap-1.5 text-xs">
              {testing ? <Loader2 className="h-3 w-3 animate-spin" /> : <ExternalLink className="h-3 w-3" />}
              {testing ? 'Testando...' : 'Testar e Salvar'}
            </Button>
            {savedKey && (
              <Button onClick={removeKey} variant="outline" size="sm" className="gap-1.5 text-xs text-destructive hover:text-destructive">
                <Trash2 className="h-3 w-3" />
                Remover do Nav.
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Help Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Como obter sua chave API</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="text-xs text-muted-foreground space-y-2 list-decimal list-inside">
            <li>Acesse <span className="font-medium text-foreground">apify.com</span> e crie uma conta</li>
            <li>Vá em <span className="font-medium text-foreground">Settings → Integrations → API tokens</span></li>
            <li>Clique em <span className="font-medium text-foreground">Personal API tokens → Create new token</span></li>
            <li>Copie o token (começa com <code className="text-[10px] bg-muted px-1 rounded">apify_api_</code>) e cole acima</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
