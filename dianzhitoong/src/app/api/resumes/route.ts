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

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "未登录" }, { status: 401 });
  const resumes = await prisma.resume.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
    include: { reviews: { orderBy: { createdAt: "desc" }, take: 1 } },
  });
  return NextResponse.json({
    resumes: resumes.map((r) => ({
      ...r,
      content: JSON.parse(r.contentJson),
      latestReview: r.reviews[0]
        ? { ...r.reviews[0], result: JSON.parse(r.reviews[0].resultJson) }
        : null,
    })),
  });
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "未登录" }, { status: 401 });
  try {
    const body = schema.parse(await req.json());
    const resume = await prisma.resume.create({
      data: {
        userId: user.id,
        title: body.title,
        targetRole: body.targetRole,
        contentJson: JSON.stringify(body.content),
      },
    });
    return NextResponse.json({ resume });
  } catch {
    return NextResponse.json({ error: "保存失败" }, { status: 400 });
  }
}
