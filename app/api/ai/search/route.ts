import { NextRequest, NextResponse } from 'next/server';
import { getSession, seedAdmin, getTokenFromRequest } from '@/lib/auth';
import { apifyActors } from '@/lib/apify-catalog';

export async function POST(request: NextRequest) {
  try {
    await seedAdmin();
    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
    }

    const session = await getSession(token);
    if (!session) {
      return NextResponse.json({ error: 'Sessão inválida.' }, { status: 401 });
    }

    const body = await request.json();
    const { query, autoExecute } = body;

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Query é obrigatória.' }, { status: 400 });
    }

    if (query.length > 1000) {
      return NextResponse.json({ error: 'Query muito longa (máximo 1000 caracteres).' }, { status: 400 });
    }

    // Build actor catalog for the LLM
    const actorCatalog = apifyActors.map(a => ({
      id: a.id,
      name: a.name,
      description: a.description,
      category: a.category,
      fields: a.inputSchema.map(f => ({
        key: f.key,
        type: f.type,
        label: f.label,
        required: f.required,
        options: f.options,
        default: f.default,
        description: f.description,
      })),
    }));

    const systemPrompt = `Você é um assistente especializado em pesquisa de dados usando a plataforma Apify. 

Seu trabalho é analisar a consulta do usuário em linguagem natural e determinar qual ator do Apify melhor atende à necessidade, configurando os parâmetros corretamente.

Atores disponíveis:
${JSON.stringify(actorCatalog, null, 2)}

Responda SEMPRE em JSON válido com esta estrutura exata:
{
  "actorId": "id_do_ator_escolhido",
  "actorName": "nome do ator",
  "input": {
    "parametro1": "valor1",
    "parametro2": "valor2"
  },
  "explanation": "explicação breve em português do porquê escolheu este ator e o que ele vai buscar"
}

Regras importantes:
1. Escolha o ator MAIS adequado para a consulta
2. Preencha os parâmetros obrigatórios com valores derivados da consulta do usuário
3. Para campos de busca/lista (searchQueries, startUrls, etc.), use valores relevantes derivados do que o usuário pediu
4. Mantenha valores padrão para parâmetros opcionais não mencionados
5. Se a consulta for muito genérica ou não corresponder a nenhum ator, explique no campo "explanation" que não encontrou um ator adequado e sugira alternativas
6. Responda APENAS com o JSON, sem markdown ou texto adicional
7. A explicação deve ser em português do Brasil`;

    const { aiChatCompletion } = await import('@/lib/zai');

    const completion = await aiChatCompletion([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: query },
    ]);

    let messageContent = completion.choices[0]?.message?.content || '';

    // Clean up response - extract JSON from possible markdown wrapping
    messageContent = messageContent.trim();
    if (messageContent.startsWith('```')) {
      messageContent = messageContent.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
    }

    let aiResponse: any;
    try {
      aiResponse = JSON.parse(messageContent);
    } catch {
      return NextResponse.json({
        error: 'A IA retornou uma resposta inválida. Tente reformular sua consulta.',
        rawResponse: messageContent,
      }, { status: 502 });
    }

    // Validate that actorId exists in our catalog
    const matchedActor = apifyActors.find(a => a.id === aiResponse.actorId);
    if (!matchedActor && aiResponse.actorId) {
      aiResponse.warning = `O ator "${aiResponse.actorId}" não está no catálogo padrão. Pode ser um ator customizado.`;
    }

    // If autoExecute, run the actor
    let runId = null;
    let runError = null;

    if (autoExecute && aiResponse.actorId && aiResponse.input) {
      try {
        const { getApiKeyFromRequest, getApiKeyFromDb } = await import('@/lib/db');
        const apiKey = getApiKeyFromRequest(request) || await getApiKeyFromDb();

        if (!apiKey) {
          runError = 'Chave API não configurada. Não foi possível executar automaticamente.';
        } else {
          const encodedActorId = aiResponse.actorId.replace(/\//g, '~');
          const apifyRes = await fetch(`https://api.apify.com/v2/acts/${encodedActorId}/runs`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(aiResponse.input),
          });

          if (apifyRes.ok) {
            const runData = await apifyRes.json();
            runId = runData.data?.id || runData.id;
          } else {
            const errorText = await apifyRes.text();
            runError = `Erro ao executar: ${apifyRes.status} - ${errorText}`;
          }
        }
      } catch (err: any) {
        runError = `Erro ao executar: ${err.message}`;
      }
    }

    // Save AI search to history
    try {
      const { getTursoClient, initDatabase } = await import('@/lib/turso');
      await initDatabase();
      const client = getTursoClient();
      await client.execute({
        sql: `INSERT INTO ai_searches (id, user_id, query, actor_id, input_params, executed, run_id)
              VALUES (?, ?, ?, ?, ?, ?, ?)`,
        args: [
          crypto.randomUUID(),
          session.id,
          query,
          aiResponse.actorId || null,
          JSON.stringify(aiResponse.input || {}),
          runId ? 1 : 0,
          runId,
        ],
      });
    } catch {
      // Optional save
    }

    return NextResponse.json({
      actorId: aiResponse.actorId,
      actorName: aiResponse.actorName || matchedActor?.name,
      input: aiResponse.input || {},
      explanation: aiResponse.explanation || '',
      warning: aiResponse.warning || null,
      runId,
      runError,
      autoExecuted: !!runId,
    });
  } catch (error: any) {
    console.error('[AI Search] Error:', error);
    return NextResponse.json(
      { error: `Erro na busca IA: ${error.message || 'Desconhecido'}` },
      { status: 500 }
    );
  }
}
