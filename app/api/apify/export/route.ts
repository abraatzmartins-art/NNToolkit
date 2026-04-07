import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { data, format, fields } = body;

    if (!data || !Array.isArray(data)) {
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });
    }

    const filteredData = fields && fields.length > 0
      ? data.map((item: any) => {
          const filtered: Record<string, any> = {};
          fields.forEach((f: string) => {
            if (item[f] !== undefined) {
              filtered[f] = item[f];
            }
          });
          return filtered;
        })
      : data;

    let content: string;
    let filename: string;
    let contentType: string;

    switch (format) {
      case 'csv': {
        if (filteredData.length === 0) {
          return NextResponse.json({ error: 'Sem dados para exportar' }, { status: 400 });
        }
        const headers = Object.keys(filteredData[0]);
        const csvRows = [
          headers.map(escapeCsv).join(','),
          ...filteredData.map((row: any) =>
            headers.map((h) => escapeCsv(String(row[h] ?? ''))).join(',')
          ),
        ];
        content = '\uFEFF' + csvRows.join('\n'); // BOM for UTF-8
        filename = `apify-results-${Date.now()}.csv`;
        contentType = 'text/csv;charset=utf-8';
        break;
      }
      case 'excel': {
        if (filteredData.length === 0) {
          return NextResponse.json({ error: 'Sem dados para exportar' }, { status: 400 });
        }
        const headers = Object.keys(filteredData[0]);
        const rows = filteredData.map((row: any) =>
          '<tr>' + headers.map((h) => `<td>${escapeHtml(String(row[h] ?? ''))}</td>`).join('') + '</tr>'
        );
        content = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
          <head><meta charset="utf-8"></head><body><table border="1">
          <tr>${headers.map((h) => `<th>${escapeHtml(h)}</th>`).join('')}</tr>
          ${rows.join('\n')}
          </table></body></html>`;
        filename = `apify-results-${Date.now()}.xls`;
        contentType = 'application/vnd.ms-excel';
        break;
      }
      case 'json':
      default: {
        content = JSON.stringify(filteredData, null, 2);
        filename = `apify-results-${Date.now()}.json`;
        contentType = 'application/json';
        break;
      }
    }

    // Return file content directly (works on Vercel without filesystem)
    return new NextResponse(content, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    console.error('Error exporting data:', error);
    return NextResponse.json({ error: 'Erro ao exportar dados' }, { status: 500 });
  }
}

function escapeCsv(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
