import { NextRequest, NextResponse } from 'next/server';
import { rejectRegistration, getSession, seedAdmin, getTokenFromRequest } from '@/lib/auth';

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

    const rejected = await rejectRegistration(requestId, session.id);
    if (!rejected) return NextResponse.json({ error: 'Pedido não encontrado.' }, { status: 404 });

    return NextResponse.json({ success: true, message: 'Pedido rejeitado.' });
  } catch (error) {
    console.error('[Auth] Reject error:', error);
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 });
  }
}
