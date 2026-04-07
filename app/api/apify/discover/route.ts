import { NextRequest, NextResponse } from 'next/server';
import { getApiKeyFromRequest, getApiKeyFromDb } from '@/lib/db';
import { getCachedDiscoveredActors, cacheDiscoveredActors } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query') || '';
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const noCache = searchParams.get('noCache') === 'true';

    if (!query.trim()) {
      return NextResponse.json({ error: 'Parâmetro "query" é obrigatório' }, { status: 400 });
    }

    // Try cache first (unless noCache)
    if (!noCache) {
      const cached = await getCachedDiscoveredActors(query);
      if (cached && cached.length > 0) {
        return NextResponse.json({ actors: cached, total: cached.length, cached: true });
      }
    }

    const apiKey = getApiKeyFromRequest(request) || await getApiKeyFromDb();
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

    // Cache the results
    await cacheDiscoveredActors(query, actors);

    return NextResponse.json({ actors, total: data.data?.total || actors.length, cached: false });
  } catch (error: any) {
    console.error('Error discovering actors:', error);
    return NextResponse.json({ error: 'Erro interno ao buscar atores' }, { status: 500 });
  }
}
