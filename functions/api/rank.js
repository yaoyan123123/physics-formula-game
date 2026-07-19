// 多板块匿名榜 API —— 隐私设计：
// 1) 只存 随机昵称 + 分数 + 匿名设备id(uuid)，无任何个人信息字段
// 2) GET 返回榜单时剥离 id，外界只能看到昵称和分数
// 3) 成绩仅在玩家主动点「上榜」时 POST 上来
// 板块: xk 学考(分,高优) / quiz 极速问答(分,高优) / tf 概念判断(分,高优)
//       match 连连看(秒,低优) / stars 关卡星数(星,高优)

const CFG = {
  xk:    { min: 0, max: 100 },   // 湖南版=18题正确率%(任意整数0-100)，不再限5倍数
  quiz:  { min: 0, max: 1900 },
  tf:    { min: 0, max: 3600 },
  match: { min: 5, max: 3600, asc: true },   // 用时越短越好
  stars: { min: 0, max: 39 },
};

const json = (o, st = 200) =>
  new Response(JSON.stringify(o), {
    status: st,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });

const boardOf = b => (CFG[b] ? "board:" + b : null);

export async function onRequestGet({ request, env }) {
  const b = new URL(request.url).searchParams.get("board") || "xk";
  const key = boardOf(b);
  if (!key) return json({ err: "board" }, 400);
  const raw = await env.RANK.get(key);
  const list = raw ? JSON.parse(raw) : [];
  return json({ board: b, asc: !!CFG[b].asc, list: list.slice(0, 50).map(e => ({ n: e.n, s: e.s })) });
}

export async function onRequestPost({ request, env }) {
  let body;
  try { body = await request.json(); } catch { return json({ err: "bad" }, 400); }
  const { board, id, nick, score } = body || {};
  const c = CFG[board];
  if (!c) return json({ err: "board" }, 400);
  if (typeof id !== "string" || id.length < 8 || id.length > 40) return json({ err: "id" }, 400);
  if (typeof nick !== "string" || nick.length < 2 || nick.length > 16) return json({ err: "nick" }, 400);
  if (typeof score !== "number" || !Number.isInteger(score) || score < c.min || score > c.max)
    return json({ err: "score" }, 400);
  if (c.step && score % c.step !== 0) return json({ err: "score" }, 400);

  const key = boardOf(board);
  const raw = await env.RANK.get(key);
  let list = raw ? JSON.parse(raw) : [];
  const now = Date.now();
  const better = (a, b2) => (c.asc ? a < b2 : a > b2);
  const i = list.findIndex(e => e.id === id);
  if (i > -1) {
    if (better(score, list[i].s)) { list[i].s = score; list[i].t = now; }
    list[i].n = nick;
  } else {
    list.push({ id, n: nick, s: score, t: now });
  }
  list.sort((a, b2) => (c.asc ? a.s - b2.s : b2.s - a.s) || a.t - b2.t);
  list = list.slice(0, 200);
  await env.RANK.put(key, JSON.stringify(list));
  const rank = list.findIndex(e => e.id === id) + 1;
  return json({ ok: 1, rank: rank || null });
}
