import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { parsePdfResumeText } from "@/lib/ai/resume";
import { extractPdfText } from "@/lib/pdf";
import { ROLE_PROFILES } from "@/lib/types";

export const runtime = "nodejs";

const MAX_BYTES = 8 * 1024 * 1024; // 8MB

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "未登录" }, { status: 401 });

  try {
    const form = await req.formData();
    const file = form.get("file");
    const resumeId = String(form.get("resumeId") || "");
    const targetRole =
      String(form.get("targetRole") || ROLE_PROFILES[0]) || ROLE_PROFILES[0];

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "请选择 PDF 文件" }, { status: 400 });
    }
    if (!file.name.toLowerCase().endsWith(".pdf") && file.type !== "application/pdf") {
      return NextResponse.json({ error: "仅支持 PDF 格式" }, { status: 400 });
    }
    if (file.size <= 0 || file.size > MAX_BYTES) {
      return NextResponse.json({ error: "PDF 需小于 8MB" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const rawText = await extractPdfText(buffer);
    if (!rawText || rawText.length < 20) {
      return NextResponse.json(
        { error: "未能从 PDF 提取到有效文字（可能是扫描件，请改用可复制文本的 PDF）" },
        { status: 400 },
      );
    }

    const parsed = await parsePdfResumeText(rawText, targetRole);
    const title = parsed.suggestedTitle || file.name.replace(/\.pdf$/i, "") || "PDF 导入简历";
    const content = {
      phone: parsed.phone || "",
      city: parsed.city || "",
      education: parsed.education || "",
      experience: parsed.experience || "",
      skills: parsed.skills || "",
      summary: parsed.summary || "",
    };

    let resume;
    if (resumeId) {
      const existing = await prisma.resume.findFirst({
        where: { id: resumeId, userId: user.id },
      });
      if (!existing) {
        return NextResponse.json({ error: "简历不存在" }, { status: 404 });
      }
      resume = await prisma.resume.update({
        where: { id: resumeId },
        data: {
          title,
          targetRole,
          contentJson: JSON.stringify(content),
          pdfFileName: file.name,
          rawText,
        },
      });
    } else {
      resume = await prisma.resume.create({
        data: {
          userId: user.id,
          title,
          targetRole,
          contentJson: JSON.stringify(content),
          pdfFileName: file.name,
          rawText,
        },
      });
    }

    const dir = path.join(process.cwd(), "uploads", "resumes", user.id);
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, `${resume.id}.pdf`), buffer);

    return NextResponse.json({
      resume: {
        ...resume,
        content,
      },
      parseMode: parsed.mode,
      textLength: rawText.length,
    });
  } catch (e) {
    console.error("upload-pdf", e);
    return NextResponse.json({ error: "PDF 解析失败，请换一份文件重试" }, { status: 500 });
  }
}
