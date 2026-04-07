import { NextRequest, NextResponse } from 'next/server';
import { getApiKeyFromRequest, getApiKeyFromDb, saveResults, getSavedResults } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ runId: string }> }
) {
  try {
    const { runId } = await params;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!runId) {
      return NextResponse.json({ error: 'runId é obrigatório' }, { status: 400 });
    }

    // Try to get saved results from Turso first
    const saved = await getSavedResults(runId, limit, offset);
    if (saved.length > 0) {
      return NextResponse.json({ items: saved, total: saved.length, limit, offset, cached: true });
    }

    // If not cached, fetch from Apify
    const apiKey = getApiKeyFromRequest(request) || await getApiKeyFromDb();
    if (!apiKey) {
      return NextResponse.json({ error: 'Chave API não configurada' }, { status: 400 });
    }

    const apifyResponse = await fetch(
      `https://api.apify.com/v2/actor-runs/${runId}/dataset/items?token=${apiKey}&limit=${limit}&offset=${offset}&clean=true`
    );

    if (!apifyResponse.ok) {
      return NextResponse.json(
        { error: `Erro ao buscar resultados: ${apifyResponse.status}` },
        { status: apifyResponse.status }
      );
    }

    const data = await apifyResponse.json();
    const items = Array.isArray(data) ? data : [];

    // Save to Turso for future use
    await saveResults(runId, items);

    return NextResponse.json({ items, total: items.length, limit, offset, cached: false });
  } catch (error: any) {
    console.error('[Apify Results] Error:', error);
    return NextResponse.json({ error: 'Erro ao buscar resultados' }, { status: 500 });
  }
}
