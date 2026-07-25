import type { DiagnoseResult, JdMatchResult, ResumeContent } from "../types";
import { chatJson } from "./client";
import { fallbackDiagnose, fallbackMatchJd } from "./fallback";
import {
  DIAGNOSE_PROMPT,
  MATCH_JD_PROMPT,
  PARSE_PDF_PROMPT,
} from "./prompts/retail-service";

export async function diagnoseResume(
  content: ResumeContent,
  targetRole: string,
): Promise<DiagnoseResult> {
  const user = JSON.stringify({ targetRole, resume: content }, null, 2);
  const ai = await chatJson<Omit<DiagnoseResult, "mode">>(DIAGNOSE_PROMPT, user);
  if (!ai || typeof ai.score !== "number") return fallbackDiagnose(content, targetRole);
  return { ...ai, mode: "ai" };
}

export async function matchResumeToJd(
  content: ResumeContent,
  targetRole: string,
  jdText: string,
): Promise<JdMatchResult> {
  const user = JSON.stringify({ targetRole, resume: content, jdText }, null, 2);
  const ai = await chatJson<Omit<JdMatchResult, "mode">>(MATCH_JD_PROMPT, user);
  if (!ai || typeof ai.matchScore !== "number") return fallbackMatchJd(content, jdText);
  return { ...ai, mode: "ai" };
}

export type ParsedPdfResume = ResumeContent & {
  suggestedTitle?: string;
  mode: "ai" | "fallback";
};

function fallbackParsePdf(rawText: string): ParsedPdfResume {
  const phone = rawText.match(/1[3-9]\d{9}/)?.[0] || "";
  const city =
    rawText.match(/(北京|上海|广州|深圳|杭州|南京|成都|武汉|西安|重庆|苏州|天津|长沙|郑州|青岛)/)?.[0] ||
    "";
  const educationMatch = rawText.match(
    /(?:教育|学历|院校)[^\n]{0,8}\n?([\s\S]{10,220}?)(?:\n(?:经历|实习|工作|项目|技能)|$)/i,
  );
  return {
    phone,
    city,
    education: (educationMatch?.[1] || "").trim().slice(0, 500),
    experience: rawText.slice(0, 2500),
    skills: "",
    summary: "根据 PDF 原文整理，请核对并补充技能与自我评价。",
    suggestedTitle: "PDF 导入简历",
    mode: "fallback",
  };
}

export async function parsePdfResumeText(
  rawText: string,
  targetRole: string,
): Promise<ParsedPdfResume> {
  const clipped = rawText.slice(0, 12000);
  const user = JSON.stringify({ targetRole, pdfText: clipped }, null, 2);
  const ai = await chatJson<ResumeContent & { suggestedTitle?: string }>(
    PARSE_PDF_PROMPT,
    user,
  );
  if (!ai || typeof ai.experience !== "string") {
    return fallbackParsePdf(clipped);
  }
  return {
    phone: ai.phone || "",
    city: ai.city || "",
    education: ai.education || "",
    experience: ai.experience || "",
    skills: ai.skills || "",
    summary: ai.summary || "",
    suggestedTitle: ai.suggestedTitle || "PDF 导入简历",
    mode: "ai",
  };
}
