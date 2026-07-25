import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { diagnoseResume, matchResumeToJd } from "@/lib/ai/resume";
import type { ResumeContent } from "@/lib/types";

const schema = z.object({
  resumeId: z.string(),
  jdText: z.string().optional(),
});

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "未登录" }, { status: 401 });
  try {
    const body = schema.parse(await req.json());
    const resume = await prisma.resume.findFirst({
      where: { id: body.resumeId, userId: user.id },
    });
    if (!resume) return NextResponse.json({ error: "简历不存在" }, { status: 404 });
    const content = JSON.parse(resume.contentJson) as ResumeContent;
    const diagnose = await diagnoseResume(content, resume.targetRole);
    let match = null;
    if (body.jdText?.trim()) {
      match = await matchResumeToJd(content, resume.targetRole, body.jdText.trim());
    }
    const result = { diagnose, match };
    const review = await prisma.resumeReview.create({
      data: {
        resumeId: resume.id,
        jdText: body.jdText?.trim() || null,
        resultJson: JSON.stringify(result),
        mode: diagnose.mode,
      },
    });
    return NextResponse.json({ reviewId: review.id, ...result });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "诊断失败" }, { status: 500 });
  }
}
