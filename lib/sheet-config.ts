import type { BatchId } from "./types";

/**
 * Registry mapping each batch's canonical id to the Google Sheet driving it.
 * Placements + Transfer sheets left null until Martin provides them.
 */
export interface CohortSheetConfig {
  cohortId: string;
  cohortNumber: number;
  placementsSheetId: string | null;
  transferSheetId: string | null;
  batches: Record<BatchId, string | null>;
}

export const COHORT_14: CohortSheetConfig = {
  cohortId: "c14",
  cohortNumber: 14,
  placementsSheetId: null,
  transferSheetId: null,
  batches: {
    cyclops: "1-t96FUudM3vsmfKBuVFhBGq8dTbB_S_N0_20NmPzk48",
    nemesis: "1ZHMkp6XZqezDCGfKOegT1KdWIhHAk2k9hr4h7EmRpws",
    ares: "1Zr_GpssuAaDNFGAuChLkDDiljDSA41IFgLTxnpClbno",
    helios: "1msnUV9ATDf22q3i4FVJW0NnwwG5tfhzKQHFEJG8Eg7s",
    titan: "1wGsD1Gw-5PlBzWHwK3Y9zI3Fil8vLoqWOtjcDCYjdaM",
  },
};

export const COHORTS_CONFIG: Record<string, CohortSheetConfig> = {
  c14: COHORT_14,
};

export function batchSheetId(cohortId: string, batchId: BatchId): string | null {
  return COHORTS_CONFIG[cohortId]?.batches?.[batchId] ?? null;
}
