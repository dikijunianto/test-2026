"use client";
import { useState } from "react";

interface SyncStatus { loading: boolean; result: { success: boolean; durationMs: number; error?: string } | null }

export default function AdminSyncPage() {
  const [status, setStatus] = useState<SyncStatus>({ loading: false, result: null });
  const [apiKey, setApiKey] = useState("");

  const handleSync = async () => {
    if (!apiKey.trim()) { alert("Please enter your API key"); return; }
    setStatus({ loading: true, result: null });
    try {
      const response = await fetch("/api/sync", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ apiKey: apiKey.trim() }) });
      const result = await response.json();
      setStatus({ loading: false, result });
    } catch { setStatus({ loading: false, result: { success: false, durationMs: 0, error: "Failed to connect" } }); }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8"><div className="mx-auto max-w-2xl"><h1 className="text-2xl font-bold mb-6">Admin - Sync Data</h1><div className="bg-white rounded-lg shadow p-6"><div className="mb-4"><label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-2">Football-Data.org API Key</label><input id="apiKey" type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="Enter your API key" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" /></div><button onClick={handleSync} disabled={status.loading} className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed">{status.loading ? "Syncing..." : "Sync Data"}</button>{status.result && (<div className={`mt-4 p-4 rounded-md ${status.result.success ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}>{status.result.success ? (<p>✅ Sync completed in {status.result.durationMs}ms</p>) : (<p>❌ Sync failed: {status.result.error}</p>)}</div>)}</div></div></div>
  );
}