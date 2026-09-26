import Link from "next/link";
import { notFound } from "next/navigation";
import { getBatch } from "@/lib/fixtures";
import { fetchLiveBatch } from "@/lib/batch-data";
import { num, pct } from "@/lib/format";
import type { BatchId } from "@/lib/types";
import type {
  LiveBatchData,
  LiveKpis,
  LiveMatrixRow,
  LiveQuest,
  LiveStudent,
  LiveStudentAlert,
  LiveSubmission,
  LiveWeekly,
} from "@/lib/batch-data";

export const revalidate = 60;
export const dynamic = "force-dynamic";

export default async function BatchPage(props: PageProps<"/cohort/[id]/batch/[batchId]">) {
  const { id, batchId } = await props.params;
  const found = getBatch(id, batchId);
  if (!found) return notFound();
  const { batch, cohort } = found;

  let live: LiveBatchData | null = null;
  let liveError: string | null = null;
  try {
    live = await fetchLiveBatch(id, batchId as BatchId);
  } catch (err) {
    liveError = err instanceof Error ? err.message : String(err);
  }

  return (
    <div>
      <BatchHero cohort={cohort} batch={batch} live={live} />

      <div className="mx-auto max-w-[1400px] px-6">
        {liveError && (
          <div className="mt-8 hud-panel p-4 text-sm" style={{ color: "#f87171" }}>
            Live sheet fetch failed: {liveError}
          </div>
        )}

        {live && (
          <>
            <KpiBentoLive kpis={live.kpis} />

            <SectionNav
              items={[
                { href: "#quests", label: "Quests" },
                { href: "#alerts", label: `At risk (${live.alerts.length})` },
                { href: "#roster", label: `Roster (${live.students.length})` },
                { href: "#matrix", label: "Matrix" },
                { href: "#log", label: `Log (${live.submissions.length})` },
                { href: "#weekly", label: "Weekly" },
              ]}
            />

            <section id="quests" className="mt-14 scroll-mt-32">
              <QuestsPanel quests={live.quests} />
            </section>

            <section id="alerts" className="mt-16 scroll-mt-32">
              <AlertsPanel alerts={live.alerts} />
            </section>

            <section id="roster" className="mt-16 scroll-mt-32">
              <RosterPanel students={live.students} />
            </section>

            <section id="matrix" className="mt-16 scroll-mt-32">
              <MatrixPanel matrix={live.matrix} />
            </section>

            <section id="log" className="mt-16 scroll-mt-32">
              <LogPanel submissions={live.submissions} />
            </section>

            <section id="weekly" className="mt-16 mb-16 scroll-mt-32">
              <WeeklyPanel weekly={live.weekly} />
            </section>
          </>
        )}
      </div>
    </div>
  );
}

/* --------------------------------- HERO --------------------------------- */

function BatchHero({
  cohort,
  batch,
  live,
}: {
  cohort: { meta: { id: string; number: number } };
  batch: { meta: { id: string; name: string; image: string; protocol: string; cycle: string; state: string; motto: string } };
  live: LiveBatchData | null;
}) {
  const b = batch.meta;
  return (
    <div className="relative border-b hairline">
      <div className="relative mx-auto max-w-[1400px] px-6 pt-8 pb-12">
        <div className="flex items-center gap-3 mb-8 flex-wrap">
          <Link
            href={`/cohort/${cohort.meta.id}`}
            className="text-sm text-[color:var(--muted)] hover:text-white transition"
          >
            ← Cohort {cohort.meta.number}
          </Link>
          <span className="chip">{b.protocol}</span>
          <span className="chip">CYCLE · {b.cycle}</span>
          <span className="chip">STATE · {b.state}</span>
          {live && (
            <span className="chip ml-auto">
              LAST UPDATED · {live.kpis.lastUpdated}
            </span>
          )}
        </div>

        <div className="grid grid-cols-12 gap-8 items-center">
          <div className="col-span-12 lg:col-span-6">
            <div className="eyebrow mb-3">Batch</div>
            <h1 className="display text-[120px] md:text-[180px] leading-[0.82] tracking-tighter text-white">
              {b.name.toUpperCase()}
            </h1>
            <p className="mt-4 text-lg text-[color:var(--text-dim)] italic">"{b.motto}"</p>

            {live && (
              <div className="mt-8 grid grid-cols-3 gap-4 max-w-md">
                <HeroStat label="Active" value={num(live.kpis.active)} />
                <HeroStat label="Sub rate" value={pct(live.kpis.submissionRate, 0)} />
                <HeroStat label="Avg delay" value={`${live.kpis.avgDelayHrs.toFixed(0)}h`} />
              </div>
            )}
          </div>

          <div className="col-span-12 lg:col-span-6">
            <div className="relative rounded-xl overflow-hidden border border-white/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={b.image} alt={b.name} className="w-full h-auto block object-cover" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function HeroStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="eyebrow mb-1">{label}</div>
      <div className="mono text-2xl font-semibold">{value}</div>
    </div>
  );
}

