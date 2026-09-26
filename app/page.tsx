import Link from "next/link";
import { COHORTS } from "@/lib/fixtures";
import { num } from "@/lib/format";
import type { Cohort } from "@/lib/types";

const OK_GREEN = "oklch(0.79 0.17 150)";
const OK_BLUE = "oklch(0.72 0.15 250)";
const OK_YELLOW = "oklch(0.87 0.15 90)";
const OK_GRAY = "oklch(0.65 0 0)";

export default function Home() {
  return (
    <div
      className="flex bg-black text-white overflow-hidden"
      style={{ height: "100vh", fontFamily: "var(--font-geist-sans), system-ui, sans-serif" }}
    >
      <Sidebar />
      <MainArea />
    </div>
  );
}

/* ------------------------------ SIDEBAR ------------------------------ */

function Sidebar() {
  return (
    <aside
      className="relative flex flex-col overflow-hidden"
      style={{
        flex: "0 0 clamp(230px, 23vw, 320px)",
        gap: "min(28px, 3.2vh)",
        padding: "min(36px, 4vh) 28px min(28px, 3vh)",
        borderRight: "1px solid rgba(255,255,255,0.06)",
        background: "linear-gradient(rgb(10,10,11) 0%, rgb(3,3,3) 100%)",
      }}
    >
      {/* subtle corner bloom */}
      <div
        style={{
          position: "absolute",
          left: "-55%",
          bottom: "-38%",
          width: "150%",
          aspectRatio: "1 / 1",
          borderRadius: "50%",
          background:
            "radial-gradient(circle at 70% 25%, rgb(27,27,29) 0%, rgb(11,11,12) 38%, rgb(3,3,3) 70%)",
          boxShadow: "rgba(255,255,255,0.06) 1px 1px 0px inset",
          pointerEvents: "none",
        }}
      />

      <Link
        href="/"
        style={{
          position: "relative",
          display: "flex",
          gap: 18,
          font: '500 17px/1 var(--font-geist-mono), monospace',
          letterSpacing: "0.32em",
          whiteSpace: "nowrap",
        }}
      >
        <span>AEVY</span>
        <span style={{ color: "rgba(255,255,255,0.4)" }}>/</span>
        <span style={{ color: "rgba(255,255,255,0.85)" }}>COMMAND</span>
      </Link>

      <nav
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          gap: 4,
        }}
      >
        <NavItem icon="grid" label="Cohorts" count={COHORTS.length} active />
        <NavItem icon="analytics" label="Analytics" />
        <NavItem icon="settings" label="Settings" />
      </nav>

      {/* logo */}
      <div
        style={{
          position: "relative",
          flex: "1 1 0",
          minHeight: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
        }}
      >
        <div
          style={{
            height: "min(100%, 250px)",
            maxWidth: "100%",
            aspectRatio: "1 / 1",
            overflow: "hidden",
            borderRadius: "50%",
            background:
              "radial-gradient(circle at 50% 40%, rgba(255,255,255,0.05), rgba(255,255,255,0.01) 70%)",
            border: "1px solid rgba(255,255,255,0.06)",
            padding: "8%",
            boxSizing: "border-box",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/aevy-logo.jpg"
            alt="Aevy"
            style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }}
          />
        </div>
      </div>

      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          gap: "min(20px, 2.4vh)",
        }}
      >
        <div
          style={{
            font: '400 clamp(40px, min(4.6vw, 8vh), 72px)/0.95 var(--font-anton), sans-serif',
            textTransform: "uppercase",
          }}
        >
          Sup bro.
        </div>
        <div style={{ width: "70%", height: 1, background: "rgba(255,255,255,0.18)" }} />
        <div
          style={{
            font: '500 12.5px/1.8 var(--font-geist-mono), monospace',
            letterSpacing: "0.2em",
            color: "rgba(255,255,255,0.6)",
          }}
        >
          SAME CHAOS.
          <br />
          HIGHER STANDARDS.
        </div>
      </div>
    </aside>
  );
}

