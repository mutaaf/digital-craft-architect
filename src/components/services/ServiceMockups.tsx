import React from 'react';

const MockFrame: React.FC<{
  children: React.ReactNode;
  theme?: 'dark' | 'light';
  title?: string;
  accent?: string;
}> = ({ children, theme = 'dark', title, accent = '#22d3ee' }) => {
  const isDark = theme === 'dark';
  return (
    <div
      className={`relative flex h-full w-full flex-col overflow-hidden ${
        isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}
    >
      <div
        className={`flex items-center gap-1.5 border-b px-3 py-1.5 ${
          isDark
            ? 'border-white/5 bg-slate-900/70'
            : 'border-slate-200 bg-white'
        }`}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-rose-400/80" />
        <span className="h-1.5 w-1.5 rounded-full bg-amber-400/80" />
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400/80" />
        {title && (
          <span
            className={`ml-2 font-mono text-[8px] uppercase tracking-[0.14em] ${
              isDark ? 'text-slate-500' : 'text-slate-500'
            }`}
          >
            {title}
          </span>
        )}
        <span
          className="ml-auto h-1 w-1 rounded-full"
          style={{
            background: accent,
            boxShadow: `0 0 6px ${accent}`,
          }}
        />
      </div>
      <div className="flex-1 overflow-hidden p-2.5">{children}</div>
    </div>
  );
};

/* 1. Intelligent Process Automation — workflow nodes */
const AutomationMock: React.FC = () => (
  <MockFrame title="flows · workflow builder" theme="dark" accent="#22d3ee">
    <div className="flex h-full items-center gap-1.5">
      {[
        { label: 'Intake', sub: 'SMS · Call · Form', tone: '#22d3ee' },
        { label: 'Classify', sub: 'GPT-4o agent', tone: '#a78bfa' },
        { label: 'Route', sub: 'CRM · Slack · Email', tone: '#34d399' },
      ].map((n, i) => (
        <React.Fragment key={n.label}>
          <div className="flex min-w-0 flex-1 flex-col justify-center rounded-md border border-slate-800 bg-slate-900/80 px-2 py-2">
            <div className="mb-1 h-[3px] w-5 rounded" style={{ background: n.tone }} />
            <div className="truncate text-[10px] font-semibold text-slate-100">
              {n.label}
            </div>
            <div className="mt-0.5 truncate font-mono text-[8px] text-slate-500">
              {n.sub}
            </div>
          </div>
          {i < 2 && (
            <svg width="10" height="12" viewBox="0 0 10 12" className="shrink-0">
              <path
                d="M1 6h8M6 2l4 4-4 4"
                stroke="#475569"
                strokeWidth="1"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </React.Fragment>
      ))}
    </div>
  </MockFrame>
);

/* 2. AI-Powered Dashboards — KPIs + sparkline */
const DashboardMock: React.FC = () => (
  <MockFrame title="ops · live dashboard" theme="dark" accent="#34d399">
    <div className="grid h-full grid-rows-[auto_1fr] gap-2">
      <div className="grid grid-cols-3 gap-1.5">
        {[
          { k: '$42.8K', v: 'MRR', w: '72%' },
          { k: '1,247', v: 'Leads', w: '58%' },
          { k: '97%', v: 'Uptime', w: '96%' },
        ].map((kpi) => (
          <div
            key={kpi.v}
            className="rounded border border-slate-800/70 bg-slate-900/60 p-1.5"
          >
            <div className="font-mono text-[7px] uppercase tracking-wider text-slate-500">
              {kpi.v}
            </div>
            <div className="text-[11px] font-bold text-emerald-300">
              {kpi.k}
            </div>
            <div className="mt-1 h-[2px] w-full rounded-full bg-slate-800">
              <div
                className="h-[2px] rounded-full bg-emerald-400/80"
                style={{ width: kpi.w }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="relative rounded border border-slate-800/70 bg-slate-900/40 p-1.5">
        <div className="mb-1 flex items-center justify-between">
          <span className="font-mono text-[7px] uppercase tracking-wider text-slate-500">
            30d
          </span>
          <span className="font-mono text-[7px] text-emerald-400">
            ▲ +18.4%
          </span>
        </div>
        <div className="flex h-[28px] items-end gap-[2px]">
          {[22, 35, 28, 42, 34, 48, 40, 55, 50, 62, 58, 70, 66, 78, 82].map(
            (h, i) => (
              <div
                key={i}
                className="flex-1 rounded-t bg-gradient-to-t from-emerald-600/70 to-emerald-300/90"
                style={{ height: `${h}%` }}
              />
            )
          )}
        </div>
      </div>
    </div>
  </MockFrame>
);

/* 3. LLM-Enhanced Solutions — chat UI */
const LLMMock: React.FC = () => (
  <MockFrame title="concierge · ai assistant" theme="light" accent="#8b5cf6">
    <div className="flex h-full flex-col gap-1">
      <div className="max-w-[80%] rounded-lg rounded-bl-sm bg-slate-100 px-2 py-1 text-[9px] leading-snug text-slate-800">
        Looking for a fence quote — half acre, cedar.
      </div>
      <div className="ml-auto max-w-[82%] rounded-lg rounded-br-sm bg-indigo-600 px-2 py-1 text-[9px] leading-snug text-white">
        Got it — residential cedar, 0.5 ac, 6ft. Drafting your estimate now.
      </div>
      <div className="max-w-[70%] rounded-lg rounded-bl-sm bg-slate-100 px-2 py-1 text-[9px] leading-snug text-slate-800">
        Thank you!
      </div>
      <div className="mt-auto flex items-center gap-1 pt-1">
        <span className="inline-flex h-1.5 w-1.5 animate-pulse rounded-full bg-indigo-500" />
        <span className="font-mono text-[8px] italic text-slate-500">
          Agent composing estimate…
        </span>
      </div>
    </div>
  </MockFrame>
);

/* 4. Event Planning AI — booking calendar */
const EventMock: React.FC = () => {
  const booked: Array<[number, number]> = [
    [0, 1], [1, 0], [1, 2], [2, 1], [3, 0], [3, 2], [4, 1], [4, 2], [5, 0], [5, 1], [5, 2], [6, 2],
  ];
  return (
    <MockFrame title="bookings · week view" theme="dark" accent="#f472b6">
      <div className="grid h-full grid-cols-7 gap-[3px]">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, col) => (
          <div key={col} className="flex flex-col gap-[3px]">
            <div className="text-center font-mono text-[7px] uppercase tracking-wider text-slate-500">
              {d}
            </div>
            {[0, 1, 2].map((row) => {
              const isFilled = booked.some(
                ([c, r]) => c === col && r === row
              );
              return (
                <div
                  key={row}
                  className={`flex-1 rounded-[2px] ${
                    isFilled
                      ? 'bg-gradient-to-br from-fuchsia-500/90 to-pink-500/90'
                      : 'border border-slate-800 bg-slate-900/50'
                  }`}
                />
              );
            })}
          </div>
        ))}
      </div>
    </MockFrame>
  );
};

/* 5. Real Estate Investment Intelligence — deal card */
const RealEstateMock: React.FC = () => (
  <MockFrame title="deal analyzer · 412 maple dr" theme="light" accent="#f59e0b">
    <div className="grid h-full grid-cols-[1fr_auto] gap-2">
      <div className="flex flex-col justify-between">
        <div>
          <div className="font-mono text-[7px] uppercase tracking-wider text-slate-500">
            Residential · SFR
          </div>
          <div className="text-[11px] font-semibold text-slate-800">
            412 Maple Dr
          </div>
          <div className="mt-0.5 font-mono text-[8px] text-slate-500">
            3 bd / 2 ba · 1,640 sqft
          </div>
        </div>
        <div className="grid grid-cols-3 gap-1">
          {[
            { k: 'Cap', v: '6.1%' },
            { k: 'CoC', v: '9.3%' },
            { k: 'IRR', v: '18.2%' },
          ].map((m) => (
            <div
              key={m.k}
              className="rounded border border-slate-200 bg-white px-1 py-1"
            >
              <div className="font-mono text-[7px] uppercase tracking-wider text-slate-400">
                {m.k}
              </div>
              <div className="text-[10px] font-bold text-amber-600">{m.v}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex w-[70px] flex-col items-end justify-between">
        <div className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-1.5 py-0.5 font-mono text-[8px] font-semibold text-emerald-700">
          <span className="h-1 w-1 rounded-full bg-emerald-500" />
          GO
        </div>
        <div className="w-full text-right">
          <div className="font-mono text-[7px] uppercase tracking-wider text-slate-400">
            Offer
          </div>
          <div className="text-[10px] font-bold text-slate-800">$428K</div>
        </div>
      </div>
    </div>
  </MockFrame>
);

/* 6. Nonprofit Resource Optimization — allocation */
const NonprofitMock: React.FC = () => (
  <MockFrame title="allocation · q2" theme="light" accent="#f43f5e">
    <div className="grid h-full grid-cols-[auto_1fr] items-center gap-3">
      <svg width="64" height="64" viewBox="0 0 36 36" className="shrink-0">
        <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f1f5f9" strokeWidth="3.6" />
        <circle
          cx="18"
          cy="18"
          r="15.9"
          fill="none"
          stroke="#f43f5e"
          strokeWidth="3.6"
          strokeDasharray="68 100"
          transform="rotate(-90 18 18)"
          strokeLinecap="butt"
        />
        <circle
          cx="18"
          cy="18"
          r="15.9"
          fill="none"
          stroke="#fb7185"
          strokeWidth="3.6"
          strokeDasharray="22 100"
          strokeDashoffset="-68"
          transform="rotate(-90 18 18)"
        />
        <circle
          cx="18"
          cy="18"
          r="15.9"
          fill="none"
          stroke="#fda4af"
          strokeWidth="3.6"
          strokeDasharray="10 100"
          strokeDashoffset="-90"
          transform="rotate(-90 18 18)"
        />
        <text x="18" y="20" textAnchor="middle" fontSize="6" fontWeight="700" fill="#0f172a">
          $248K
        </text>
      </svg>
      <div className="flex flex-col gap-1">
        {[
          { label: 'Programs', pct: 68, c: '#f43f5e' },
          { label: 'Operations', pct: 22, c: '#fb7185' },
          { label: 'Admin', pct: 10, c: '#fda4af' },
        ].map((r) => (
          <div key={r.label} className="flex items-center gap-1.5">
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: r.c }}
            />
            <span className="flex-1 text-[9px] text-slate-700">{r.label}</span>
            <span className="font-mono text-[9px] font-semibold text-slate-900">
              {r.pct}%
            </span>
          </div>
        ))}
      </div>
    </div>
  </MockFrame>
);

/* 7. Youth Sports Management — roster/schedule */
const SportsMock: React.FC = () => (
  <MockFrame title="u12 tigers · roster" theme="dark" accent="#84cc16">
    <div className="grid h-full grid-rows-[auto_1fr] gap-1.5">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[8px] uppercase tracking-wider text-slate-400">
          Sat · 10:00a · Field 3
        </span>
        <span className="rounded-full bg-lime-500/20 px-1.5 py-0.5 font-mono text-[7px] font-semibold text-lime-300">
          14 / 15
        </span>
      </div>
      <div className="grid grid-cols-3 gap-1">
        {[
          { n: '#10', p: 'FWD', t: 'Marcus' },
          { n: '#07', p: 'MID', t: 'Javi' },
          { n: '#22', p: 'DEF', t: 'Kian' },
          { n: '#03', p: 'DEF', t: 'Luca' },
          { n: '#11', p: 'FWD', t: 'Tariq' },
          { n: '#01', p: 'GK',  t: 'Sam' },
        ].map((p) => (
          <div
            key={p.n}
            className="flex flex-col rounded border border-slate-800/60 bg-slate-900/60 px-1.5 py-1"
          >
            <div className="flex items-baseline justify-between">
              <span className="font-mono text-[8px] text-lime-400">{p.n}</span>
              <span className="font-mono text-[6px] text-slate-500">{p.p}</span>
            </div>
            <span className="mt-0.5 truncate text-[8px] text-slate-200">
              {p.t}
            </span>
          </div>
        ))}
      </div>
    </div>
  </MockFrame>
);

/* 8. Religious Institution Management — community dashboard */
const FaithMock: React.FC = () => (
  <MockFrame title="community · this week" theme="light" accent="#d4a017">
    <div className="grid h-full grid-rows-[auto_1fr] gap-1.5">
      <div className="grid grid-cols-3 gap-1">
        {[
          { k: '482', v: 'Attendance' },
          { k: '$12.4K', v: 'Giving' },
          { k: '36', v: 'Volunteers' },
        ].map((s) => (
          <div
            key={s.v}
            className="rounded border border-slate-200 bg-white px-1.5 py-1"
          >
            <div className="font-mono text-[7px] uppercase tracking-wider text-slate-500">
              {s.v}
            </div>
            <div className="text-[10px] font-bold text-amber-700">{s.k}</div>
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-0.5 overflow-hidden rounded border border-slate-200 bg-white">
        {[
          { t: 'Sun · 09:00', l: 'Morning Service', c: '#d4a017' },
          { t: 'Wed · 19:00', l: 'Mid-Week Study', c: '#a16207' },
          { t: 'Fri · 18:30', l: 'Youth Gathering', c: '#f59e0b' },
        ].map((e) => (
          <div
            key={e.l}
            className="flex items-center gap-1.5 border-b border-slate-100 px-1.5 py-0.5 last:border-b-0"
          >
            <span
              className="h-3 w-0.5 rounded"
              style={{ background: e.c }}
            />
            <span className="font-mono text-[7px] uppercase tracking-wider text-slate-500">
              {e.t}
            </span>
            <span className="flex-1 truncate text-[8px] text-slate-700">
              {e.l}
            </span>
          </div>
        ))}
      </div>
    </div>
  </MockFrame>
);

const MOCKUP_MAP: Record<string, React.FC> = {
  'intelligent process automation': AutomationMock,
  'ai-powered dashboards': DashboardMock,
  'llm-enhanced solutions': LLMMock,
  'event planning ai': EventMock,
  'real estate investment intelligence': RealEstateMock,
  'nonprofit resource optimization': NonprofitMock,
  'youth sports management': SportsMock,
  'religious institution management': FaithMock,
};

export const mockupFor = (title: string): React.FC | null => {
  const key = title.trim().toLowerCase();
  return MOCKUP_MAP[key] || null;
};