/* --------------------------------- KPI --------------------------------- */

function KpiBentoLive({ kpis }: { kpis: LiveKpis }) {
  const cells = [
    { label: "Active students", value: num(kpis.active), sub: "in the batch" },
    { label: "Quests shipped", value: num(kpis.totalQuests), sub: "across the run" },
    { label: "Total submissions", value: num(kpis.submissions), sub: "lifetime" },
    { label: "Overall rate", value: pct(kpis.submissionRate, 1), sub: "avg across quests" },
    { label: "On time", value: num(kpis.onTime), sub: "before deadline" },
    { label: "Late", value: num(kpis.late), sub: "past deadline" },
    { label: "Avg delay", value: `${kpis.avgDelayHrs.toFixed(1)}h`, sub: "on late subs" },
    { label: "Avg difficulty", value: `${kpis.avgDifficulty.toFixed(1)}/5`, sub: "self-rated" },
  ];
  return (
    <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3">
      {cells.map((c) => (
        <div key={c.label} className="hud-panel p-5">
          <div className="eyebrow mb-3">{c.label}</div>
          <div className="mono text-4xl font-semibold tracking-tight">{c.value}</div>
          <div className="mt-2 text-xs text-[color:var(--muted)]">{c.sub}</div>
        </div>
      ))}
    </div>
  );
}

function SectionNav({ items }: { items: { href: string; label: string }[] }) {
  return (
    <div className="mt-10 sticky top-0 z-30 -mx-6 px-6 py-3 backdrop-blur-xl bg-[rgba(0,0,0,0.7)] border-b hairline">
      <nav className="flex items-center gap-1 text-sm overflow-x-auto scrollbar-thin">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="px-3 py-1.5 rounded-md text-[color:var(--text-dim)] hover:text-white hover:bg-white/5 transition whitespace-nowrap"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}

function SectionHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="flex items-end justify-between mb-6">
      <div>
        <div className="eyebrow mb-2">{eyebrow}</div>
        <h2 className="display text-3xl md:text-4xl">{title}</h2>
      </div>
      {subtitle && <p className="text-sm text-[color:var(--text-dim)] max-w-sm">{subtitle}</p>}
    </div>
  );
}

/* --------------------------------- QUESTS --------------------------------- */

