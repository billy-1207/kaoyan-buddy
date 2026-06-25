"use client";
import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";

interface VersionInfo {
  version: string;
  versionCode: number;
  apkUrl: string;
  releaseNotes: string;
}

const CURRENT_VERSION_CODE = 1;

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
      const serverUrl = localStorage.getItem("kaoyan_server_url") ||
        `http://${window.location.hostname}:3001`;

      const res = await fetch(`${serverUrl}/api/version`, {
        signal: AbortSignal.timeout(5000),
      });

      if (!res.ok) throw new Error("服务器无响应");

      const info: VersionInfo = await res.json();

      if (info.versionCode > CURRENT_VERSION_CODE) {
        setUpdate(info);
      } else {
        setMessage("✅ 已是最新版本 v" + info.version);
        setTimeout(() => setMessage(""), 3000);
      }
    } catch {
      setError("无法连接更新服务器。请确保电脑端正在运行且连同一 WiFi。");
    } finally {
      setChecking(false);
    }
  }, []);

  const handleDownload = () => {
    if (!update) return;
    const serverUrl = localStorage.getItem("kaoyan_server_url") ||
      `http://${window.location.hostname}:3001`;
    const apkUrl = `${serverUrl}${update.apkUrl}`;

    // Open download URL - Android will download and prompt to install
    window.open(apkUrl, "_blank");
    setMessage("📥 下载已开始。请在通知栏查看进度，下载完成后点击安装。");
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
        <span className="text-xs text-muted">当前版本: v1.0.0</span>
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
        💡 App 的新版本通过电脑端分发。电脑开启服务器且连同一 WiFi 即可检查更新。
      </p>
    </div>
  );
}
