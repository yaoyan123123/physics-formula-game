// 学考匿名榜 API —— 隐私设计：
// 1) 只存 随机昵称 + 分数 + 匿名设备id(uuid)，无任何个人信息字段
// 2) GET 返回榜单时剥离 id，外界只能看到昵称和分数
// 3) 成绩仅在玩家主动点「上榜」时 POST 上来

const json = (o, st = 200) =>
  new Response(JSON.stringify(o), {
    status: st,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });

export async function onRequestGet({ env }) {
  const raw = await env.RANK.get("board");
  const list = raw ? JSON.parse(raw) : [];
  // 剥离内部 id，只暴露昵称/分数
  return json({ list: list.slice(0, 50).map(e => ({ n: e.n, s: e.s })) });
}

export async function onRequestPost({ request, env }) {
  let b;
  try { b = await request.json(); } catch { return json({ err: "bad" }, 400); }
  const { id, nick, score } = b || {};
  if (typeof id !== "string" || id.length < 8 || id.length > 40) return json({ err: "id" }, 400);
  if (typeof nick !== "string" || nick.length < 2 || nick.length > 16) return json({ err: "nick" }, 400);
  if (typeof score !== "number" || !Number.isInteger(score) || score < 0 || score > 100 || score % 5 !== 0)
    return json({ err: "score" }, 400);

  const raw = await env.RANK.get("board");
  let list = raw ? JSON.parse(raw) : [];
  const now = Date.now();
  const i = list.findIndex(e => e.id === id);
  if (i > -1) {
    if (score > list[i].s) { list[i].s = score; list[i].t = now; }
    list[i].n = nick;                      // 换昵称随时生效
  } else {
    list.push({ id, n: nick, s: score, t: now });
  }
  list.sort((a, b2) => b2.s - a.s || a.t - b2.t);  // 同分先到先得
  list = list.slice(0, 200);
  await env.RANK.put("board", JSON.stringify(list));
  const rank = list.findIndex(e => e.id === id) + 1;
  return json({ ok: 1, rank: rank || null });
}
