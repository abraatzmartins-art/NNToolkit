'use client';

import { useEffect, useState } from 'react';
import { useApifyStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Key, CheckCircle2, XCircle, Eye, EyeOff, Loader2, ExternalLink, Cloud, HardDrive } from 'lucide-react';
import { toast } from 'sonner';

export function ApiKeySettings() {
  const { setView } = useApifyStore();
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [configured, setConfigured] = useState(false);
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEnvVar, setIsEnvVar] = useState(false);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      setConfigured(data.configured);
      setIsEnvVar(data.isEnvVar || false);
    } catch {
      // Error checking status
    }
  };

  const testConnection = async () => {
    if (!apiKey || !apiKey.startsWith('apify_api_')) {
      toast.error('Formato inválido', { description: 'A chave deve começar com "apify_api_"' });
      return;
    }

    setTesting(true);
    try {
      const res = await fetch('https://api.apify.com/v2/me', {
        headers: { 'Authorization': `Bearer ${apiKey}` },
      });
      if (res.ok) {
        const data = await res.json();
        toast.success('Conexão bem-sucedida!', {
          description: `Conectado como: ${data.username || data.email || 'usuário Apify'}`,
        });
      } else {
        toast.error('Falha na conexão', { description: 'Verifique sua chave API e tente novamente.' });
      }
    } catch {
      toast.error('Erro de conexão', { description: 'Não foi possível conectar ao Apify.' });
    } finally {
      setTesting(false);
    }
  };

  const saveKey = async () => {
    if (!apiKey || !apiKey.startsWith('apify_api_')) {
      toast.error('Formato inválido', { description: 'A chave deve começar com "apify_api_"' });
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: apiKey }),
      });
      const data = await res.json();

      if (res.ok) {
        setConfigured(true);
        toast.success('Chave API salva com sucesso!', {
          description: 'Agora você pode executar atores.',
        });
        setApiKey('');
      } else {
        toast.error('Erro ao salvar', { description: data.error });
      }
    } catch {
      toast.error('Erro', { description: 'Não foi possível salvar a chave API.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-lg">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setView('catalog')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-lg font-semibold">Configurações</h2>
          <p className="text-xs text-muted-foreground">Gerenciar sua chave API do Apify</p>
        </div>
      </div>

      {/* Status Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Key className="h-4 w-4" />
            Chave API
          </CardTitle>
          <CardDescription className="text-xs">
            {isEnvVar
              ? 'Chave configurada via variável de ambiente (recomendado para produção).'
              : 'Sua chave API é armazenada com segurança e nunca é exposta no frontend.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status indicator */}
          <div className="flex items-center gap-2">
            {configured ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 text-xs">
                  {isEnvVar ? 'Chave configurada (ambiente)' : 'Chave configurada'}
                </Badge>
              </>
            ) : (
              <>
                <XCircle className="h-4 w-4 text-destructive" />
                <Badge variant="secondary" className="bg-destructive/10 text-destructive text-xs">
                  Não configurada
                </Badge>
              </>
            )}
          </div>

          {!isEnvVar && (
            <>
              {/* Input */}
              <div className="space-y-2">
                <Label className="text-xs">Chave API do Apify</Label>
                <div className="relative">
                  <Input
                    type={showKey ? 'text' : 'password'}
                    placeholder="apify_api_..."
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="pr-10 font-mono text-sm"
                  />
                  <button
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {apiKey && !apiKey.startsWith('apify_api_') && (
                  <p className="text-[10px] text-destructive">A chave deve começar com &quot;apify_api_&quot;</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  onClick={testConnection}
                  variant="outline"
                  size="sm"
                  disabled={!apiKey || testing}
                  className="gap-1.5 text-xs"
                >
                  {testing ? <Loader2 className="h-3 w-3 animate-spin" /> : <ExternalLink className="h-3 w-3" />}
                  Testar
                </Button>
                <Button
                  onClick={saveKey}
                  size="sm"
                  disabled={!apiKey || saving}
                  className="gap-1.5 text-xs"
                >
                  {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle2 className="h-3 w-3" />}
                  Salvar
                </Button>
              </div>
            </>
          )}
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
            <li>Vá para <span className="font-medium text-foreground">Configurações → Integrações → API</span></li>
            <li>Clique em <span className="font-medium text-foreground">&quot;Criar novo token&quot;</span></li>
            <li>Copie o token e cole aqui</li>
          </ol>
        </CardContent>
      </Card>

      {/* Deploy info */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Cloud className="h-4 w-4" />
            Hospedagem em Nuvem
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xs text-muted-foreground space-y-2">
            <p>
              Para maior segurança, você pode configurar a chave como variável de ambiente.
              No Vercel, vá em <span className="font-medium text-foreground">Settings → Environment Variables</span> e adicione:
            </p>
            <code className="block bg-muted p-2 rounded text-[11px] font-mono">
              APIFY_API_KEY = apify_api_...
            </code>
            <p className="flex items-center gap-1">
              <HardDrive className="h-3 w-3" />
              Rodando localmente: use o formulário acima
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
