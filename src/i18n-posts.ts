type Section = {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
};

export type LocalizedPost = {
  title: string;
  description: string;
  sections: Section[];
};

export const enPosts: Record<string, LocalizedPost> = {
  'adaptive-mobile-layout-handoff': {
    title: 'Responsive vs. Adaptive Layout Decisions and Handoff Rules',
    description: 'A record of fixing inconsistent portfolio and AI Workflow page headers while documenting the layout decision and agent handoff rule.',
    sections: [
      {
        heading: 'Context',
        paragraphs: [
          'The old GitHub Pages portfolio, tag pages, and post detail pages did not feel like one coherent interface. Header density, spacing, and page framing changed from page to page.',
          'The issue was not only visual. Future AI sessions needed to understand why the layout choice was made instead of repeating the same debate.',
        ],
      },
      {
        heading: 'Decision',
        bullets: [
          'Keep one shared HTML structure and adapt density and layout by viewport instead of creating separate device-specific pages.',
          'Make portfolio, tag, and post headers consistent, while letting page copy and content carry the difference.',
          'When a UI, build, deploy, or workflow decision becomes reusable, record it as an AI Workflow note or handoff memo.',
        ],
      },
      {
        heading: 'Result',
        paragraphs: [
          'The layout became easier to scan across desktop and mobile, and the handoff rule now tells future sessions to check past notes and git history before making the same decision again.',
        ],
      },
    ],
  },
  android: {
    title: 'Android Development Notes',
    description: 'Older Android notes covering app settings, UI work, and implementation details from early mobile projects.',
    sections: [
      {
        heading: 'Overview',
        paragraphs: [
          'This is an early Android development note from the period when I was building mobile apps and learning through hands-on product work.',
        ],
      },
      {
        heading: 'Portfolio Context',
        paragraphs: [
          'Together with HotDealppom, BikeNavi, and group contact projects, this note represents the mobile-development foundation behind later backend, data-platform, and cloud-support work.',
        ],
      },
    ],
  },
  'browser-ui-validation-guardrails': {
    title: 'Turning Portfolio Modal and Mobile Readability Issues into Browser Checks',
    description: 'How portfolio screenshots, side-project modals, and mobile readability problems became Playwright-based UI validation instead of one-off fixes.',
    sections: [
      {
        heading: 'Trigger',
        paragraphs: [
          'Static link and content checks passed, but the migrated portfolio still had real usability problems. Screenshot galleries were cramped inside modals, side-project details were hard to discover, and mobile layout issues were not being caught automatically.',
        ],
      },
      {
        heading: 'Fix',
        bullets: [
          'Added a Playwright-based validation script that serves the built dist output and opens pages in desktop and mobile viewports.',
          'Checked generated pages for readable content, heading structure, broken images, and horizontal overflow.',
          'Clicked portfolio modal cards for side projects, HotDealppom, and BikeNavi, then verified text length, markers, images, iframes, and mobile gallery width.',
          'Improved modal gallery CSS so screenshots use readable spacing and one-column mobile layout.',
        ],
      },
      {
        heading: 'Rule',
        paragraphs: [
          'For UI migration work, content existence is not enough. Future agents must verify that a person can click, read, and inspect the content in both desktop and mobile browsers.',
        ],
      },
    ],
  },
  'building-ai-native-cli-workflow': {
    title: 'Building an AI-Native CLI Workflow',
    description: 'A note on reducing repeated approvals, restoring agent session context, and stabilizing terminal rendering for practical AI-assisted development.',
    sections: [
      {
        heading: 'Context',
        paragraphs: [
          'AI coding agents are most useful when they can keep working across file edits, terminal commands, verification, and deployment. The default CLI experience can still be slowed down by repeated permission prompts, lost session context, and terminal rendering issues.',
        ],
      },
      {
        heading: 'Changes',
        bullets: [
          'Reduced repeated permission interruptions in trusted local development environments while keeping validation and CI guardrails in place.',
          'Built TUI-based session browsers so past Claude Code and Codex work can be found by summary instead of raw session IDs.',
          'Stabilized Windows terminal encoding and font behavior so Korean and English output can be reviewed without misleading rendering errors.',
        ],
      },
      {
        heading: 'Rule',
        paragraphs: [
          'AI-native development is not only prompt design. It depends on CLI ergonomics, reliable session recovery, verification scripts, and deployment guardrails working together.',
        ],
      },
    ],
  },
  'claude-resume-troubleshooting': {
    title: 'Troubleshooting the claude-resume TUI',
    description: 'How I built a TUI for finding and resuming Claude Code sessions, then fixed encoding, key conflicts, recursive calls, and screenshot handling.',
    sections: [
      {
        heading: 'Goal',
        paragraphs: [
          'The default Claude Code resume flow made it hard to identify past sessions quickly. I built a two-panel TUI with a session list on the left and conversation preview on the right.',
        ],
      },
      {
        heading: 'Problems Fixed',
        bullets: [
          'Korean text broke in Windows CMD and PowerShell until UTF-8 handling was forced.',
          'TUI key bindings conflicted with the resume handoff flow.',
          'The summarizer could accidentally include its own session logs, creating recursive noise.',
          'Screenshots and sensitive visual context needed masking before being reused.',
        ],
      },
      {
        heading: 'Result',
        paragraphs: [
          'The tool became a practical session picker that can summarize, preview, and resume previous Claude Code work without reading large JSONL files manually.',
        ],
      },
    ],
  },
  'codex-resume-tui-decision': {
    title: 'Why codex-resume Uses a TUI',
    description: 'A decision note on building a Windows-friendly TUI for searching and resuming OpenAI Codex CLI local sessions.',
    sections: [
      {
        heading: 'Context',
        paragraphs: [
          'Codex CLI session logs exist locally as JSONL files, but finding the right session requires better browsing, sorting, and preview than raw file inspection.',
        ],
      },
      {
        heading: 'Design Choices',
        bullets: [
          'Use the native Codex resume command and add only the missing discovery layer.',
          'Sort by timestamps inside JSONL instead of file mtime so summary generation does not disturb ordering.',
          'Keep dependencies light and Windows-friendly by relying mostly on Node.js built-ins.',
        ],
      },
      {
        heading: 'Result',
        paragraphs: [
          'The result is a small command-line tool with doctor, list, index, and resume flows for quickly finding the right Codex session.',
        ],
      },
    ],
  },
  git: {
    title: 'Creating a PR Without Forking a Private Repository',
    description: 'A note on creating a branch and pull request in a private company repository when personal forks are not allowed.',
    sections: [
      {
        heading: 'Context',
        paragraphs: [
          'Some companies do not allow developers to fork private repositories into personal namespaces. In that case, a pull request can still be created from a branch inside the same repository if permissions allow it.',
        ],
      },
      {
        heading: 'Flow',
        bullets: [
          'Clone the target repository locally.',
          'Create a work branch.',
          'Change the code and commit it.',
          'Push the branch to the remote repository.',
          'Use the repository UI to open a pull request back to the original branch.',
        ],
      },
      {
        heading: 'Key Point',
        paragraphs: [
          'Forking is not the essential part of a pull request workflow. The essential part is having permission to push a branch that can be compared against the target branch.',
        ],
      },
    ],
  },
  jekyll: {
    title: 'Jekyll Blog Operations Note',
    description: 'A legacy note from the earlier GitHub Pages and Jekyll version of this site.',
    sections: [
      {
        heading: 'Overview',
        paragraphs: [
          'This site used to be a Jekyll-based GitHub Pages blog. Posts, tags, static assets, and dependencies followed the Jekyll workflow.',
        ],
      },
      {
        heading: 'Current Role',
        paragraphs: [
          'The note remains as migration history. It explains why the site eventually moved toward Astro, Cloudflare Pages, and a more explicit content structure.',
        ],
      },
    ],
  },
  'jekyll-dependabot-cleanup': {
    title: 'Cleaning Up Dependabot Alerts in an Old Jekyll Blog',
    description: 'A maintenance note about reviewing dependency alerts in the old Jekyll site and using that work to inform the Astro migration.',
    sections: [
      {
        heading: 'Context',
        paragraphs: [
          'The old Jekyll blog had accumulated multiple Dependabot vulnerability alerts. I needed to decide whether to keep patching the old stack or move to a cleaner static-site structure.',
        ],
      },
      {
        heading: 'Work Done',
        bullets: [
          'Reviewed the dependency warnings.',
          'Compared the maintenance cost of keeping Jekyll with the flexibility of moving to Astro.',
          'Rechecked the boundary between public repository content and private operational notes.',
        ],
      },
      {
        heading: 'Result',
        paragraphs: [
          'Astro became the better long-term fit because the site needed improved UI control, Cloudflare Pages Functions, and profile/chat features.',
        ],
      },
    ],
  },
  'linkedin-api-permission-check': {
    title: 'LinkedIn API Permission Check and Posting Workflow Design',
    description: 'A record of checking LinkedIn API limits and shifting from automated reading to a user-approved posting workflow.',
    sections: [
      {
        heading: 'Goal',
        paragraphs: [
          'Before writing a new LinkedIn post, I wanted to read my previous posts through the API and match their tone. I assumed LinkedIn would work like GitHub: create an OAuth app, sign in, call an API, and read my own content.',
          'The actual goal was simple: create a LinkedIn Developer app, authenticate my own account, fetch recent posts, analyze sentence length, bilingual phrasing, hashtag style, and then draft a new post in the same tone.',
          'Because I already had a local MCP server called linkedin-posting-mcp, I tried to add a post-reading tool there instead of building a separate one-off script.',
        ],
      },
      {
        heading: 'What I Implemented',
        bullets: [
          '`linkedin_get_my_posts` MCP tool.',
          '`auth:url:signin` for a minimal `openid profile email` login test.',
          '`auth:url` for `openid profile email w_member_social` posting-permission testing.',
          '`auth:url:read` for testing whether `r_member_social` could enable existing-post reads.',
          '`posts:me` for trying LinkedIn Posts API author finder calls against the authenticated member.',
          'The intended API shape was `GET /rest/posts?author=urn:li:person:{member_id}&q=author`.',
        ],
      },
      {
        heading: 'Setup Details That Caused Confusion',
        bullets: [
          'A LinkedIn Developer app requires a connected LinkedIn Page, so I created a personal technical-notes page named Yongtak Engineering Notes.',
          'The first page-creation path led to a Showcase Page under `linkedin.com/showcase/`, which was wrong for this purpose because it expects a parent organization page.',
          'The correct path was a normal Company Page under `linkedin.com/company/`, used only as the app owner page.',
          'LinkedIn Developer app names cannot contain the word LinkedIn, so the app name had to change from Yongtak LinkedIn Workflow to something like Yongtak AI Workflow.',
          'The app requires a valid logo. I prepared a separate 300x300 PNG because the logo appears in the OAuth consent screen even though it is not technically important to the API test.',
        ],
      },
      {
        heading: 'PowerShell and OAuth Pitfalls',
        bullets: [
          'During testing, I avoided saving secrets in user environment variables and instead used the current PowerShell session with `Read-Host`.',
          'The redirect URI was registered as `http://localhost:3000/callback`.',
          'When no local callback server was listening, LinkedIn showed a confusing browser error after redirect. That did not necessarily mean OAuth had failed.',
          'A tiny Node HTTP server was enough to capture the callback URL and print the authorization code.',
          'For token exchange, only the value of `code` should be passed. Copying `code=` or the trailing `&state=...` causes token exchange failure.',
          'If a Client Secret, authorization code, or access token appears in chat or logs, rotate it immediately in the LinkedIn Developer console.',
        ],
      },
      {
        heading: 'Errors and Interpretation',
        bullets: [
          '`Missing LinkedIn config` meant the current PowerShell session did not contain the expected environment variables.',
          '`Missing ) in method call` or `Unexpected token User` came from broken PowerShell `SetEnvironmentVariable()` syntax, usually a missing comma or quote issue.',
          '`Bummer, something went wrong` usually meant the browser had been redirected to localhost without a server listening on the callback port.',
          '`authorization code not found` meant the code was copied incorrectly, reused, or expired.',
          '`ACCESS_DENIED: Not enough permissions to access: partnerApiPostsExternal.FINDER-author` meant OAuth login and token issuance worked, but the app did not have Posts Finder read permission.',
          '`Please upload a valid app logo` meant the Developer app logo did not meet LinkedIn requirements.',
        ],
      },
      {
        heading: 'Blocked Point',
        paragraphs: [
          'The main blocker was not JavaScript syntax, the localhost redirect, or token exchange. The blocker was API permission.',
          'The app could authenticate and issue tokens, but `posts:me` returned `ACCESS_DENIED` for the Posts API author finder. Adding `r_member_social` to the requested scope did not change the result.',
          'The official LinkedIn Marketing API FAQ describes `r_member_social` as a closed permission, and resource constraints currently limit access requests. That means a personal developer app should not expect to read existing member posts immediately.',
        ],
      },
      {
        heading: 'Conclusion and Rule',
        bullets: [
          'OIDC login is possible.',
          'Token issuance is possible.',
          'A posting workflow can be built within approved scopes.',
          'Reading existing personal posts is not available by default without restricted permission approval.',
          'Do not use browser cookies, private APIs, scraping, or DM automation.',
          'Use only official OAuth and documented APIs.',
          'If existing-post tone matching is needed, ask the user for two or three sample posts and generate the draft from those samples.',
          'Never leave Client Secret, authorization code, or access token in chat, repository files, or logs.',
          'The core lesson: an API existing is different from the current app having permission to use the specific API operation.',
        ],
      },
    ],
  },
  '_ja-linkedin-api-permission-check-expanded-draft': {
    title: 'LinkedIn API権限確認と投稿ワークフロー設計',
    description: 'LinkedIn APIで既存投稿を読んで文体を合わせようとしたが、権限制約により承認型投稿補助ワークフローへ切り替えた記録。',
    sections: [
      {
        heading: '目的',
        paragraphs: [
          'LinkedInに新しい投稿を出す前に、過去投稿をAPIで読み取り、文体やトーンを合わせたいと考えた。最初はGitHub APIのように、OAuth appを作り、本人認証を通し、自分の投稿をすぐ読めると思っていた。',
          '実際の目的は単純だった。LinkedIn Developer appを作成し、本人accountでOAuth認証し、既存投稿を取得し、文章の長さ、文体、英語と日本語・韓国語の併記、hashtagの使い方を分析して、新しいLinkedIn post draftに反映することだった。',
          'すでにlinkedin-posting-mcpというlocal MCP serverを作っていたため、別scriptではなく、そのtool群に既存投稿読み取り機能を追加できるか確認した。',
        ],
      },
      {
        heading: '実装したもの',
        bullets: [
          '`linkedin_get_my_posts` MCP tool。',
          '`auth:url:signin`: `openid profile email`だけを要求する最小login test。',
          '`auth:url`: `openid profile email w_member_social`でposting permissionを確認するflow。',
          '`auth:url:read`: `r_member_social`を含めて既存投稿読み取りの可能性を確認するflow。',
          '`posts:me`: authenticated userのrecent posts取得test。',
          '想定したPosts API callは`GET /rest/posts?author=urn:li:person:{member_id}&q=author`だった。',
        ],
      },
      {
        heading: '設定中に迷った点',
        bullets: [
          'LinkedIn Developer appには接続するLinkedIn Pageが必要だったため、個人技術ノート用のYongtak Engineering Notes pageを作成した。',
          '最初は`Create a new LinkedIn Page`から`linkedin.com/showcase/`形式のShowcase Page作成画面へ入ったが、これは既存company pageの下位pageなので今回の目的に合わなかった。',
          'Developer App接続用には`linkedin.com/company/`形式のnormal Company Pageを使うのが正しい。',
          'Developer app nameにはLinkedInというbrand wordを入れられないため、Yongtak LinkedIn WorkflowではなくYongtak AI Workflowのような名前へ変更した。',
          'App logoも有効な300x300 PNG/JPGが必要だった。機能には直接関係ないが、OAuth consent screenに表示されるため、識別可能なlogoを用意した。',
        ],
      },
      {
        heading: 'PowerShellとOAuthで詰まった点',
        paragraphs: [
          'テスト段階ではClient IDやClient SecretをUser environment variableへ保存せず、現在のPowerShell sessionだけに`Read-Host`で入れる方式にした。Windowを閉じれば消えるため、secretを平文で長く残さずに済む。',
          'Redirect URIは`http://localhost:3000/callback`として登録した。最初はcallbackを受けるlocal serverがなかったため、LinkedIn redirect後にbrowser errorが出たが、これはOAuthそのものの失敗ではなく、localhostで受けるserverがなかったことによる混乱だった。',
          'Authorization code exchangeではcallback URL全体ではなく、`code` valueだけを渡す必要がある。`code=`や`&state=...`を含めるとtoken exchangeは失敗する。',
        ],
      },
      {
        heading: 'エラー別の見方',
        bullets: [
          '`Missing LinkedIn config`は現在のPowerShell sessionにLinkedIn app設定がないという意味。',
          '`Missing ) in method call`や`Unexpected token User`はPowerShellの`SetEnvironmentVariable()`呼び出しでcommaやquoteが壊れた時に出る。',
          '`Bummer, something went wrong`はlocalhost callback serverが起動していない時にも出るため、OAuth失敗と即断しない。',
          '`authorization code not found`はcodeを誤ってcopyした、すでに使った、または期限切れになった可能性が高い。',
          '`ACCESS_DENIED: Not enough permissions to access: partnerApiPostsExternal.FINDER-author`はlogin/token issuanceは成功したが、Posts Finder API read permissionがないという意味。',
          '`Please upload a valid app logo`はDeveloper app logoが条件を満たしていないという意味。',
        ],
      },
      {
        heading: '詰まった本当の理由',
        paragraphs: [
          '最終的なblockerはOAuth callback処理や実装文法ではなく、LinkedIn appに許可されたAPI permissionの境界だった。',
          '`posts:me`を実行するとPosts API author finderに対して`ACCESS_DENIED`が返った。`r_member_social`をscopeに含めて再認証しても結果は変わらなかった。',
          '公式FAQを見ると、`r_member_social`はclosed permissionとして扱われ、現在はresource constraintによりaccess requestを受け付けないという説明になっている。つまり個人開発者appから既存の個人投稿をすぐ読める前提は危険だった。',
        ],
      },
      {
        heading: '結論と今後のルール',
        bullets: [
          'OIDC loginは可能。',
          'Token issuanceも可能。',
          '承認済みscopeの範囲ならposting workflowは作れる。',
          'しかし既存の個人投稿読み取りは、restricted permission approvalなしではすぐ使えない。',
          'Browser cookie、private API、scraping、DM automationは使わない。',
          '公式OAuthとdocumented APIだけを使う。',
          '既存投稿のtone matchingが必要なら、ユーザーに投稿sampleを2-3個渡してもらい、そのsampleからdraftを作る。',
          'Client Secret、authorization code、access tokenはchat、repository、logに残さない。',
          '今回の核心は、APIが存在することと、現在のapp権限でそのAPI operationを使えることは別問題だという点だった。',
        ],
      },
    ],
  },
  mysql: {
    title: 'Using LIKE to Search Part of a String in MySQL',
    description: 'A short note on using MySQL LIKE for prefix, suffix, and contains searches.',
    sections: [
      {
        heading: 'Context',
        paragraphs: [
          'I needed to find users by part of a phone number and had to confirm the correct LIKE pattern.',
        ],
      },
      {
        heading: 'Patterns',
        bullets: [
          '`mobile like "4558%"` finds values that start with 4558.',
          '`mobile like "%4558"` finds values that end with 4558.',
          '`mobile like "%4558%"` finds values that contain 4558.',
        ],
      },
    ],
  },
  'windows-terminal-crash-fix': {
    title: 'Fixing Windows Terminal Closing Immediately',
    description: 'A troubleshooting note for Windows Terminal failing to open with DCOM 10010 and invalid graphics settings.',
    sections: [
      {
        heading: 'Symptoms',
        bullets: [
          'PowerShell and Windows Terminal closed immediately after launch.',
          'Event Viewer showed DCOM 10010 errors.',
          'The Terminal settings file contained an invalid graphicsAPI value.',
        ],
      },
      {
        heading: 'Fix',
        paragraphs: [
          'Changing the setting alone was not enough, so I removed and re-registered Windows Terminal. I also checked the fallback path of temporarily using Windows Console Host.',
        ],
      },
      {
        heading: 'Lesson',
        paragraphs: [
          'Invalid Windows Terminal settings can fail quietly. When the terminal closes immediately, check both the settings file and the app registration state.',
        ],
      },
    ],
  },
  'content-reachability-validation': {
    title: 'Turning a Missed Portfolio Detail into Content Reachability Validation',
    description: 'A note on replacing a narrow AI-proposed heuristic with a deploy-time check that every public post and portfolio detail has a reachable path.',
    sections: [
      {
        heading: 'Trigger',
        paragraphs: [
          'During the Astro portfolio migration, a project card looked fine but opened only a one-line summary. The detailed HotDealppom content still existed, but users could not reach the video, screenshots, and technical record from the card.',
        ],
      },
      {
        heading: 'User Correction',
        paragraphs: [
          'The first AI fix checked whether a modal target was a list item. That solved one symptom but not the real rule. The better requirement was that every non-intentionally-hidden content item must have a public reachable path.',
        ],
      },
      {
        heading: 'Fix',
        bullets: [
          'Replaced the portfolio-only heuristic with `validate:content`.',
          'Validated built post routes, tag/index reachability, and localized portfolio detail reachability.',
          'Kept intentionally hidden records in an explicit declaration list.',
          'Added the work back to the portfolio as an AI collaboration quality-gate example.',
        ],
      },
    ],
  },
};

