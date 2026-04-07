import { NextRequest, NextResponse } from 'next/server';
import { getApiKeyFromRequest } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ runId: string }> }
) {
  try {
    const { runId } = await params;
    const apiKey = getApiKeyFromRequest(request);

    if (!apiKey) {
      return NextResponse.json({ error: 'Chave API não configurada' }, { status: 400 });
    }

    const apifyResponse = await fetch(
      `https://api.apify.com/v2/actor-runs/${runId}?token=${apiKey}`
    );

    if (!apifyResponse.ok) {
      return NextResponse.json(
        { error: `Erro: ${apifyResponse.status}` },
        { status: apifyResponse.status }
      );
    }

    const runData = await apifyResponse.json();
    return NextResponse.json(runData);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao verificar status' }, { status: 500 });
  }
}
