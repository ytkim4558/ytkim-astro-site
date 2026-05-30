import { useMemo, useState } from 'react';

const MAX_INPUT_CHARS = Number(import.meta.env.PUBLIC_PROFILE_CHAT_MAX_INPUT_CHARS ?? 420);
const MAX_HISTORY_TURNS = Number(import.meta.env.PUBLIC_PROFILE_CHAT_MAX_HISTORY_TURNS ?? 4);
const MAX_OUTPUT_TOKENS = Number(import.meta.env.PUBLIC_PROFILE_CHAT_MAX_OUTPUT_TOKENS ?? 220);
const ENDPOINT = import.meta.env.PUBLIC_PROFILE_CHAT_ENDPOINT ?? '/api/profile-chat';

const facts = {
  openSearch:
    '김용탁은 AWS Cloud Support Engineer이자 OpenSearch SME입니다. 고객의 OpenSearch 이슈, 분석 워크로드, 운영 문제, 에스컬레이션 흐름을 다루며 troubleshooting과 기술 커뮤니케이션을 중심으로 일합니다.',
  aiWorkflow:
    'AI workflow 쪽에서는 MCP로 Slack, Outlook, wiki, ticket search, local tools를 연결하고, 답변 검증, 이슈 재현, case aging triage, handoff 흐름을 설계했습니다.',
  projects:
    '대표 작업물은 claude-resume, codex-resume, linkedin-posting-mcp, 그리고 Engineering Notes 사이트입니다. AI coding agent 세션을 찾고 이어가기 위한 TUI 도구와 LinkedIn 초안/승인 워크플로가 포함됩니다.',
  education:
    '학력은 한양대학교 대학원 컴퓨터공학과 석사(2010.03~2012.02, 4.14/4.50), 한국산업기술대학교 컴퓨터공학과 학사(2006.03~2010.02, 4.25/4.50), 동북고등학교입니다.',
  profile:
    '김용탁은 모바일 앱과 백엔드 개발에서 시작해 데이터 플랫폼과 AWS Analytics Support로 확장했고, 현재는 OpenSearch SME 경험과 AI 지원 자동화 워크플로를 결합해 반복되는 문제를 도구화하는 데 집중합니다.',
};

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
  source?: 'local' | 'llm';
};

function respond(question: string) {
  const q = question.toLowerCase();
  if (!q.trim()) return '질문을 입력해 주세요.';
  if (q.includes('opensearch') || q.includes('aws') || q.includes('support') || q.includes('서포트')) return facts.openSearch;
  if (q.includes('mcp') || q.includes('ai') || q.includes('workflow') || q.includes('워크플로') || q.includes('slack') || q.includes('자동화')) return facts.aiWorkflow;
  if (q.includes('project') || q.includes('프로젝트') || q.includes('대표') || q.includes('도구') || q.includes('tool')) return facts.projects;
  if (q.includes('대학') || q.includes('학력') || q.includes('학교') || q.includes('석사') || q.includes('학사') || q.includes('전공') || q.includes('education') || q.includes('university') || q.includes('degree')) return facts.education;
  return facts.profile;
}

function trimQuestion(value: string) {
  return value.trim().slice(0, MAX_INPUT_CHARS);
}

export default function ProfileAssistant() {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: '질문을 입력하면 로컬 프로필 문맥으로 즉시 답변합니다. 로컬 LLM 프록시가 켜져 있으면 같은 UI에서 LLM 답변으로 전환됩니다.',
      source: 'local',
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'local' | 'llm'>('local');

  const remainingChars = useMemo(
    () => Math.max(0, MAX_INPUT_CHARS - question.length),
    [question],
  );

  const prompts = [
    ['OpenSearch 경험', 'OpenSearch와 AWS Support 경험을 요약해줘'],
    ['AI workflow', 'AI workflow와 MCP 자동화 경험이 뭐야?'],
    ['대표 프로젝트', '대표 프로젝트를 알려줘'],
    ['학력', '대학과 학력을 알려줘'],
  ];

  const ask = async (value = question) => {
    const nextQuestion = trimQuestion(value);
    setQuestion(nextQuestion);
    if (!nextQuestion) {
      setMessages((current) => [...current, { role: 'assistant', content: '질문을 입력해 주세요.', source: 'local' }]);
      return;
    }

    const userMessage: ChatMessage = { role: 'user', content: nextQuestion };
    const nextMessages = [...messages, userMessage].slice(-(MAX_HISTORY_TURNS * 2 + 1));
    setMessages((current) => [...current, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: nextQuestion,
          history: nextMessages,
          limits: {
            maxInputChars: MAX_INPUT_CHARS,
            maxHistoryTurns: MAX_HISTORY_TURNS,
            maxOutputTokens: MAX_OUTPUT_TOKENS,
          },
        }),
      });

      if (!response.ok) throw new Error(`Profile chat returned ${response.status}`);
      const data = await response.json();
      const answer = typeof data.answer === 'string' ? data.answer : respond(nextQuestion);
      setMode('llm');
      setMessages((current) => [...current, { role: 'assistant', content: answer, source: 'llm' }]);
    } catch {
      setMode('local');
      setMessages((current) => [...current, { role: 'assistant', content: respond(nextQuestion), source: 'local' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="profile-assistant" aria-label="Ask about Yongtak Kim">
      <div className="assistant-header">
        <div>
          <span>Ask Profile</span>
          <strong>{mode === 'llm' ? 'LLM answer' : 'Local profile answer'}</strong>
        </div>
        <small>{MAX_OUTPUT_TOKENS} output tokens · {remainingChars} chars left</small>
      </div>

      <div className="assistant-prompts">
        {prompts.map(([label, value]) => (
          <button key={label} type="button" onClick={() => ask(value)} disabled={isLoading}>
            {label}
          </button>
        ))}
      </div>

      <div className="assistant-messages" aria-live="polite">
        {messages.map((message, index) => (
          <p key={`${message.role}-${index}`} className={`assistant-message ${message.role}`}>
            <span>{message.source === 'llm' ? 'LLM' : message.role === 'user' ? 'YOU' : 'PROFILE'}</span>
            {message.content}
          </p>
        ))}
        {isLoading && <p className="assistant-message assistant"><span>PROFILE</span>답변을 가져오는 중입니다.</p>}
      </div>

      <label htmlFor="profile-question">Question</label>
      <textarea
        id="profile-question"
        rows={3}
        maxLength={MAX_INPUT_CHARS}
        value={question}
        placeholder="예: 대학은?"
        onChange={(event) => setQuestion(event.currentTarget.value)}
      />
      <div className="assistant-actions">
        <button type="button" onClick={() => ask()} disabled={isLoading}>Ask</button>
        <button type="button" className="secondary-button" onClick={() => setMessages([])} disabled={isLoading}>Reset</button>
      </div>
    </section>
  );
}
