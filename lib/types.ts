export type BatchId = "cyclops" | "nemesis" | "ares" | "helios" | "titan";

export type BatchState =
  | "PURSUIT"
  | "JUDGEMENT"
  | "AWAKENING"
  | "ZENITH"
  | "PRIMORDIAL"
  | "SIEGE";

export interface BatchMeta {
  id: BatchId;
  name: string;
  image: string;
  portrait: string;
  accent: string;
  protocol: string;
  cycle: string;
  state: BatchState;
  motto: string;
}

export interface KpiSet {
  active: number;
  totalQuests: number;
  submissions: number;
  subRate: number;
  onTime: number;
  late: number;
  reviewsPending: number;
  reviewsDone: number;
}

export interface CohortMeta {
  id: string;
  number: number;
  codename: string;
  status: "ACTIVE" | "GRADUATED" | "INTAKE";
  hero: string;
  accent: string;
  window: string;
}

export interface Cohort {
  meta: CohortMeta;
  kpis: KpiSet;
  batches: Batch[];
  placements: Placements;
  retention: Retention;
  lastSynced: string;
  deltas?: {
    active?: number;
    submissions?: number;
    reviewsPending?: number;
  };
  meta_extra?: {
    subline?: string;
  };
}

export interface Placements {
  offers: number;
  offersRate: number;
  avgOffer: number;
  topRoles: { role: string; count: number }[];
  companies: { name: string; count: number }[];
  monthly: { month: string; offers: number }[];
}

export interface Retention {
  starting: number;
  active: number;
  dropped: number;
  transferred: number;
  batchDrops: { batch: BatchId; drops: number; transfers: number }[];
  weekly: { week: string; active: number }[];
}

export interface Quest {
  id: string;
  title: string;
  deadline: string;
  totalAssigned: number;
  submitted: number;
  reviewed: number;
  subRate: number;
  status: "OPEN" | "GRADING" | "CLOSED";
}

export interface Submission {
  id: string;
  studentName: string;
  studentEmail: string;
  quest: string;
  submittedAt: string;
  status: "ON_TIME" | "LATE" | "PENDING_REVIEW" | "REVIEWED";
  score?: number;
  reviewer?: string;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  submissions: number;
  onTime: number;
  late: number;
  score: number;
  streak: number;
  atRisk: boolean;
}

export interface Batch {
  meta: BatchMeta;
  kpis: KpiSet;
  quests: Quest[];
  submissions: Submission[];
  students: Student[];
  weeklyActivity: { week: string; onTime: number; late: number; pending: number }[];
}
