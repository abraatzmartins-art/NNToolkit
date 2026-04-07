import { NextRequest, NextResponse } from 'next/server';
import { getApiKeyFromRequest, getApiKeyFromDb } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const actorId = searchParams.get('actorId');

    if (!actorId) {
      return NextResponse.json({ error: 'Parâmetro "actorId" é obrigatório' }, { status: 400 });
    }

    const apiKey = getApiKeyFromRequest(request) || await getApiKeyFromDb();
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Chave API não configurada. Vá em Configurações e salve sua chave API.' },
        { status: 400 }
      );
    }

    const apifyResponse = await fetch(`https://api.apify.com/v2/acts/${encodeURIComponent(actorId)}`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!apifyResponse.ok) {
      const errorText = await apifyResponse.text();
      return NextResponse.json(
        { error: `Erro ao buscar informações do ator: ${apifyResponse.status} - ${errorText}` },
        { status: apifyResponse.status }
      );
    }

    const data = await apifyResponse.json();
    const actorData = data.data || data;

    const rawSchema = actorData.defaultRunOptions?.build || actorData.build;
    const inputSchema = convertApifySchema(rawSchema);

    const outputFields = actorData.exampleOutput
      ? Object.keys(
          typeof actorData.exampleOutput === 'string'
            ? JSON.parse(actorData.exampleOutput || '{}')
            : actorData.exampleOutput || {}
        ).slice(0, 20)
      : [];

    return NextResponse.json({
      id: actorData.id || actorId,
      actorId,
      name: actorData.title || actorData.name || actorId,
      description: actorData.description || '',
      username: actorData.username || '',
      category: 'custom',
      inputSchema,
      outputFields,
      stats: { totalRuns: actorData.stats?.totalRuns || 0, uniqueUsers: actorData.stats?.uniqueUsers || 0 },
    });
  } catch (error: any) {
    console.error('Error fetching actor info:', error);
    return NextResponse.json({ error: 'Erro interno ao buscar informações do ator' }, { status: 500 });
  }
}

function convertApifySchema(schema: any): any[] {
  if (!schema) return [];
  const properties = schema.properties || {};
  const required: string[] = schema.required || [];
  return Object.entries(properties).map(([key, prop]: [string, any]) => {
    let type: string = 'text';
    let options: any[] | undefined;
    switch (prop.type) {
      case 'string':
        if (prop.enum && prop.enum.length > 0) {
          type = 'select';
          options = prop.enum.map((v: string) => ({ label: v.charAt(0).toUpperCase() + v.slice(1).replace(/_/g, ' '), value: v }));
        } else if (prop.maxLength && prop.maxLength > 100) type = 'textarea';
        break;
      case 'array': type = 'textarea'; break;
      case 'number': case 'integer': type = 'number'; break;
      case 'boolean': type = 'boolean'; break;
      case 'object': type = 'json'; break;
    }
    return {
      key, type,
      label: prop.title || key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
      placeholder: prop.description || `Insira ${prop.title || key}`,
      required: required.includes(key),
      options, default: prop.default,
      min: prop.minimum, max: prop.maximum,
      description: prop.description,
      advanced: prop['x-apify-advanced'] || false,
    };
  });
}
