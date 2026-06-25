import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DATA_FILE = path.join(process.cwd(), "data", "sync-data.json");

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    // Read existing data
    let existing: Record<string, unknown> = {};
    try {
      if (fs.existsSync(DATA_FILE)) {
        existing = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
      }
    } catch {}

    // Merge: each key in body overwrites existing
    const merged = { ...existing, ...body };
    merged._lastSync = new Date().toISOString();

    // Save
    fs.writeFileSync(DATA_FILE, JSON.stringify(merged, null, 2));

    return NextResponse.json({
      ok: true,
      synced: Object.keys(body).length,
      time: merged._lastSync,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
