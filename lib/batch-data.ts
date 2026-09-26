/**
 * Live batch data: reads one batch's Google Sheet and shapes each tab
 * into typed objects. Designed around the actual schema used by Cohort 14 —
 * the 16-tab template applied to Cyclops / Nemesis / Ares / Helios / Titan.
 */
import { batchSheetId } from "./sheet-config";
import { readRanges } from "./sheets";
import type { BatchId } from "./types";

export interface LiveKpis {
  active: number;         // e.g. 43
  totalQuests: number;    // e.g. 5
  submissions: number;    // e.g. 133
  submissionRate: number; // 0-1, e.g. 0.619
  onTime: number;         // e.g. 43
  late: number;           // e.g. 90
  avgDelayHrs: number;    // e.g. 57.2
  avgDifficulty: number;  // e.g. 2.7 (out of 5)
  lastUpdated: string;    // as printed on the sheet
  house: string;          // e.g. "Cyclops"
}

export interface LiveQuest {
  sno: string;
  name: string;
  dateGiven: string;
  deadline: string;
  status: string;
  totalActive: number;
  totalSubs: number;
  onTime: number;
  late: number;
  pending: number;
  subRate: number;         // 0-1
  avgSubmitDays: number;
  avgSubmitHrs: number;
  avgHoursLate: number;
  avgDifficulty: number;
  resubmissions: number;
  pendingReviews: number;
  performance: string;     // "Poor" / "Average" / "Good"
}

export interface LiveStudentAlert {
  alertType: string;
  studentName: string;
  studentId: string;
  status: string;
  submissionRate: string;   // keep as-is ("100%")
  lateCount: number;
  consecutiveMissed: number;
  pendingReviews: number;
  riskLevel: "Low" | "Medium" | "High" | string;
  action: string;
}

export interface LiveStudent {
  sno: string;
  name: string;
  studentId: string;
  dob: string;
  status: string;
  totalQuests: number;
  submitted: number;
  onTime: number;
  late: number;
  notSubmitted: number;
  submissionRate: string;    // "100%"
  avgSpeedDays: number;
  avgDifficulty: number;
  lastSubmission: string;
  consecutiveMissed: number;
  pendingReviews: number;
  perQuest: Record<string, string>; // quest name → submission link
}

export interface LiveSubmission {
  timestamp: string;
  studentName: string;
  studentId: string;
  status: string;              // "Active"
  questName: string;
  link: string;
  deadline: string;
  submissionStatus: string;    // "On-Time" / "Late"
  hoursAfterDeadline: number;  // negative = early
  difficulty: number;
  reviewStatus: string;        // "Review Pending" / "Reviewed"
}

export interface LiveMatrixRow {
  studentName: string;
  studentId: string;
  status: string;
  totalQuests: number;
  submitted: number;
  onTime: number;
  late: number;
  notSubmitted: number;
  submissionRate: number; // 0-1
  cells: { quest: string; state: string }[]; // state ∈ On-Time / Late / Not Submitted
}

export interface LiveWeekly {
  week: string;
  weekStart: string;
  weekEnd: string;
  activeStudents: number;
  questsDue: string;
  totalSubs: number;
  onTime: number;
  late: number;
  missed: number;
  rate: number;
  reviewsCompleted: string;
  reviewsPending: string;
}

export interface LiveFeedback {
  questName: string;
  studentName: string;
  studentId: string;
  difficulty: number;
  feedback: string;
  submittedOn: string;
}

export interface LiveBatchData {
  kpis: LiveKpis;
  quests: LiveQuest[];
  alerts: LiveStudentAlert[];
  students: LiveStudent[];
  submissions: LiveSubmission[];
  matrix: LiveMatrixRow[];
  weekly: LiveWeekly[];
  feedback: LiveFeedback[];
}

/* --------------------------------- helpers -------------------------------- */

