import { NextRequest, NextResponse } from 'next/server';
import { getSavedQueries, saveQuery, deleteQuery } from '@/lib/db';

export async function GET() {
  try {
    const queries = await getSavedQueries();
    return NextResponse.json({ queries });
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json({ error: 'Erro ao buscar templates' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, actorId, inputParams, outputFormat, selectedFields, maxResults } = body;

    if (!name || !actorId || !inputParams) {
      return NextResponse.json({ error: 'name, actorId e inputParams são obrigatórios' }, { status: 400 });
    }

    const query = await saveQuery({
      name,
      actorId,
      inputParams,
      outputFormat: outputFormat || 'json',
      selectedFields: selectedFields || [],
      maxResults: maxResults || 20,
    });

    if (!query) {
      return NextResponse.json({ error: 'Erro ao salvar template' }, { status: 500 });
    }

    return NextResponse.json({ success: true, query });
  } catch (error) {
    console.error('Error saving template:', error);
    return NextResponse.json({ error: 'Erro ao salvar template' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Parâmetro "id" é obrigatório' }, { status: 400 });
    }

    await deleteQuery(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting template:', error);
    return NextResponse.json({ error: 'Erro ao deletar template' }, { status: 500 });
  }
}
