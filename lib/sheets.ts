import { readFileSync } from "node:fs";
import { join } from "node:path";
import { google, sheets_v4 } from "googleapis";

let cached: sheets_v4.Sheets | null = null;

function loadCredentials() {
  const path = join(process.cwd(), ".secrets", "service-account.json");
  return JSON.parse(readFileSync(path, "utf-8"));
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
