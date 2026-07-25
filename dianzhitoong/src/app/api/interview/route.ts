import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { nextInterviewTurn } from "@/lib/ai/interview";

const schema = z.object({
  roleProfile: z.string().min(1),
  round: z.string().default("一面"),
});

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "未登录" }, { status: 401 });
  const sessions = await prisma.interviewSession.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { report: true },
    take: 20,
  });
  return NextResponse.json({ sessions });
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "未登录" }, { status: 401 });
  try {
    const body = schema.parse(await req.json());
    const session = await prisma.interviewSession.create({
      data: {
        userId: user.id,
        roleProfile: body.roleProfile,
        round: body.round,
      },
    });
    const turn = await nextInterviewTurn({
      roleProfile: body.roleProfile,
      round: body.round,
      turn: 0,
      history: [],
    });
    await prisma.interviewMessage.create({
      data: {
        sessionId: session.id,
        role: "assistant",
        content: turn.reply,
      },
    });
    return NextResponse.json({
      sessionId: session.id,
      message: turn.reply,
      hint: turn.hint,
    });
  } catch {
    return NextResponse.json({ error: "创建失败" }, { status: 400 });
  }
}
