import type {
  Batch,
  BatchId,
  BatchMeta,
  Cohort,
  Quest,
  Student,
  Submission,
} from "./types";

const BATCH_META: Record<BatchId, BatchMeta> = {
  cyclops: {
    id: "cyclops",
    name: "Cyclops",
    image: "/images/cyclops.jpg",
    portrait: "/images/verticals/cyclops.jpg",
    accent: "var(--cyclops)",
    protocol: "CYCLOPS PROTOCOL",
    cycle: "SIEGE",
    state: "SIEGE",
    motto: "One beam. One target.",
  },
  nemesis: {
    id: "nemesis",
    name: "Nemesis",
    image: "/images/nemesis.jpg",
    portrait: "/images/verticals/nemesis.jpg",
    accent: "var(--nemesis)",
    protocol: "NEMESIS PROTOCOL",
    cycle: "JUDGEMENT",
    state: "PURSUIT",
    motto: "Balance restored, always.",
  },
  ares: {
    id: "ares",
    name: "Ares",
    image: "/images/ares.jpg",
    portrait: "/images/verticals/ares.jpg",
    accent: "var(--ares)",
    protocol: "ARES PROTOCOL",
    cycle: "WAR",
    state: "SIEGE",
    motto: "Forged in fire, held in hand.",
  },
  helios: {
    id: "helios",
    name: "Helios",
    image: "/images/helios.jpg",
    portrait: "/images/verticals/helios.jpg",
    accent: "var(--helios)",
    protocol: "HELIOS PROTOCOL",
    cycle: "SOLAR",
    state: "ZENITH",
    motto: "The sun sees everything.",
  },
  titan: {
    id: "titan",
    name: "Titan",
    image: "/images/titan.jpg",
    portrait: "/images/verticals/titan.jpg",
    accent: "var(--titan)",
    protocol: "GRAVITY PROTOCOL",
    cycle: "PRIMORDIAL",
    state: "AWAKENING",
    motto: "Slow. Colossal. Inevitable.",
  },
};

const QUEST_TITLES = [
  "Q1 · The Founder Story",
  "Q2 · Analytics Deep Dive",
  "Q3 · Retention Loops",
  "Q4 · Growth Levers",
  "Q5 · Pitch to Investors",
];

function seededRand(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 0xffffffff;
    return s / 0xffffffff;
  };
}

function buildQuests(seed: number): Quest[] {
  const rand = seededRand(seed);
  const now = Date.now();
  return QUEST_TITLES.map((title, i) => {
    const totalAssigned = 80;
    const submitted = Math.floor(totalAssigned * (0.55 + rand() * 0.4));
    const reviewed = Math.floor(submitted * (0.4 + rand() * 0.55));
    const deadline = new Date(now + (i - 2) * 6 * 24 * 60 * 60 * 1000).toISOString();
    return {
      id: `q${i + 1}`,
      title,
      deadline,
      totalAssigned,
      submitted,
      reviewed,
      subRate: submitted / totalAssigned,
      status: i < 3 ? "GRADING" : i === 3 ? "OPEN" : "OPEN",
    };
  });
}

const FIRST_NAMES = [
  "Aarav","Ishan","Vihaan","Kabir","Rohan","Aditya","Advait","Reyansh","Yash","Arjun",
  "Ananya","Diya","Meera","Ira","Aisha","Kavya","Priya","Riya","Zara","Tara",
  "Neel","Dhruv","Karan","Manav","Nikhil","Om","Parth","Rahul","Sahil","Tanay",
  "Aanya","Aditi","Bhavya","Charu","Devika","Esha","Falak","Gauri","Isha","Jhanvi",
];
const LAST_NAMES = [
  "Sharma","Verma","Iyer","Nair","Patel","Reddy","Menon","Kapoor","Gupta","Khanna",
  "Agarwal","Mehta","Rao","Bose","Das","Sinha","Joshi","Bhatt","Chopra","Malhotra",
];

