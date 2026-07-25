import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { hashPassword, setSession } from "@/lib/auth";

const schema = z.object({
  name: z.string().min(1).max(40),
  email: z.string().email(),
  password: z.string().min(6).max(72),
});

export async function POST(req: Request) {
  try {
    const body = schema.parse(await req.json());
    const exists = await prisma.user.findUnique({ where: { email: body.email } });
    if (exists) {
      return NextResponse.json({ error: "该邮箱已注册" }, { status: 400 });
    }
    const user = await prisma.user.create({
      data: {
        name: body.name,
        email: body.email.toLowerCase(),
        passwordHash: await hashPassword(body.password),
        trackId: "retail-service",
      },
    });
    await setSession(user.id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "请检查输入", detail: e.flatten() }, { status: 400 });
    }
    const message = e instanceof Error ? e.message : "注册失败";
    console.error("register error", e);
    return NextResponse.json({ error: "注册失败", detail: message }, { status: 500 });
  }
}
