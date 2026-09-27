import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { google, sheets_v4 } from "googleapis";

let cached: sheets_v4.Sheets | null = null;

function loadCredentials(): { client_email: string; private_key: string } {
  // Prefer env vars (works on Vercel / any host).
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.trim();
  const rawKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (email && rawKey) {
    // Vercel stores multi-line env vars with the `\n` escape literal. Normalize back to real newlines,
    // and trim any accidental surrounding whitespace that would break the JWT parser.
    const private_key = (rawKey.includes("\\n") ? rawKey.replace(/\\n/g, "\n") : rawKey).trim();
    return { client_email: email, private_key };
  }

  // Fall back to on-disk key for local dev.
  const path = join(process.cwd(), ".secrets", "service-account.json");
  if (existsSync(path)) {
    const parsed = JSON.parse(readFileSync(path, "utf-8"));
    return { client_email: parsed.client_email, private_key: parsed.private_key };
  }

  throw new Error(
    "Service account credentials missing: set GOOGLE_SERVICE_ACCOUNT_EMAIL + GOOGLE_SERVICE_ACCOUNT_KEY env vars, or place .secrets/service-account.json in the project root.",
  );
}

export function sheetsClient(): sheets_v4.Sheets {
  if (cached) return cached;
  const creds = loadCredentials();
  const auth = new google.auth.JWT({
    email: creds.client_email,
    key: creds.private_key,
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });
  cached = google.sheets({ version: "v4", auth });
  return cached;
}

/**
 * Return metadata for the whole spreadsheet: title + list of tabs.
 */
export async function getSpreadsheetMeta(spreadsheetId: string) {
  const sheets = sheetsClient();
  const res = await sheets.spreadsheets.get({
    spreadsheetId,
    fields: "properties(title),sheets(properties(sheetId,title,index,gridProperties))",
  });
  return {
    title: res.data.properties?.title ?? "",
    tabs: (res.data.sheets ?? []).map((s) => ({
      sheetId: s.properties?.sheetId ?? 0,
      title: s.properties?.title ?? "",
      index: s.properties?.index ?? 0,
      rows: s.properties?.gridProperties?.rowCount ?? 0,
      cols: s.properties?.gridProperties?.columnCount ?? 0,
    })),
  };
}

/**
 * Read a single tab's cell values as a 2D array of strings.
 * `limit` caps the number of rows (starting from row 1) to avoid pulling huge sheets during probing.
 */
export async function readTab(
  spreadsheetId: string,
  tabTitle: string,
  limit = 200,
): Promise<string[][]> {
  const sheets = sheetsClient();
  const range = `'${tabTitle.replace(/'/g, "''")}'!A1:ZZ${limit}`;
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range,
    valueRenderOption: "FORMATTED_VALUE",
    dateTimeRenderOption: "FORMATTED_STRING",
  });
  return (res.data.values ?? []) as string[][];
}

/**
 * Batch read multiple ranges from one spreadsheet in a single API call.
 */
export async function readRanges(
  spreadsheetId: string,
  ranges: string[],
): Promise<Record<string, string[][]>> {
  const sheets = sheetsClient();
  const res = await sheets.spreadsheets.values.batchGet({
    spreadsheetId,
    ranges,
    valueRenderOption: "FORMATTED_VALUE",
    dateTimeRenderOption: "FORMATTED_STRING",
  });
  const out: Record<string, string[][]> = {};
  (res.data.valueRanges ?? []).forEach((vr, i) => {
    out[ranges[i]] = (vr.values ?? []) as string[][];
  });
  return out;
}
