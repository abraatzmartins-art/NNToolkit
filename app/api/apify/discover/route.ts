import { NextRequest, NextResponse } from 'next/server';
import { getApiKeyFromRequest } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query') || '';
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    if (!query.trim()) {
      return NextResponse.json({ error: 'Parâmetro "query" é obrigatório' }, { status: 400 });
    }

    const apiKey = getApiKeyFromRequest(request);
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Chave API não configurada. Vá em Configurações e salve sua chave API.' },
        { status: 400 }
      );
    }

    const url = new URL('https://api.apify.com/v2/acts');
    url.searchParams.set('search', query);
    url.searchParams.set('limit', limit.toString());

    const apifyResponse = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!apifyResponse.ok) {
      const errorText = await apifyResponse.text();
      return NextResponse.json(
        { error: `Erro ao buscar atores: ${apifyResponse.status} - ${errorText}` },
        { status: apifyResponse.status }
      );
    }

    const data = await apifyResponse.json();

    const actors = (data.data?.items || data.data || []).map((item: any) => ({
      id: item.id || item.name,
      actorId: `${item.username}/${item.name}`,
      name: item.title || item.name || 'Sem nome',
      description: item.description || '',
      username: item.username || '',
      stats: { totalRuns: item.stats?.totalRuns || 0, uniqueUsers: item.stats?.uniqueUsers || 0 },
      url: `https://apify.com/${item.username}/${item.name}`,
      image: item.image || null,
    }));

    return NextResponse.json({ actors, total: data.data?.total || actors.length });
  } catch (error: any) {
    console.error('Error discovering actors:', error);
    return NextResponse.json({ error: 'Erro interno ao buscar atores' }, { status: 500 });
  }
}
