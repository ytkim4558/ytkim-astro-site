const DEFAULT_MODEL = 'gpt-5-mini';
const MAX_INPUT_CHARS = 420;
const MAX_HISTORY_TURNS = 4;
const MAX_OUTPUT_TOKENS = 220;

const profileContext = `
김용탁 프로필 문맥:
- AWS Cloud Support Engineer II / Analytics. Amazon OpenSearch, Kinesis, QuickSight 고객 기술 지원.
- Amazon OpenSearch Service Subject Matter Expert. 대규모 OpenSearch 클러스터 안정화, shard, master node, ingestion, dashboard/console 이슈 대응.
- 10년 이상 모바일, 백엔드, 데이터 플랫폼, 클라우드 지원 경력.
- CJ 올리브네트웍스 Data Platform Senior Engineer. CP4D/OpenShift 마이그레이션, Solr, MongoDB, Redis, Impala, Hive, MariaDB.
- G.Bike SW Engineer. Android/iOS 앱, PHP 백엔드, MySQL, 전동 킥보드 대여/반납/면허 검증/관리자 기능.
- 팀노바, 디오텍, 디지탈아리아에서 Android/iOS, OCR, 영상처리, 3D GUI, 국책과제 PM 경험.
- 대표 AI workflow 작업: claude-resume, codex-resume, linkedin-posting-mcp, support-agent/MCP 자동화.
- 학력: 한양대학교 대학원 컴퓨터공학과 석사(2010.03~2012.02, 4.14/4.50), 한국산업기술대학교 컴퓨터공학과 학사(2006.03~2010.02, 4.25/4.50), 동북고등학교.
`.trim();

function json(status, payload) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}

function compactHistory(history) {
  if (!Array.isArray(history)) return [];
  return history
    .slice(-(MAX_HISTORY_TURNS * 2))
    .map((message) => ({
      role: message?.role === 'user' ? 'user' : 'assistant',
      content: String(message?.content ?? '').slice(0, MAX_INPUT_CHARS),
    }));
}

function extractResponseText(payload) {
  if (typeof payload.output_text === 'string') return payload.output_text.trim();
  const chunks = [];
  for (const item of payload.output ?? []) {
    for (const content of item.content ?? []) {
      if (typeof content.text === 'string') chunks.push(content.text);
    }
  }
  return chunks.join('\n').trim();
}

export async function onRequestPost(context) {
  let body;
  try {
    body = await context.request.json();
  } catch {
    return json(400, { error: 'invalid json' });
  }

  const question = String(body.question ?? '').trim().slice(0, MAX_INPUT_CHARS);
  if (!question) {
    return json(400, { error: 'question is required' });
  }

  const apiKey = context.env.OPENAI_API_KEY;
  if (!apiKey) {
    return json(503, { error: 'OPENAI_API_KEY is not configured' });
  }

  const history = compactHistory(body.history);
  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: context.env.PROFILE_CHAT_MODEL ?? DEFAULT_MODEL,
      instructions:
        'You answer as a concise Korean profile assistant for Yongtak Kim. Use only the supplied profile context and conversation. If the context is insufficient, say that the public profile does not include enough detail. Do not invent employers, dates, schools, awards, or private facts.',
      input: [
        {
          role: 'user',
          content: [
            {
              type: 'input_text',
              text: `${profileContext}\n\nRecent conversation:\n${JSON.stringify(history)}\n\nQuestion: ${question}`,
            },
          ],
        },
      ],
      max_output_tokens: MAX_OUTPUT_TOKENS,
      store: false,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    return json(response.status, { error: error.slice(0, 300) });
  }

  const payload = await response.json();
  const answer = extractResponseText(payload);
  if (!answer) {
    return json(502, { error: 'empty model response' });
  }

  return json(200, {
    answer,
    source: 'openai-responses',
    limits: {
      maxInputChars: MAX_INPUT_CHARS,
      maxHistoryTurns: MAX_HISTORY_TURNS,
      maxOutputTokens: MAX_OUTPUT_TOKENS,
    },
  });
}

export function onRequest() {
  return json(405, { error: 'method not allowed' });
}
