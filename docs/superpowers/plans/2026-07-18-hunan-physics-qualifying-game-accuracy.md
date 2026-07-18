# 湖南高中物理合格考公式游戏准确性升级 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把“粉笔物理·公式黑板大作战”校准为知识准确、章节正确、难度不超过湖南高中物理合格考的公式专项训练游戏。

**Architecture:** 保持现有无构建步骤的单页静态架构，以 `/Users/mac/test/physics-formula-game.html` 为主源，每次修改后机械同步到仓库中的 `index.html`。内容继续存放在页面内的 `CH`、`DATA`、`TF` 和新增的 `XK_Q` 常量中；新增纯函数负责湖南 18 题组卷、训练反馈和中国本地日期，Node 测试通过平衡扫描器读取内联常量与函数，不引入运行时依赖。

**Tech Stack:** HTML5、原生 CSS、原生 JavaScript、Node.js `node:test`、Cloudflare Pages 静态部署（本计划不执行部署）

---

## File map

- Modify: `/Users/mac/test/physics-formula-game.html` — 游戏主源；内容、组卷、界面和日期逻辑均在此维护。
- Modify: `/Users/mac/test/physics-game-deploy/index.html` — 部署副本；只通过 `cp` 从主源同步，不单独手改。
- Create: `/Users/mac/test/physics-game-deploy/tests/helpers/inline-script.mjs` — 从单页脚本中安全提取常量和命名函数，供 Node 测试使用。
- Create: `/Users/mac/test/physics-game-deploy/tests/physics-content.test.mjs` — 章节、公式、条件、禁用措辞和湖南考试边界测试。
- Create: `/Users/mac/test/physics-game-deploy/tests/hunan-challenge.test.mjs` — 18 题组卷、题型配额、三册覆盖、唯一答案和训练反馈测试。
- Create: `/Users/mac/test/physics-game-deploy/tests/local-study-date.test.mjs` — `Asia/Shanghai` 自然日与连续学习日期测试。
- Preserve: `/Users/mac/test/physics-game-deploy/tests/daan-preview.test.mjs` — 现有答案预览回归测试，不能修改为放宽断言。

## Content contract

### Final chapter map

```js
const CH = {
  1:{nm:"运动的描述",bk:"必修一",s:"运动描述"},
  2:{nm:"匀变速直线运动的研究",bk:"必修一",s:"匀变速"},
  3:{nm:"相互作用——力",bk:"必修一",s:"相互作用"},
  4:{nm:"运动和力的关系",bk:"必修一",s:"运动与力"},
  5:{nm:"抛体运动",bk:"必修二",s:"抛体"},
  6:{nm:"圆周运动",bk:"必修二",s:"圆周"},
  7:{nm:"万有引力与宇宙航行",bk:"必修二",s:"万有引力"},
  8:{nm:"机械能守恒定律",bk:"必修二",s:"机械能"},
  9:{nm:"静电场及其应用",bk:"必修三",s:"静电场"},
  10:{nm:"静电场中的能量",bk:"必修三",s:"电场能量"},
  11:{nm:"电路及其应用",bk:"必修三",s:"电路"},
  12:{nm:"电能 能量守恒定律",bk:"必修三",s:"电能"},
  13:{nm:"电磁感应与电磁波初步",bk:"必修三",s:"电磁初步"}
};
```

### Exact formula changes and additions

The following expressions and explanations are normative for implementation. Unlisted expressions remain mathematically unchanged, but every `DATA` entry receives a non-empty `k` applicability field.

| Name | Chapter | Final formula | Final applicability / correction |
| --- | ---: | --- | --- |
| 平均速率 | 1 | `v̄ = s/Δt` | 路程除以时间间隔；标量 |
| 自由落体·速度 | 2 | `v = gt` | 近地、初速度为零、忽略空气阻力、`g` 近似恒定 |
| 自由落体·位移 | 2 | `h = ½gt²` | 同上 |
| 胡克定律 | 3 | `F = kx` | 弹性限度内；公式表示弹力大小，方向与形变恢复方向一致 |
| 滑动摩擦力 | 3 | `f = μN` | 接触面间发生相对滑动，`N` 为正压力 |
| 超重 | 4 | `N = m(g + a)` | 竖直支持或悬挂测力模型，加速度竖直向上 |
| 失重 | 4 | `N = m(g − a)` | 同类模型，加速度竖直向下且接触未失效 |
| 平抛各公式 | 5 | 保留现有表达式 | 忽略空气阻力，`g` 近似恒定，初速度水平 |
| 向心加速度 | 6 | `aₙ = v²/r = ω²r` | 圆周运动，方向指向圆心 |
| 向心力 | 6 | `Fₙ = mv²/r = mω²r` | 指向圆心的合力或合力的径向分量，不是新性质力 |
| 万有引力定律 | 7 | `F = Gm₁m₂/r²` | 质点；均匀球体外部可等效为质量集中在球心 |
| 第一宇宙速度 | 7 | `v₁ = √(gR) ≈ 7.9 km/s` | 近地圆轨道理想模型，忽略空气阻力和地球自转 |
| 功率与速度 | 8 | `P = Fvcosα` | 瞬时功率；`α` 为力与速度夹角，同向时化为 `P = Fv` |
| 动能 | 8 | `Eₖ = ½mv²` | 非负标量，可以为零；删除“恒为正” |
| 机械能守恒定律 | 8 | `Eₖ₁ + Eₚ₁ = Eₖ₂ + Eₚ₂` | 先明确研究系统；系统内只有重力或弹力做功的常见模型 |
| 库仑定律 | 9 | `F = k|q₁q₂|/r²` | 真空中两个静止点电荷；此式给大小，方向沿连线判断 |
| 电场强度（定义式） | 9 | `E = F/q₀` | `q₀` 为正试探电荷的电荷量；方向按正试探电荷受力方向 |
| 点电荷的场强 | 9 | `E = k|Q|/r²` | 真空中点电荷；公式给大小，方向由 `Q` 正负判断 |
| 电势差 | 10 | `U_AB = φ_A − φ_B = W_AB/q` | 明确 A、B 端点与静电力从 A 到 B 做功的符号 |
| 静电力做功 | 10 | `W_AB = qU_AB = −ΔEₚ` | 端点和符号保持一致 |
| 匀强电场 U 与 E | 10 | `U_AB = Ed` | `d` 为 A、B 沿电场方向的有向距离；若只写大小须说明取投影 |
| 平行板电容器 | 10 | `C = ε₀εᵣS/d` | SI 口径，忽略边缘效应 |
| 电流（定义式） | 11 | `I = Δq/Δt` | 时间间隔内通过截面的电荷量；恒定电流时可直接使用 |
| 欧姆定律 | 11 | `I = U/R` | 导体温度等物理条件不变且为欧姆导体 |
| 电阻定律 | 11 | `R = ρL/S` | 均匀导体、温度等条件确定；拉伸结论需另加体积和电阻率不变条件 |
| 电动势（新增） | 11 | `𝓔 = W非/q` | 电源内部非静电力搬运单位正电荷所做的功 |
| 闭合电路欧姆定律（新增） | 11 | `I = 𝓔/(R + r)` | 电源电动势、内阻和外电路总电阻模型 |
| 路端电压（新增） | 11 | `U = 𝓔 − Ir` | 电源对外供电情境；`r` 为内阻 |
| 电功 | 12 | `W = UIt` | 从第 11 章移入第 12 章；恒定电压、电流时使用 |
| 电功率 | 12 | `P = UI` | 从第 11 章移入第 12 章；`I²R`、`U²/R` 只对纯电阻适用 |
| 焦耳定律 | 12 | `Q = I²Rt` | 从第 11 章移入第 12 章；纯电阻中可写 `Q = W = UIt` |
| 能量转化效率 | 12 | `η = E有/E总 × 100%` | 定义上不超过 100%；实际装置通常小于 100% |
| 能量守恒定律 | 12 | `E总 = 常量` | 选定的封闭系统内，能量总量保持不变 |
| 磁感应强度（定义式） | 13 | `B = F/(IL)` | 匀强磁场中直导线与磁场垂直时的定义关系 |
| 安培力 | 13 | `F = BILsinθ` | 匀强磁场中的直导线；垂直时最大、平行时为零 |
| 磁通量 | 13 | `Φ = BS` | 匀强磁场且磁场垂直线圈平面 |
| 磁通量（一般式） | 13 | `Φ = BScosθ` | `θ` 为磁场与平面法线夹角 |
| 电磁波（新增） | 13 | `c = λf ≈ 3.0×10⁸ m/s` | 真空中的电磁波；介质中传播速度通常小于 `c` |

