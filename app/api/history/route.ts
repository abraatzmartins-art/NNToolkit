import { NextRequest, NextResponse } from 'next/server';
import { getHistory, deleteHistoryItem, clearHistory } from '@/lib/db';

export async function GET() {
  try {
    const history = await getHistory(50);
    return NextResponse.json(history);
  } catch (error) {
    console.error('Error fetching history:', error);
    return NextResponse.json({ error: 'Erro ao buscar histórico' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      await deleteHistoryItem(id);
      return NextResponse.json({ success: true });
    }

    await clearHistory();
    return NextResponse.json({ success: true, message: 'Histórico limpo' });
  } catch (error) {
    console.error('Error deleting history:', error);
    return NextResponse.json({ error: 'Erro ao deletar histórico' }, { status: 500 });
  }
}
