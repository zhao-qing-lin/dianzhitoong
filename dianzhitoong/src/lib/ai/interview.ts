import type { InterviewReportResult } from "../types";
import { chatJson } from "./client";
import { fallbackInterviewReply, fallbackInterviewReport } from "./fallback";
import {
  INTERVIEW_REPORT_PROMPT,
  INTERVIEW_TURN_PROMPT,
} from "./prompts/retail-service";

export async function nextInterviewTurn(input: {
  roleProfile: string;
  round: string;
  turn: number;
  history: { role: string; content: string }[];
  lastUser?: string;
}) {
  const user = JSON.stringify(input, null, 2);
  const ai = await chatJson<{ reply: string; done?: boolean; hint?: string }>(
    INTERVIEW_TURN_PROMPT,
    user,
  );
  if (!ai?.reply) {
    return fallbackInterviewReply(input.turn, input.lastUser);
  }
  return {
    reply: ai.reply,
    done: Boolean(ai.done),
    hint: ai.hint || "",
  };
}

export async function buildInterviewReport(
  roleProfile: string,
  messages: { role: string; content: string }[],
): Promise<InterviewReportResult> {
  const user = JSON.stringify({ roleProfile, messages }, null, 2);
  const ai = await chatJson<Omit<InterviewReportResult, "mode">>(
    INTERVIEW_REPORT_PROMPT,
    user,
  );
  if (!ai || typeof ai.overallScore !== "number") {
    return fallbackInterviewReport(messages);
  }
  return { ...ai, mode: "ai" };
}
