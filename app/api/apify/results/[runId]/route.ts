import { NextRequest, NextResponse } from 'next/server';
import { getApiKey, updateHistoryResults } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ runId: string }> }
) {
  try {
    const { runId } = await params;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    const apiKey = getApiKey();
    if (!apiKey) {
      return NextResponse.json({ error: 'Chave API não configurada' }, { status: 400 });
    }

    // Call Apify API to get dataset items
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

    // Update results count in memory
    updateHistoryResults(runId, data.length);

    return NextResponse.json({
      items: data,
      total: data.length,
      limit,
      offset,
    });
  } catch (error: any) {
    console.error('Error fetching results:', error);
    return NextResponse.json({ error: 'Erro ao buscar resultados' }, { status: 500 });
  }
}
