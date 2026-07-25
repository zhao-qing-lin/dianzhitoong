const base = "http://localhost:3000";
const email = `demo${Date.now()}@test.com`;

async function main() {
  const jar = new Map();
  function storeCookies(res) {
    const raw = res.headers.getSetCookie?.() || [];
    for (const c of raw) {
      const [kv] = c.split(";");
      const i = kv.indexOf("=");
      jar.set(kv.slice(0, i), kv.slice(i + 1));
    }
  }
  function cookieHeader() {
    return [...jar.entries()].map(([k, v]) => `${k}=${v}`).join("; ");
  }
  async function api(path, body) {
    const res = await fetch(`${base}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        cookie: cookieHeader(),
      },
      body: JSON.stringify(body),
    });
    storeCookies(res);
    const text = await res.text();
    console.log(path, res.status, text.slice(0, 300));
    try {
      return { status: res.status, data: JSON.parse(text) };
    } catch {
      return { status: res.status, data: text };
    }
  }

  await api("/api/auth/register", {
    name: "测试用户",
    email,
    password: "123456",
  });
  const resume = await api("/api/resumes", {
    title: "零售简历",
    targetRole: "门店销售/导购",
    content: {
      phone: "13800000000",
      city: "上海",
      education: "某大学 市场营销 2026",
      experience: "校内超市兼职6个月，负责收银与理货，周末高峰协助接待顾客",
      skills: "沟通,收银,抗压",
      summary: "希望从事零售门店工作",
    },
  });
  const id = resume.data?.resume?.id;
  if (id) {
    await api("/api/ai/resume/diagnose", {
      resumeId: id,
      jdText: "负责门店销售与顾客服务，需沟通能力与抗压",
    });
  }
  await api("/api/applications", {
    company: "优衣库",
    role: "门店销售",
    channel: "官网",
    status: "applied",
  });
  await api("/api/interview", {
    roleProfile: "门店销售/导购",
    round: "一面",
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
