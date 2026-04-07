import { NextRequest, NextResponse } from 'next/server';
import { getSession, seedAdmin, getTokenFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    await seedAdmin();
    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const session = await getSession(token);
    if (!session) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    return NextResponse.json({
      authenticated: true,
      user: { id: session.id, name: session.name, email: session.email, role: session.role },
    });
  } catch (error) {
    return NextResponse.json({ authenticated: false }, { status: 500 });
  }
}