function buildStudents(seed: number, size = 80): Student[] {
  const rand = seededRand(seed);
  return Array.from({ length: size }, (_, i) => {
    const first = FIRST_NAMES[Math.floor(rand() * FIRST_NAMES.length)];
    const last = LAST_NAMES[Math.floor(rand() * LAST_NAMES.length)];
    const submissions = Math.floor(rand() * 5) + (rand() > 0.15 ? 1 : 0);
    const onTime = Math.min(submissions, Math.floor(submissions * (0.4 + rand() * 0.55)));
    const late = submissions - onTime;
    const score = Math.round(60 + rand() * 40);
    return {
      id: `s${seed}-${i + 1}`,
      name: `${first} ${last}`,
      email: `${first.toLowerCase()}.${last.toLowerCase()}@aevy.tv`,
      submissions,
      onTime,
      late,
      score,
      streak: Math.floor(rand() * 6),
      atRisk: submissions < 2,
    };
  });
}

function buildSubmissions(students: Student[], quests: Quest[], seed: number): Submission[] {
  const rand = seededRand(seed);
  const out: Submission[] = [];
  const now = Date.now();
  for (const s of students) {
    for (let qi = 0; qi < s.submissions; qi++) {
      const quest = quests[qi % quests.length];
      const isLate = qi < s.late;
      const isReviewed = rand() > 0.4;
      out.push({
        id: `${s.id}-${quest.id}`,
        studentName: s.name,
        studentEmail: s.email,
        quest: quest.title,
        submittedAt: new Date(now - Math.floor(rand() * 12 * 24 * 60 * 60 * 1000)).toISOString(),
        status: isReviewed ? "REVIEWED" : isLate ? "LATE" : "ON_TIME",
        score: isReviewed ? Math.round(60 + rand() * 40) : undefined,
        reviewer: isReviewed
          ? ["Martin", "Achina", "Varun", "Kiran"][Math.floor(rand() * 4)]
          : undefined,
      });
    }
  }
  return out;
}

function buildBatch(id: BatchId, seed: number): Batch {
  const quests = buildQuests(seed);
  const students = buildStudents(seed);
  const submissions = buildSubmissions(students, quests, seed);
  const totalAssigned = quests.reduce((a, q) => a + q.totalAssigned, 0);
  const submitted = quests.reduce((a, q) => a + q.submitted, 0);
  const reviewed = quests.reduce((a, q) => a + q.reviewed, 0);
  const onTime = submissions.filter((s) => s.status === "ON_TIME").length;
  const late = submissions.filter((s) => s.status === "LATE").length;
  const reviewsDone = submissions.filter((s) => s.status === "REVIEWED").length;
  const reviewsPending = submissions.length - reviewsDone;
  return {
    meta: BATCH_META[id],
    kpis: {
      active: students.length,
      totalQuests: quests.length,
      submissions: submissions.length,
      subRate: submitted / totalAssigned,
      onTime,
      late,
      reviewsPending,
      reviewsDone,
    },
    quests,
    submissions,
    students,
    weeklyActivity: Array.from({ length: 8 }, (_, i) => ({
      week: `W${i + 1}`,
      onTime: 20 + Math.floor(seededRand(seed + i)() * 40),
      late: 5 + Math.floor(seededRand(seed + i + 99)() * 25),
      pending: 10 + Math.floor(seededRand(seed + i + 199)() * 20),
    })),
  };
}

