import { NextRequest, NextResponse } from 'next/server';
import { approveRegistration, getSession, seedAdmin, getTokenFromRequest } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    await seedAdmin();
    const token = getTokenFromRequest(request);
    if (!token) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });

    const session = await getSession(token);
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Acesso negado.' }, { status: 403 });
    }

    const body = await request.json();
    const { requestId } = body;
    if (!requestId) return NextResponse.json({ error: 'requestId obrigatório.' }, { status: 400 });

    const approved = await approveRegistration(requestId, session.id);
    if (!approved) return NextResponse.json({ error: 'Pedido não encontrado ou já processado.' }, { status: 404 });

    return NextResponse.json({ success: true, message: 'Usuário aprovado com sucesso!' });
  } catch (error) {
    console.error('[Auth] Approve error:', error);
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 });
  }
}