function NavItem({
  icon,
  label,
  count,
  active,
}: {
  icon: "grid" | "analytics" | "settings";
  label: string;
  count?: number;
  active?: boolean;
}) {
  const base = {
    display: "flex",
    alignItems: "center",
    gap: 14,
    padding: "min(13px, 1.5vh) 16px",
    borderRadius: 12,
    font: '500 15px/1 var(--font-geist-sans), sans-serif',
  } as const;
  const activeStyle = active
    ? {
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.08)",
        color: "#fff",
      }
    : {
        background: "transparent",
        border: "1px solid transparent",
        color: "rgba(255,255,255,0.6)",
        fontWeight: 400,
      };
  return (
    <a style={{ ...base, ...activeStyle }} href="#">
      <NavIcon kind={icon} />
      <span style={{ flex: 1 }}>{label}</span>
      {count !== undefined && (
        <span
          style={{
            font: '500 11px/1 var(--font-geist-mono), monospace',
            padding: "5px 9px",
            borderRadius: 7,
            background: "rgba(255,255,255,0.08)",
          }}
        >
          {count}
        </span>
      )}
    </a>
  );
}

function NavIcon({ kind }: { kind: "grid" | "analytics" | "settings" }) {
  if (kind === "grid")
    return (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
        <rect x="1" y="1" width="7.5" height="7.5" rx="1.5" />
        <rect x="11.5" y="1" width="7.5" height="7.5" rx="1.5" />
        <rect x="1" y="11.5" width="7.5" height="7.5" rx="1.5" />
        <rect x="11.5" y="11.5" width="7.5" height="7.5" rx="1.5" />
      </svg>
    );
  if (kind === "analytics")
    return (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4">
        <path d="M2 19h16M4 18V11M8 18V5M12 18V8M16 18V2" />
      </svg>
    );
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4">
      <circle cx="10" cy="10" r="3" />
      <path d="M10 1.5v2.5M10 16v2.5M1.5 10H4M16 10h2.5M4 4l1.8 1.8M14.2 14.2L16 16M4 16l1.8-1.8M14.2 5.8L16 4" />
    </svg>
  );
}

/* ------------------------------ MAIN AREA ------------------------------ */

function MainArea() {
  return (
    <div
      style={{
        flex: "1 1 0",
        minWidth: 0,
        display: "flex",
        flexDirection: "column",
        gap: "min(24px, 2.6vh)",
        padding: "min(28px, 3vh) clamp(20px, 2.6vw, 36px)",
      }}
    >
      <TopBar />
      <Panel />
    </div>
  );
}

function TopBar() {
  return (
    <header style={{ flex: "0 0 auto", display: "flex", alignItems: "center", gap: 16 }}>
      <label
        style={{
          flex: "0 1 720px",
          minWidth: 0,
          display: "flex",
          alignItems: "center",
          gap: 14,
          height: 52,
          padding: "0 10px 0 20px",
          borderRadius: 14,
          background: "rgb(11,11,12)",
          border: "1px solid rgba(255,255,255,0.08)",
          boxSizing: "border-box",
        }}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="rgba(255,255,255,.7)" strokeWidth="1.5">
          <circle cx="9" cy="9" r="6.5" />
          <path d="M14 14l4.5 4.5" />
        </svg>
        <input
          placeholder="Search cohorts, people, or anything…"
          style={{
            flex: 1,
            minWidth: 0,
            background: "transparent",
            border: 0,
            outline: "none",
            color: "#fff",
            font: '400 15px/1 var(--font-geist-sans), sans-serif',
          }}
        />
        <span style={{ display: "flex", gap: 6 }}>
          <KbdChip>⌘</KbdChip>
          <KbdChip mono>K</KbdChip>
        </span>
      </label>
      <span
        style={{
          marginLeft: "auto",
          display: "inline-flex",
          alignItems: "center",
          gap: 12,
          height: 52,
          padding: "0 20px",
          borderRadius: 999,
          background: "rgb(11,11,12)",
          border: "1px solid rgba(255,255,255,0.08)",
          boxSizing: "border-box",
          font: '500 13px/1 var(--font-geist-mono), monospace',
          letterSpacing: "0.16em",
          whiteSpace: "nowrap",
        }}
      >
        <span
          style={{
            width: 9,
            height: 9,
            borderRadius: "50%",
            background: OK_GREEN,
            boxShadow: `${OK_GREEN} 0px 0px 10px`,
          }}
        />
        LIVE <span style={{ color: "rgba(255,255,255,0.4)" }}>·</span> 60s
        <span style={{ color: "rgba(255,255,255,0.6)" }}>⌄</span>
      </span>
    </header>
  );
}