export function buildCohort14(): Cohort {
  const batches: Batch[] = [
    buildBatch("cyclops", 101),
    buildBatch("nemesis", 202),
    buildBatch("ares", 303),
    buildBatch("helios", 404),
    buildBatch("titan", 505),
  ];
  // Aggregate KPIs match the reference Google Sheet header exactly.
  const kpis = {
    active: 221,
    totalQuests: 5,
    submissions: 732,
    subRate: 0.662,
    onTime: 401,
    late: 331,
    reviewsPending: 432,
    reviewsDone: 300,
  };

  return {
    meta: {
      id: "c14",
      number: 14,
      codename: "Purple Command",
      status: "ACTIVE",
      hero: "/images/cohort-14.jpg",
      accent: "var(--cohort-14)",
      window: "04 Aug 2026 — 15 Dec 2026",
    },
    kpis,
    batches,
    placements: {
      offers: 47,
      offersRate: 0.53,
      avgOffer: 14.2,
      topRoles: [
        { role: "Product Analyst", count: 12 },
        { role: "Growth Associate", count: 9 },
        { role: "Content Strategist", count: 8 },
        { role: "Founders' Office", count: 7 },
        { role: "Ops / PMO", count: 6 },
        { role: "Marketing", count: 5 },
      ],
      companies: [
        { name: "Aeos Labs", count: 9 },
        { name: "Scenes", count: 7 },
        { name: "Yaas Media", count: 6 },
        { name: "Zerodha Varsity", count: 5 },
        { name: "Groww", count: 5 },
        { name: "Cred", count: 4 },
        { name: "Razorpay", count: 4 },
        { name: "Meesho", count: 3 },
      ],
      monthly: [
        { month: "Aug", offers: 3 },
        { month: "Sep", offers: 12 },
        { month: "Oct", offers: 18 },
        { month: "Nov", offers: 14 },
      ],
    },
    retention: {
      starting: 250,
      active: 221,
      dropped: 18,
      transferred: 11,
      batchDrops: [
        { batch: "cyclops", drops: 3, transfers: 2 },
        { batch: "nemesis", drops: 4, transfers: 1 },
        { batch: "ares", drops: 5, transfers: 3 },
        { batch: "helios", drops: 3, transfers: 3 },
        { batch: "titan", drops: 3, transfers: 2 },
      ],
      weekly: Array.from({ length: 10 }, (_, i) => ({
        week: `W${i + 1}`,
        active: 250 - Math.min(29, Math.floor(i * 3 + Math.random() * 2)),
      })),
    },
    lastSynced: "22 Sep 2026 · 05:58",
    deltas: { active: 0.12, submissions: 0.08, reviewsPending: 0.24 },
  };
}

interface StubOpts {
  number: number;
  codename: string;
  status: "GRADUATED" | "INTAKE";
  window: string;
  submissions: number;
  reviewsPending: number;
  active: number;
  deltas?: { active?: number; submissions?: number; reviewsPending?: number };
  subline?: string;
}

export function buildCohortStub(o: StubOpts): Cohort {
  const c = buildCohort14();
  c.meta = {
    ...c.meta,
    id: `c${o.number}`,
    number: o.number,
    codename: o.codename,
    status: o.status,
    hero: "",
    accent: o.status === "GRADUATED" ? "#6b6b6b" : "#ffffff",
    window: o.window,
  };
  c.kpis = {
    ...c.kpis,
    active: o.active,
    submissions: o.submissions,
    reviewsPending: o.reviewsPending,
    subRate: o.status === "INTAKE" ? 0 : c.kpis.subRate,
  };
  c.deltas = o.deltas;
  c.meta_extra = { subline: o.subline };
  return c;
}

export const COHORTS: Cohort[] = [
  buildCohort14(),
  buildCohortStub({
    number: 15,
    codename: "Black Harbor",
    status: "INTAKE",
    window: "Opens 12 Jan 2027",
    active: 0,
    submissions: 0,
    reviewsPending: 0,
    subline: "Opens 12 Jan 2027 · 184 registered",
  }),
  buildCohortStub({
    number: 13,
    codename: "Iron Ledger",
    status: "GRADUATED",
    window: "10 Feb 2026 — 22 Jun 2026",
    active: 0,
    submissions: 1148,
    reviewsPending: 0,
    deltas: { submissions: 0.05 },
  }),
  buildCohortStub({
    number: 12,
    codename: "Silent North",
    status: "GRADUATED",
    window: "02 Sep 2025 — 13 Jan 2026",
    active: 0,
    submissions: 1093,
    reviewsPending: 0,
    deltas: { submissions: 0.03 },
  }),
];

export function getCohort(id: string): Cohort | undefined {
  return COHORTS.find((c) => c.meta.id === id);
}

export function getBatch(cohortId: string, batchId: string): { cohort: Cohort; batch: Batch } | undefined {
  const cohort = getCohort(cohortId);
  if (!cohort) return undefined;
  const batch = cohort.batches.find((b) => b.meta.id === batchId);
  if (!batch) return undefined;
  return { cohort, batch };
}
