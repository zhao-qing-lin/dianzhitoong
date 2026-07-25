import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { APP_STATUSES } from "@/lib/types";

const schema = z.object({
  company: z.string().min(1).optional(),
  role: z.string().min(1).optional(),
  channel: z.string().optional(),
  status: z.enum(APP_STATUSES).optional(),
  nextAction: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "未登录" }, { status: 401 });
  const { id } = await params;
  const existing = await prisma.application.findFirst({
    where: { id, userId: user.id },
  });
  if (!existing) return NextResponse.json({ error: "不存在" }, { status: 404 });
  try {
    const body = schema.parse(await req.json());
    const application = await prisma.application.update({
      where: { id },
      data: body,
    });
    return NextResponse.json({ application });
  } catch {
    return NextResponse.json({ error: "更新失败" }, { status: 400 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "未登录" }, { status: 401 });
  const { id } = await params;
  const existing = await prisma.application.findFirst({
    where: { id, userId: user.id },
  });
  if (!existing) return NextResponse.json({ error: "不存在" }, { status: 404 });
  await prisma.application.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
