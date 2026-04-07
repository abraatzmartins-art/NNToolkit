import { NextRequest, NextResponse } from 'next/server';
import { login, seedAdmin } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    await seedAdmin();
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email e senha são obrigatórios.' }, { status: 400 });
    }

    const result = await login(email, password);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 401 });
    }

    // Set cookie
    const response = NextResponse.json({
      success: true,
      user: { id: result.user!.id, name: result.user!.name, email: result.user!.email, role: result.user!.role },
      token: result.token,
    });

    response.cookies.set('session_token', result.token!, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('[Auth] Login error:', error);
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 });
  }
}
