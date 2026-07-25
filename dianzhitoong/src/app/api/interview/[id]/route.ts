import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "未登录" }, { status: 401 });
  const { id } = await params;
  const session = await prisma.interviewSession.findFirst({
    where: { id, userId: user.id },
    include: {
      messages: { orderBy: { createdAt: "asc" } },
      report: true,
    },
  });
  if (!session) return NextResponse.json({ error: "不存在" }, { status: 404 });
  return NextResponse.json({
    session: {
      ...session,
      report: session.report
        ? { ...session.report, result: JSON.parse(session.report.resultJson) }
        : null,
    },
  });
}
