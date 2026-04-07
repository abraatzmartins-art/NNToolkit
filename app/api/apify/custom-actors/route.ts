import { NextRequest, NextResponse } from 'next/server';
import { getCustomActors, deleteCustomActor } from '@/lib/db';

export async function GET() {
  try {
    const customActors = getCustomActors();
    return NextResponse.json({ actors: customActors });
  } catch (error: any) {
    console.error('Error fetching custom actors:', error);
    return NextResponse.json({ error: 'Erro interno ao buscar atores personalizados' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Parâmetro "id" é obrigatório' }, { status: 400 });
    }

    deleteCustomActor(id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting custom actor:', error);
    return NextResponse.json({ error: 'Erro interno ao remover ator' }, { status: 500 });
  }
}
