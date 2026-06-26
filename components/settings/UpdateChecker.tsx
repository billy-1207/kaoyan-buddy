"use client";
import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";

interface VersionInfo {
  version: string;
  versionCode: number;
  apkUrl: string;
  releaseNotes: string;
}

const CURRENT_VERSION_CODE = 24;
const GITHUB_VERSION_URL =
  "https://raw.githubusercontent.com/billy-1207/kaoyan-buddy/master/version.json";

export function UpdateChecker() {
  const [checking, setChecking] = useState(false);
  const [update, setUpdate] = useState<VersionInfo | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const checkForUpdates = useCallback(async () => {
    setChecking(true);
    setError("");
    setUpdate(null);

    try {
      const res = await fetch(GITHUB_VERSION_URL, {
        signal: AbortSignal.timeout(10000),
      });

      if (!res.ok) throw new Error("服务器无响应");

      const info: VersionInfo = await res.json();

      if (info.versionCode > CURRENT_VERSION_CODE) {
        setUpdate(info);
      } else {
        setMessage("✅ 已是最新版本 v" + info.version + " (build " + info.versionCode + ")");
        setTimeout(() => setMessage(""), 3000);
      }
    } catch {
      // Fallback: try local server
      try {
        const serverUrl = localStorage.getItem("kaoyan_server_url");
        if (serverUrl) {
          const res = await fetch(`${serverUrl}/api/version`, {
            signal: AbortSignal.timeout(5000),
          });
          if (res.ok) {
            const info: VersionInfo = await res.json();
            if (info.versionCode > CURRENT_VERSION_CODE) {
              setUpdate(info);
            } else {
              setMessage("✅ 已是最新版本 v" + info.version);
              setTimeout(() => setMessage(""), 3000);
            }
            return;
          }
        }
      } catch {}
      setError("无法连接更新服务器。请检查网络连接。");
    } finally {
      setChecking(false);
    }
  }, []);

  const handleDownload = () => {
    if (!update) return;
    // Use an invisible <a> tag to trigger Android Download Manager
    const a = document.createElement("a");
    a.href = update.apkUrl;
    a.download = "kaoyan-buddy.apk";
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setMessage("📥 下载开始，完成后下滑通知栏点击安装");
    setTimeout(() => setMessage(""), 6000);
  };

  return (
    <div className="space-y-4">
      <h3 className="font-bold text-primary">🔄 检查更新</h3>

      <div className="flex items-center gap-3 flex-wrap">
        <Button
          onClick={checkForUpdates}
          disabled={checking}
          variant="outline"
          className="text-sm"
        >
          {checking ? "⏳ 检查中..." : "🔍 检查新版本"}
        </Button>
        <span className="text-xs text-muted">当前版本: build {CURRENT_VERSION_CODE}</span>
      </div>

      {message && (
        <p className="text-sm text-success bg-success/5 rounded-lg px-3 py-2">
          {message}
        </p>
      )}

      {error && (
        <p className="text-sm text-warn bg-warn/5 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      {update && (
        <div className="bg-accent/10 rounded-xl p-4 border border-accent/30 space-y-3 animate-fade-in">
          <div>
            <p className="font-bold text-accent text-lg">
              🎉 发现新版本 v{update.version}
            </p>
            <p className="text-sm text-muted mt-1">{update.releaseNotes}</p>
            <p className="text-xs text-muted mt-2">
              Build {update.versionCode} → 当前 Build {CURRENT_VERSION_CODE}
            </p>
          </div>
          <Button
            onClick={handleDownload}
            className="bg-accent hover:bg-accent-light text-white w-full"
          >
            📥 下载并安装更新
          </Button>
        </div>
      )}

      <p className="text-xs text-muted">
        💡 更新从 GitHub 直接下载，无需电脑在线
      </p>
    </div>
  );
}
