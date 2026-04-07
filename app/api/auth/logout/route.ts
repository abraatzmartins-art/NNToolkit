import { NextRequest, NextResponse } from 'next/server';
import { logout, seedAdmin, getTokenFromRequest } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request);
    if (token) await logout(token);

    const response = NextResponse.json({ success: true });
    response.cookies.set('session_token', '', { maxAge: 0, path: '/' });
    return response;
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao fazer logout.' }, { status: 500 });
  }
}
