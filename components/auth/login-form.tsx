'use client';

import { useState } from 'react';
import { useApifyStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LogIn, Loader2, UserPlus } from 'lucide-react';
import { toast } from 'sonner';

interface LoginFormProps {
  onToggleView: (view: 'login' | 'register') => void;
}

export function LoginForm({ onToggleView }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { setUser } = useApifyStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Preencha todos os campos');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error('Erro no login', { description: data.error });
        return;
      }

      // Save token
      localStorage.setItem('session_token', data.token);
      setUser({ id: data.user.id, name: data.user.name, email: data.user.email, role: data.user.role });

      toast.success(`Bem-vindo, ${data.user.name}!`);
    } catch {
      toast.error('Erro de conexão');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="text-center">
        <div className="mx-auto mb-2 h-10 w-10 rounded-xl bg-emerald-600 flex items-center justify-center">
          <LogIn className="h-5 w-5 text-white" />
        </div>
        <CardTitle className="text-lg">Entrar</CardTitle>
        <CardDescription className="text-xs">Acesse o Apify Research Hub</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs">Email</Label>
            <Input type="email" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} className="text-sm" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Senha</Label>
            <Input type="password" placeholder="••••••" value={password} onChange={e => setPassword(e.target.value)} className="text-sm" />
          </div>
          <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4 mr-2" />}
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>
        <div className="mt-4 text-center">
          <button onClick={() => onToggleView('register')} className="text-xs text-emerald-600 hover:underline flex items-center gap-1 mx-auto">
            <UserPlus className="h-3 w-3" />
            Não tem conta? Solicite cadastro
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
