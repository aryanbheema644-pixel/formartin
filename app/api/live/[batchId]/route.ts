import { NextResponse } from "next/server";
import { fetchLiveBatch } from "@/lib/batch-data";
import type { BatchId } from "@/lib/types";

export async function GET(
  req: Request,
  ctx: { params: Promise<{ batchId: string }> },
) {
  const { batchId } = await ctx.params;
  const url = new URL(req.url);
  const cohortId = url.searchParams.get("cohort") ?? "c14";
  try {
    const data = await fetchLiveBatch(cohortId, batchId as BatchId);
    if (!data) return NextResponse.json({ error: "unknown batch" }, { status: 404 });
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}
