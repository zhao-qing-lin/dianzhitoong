import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { APP_STATUSES } from "@/lib/types";

const schema = z.object({
  company: z.string().min(1),
  role: z.string().min(1),
  channel: z.string().default("官网/校招"),
  status: z.enum(APP_STATUSES).default("wishlist"),
  nextAction: z.string().optional(),
  notes: z.string().optional(),
});

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "未登录" }, { status: 401 });
  const applications = await prisma.application.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
  });
  const stats = APP_STATUSES.reduce(
    (acc, s) => {
      acc[s] = applications.filter((a) => a.status === s).length;
      return acc;
    },
    {} as Record<string, number>,
  );
  return NextResponse.json({ applications, stats });
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "未登录" }, { status: 401 });
  try {
    const body = schema.parse(await req.json());
    const application = await prisma.application.create({
      data: { ...body, userId: user.id },
    });
    return NextResponse.json({ application });
  } catch {
    return NextResponse.json({ error: "创建失败" }, { status: 400 });
  }
}
