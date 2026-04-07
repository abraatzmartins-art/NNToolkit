'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserPlus, Loader2, LogIn, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

interface RegisterFormProps {
  onToggleView: (view: 'login' | 'register') => void;
}

export function RegisterForm({ onToggleView }: RegisterFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }
    if (password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, message }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error('Erro no cadastro', { description: data.error });
        return;
      }

      setSent(true);
      toast.success('Pedido enviado!', { description: 'Aguarde aprovação do administrador.' });
    } catch {
      toast.error('Erro de conexão');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <Card className="w-full max-w-sm">
        <CardContent className="pt-6 text-center">
          <div className="mx-auto mb-3 h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center">
            <CheckCircle2 className="h-6 w-6 text-emerald-600" />
          </div>
          <h3 className="font-semibold mb-1">Pedido Enviado!</h3>
          <p className="text-xs text-muted-foreground mb-4">
            Seu pedido de cadastro foi enviado ao administrador. Você receberá acesso assim que for aprovado.
          </p>
          <button onClick={() => onToggleView('login')} className="text-xs text-emerald-600 hover:underline flex items-center gap-1 mx-auto">
            <LogIn className="h-3 w-3" />
            Voltar ao login
          </button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="text-center">
        <div className="mx-auto mb-2 h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center">
          <UserPlus className="h-5 w-5 text-white" />
        </div>
        <CardTitle className="text-lg">Solicitar Cadastro</CardTitle>
        <CardDescription className="text-xs">Preencha os dados abaixo. O admin irá aprovar seu acesso.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Nome *</Label>
            <Input placeholder="Seu nome" value={name} onChange={e => setName(e.target.value)} className="text-sm" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Email *</Label>
            <Input type="email" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} className="text-sm" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Senha * (mín. 6 caracteres)</Label>
            <Input type="password" placeholder="••••••" value={password} onChange={e => setPassword(e.target.value)} className="text-sm" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Mensagem para o admin (opcional)</Label>
            <Textarea placeholder="Por que quer acessar a plataforma?" value={message} onChange={e => setMessage(e.target.value)} className="text-sm min-h-[60px]" />
          </div>
          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4 mr-2" />}
            {loading ? 'Enviando...' : 'Solicitar Acesso'}
          </Button>
        </form>
        <div className="mt-4 text-center">
          <button onClick={() => onToggleView('login')} className="text-xs text-emerald-600 hover:underline flex items-center gap-1 mx-auto">
            <LogIn className="h-3 w-3" />
            Já tem conta? Faça login
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
