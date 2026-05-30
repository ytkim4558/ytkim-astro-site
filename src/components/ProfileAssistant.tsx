import { useState } from 'react';

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

function respond(question: string) {
  const q = question.toLowerCase();
  if (!q.trim()) return '질문을 입력해 주세요.';
  if (q.includes('opensearch') || q.includes('aws') || q.includes('support') || q.includes('서포트')) return facts.openSearch;
  if (q.includes('mcp') || q.includes('ai') || q.includes('workflow') || q.includes('워크플로') || q.includes('slack') || q.includes('자동화')) return facts.aiWorkflow;
  if (q.includes('project') || q.includes('프로젝트') || q.includes('대표') || q.includes('도구') || q.includes('tool')) return facts.projects;
  if (q.includes('대학') || q.includes('학력') || q.includes('학교') || q.includes('석사') || q.includes('학사') || q.includes('전공') || q.includes('education') || q.includes('university') || q.includes('degree')) return facts.education;
  return facts.profile;
}

export default function ProfileAssistant() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('질문을 입력하면 정적 프로필 문맥으로 답변합니다.');
  const prompts = [
    ['OpenSearch 경험', 'OpenSearch와 AWS Support 경험을 요약해줘'],
    ['AI workflow', 'AI workflow와 MCP 자동화 경험이 뭐야?'],
    ['대표 프로젝트', '대표 프로젝트를 알려줘'],
    ['학력', '대학과 학력을 알려줘'],
  ];

  const ask = (value = question) => {
    setQuestion(value);
    setAnswer(respond(value));
  };

  return (
    <section className="feature-card" aria-label="Ask about Yongtak Kim">
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
        {prompts.map(([label, value]) => (
          <button key={label} type="button" onClick={() => ask(value)}>
            {label}
          </button>
        ))}
      </div>
      <label htmlFor="profile-question">Question</label>
      <textarea
        id="profile-question"
        rows={3}
        value={question}
        placeholder="예: 대학은?"
        onChange={(event) => setQuestion(event.currentTarget.value)}
      />
      <button type="button" onClick={() => ask()}>Ask</button>
      <p style={{ marginTop: '18px' }}>{answer}</p>
    </section>
  );
}
