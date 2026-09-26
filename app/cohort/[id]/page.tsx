import Link from "next/link";
import { notFound } from "next/navigation";
import { getCohort } from "@/lib/fixtures";
import { num, pct } from "@/lib/format";
import type { Batch, Cohort } from "@/lib/types";
import { KpiBento } from "@/components/kpi-bento";

export default async function CohortPage(props: PageProps<"/cohort/[id]">) {
  const { id } = await props.params;
  const cohort = getCohort(id);
  if (!cohort) return notFound();

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-10">
      <CohortHeader cohort={cohort} />
      <BatchStrip cohort={cohort} />

      <div className="mt-14">
        <div className="eyebrow mb-4">Cohort KPIs</div>
        <KpiBento kpis={cohort.kpis} accent={cohort.meta.accent} />
      </div>

      <section id="placements" className="mt-16 scroll-mt-24">
        <PlacementsSection cohort={cohort} />
      </section>

      <section id="retention" className="mt-16 scroll-mt-24">
        <RetentionSection cohort={cohort} />
      </section>
    </div>
  );
}

function CohortHeader({ cohort }: { cohort: Cohort }) {
  const c = cohort.meta;
  return (
    <div className="grid grid-cols-12 gap-4">
      <Link
        href="/"
        className="col-span-12 mb-2 text-sm text-[color:var(--muted)] hover:text-white transition"
      >
        ← All cohorts
      </Link>

      {/* Symbol */}
      <div className="col-span-3 md:col-span-2 aspect-square rounded-2xl overflow-hidden ring-1 ring-white/10 relative bg-[color:var(--surface-2)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={c.hero} alt={c.codename} className="w-full h-full object-cover" />
      </div>

      {/* Name */}
      <div className="col-span-9 md:col-span-7 rounded-2xl surface-elev p-6 flex flex-col justify-center">
        <div className="flex items-center gap-2">
          <span className="eyebrow">Cohort {String(c.number).padStart(2, "0")}</span>
          <span className="chip">{c.status}</span>
        </div>
        <h1 className="display text-5xl md:text-6xl mt-2">{c.codename}</h1>
        <div className="mt-2 text-sm text-[color:var(--muted)]">
          {c.window} · Synced {cohort.lastSynced}
        </div>
      </div>

      {/* Two overview shortcuts */}
      <div className="col-span-12 md:col-span-3 flex flex-col gap-4">
        <OverviewCard
          href="#placements"
          label="Placements"
          headline={`${cohort.placements.offers} offers`}
          sub={`${pct(cohort.placements.offersRate, 0)} of graduates`}
        />
        <OverviewCard
          href="#retention"
          label="Retention"
          headline={pct(cohort.retention.active / cohort.retention.starting, 0)}
          sub={`${cohort.retention.active} of ${cohort.retention.starting} active`}
        />
      </div>
    </div>
  );
}

function OverviewCard({
  href,
  label,
  headline,
  sub,
}: {
  href: string;
  label: string;
  headline: string;
  sub: string;
}) {
  return (
    <Link
      href={href}
      className="surface-elev rounded-xl p-4 flex-1 hover:border-white/25 transition flex flex-col justify-between"
    >
      <div className="eyebrow">{label}</div>
      <div>
        <div className="mono text-2xl font-semibold">{headline}</div>
        <div className="text-xs text-[color:var(--muted)] mt-0.5">{sub}</div>
      </div>
    </Link>
  );
}

function BatchStrip({ cohort }: { cohort: Cohort }) {
  return (
    <div className="mt-6">
      <div className="eyebrow mb-3">Batches</div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {cohort.batches.map((b) => (
          <BatchCard key={b.meta.id} cohort={cohort} batch={b} />
        ))}
      </div>
    </div>
  );
}

function BatchCard({ cohort, batch }: { cohort: Cohort; batch: Batch }) {
  const b = batch.meta;
  return (
    <Link
      href={`/cohort/${cohort.meta.id}/batch/${b.id}`}
      className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-white/10 card-hover group"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={b.portrait}
        alt={b.name}
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(5,6,10,0.05) 0%, rgba(5,6,10,0.65) 60%, rgba(5,6,10,0.98) 100%)",
        }}
      />
      <div className="absolute inset-0 flex flex-col justify-end p-4">
        <div className="display text-3xl md:text-4xl leading-none text-white">
          {b.name.toUpperCase()}
        </div>
        <div className="mt-2 flex items-center justify-between text-xs text-white/70">
          <span className="mono">{num(batch.kpis.active)} active</span>
          <span className="mono">{pct(batch.kpis.subRate, 0)}</span>
        </div>
      </div>
    </Link>
  );
}

