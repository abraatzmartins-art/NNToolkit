'use client';

import { useEffect, useState } from 'react';
import { useApifyStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Shield, CheckCircle2, XCircle, UserX, RefreshCw, Users, Clock,
  Trash2, ToggleLeft, ToggleRight, Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

interface RegRequest {
  id: string;
  name: string;
  email: string;
  message: string;
  status: string;
  createdAt: string;
}

interface UserInfo {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

export function AdminPanel() {
  const { user } = useApifyStore();
  const [requests, setRequests] = useState<RegRequest[]>([]);
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [loadingReqs, setLoadingReqs] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchRequests = async () => {
    setLoadingReqs(true);
    try {
      const res = await fetch('/api/auth/requests?status=pending');
      if (res.ok) {
        const data = await res.json();
        setRequests(data.requests || []);
      }
    } catch { /* silent */ }
    setLoadingReqs(false);
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await fetch('/api/auth/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch { /* silent */ }
    setLoadingUsers(false);
  };

  useEffect(() => {
    fetchRequests();
    fetchUsers();
  }, []);

  const handleApprove = async (requestId: string) => {
    setActionLoading(requestId);
    try {
      const res = await fetch('/api/auth/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Usuário aprovado!', { description: data.message });
        fetchRequests();
        fetchUsers();
      } else {
        toast.error('Erro', { description: data.error });
      }
    } catch { toast.error('Erro de conexão'); }
    setActionLoading(null);
  };

  const handleReject = async (requestId: string) => {
    setActionLoading(requestId);
    try {
      const res = await fetch('/api/auth/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Pedido rejeitado');
        fetchRequests();
      } else {
        toast.error('Erro', { description: data.error });
      }
    } catch { toast.error('Erro de conexão'); }
    setActionLoading(null);
  };

  const handleToggleActive = async (userId: string) => {
    setActionLoading(userId);
    try {
      const res = await fetch('/api/auth/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action: 'toggle_active' }),
      });
      if (res.ok) {
        toast.success('Status atualizado');
        fetchUsers();
      } else {
        const data = await res.json();
        toast.error('Erro', { description: data.error });
      }
    } catch { toast.error('Erro de conexão'); }
    setActionLoading(null);
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Tem certeza? Esta ação não pode ser desfeita.')) return;
    setActionLoading(userId);
    try {
      const res = await fetch('/api/auth/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action: 'delete' }),
      });
      if (res.ok) {
        toast.success('Usuário removido');
        fetchUsers();
      } else {
        const data = await res.json();
        toast.error('Erro', { description: data.error });
      }
    } catch { toast.error('Erro de conexão'); }
    setActionLoading(null);
  };

  if (user?.role !== 'admin') {
    return (
      <Card>
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          Acesso negado. Apenas administradores.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 max-w-2xl">
      <div className="flex items-center gap-2">
        <Shield className="h-5 w-5 text-emerald-600" />
        <h2 className="text-lg font-semibold">Painel do Administrador</h2>
      </div>

      <Tabs defaultValue="requests">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="requests" className="gap-1.5 text-xs">
            <Clock className="h-3 w-3" />
            Pedidos Pendentes {requests.length > 0 && `(${requests.length})`}
          </TabsTrigger>
          <TabsTrigger value="users" className="gap-1.5 text-xs">
            <Users className="h-3 w-3" />
            Usuários
          </TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="space-y-3">
          <div className="flex justify-end">
            <Button variant="outline" size="sm" onClick={fetchRequests} disabled={loadingReqs} className="gap-1 text-xs">
              <RefreshCw className={`h-3 w-3 ${loadingReqs ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>

          {loadingReqs ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : requests.length === 0 ? (
            <Card><CardContent className="py-8 text-center text-sm text-muted-foreground">Nenhum pedido pendente.</CardContent></Card>
          ) : (
            requests.map((req) => (
              <Card key={req.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium text-sm">{req.name}</p>
                      <p className="text-xs text-muted-foreground">{req.email}</p>
                      {req.message && (
                        <p className="text-xs text-muted-foreground mt-1 bg-muted/50 p-2 rounded">&quot;{req.message}&quot;</p>
                      )}
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {new Date(req.createdAt).toLocaleString('pt-BR')}
                      </p>
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      <Button size="sm" onClick={() => handleApprove(req.id)} disabled={!!actionLoading} className="gap-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white h-7">
                        {actionLoading === req.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle2 className="h-3 w-3" />}
                        Aprovar
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleReject(req.id)} disabled={!!actionLoading} className="gap-1 text-xs h-7">
                        {actionLoading === req.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <XCircle className="h-3 w-3" />}
                        Rejeitar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="users" className="space-y-3">
          <div className="flex justify-end">
            <Button variant="outline" size="sm" onClick={fetchUsers} disabled={loadingUsers} className="gap-1 text-xs">
              <RefreshCw className={`h-3 w-3 ${loadingUsers ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>

          {loadingUsers ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : (
            users.map((u) => (
              <Card key={u.id} className={!u.isActive ? 'opacity-60' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">{u.name}</p>
                        <Badge variant={u.role === 'admin' ? 'default' : 'secondary'} className="text-[10px]">
                          {u.role === 'admin' ? 'Admin' : 'User'}
                        </Badge>
                        {!u.isActive && <Badge variant="outline" className="text-[10px] text-destructive">Inativo</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground">{u.email}</p>
                      <p className="text-[10px] text-muted-foreground">{new Date(u.createdAt).toLocaleString('pt-BR')}</p>
                    </div>
                    {u.id !== user?.id && (
                      <div className="flex gap-1 shrink-0">
                        <Button size="sm" variant="outline" onClick={() => handleToggleActive(u.id)} disabled={!!actionLoading} className="gap-1 text-xs h-7">
                          {actionLoading === u.id ? <Loader2 className="h-3 w-3 animate-spin" /> : u.isActive ? <ToggleRight className="h-3 w-3 text-emerald-600" /> : <ToggleLeft className="h-3 w-3" />}
                          {u.isActive ? 'Desativar' : 'Ativar'}
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDeleteUser(u.id)} disabled={!!actionLoading} className="gap-1 text-xs h-7 text-destructive hover:text-destructive">
                          {actionLoading === u.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
