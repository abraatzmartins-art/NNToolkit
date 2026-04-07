import { NextRequest, NextResponse } from 'next/server';
import { getApiKeyFromRequest, getApiKeyFromDb, addToHistory } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { actorId, input, actorName } = body;

    if (!actorId || !input) {
      return NextResponse.json(
        { error: 'actorId e input são obrigatórios' },
        { status: 400 }
      );
    }

    const apiKey = getApiKeyFromRequest(request) || await getApiKeyFromDb();
    if (!apiKey) {
      return NextResponse.json(
        {
          error: 'Chave API não configurada. Configure via: (1) Environment Variable APIFY_API_KEY no Vercel, (2) salve a chave no navegador em Configurações, ou (3) configure no banco de dados.',
        },
        { status: 400 }
      );
    }

    console.log(`[Apify Run] Starting actor: ${actorId}`);
    console.log(`[Apify Run] API key source: ${request.headers.get('x-apify-key') ? 'header' : process.env.APIFY_API_KEY ? 'env-var' : 'db'}`);

    const apifyResponse = await fetch(`https://api.apify.com/v2/acts/${actorId}/runs`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });

    if (!apifyResponse.ok) {
      let errorText = '';
      try {
        errorText = await apifyResponse.text();
        try {
          const errorJson = JSON.parse(errorText);
          errorText = errorJson.error?.message || errorJson.message || errorText;
        } catch { /* use raw */ }
      } catch {
        errorText = `HTTP ${apifyResponse.status}`;
      }

      console.error(`[Apify Run] Error ${apifyResponse.status}: ${errorText}`);

      // Save failed run to history
      await addToHistory({
        actorId,
        actorName: actorName || actorId,
        inputParams: JSON.stringify(input),
        status: 'failed',
        runId: null,
      });

      return NextResponse.json(
        { error: `Erro ao executar ator: ${apifyResponse.status} - ${errorText}` },
        { status: apifyResponse.status }
      );
    }

    const runData = await apifyResponse.json();
    const runId = runData.data?.id || runData.id;

    if (!runId) {
      console.error('[Apify Run] No runId in response');
      return NextResponse.json(
        { error: 'Apify não retornou ID da execução.' },
        { status: 502 }
      );
    }

    console.log(`[Apify Run] Success! runId: ${runId}`);

    // Save to history in Turso
    await addToHistory({
      actorId,
      actorName: actorName || actorId,
      inputParams: JSON.stringify(input),
      status: 'running',
      runId,
    });

    return NextResponse.json({
      runId,
      status: runData.data?.status || runData.status || 'RUNNING',
    });
  } catch (error: any) {
    console.error('[Apify Run] Exception:', error);
    return NextResponse.json(
      { error: `Erro interno: ${error.message || 'Desconhecido'}` },
      { status: 500 }
    );
  }
}
