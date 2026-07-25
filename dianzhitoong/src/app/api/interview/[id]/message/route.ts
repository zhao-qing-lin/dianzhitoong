import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { buildInterviewReport, nextInterviewTurn } from "@/lib/ai/interview";

const schema = z.object({
  content: z.string().min(1),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "未登录" }, { status: 401 });
  const { id } = await params;
  const session = await prisma.interviewSession.findFirst({
    where: { id, userId: user.id },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });
  if (!session) return NextResponse.json({ error: "会话不存在" }, { status: 404 });
  if (session.status !== "active") {
    return NextResponse.json({ error: "会话已结束" }, { status: 400 });
  }

  try {
    const body = schema.parse(await req.json());
    await prisma.interviewMessage.create({
      data: { sessionId: id, role: "user", content: body.content },
    });
    const history = [
      ...session.messages.map((m) => ({ role: m.role, content: m.content })),
      { role: "user", content: body.content },
    ];
    const userTurns = history.filter((m) => m.role === "user").length;
    const turn = await nextInterviewTurn({
      roleProfile: session.roleProfile,
      round: session.round,
      turn: userTurns,
      history,
      lastUser: body.content,
    });
    await prisma.interviewMessage.create({
      data: { sessionId: id, role: "assistant", content: turn.reply },
    });

    let report = null;
    if (turn.done || userTurns >= 5) {
      const all = [
        ...history,
        { role: "assistant", content: turn.reply },
      ];
      const result = await buildInterviewReport(session.roleProfile, all);
      report = await prisma.interviewReport.create({
        data: {
          sessionId: id,
          resultJson: JSON.stringify(result),
          mode: result.mode,
        },
      });
      await prisma.interviewSession.update({
        where: { id },
        data: { status: "completed" },
      });
      return NextResponse.json({
        message: turn.reply,
        hint: turn.hint,
        done: true,
        report: result,
        reportId: report.id,
      });
    }

    return NextResponse.json({
      message: turn.reply,
      hint: turn.hint,
      done: false,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "发送失败" }, { status: 500 });
  }
}