function PlacementsSection({ cohort }: { cohort: Cohort }) {
  const p = cohort.placements;
  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div className="eyebrow">Placements</div>
        <span className="mono text-xs text-[color:var(--muted)]">
          Snapshot from placements sheet
        </span>
      </div>
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 md:col-span-6 surface-elev rounded-2xl p-5">
          <div className="eyebrow mb-2">Offers so far</div>
          <div className="display text-6xl">{p.offers}</div>
          <div className="mt-2 text-sm text-[color:var(--text-dim)]">
            <span className="text-white">{pct(p.offersRate, 0)}</span> of graduates ·{" "}
            <span className="text-white">₹{p.avgOffer.toFixed(1)} LPA</span> avg
          </div>
          <div className="mt-5">
            <div className="eyebrow mb-2">Monthly</div>
            <MiniBars data={p.monthly.map((m) => ({ label: m.month, value: m.offers }))} accent="#ffffff" />
          </div>
        </div>

        <div className="col-span-12 md:col-span-3 surface-elev rounded-2xl p-5">
          <div className="eyebrow mb-4">Top roles</div>
          <div className="space-y-3">
            {p.topRoles.map((r) => (
              <RankedRow key={r.role} label={r.role} value={r.count} max={p.topRoles[0].count} accent="rgba(255,255,255,0.75)" />
            ))}
          </div>
        </div>

        <div className="col-span-12 md:col-span-3 surface-elev rounded-2xl p-5">
          <div className="eyebrow mb-4">Companies</div>
          <div className="space-y-3">
            {p.companies.map((r) => (
              <RankedRow key={r.name} label={r.name} value={r.count} max={p.companies[0].count} accent="rgba(255,255,255,0.55)" />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function RetentionSection({ cohort }: { cohort: Cohort }) {
  const r = cohort.retention;
  const activePct = r.active / r.starting;
  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div className="eyebrow">Retention</div>
        <span className="mono text-xs text-[color:var(--muted)]">
          Snapshot from transfer sheet
        </span>
      </div>
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 md:col-span-4 surface-elev rounded-2xl p-5">
          <div className="eyebrow mb-2">Retention</div>
          <div className="display text-6xl">{pct(activePct, 0)}</div>
          <div className="mt-2 text-sm text-[color:var(--text-dim)]">
            {r.active} of {r.starting} still active
          </div>
          <div className="mt-5 flex items-center gap-1 h-2 rounded overflow-hidden bg-white/5">
            <div style={{ width: `${(r.active / r.starting) * 100}%`, background: "#22c55e" }} className="h-full" />
            <div style={{ width: `${(r.transferred / r.starting) * 100}%`, background: "#eab308" }} className="h-full" />
            <div style={{ width: `${(r.dropped / r.starting) * 100}%`, background: "#ef4444" }} className="h-full" />
          </div>
          <div className="mt-3 flex items-center gap-4 text-xs text-[color:var(--text-dim)]">
            <LegendDot color="#22c55e" label={`Active ${r.active}`} />
            <LegendDot color="#eab308" label={`Transfer ${r.transferred}`} />
            <LegendDot color="#ef4444" label={`Drop ${r.dropped}`} />
          </div>
        </div>

        <div className="col-span-12 md:col-span-8 surface-elev rounded-2xl p-5">
          <div className="eyebrow mb-4">Per batch</div>
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-[color:var(--muted)] uppercase tracking-widest">
                <th className="pb-3 pr-4">Batch</th>
                <th className="pb-3 px-4 text-right">Drops</th>
                <th className="pb-3 px-4 text-right">Transfers</th>
                <th className="pb-3 pl-6">Trend</th>
              </tr>
            </thead>
            <tbody>
              {r.batchDrops.map((b) => (
                <tr key={b.batch} className="border-t hairline">
                  <td className="py-3 pr-4 text-sm capitalize">{b.batch}</td>
                  <td className="py-3 px-4 text-sm mono text-right">{b.drops}</td>
                  <td className="py-3 px-4 text-sm mono text-right">{b.transfers}</td>
                  <td className="py-3 pl-6 w-40">
                    <div className="h-1.5 rounded bg-white/5 overflow-hidden">
                      <div
                        className="h-full"
                        style={{
                          width: `${((b.drops + b.transfers) / 10) * 100}%`,
                          background: "rgba(239, 68, 68, 0.75)",
                        }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function RankedRow({
  label,
  value,
  max,
  accent,
}: {
  label: string;
  value: number;
  max: number;
  accent: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="text-[color:var(--text-dim)]">{label}</span>
        <span className="mono text-white">{value}</span>
      </div>
      <div className="h-1 rounded bg-white/5 overflow-hidden">
        <div className="h-full" style={{ width: `${(value / max) * 100}%`, background: accent }} />
      </div>
    </div>
  );
}

function MiniBars({ data, accent }: { data: { label: string; value: number }[]; accent: string }) {
  const max = Math.max(...data.map((d) => d.value));
  return (
    <div className="flex items-end gap-3 h-24">
      {data.map((d) => (
        <div key={d.label} className="flex-1 flex flex-col items-center gap-2">
          <div
            className="w-full rounded-t"
            style={{
              height: `${(d.value / max) * 100}%`,
              background: `linear-gradient(180deg, ${accent}, ${accent}60)`,
            }}
          />
          <div className="text-[10px] mono text-[color:var(--muted)] uppercase">{d.label}</div>
        </div>
      ))}
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="w-2 h-2 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}
