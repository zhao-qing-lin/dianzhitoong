const key = process.env.OPENAI_API_KEY;
if (!key) {
  console.error("请先设置环境变量 OPENAI_API_KEY");
  process.exit(1);
}

async function tryOne(label, body) {
  const r = await fetch("https://api.deepseek.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify(body),
  });
  const j = await r.json();
  const m = j.choices?.[0]?.message || {};
  console.log(
    label,
    JSON.stringify({
      status: r.status,
      content: m.content,
      reasoning: (m.reasoning_content || "").slice(0, 60),
      finish: j.choices?.[0]?.finish_reason,
      err: j.error?.message,
    }),
  );
}

await tryOne("disabled", {
  model: "deepseek-v4-flash",
  messages: [{ role: "user", content: '只输出 JSON：{"hi":1}' }],
  max_tokens: 80,
  response_format: { type: "json_object" },
  thinking: { type: "disabled" },
});

await tryOne("default", {
  model: "deepseek-v4-flash",
  messages: [{ role: "user", content: '只输出 JSON：{"hi":1}' }],
  max_tokens: 200,
  response_format: { type: "json_object" },
});
