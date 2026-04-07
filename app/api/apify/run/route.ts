import { NextRequest, NextResponse } from 'next/server';
import { getApiKey, addToHistory } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { actorId, input } = body;

    if (!actorId || !input) {
      return NextResponse.json({ error: 'actorId e input são obrigatórios' }, { status: 400 });
    }

    const apiKey = getApiKey();
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Chave API do Apify não configurada. Vá em Configurações para definir sua chave.' },
        { status: 400 }
      );
    }

    // Call Apify API to start actor run
    const apifyResponse = await fetch(`https://api.apify.com/v2/acts/${actorId}/runs`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });

    if (!apifyResponse.ok) {
      const errorText = await apifyResponse.text();
      return NextResponse.json(
        { error: `Erro ao executar ator: ${apifyResponse.status} - ${errorText}` },
        { status: apifyResponse.status }
      );
    }

    const runData = await apifyResponse.json();
    const runId = runData.data?.id || runData.id;

    // Save to in-memory history
    const historyItem = addToHistory({
      actorId,
      actorName: actorId,
      inputParams: JSON.stringify(input),
      status: 'running',
      runId,
    });

    return NextResponse.json({
      runId,
      status: runData.data?.status || runData.status || 'RUNNING',
      historyId: historyItem.id,
    });
  } catch (error: any) {
    console.error('Error running actor:', error);
    return NextResponse.json({ error: 'Erro interno ao executar ator' }, { status: 500 });
  }
}
