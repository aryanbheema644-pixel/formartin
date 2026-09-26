import { NextResponse } from "next/server";
import { batchSheetId } from "@/lib/sheet-config";
import { getSpreadsheetMeta, readTab } from "@/lib/sheets";
import type { BatchId } from "@/lib/types";

/**
 * Diagnostic endpoint. Given a batch id (cyclops/nemesis/ares/helios/titan),
 * returns the sheet title, every tab and its dimensions, plus the first 8 rows
 * of each tab so we can see what columns are actually there before wiring UI.
 *
 * GET /api/probe/nemesis
 * GET /api/probe/nemesis?cohort=c14&tabRows=15
 */
export async function GET(
  req: Request,
  ctx: { params: Promise<{ batchId: string }> },
) {
  const { batchId } = await ctx.params;
  const url = new URL(req.url);
  const cohortId = url.searchParams.get("cohort") ?? "c14";
  const tabRows = Math.max(1, Math.min(40, Number(url.searchParams.get("tabRows") ?? 8)));

  const sheetId = batchSheetId(cohortId, batchId as BatchId);
  if (!sheetId) {
    return NextResponse.json(
      { error: `No sheet registered for ${cohortId}/${batchId}` },
      { status: 404 },
    );
  }

  try {
    const meta = await getSpreadsheetMeta(sheetId);
    const tabs = await Promise.all(
      meta.tabs.map(async (t) => {
        try {
          const rows = await readTab(sheetId, t.title, tabRows);
          return {
            title: t.title,
            index: t.index,
            rows: t.rows,
            cols: t.cols,
            sample: rows,
          };
        } catch (err) {
          return {
            title: t.title,
            index: t.index,
            rows: t.rows,
            cols: t.cols,
            error: err instanceof Error ? err.message : String(err),
          };
        }
      }),
    );
    return NextResponse.json({
      cohortId,
      batchId,
      sheetId,
      title: meta.title,
      tabs,
    });
  } catch (err) {
    return NextResponse.json(
      {
        cohortId,
        batchId,
        sheetId,
        error: err instanceof Error ? err.message : String(err),
      },
      { status: 500 },
    );
  }
}
