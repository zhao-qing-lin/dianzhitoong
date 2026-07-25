"use client";

import { useEffect, useState } from "react";
import { ROLE_PROFILES, type InterviewReportResult } from "@/lib/types";

type Msg = { role: string; content: string };

export function InterviewRoom() {
  const [roleProfile, setRoleProfile] = useState<string>(ROLE_PROFILES[0]);
  const [round, setRound] = useState("一面");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [hint, setHint] = useState("");
  const [report, setReport] = useState<InterviewReportResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<{ id: string; roleProfile: string; status: string }[]>([]);

  async function loadHistory() {
    const res = await fetch("/api/interview");
    const data = await res.json();
    setHistory(data.sessions || []);
  }

  useEffect(() => {
    loadHistory();
  }, []);

  async function start() {
    setLoading(true);
    setReport(null);
    setMessages([]);
    const res = await fetch("/api/interview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roleProfile, round }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return;
    setSessionId(data.sessionId);
    setMessages([{ role: "assistant", content: data.message }]);
    setHint(data.hint || "");
    await loadHistory();
  }

  async function send() {
    if (!sessionId || !input.trim()) return;
    const content = input.trim();
    setInput("");
    setMessages((m) => [...m, { role: "user", content }]);
    setLoading(true);
    const res = await fetch(`/api/interview/${sessionId}/message`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return;
    setMessages((m) => [...m, { role: "assistant", content: data.message }]);
    setHint(data.hint || "");
    if (data.done) {
      setReport(data.report);
      await loadHistory();
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
      <section className="card p-5">
        <h1 className="font-display text-3xl">模拟面试</h1>
        <p className="mt-1 text-sm text-mist">零售门店场景题 · 约 5 轮后自动复盘</p>

        {!sessionId && (
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <label className="block">
              <span className="label">岗位画像</span>
              <select className="field" value={roleProfile} onChange={(e) => setRoleProfile(e.target.value)}>
                {ROLE_PROFILES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="label">轮次</span>
              <select className="field" value={round} onChange={(e) => setRound(e.target.value)}>
                {["一面", "二面", "终面"].map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </label>
            <button className="btn-primary md:col-span-2" onClick={start} disabled={loading}>
              开始模拟面试
            </button>
          </div>
        )}

        {sessionId && (
          <>
            <div className="mt-5 max-h-[420px] space-y-3 overflow-y-auto rounded-xl bg-sand/40 p-3">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`rounded-xl px-3 py-2 text-sm ${
                    m.role === "user" ? "ml-8 bg-brick text-white" : "mr-8 bg-white"
                  }`}
                >
                  <div className="mb-1 text-[10px] uppercase opacity-70">
                    {m.role === "user" ? "你" : "面试官"}
                  </div>
                  <div className="whitespace-pre-wrap">{m.content}</div>
                </div>
              ))}
            </div>
            {hint && !report && <p className="mt-2 text-xs text-moss">提示：{hint}</p>}
            {!report && (
              <div className="mt-3 flex gap-2">
                <textarea
                  className="field min-h-20"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="输入你的回答…"
                  disabled={loading}
                />
                <button className="btn-primary self-end" onClick={send} disabled={loading}>
                  发送
                </button>
              </div>
            )}
            {report && (
              <button className="btn-secondary mt-4" onClick={() => { setSessionId(null); setReport(null); setMessages([]); }}>
                再开一场
              </button>
            )}
          </>
        )}
      </section>

      <section className="space-y-4">
        {report ? (
          <div className="card p-5">
            <div className="flex items-end justify-between">
              <h2 className="font-display text-2xl">面试复盘</h2>
              <span className="font-display text-3xl text-brick">{report.overallScore}</span>
            </div>
            <p className="mt-2 text-sm">{report.summary}</p>
            <ul className="mt-4 space-y-2">
              {report.dimensions?.map((d, i) => (
                <li key={i} className="rounded-xl bg-sand/50 p-3 text-sm">
                  <div className="font-medium">
                    {d.name} · {d.score}
                  </div>
                  <div className="text-mist">{d.comment}</div>
                </li>
              ))}
            </ul>
            <div className="mt-4">
              <h3 className="text-sm font-medium">更好答法</h3>
              {report.betterAnswers?.map((b, i) => (
                <div key={i} className="mt-2 text-sm">
                  <div className="text-mist">Q: {b.question}</div>
                  <div>A: {b.sample}</div>
                </div>
              ))}
            </div>
            <ul className="mt-4 list-disc pl-5 text-sm">
              {report.nextPractice?.map((x, i) => (
                <li key={i}>{x}</li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="card p-5 text-sm text-mist">完成约 5 轮对话后，复盘会出现在这里。</div>
        )}

        <div className="card p-5">
          <h3 className="font-medium">历史练习</h3>
          <ul className="mt-3 space-y-2 text-sm">
            {history.length === 0 && <li className="text-mist">暂无</li>}
            {history.map((h) => (
              <li key={h.id} className="flex justify-between border-b border-stone-200/70 py-2">
                <span>{h.roleProfile}</span>
                <span className="text-mist">{h.status === "completed" ? "已复盘" : "进行中"}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