function QuestsPanel({ quests }: { quests: LiveQuest[] }) {
  const perfColor: Record<string, string> = {
    Good: "#22c55e",
    Average: "#eab308",
    Poor: "#ef4444",
  };
  return (
    <>
      <SectionHeader eyebrow="QUEST OVERVIEW" title="Quests in flight." />
      <div className="grid grid-cols-12 gap-4">
        {quests.map((q) => (
          <div key={q.sno} className="col-span-12 md:col-span-6 hud-panel p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="eyebrow mb-1">
                  {q.status.toUpperCase()} · {q.performance}
                </div>
                <div className="text-lg font-semibold">{q.name}</div>
              </div>
              <div className="text-right">
                <div className="text-xs mono text-[color:var(--muted)]">{q.deadline}</div>
                <div
                  className="mt-1 text-xs mono px-2 py-1 rounded inline-block"
                  style={{
                    background: `${perfColor[q.performance] ?? "#6b6b6b"}22`,
                    color: perfColor[q.performance] ?? "#a3a3a3",
                  }}
                >
                  {pct(q.subRate, 0)} rate
                </div>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-4 gap-3 text-center">
              <QuestStat label="Subs" value={`${q.totalSubs}/${q.totalActive}`} />
              <QuestStat label="On time" value={String(q.onTime)} color="#22c55e" />
              <QuestStat label="Late" value={String(q.late)} color="#ef4444" />
              <QuestStat label="Missed" value={String(q.pending)} color="#eab308" />
            </div>

            <div className="mt-4 flex items-center justify-between text-xs text-[color:var(--muted)]">
              <span className="mono">
                Avg delay {q.avgHoursLate.toFixed(1)}h · Difficulty {q.avgDifficulty.toFixed(1)}/5
              </span>
              <span className="mono">
                {q.resubmissions} resubs · {q.pendingReviews} reviews left
              </span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function QuestStat({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div>
      <div className="text-[10px] tracking-widest uppercase text-[color:var(--muted)]">{label}</div>
      <div className="mono text-lg font-semibold" style={{ color: color ?? "#fff" }}>
        {value}
      </div>
    </div>
  );
}

/* --------------------------------- ALERTS --------------------------------- */

function AlertsPanel({ alerts }: { alerts: LiveStudentAlert[] }) {
  const groups: Record<string, LiveStudentAlert[]> = { High: [], Medium: [], Low: [] };
  alerts.forEach((a) => {
    (groups[a.riskLevel] ??= []).push(a);
  });
  const order: (keyof typeof groups)[] = ["High", "Medium", "Low"];
  const riskColor: Record<string, string> = {
    High: "#ef4444",
    Medium: "#eab308",
    Low: "#a3a3a3",
  };
  return (
    <>
      <SectionHeader
        eyebrow="STUDENT ALERTS"
        title="Who needs Martin's touch."
        subtitle="Auto-generated from the sheet's alert engine."
      />
      <div className="grid grid-cols-12 gap-4">
        {order.map((risk) => (
          <div key={risk} className="col-span-12 md:col-span-4 hud-panel p-5">
            <div className="flex items-center justify-between mb-4">
              <span
                className="eyebrow"
                style={{ color: riskColor[risk] }}
              >
                {risk} risk
              </span>
              <span className="mono text-sm">{groups[risk]?.length ?? 0}</span>
            </div>
            <div className="space-y-3 max-h-[420px] overflow-y-auto scrollbar-thin pr-1">
              {(groups[risk] ?? []).map((a) => (
                <div key={`${a.studentId}-${a.alertType}`} className="border-t hairline pt-3 first:border-t-0 first:pt-0">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-medium truncate">{a.studentName}</span>
                    <span className="text-xs mono text-[color:var(--muted)]">{a.submissionRate}</span>
                  </div>
                  <div className="text-xs text-[color:var(--text-dim)] mt-1">{a.alertType}</div>
                  <div className="text-xs text-[color:var(--muted)] mt-1 italic">{a.action}</div>
                </div>
              ))}
              {!groups[risk]?.length && (
                <div className="text-sm text-[color:var(--muted)]">Nobody here.</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

/* --------------------------------- ROSTER --------------------------------- */

function RosterPanel({ students }: { students: LiveStudent[] }) {
  return (
    <>
      <SectionHeader
        eyebrow="STUDENTS DATA MASTER"
        title="Full roster."
        subtitle={`${students.length} students · sorted by submission rate.`}
      />
      <div className="hud-panel overflow-x-auto scrollbar-thin">
        <table className="w-full min-w-[900px]">
          <thead>
            <tr className="text-left text-xs text-[color:var(--muted)] uppercase tracking-widest border-b hairline">
              <th className="px-5 py-3">Student</th>
              <th className="px-4 py-3 text-right">Rate</th>
              <th className="px-4 py-3 text-right">Subs</th>
              <th className="px-4 py-3 text-right">On time</th>
              <th className="px-4 py-3 text-right">Late</th>
              <th className="px-4 py-3 text-right">Missed</th>
              <th className="px-4 py-3 text-right">Speed</th>
              <th className="px-4 py-3 text-right">Difficulty</th>
              <th className="px-4 py-3 text-right">Streak miss</th>
              <th className="px-4 py-3 text-right">Reviews queued</th>
            </tr>
          </thead>
          <tbody>
            {[...students]
              .sort((a, b) => parseFloat(b.submissionRate) - parseFloat(a.submissionRate))
              .map((s) => (
                <tr key={s.studentId} className="border-b hairline last:border-b-0 hover:bg-white/[0.02]">
                  <td className="px-5 py-3">
                    <div className="text-sm">{s.name}</div>
                    <div className="text-xs text-[color:var(--muted)]">{s.studentId}</div>
                  </td>
                  <td className="px-4 py-3 mono text-sm text-right">{s.submissionRate}</td>
                  <td className="px-4 py-3 mono text-sm text-right">
                    {s.submitted}/{s.totalQuests}
                  </td>
                  <td className="px-4 py-3 mono text-sm text-right" style={{ color: "#22c55e" }}>
                    {s.onTime}
                  </td>
                  <td className="px-4 py-3 mono text-sm text-right" style={{ color: "#ef4444" }}>
                    {s.late}
                  </td>
                  <td className="px-4 py-3 mono text-sm text-right" style={{ color: "#eab308" }}>
                    {s.notSubmitted}
                  </td>
                  <td className="px-4 py-3 mono text-sm text-right">{s.avgSpeedDays.toFixed(1)}d</td>
                  <td className="px-4 py-3 mono text-sm text-right">
                    {s.avgDifficulty.toFixed(1)}
                  </td>
                  <td
                    className="px-4 py-3 mono text-sm text-right"
                    style={{ color: s.consecutiveMissed >= 2 ? "#ef4444" : "#a3a3a3" }}
                  >
                    {s.consecutiveMissed}
                  </td>
                  <td className="px-4 py-3 mono text-sm text-right">{s.pendingReviews}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

/* --------------------------------- MATRIX --------------------------------- */

function MatrixPanel({ matrix }: { matrix: LiveMatrixRow[] }) {
  const quests = matrix[0]?.cells.map((c) => c.quest) ?? [];
  return (
    <>
      <SectionHeader
        eyebrow="SUBMISSION MATRIX"
        title="Student × quest."
        subtitle="Green = on time · Red = late · Empty = missed."
      />
      <div className="hud-panel overflow-x-auto scrollbar-thin">
        <table className="w-full min-w-[720px]">
          <thead>
            <tr className="text-left text-xs text-[color:var(--muted)] uppercase tracking-widest border-b hairline">
              <th className="px-5 py-3">Student</th>
              {quests.map((q) => (
                <th key={q} className="px-3 py-3 text-center whitespace-nowrap">
                  {q}
                </th>
              ))}
              <th className="px-5 py-3 text-right">Rate</th>
            </tr>
          </thead>
          <tbody>
            {matrix.map((row) => (
              <tr key={row.studentId} className="border-b hairline last:border-b-0 hover:bg-white/[0.02]">
                <td className="px-5 py-3 text-sm">{row.studentName}</td>
                {row.cells.map((c, i) => (
                  <td key={i} className="px-3 py-3 text-center">
                    <MatrixDot state={c.state} />
                  </td>
                ))}
                <td className="px-5 py-3 mono text-sm text-right">
                  {pct(row.submissionRate, 0)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function MatrixDot({ state }: { state: string }) {
  const map: Record<string, string> = {
    "On-Time": "#22c55e",
    Late: "#ef4444",
    "Not Submitted": "rgba(255,255,255,0.08)",
  };
  return (
    <span
      className="inline-block w-4 h-4 rounded"
      style={{ background: map[state] ?? "rgba(255,255,255,0.05)" }}
      title={state}
    />
  );
}

/* --------------------------------- LOG --------------------------------- */

function LogPanel({ submissions }: { submissions: LiveSubmission[] }) {
  const rows = submissions.slice(0, 30);
  return (
    <>
      <SectionHeader
        eyebrow="SUBMISSION LOG"
        title="Latest submissions."
        subtitle={`Showing 30 of ${submissions.length}. Newest first.`}
      />
      <div className="hud-panel overflow-x-auto scrollbar-thin">
        <table className="w-full min-w-[900px]">
          <thead>
            <tr className="text-left text-xs text-[color:var(--muted)] uppercase tracking-widest border-b hairline">
              <th className="px-5 py-3">Submitted</th>
              <th className="px-4 py-3">Student</th>
              <th className="px-4 py-3">Quest</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Diff</th>
              <th className="px-4 py-3">Review</th>
              <th className="px-4 py-3">Link</th>
            </tr>
          </thead>
          <tbody>
            {[...rows]
              .sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1))
              .map((s, i) => (
                <tr key={i} className="border-b hairline last:border-b-0 hover:bg-white/[0.02]">
                  <td className="px-5 py-3 text-xs mono text-[color:var(--text-dim)]">
                    {s.timestamp}
                  </td>
                  <td className="px-4 py-3 text-sm">{s.studentName}</td>
                  <td className="px-4 py-3 text-sm text-[color:var(--text-dim)]">{s.questName}</td>
                  <td className="px-4 py-3">
                    <StatusPill status={s.submissionStatus} />
                  </td>
                  <td className="px-4 py-3 mono text-sm text-right">{s.difficulty}</td>
                  <td className="px-4 py-3 text-xs text-[color:var(--text-dim)]">
                    {s.reviewStatus || "—"}
                  </td>
                  <td className="px-4 py-3">
                    {s.link ? (
                      <a
                        href={s.link}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs mono text-[color:var(--text-dim)] hover:text-white transition"
                      >
                        open ↗
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, { bg: string; fg: string }> = {
    "On-Time": { bg: "rgba(34,197,94,0.15)", fg: "#4ade80" },
    Late: { bg: "rgba(239,68,68,0.15)", fg: "#f87171" },
    "Not Submitted": { bg: "rgba(234,179,8,0.15)", fg: "#facc15" },
  };
  const m = map[status] ?? { bg: "rgba(255,255,255,0.06)", fg: "#a3a3a3" };
  return (
    <span
      className="text-xs mono px-2 py-1 rounded"
      style={{ background: m.bg, color: m.fg }}
    >
      {status || "—"}
    </span>
  );
}

/* --------------------------------- WEEKLY --------------------------------- */

function WeeklyPanel({ weekly }: { weekly: LiveWeekly[] }) {
  return (
    <>
      <SectionHeader
        eyebrow="WEEKLY REPORT"
        title="Week-over-week."
        subtitle="Straight from the weekly rollup tab."
      />
      <div className="hud-panel overflow-x-auto scrollbar-thin">
        <table className="w-full min-w-[720px]">
          <thead>
            <tr className="text-left text-xs text-[color:var(--muted)] uppercase tracking-widest border-b hairline">
              <th className="px-5 py-3">Week</th>
              <th className="px-4 py-3">Range</th>
              <th className="px-4 py-3 text-right">Active</th>
              <th className="px-4 py-3 text-right">Subs</th>
              <th className="px-4 py-3 text-right">On time</th>
              <th className="px-4 py-3 text-right">Late</th>
              <th className="px-4 py-3 text-right">Missed</th>
              <th className="px-4 py-3 text-right">Rate</th>
            </tr>
          </thead>
          <tbody>
            {weekly.map((w) => (
              <tr key={w.week} className="border-b hairline last:border-b-0 hover:bg-white/[0.02]">
                <td className="px-5 py-3 mono text-sm">W{w.week}</td>
                <td className="px-4 py-3 text-xs text-[color:var(--text-dim)]">
                  {w.weekStart} → {w.weekEnd}
                </td>
                <td className="px-4 py-3 mono text-sm text-right">{w.activeStudents}</td>
                <td className="px-4 py-3 mono text-sm text-right">{w.totalSubs}</td>
                <td className="px-4 py-3 mono text-sm text-right" style={{ color: "#22c55e" }}>
                  {w.onTime}
                </td>
                <td className="px-4 py-3 mono text-sm text-right" style={{ color: "#ef4444" }}>
                  {w.late}
                </td>
                <td className="px-4 py-3 mono text-sm text-right" style={{ color: "#eab308" }}>
                  {w.missed}
                </td>
                <td className="px-4 py-3 mono text-sm text-right">{pct(w.rate, 1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
