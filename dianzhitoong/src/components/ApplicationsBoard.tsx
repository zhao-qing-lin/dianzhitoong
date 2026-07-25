"use client";

import { useEffect, useState } from "react";
import { APP_STATUSES, STATUS_LABEL, type AppStatus } from "@/lib/types";

type AppRow = {
  id: string;
  company: string;
  role: string;
  channel: string;
  status: AppStatus;
  nextAction: string | null;
  notes: string | null;
};

export function ApplicationsBoard() {
  const [rows, setRows] = useState<AppRow[]>([]);
  const [stats, setStats] = useState<Record<string, number>>({});
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("门店销售/导购");
  const [channel, setChannel] = useState("官网/校招");
  const [notes, setNotes] = useState("");
  const [msg, setMsg] = useState("");

  async function load() {
    const res = await fetch("/api/applications");
    const data = await res.json();
    setRows(data.applications || []);
    setStats(data.stats || {});
  }

  useEffect(() => {
    load();
  }, []);

  async function create() {
    if (!company.trim()) return;
    const res = await fetch("/api/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ company, role, channel, status: "wishlist", notes }),
    });
    if (!res.ok) {
      setMsg("创建失败");
      return;
    }
    setCompany("");
    setNotes("");
    setMsg("已添加");
    await load();
  }

  async function updateStatus(id: string, status: AppStatus) {
    await fetch(`/api/applications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    await load();
  }

  async function remove(id: string) {
    await fetch(`/api/applications/${id}`, { method: "DELETE" });
    await load();
  }

  return (
    <div>
      <h1 className="font-display text-3xl">投递看板</h1>
      <p className="mt-1 text-sm text-mist">记录优衣库等零售品牌的投递进度，避免海投失控。</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {APP_STATUSES.map((s) => (
          <span key={s} className="rounded-full bg-white/80 px-3 py-1 text-xs border border-stone-200">
            {STATUS_LABEL[s]} {stats[s] || 0}
          </span>
        ))}
      </div>

      <div className="card mt-6 grid gap-3 p-5 md:grid-cols-4">
        <input className="field" placeholder="公司，如 优衣库" value={company} onChange={(e) => setCompany(e.target.value)} />
        <input className="field" placeholder="岗位" value={role} onChange={(e) => setRole(e.target.value)} />
        <input className="field" placeholder="渠道" value={channel} onChange={(e) => setChannel(e.target.value)} />
        <button className="btn-primary" onClick={create}>
          添加投递
        </button>
        <textarea
          className="field md:col-span-4 min-h-16"
          placeholder="备注（网申截止日、内推人等）"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
        {msg && <p className="text-sm text-moss md:col-span-4">{msg}</p>}
      </div>

      <div className="mt-6 space-y-3">
        {rows.length === 0 && (
          <div className="card p-5 text-sm text-mist">还没有投递记录。先加 1 条「想投」的公司吧。</div>
        )}
        {rows.map((r) => (
          <div key={r.id} className="card flex flex-wrap items-start justify-between gap-3 p-4">
            <div>
              <div className="font-medium">
                {r.company} · {r.role}
              </div>
              <div className="mt-1 text-xs text-mist">
                {r.channel}
                {r.notes ? ` · ${r.notes}` : ""}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <select
                className="field !w-auto"
                value={r.status}
                onChange={(e) => updateStatus(r.id, e.target.value as AppStatus)}
              >
                {APP_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABEL[s]}
                  </option>
                ))}
              </select>
              <button className="btn-secondary !py-2 text-sm" onClick={() => remove(r.id)}>
                删除
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