function KbdChip({ children, mono }: { children: React.ReactNode; mono?: boolean }) {
  return (
    <span
      style={{
        width: 32,
        height: 32,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 8,
        border: "1px solid rgba(255,255,255,0.1)",
        background: "rgba(255,255,255,0.03)",
        font: mono
          ? '500 12px/1 var(--font-geist-mono), monospace'
          : '400 14px/1 var(--font-geist-sans), sans-serif',
        color: "rgba(255,255,255,0.7)",
      }}
    >
      {children}
    </span>
  );
}

/* ------------------------------ PANEL ------------------------------ */

function Panel() {
  return (
    <section
      style={{
        flex: "1 1 0",
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
        gap: "min(22px, 2.4vh)",
        padding: "min(30px, 3.2vh) clamp(20px, 2.2vw, 32px)",
        borderRadius: 22,
        background: "linear-gradient(rgb(12,12,13), rgb(7,7,8))",
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "rgba(255,255,255,0.04) 0px 1px 0px inset",
        overflow: "hidden",
      }}
    >
      <PanelHeader />
      <TableHeader />
      <TableBody />
      <AddCohortRow />
    </section>
  );
}

function PanelHeader() {
  return (
    <div
      style={{
        flex: "0 0 auto",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 20,
        paddingBottom: "min(20px, 2.2vh)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div style={{ minWidth: 0, display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <h1
            style={{
              margin: 0,
              font: '600 clamp(24px, min(2.4vw, 4.2vh), 34px)/1 var(--font-geist-sans), sans-serif',
              letterSpacing: "-0.01em",
              whiteSpace: "nowrap",
            }}
          >
            Cohorts
          </h1>
          <span
            style={{
              font: '500 13px/1 var(--font-geist-mono), monospace',
              padding: "7px 11px",
              borderRadius: 9,
              background: "rgba(255,255,255,0.07)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            {COHORTS.length}
          </span>
        </div>
        <div
          style={{
            font: '400 15px/1.3 var(--font-geist-sans), sans-serif',
            color: "rgba(255,255,255,0.6)",
          }}
        >
          Manage and track your cohorts in real-time.
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <ViewToggle />
        <a
          href="#"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            height: 50,
            padding: "0 22px",
            borderRadius: 12,
            background: "rgb(244,244,244)",
            color: "rgb(10,10,10)",
            font: '500 16px/1 var(--font-geist-sans), sans-serif',
            whiteSpace: "nowrap",
          }}
        >
          <span style={{ font: '300 22px/1 var(--font-geist-sans), sans-serif' }}>+</span>
          New cohort
        </a>
      </div>
    </div>
  );
}

function ViewToggle() {
  return (
    <div
      style={{
        display: "flex",
        padding: 4,
        borderRadius: 12,
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <span
        style={{
          width: 48,
          height: 40,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "rgba(255,255,255,0.5)",
        }}
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.4">
          <rect x="1.5" y="1.5" width="6" height="6" rx="1" />
          <rect x="10.5" y="1.5" width="6" height="6" rx="1" />
          <rect x="1.5" y="10.5" width="6" height="6" rx="1" />
          <rect x="10.5" y="10.5" width="6" height="6" rx="1" />
        </svg>
      </span>
      <span
        style={{
          width: 48,
          height: 40,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 9,
          background: "rgba(255,255,255,0.1)",
        }}
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round">
          <path d="M6 4h10M6 9h10M6 14h10M2 4h.01M2 9h.01M2 14h.01" />
        </svg>
      </span>
    </div>
  );
}

/* ------------------------------ TABLE ------------------------------ */

const GRID_TEMPLATE = "minmax(0px, 1fr) 150px repeat(3, minmax(70px, 110px)) 64px";

function TableHeader() {
  return (
    <div
      style={{
        flex: "0 0 auto",
        display: "grid",
        gridTemplateColumns: GRID_TEMPLATE,
        gap: 12,
        padding: "0 16px 4px",
        font: '500 12px/1 var(--font-geist-mono), monospace',
        letterSpacing: "0.14em",
        color: "rgba(255,255,255,0.55)",
      }}
    >
      <span>COHORT</span>
      <span>STATUS</span>
      <span>ACTIVE</span>
      <span>SUBS</span>
      <span>QUEUE</span>
      <span />
    </div>
  );
}

function TableBody() {
  return (
    <div
      style={{
        flex: "1 1 0",
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
        gap: "min(12px, 1.3vh)",
      }}
    >
      {COHORTS.map((c, i) => (
        <CohortRow key={c.meta.id} cohort={c} highlighted={i === 0} />
      ))}
    </div>
  );
}

function CohortRow({ cohort, highlighted }: { cohort: Cohort; highlighted: boolean }) {
  const c = cohort.meta;
  const isActive = c.status === "ACTIVE";
  const isIntake = c.status === "INTAKE";
  return (
    <Link
      href={`/cohort/${c.id}`}
      style={{
        position: "relative",
        flex: "1 1 0",
        minHeight: 0,
        maxHeight: 128,
        display: "grid",
        gridTemplateColumns: GRID_TEMPLATE,
        gap: 12,
        alignItems: "center",
        padding: "0 16px",
        borderRadius: 14,
        background: highlighted ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.016)",
        border: `1px solid rgba(255,255,255,${highlighted ? 0.16 : 0.06})`,
        cursor: "pointer",
      }}
    >
      {highlighted && (
        <span
          style={{
            position: "absolute",
            left: -3,
            top: "18%",
            bottom: "18%",
            width: 4,
            borderRadius: 2,
            background: "#fff",
          }}
        />
      )}
      <div style={{ minWidth: 0, display: "flex", alignItems: "center", gap: 20 }}>
        <Thumb cohort={cohort} />
        <div style={{ minWidth: 0, display: "flex", flexDirection: "column", gap: "min(8px, 0.9vh)" }}>
          <span
            style={{
              font: '500 13px/1 var(--font-geist-mono), monospace',
              letterSpacing: "0.14em",
              color: "rgba(255,255,255,0.7)",
            }}
          >
            C-{String(c.number).padStart(2, "0")}
          </span>
          <span
            style={{
              font: '400 clamp(20px, min(2.2vw, 4vh), 32px)/1 var(--font-anton), sans-serif',
              textTransform: "uppercase",
              letterSpacing: "0.01em",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {c.codename}
          </span>
          <span
            style={{
              font: '400 15px/1.2 var(--font-geist-sans), sans-serif',
              color: "rgba(255,255,255,0.6)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {cohort.meta_extra?.subline ?? c.window}
          </span>
        </div>
      </div>

      <StatusPill status={c.status} />

      <StatCell value={isActive ? num(cohort.kpis.active) : "—"} delta={cohort.deltas?.active} />
      <StatCell
        value={isIntake ? "—" : num(cohort.kpis.submissions)}
        delta={cohort.deltas?.submissions}
      />
      <StatCell
        value={isIntake ? "—" : num(cohort.kpis.reviewsPending)}
        delta={cohort.deltas?.reviewsPending}
        tone={cohort.kpis.reviewsPending > 0 ? "warn" : undefined}
      />

      <span
        style={{
          justifySelf: "end",
          width: "clamp(40px, 6.4vh, 60px)",
          aspectRatio: "1 / 1",
          borderRadius: "50%",
          border: "1px solid rgba(255,255,255,0.12)",
          background: "rgba(255,255,255,0.03)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#fff" strokeWidth="1.4">
          <path d="M2 9h14M11 4l5 5-5 5" />
        </svg>
      </span>
    </Link>
  );
}

function Thumb({ cohort }: { cohort: Cohort }) {
  const box = {
    height: "clamp(44px, 9vh, 86px)",
    aspectRatio: "1 / 1",
    flex: "0 0 auto",
    borderRadius: 10,
    overflow: "hidden",
    border: "1px solid rgba(255,255,255,0.12)",
    background: "radial-gradient(circle at 30% 20%, rgb(42,42,44), rgb(10,10,10) 75%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  } as const;
  if (cohort.meta.hero) {
    return (
      <div style={box}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={cohort.meta.hero}
          alt={`${cohort.meta.codename} mascot`}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
      </div>
    );
  }
  return (
    <div style={box}>
      <span
        style={{
          font: '400 28px/1 var(--font-anton), sans-serif',
          color: "rgba(255,255,255,0.55)",
        }}
      >
        {String(cohort.meta.number).padStart(2, "0")}
      </span>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    ACTIVE: OK_GREEN,
    INTAKE: OK_BLUE,
    GRADUATED: OK_GRAY,
  };
  const c = map[status] ?? OK_GRAY;
  return (
    <span>
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          font: '500 12px/1 var(--font-geist-mono), monospace',
          letterSpacing: "0.14em",
          padding: "10px 16px",
          borderRadius: 999,
          border: `1px solid ${c.replace(")", " / 0.4)")}`,
          background: c.replace(")", " / 0.1)"),
          color: c,
        }}
      >
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: c }} />
        {status}
      </span>
    </span>
  );
}

function StatCell({
  value,
  delta,
  tone,
}: {
  value: string;
  delta?: number;
  tone?: "warn";
}) {
  const color = tone === "warn" ? OK_YELLOW : OK_GREEN;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <span
        style={{
          font: '500 22px/1 var(--font-geist-mono), monospace',
          fontVariantNumeric: "tabular-nums",
          color: tone === "warn" ? OK_YELLOW : "#fff",
        }}
      >
        {value}
      </span>
      {delta !== undefined ? (
        <span
          style={{
            font: '500 12px/1 var(--font-geist-mono), monospace',
            color,
          }}
        >
          ↗ +{Math.round(delta * 100)}%
        </span>
      ) : (
        <span style={{ font: '500 12px/1 var(--font-geist-mono), monospace', color: "rgba(255,255,255,0.35)" }}>
          {value === "—" ? "0%" : ""}
        </span>
      )}
    </div>
  );
}

function AddCohortRow() {
  return (
    <a
      href="#"
      style={{
        flex: "0 0 auto",
        display: "flex",
        alignItems: "center",
        gap: 18,
        height: 74,
        padding: "0 16px",
        borderRadius: 14,
        border: "1px dashed rgba(255,255,255,0.14)",
        color: "rgba(255,255,255,0.7)",
      }}
    >
      <span
        style={{
          width: 44,
          height: 44,
          borderRadius: 10,
          border: "1px dashed rgba(255,255,255,0.2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          font: '300 24px/1 var(--font-geist-sans), sans-serif',
        }}
      >
        +
      </span>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <span style={{ font: '500 16px/1 var(--font-geist-sans), sans-serif', color: "#fff" }}>
          Register a new cohort
        </span>
        <span style={{ font: '400 13px/1.2 var(--font-geist-sans), sans-serif', color: "rgba(255,255,255,0.55)" }}>
          Create and set up a new cohort in seconds.
        </span>
      </div>
    </a>
  );
}
