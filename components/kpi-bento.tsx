import { num, pct } from "@/lib/format";
import type { KpiSet } from "@/lib/types";

export function KpiBento({ kpis }: { kpis: KpiSet; accent?: string }) {
  const cells = [
    { label: "Cohort students", value: num(kpis.active), sub: "active" },
    { label: "Total quests", value: num(kpis.totalQuests), sub: "shipped" },
    { label: "Global submissions", value: num(kpis.submissions), sub: "lifetime" },
    { label: "Cohort sub rate", value: pct(kpis.subRate, 1), sub: "avg across quests" },
    { label: "On time", value: num(kpis.onTime), sub: "before deadline" },
    { label: "Late", value: num(kpis.late), sub: "past deadline" },
    { label: "Reviews pending", value: num(kpis.reviewsPending), sub: "queue for graders" },
    { label: "Reviews done", value: num(kpis.reviewsDone), sub: "graded" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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
