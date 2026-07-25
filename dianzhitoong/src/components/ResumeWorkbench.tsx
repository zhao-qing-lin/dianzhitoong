"use client";

import { useEffect, useState } from "react";
import { ROLE_PROFILES, type DiagnoseResult, type JdMatchResult, type ResumeContent } from "@/lib/types";

type ResumeRow = {
  id: string;
  title: string;
  targetRole: string;
  content: ResumeContent;
  pdfFileName?: string | null;
  latestReview?: {
    result: { diagnose: DiagnoseResult; match: JdMatchResult | null };
  } | null;
};

const empty: ResumeContent = {
  phone: "",
  city: "",
  education: "",
  experience: "",
  skills: "",
  summary: "",
};

export function ResumeWorkbench() {
  const [resumes, setResumes] = useState<ResumeRow[]>([]);
  const [id, setId] = useState<string | null>(null);
  const [title, setTitle] = useState("我的零售岗简历");
  const [targetRole, setTargetRole] = useState<string>(ROLE_PROFILES[0]);
  const [content, setContent] = useState<ResumeContent>(empty);
  const [jdText, setJdText] = useState("");
  const [diagnose, setDiagnose] = useState<DiagnoseResult | null>(null);
  const [match, setMatch] = useState<JdMatchResult | null>(null);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [pdfName, setPdfName] = useState("");
  const [uploading, setUploading] = useState(false);

  async function load() {
    const res = await fetch("/api/resumes");
    const data = await res.json();
    setResumes(data.resumes || []);
    if (data.resumes?.[0] && !id) {
      const r = data.resumes[0] as ResumeRow;
      setId(r.id);
      setTitle(r.title);
      setTargetRole(r.targetRole);
      setContent(r.content);
      setPdfName(r.pdfFileName || "");
      setDiagnose(r.latestReview?.result.diagnose || null);
      setMatch(r.latestReview?.result.match || null);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function save() {
    setLoading(true);
    setMsg("");
    const payload = { title, targetRole, content };
    const res = await fetch(id ? `/api/resumes/${id}` : "/api/resumes", {
      method: id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setMsg(data.error || "保存失败");
      return;
    }
    setId(data.resume.id);
    setMsg("已保存");
    await load();
  }

  async function runDiagnose() {
    if (!id) {
      await save();
    }
    const currentId = id;
    if (!currentId && !id) {
      // save just set id async; refetch
    }
    setLoading(true);
    setMsg("");
    let resumeId = id;
    if (!resumeId) {
      const res = await fetch("/api/resumes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, targetRole, content }),
      });
      const data = await res.json();
      if (!res.ok) {
        setLoading(false);
        setMsg(data.error || "请先保存");
        return;
      }
      resumeId = data.resume.id;
      setId(resumeId);
    } else {
      await fetch(`/api/resumes/${resumeId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, targetRole, content }),
      });
    }
    const res = await fetch("/api/ai/resume/diagnose", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resumeId, jdText }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setMsg(data.error || "诊断失败");
      return;
    }
    setDiagnose(data.diagnose);
    setMatch(data.match);
    setMsg(data.diagnose.mode === "fallback" ? "诊断完成（演示模式）" : "诊断完成（AI）");
    await load();
  }

  function setField<K extends keyof ResumeContent>(key: K, value: ResumeContent[K]) {
    setContent((c) => ({ ...c, [key]: value }));
  }

  async function uploadPdf(file: File | null) {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setMsg("请上传 PDF 文件");
      return;
    }
    setUploading(true);
    setMsg("正在解析 PDF…");
    const form = new FormData();
    form.append("file", file);
    form.append("targetRole", targetRole);
    if (id) form.append("resumeId", id);
    const res = await fetch("/api/resumes/upload-pdf", {
      method: "POST",
      body: form,
    });
    const data = await res.json();
    setUploading(false);
    if (!res.ok) {
      setMsg(data.error || "上传失败");
      return;
    }
    setId(data.resume.id);
    setTitle(data.resume.title);
    setTargetRole(data.resume.targetRole);
    setContent(data.resume.content);
    setPdfName(data.resume.pdfFileName || file.name);
    setDiagnose(null);
    setMatch(null);
    setMsg(
      data.parseMode === "ai"
        ? `已导入「${file.name}」，字段已自动填充，请核对后保存/诊断`
        : `已导入「${file.name}」（规则解析），请核对并补全字段`,
    );
    await load();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="card p-5">
        <h1 className="font-display text-3xl">简历工作台</h1>
        <p className="mt-1 text-sm text-mist">面向优衣库一类门店 / 管培岗位</p>

        <div className="mt-5 rounded-2xl border border-dashed border-stone-300 bg-sand/40 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="font-medium">上传 PDF 简历</div>
              <p className="mt-1 text-xs text-mist">
                支持可复制文字的 PDF（≤8MB），自动抽取并填充下方字段
              </p>
              {pdfName && (
                <p className="mt-1 text-xs text-moss">当前文件：{pdfName}</p>
              )}
            </div>
            <label className="btn-secondary cursor-pointer !py-2">
              {uploading ? "解析中…" : "选择 PDF"}
              <input
                type="file"
                accept="application/pdf,.pdf"
                className="hidden"
                disabled={uploading || loading}
                onChange={(e) => {
                  const f = e.target.files?.[0] || null;
                  e.target.value = "";
                  void uploadPdf(f);
                }}
              />
            </label>
          </div>
        </div>

        <label className="mt-5 block">
          <span className="label">简历标题</span>
          <input className="field" value={title} onChange={(e) => setTitle(e.target.value)} />
        </label>
        <label className="mt-3 block">
          <span className="label">目标岗位</span>
          <select className="field" value={targetRole} onChange={(e) => setTargetRole(e.target.value)}>
            {ROLE_PROFILES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </label>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <label className="block">
            <span className="label">手机</span>
            <input className="field" value={content.phone || ""} onChange={(e) => setField("phone", e.target.value)} />
          </label>
          <label className="block">
            <span className="label">城市</span>
            <input className="field" value={content.city || ""} onChange={(e) => setField("city", e.target.value)} />
          </label>
        </div>
        <label className="mt-3 block">
          <span className="label">教育背景</span>
          <textarea className="field min-h-20" value={content.education} onChange={(e) => setField("education", e.target.value)} />
        </label>
        <label className="mt-3 block">
          <span className="label">经历（兼职/社团/实习）</span>
          <textarea className="field min-h-32" value={content.experience} onChange={(e) => setField("experience", e.target.value)} placeholder="尽量写：做了什么、服务了谁、结果数字是什么" />
        </label>
        <label className="mt-3 block">
          <span className="label">技能</span>
          <textarea className="field min-h-16" value={content.skills} onChange={(e) => setField("skills", e.target.value)} />
        </label>
        <label className="mt-3 block">
          <span className="label">自我评价</span>
          <textarea className="field min-h-20" value={content.summary} onChange={(e) => setField("summary", e.target.value)} />
        </label>
        <label className="mt-3 block">
          <span className="label">可选：粘贴 JD 做匹配</span>
          <textarea className="field min-h-24" value={jdText} onChange={(e) => setJdText(e.target.value)} placeholder="从品牌校招页复制岗位要求…" />
        </label>

        <div className="mt-4 flex flex-wrap gap-3">
          <button className="btn-secondary" onClick={save} disabled={loading}>
            保存
          </button>
          <button className="btn-primary" onClick={runDiagnose} disabled={loading}>
            {loading ? "处理中…" : "AI 诊断"}
          </button>
        </div>
        {msg && <p className="mt-3 text-sm text-moss">{msg}</p>}
        {resumes.length > 1 && (
          <div className="mt-4 text-sm text-mist">
            已有 {resumes.length} 份简历（当前编辑最新一份）
          </div>
        )}
      </section>

      <section className="space-y-4">
        {diagnose ? (
          <div className="card p-5">
            <div className="flex items-end justify-between">
              <h2 className="font-display text-2xl">诊断报告</h2>
              <span className="text-3xl font-display text-brick">{diagnose.score}</span>
            </div>
            <p className="mt-2 text-sm">{diagnose.summary}</p>
            <p className="mt-1 text-xs text-mist">模式：{diagnose.mode === "ai" ? "大模型" : "演示降级"}</p>
            <Block title="优点" items={diagnose.strengths} />
            <Block title="问题" items={diagnose.issues} />
            <div className="mt-4">
              <h3 className="text-sm font-medium">改写建议</h3>
              <ul className="mt-2 space-y-3">
                {diagnose.rewrites?.map((r, i) => (
                  <li key={i} className="rounded-xl bg-sand/60 p-3 text-sm">
                    <div className="text-mist">原文：{r.original}</div>
                    <div className="mt-1">建议：{r.suggested}</div>
                    <div className="mt-1 text-mist">{r.reason}</div>
                  </li>
                ))}
              </ul>
            </div>
            <Block title="下一步" items={diagnose.nextActions} />
          </div>
        ) : (
          <div className="card p-5 text-sm text-mist">保存简历后点击「AI 诊断」，报告会显示在这里。</div>
        )}
        {match && (
          <div className="card p-5">
            <h2 className="font-display text-2xl">JD 匹配 · {match.matchScore}</h2>
            <Block title="已匹配" items={match.matched} />
            <Block title="缺口" items={match.missing} />
            <Block title="建议" items={match.advice} />
          </div>
        )}
      </section>
    </div>
  );
}

function Block({ title, items }: { title: string; items?: string[] }) {
  if (!items?.length) return null;
  return (
    <div className="mt-4">
      <h3 className="text-sm font-medium">{title}</h3>
      <ul className="mt-1 list-disc space-y-1 pl-5 text-sm">
        {items.map((x, i) => (
          <li key={i}>{x}</li>
        ))}
      </ul>
    </div>
  );
}