export const jaPosts: Record<string, LocalizedPost> = {
  'adaptive-mobile-layout-handoff': {
    title: 'レスポンシブとアダプティブ判断、そしてAI引き継ぎルール',
    description: 'ポートフォリオとAI Workflow記事の上部レイアウトを見直し、画面幅ごとの設計判断とエージェント引き継ぎルールを整理した記録。',
    sections: [
      {
        heading: '背景',
        paragraphs: [
          '旧GitHub Pagesのポートフォリオ、タグページ、記事詳細ページを見直したところ、ページごとに上部レイアウトの密度や見え方が揃っていなかった。',
          '単に見た目を直すだけではなく、次のAIエージェントが同じ判断を繰り返さないように、判断理由と作業履歴を残す必要があった。',
        ],
      },
      {
        heading: '判断',
        bullets: [
          '完全な別ページを端末ごとに作るより、共通HTMLを保ちつつ画面幅に応じて密度と配置を変える方が保守しやすい。',
          'ポートフォリオ、タグ、記事詳細の上部構造を揃え、ページの種類ごとの差はコピーとコンテンツで出す。',
          'UI・ビルド・デプロイ判断が発生したら、AI Workflow記事またはhandoffメモとして残す。',
        ],
      },
      {
        heading: '結果',
        paragraphs: [
          'モバイル/デスクトップの表示崩れを抑え、次回以降の作業ではAGENTS.mdだけでなく過去記事とgit historyも確認するルールを残した。',
        ],
      },
    ],
  },
  android: {
    title: 'Android開発メモ',
    description: 'Androidアプリ開発中に確認した設定、UI、実装メモをまとめた古い技術ノート。',
    sections: [
      {
        heading: '概要',
        paragraphs: [
          'Androidアプリ開発の初期に残した技術メモ。言語設定、画面構成、実装中に確認した細かな挙動を記録している。',
        ],
      },
      {
        heading: '位置づけ',
        paragraphs: [
          '現在のポートフォリオでは、HotDealppom、BikeNavi、グループ連絡先などの初期Androidプロジェクトと合わせて、モバイル開発の基礎経験を示す記録として扱う。',
        ],
      },
    ],
  },
  'browser-ui-validation-guardrails': {
    title: 'Portfolio modalとmobile readabilityをbrowser検証に変えた記録',
    description: 'Screenshot gallery、side-project modal、mobile readabilityの問題を、一回きりの修正ではなくPlaywrightベースのUI検証にした記録。',
    sections: [
      {
        heading: 'Trigger',
        paragraphs: [
          'Static link checkとcontent reachability checkは通っていたが、移行後のportfolioには実際の使いにくさが残っていた。Modal内のscreenshot galleryが詰まり、side-project detailが見つけにくく、mobile layoutの問題も自動では検出できていなかった。',
        ],
      },
      {
        heading: 'Fix',
        bullets: [
          'Built distをlocal serverで配信し、desktop/mobile viewportで開くPlaywright検証scriptを追加。',
          'Generated pagesのcontent length、heading structure、broken image、horizontal overflowを検査。',
          'Portfolio modal cardを実際にclickし、side projects、HotDealppom、BikeNaviのtext length、marker、image、iframe、mobile gallery widthを確認。',
          'Modal gallery CSSを調整し、screenshotが読みやすいspacingとmobile one-column layoutになるよう修正。',
        ],
      },
      {
        heading: 'Rule',
        paragraphs: [
          'UI migrationではcontentが存在するだけでは不十分。次のagentは、人がdesktop/mobile browserでclickし、読み、画像や動画を確認できることまで検証する。',
        ],
      },
    ],
  },
  'building-ai-native-cli-workflow': {
    title: 'AI-Native CLI Workflowを作る',
    description: 'Repeated approval、agent session recovery、terminal renderingを整え、AI-assisted developmentを実用的にするための記録。',
    sections: [
      {
        heading: 'Context',
        paragraphs: [
          'AI coding agentは、file edit、terminal command、verification、deploymentまで継続して動ける時に最も有効になる。しかしdefault CLI体験では、permission prompt、lost session context、terminal rendering issueが作業を止めることがある。',
        ],
      },
      {
        heading: 'Changes',
        bullets: [
          'Trusted local development environmentではrepeated permission interruptionを減らし、validationとCI guardrailで後段の安全性を補う。',
          'Claude CodeとCodexの過去作業をraw session IDではなくsummaryで探せるTUI session browserを作成。',
          'Windows terminalのencodingとfont behaviorを整え、日本語・韓国語・英語の出力を誤解なく確認できるようにした。',
        ],
      },
      {
        heading: 'Rule',
        paragraphs: [
          'AI-native developmentはprompt designだけではない。CLI ergonomics、session recovery、verification script、deployment guardrailが一緒に動くことで成立する。',
        ],
      },
    ],
  },
  'claude-resume-troubleshooting': {
    title: 'claude-resume TUI開発で起きた問題と修正',
    description: 'Claude Codeの過去セッションを探して再開するTUIを作り、文字化け、キー衝突、再帰呼び出し、スクリーンショット処理を直した記録。',
    sections: [
      {
        heading: '目的',
        paragraphs: [
          'Claude Codeの標準resume画面では、過去セッションの内容を素早く判別しづらかった。そこで、左にセッション一覧、右に会話内容を表示するTUIを作った。',
        ],
      },
      {
        heading: '主な問題',
        bullets: [
          'Windows CMD/PowerShellで日本語・韓国語の文字化けが発生した。',
          'TUIのキー操作とClaude resume操作が衝突した。',
          '過去セッションを要約する処理が自分自身の実行ログを拾う再帰問題があった。',
          'スクリーンショットや機密情報をそのまま扱わないためのマスキングが必要だった。',
        ],
      },
      {
        heading: '結果',
        paragraphs: [
          'UTF-8設定、セッションIDの受け渡し、自己呼び出しフィルタ、表示プレビューの改善を入れ、AIエージェント作業を再開しやすくした。',
        ],
      },
    ],
  },
  'codex-resume-tui-decision': {
    title: 'codex-resumeでTUI方式を選んだ理由',
    description: 'Codex CLIのローカルセッションログを検索し、Windows環境で安定して再開するためにTUI設計を選んだ判断メモ。',
    sections: [
      {
        heading: '背景',
        paragraphs: [
          'Codex CLIのセッションログはローカルJSONLとして残るが、目的のセッションを探すには一覧性とプレビューが足りなかった。',
        ],
      },
      {
        heading: '設計判断',
        bullets: [
          'Codex CLIのnative resume機能はそのまま利用し、探索性だけを補う薄いツールにした。',
          'ファイルmtimeではなくJSONL内部timestampを使い、並び順を安定させた。',
          'Node.js標準モジュール中心で実装し、Windows環境で余計な依存を増やさない方針にした。',
        ],
      },
      {
        heading: '結果',
        paragraphs: [
          'doctor、list、index、resumeコマンドを持つWindows向けセッション検索ツールとして整理した。',
        ],
      },
    ],
  },
  git: {
    title: '非公開リポジトリでforkせずにPRを作る方法',
    description: '会社の非公開Gitリポジトリで、個人forkを使えない場合にブランチを作成してPRを出す流れを確認したメモ。',
    sections: [
      {
        heading: '背景',
        paragraphs: [
          '会社の非公開リポジトリでは、ポリシー上個人アカウントへのforkが許可されないことがある。その場合でも、同じリポジトリ内のブランチを使えばPRを作成できる。',
        ],
      },
      {
        heading: '手順',
        bullets: [
          '対象リポジトリをローカルにcloneする。',
          '作業用ブランチを作成する。',
          'コードを修正してcommitする。',
          '作業ブランチをリモートへpushする。',
          'リポジトリのPR機能で元ブランチへのPull Requestを作成する。',
        ],
      },
      {
        heading: 'ポイント',
        paragraphs: [
          'forkが必須なのではなく、権限があるリポジトリ内でブランチを作れるかが重要になる。',
        ],
      },
    ],
  },
  jekyll: {
    title: 'Jekyllブログ運用メモ',
    description: '旧GitHub Pages/Jekyllブログを運用していた時期の設定、記事構造、静的サイト管理に関するメモ。',
    sections: [
      {
        heading: '概要',
        paragraphs: [
          'このサイトの前身はJekyllベースのGitHub Pagesブログだった。記事、タグ、静的アセット、依存関係をJekyllの仕組みに合わせて管理していた。',
        ],
      },
      {
        heading: '現在の扱い',
        paragraphs: [
          'Astro移行後も、過去記事としてJekyll時代の記録を残している。移行判断や依存関係整理の背景を追うための履歴として有用である。',
        ],
      },
    ],
  },
  'jekyll-dependabot-cleanup': {
    title: '古いJekyllブログのDependabot警告を整理した記録',
    description: 'Jekyll時代の依存関係警告を確認し、静的サイト移行とメンテナンス判断につなげた記録。',
    sections: [
      {
        heading: '背景',
        paragraphs: [
          '古いJekyllブログにはDependabotの脆弱性通知が複数残っていた。単純なgem更新で済むか、サイト構造ごと見直すべきかを確認した。',
        ],
      },
      {
        heading: '対応',
        bullets: [
          '依存関係の警告内容を確認した。',
          'Jekyll構成を維持する場合のコストと、Astroへ移行する場合の保守性を比較した。',
          '公開リポジトリに残してよい情報と残してはいけない情報の境界を再確認した。',
        ],
      },
      {
        heading: '結果',
        paragraphs: [
          '将来のUI改善、Cloudflare Pages Functions、AI Profile機能を考えると、Astro構成の方が保守しやすいと判断した。',
        ],
      },
    ],
  },
  'linkedin-api-permission-check': {
    title: 'LinkedIn API権限確認と投稿ワークフロー設計',
    description: 'LinkedIn APIで既存投稿を読んで文体を合わせようとしたが、権限制約により承認型投稿補助ワークフローへ切り替えた記録。',
    sections: [
      {
        heading: '目的',
        paragraphs: [
          'LinkedInに新しい投稿を出す前に、過去投稿をAPIで読み取り、文体やトーンを合わせたいと考えた。',
        ],
      },
      {
        heading: '確認したこと',
        bullets: [
          'OIDCログインとトークン発行は可能だった。',
          '既存投稿の読み取りには制限された権限が必要だった。',
          '個人開発者アプリからすぐに過去投稿を読む前提は現実的ではなかった。',
        ],
      },
      {
        heading: '結論',
        paragraphs: [
          '自動スクレイピングや非公式APIではなく、ユーザー承認型の投稿下書き・チェックリスト生成ワークフローに寄せる方針にした。',
        ],
      },
    ],
  },
  mysql: {
    title: 'MySQLで文字列の一部を検索するLIKEの使い方',
    description: '電話番号の一部など、文字列の前方・後方・部分一致をMySQLで検索するためのLIKE句メモ。',
    sections: [
      {
        heading: '背景',
        paragraphs: [
          '電話番号の末尾など、文字列の一部でユーザーを検索する必要があった。',
        ],
      },
      {
        heading: '使い方',
        bullets: [
          '`mobile like \"4558%\"` は4558で始まる値を探す。',
          '`mobile like \"%4558\"` は4558で終わる値を探す。',
          '`mobile like \"%4558%\"` は4558を含む値を探す。',
        ],
      },
    ],
  },
  'windows-terminal-crash-fix': {
    title: 'Windows Terminalが起動直後に終了する問題の復旧',
    description: 'Windows Terminalが開かずDCOM 10010が出た問題を、設定値と再インストールの観点から切り分けた記録。',
    sections: [
      {
        heading: '症状',
        bullets: [
          'PowerShellやWindows Terminalを開いても一瞬で終了する。',
          'イベントビューアにDCOM 10010が記録される。',
          'Terminalの設定ファイルに無効なgraphicsAPI値が入っていた。',
        ],
      },
      {
        heading: '対応',
        paragraphs: [
          '設定の修正だけでは復旧しなかったため、Windows Terminalを削除して再登録した。必要に応じて一時的に既定ターミナルをWindows Console Hostへ戻す手順も確認した。',
        ],
      },
      {
        heading: '教訓',
        paragraphs: [
          'Windows Terminalの設定値は無効な値でも静かに失敗する場合がある。起動直後に落ちる場合は設定ファイルとアプリ登録状態の両方を見る必要がある。',
        ],
      },
    ],
  },
  'content-reachability-validation': {
    title: '見落としたポートフォリオ詳細をContent Reachability検証へ変えた記録',
    description: 'AIが提案した狭いheuristicを、公開contentが到達可能な経路を持つか確認するdeploy-time validationへ置き換えた記録。',
    sections: [
      {
        heading: 'きっかけ',
        paragraphs: [
          'Astro移行後のportfolio cardは見た目上は動いていたが、HotDealppomのcardは詳細ではなく一行summaryを開いていた。video、screenshots、technical recordは残っていたが、ユーザーがそこへ到達できなかった。',
        ],
      },
      {
        heading: 'ユーザーからの修正',
        paragraphs: [
          '最初のAI修正はmodal targetがlist itemかどうかを見るものだった。しかし本質はDOM shapeではなく、意図的に隠したcontentでない限り公開到達経路があるかどうかだった。',
        ],
      },
      {
        heading: '対応',
        bullets: [
          'Portfolio専用heuristicを`validate:content`へ置き換えた。',
          'post route、index/tag listing、localized portfolio detail reachabilityを検証した。',
          '意図的に隠すrecordは明示的なリストで管理した。',
          'AI協業のquality gate事例としてportfolioにも反映した。',
        ],
      },
    ],
  },
};
