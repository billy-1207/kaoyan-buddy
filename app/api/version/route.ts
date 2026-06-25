import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const pkg = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), "package.json"), "utf-8")
    );
    return NextResponse.json({
      version: pkg.version || "1.0.0",
      versionCode: pkg.versionCode || 1,
      apkUrl: "/updates/kaoyan-buddy.apk",
      releaseNotes: pkg.releaseNotes || "新版本发布",
      minVersionCode: pkg.minVersionCode || 1,
    });
  } catch {
    return NextResponse.json({
      version: "1.0.0",
      versionCode: 1,
      apkUrl: "/updates/kaoyan-buddy.apk",
      releaseNotes: "新版本发布",
      minVersionCode: 1,
    });
  }
}