function n(v: unknown): number {
  if (typeof v === "number") return v;
  if (typeof v !== "string") return 0;
  const cleaned = v.replace(/[,%$₹]/g, "").trim();
  const parsed = parseFloat(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
}

function pctToDecimal(v: unknown): number {
  if (typeof v !== "string") return n(v);
  if (v.includes("%")) return n(v) / 100;
  const num = n(v);
  return num > 1 ? num / 100 : num;
}

function firstToken(v: string): string {
  return (v ?? "").split(/\s+/)[0] ?? "";
}

/* ----------------------------- parsers per tab ---------------------------- */

function parseMaster(rows: string[][]): LiveKpis {
  const cell = (r: number, c: number) => rows[r]?.[c] ?? "";
  const title = cell(1, 0); // "Last Updated: 25/09/2026 10:46   ·   House: Cyclops"
  const updatedMatch = title.match(/Last Updated:\s*([^·]+)/);
  const houseMatch = title.match(/House:\s*(.+)$/);
  return {
    active: n(firstToken(cell(4, 0))), // "43 Active"
    totalQuests: n(firstToken(cell(4, 3))), // "5 Total"
    submissions: n(cell(4, 6)),
    submissionRate: pctToDecimal(cell(4, 9)),
    onTime: n(cell(7, 0)),
    late: n(cell(7, 3)),
    avgDelayHrs: n(firstToken(cell(7, 6))), // "57.2 hrs"
    avgDifficulty: n(firstToken(cell(7, 9))), // "2.7 / 5"
    lastUpdated: updatedMatch?.[1].trim() ?? "",
    house: houseMatch?.[1].trim() ?? "",
  };
}

function parseQuests(rows: string[][]): LiveQuest[] {
  return rows.slice(1).filter((r) => r[1]).map((r) => ({
    sno: r[0] ?? "",
    name: r[1] ?? "",
    dateGiven: r[2] ?? "",
    deadline: r[3] ?? "",
    status: r[4] ?? "",
    totalActive: n(r[5]),
    totalSubs: n(r[6]),
    onTime: n(r[7]),
    late: n(r[8]),
    pending: n(r[9]),
    subRate: pctToDecimal(r[10]),
    avgSubmitDays: n(r[11]),
    avgSubmitHrs: n(r[12]),
    avgHoursLate: n(r[13]),
    avgDifficulty: n(r[14]),
    resubmissions: n(r[15]),
    pendingReviews: n(r[16]),
    performance: r[17] ?? "",
  }));
}

function parseAlerts(rows: string[][]): LiveStudentAlert[] {
  return rows.slice(1).filter((r) => r[0]).map((r) => ({
    alertType: r[0] ?? "",
    studentName: r[1] ?? "",
    studentId: r[2] ?? "",
    status: r[3] ?? "",
    submissionRate: r[4] ?? "",
    lateCount: n(r[5]),
    consecutiveMissed: n(r[6]),
    pendingReviews: n(r[7]),
    riskLevel: (r[8] ?? "Low") as LiveStudentAlert["riskLevel"],
    action: r[9] ?? "",
  }));
}

function parseStudents(rows: string[][]): LiveStudent[] {
  if (!rows.length) return [];
  const header = rows[0];
  // Columns 17+ are per-quest link columns. Grab their names from header.
  const questNames = header.slice(17);
  return rows.slice(1).filter((r) => r[1]).map((r) => {
    const perQuest: Record<string, string> = {};
    questNames.forEach((qName, i) => {
      const val = r[17 + i];
      if (qName && val) perQuest[qName] = val;
    });
    return {
      sno: r[0] ?? "",
      name: r[1] ?? "",
      studentId: r[2] ?? "",
      dob: r[3] ?? "",
      status: r[4] ?? "",
      totalQuests: n(r[6]),
      submitted: n(r[7]),
      onTime: n(r[8]),
      late: n(r[9]),
      notSubmitted: n(r[10]),
      submissionRate: r[11] ?? "",
      avgSpeedDays: n(r[12]),
      avgDifficulty: n(r[13]),
      lastSubmission: r[14] ?? "",
      consecutiveMissed: n(r[15]),
      pendingReviews: n(r[16]),
      perQuest,
    };
  });
}

function parseSubmissionLog(rows: string[][]): LiveSubmission[] {
  return rows.slice(1).filter((r) => r[0]).map((r) => ({
    timestamp: r[0] ?? "",
    studentName: r[1] ?? "",
    studentId: r[2] ?? "",
    status: r[4] ?? "",
    questName: r[5] ?? "",
    link: r[6] ?? "",
    deadline: r[7] ?? "",
    submissionStatus: r[8] ?? "",
    hoursAfterDeadline: n(r[9]),
    difficulty: n(r[14]),
    reviewStatus: r[17] ?? "",
  }));
}

function parseMatrix(rows: string[][]): LiveMatrixRow[] {
  if (!rows.length) return [];
  const header = rows[0];
  const questNames = header.slice(10); // columns after the fixed stats
  return rows.slice(1).filter((r) => r[1]).map((r) => ({
    studentName: r[1] ?? "",
    studentId: r[2] ?? "",
    status: r[3] ?? "",
    totalQuests: n(r[4]),
    submitted: n(r[5]),
    onTime: n(r[6]),
    late: n(r[7]),
    notSubmitted: n(r[8]),
    submissionRate: pctToDecimal(r[9]),
    cells: questNames.map((q, i) => ({ quest: q, state: r[10 + i] ?? "" })),
  }));
}

function parseWeekly(rows: string[][]): LiveWeekly[] {
  return rows.slice(1).filter((r) => r[0]).map((r) => ({
    week: r[0] ?? "",
    weekStart: r[1] ?? "",
    weekEnd: r[2] ?? "",
    activeStudents: n(r[3]),
    questsDue: r[4] ?? "",
    totalSubs: n(r[5]),
    onTime: n(r[6]),
    late: n(r[7]),
    missed: n(r[8]),
    rate: pctToDecimal(r[9]),
    reviewsCompleted: r[12] ?? "",
    reviewsPending: r[13] ?? "",
  }));
}

function parseFeedback(rows: string[][]): LiveFeedback[] {
  return rows.slice(1).filter((r) => r[0]).map((r) => ({
    questName: r[0] ?? "",
    studentName: r[1] ?? "",
    studentId: r[2] ?? "",
    difficulty: n(r[3]),
    feedback: r[4] ?? "",
    submittedOn: r[5] ?? "",
  }));
}

/* --------------------------------- entry --------------------------------- */

export async function fetchLiveBatch(
  cohortId: string,
  batchId: BatchId,
): Promise<LiveBatchData | null> {
  const sheetId = batchSheetId(cohortId, batchId);
  if (!sheetId) return null;

  const RANGES = [
    "'Master Dashboard'!A1:J10",
    "'Quest Overview'!A1:Z100",
    "'Student Alerts'!A1:J200",
    "'Students Data Master'!A1:AZ400",
    "'Submission Log'!A1:Z600",
    "'Submission Matrix'!A1:AZ400",
    "'Weekly Report'!A1:Q30",
    "'Feedback Summary'!A1:F400",
  ];
  const data = await readRanges(sheetId, RANGES);

  return {
    kpis: parseMaster(data[RANGES[0]] ?? []),
    quests: parseQuests(data[RANGES[1]] ?? []),
    alerts: parseAlerts(data[RANGES[2]] ?? []),
    students: parseStudents(data[RANGES[3]] ?? []),
    submissions: parseSubmissionLog(data[RANGES[4]] ?? []),
    matrix: parseMatrix(data[RANGES[5]] ?? []),
    weekly: parseWeekly(data[RANGES[6]] ?? []),
    feedback: parseFeedback(data[RANGES[7]] ?? []),
  };
}
