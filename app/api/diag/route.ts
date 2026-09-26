import { NextResponse } from "next/server";

/**
 * Diagnostic — reports whether the service-account env vars are shaped correctly.
 * Never returns the private key itself; only its length and a few structural signals.
 */
export async function GET() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ?? "";
  const rawKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY ?? "";
  return NextResponse.json({
    email: {
      set: Boolean(email),
      value: email,
      length: email.length,
      hasWhitespaceAround: email !== email.trim(),
    },
    key: {
      set: Boolean(rawKey),
      length: rawKey.length,
      startsWithBegin: rawKey.trimStart().startsWith("-----BEGIN PRIVATE KEY-----"),
      endsWithEnd: rawKey.trimEnd().endsWith("-----END PRIVATE KEY-----"),
      hasLiteralEscapedNewlines: rawKey.includes("\\n"),
      hasRealNewlines: rawKey.includes("\n"),
      firstChars: rawKey.slice(0, 40),
      lastChars: rawKey.slice(-40),
    },
  });
}
