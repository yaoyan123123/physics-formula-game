# HANDOFF · wuliyan.com 双流水线交接文件

> **这是 CC（Claude Code）与 Codex 之间的权威状态文件。** 谁在干活，谁负责在收尾时更新本文件。
> 仓库即记忆：本文件随 git 同步，两条流水线都读写它。冷启动接管时，先完整读这一份，再动手。

---

## 0. 双流水线协议（Dual-Pipeline）

两条流水线，一条限流/中断，另一条无缝顶上，目标是**用户体验上不断线**。

| 流水线 | 常态角色 | 触发接管 |
|---|---|---|
| **CC**（Claude Code / Opus） | 方向布局 + 风控 + 编排 + 验收 + 部署把关 | Codex 卡住/需要判断/需要浏览器实测时 |
| **Codex**（gpt-5.5 xhigh） | 重活执行（写代码/长文/批量/渲染） | **CC 限流或中断时，Codex 接管全部角色** |

**默认分工（用户 2026-07-19 确认，常态执行不用每次问）**：**一切费 token 的重活默认下沉 Codex**——写/改大段代码、长文、批量处理、PDF/图片渲染、内容生成。CC 只做：任务拆解派单、方向与风控判断、浏览器实测验收、部署把关。CC 起手一个耗 token 任务前，先想「这该派给 Codex」；除非是小改动或需要 CC 独有能力（浏览器实测/编排判断/红线把关）。

**失效切换（Failover）规则：**
1. 用户说「让 codex 接管 / codex 上 / CC 限流了」→ Codex 读本文件的「当前状态」+「待办」两节，从断点继续。
2. 接管方**每完成一个动作，追加一行到文末「交接日志」**（时间 + 谁 + 干了什么 + 线上是否变化）。这样另一条流水线回来能秒懂发生了什么。
3. **冲突避免**：同一时刻只有一条流水线改同一个文件。改前看「当前状态」里该文件是否标注「占用中」。
4. **回切**：CC 恢复后读「交接日志」增量，接着往下走，不重复已完成的动作。

---

## 1. 项目全景（wuliyan.com）

- **线上**：https://wuliyan.com （+ www）· Cloudflare Pages 项目 `physics-formula-game` · 账号 yao091926@gmail.com · Account ID `89874463f6ba1b59bca9e7707a1c29c2` · Free 计划零费用
- **备用线**：https://yaoyan123123.github.io/physics-formula-game/ （GitHub Pages）
- **域名**：wuliyan.com 在阿里云，¥85/年（唯一持续成本），NS 指 Cloudflare，zone `5ed8482d4766b508d99b882e926a0161`
- **仓库**：`/Users/mac/test/physics-game-deploy`（git remote origin = github yaoyan123123/physics-formula-game）
- **游戏主源**：`/Users/mac/test/physics-formula-game.html`（单文件；部署时 cp 成 `physics-game-deploy/index.html`）
- **页面结构**：`/`=公式游戏 · `/daan`=期末全科答案页（物理全解置顶+九科全屏预览查看器）· `/api/rank`=五榜匿名榜（KV `wuliyan-rank` id `8aee1de0959a4c83a106cb05d4fc167c`，Pages 变量 RANK）

## 2. 部署方式 + ⚠️ 红线

**CF token 自救**：`/Users/mac/test/cf-token.sh` → 自动验活/refresh/写回 wrangler config 并输出可用 token。token 过期不用麻烦用户重登。

**⚠️ 部署红线（2026-07-19 起）**：Codex 在本仓库建了 `.worktrees/`（含**未验收的"湖南合格考版" index.html**）、`docs/`、`tests/`、`node_modules/`。
- `deploy-game.sh` 会 `cp 主源→index.html` 且 wrangler 全量上传整目录 → **一跑就会把①未验收的湖南版游戏 ②worktree/docs/tests 一起推上线泄露**。
- **安全部署法（必须用这个）**：rsync 到干净暂存目录后再 deploy：
  ```bash
  STAGE=/tmp/deploy-stage; rm -rf $STAGE; mkdir -p $STAGE
  cd /Users/mac/test/physics-game-deploy
  rsync -a --exclude='.git' --exclude='.worktrees' --exclude='docs' --exclude='tests' \
    --exclude='node_modules' --exclude='.DS_Store' --exclude='*.orig' --exclude='*.bak' \
    --exclude='poster*.png' --exclude='qr.png' --exclude='deploy-game.sh' ./ $STAGE/
  TOKEN=$(/Users/mac/test/cf-token.sh)
  cd $STAGE
  CLOUDFLARE_API_TOKEN="$TOKEN" CLOUDFLARE_ACCOUNT_ID=89874463f6ba1b59bca9e7707a1c29c2 \
    npx --yes wrangler@3 pages deploy . --project-name physics-formula-game --branch main --commit-dirty=true
  ```
