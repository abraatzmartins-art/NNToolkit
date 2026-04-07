'use client';

import { useEffect, useState } from 'react';
import { useApifyStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Key, CheckCircle2, XCircle, Eye, EyeOff, Loader2, ExternalLink, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const STORAGE_KEY = 'apify_api_key';

export function ApiKeySettings() {
  const { setView } = useApifyStore();
  const [apiKey, setApiKey] = useState('');
  const [savedKey, setSavedKey] = useState<string | null>(null);
  const [showKey, setShowKey] = useState(false);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    // Load key from localStorage
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setSavedKey(stored);
      // Update the store so other components know the key is set
      useApifyStore.getState().setApiKeyConfigured(true);
    }
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

      toast.success('Chave API salva!', {
        description: `Conectado como: ${data.username || data.email || 'usuário Apify'}`,
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
    useApifyStore.getState().setApiKeyConfigured(false);
    toast.success('Chave API removida');
  };

  const maskedKey = savedKey
    ? savedKey.substring(0, 10) + '...' + savedKey.substring(savedKey.length - 4)
    : null;

  return (
    <div className="space-y-6 max-w-lg">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setView('catalog')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-lg font-semibold">Configurações</h2>
          <p className="text-xs text-muted-foreground">Gerenciar sua chave API do Apify</p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Key className="h-4 w-4" />
            Chave API
          </CardTitle>
          <CardDescription className="text-xs">
            Sua chave é salva no navegador (localStorage) e enviada ao servidor a cada requisição.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status */}
          <div className="flex items-center gap-2">
            {savedKey ? (
              <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 text-xs gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Configurada: {maskedKey}
              </Badge>
            ) : (
              <Badge variant="secondary" className="bg-destructive/10 text-destructive text-xs gap-1">
                <XCircle className="h-3 w-3" />
                Não configurada
              </Badge>
            )}
          </div>

          {/* Input */}
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

          {/* Actions */}
          <div className="flex gap-2">
            <Button onClick={testAndSave} size="sm" disabled={!apiKey.trim() || testing} className="gap-1.5 text-xs">
              {testing ? <Loader2 className="h-3 w-3 animate-spin" /> : <ExternalLink className="h-3 w-3" />}
              {testing ? 'Testando...' : 'Testar e Salvar'}
            </Button>
            {savedKey && (
              <Button onClick={removeKey} variant="outline" size="sm" className="gap-1.5 text-xs text-destructive hover:text-destructive">
                <Trash2 className="h-3 w-3" />
                Remover
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

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
