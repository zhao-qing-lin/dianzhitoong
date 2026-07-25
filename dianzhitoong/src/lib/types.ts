export type ResumeContent = {
  phone?: string;
  city?: string;
  education: string;
  experience: string;
  skills: string;
  summary: string;
};

export type DiagnoseResult = {
  score: number;
  summary: string;
  strengths: string[];
  issues: string[];
  rewrites: { original: string; suggested: string; reason: string }[];
  nextActions: string[];
  mode: "ai" | "fallback";
};

export type JdMatchResult = {
  matchScore: number;
  matched: string[];
  missing: string[];
  advice: string[];
  mode: "ai" | "fallback";
};

export type InterviewReportResult = {
  overallScore: number;
  summary: string;
  dimensions: { name: string; score: number; comment: string }[];
  betterAnswers: { question: string; sample: string }[];
  nextPractice: string[];
  mode: "ai" | "fallback";
};

export const APP_STATUSES = [
  "wishlist",
  "applied",
  "screening",
  "interview",
  "offer",
  "rejected",
  "withdrawn",
] as const;

export type AppStatus = (typeof APP_STATUSES)[number];

export const STATUS_LABEL: Record<AppStatus, string> = {
  wishlist: "想投",
  applied: "已投递",
  screening: "筛选中",
  interview: "面试中",
  offer: "拿 offer",
  rejected: "已拒",
  withdrawn: "已撤回",
};

export const ROLE_PROFILES = [
  "门店销售/导购",
  "门店兼职",
  "储备干部/管培生",
  "客服专员",
  "陈列/视觉助理",
] as const;
