import { NextRequest, NextResponse } from 'next/server';
import { isEnvVarConfigured, checkApiKeyStatus, setApiKeyInDb, getApiKeyFromDb, getStats } from '@/lib/db';

export async function GET() {
  try {
    const status = await checkApiKeyStatus();
    const stats = await getStats();

    return NextResponse.json({
      configured: status.envVar || status.db,
      isEnvVar: status.envVar,
      isDb: status.db,
      stats,
    });
  } catch (error: any) {
    console.error('Settings GET error:', error);
    return NextResponse.json({
      configured: isEnvVarConfigured(),
      isEnvVar: isEnvVarConfigured(),
      isDb: false,
      stats: null,
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { apiKey } = body;

    if (!apiKey || !apiKey.startsWith('apify_api_')) {
      return NextResponse.json({ error: 'Formato de chave inválido' }, { status: 400 });
    }

    // Save to database
    const saved = await setApiKeyInDb(apiKey);

    return NextResponse.json({
      success: saved,
      message: saved
        ? 'API key salva no banco de dados com sucesso.'
        : 'Erro ao salvar no banco de dados.',
    });
  } catch (error: any) {
    console.error('Settings POST error:', error);
    return NextResponse.json({ error: 'Erro ao salvar configurações' }, { status: 500 });
  }
}
