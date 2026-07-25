import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

const schema = z.object({
  title: z.string().min(1),
  targetRole: z.string().min(1),
  content: z.object({
    phone: z.string().optional(),
    city: z.string().optional(),
    education: z.string(),
    experience: z.string(),
    skills: z.string(),
    summary: z.string(),
  }),
});

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "未登录" }, { status: 401 });
  const { id } = await params;
  const existing = await prisma.resume.findFirst({ where: { id, userId: user.id } });
  if (!existing) return NextResponse.json({ error: "不存在" }, { status: 404 });
  try {
    const body = schema.parse(await req.json());
    const resume = await prisma.resume.update({
      where: { id },
      data: {
        title: body.title,
        targetRole: body.targetRole,
        contentJson: JSON.stringify(body.content),
      },
    });
    return NextResponse.json({ resume });
  } catch {
    return NextResponse.json({ error: "更新失败" }, { status: 400 });
  }
}
