import { NextRequest, NextResponse } from 'next/server';
import { getAllUsers, toggleUserActive, deleteUser, getSession, seedAdmin, getTokenFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    await seedAdmin();
    const token = getTokenFromRequest(request);
    if (!token) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });

    const session = await getSession(token);
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Acesso negado.' }, { status: 403 });
    }

    const users = await getAllUsers();
    return NextResponse.json({ users });
  } catch (error) {
    console.error('[Auth] Users error:', error);
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request);
    if (!token) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });

    const session = await getSession(token);
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Acesso negado.' }, { status: 403 });
    }

    const body = await request.json();
    const { userId, action } = body;

    if (!userId || !action) {
      return NextResponse.json({ error: 'userId e action são obrigatórios.' }, { status: 400 });
    }

    if (action === 'toggle_active') {
      if (userId === session.id) {
        return NextResponse.json({ error: 'Você não pode desativar a si mesmo.' }, { status: 400 });
      }
      await toggleUserActive(userId);
      return NextResponse.json({ success: true });
    }

    if (action === 'delete') {
      if (userId === session.id) {
        return NextResponse.json({ error: 'Você não pode deletar a si mesmo.' }, { status: 400 });
      }
      await deleteUser(userId);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Ação inválida.' }, { status: 400 });
  } catch (error) {
    console.error('[Auth] Users PATCH error:', error);
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 });
  }
}
