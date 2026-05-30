import { createServer } from 'node:http';

const port = Number(process.env.PROFILE_CHAT_PORT ?? 8787);
const model = process.env.PROFILE_CHAT_MODEL ?? 'gpt-5-mini';
const maxInputChars = Number(process.env.PROFILE_CHAT_MAX_INPUT_CHARS ?? 420);
const maxHistoryTurns = Number(process.env.PROFILE_CHAT_MAX_HISTORY_TURNS ?? 4);
const maxOutputTokens = Number(process.env.PROFILE_CHAT_MAX_OUTPUT_TOKENS ?? 220);

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

function json(res, status, payload) {
  res.writeHead(status, {
    'Access-Control-Allow-Origin': process.env.PROFILE_CHAT_ORIGIN ?? 'http://127.0.0.1:4321',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json; charset=utf-8',
  });
  res.end(JSON.stringify(payload));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 16_384) {
        req.destroy();
        reject(new Error('request body too large'));
      }
    });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

function compactHistory(history) {
  if (!Array.isArray(history)) return [];
  return history
    .slice(-(maxHistoryTurns * 2))
    .map((message) => ({
      role: message.role === 'user' ? 'user' : 'assistant',
      content: String(message.content ?? '').slice(0, maxInputChars),
    }));
}

function extractResponseText(payload) {
  if (typeof payload.output_text === 'string') return payload.output_text;
  const chunks = [];
  for (const item of payload.output ?? []) {
    for (const content of item.content ?? []) {
      if (typeof content.text === 'string') chunks.push(content.text);
    }
  }
  return chunks.join('\n').trim();
}

async function answerWithOpenAI(question, history) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not set');
  }

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
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
      max_output_tokens: maxOutputTokens,
      store: false,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error.slice(0, 300));
  }

  const payload = await response.json();
  const answer = extractResponseText(payload);
  if (!answer) throw new Error('empty model response');
  return answer;
}

const server = createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    json(res, 200, { ok: true });
    return;
  }

  if (req.method !== 'POST' || req.url !== '/profile-chat') {
    json(res, 404, { error: 'not found' });
    return;
  }

  try {
    const body = await readBody(req);
    const payload = JSON.parse(body);
    const question = String(payload.question ?? '').trim().slice(0, maxInputChars);
    if (!question) {
      json(res, 400, { error: 'question is required' });
      return;
    }

    const history = compactHistory(payload.history);
    const answer = await answerWithOpenAI(question, history);
    json(res, 200, {
      answer,
      source: 'openai-responses',
      limits: { maxInputChars, maxHistoryTurns, maxOutputTokens },
    });
  } catch (error) {
    json(res, 500, { error: error instanceof Error ? error.message : 'profile chat failed' });
  }
});

server.listen(port, '127.0.0.1', () => {
  console.log(`Profile chat proxy listening on http://127.0.0.1:${port}/profile-chat`);
});
