import { NextRequest, NextResponse } from 'next/server';
import { getApiKeyFromRequest, getApiKeyFromDb, updateHistoryResults } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ runId: string }> }
) {
  try {
    const { runId } = await params;

    if (!runId) {
      return NextResponse.json({ error: 'runId é obrigatório' }, { status: 400 });
    }

    const apiKey = getApiKeyFromRequest(request) || await getApiKeyFromDb();

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Chave API não configurada no servidor.' },
        { status: 400 }
      );
    }

    const apifyResponse = await fetch(
      `https://api.apify.com/v2/actor-runs/${runId}?token=${apiKey}`
    );

    if (!apifyResponse.ok) {
      let errorDetail = `Erro: ${apifyResponse.status}`;
      try {
        const errorText = await apifyResponse.text();
        const errorJson = JSON.parse(errorText);
        errorDetail = errorJson.error?.message || errorJson.message || errorDetail;
      } catch { /* default */ }
      return NextResponse.json({ error: errorDetail }, { status: apifyResponse.status });
    }

    const runData = await apifyResponse.json();

    // Update history when completed
    if (runData.status === 'SUCCEEDED') {
      await updateHistoryResults(runId, 0); // Will be updated with actual count when results are fetched
    }

    return NextResponse.json(runData);
  } catch (error: any) {
    console.error('[Apify Status] Error:', error);
    return NextResponse.json(
      { error: `Erro ao verificar status: ${error.message || 'Desconhecido'}` },
      { status: 500 }
    );
  }
}
