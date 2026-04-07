import { NextResponse } from 'next/server';
import { seedAdmin } from '@/lib/auth';

export async function POST() {
  try {
    await seedAdmin();
    return NextResponse.json({ success: true, message: 'Admin seed executado.' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
