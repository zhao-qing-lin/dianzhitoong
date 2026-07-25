import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { TRACK_LABEL } from "@/lib/ai/prompts/retail-service";

export default async function DashboardPage() {
  const user = await getSessionUser();
  if (!user) return null;
  const [resumeCount, appCount, interviewCount] = await Promise.all([
    prisma.resume.count({ where: { userId: user.id } }),
    prisma.application.count({ where: { userId: user.id } }),
    prisma.interviewSession.count({ where: { userId: user.id } }),
  ]);
  const activeApps = await prisma.application.count({
    where: {
      userId: user.id,
      status: { in: ["applied", "screening", "interview"] },
    },
  });

  const cards = [
    {
      href: "/app/resume",
      title: "简历可投",
      desc: "写零售岗简历，AI 诊断硬伤与改写建议",
      meta: `${resumeCount} 份简历`,
    },
    {
      href: "/app/applications",
      title: "投递可记",
      desc: "从想投到 offer，状态一眼看清",
      meta: `${appCount} 条记录 · ${activeApps} 进行中`,
    },
    {
      href: "/app/interview",
      title: "面试可练",
      desc: "门店场景多轮模拟，结束自动复盘",
      meta: `${interviewCount} 场练习`,
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <p className="text-sm text-moss">当前赛道 · {TRACK_LABEL}</p>
        <h1 className="mt-1 font-display text-4xl">求职工作台</h1>
        <p className="mt-2 text-mist">先把闭环跑通：一份能投的简历 → 几条真实投递 → 一场模拟面试。</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {cards.map((c) => (
          <Link key={c.href} href={c.href} className="card block p-5 transition hover:-translate-y-0.5">
            <div className="font-display text-2xl">{c.title}</div>
            <p className="mt-2 text-sm text-mist">{c.desc}</p>
            <p className="mt-4 text-sm font-medium text-brick">{c.meta}</p>
          </Link>
        ))}
      </div>
      {!process.env.OPENAI_API_KEY && (
        <p className="mt-6 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          未配置 OPENAI_API_KEY：AI 将以「演示模式」规则引擎输出，功能仍可完整体验。配置方法见 README。
        </p>
      )}
    </div>
  );
}
