import { NextRequest, NextResponse } from 'next/server';
import { isApiKeyConfigured, setApiKey, getApiKey } from '@/lib/db';

export async function GET() {
  try {
    const configured = isApiKeyConfigured();
    return NextResponse.json({
      configured,
      label: configured ? 'configurado' : null,
    });
  } catch {
    return NextResponse.json({ configured: false, label: null });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { key } = body;

    if (!key || typeof key !== 'string') {
      return NextResponse.json({ error: 'Chave API é obrigatória' }, { status: 400 });
    }

    if (!key.startsWith('apify_api_')) {
      return NextResponse.json(
        { error: 'Formato inválido. A chave deve começar com "apify_api_"' },
        { status: 400 }
      );
    }

    // Test the API key
    const testResponse = await fetch('https://api.apify.com/v2/me', {
      headers: { 'Authorization': `Bearer ${key}` },
    });

    if (!testResponse.ok) {
      return NextResponse.json(
        { error: 'Chave API inválida ou expirada. Verifique e tente novamente.' },
        { status: 401 }
      );
    }

    // Save to memory
    setApiKey(key);

    return NextResponse.json({ success: true, message: 'Chave API salva com sucesso' });
  } catch (error: any) {
    console.error('Error saving settings:', error);
    return NextResponse.json({ error: 'Erro ao salvar configurações' }, { status: 500 });
  }
}
