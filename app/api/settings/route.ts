import { NextRequest, NextResponse } from 'next/server';
import { isEnvVarConfigured } from '@/lib/db';

export async function GET() {
  return NextResponse.json({
    configured: true, // Always true - key can be set via localStorage
    isEnvVar: isEnvVarConfigured(),
  });
}

// POST is no longer needed - key is stored in browser localStorage
// and sent via x-apify-key header on every request
export async function POST() {
  return NextResponse.json({
    success: true,
    message: 'API key agora e salva no navegador (localStorage). Use o botao Testar para validar.',
  });
}
