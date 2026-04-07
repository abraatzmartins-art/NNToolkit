import { NextRequest, NextResponse } from 'next/server';
import { getRegistrationRequests, getSession, seedAdmin, getTokenFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    await seedAdmin();
    const token = getTokenFromRequest(request);
    if (!token) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });

    const session = await getSession(token);
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Acesso negado. Apenas admins.' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'pending';
    const requests = await getRegistrationRequests(status as any);
    return NextResponse.json({ requests });
  } catch (error) {
    console.error('[Auth] Requests error:', error);
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 });
  }
}
