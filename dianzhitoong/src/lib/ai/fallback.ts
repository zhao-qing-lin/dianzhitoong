import type {
  DiagnoseResult,
  InterviewReportResult,
  JdMatchResult,
  ResumeContent,
} from "../types";
import { QUESTION_BANK } from "./prompts/retail-service";

export function fallbackDiagnose(
  content: ResumeContent,
  targetRole: string,
): DiagnoseResult {
  const issues: string[] = [];
  const strengths: string[] = [];
  if (!content.experience || content.experience.length < 40) {
    issues.push("经历描述偏短，缺少可量化结果（如客单价、陈列完成率、活动转化）。");
  } else {
    strengths.push("已有经历素材，可进一步用数字强化。");
  }
  if (!/顾客|服务|销售|团队|兼职|社团/.test(content.experience + content.summary)) {
    issues.push("未突出顾客服务/销售/协作关键词，零售岗匹配度会偏弱。");
  } else {
    strengths.push("已出现服务业相关关键词。");
  }
  if (!content.skills) issues.push("技能栏为空，可补充：收银系统、陈列、沟通、抗压、Office。");
  if (strengths.length === 0) strengths.push("结构完整，具备继续打磨的基础。");

  const score = Math.max(45, 78 - issues.length * 8);
  return {
    score,
    summary: `（演示模式）针对「${targetRole}」的规则诊断：先补齐经历量化与服务场景，再投递会更稳。`,
    strengths,
    issues,
    rewrites: [
      {
        original: content.summary?.slice(0, 40) || "自我评价过空",
        suggested:
          "大四学生，有门店/社团服务经历，擅长耐心接待与团队协作，能适应周末排班，希望从一线门店做起并成长为储备干部。",
        reason: "零售岗更吃稳定性、服务意识与成长意愿。",
      },
    ],
    nextActions: [
      "把每段经历改成：情境-任务-行动-结果（带数字）",
      "针对目标品牌官网 JD 补 2 条匹配技能",
      "准备 3 个客诉/协作故事用于面试",
    ],
    mode: "fallback",
  };
}

export function fallbackMatchJd(content: ResumeContent, jd: string): JdMatchResult {
  const keys = ["沟通", "服务", "销售", "抗压", "团队", "陈列", "收银", "排班"];
  const blob = `${content.experience} ${content.skills} ${content.summary}`;
  const matched = keys.filter((k) => blob.includes(k) || jd.includes(k) && blob.includes(k));
  const missing = keys.filter((k) => jd.includes(k) && !blob.includes(k)).slice(0, 5);
  return {
    matchScore: Math.min(90, 50 + matched.length * 8 - missing.length * 5),
    matched: matched.length ? matched : ["基础表达能力"],
    missing: missing.length ? missing : ["可量化业绩"],
    advice: [
      "把 JD 高频词自然写进经历，而不是堆砌关键词",
      "补充一次真实或接近真实的顾客服务案例",
    ],
    mode: "fallback",
  };
}

export function fallbackInterviewReply(turn: number, lastUser?: string) {
  const q = QUESTION_BANK[Math.min(turn, QUESTION_BANK.length - 1)];
  if (turn === 0) {
    return {
      reply: `你好，我是今天的门店面试官。先请你做个简短自我介绍，并说明为什么想来零售/服务业。\n\n参考题：${QUESTION_BANK[0]}`,
      done: false,
      hint: "控制在 60 秒，提到稳定出勤与服务意愿。",
    };
  }
  const done = turn >= 5;
  return {
    reply: done
      ? `好的，今天先到这里。你提到「${(lastUser || "").slice(0, 24)}…」有服务意识，结束后面我会给你复盘。`
      : `谢谢回答。我想再了解一下：${q}`,
    done,
    hint: done ? "" : "回答尽量用具体事例，而不是形容词。",
  };
}

export function fallbackInterviewReport(
  messages: { role: string; content: string }[],
): InterviewReportResult {
  const userTurns = messages.filter((m) => m.role === "user").length;
  const score = Math.min(88, 55 + userTurns * 5);
  return {
    overallScore: score,
    summary:
      "（演示模式）你完成了多轮门店向模拟面试。表达尚可，建议加强 STAR 与冲突处理细节。",
    dimensions: [
      { name: "表达清晰", score: score - 2, comment: "能回答问题，可再压缩废话。" },
      { name: "岗位匹配", score: score - 5, comment: "多关联门店日常场景。" },
      { name: "服务意识", score: score, comment: "有顾客导向意识即可继续强化案例。" },
      { name: "抗压协作", score: score - 8, comment: "排班冲突/同事协作题可更具体。" },
      { name: "STAR结构", score: score - 10, comment: "结果数字偏少。" },
    ],
    betterAnswers: [
      {
        question: "顾客激动退换货怎么处理？",
        sample:
          "先安抚情绪→核对小票与商品状态→按门店政策说明方案→必要时升级店长→记录并复盘，保证顾客被尊重且合规。",
      },
    ],
    nextPractice: [
      "每天练 1 个客诉题，计时 90 秒",
      "准备 3 个带数字的兼职/社团结果",
    ],
    mode: "fallback",
  };
}
