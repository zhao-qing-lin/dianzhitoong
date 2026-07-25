"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch(`/api/auth/${mode}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "失败了，请重试");
      return;
    }
    router.push("/app");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="card mx-auto mt-16 w-full max-w-md p-8">
      <h1 className="font-display text-3xl">
        {mode === "login" ? "登录店职通" : "创建账号"}
      </h1>
      <p className="mt-2 text-sm text-mist">零售 / 服务业求职工作台</p>
      {mode === "register" && (
        <label className="mt-6 block">
          <span className="label">昵称</span>
          <input className="field" value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
      )}
      <label className="mt-4 block">
        <span className="label">邮箱</span>
        <input
          className="field"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </label>
      <label className="mt-4 block">
        <span className="label">密码（至少 6 位）</span>
        <input
          className="field"
          type="password"
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </label>
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      <button className="btn-primary mt-6 w-full" disabled={loading}>
        {loading ? "提交中…" : mode === "login" ? "登录" : "注册并进入"}
      </button>
      <p className="mt-4 text-center text-sm text-mist">
        {mode === "login" ? (
          <>
            还没有账号？ <Link href="/register">去注册</Link>
          </>
        ) : (
          <>
            已有账号？ <Link href="/login">去登录</Link>
          </>
        )}
      </p>
    </form>
  );
}
