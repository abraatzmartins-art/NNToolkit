import { NextRequest, NextResponse } from 'next/server';
import { addCustomActor } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { actorId, name, description, category, icon, color, inputSchema, outputFields, pricingInfo } = body;

    if (!actorId || !name || !inputSchema) {
      return NextResponse.json(
        { error: 'actorId, name e inputSchema são obrigatórios' },
        { status: 400 }
      );
    }

    const customActor = addCustomActor({
      actorId,
      name,
      description: description || '',
      category: category || 'custom',
      icon: icon || 'Globe',
      color: color || '#6366f1',
      inputSchema: typeof inputSchema === 'string' ? inputSchema : JSON.stringify(inputSchema),
      outputFields: typeof outputFields === 'string' ? outputFields : JSON.stringify(outputFields || []),
      pricingInfo: pricingInfo || '',
    });

    if (!customActor) {
      return NextResponse.json(
        { error: 'Este ator já está instalado' },
        { status: 409 }
      );
    }

    return NextResponse.json({ success: true, id: customActor.id, actorId: customActor.actorId });
  } catch (error: any) {
    console.error('Error installing actor:', error);
    return NextResponse.json({ error: 'Erro interno ao instalar ator' }, { status: 500 });
  }
}
