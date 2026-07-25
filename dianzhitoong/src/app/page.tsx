import Link from "next/link";
import { getSessionUser } from "@/lib/auth";

export default async function HomePage() {
  const user = await getSessionUser();
  return (
    <main className="mx-auto min-h-screen max-w-5xl px-6 py-10">
      <header className="flex items-center justify-between">
        <div className="font-display text-2xl tracking-tight">店职通</div>
        <div className="flex gap-3">
          {user ? (
            <Link href="/app" className="btn-primary">
              进入工作台
            </Link>
          ) : (
            <>
              <Link href="/login" className="btn-secondary">
                登录
              </Link>
              <Link href="/register" className="btn-primary">
                开始使用
              </Link>
            </>
          )}
        </div>
      </header>

      <section className="mt-16 grid gap-10 md:grid-cols-[1.2fr_0.8fr] md:items-end">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-moss">Retail Career OS</p>
          <h1 className="mt-3 font-display text-5xl leading-tight md:text-6xl">
            把零售服务业求职
            <br />
            收成三步闭环
          </h1>
          <p className="mt-5 max-w-xl text-lg text-mist">
            面向优衣库一类门店 / 管培岗位：写能投的简历、管住投递进度、练会服务场景面试。
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={user ? "/app" : "/register"} className="btn-primary">
              {user ? "继续准备" : "免费注册"}
            </Link>
            <Link href="/login" className="btn-secondary">
              已有账号
            </Link>
          </div>
        </div>
        <div className="card relative overflow-hidden p-6">
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-brick/15" />
          <ol className="relative space-y-5">
            {[
              ["01", "简历可投", "结构化填写 + AI 诊断 / JD 匹配"],
              ["02", "投递可记", "看板跟踪从想投到 offer"],
              ["03", "面试可练", "门店场景多轮模拟与复盘"],
            ].map(([n, t, d]) => (
              <li key={n} className="flex gap-4">
                <span className="font-display text-2xl text-brick">{n}</span>
                <div>
                  <div className="font-medium">{t}</div>
                  <div className="text-sm text-mist">{d}</div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </main>
  );
}
