import { NextRequest, NextResponse } from 'next/server';
import { createRegistrationRequest, seedAdmin } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    await seedAdmin();
    const body = await request.json();
    const { name, email, password, message } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Nome, email e senha são obrigatórios.' }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: 'A senha deve ter pelo menos 6 caracteres.' }, { status: 400 });
    }
    if (!email.includes('@')) {
      return NextResponse.json({ error: 'Email inválido.' }, { status: 400 });
    }

    const result = await createRegistrationRequest(name, email, password, message || '');

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 409 });
    }

    return NextResponse.json({ success: true, message: 'Pedido de cadastro enviado! Aguarde aprovação do administrador.' });
  } catch (error: any) {
    console.error('[Auth] Register error:', error);
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 });
  }
}