- **泄露自检**：`curl -s "https://wuliyan.com/.worktrees/hunan-physics-game-accuracy/index.html?cb=$(date +%s)" | grep -c 湖南` → **0=干净**（SPA 兜底返回游戏首页），>0=脏部署要重发。
- **绝对不要**在没验收的情况下把「湖南版」游戏部署成生产。

## 3. 当前状态（2026-07-19）

- ✅ **daan 全科页**：已修好并上线。九科每科「📝预览试卷/✅预览答案」= 全屏翻页查看器（翻页/下载原版/关闭/键盘/触屏），物理全解彩版置顶。18 份原版文件（16 PDF+2 docx）+ 75 页预览图全部 200，与原版逐字节一致。
- ✅ **线上游戏**：仍是**旧版**（湖南版未上线），五榜匿名榜正常。
- 🟡 **湖南合格考版（待用户验收）**：`physics-formula-game.html` 主源已被 Codex 改成湖南合格考版（71 卡 / 18 题训练 / 学考训练榜 / 删了"60分合格·A~E等级·完整模拟卷"等不严谨表述），在功能分支 `feat/hunan-physics-game-accuracy`，**未合并未部署**。上线前需用户抽查内容拍板。
- 文件占用：无（都已释放）。

## 4. 待办 / 下一步

1. **[需用户拍板]** 湖南合格考版是否上线？用户抽查公式卡+题目后决定；要上则用 §2 安全部署法。
2. **[技术债]** 部署仓库被 Codex 塞进了 worktree/docs/tests/node_modules，污染了"纯部署目录"。已用 `.assetsignore` + 暂存 rsync 兜住泄露，但根治要清理这些目录（涉及 Codex 分支工作，需用户同意后做）。
3. **[可选增长]** PWA 离线（已备好 sw.js/manifest/icon 但按用户要求关闭中）、变现钩子（抖音号引流位）、访问统计观察。

---

## 交接日志（append-only，最新在最上）

- `2026-07-19 CC` — **湖南合格考版已上线生产**（用户拍板）。部署前集成把关抓到并修复一个真bug：湖南 xk 榜改成"18题正确率%"，但 rank.js 对 xk 有 step:5 校验会拒非5倍数百分比→已去掉 xk 的 step:5。安全部署（rsync 暂存绕开 worktree/docs/tests）。线上核验：游戏=湖南版✓、泄露检查三路径均返回SPA兜底HTML非原始文件✓、daan页正常✓、xk榜接受78%✓、PWA仍关✓。清空 xk 榜测试数据。线上**已变化**（游戏首页=湖南合格考版）。§3状态「湖南版待验收」→ 改为「已上线」。

- `2026-07-19 CC` — 独立验收湖南版（CC 风控职责，不下沉）：卡数 71✓、13章章名对（12=电能 能量守恒定律、13=电磁感应与电磁波初步）✓、关键公式修正到位（平均速度=Δx/Δt、功率 Fvcosα、库仑/场强带绝对值、安培力 BILsinθ）✓、不准确表述 0 残留✓、考试边界说明齐全✓、19 个测试逐个跑全绿✓。**内容验收 PASS**。剩最后一关=用户产品决策（是否把公开游戏重定位为湖南合格考训练）。线上未变。

- `2026-07-19 CC` — 修复 daan.html 全屏查看器（补 .viewer CSS + 删死 CSS）；安全部署（rsync 暂存，绕开 worktree/湖南版）；线上核验泄露=0、九科预览+18原版文件全 200、游戏仍旧版；建立本双流水线文件。线上**已变化**（daan 页更新）。