Final formula count is 71. The UI must derive this count from `DATA.length`; only the content test may assert `71` as a reviewed inventory checksum.

### Applicability field matrix for unchanged cards

Use property `k` for the fixed “适用条件” line. For unchanged cards, use these exact values:

```text
平均速度：选定参考系，Δt ≠ 0
加速度（定义式）：平均加速度取有限时间间隔；瞬时加速度取极短时间间隔
速度—时间关系：匀变速直线运动
位移—时间关系：匀变速直线运动，先规定正方向
速度—位移关系：匀变速直线运动，先规定正方向
匀变速平均速度：匀变速直线运动
逐差公式：匀变速直线运动，相邻相等时间间隔
重力：近地面、g 近似恒定
合力的范围：两个共点力
力的正交分解：θ 为力与所选 x 轴的夹角
牛顿第二定律：惯性参考系，F 为物体所受合外力
力的单位：国际单位制
线速度：沿半径为 r 的圆周运动
角速度：转动周期为 T
线速度与角速度：同一转动物体上距转轴 r 的点
角速度与转速：n 使用转每秒（Hz）
黄金代换：地表附近，忽略地球自转
环绕速度：质量为 M 的中心天体外做圆轨道运动
开普勒第三定律：绕同一中心天体运动
功：恒力，l 为物体位移
功率（定义式）：平均功率取一段时间内的功
动能定理：同一惯性参考系，W总为各力做功的代数和
重力势能：近地面、g 近似恒定，并选定零势能面
重力做功与势能：近地面重力场，始末位置确定
元电荷：电荷量量子化，n 为整数
电势：先选定零电势参考位置
电容（定义式）：Q 为任一极板电荷量的绝对值，U 为两板电势差
串联电阻：电阻首尾依次相连且中间节点无分支
并联电阻：各电阻两端分别接在同一对节点
```

---

### Task 1: Add an inline-data test harness and lock the current failures

**Files:**
- Create: `tests/helpers/inline-script.mjs`
- Create: `tests/physics-content.test.mjs`

- [ ] **Step 1: Create a balanced JavaScript source extractor**

```js
// tests/helpers/inline-script.mjs
import vm from 'node:vm';

function scanBalanced(source, start, open, close) {
  let depth = 0;
  let quote = null;
  let escaped = false;
  for (let i = start; i < source.length; i += 1) {
    const ch = source[i];
    if (quote) {
      if (escaped) escaped = false;
      else if (ch === '\\') escaped = true;
      else if (ch === quote) quote = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') {
      quote = ch;
      continue;
    }
    if (ch === open) depth += 1;
    if (ch === close) {
      depth -= 1;
      if (depth === 0) return source.slice(start, i + 1);
    }
  }
  throw new Error(`Unbalanced ${open}${close}`);
}

export function extractConst(source, name) {
  const marker = new RegExp(`const\\s+${name}\\s*=\\s*`, 'm');
  const match = marker.exec(source);
  if (!match) throw new Error(`Missing const ${name}`);
  const start = match.index + match[0].length;
  const first = source[start];
  const pairs = { '[': ']', '{': '}' };
  if (!pairs[first]) throw new Error(`const ${name} must start with an object or array literal`);
  const literal = scanBalanced(source, start, first, pairs[first]);
  return vm.runInNewContext(`(${literal})`);
}

export function extractFunction(source, name, context = {}) {
  const marker = new RegExp(`function\\s+${name}\\s*\\(`, 'm');
  const match = marker.exec(source);
  if (!match) throw new Error(`Missing function ${name}`);
  const brace = source.indexOf('{', match.index);
  const body = scanBalanced(source, brace, '{', '}');
  const fnSource = source.slice(match.index, brace) + body;
  return vm.runInNewContext(`(${fnSource})`, context);
}
```

- [ ] **Step 2: Add failing content assertions**

```js
// tests/physics-content.test.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { extractConst } from './helpers/inline-script.mjs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const CH = extractConst(html, 'CH');
const DATA = extractConst(html, 'DATA');

test('uses the 13 chapters from the 2019 PEP compulsory books', () => {
  assert.equal(Object.keys(CH).length, 13);
  assert.equal(CH[12].nm, '电能 能量守恒定律');
  assert.equal(CH[13].nm, '电磁感应与电磁波初步');
});

test('keeps a reviewed 71-card compulsory formula inventory', () => {
  assert.equal(DATA.length, 71);
  assert.ok(DATA.every(item => item.c >= 1 && item.c <= 13));
  assert.ok(DATA.every(item => item.n && item.f && item.k && item.t && item.w));
});

test('contains required circuit and electromagnetic foundations', () => {
  const byName = new Map(DATA.map(item => [item.n, item]));
  assert.equal(byName.get('闭合电路欧姆定律').f, 'I = 𝓔/(R + r)');
  assert.equal(byName.get('路端电压').f, 'U = 𝓔 − Ir');
  assert.match(byName.get('电磁波').f, /c = λf/);
});

test('uses magnitude formulas and explicit endpoint notation where required', () => {
  const byName = new Map(DATA.map(item => [item.n, item]));
  assert.equal(byName.get('库仑定律').f, 'F = k|q₁q₂|/r²');
  assert.equal(byName.get('点电荷的场强').f, 'E = k|Q|/r²');
  assert.equal(byName.get('电势差').f, 'U_AB = φ_A − φ_B = W_AB/q');
  assert.equal(byName.get('安培力').f, 'F = BILsinθ');
});

test('removes reviewed misleading claims and hard-coded formula marketing', () => {
  for (const banned of ['标量，恒为正', 'η 永远小于 100%', '有摩擦力做功就不守恒', '适用于金属导体和电解液']) {
    assert.doesNotMatch(html, new RegExp(banned.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
  assert.doesNotMatch(html, /67\s*条/);
  assert.doesNotMatch(html, /id="subCnt">67</);
  assert.doesNotMatch(html, /id="bM">0 \/ 67</);
  assert.doesNotMatch(html, /60\s*分合格/);
  assert.doesNotMatch(html, /评定\s*A\s*[~—-]\s*E/);
});
```

- [ ] **Step 3: Run the new test and verify the intended failure**

Run: `node --test tests/physics-content.test.mjs`

Expected: FAIL on chapter 12/13, `DATA.length`, missing `k`, missing closed-circuit formulas, and banned wording.

- [ ] **Step 4: Commit the failing tests**

```bash
git add tests/helpers/inline-script.mjs tests/physics-content.test.mjs
git commit -m "test: lock Hunan qualifying physics content requirements"
```

### Task 2: Correct chapters, formulas, conditions, and formula-card presentation

**Files:**
- Modify: `/Users/mac/test/physics-formula-game.html:7-11,426-472,535-678,873-888,1252-1265`
- Modify by sync: `index.html`
- Test: `tests/physics-content.test.mjs`

- [ ] **Step 1: Replace chapter 12/13 and update metadata/count placeholders**

Use the exact `CH` contract above. Replace metadata descriptions with count-free wording:

```html
<title>粉笔物理 · 公式黑板大作战｜湖南高中物理合格考</title>
<meta name="description" content="湖南高中物理合格考公式记忆游戏：人教版2019必修一、二、三全13章，闯关地图、翻卡、连连看、极速问答和18题公式冲刺。">
<meta property="og:description" content="湖南高中物理合格考必修公式边玩边背：闯关地图、18题公式冲刺、错题重刷，黑板粉笔风记忆游戏。">
```

Replace the two stale count placeholders; `renderHome()` remains responsible for inserting `DATA.length`:

```html
<p class="sub">必修一 / 二 / 三 · 第 1 ~ 13 章 · <b id="subCnt"></b> 条核心公式</p>
<span class="badge">掌握 <b id="bM"></b></span>
```

Change the data-section comment from “第1~10章” to “第1~13章”.

- [ ] **Step 2: Apply the exact formula audit contract**

Edit `DATA` in the main source so that:

- all rows use a non-empty `k` field from the formula table and applicability matrix;
- chapter moves and the four additions produce exactly 71 rows;
- the expressions in “Exact formula changes and additions” match byte-for-byte;
- `DATA.forEach((d,i)=>d.id="q"+i);` remains after the array;
- `t` explains the physical meaning and common units without duplicating `k`;
- `w` is a short, non-absolute misconception warning.

For the new circuit and wave rows, use these complete objects:

```js
{c:11,n:"电动势",f:"𝓔 = W非/q",b:["W非","q"],k:"电源内部非静电力搬运电荷",t:"单位伏特 V，反映电源把其他形式能转化为电能的本领",w:"电动势是电源属性，不等于任意工作状态下的路端电压"},
{c:11,n:"闭合电路欧姆定律",f:"I = 𝓔/(R + r)",b:["𝓔","R + r"],k:"电源电动势、内阻和外电路总电阻模型",t:"R 为外电路总电阻，r 为电源内阻",h:1,w:"分母包含外电阻 R 和内阻 r"},
{c:11,n:"路端电压",f:"U = 𝓔 − Ir",b:["𝓔","Ir"],k:"电源对外供电",t:"电流增大时，内电压 Ir 增大，路端电压减小",h:1,w:"电源没有电流时 U = 𝓔；供电时通常 U < 𝓔"},
{c:13,n:"电磁波",f:"c = λf ≈ 3.0×10⁸ m/s",b:["λf","3.0×10⁸"],k:"真空中的电磁波",t:"c 为真空光速，λ 为波长，f 为频率",w:"电磁波在介质中的传播速度通常小于 c"}
```

- [ ] **Step 3: Render applicability as a first-class card field**

Add CSS next to the existing card note/warning styles:

```css
.condition{display:block;margin-top:10px;color:var(--yellow);font-size:.84rem;line-height:1.55}
.condition::before{content:"适用条件：";font-weight:700}
.exam-note{margin-top:12px}
.exam-note p{color:var(--chalk-dim);font-size:.86rem;line-height:1.7;padding:4px 2px 2px}
```

In the flash-card back, render `k` before `t`:

```js
${d.k?`<span class="condition">${esc(d.k)}</span>`:""}
${d.t?`<span class="note">${esc(d.t)}</span>`:""}
${d.w?`<span class="warn2">⚠ ${esc(d.w)}</span>`:""}
```

In the formula sheet detail, render the same semantic order:

```js
${d.k||d.t||d.w?`<span class="st">${d.k?`<b style="color:var(--yellow)">条件：</b>${esc(d.k)}　`:""}${esc(d.t||"")}${d.w?`　<span style="color:var(--pink)">⚠ ${esc(d.w)}</span>`:""}</span>`:""}
```

- [ ] **Step 4: Replace the exact conflicting TF rows**

Keep the standalone 42-item concept mode. Replace the nine affected rows with the following objects and leave the other 33 rows unchanged:

```js
{c:2,q:"近地面忽略空气阻力时，自由落体运动是初速度为零的匀加速直线运动",a:true,x:"在该理想模型中，物体只受重力，a = g 近似恒定"},
{c:7,q:"第一宇宙速度是在理想近地圆轨道模型中的最大环绕速度",a:true,x:"忽略空气阻力和地球自转时，近地圆轨道速度约为 7.9 km/s；轨道越高，圆轨道速度越小"},
{c:8,q:"研究系统内只有重力或弹力做功时，系统机械能守恒",a:true,x:"先选定研究系统，再判断是否只有重力或弹力做功"},
{c:11,q:"均匀导体的电阻由材料、长度、横截面积和温度等条件共同决定",a:true,x:"R = ρL/S；R = U/I 是量度关系，不能说电阻由某次 U、I 决定"},
{c:11,q:"闭合电路中，外电阻增大时电流一定增大",a:false,x:"I = 𝓔/(R+r)，电动势和内阻不变时，外电阻增大，电流减小"},
{c:13,q:"奥斯特发现了电流的磁效应",a:true,x:"通电导线附近的小磁针发生偏转，说明电流周围存在磁场"},
{c:13,q:"法拉第发现了电磁感应现象",a:true,x:"闭合回路的磁通量发生变化时可以产生感应电流"},
{c:13,q:"磁感线从 N 极出发终止于 S 极，是不闭合的曲线",a:false,x:"磁感线是闭合曲线，磁体外部由 N 到 S，内部由 S 到 N"},
{c:12,q:"能量耗散说明能量守恒定律不成立",a:false,x:"能量总量仍守恒，只是可利用的能量品质降低"}
```

Do not change the standalone mode into Hunan exam simulation; it remains an optional concept practice activity.

- [ ] **Step 5: Sync the source and run the content test**

```bash
cp /Users/mac/test/physics-formula-game.html /Users/mac/test/physics-game-deploy/index.html
node --test tests/physics-content.test.mjs
cmp -s /Users/mac/test/physics-formula-game.html index.html
```

Expected: content tests PASS; `cmp` exits 0.

- [ ] **Step 6: Commit the content correction**

```bash
git add index.html tests/physics-content.test.mjs
git commit -m "fix: align physics content with Hunan qualifying scope"
```

### Task 3: Add the reviewed Hunan single-choice bank and balanced 18-question builder

**Files:**
- Modify: `/Users/mac/test/physics-formula-game.html:629-678,942-992`
- Modify by sync: `index.html`
- Create: `tests/hunan-challenge.test.mjs`

- [ ] **Step 1: Add failing challenge-structure tests**

```js
// tests/hunan-challenge.test.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { extractConst, extractFunction } from './helpers/inline-script.mjs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const CH = extractConst(html, 'CH');
const DATA = extractConst(html, 'DATA').map((item, index) => ({ ...item, id: `q${index}` }));
const XK_Q = extractConst(html, 'XK_Q');
const shuf = list => list.slice();
const bookOf = extractFunction(html, 'bookOf');
const buildXKRound = extractFunction(html, 'buildXKRound', { DATA, XK_Q, shuf, bookOf });
const trainingLevel = extractFunction(html, 'trainingLevel');

test('builds 18 unique single-choice questions with the reviewed quota', () => {
  const round = buildXKRound();
  assert.equal(round.length, 18);
  assert.equal(new Set(round.map(item => item.key)).size, 18);
  assert.deepEqual(
    Object.fromEntries(['formula','condition','calc','context'].map(kind => [kind, round.filter(item => item.kind === kind).length])),
    { formula: 6, condition: 4, calc: 6, context: 2 },
  );
});

test('covers all three compulsory books every round', () => {
  const books = new Set(buildXKRound().map(item => bookOf(item.d.c)));
  assert.deepEqual([...books].sort(), [1, 2, 3]);
});

test('keeps authored questions single-answer and within the allowed kinds', () => {
  assert.ok(XK_Q.length >= 26);
  for (const q of XK_Q) {
    assert.ok(['condition','calc','context'].includes(q.kind));
    assert.equal(q.o.length, 4);
    assert.ok(Number.isInteger(q.a) && q.a >= 0 && q.a < 4);
    assert.ok(q.x && q.timeMs >= 20000 && q.timeMs <= 30000);
  }
});

test('returns training feedback rather than official pass claims', () => {
  assert.equal(trainingLevel(16, 18).label, '较为稳固');
  assert.equal(trainingLevel(13, 18).label, '基本掌握');
  assert.equal(trainingLevel(12, 18).label, '继续巩固');
});

test('labels the mode as a non-complete Hunan qualifying drill', () => {
  assert.match(html, /湖南学考·18 题公式冲刺/);
  assert.match(html, /不是完整试卷/);
  assert.doesNotMatch(html, /学考冲刺模拟卷/);
});
```

- [ ] **Step 2: Run the challenge test and verify failure**

Run: `node --test tests/hunan-challenge.test.mjs`

Expected: FAIL because `XK_Q`, `bookOf`, `buildXKRound`, and `trainingLevel` do not exist.

- [ ] **Step 3: Add the authored bank**

Insert after `TF`. Use zero-based `a` indexes and these reviewed questions:

```js
const XK_Q = [
  {id:"cond-01",c:3,kind:"condition",q:"胡克定律 F = kx 可以直接使用的条件是",o:["任何弹簧在任何形变下","弹簧处于弹性限度内","弹簧长度等于原长","弹簧只能水平放置"],a:1,x:"胡克定律适用于弹性限度内，x 是形变量。",ref:"胡克定律",timeMs:20000},
  {id:"cond-02",c:4,kind:"condition",q:"竖直电梯中人处于超重状态，直接反映的是",o:["人的重力增大","人的质量增大","支持力大于重力","电梯一定向上运动"],a:2,x:"超重时视重增大，支持力大于重力；真实重力不变，运动方向不确定。",ref:"超重",timeMs:20000},
  {id:"cond-03",c:5,kind:"condition",q:"使用平抛运动基本公式时，通常采用的理想条件是",o:["只忽略物体重力","忽略空气阻力且重力加速度近似恒定","物体必须从地面抛出","物体质量必须为 1 kg"],a:1,x:"平抛模型保留重力、忽略空气阻力，并把 g 视为恒量。",ref:"平抛·水平方向",timeMs:20000},
  {id:"cond-04",c:8,kind:"condition",q:"判断机械能是否守恒，首先应当",o:["只看速度是否改变","只看是否出现摩擦力","选定研究系统并分析做功情况","只看高度是否改变"],a:2,x:"机械能守恒是关于选定系统的结论，必须先明确系统边界。",ref:"机械能守恒定律",timeMs:20000},
  {id:"cond-05",c:9,kind:"condition",q:"库仑定律 F = k|q₁q₂|/r² 的直接适用对象是",o:["任意带电物体","真空中的静止点电荷","通电直导线","匀强电场中的任意电荷"],a:1,x:"高中阶段该式直接用于真空中的两个静止点电荷。",ref:"库仑定律",timeMs:20000},
  {id:"cond-06",c:11,kind:"condition",q:"欧姆定律 I = U/R 适用于",o:["所有元件的所有状态","温度等条件不变的欧姆导体","只有电源内部","任何变化的电磁场"],a:1,x:"欧姆定律有物理条件，不能对所有导体作无条件推广。",ref:"欧姆定律",timeMs:20000},
  {id:"cond-07",c:13,kind:"condition",q:"通电直导线受到的安培力为 BIL 的条件是电流方向与磁场方向",o:["平行","垂直","夹角为 45°","方向任意"],a:1,x:"一般式为 F = BILsinθ，垂直时 sinθ = 1。",ref:"安培力",timeMs:20000},
  {id:"cond-08",c:7,kind:"condition",q:"第一宇宙速度约 7.9 km/s 的常用结论基于",o:["近地圆轨道理想模型","任意椭圆轨道","卫星远离地球后的任意位置","考虑空气阻力的低空飞行"],a:0,x:"该结论基于近地圆轨道，并忽略空气阻力和地球自转等影响。",ref:"第一宇宙速度",timeMs:20000},

  {id:"calc-01",c:1,kind:"calc",q:"速度从 5 m/s 增加到 15 m/s，用时 2 s，平均加速度为",o:["2 m/s²","5 m/s²","10 m/s²","20 m/s²"],a:1,x:"a = Δv/Δt = (15−5)/2 = 5 m/s²。",ref:"加速度（定义式）",timeMs:30000},
  {id:"calc-02",c:2,kind:"calc",q:"物体做匀加速直线运动，v₀=2 m/s，a=3 m/s²，4 s 末速度为",o:["8 m/s","12 m/s","14 m/s","20 m/s"],a:2,x:"v = v₀ + at = 2 + 3×4 = 14 m/s。",ref:"速度—时间关系",timeMs:30000},
  {id:"calc-03",c:3,kind:"calc",q:"弹簧在弹性限度内，k=200 N/m，形变量为 0.05 m，弹力大小为",o:["4 N","10 N","40 N","100 N"],a:1,x:"F = kx = 200×0.05 = 10 N。",ref:"胡克定律",timeMs:30000},
  {id:"calc-04",c:4,kind:"calc",q:"质量为 2 kg 的物体所受合外力产生 3 m/s² 的加速度，合外力为",o:["1.5 N","5 N","6 N","9 N"],a:2,x:"F合 = ma = 2×3 = 6 N。",ref:"牛顿第二定律",timeMs:30000},
  {id:"calc-05",c:5,kind:"calc",q:"取 g=10 m/s²，平抛物体从 5 m 高处落地，飞行时间为",o:["0.5 s","1 s","2 s","5 s"],a:1,x:"t = √(2h/g) = √(10/10) = 1 s。",ref:"平抛·飞行时间",timeMs:30000},
  {id:"calc-06",c:6,kind:"calc",q:"物体做匀速圆周运动，r=0.5 m，T=2 s，线速度大小为",o:["0.25π m/s","0.5π m/s","π m/s","2π m/s"],a:1,x:"v = 2πr/T = 2π×0.5/2 = 0.5π m/s。",ref:"线速度",timeMs:30000},
  {id:"calc-07",c:8,kind:"calc",q:"质量为 2 kg 的物体以 3 m/s 运动，动能为",o:["3 J","6 J","9 J","18 J"],a:2,x:"Eₖ = ½mv² = ½×2×3² = 9 J。",ref:"动能",timeMs:30000},
  {id:"calc-08",c:8,kind:"calc",q:"10 N 的恒力与位移同向，物体移动 2 m，该力做功为",o:["5 J","10 J","20 J","40 J"],a:2,x:"W = Flcos0° = 10×2 = 20 J。",ref:"功",timeMs:30000},
  {id:"calc-09",c:11,kind:"calc",q:"某欧姆导体两端电压为 6 V，电阻为 3 Ω，电流为",o:["0.5 A","2 A","3 A","18 A"],a:1,x:"I = U/R = 6/3 = 2 A。",ref:"欧姆定律",timeMs:30000},
  {id:"calc-10",c:11,kind:"calc",q:"电源电动势 6 V，内阻 1 Ω，外电阻 2 Ω，闭合电路电流为",o:["1 A","2 A","3 A","6 A"],a:1,x:"I = 𝓔/(R+r) = 6/(2+1) = 2 A。",ref:"闭合电路欧姆定律",timeMs:30000},
  {id:"calc-11",c:12,kind:"calc",q:"用电器两端电压 6 V，通过电流 2 A，电功率为",o:["3 W","8 W","12 W","24 W"],a:2,x:"P = UI = 6×2 = 12 W。",ref:"电功率",timeMs:30000},
  {id:"calc-12",c:10,kind:"calc",q:"电容器带电荷量 20 μC，两板电势差 10 V，电容为",o:["0.5 μF","2 μF","20 μF","200 μF"],a:1,x:"C = Q/U = 20 μC/10 V = 2 μF。",ref:"电容（定义式）",timeMs:30000},

  {id:"ctx-01",c:2,kind:"context",q:"速度—时间图像与时间轴围成的有向面积表示",o:["加速度","位移","路程一定值","合外力"],a:1,x:"v-t 图像的有向面积表示位移。",ref:"速度—时间关系",timeMs:25000},
  {id:"ctx-02",c:2,kind:"context",q:"用逐差法处理纸带数据时，相邻相等时间间隔位移差 Δx 满足",o:["Δx = aT","Δx = aT²","Δx = 2aT","Δx = vT²"],a:1,x:"匀变速直线运动中，相邻相等时间间隔位移差为 aT²。",ref:"逐差公式",timeMs:25000},
  {id:"ctx-03",c:6,kind:"context",q:"匀速圆周运动中，物体的向心加速度方向",o:["沿切线方向","背离圆心","始终指向圆心","始终竖直向下"],a:2,x:"向心加速度始终沿半径指向圆心。",ref:"向心加速度",timeMs:25000},
  {id:"ctx-04",c:8,kind:"context",q:"忽略空气阻力，小球斜向抛出后在空中运动，选择小球和地球为系统，其机械能",o:["始终增加","始终减小","保持不变","先增加后减小"],a:2,x:"系统内只有重力做功，动能和重力势能相互转化，机械能守恒。",ref:"机械能守恒定律",timeMs:25000},
  {id:"ctx-05",c:10,kind:"context",q:"平行板电容器保持介质和正对面积不变，减小板间距离，电容将",o:["增大","减小","不变","先增大后减小"],a:0,x:"C = ε₀εᵣS/d，d 减小时 C 增大。",ref:"平行板电容器",timeMs:25000},
  {id:"ctx-06",c:13,kind:"context",q:"闭合线圈中产生感应电流的基本条件是",o:["线圈一定静止","线圈一定匀速运动","穿过线圈的磁通量发生变化","线圈中磁通量保持不变"],a:2,x:"闭合回路中的磁通量发生变化时，回路中产生感应电流。",ref:"磁通量（一般式）",timeMs:25000}
];
```

- [ ] **Step 4: Add pure grouping and feedback functions**

```js
function bookOf(chapter){return chapter<=4?1:chapter<=8?2:3}
function buildXKRound(){
  const formulas=[1,2,3].flatMap(book=>shuf(DATA.filter(d=>bookOf(d.c)===book)).slice(0,2)
    .map(d=>({key:`formula-${d.id}`,d,type:"quiz",kind:"formula",timeMs:15000})));
  const calcs=[1,2,3].flatMap(book=>shuf(XK_Q.filter(q=>q.kind==="calc"&&bookOf(q.c)===book)).slice(0,2)
    .map(d=>({key:d.id,d,type:"mcq",kind:d.kind,timeMs:d.timeMs})));
  const oneConditionEach=[1,2,3].flatMap(book=>shuf(XK_Q.filter(q=>q.kind==="condition"&&bookOf(q.c)===book)).slice(0,1));
  const used=new Set(oneConditionEach.map(q=>q.id));
  const extraCondition=shuf(XK_Q.filter(q=>q.kind==="condition"&&!used.has(q.id))).slice(0,1);
  const conditions=[...oneConditionEach,...extraCondition].map(d=>({key:d.id,d,type:"mcq",kind:d.kind,timeMs:d.timeMs}));
  const contexts=shuf(XK_Q.filter(q=>q.kind==="context")).slice(0,2)
    .map(d=>({key:d.id,d,type:"mcq",kind:d.kind,timeMs:d.timeMs}));
  return shuf([...formulas,...conditions,...calcs,...contexts]);
}
function trainingLevel(right,total=18){
  if(right>=16)return{label:"较为稳固",stars:3};
  if(right>=13)return{label:"基本掌握",stars:2};
  return{label:"继续巩固",stars:right>=9?1:0};
}
```

- [ ] **Step 5: Replace `startXK` with the balanced builder**

```js
function startXK(){newRound(buildXKRound(),"xk");renderQA()}
```

- [ ] **Step 6: Sync and run the challenge test**

```bash
cp /Users/mac/test/physics-formula-game.html /Users/mac/test/physics-game-deploy/index.html
node --test tests/hunan-challenge.test.mjs
```

Expected: all challenge-structure tests PASS.

- [ ] **Step 7: Commit the bank and builder**

```bash
git add index.html tests/hunan-challenge.test.mjs
git commit -m "feat: add balanced Hunan qualifying formula challenge"
```

### Task 4: Render four-option authored questions, adaptive timers, and non-official results

**Files:**
- Modify: `/Users/mac/test/physics-formula-game.html:942-1098,1159-1169`
- Modify by sync: `index.html`
- Test: `tests/hunan-challenge.test.mjs`

- [ ] **Step 1: Add a static regression test for result and leaderboard wording**

Append to `tests/hunan-challenge.test.mjs`:

```js
test('uses accuracy-based training results and leaderboard copy', () => {
  assert.match(html, /训练正确率/);
  assert.match(html, /big:`\$\{qRight\} \/ \$\{qList\.length\}`/);
  for (const banned of ['合格线 60 分','未合格 · 等级','合格 ✓ · 等级','学考模拟最高分']) {
    assert.doesNotMatch(html, new RegExp(banned));
  }
});
```

- [ ] **Step 2: Run the test to verify failure**

Run: `node --test tests/hunan-challenge.test.mjs`

Expected: FAIL on old result and leaderboard wording.

- [ ] **Step 3: Support authored MCQs in `renderQA`**

Add this first branch before the existing `tf` branch:

```js
if(type==="mcq"){
  ask=`湖南学考专项 · 第${d.c}章 ${CH[d.c].nm}`;
  body=`<span style="font-size:1.25rem;line-height:1.6">${esc(d.q)}</span>`;
  optHtml=d.o.map((option,i)=>`<div class="opt" data-ok="${i===d.a}" onclick="answerQA(this)"><i class="ol">${i+1}</i>${esc(option)}</div>`).join("");
}else if(type==="tf"){
  // existing standalone true/false rendering
}
```

Pass the per-question timer into the timer function:

```js
startQTimer(()=>answerQA(null),qList[qIdx].timeMs||15000);
```

Change the timer signature and percentage math:

```js
function startQTimer(onTimeout,duration=15000){
  let t=duration;const bar=$("#tbar"),box=$("#tbox");
  const iv=setInterval(()=>{
    t-=100;if(!bar){clearInterval(iv);return}
    bar.style.width=Math.max(0,t/duration*100)+"%";
    if(t<=Math.min(5000,duration/3))box.classList.add("low");
    if(t<=0){clearInterval(iv);onTimeout()}
  },100);
  timers.push(iv);
}
```

- [ ] **Step 4: Link authored questions to formula mastery and feedback**

Add:

```js
function refFormula(d){return d.ref?DATA.find(item=>item.n===d.ref):d.f?d:null}
```

In `answerQA`, use `refFormula(d)` for mastery/wrong-book updates. For an authored MCQ, show its explanation and correct option:

```js
const ref=refFormula(d);
if(ok){
  qCombo++;qRight++;
  const pts=qMode==="xk"?0:100+(qCombo-1)*20;
  if(qMode!=="xk")qScore+=pts;
  ding();burst(el,"#ffd95e");
  const extra=type==="mcq"?esc(d.x):type==="tf"?esc(d.x||""):type==="blank"?`完整公式：${esc(d.f)}`:(qCombo>1?`连击 ×${qCombo}！`:"");
  $("#fb").innerHTML=`<span class="okt">✓ 正确${qMode==="xk"?"":" +"+pts+" 分"}　${extra}</span>`;
  if(ref){bump(ref,true);wrongDel(ref)}
}else{
  qCombo=0;buzz();
  $("#fb").innerHTML=type==="mcq"
    ?`<span class="ert">${el?"✗ 错了":"⏰ 超时"}，正确答案「${esc(d.o[d.a])}」——${esc(d.x)}</span>`
    :type==="tf"
      ?`<span class="ert">${el?"✗ 错了":"⏰ 超时"}，正确答案「${d.a?"对":"错"}」——${esc(d.x||"")}</span>`
      :`<span class="ert">${el?"✗ 错了":"⏰ 超时"}，记住：${esc(d.n)} 👉 ${esc(d.f)}${d.w?`<br><span style="font-size:.88rem">⚠ ${esc(d.w)}</span>`:""}</span>`;
  if(ref){bump(ref,false);wrongAdd(ref)}
}
```

- [ ] **Step 5: Replace score and result semantics**

Remove `xkGrade`. In `statHtml`, use:

```js
${qMode==="xk"?`<span class="stat">答对 <b>${qRight}</b></span>`:`<span class="stat">得分 <b>${qScore}</b></span>`}
```

Replace the `qMode==="xk"` result branch with:

```js
if(qMode==="xk"){
  const pct=Math.round(acc*100),level=trainingLevel(qRight,qList.length);
  const best=S.best.xk||0;
  if(pct>best){S.best.xk=pct;save()}
  lastScores.xk=Math.max(pct,best);
  showResult({title:"🎓 湖南学考公式冲刺结束",stars:level.stars,big:`${qRight} / ${qList.length}`,
    bigLabel:`训练表现：${level.label}`,
    lines:`训练正确率 <b>${pct}%</b> · 历史最佳 <b>${Math.max(pct,best)}%</b>${pct>best?" · 🎉 新纪录！":""}<br>这是公式单选专项训练，不是完整试卷，也不预测官方合格结果<br>答错关联公式已收进「📕 错题重刷」`,
    extra:{label:"🏆 匿名上训练榜",fn:()=>submitScore("xk")},
    extra2:qRight<13?{label:"📕 去刷错题",fn:()=>startMode("wrong")}:null});
  return;
}
```

Update all best/map/leaderboard renderers:

```js
$("#xkBest").textContent=S.best.xk!=null?`最佳 ${S.best.xk}% 正确率`:"尚未参加";
// boss node status
S.best.xk!=null?`最佳 ${S.best.xk}%`:"BOSS"
// board
xk:{label:"🎓 湖南学考训练榜",hint:"18题公式冲刺最高正确率",fmt:s=>`${s}% 正确率`}
```

- [ ] **Step 6: Sync and run challenge tests**

```bash
cp /Users/mac/test/physics-formula-game.html /Users/mac/test/physics-game-deploy/index.html
node --test tests/hunan-challenge.test.mjs
```

Expected: PASS.

- [ ] **Step 7: Commit authored rendering and results**

```bash
git add index.html tests/hunan-challenge.test.mjs
git commit -m "fix: present Hunan drill results as training feedback"
```

### Task 5: Update the home experience and publish the exact exam boundary in-page

**Files:**
- Modify: `/Users/mac/test/physics-formula-game.html:424-474`
- Modify by sync: `index.html`
- Test: `tests/hunan-challenge.test.mjs`

- [ ] **Step 1: Add failing copy assertions**

Append:

```js
test('shows the official Hunan paper structure without claiming full simulation', () => {
  assert.match(html, /物理考试 60 分钟，满分 100 分/);
  assert.match(html, /18 道单项选择题.*3 道实验题.*3 道计算题/s);
  assert.match(html, /训练只对应单选题基础部分/);
});
```

- [ ] **Step 2: Run the test and verify failure**

Run: `node --test tests/hunan-challenge.test.mjs`

Expected: FAIL because the exam note is absent.

- [ ] **Step 3: Replace the home copy**

Use:

```html
<span class="kicker">湖南高中物理合格考 · 人教版 2019 必修一 / 二 / 三</span>
<p class="sub">必修一 / 二 / 三 · 第 1 ~ 13 章 · <b id="subCnt"></b> 条公式与核心关系</p>
...
<div class="panel-label">② 湖南学考专项 <small>18 道单选题公式冲刺 · 非完整试卷</small></div>
<div class="xk" onclick="startMode('xk')">
  <span class="ic">🎓</span>
  <div>
    <h3>湖南学考·18 题公式冲刺</h3>
    <p>公式辨认、适用条件、基础计算与常见情境；覆盖必修一、二、三</p>
  </div>
  <span class="xkbest" id="xkBest">尚未参加</span>
</div>
<details class="fold exam-note">
  <summary>ℹ️ 湖南物理合格考完整试卷是什么结构？</summary>
  <p>物理考试 60 分钟，满分 100 分：18 道单项选择题共 54 分、3 道实验题共 12 分、3 道计算题共 34 分。本训练只对应单选题基础部分，不是完整试卷，也不预测官方合格结果。</p>
</details>
```

Change the old “学考大考” boss label to “湖南学考”，and change the mode-card description from “42 条学考高频” to “42 条必修概念与物理学史”，because the true/false activity is not the official question format.

- [ ] **Step 4: Sync and run content/challenge tests**

```bash
cp /Users/mac/test/physics-formula-game.html /Users/mac/test/physics-game-deploy/index.html
node --test tests/physics-content.test.mjs tests/hunan-challenge.test.mjs
```

Expected: PASS.

- [ ] **Step 5: Commit the UI boundary copy**

```bash
git add index.html tests/hunan-challenge.test.mjs
git commit -m "feat: explain Hunan qualifying exam boundaries in game"
```

### Task 6: Fix China-local study dates

**Files:**
- Modify: `/Users/mac/test/physics-formula-game.html:1100-1112`
- Modify by sync: `index.html`
- Create: `tests/local-study-date.test.mjs`

- [ ] **Step 1: Add failing local-date tests**

```js
// tests/local-study-date.test.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { extractFunction } from './helpers/inline-script.mjs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const localDateKey = extractFunction(html, 'localDateKey');
const previousLocalDateKey = extractFunction(html, 'previousLocalDateKey', { localDateKey });

test('rolls the study date over at China midnight instead of UTC midnight', () => {
  assert.equal(localDateKey(new Date('2026-07-17T15:59:59Z')), '2026-07-17');
  assert.equal(localDateKey(new Date('2026-07-17T16:00:00Z')), '2026-07-18');
});

test('calculates the previous China-local calendar day', () => {
  assert.equal(previousLocalDateKey(new Date('2026-07-17T16:30:00Z')), '2026-07-17');
});

test('removes UTC ISO slicing from streak logic', () => {
  const streakBlock = html.slice(html.indexOf('function touchStreak'), html.indexOf('function startLevel'));
  assert.doesNotMatch(streakBlock, /toISOString/);
  assert.match(streakBlock, /localDateKey/);
});
```

- [ ] **Step 2: Run the date test and verify failure**

Run: `node --test tests/local-study-date.test.mjs`

Expected: FAIL because the two pure helpers do not exist.

- [ ] **Step 3: Implement explicit `Asia/Shanghai` date keys**

```js
function localDateKey(input=new Date()){
  const parts=new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Shanghai",year:"numeric",month:"2-digit",day:"2-digit"})
    .formatToParts(new Date(input));
  const get=type=>parts.find(part=>part.type===type).value;
  return `${get("year")}-${get("month")}-${get("day")}`;
}
function previousLocalDateKey(input=new Date()){
  return localDateKey(new Date(new Date(input).getTime()-864e5));
}
function touchStreak(now=new Date()){
  const today=localDateKey(now);
  S.stk=S.stk||{last:null,n:0};
  if(S.stk.last===today)return;
  const yesterday=previousLocalDateKey(now);
  S.stk.n=S.stk.last===yesterday?S.stk.n+1:1;
  S.stk.last=today;
  save();
}
```

- [ ] **Step 4: Sync and run the date test**

```bash
cp /Users/mac/test/physics-formula-game.html /Users/mac/test/physics-game-deploy/index.html
node --test tests/local-study-date.test.mjs
```

Expected: 3 tests PASS.

- [ ] **Step 5: Commit the date fix**

```bash
git add index.html tests/local-study-date.test.mjs
git commit -m "fix: count study streaks by China local date"
```

### Task 7: Full regression, static-browser smoke test, and source synchronization

**Files:**
- Verify: `/Users/mac/test/physics-formula-game.html`
- Verify: `/Users/mac/test/physics-game-deploy/index.html`
- Verify: `tests/*.test.mjs`

- [ ] **Step 1: Run all Node tests**

Run: `node --test tests/*.test.mjs`

Expected: all tests PASS, including the four pre-existing `daan-preview` tests.

- [ ] **Step 2: Verify exact source/deploy parity and clean whitespace**

```bash
cmp -s /Users/mac/test/physics-formula-game.html /Users/mac/test/physics-game-deploy/index.html
git diff --check
```

Expected: both commands exit 0.

- [ ] **Step 3: Search for stale claims and malformed content**

```bash
rg -n "67条|67 条|学考冲刺模拟卷|60分合格|60 分合格|合格线 60|等级 [A-E]|A ~ E|能源与可持续发展.*第13|适用于金属导体和电解液|标量，恒为正|η 永远小于|有摩擦力做功就不守恒|toISOString" /Users/mac/test/physics-formula-game.html index.html
```

Expected: no matches.

- [ ] **Step 4: Serve the static site locally**

Run: `python3 -m http.server 4173`

Expected: server listens on `http://127.0.0.1:4173/` and remains running for the next step.

- [ ] **Step 5: Perform desktop and mobile smoke checks**

Using browser automation or the persistent interactive browser, verify:

1. Home shows “湖南高中物理合格考” and the live count 71.
2. Chapter 12 is “电能 能量守恒定律”; chapter 13 is “电磁感应与电磁波初步”.
3. Formula cards visibly separate “适用条件” and “易错”.
4. The Hunan challenge contains exactly 18 four-option questions and includes all three compulsory books.
5. Recognition questions time at 15 seconds; condition/context/calculation questions allow their configured longer time.
6. The result shows `x/18`, accuracy, and training feedback, with no official pass/fail claim.
7. Keyboard keys 1–4 still answer questions.
8. At a 390 px viewport, exam information, cards, buttons, and result copy do not overflow horizontally.
9. Existing `/daan`, `/scene/`, and `/park/` links still open their local routes.

- [ ] **Step 6: Stop the local server and inspect the final diff**

Run: `git diff --stat && git status --short`

Expected: only intended source-controlled files are modified/untracked; no temporary browser artifacts are present.

- [ ] **Step 7: Commit final verification-only adjustments if any**

If smoke testing required a scoped layout or wording adjustment, rerun Steps 1–3 and commit only those changes:

```bash
git add index.html tests
git commit -m "test: finish Hunan physics game regression"
```

If no adjustment was needed, do not create an empty commit.

## Explicit non-deployment boundary

This plan ends with a verified local repository. Do not run `git push`, Cloudflare deployment commands, GitHub Pages publication, DNS changes, or any other external release action without a new explicit user instruction to publish.
