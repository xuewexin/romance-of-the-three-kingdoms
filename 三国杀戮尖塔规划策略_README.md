# 《乱世残卷：建安魔障》— 三国题材卡牌构筑肉鸽（DBG Roguelike）项目规划与架构文档

> **项目定位**：一款融合《杀戮尖塔》（Slay the Spire）核心深度卡牌构筑机制与暗黑水墨三国幻想题材的 2D 策略肉鸽游戏。  
> **核心特色**：双端动作队列（Action Queue）驱动的严谨结算管线、数据驱动的原子化卡牌配置、融合三国典故的【连环计】【八阵图】【刀势】特色流派体系。

---

## 目录

1. [项目概述与核心设计理念](#一-项目概述与核心设计理念)  
2. [游戏引擎选型与技术栈策略](#二-游戏引擎选型与技术栈策略)  
3. [世界观架构与四幕战役剧情规划](#三-世界观架构与四幕战役剧情规划)  
4. [首发角色设定与核心流派构筑](#四-首发角色设定与核心流派构筑)  
5. [局内核心循环与沙盘系统设计](#五-局内核心循环与沙盘系统设计)  
6. [战斗数值体系与特色机制设计](#六-战斗数值体系与特色机制设计)  
7. [底层代码架构与核心实现逻辑](#七-底层代码架构与核心实现逻辑)  
8. [项目目录结构规范](#八-项目目录结构规范)  
9. [分阶段开发路线图（Roadmap）](#九-分阶段开发路线图roadmap)

---

## 一、 项目概述与核心设计理念

### 1.1 立项背景

《杀戮尖塔》奠定了现代 DBG（Deck-Building Game）肉鸽品类的黄金标准：极简的回合制算术博弈、高度自洽的遗物-卡牌协同效应（Synergy）以及丰富的重玩价值。本项目将东汉末年群雄割据的战争美学、兵法奇谋与该品类深度结合，用“军令、武技、韬略、兵法、兵符、奇门阵眼”重塑卡牌战斗体验。

### 1.2 核心设计支柱

* **深度的协同构筑（Synergy First）**：拒绝单纯的数值膨胀，围绕武将核心机制（如关羽的“蓄势一刀”、诸葛亮的“四象阵眼切换”、甘宁的“火油引爆与零费袖箭”）设计跨卡牌、跨兵符的化学反应。  
* **透明的确定性博弈（Deterministic Strategy）**：继承《杀戮尖塔》“明牌意图”机制，敌方将领每回合的行动意图（强攻、筑防、施法、蓄力）完全公开，且随玩家施加的虚弱/破绽状态实时动态重算，强调算血与资源调度。  
* **高扩展性的数据驱动架构（Data-Driven Architecture）**：卡牌、兵符、敌将 AI 与奇遇事件全部采用 JSON / 自定义资源配置，由原子动作（Atomic Actions）组合而成，支持快速迭代与创意工坊 Mod 扩展。

---

## 二、 游戏引擎选型与技术栈策略

卡牌肉鸽游戏的核心技术痛点不在于重度物理碰撞或 3D 光影，而在于 **高频 UI 状态同步、丝滑的贝塞尔曲线卡牌拖拽动画、严格保序的异步结算队列**。

| 评估维度 | 方案 A：Godot 4.x（独立开发首推） | 方案 B：Vue 3 \+ TypeScript \+ PixiJS（Web/跨端快速原型） | 方案 C：Unity（商业化团队标准） |
| :---- | :---- | :---- | :---- |
| **开发语言** | GDScript / C\# | TypeScript \+ HTML5/CSS3 | C\# |
| **数据驱动方式** | 原生自定义 `Resource` (`.tres`) \+ JSON | TypeScript 强类型 Schema \+ JSON 配置表 | `ScriptableObject` \+ Luban/Excel 导表 |
| **UI 与卡牌排版** | 内置 `Control` 节点树与容器系统，极度轻量 | CSS3 Flex/Transform 实现扇形手牌与 3D 翻转极简单 | UGUI \+ `DOTween` 插件定制 |
| **动画与特效** | 原生 `Tween` \+ `AnimationPlayer` \+ GPUParticles2D | GSAP 动画库 \+ PixiJS Canvas 粒子渲染层 | `DOTween` \+ `Spine` 2D 骨骼动画 |
| **打包与跨平台** | 一键导出 Windows / Android / Web | 浏览器直玩，Electron 封装桌面端，Capacitor 封装移动端 | 全平台（PC / 主机 / 移动端 / 小游戏） |

### 推荐决策路线

1. **桌面独立游戏路线（Steam 发行）**：选用 **Godot 4.x**。每个卡牌、遗物、状态均可直接映射为独立 Scene，Godot 原生的 `Signal`（信号）机制天然契合遗物触发器与事件总线设计。  
2. **轻量跨端与快速验证路线**：选用 **Vue 3 \+ Pinia \+ GSAP \+ PixiJS**。利用响应式状态管理处理牌堆流转，DOM \+ CSS 3D 处理卡牌悬停与贝塞尔箭头瞄准，Canvas 负责刀光与火攻特效，1\~2 周即可跑通完整 MVP 战斗闭环。

---

## 三、 世界观架构与四幕战役剧情规划

### 3.1 故事背景：《乱世残卷：建安魔障》

东汉熹平年间，洛阳地脉深处的上古九鼎崩裂，九州山河坠入名为\*\*“煞气轮回”**的时空死局。战死沙场的名将与苍生执念受煞气侵蚀，化为盘踞在历史节点上的妖魔。玩家作为被神秘古卷**《南华仙书》\*\*（定位对应原版“涅奥 Neow”）唤醒的宿命破局者，在每一次轮回重生中选择开局赐福，踏上斩断建安魔障的北伐与东征之路。

### 3.2 四幕战役沙盘规划

#### 第一幕：黄巾妖境（颍川 — 广宗）

* **环境视觉**：枯木荒村、贴满黄符的祭坛、雷云密布的旷野。  
* **普通敌军池**：黄巾诵咒师（叠加仪式增伤）、饥饿流民群（多单位高频低伤）、符水力士（高血量高格挡）。  
* **精英猛将池**：  
  * **地公将军·张宝**：每 2 回合召唤“纸人替身”分摊伤害，并对玩家牌库塞入《妖言惑众》（状态废牌）。  
  * **管亥**：回合数越久【狂暴】层数越高，考验玩家前 4 回合的爆发输出（DPS 检测器）。  
* **守关大将（三选一随机）**：  
  * **天公将军·张角**：在“诵经蓄雷”与“苍天已死（巨额群体雷击）”姿态间切换；受到一定伤害后进入失衡。  
  * **人公将军·张梁**：依托“黄天百炼盾”获得高额护甲，每隔 3 回合发动护甲等额的碾压重击。

#### 第二幕：虎牢血关（洛阳焦土 — 长安迷城）

* **环境视觉**：焚毁的洛阳皇宫、尸骸遍野的虎牢关隘、暗藏杀机的长乐宫。  
* **普通敌军池**：西凉铁骑（自带金属化护甲）、李傕&郭汜双首领组合、宫廷刺客（施加流血与破绽）。  
* **精英猛将池**：  
  * **陷阵统领·高顺**：全员自带高额格挡与反伤【铁壁】，考验玩家破甲或法术直伤能力。  
  * **毒士·贾诩**：不直接高额输出，但持续向玩家抽牌堆洗入《内乱》《猜忌》诅咒并施加【虚弱】【封技】。  
* **守关大将（二选一随机）**：  
  * **暴虐魔王·董卓**：伴随两名“飞熊亲卫”，拥有【酒池肉林】机制（吞噬残血亲卫回复生命并获得力量）。  
  * **魔神飞将·吕布**：单体极致数值 Boss，每回合根据玩家打出的卡牌类型积攒【无双值】，满层后释放无视部分格挡的多段连斩。

#### 第三幕：赤壁冥河（荆襄水寨 — 乌林火海）

* **环境视觉**：铁索连舟的滔天江面、迷雾笼罩的奇门水寨、业火燃烧的战船甲板。  
* **普通敌军池**：铁索连环战船（共享生命或死亡殉爆）、江东锦帆死士、摸金校尉。  
* **精英猛将池**：  
  * **古之恶来·典韦**：进入半血后开启【死战】免死一回合，并大幅反弹近战武技伤害。  
  * **江东小霸王·孙策**：高速多段攻击，每回合限制玩家打出的同类型卡牌上限。  
* **守关大将**：  
  * **魏武霸王·曹操**：分为两阶段。一阶段【挟天子以令诸侯】统御许褚、夏侯惇英魂协同作战；二阶段开启【短歌行·天下归心】，每当玩家使用【兵法（能力牌）】时曹操同步获得强化。

#### 第四幕（终幕隐藏关）：天命灵枢（九鼎祭坛）

* **解锁条件**：在前三幕中集齐三卷天书残页：  
  1. **天之卷**：在军帐休整点放弃回血/锻造，选择【祭天】获取。  
  2. **地之卷**：在西域行商或宝箱节点放弃一件兵符，开启封印匣获取。  
  3. **人之卷**：击败任意一幕带有“煞气加护（额外强化词条）”的超级精英猛将获取。  
* **终极守关 Boss**：**【建安天命之灵】**  
  * 拥有 **【历史律令（单回合伤害上限锁血）】** 与 **【岁月反噬（玩家每打出一张牌受到 1\~2 点真实伤害）】**，彻底检验玩家卡组的攻防一体度与循环稳定性。

---

## 四、 首发角色设定与核心流派构筑

对标《杀戮尖塔》多职业差异化体验，规划三位机制截然不同的首发武将：

### 4.1 陷阵狂刀 · 关羽（物理 / 蓄势 / 卖血铁壁）

* **角色定位**：易于上手、攻防刚猛，对标“铁甲战士（Ironclad）”并融合蓄力刀法。  
* **初始属性**：生命值 `80/80` \| 初始铜钱 `99`  
* **初始兵符**：**【武圣战髯】** —— 每场战斗结束时，回复 6 点生命值；若本场战斗曾触发过【刀势】满层斩击，额外回复 2 点。  
* **核心机制与三大流派**：  
  1. **【刀势蓄力流】**：核心词条 **【刀势】**（每层使下一张打出的“刀法”武技牌伤害 \$+3\$ 并可继承至下回合）。配合《温酒》《拖刀计》《青龙偃月斩（消耗所有刀势，每层造成双倍倍率伤害）》实现一刀秒杀。  
  2. **【刮骨血怒流】**：主动损失生命值换取费用、抽牌与高额【武力（力量）】。代表卡：《刮骨疗毒》（失去 3 点生命，移除自身所有负面状态并抽 2 张牌）、《血染征袍》（每场战斗中每主动失血一次，此牌费用 \$-1\$ 且伤害 \$+5\$）、《死战不退》（能力：每当你在自己的回合失去生命，获得 2 点武力）。  
  3. **【重甲军阵流】**：围绕高额【格挡】做文章。代表卡：《据水断桥》（获得 15 点格挡）、《铁桶军阵》（能力：回合开始时格挡不再清空）、《重甲冲锋》（造成等同于当前格挡值的兵刃伤害）。

### 4.2 奇门鬼谋 · 诸葛亮（阵眼充能 / 观星卜算 / 锦囊弃牌）

* **角色定位**：注重排序、阵法运营与连携爆发，融合“故障机器人（Defect）”的充能球与“观者（Watcher）”的预知机制。  
* **初始属性**：生命值 `70/70` \| 初始铜钱 `99`  
* **初始兵符**：**【乾坤八卦盘】** —— 每场战斗开始时，自动生成 1 个随机【奇门阵眼】。  
* **核心机制与三大流派**：  
  1. **【八阵图四象流】**：角色拥有默认 3 个【阵眼槽位】，可召唤四类阵眼（存在【被动回合末效果】与【破阵激发效果】）：  
     * **火阵**：被动对生命最低敌军造成 3 点灼烧伤害；激发时对全体敌军造成 8 点火焰伤害。  
     * **雾阵**：被动在回合末提供 3 点格挡；激发时获得 7 点格挡。  
     * **雷阵**：被动在每次打出韬略牌时随机劈击 2 点伤害；激发时触发 3 次随机落雷。  
     * **风阵**：无被动；激发时回复 1 点【军令】并抽 1 张牌。  
     * 配合能力牌《奇门遁甲》（提升【运筹/集中】属性，全面增加所有阵眼数值）形成全自动炮台。  
  2. **【观星天机流】**：核心词条 **【观星 X】**（检视抽牌堆顶 X 张牌，将任意数量置入弃牌堆）。配合带有 **【天机】** 词条的锦囊牌（当此牌在观星过程中被直接弃置时，无需消耗军令自动触发效果），实现零费高速过牌与控顶。  
  3. **【草船反制流】**：将敌方的多段攻击转化为我方抽牌与羽毛箭矢资源，利用《空城计》（手牌为空时获得巨额减伤）达成极限防守反击。

### 4.3 锦帆暗影 · 甘宁（零费袖箭 / 火油引爆 / 奇袭连环）

* **角色定位**：高频操作、持续异常状态叠加与费用欺诈，对标“静默猎手（Silent）”。  
* **初始属性**：生命值 `72/72` \| 初始铜钱 `99`  
* **初始兵符**：**【百翎惊帆铃】** —— 每场战斗第一回合额外抽取 2 张牌，并向手牌加入 1 张 0 费《袖箭》。  
* **核心机制与三大流派**：  
  1. **【火烧连营流（火油 DoT）】**：给敌军叠加 **【火油】** 层数。回合结束时目标受到等同于【火油】层数的伤害，随后层数减半；若使用带有 **【引燃】** 词条的火焰牌（如《火箭齐发》《火烧赤壁》），立刻结算当前全部火油伤害并向相邻敌军传染。  
  2. **【千刃袖箭流（0 费连击）】**：通过《锦帆夜袭》《机关连弩》生成大量 0 费消耗卡《袖箭》（造成 4 点伤害），配合能力牌《百步穿杨》（《袖箭》伤害 \$+4\$）与兵符【连环锁】（每回合每打出 3 张武技牌，获得 4 点格挡或 1 点敏捷）打出风暴式连击。  
  3. **【劫营奇袭流（弃牌循环）】**：主动弃置手牌触发额外收益。《轻骑劫营》（抽 3 张牌并弃置 2 张）、《暗渡陈仓》（本牌被手动弃置时，直接为你恢复 2 点军令）。

---

## 五、 局内核心循环与沙盘系统设计

### 5.1 15 层 DAG（有向无环图）地图生成算法

每一幕地图由 `7 列 × 15 层` 网格构成，通过程序化算法生成有向无环路径：

2. **路径撒点**：在第 1 层随机选择 3\~4 个起点，向上逐层连接至第 14 层，第 15 层统一汇聚至守关 Boss 节点。  
3. **防交叉约束**：若节点 `(row, col)` 连向 `(row+1, col+1)`，则禁止 `(row, col+1)` 连向 `(row+1, col)`，确保视觉路线绝不出现“X”型交叉。  
4. **固定层与规则约束**：  
   * **第 1 层**：固定为普通前哨战（帮助玩家热身拿第一张卡）。  
   * **第 8 层**：固定为【军资宝库】（全员免费获取 1 件随机兵符）。  
   * **第 14 层**：固定为【大军营帐】（Boss 战前最后一次休整回血或锻造升级）。  
   * **第 6 层之前**：禁止刷出【猛将营（精英怪）】与【军帐】，避免玩家卡组未成型暴毙或满血浪费营火。  
   * **连续去重**：严禁同一路径上连续出现 2 个【西域行商】、2 个【军帐】或 2 个【猛将营】。

### 5.2 三国特色随机奇遇事件（`?` 节点）示例

| 奇遇名称 | 剧情描述 | 选项与收益/代价设计 |
| :---- | :---- | :---- |
| **《刮骨疗毒》** | 偶遇神医华佗在帐中研磨麻沸散，愿为你剔除体内煞气。 | **选项 A \[刮骨\]**：失去 15% 当前生命值，从牌组中永久移除最多 2 张牌。 **选项 B \[敷药\]**：回复 25% 最大生命值，但牌组塞入 1 张《隐痛》状态牌。 |
| **《草船借箭》** | 大雾弥漫江面，曹军水寨万箭齐发，你立于稻草船头。 | **选项 A \[擂鼓受箭\]**：承受 14 点伤害，随机获得 2 张稀有度为“罕见/稀有”的远程武技牌。 **选项 B \[顺流撤退\]**：安全离开，获得 35 铜钱。 |
| **《三顾茅庐》** | 风雪交加的隆中草庐外，先生正在堂内昼寝。 | **选项 A \[恭敬静候\]**：失去 50 铜钱，从 3 张强力【兵法（能力牌）】中自选 1 张加入牌组。 **选项 B \[破门求策\]**：直接获得 1 张随机罕见卡牌，同时获得【傲慢】诅咒。 |
| **《温酒斩华雄》** | 关外敌将叫阵，帐中樽酒尚温，众诸侯面面相觑。 | **选项 A \[提刀出战\]**：立即进入一场特殊精英战，若在 3 回合内获胜，额外获得传奇兵符【温酒金樽】与 100 铜钱。 |

---

## 六、 战斗数值体系与特色机制设计

### 6.1 核心属性与状态（Buff / Debuff）表

| 状态名称 | 类型 | 叠层逻辑 | 详细结算机制 |
| :---- | :---- | :---- | :---- |
| **【武力】（Strength）** | 增益/减益 | 数值累加（可为负） | 每层使角色的【武技】攻击基础伤害增加（或减少）对应点数。 |
| **【守备】（Dexterity）** | 增益/减益 | 数值累加 | 每层使角色从卡牌中获取的【格挡】数值增加对应点数。 |
| **【运筹】（Focus）** | 增益 | 数值累加 | 诸葛亮专属，每层提高所有【奇门阵眼】的被动与激发数值。 |
| **【破绽】（Vulnerable）** | 减益 | 持续回合累加 | 受到的【武技】攻击伤害提高 **50%**（若持有特定兵符提高至 75%），每回合末 \$-1\$ 层。 |
| **【怯战】（Weak）** | 减益 | 持续回合累加 | 造成的【武技】攻击伤害降低 **25%**，每回合末 \$-1\$ 层。 |
| **【断粮】（Frail）** | 减益 | 持续回合累加 | 从卡牌获得的【格挡】数值降低 **25%**，每回合末 \$-1\$ 层。 |
| **【刚烈】（Thorns）** | 增益 | 数值累加 | 每当受到【武技】攻击时，立即向攻击者反弹等同于层数的固定伤害。 |
| **【火油】（Oil Burn）** | 减益 | 数值累加 | 回合结束时受到等同于层数的无视格挡伤害，随后层数减半（向下取整）。 |

### 6.2 标准伤害结算管线公式

每次执行 `DealDamageAction` 时，伤害必须严格按照以下加乘顺序经过事件管线处理，最终结果向下取整（`Math.floor`）：

\$\$\\text{FinalDamage} \= \\left\\lfloor \\left( (\\text{BaseDamage} \+ \\text{FlatModifiers} \+ \\text{Strength}) \\times \\text{AttackerMultipliers} \\times \\text{DefenderMultipliers} \\right) \\right\\rfloor\$\$

* **AttackerMultipliers（攻击方乘区）**：包含【怯战】（\$\\times 0.75\$）、【无双姿态】（\$\\times 2.0\$）等。  
* **DefenderMultipliers（受击方乘区）**：包含【破绽】（\$\\times 1.5\$）、【空城减伤】（\$\\times 0.5\$）等。  
* **护甲抵扣**：最终伤害优先扣除目标当前 `Block`（格挡值），溢出部分扣除 `CurrentHP`。

### 6.3 三国特色词条：【连环计（Combo Chain）】

* **设计目的**：还原三国战役中“铺垫—引爆”的谋略感。  
* **实现规则**：全局战斗上下文维护一个 `played_tags_this_turn` 列表。  
  * 前置牌（如《借东风》）附带 `provides_tag: "WIND"`。  
  * 后置牌（如《火烧赤壁》）声明 `combo_require: "WIND"`，当检测到本回合已存在 `"WIND"` 标签时，触发高亮金框提示，打出后追加 `combo_actions`（如：伤害翻倍、费用返还或全体传染火油）。

---

## 七、 底层代码架构与核心实现逻辑

开发《杀戮尖塔》类游戏最核心的工程铁律：**严禁在卡牌点击函数里直接用 `if-else` 修改怪物血量或抽牌**。必须采用 **双端动作队列（Action Queue） \+ 事件总线（Event Bus） \+ 数据驱动配置** 三层解耦架构。

### 7.1 核心引擎：双端动作队列（Action Queue / Command Pattern）

#### 为什么必须使用动作队列？

假设玩家打出一张《横扫千军（对全体造成 8 点伤害，随后抽 1 张牌）》：

1. 怪物 A 身上有【刚烈（反伤 3 点）】。  
2. 玩家身上有兵符【血玉（每当你在回合内失去生命，立即对随机敌人造成 5 点伤害）】。  
3. 怪物 B 只有 4 点血，拥有【自爆（死亡时对玩家造成 10 点伤害）】。

如果直接同步调用函数，调用栈会深度嵌套，导致动画同时播放、死亡判定错乱。通过 **双端动作队列（Deque）**，所有卡牌、兵符、Buff 仅负责向队列推入 `GameAction` 对象：

* **`addToBottom(action)`**：正常顺序执行的后续动作（如卡牌自身的第 1 段、第 2 段效果）推入**队尾**。  
* **`addToTop(action)`**：由受伤、死亡、出牌瞬间触发的被动反应（如反伤、遗物插队触发、死亡自爆）推入**队首**，确保因果反应在下一个主动作之前优先结算并播完动画！

#### 核心动作队列代码实现（TypeScript / GDScript 通用逻辑参考）

```ts
// 1. 抽象动作基类
export abstract class GameAction {
  public isDone: boolean = false;
  public duration: number = 0.25; // 默认动画留白时长（秒）

  // 执行动作核心逻辑（支持异步动画等待）
  public abstract execute(ctx: BattleContext): Promise<void>;
}

// 2. 双端动作队列管理器
export class ActionQueueManager {
  private queue: GameAction[] = [];
  private isProcessing: boolean = false;

  // 常规动作推入队尾（如卡牌顺序描述的效果）
  public addToBottom(action: GameAction, ctx: BattleContext): void {
    this.queue.push(action);
    this.processNext(ctx);
  }

  // 衍生触发动作插入队首（如反伤、兵符即时响应、亡语）
  public addToTop(action: GameAction, ctx: BattleContext): void {
    this.queue.unshift(action);
    this.processNext(ctx);
  }

  private async processNext(ctx: BattleContext): Promise<void> {
    if (this.isProcessing) return;
    this.isProcessing = true;

    while (this.queue.length > 0) {
      // 弹出队首动作
      const currentAction = this.queue.shift()!;
      
      // 校验战斗是否已分出胜负
      if (ctx.isBattleOver()) {
        this.queue = [];
        break;
      }

      // 执行当前动作并等待其关联的 UI 动画/飘字完成
      await currentAction.execute(ctx);
    }

    this.isProcessing = false;
    ctx.onQueueEmpty(); // 队列清空后通知 UI 恢复玩家可出牌交互状态
  }
}
```

#### 具体原子动作示例：`DealDamageAction` 与被动插队

```ts
export class DealDamageAction extends GameAction {
  constructor(
    private source: Unit,
    private target: Unit,
    private baseDamage: number,
    private damageType: 'NORMAL' | 'THORNS' | 'HP_LOSS' = 'NORMAL'
  ) {
    super();
  }

  public async execute(ctx: BattleContext): Promise<void> {
    if (this.target.isDead()) return;

    // 1. 通过修饰器管线计算最终伤害
    let finalDmg = ctx.damagePipeline.calculate(
      this.source,
      this.target,
      this.baseDamage,
      this.damageType
    );

    // 2. 扣除格挡与生命值
    const unblockedDmg = this.target.takeDamage(finalDmg, this.damageType);

    // 3. 播放受击动画与伤害飘字
    await ctx.vfxManager.playHitEffect(this.target, finalDmg);

    // 4. 触发受击钩子（注意：被动反伤使用 addToTop 插队到队列最前面！）
    if (this.damageType === 'NORMAL') {
      ctx.eventBus.emit('ON_ATTACKED', {
        attacker: this.source,
        defender: this.target,
        unblockedDmg,
        queue: ctx.actionQueue // 监听器内部可调用 queue.addToTop(...)
      });
    }

    // 5. 死亡判定与亡语插队
    if (this.target.currentHp <= 0) {
      ctx.actionQueue.addToTop(new UnitDieAction(this.target));
    }
  }
}
```

---

### 7.2 全局事件总线与生命周期钩子（Event Bus & Hooks）

所有**兵符（Relics）**、\*\*常驻兵法（Powers）**与**状态（Buffs）\*\*均实现统一的订阅接口，挂载在以下核心时机钩子上：

| 钩子名称（Hook Event） | 触发时机 | 典型应用案例（兵符 / 卡牌能力） |
| :---- | :---- | :---- |
| `ON_BATTLE_START` | 战斗初始化洗牌完毕后 | **【赤兔马】**：首回合向队尾推入 `GainEnergyAction(1)` 与 `DrawCardAction(2)`。 |
| `ON_TURN_START` | 我方回合开始恢复军令前 | **【屯田策】**：回合开始时推入 `GainBlockAction(player, 4)`。 |
| `ON_CARD_PLAYED` | 玩家成功打出任意卡牌时 | **【孟德新书】**：计数器 \$+1\$，满 10 时赋予玩家 `NextCardFreeBuff`。 |
| `ON_CARD_DISCARDED` | 手牌被手动弃置或观星弃置时 | **《暗渡陈仓》**：若为手动弃牌，向队首插入 `GainEnergyAction(2)`。 |
| `ON_MODIFY_DAMAGE_GIVE` | 攻击方计算输出乘区时 | **【青釭剑】**：若目标拥有格挡，基础伤害额外 \$+50%\$。 |
| `ON_ATTACKED` | 单位受到武技攻击结算后 | **【夏侯惇·刚烈】**：向队首插入 `DealDamageAction(target, attacker, 3, 'THORNS')`。 |
| `ON_MONSTER_DEATH` | 敌方单位生命归零时 | **【传国玉玺】**：击杀敌军时回复 1 点军令并抽 1 张牌。 |
| `ON_TURN_END` | 玩家点击“结束回合”弃牌前 | **【八阵图】**：依次触发所有槽位中奇门阵眼的回合末被动效果。 |

---

### 7.3 数据驱动 JSON 配置规范（Cards / Enemies / Relics）

#### 1\. 卡牌配置表（`cards_guanyu.json`）

```json
[
  {
    "id": "gy_warm_wine_slash",
    "name": "温酒斩华雄",
    "character": "GUAN_YU",
    "rarity": "RARE",
    "type": "ATTACK",
    "cost": 2,
    "target": "SINGLE_ENEMY",
    "exhaust": true,
    "tags": ["BLADE", "STRIKE"],
    "description": "造成 {damage} 点伤害。【斩杀】：永久使此牌基础伤害增加 {meta_scale} 点，并恢复 2 点【军令】。【消耗】。",
    "base_stats": {
      "damage": 16,
      "meta_scale": 4
    },
    "upgraded_stats": {
      "cost": 2,
      "damage": 20,
      "meta_scale": 6
    },
    "actions": [
      {
        "type": "FATAL_DAMAGE",
        "value_ref": "damage",
        "on_fatal_actions": [
          { "type": "PERMANENT_INCREASE_CARD_STAT", "stat": "damage", "value_ref": "meta_scale" },
          { "type": "GAIN_ENERGY", "value": 2 }
        ]
      }
    ]
  },
  {
    "id": "gy_drag_blade",
    "name": "拖刀计",
    "character": "GUAN_YU",
    "rarity": "UNCOMMON",
    "type": "SKILL",
    "cost": 1,
    "target": "SELF",
    "description": "获得 {block} 点格挡。获得 {blade_stance} 层【刀势】。",
    "base_stats": {
      "block": 8,
      "blade_stance": 2
    },
    "upgraded_stats": {
      "block": 11,
      "blade_stance": 3
    },
    "actions": [
      { "type": "GAIN_BLOCK", "value_ref": "block" },
      { "type": "APPLY_BUFF", "buff_id": "BLADE_STANCE", "value_ref": "blade_stance" }
    ]
  }
]
```

#### 2\. 敌将 AI 意图与行动权重表（`enemies_act1.json`）

敌将 AI 并非纯随机，而是结合**回合数条件**、**权重随机**与**连续释放冷却限制（`max_consecutive`）**：

```json
{
  "enemy_id": "boss_zhang_jiao",
  "name": "天公将军·张角",
  "max_hp_range": [240, 250],
  "moves": {
    "CHANT_THUNDER": {
      "intent_type": "BUFF",
      "max_consecutive": 1,
      "actions": [
        { "type": "APPLY_BUFF", "target": "SELF", "buff_id": "THUNDER_CHARGE", "stacks": 1 },
        { "type": "GAIN_BLOCK", "target": "SELF", "value": 12 }
      ]
    },
    "YELLOW_SKY_WRATH": {
      "intent_type": "ATTACK_DEBUFF",
      "base_damage": 28,
      "hits": 1,
      "max_consecutive": 1,
      "actions": [
        { "type": "DEAL_DAMAGE", "value": 28 },
        { "type": "ADD_CARD_TO_DISCARD", "card_id": "status_dazed", "count": 2 }
      ]
    },
    "TALISMAN_STRIKE": {
      "intent_type": "MULTI_ATTACK",
      "base_damage": 6,
      "hits": 3,
      "max_consecutive": 2,
      "actions": [
        { "type": "DEAL_MULTI_DAMAGE", "value": 6, "hits": 3 }
      ]
    }
  },
  "ai_pattern": {
    "turn_1": "CHANT_THUNDER",
    "conditional": [
      { "if_self_has_buff": "THUNDER_CHARGE", "force_move": "YELLOW_SKY_WRATH" }
    ],
    "default_weights": {
      "CHANT_THUNDER": 45,
      "TALISMAN_STRIKE": 55
    }
  }
}
```

---

## 八、 项目目录结构规范

以下提供通用清晰的模块化工程目录（同时适配 Godot 与 TypeScript/前端架构）：

```
three-kingdoms-spire/
├── README.md                        # 项目总体规划与架构说明文档
├── assets/                          # 美术与音频资源
│   ├── characters/                  # 武将立绘、骨骼动画 (Spine/帧动画)
│   ├── cards/                       # 卡牌插画、外框模板（武技/韬略/兵法）
│   ├── vfx/                         # 刀光、火油、落雷粒子贴图與 Shader
│   └── audio/                       # 古琴/战鼓 BGM 与刀剑受击音效
├── data/                            # 纯数据驱动配置表 (JSON / Resource)
│   ├── cards/                       # 分角色卡牌库 (guanyu.json, zhugeliang.json, ganning.json)
│   ├── relics/                      # 兵符宝物配置表 (relics.json)
│   ├── enemies/                     # 三幕敌将数值与 AI 权重表
│   └── events/                      # 乱世奇遇事件树配置
└── src/                             # 核心源代码
    ├── core/                        # 底层引擎框架
    │   ├── ActionQueueManager.ts    # 双端动作队列调度器
    │   ├── EventBus.ts              # 全局事件订阅与钩子派发中心
    │   ├── DamagePipeline.ts        # 伤害与格挡乘区计算管线
    │   └── SeededRandom.ts          # 固定伪随机数生成器（确保种子复现）
    ├── battle/                      # 战斗局内逻辑
    │   ├── BattleStateMachine.ts    # 6 阶段战斗回合状态机
    │   ├── DeckManager.ts           # 四大牌堆（抽牌/手牌/弃牌/消耗）洗切调度
    │   ├── OrbManager.ts            # 诸葛亮【奇门八阵图】阵眼槽位管理器
    │   └── actions/                 # 原子动作实现类 (DealDamage, DrawCard, ApplyBuff...)
    ├── map/                         # 沙盘地图与局外推进
    │   ├── DagMapGenerator.ts       # 15 层有向无环图程序化生成算法
    │   └── RunState.ts              # 单局存档序列化（生命、铜钱、牌组、兵符、随机数种子）
    └── ui/                          # 视图与交互层
        ├── HandCardLayout.ts        # 手牌圆弧扇形排版与悬停放大计算
        ├── BezierTargetingArrow.ts  # 指向性卡牌二阶贝塞尔瞄准曲线
        └── IntentIndicator.ts       # 敌将头顶动态意图实时重算组件
```

---

## 九、 分阶段开发路线图（Roadmap）

### 第一阶段：MVP 最小战斗闭环（第 1 \~ 2 周）

- [ ] 搭建 `ActionQueueManager` 双端动作队列与 `BattleStateMachine` 回合状态机。  
- [ ] 实现 `DeckManager`（抽牌堆、手牌堆、弃牌堆、消耗堆的洗牌与流转动画）。  
- [ ] 完成手牌扇形圆弧排版、卡牌拖拽出牌与贝塞尔曲线瞄准箭头。  
- [ ] 实装首发武将【关羽】基础 15 张卡牌、【武力/破绽/怯战/刚烈】4 个核心 Buff，以及 2 种普通黄巾军 \+ 1 个守关 Boss【张角】。

### 第二阶段：肉鸽沙盘与局内成长循环（第 3 \~ 4 周）

- [ ] 实现 15 层 DAG 有向无环图沙盘生成算法与节点点击推进。  
- [ ] 实装战斗胜利三选一卡牌奖励、军帐（休整回血/卡牌锻造升级）、西域行商（买卡/买兵符/删牌）。  
- [ ] 接入 `EventBus` 钩子系统，完成首批 20 件三国兵符（如【赤兔马】【青龙偃月刀】【藤甲】）与 10 个三国奇遇事件。  
- [ ] 引入固定随机数种子（`Seeded RNG`）与单局 JSON 自动存档/读档机制。

### 第三阶段：多角色机制扩展与三幕内容填充（第 5 \~ 8 周）

- [ ] 实装第二武将【诸葛亮】专属 `OrbManager`（风火雷雾四象阵眼）与 `ScryAction`（观星卜算 UI 弹窗）。  
- [ ] 实装第三武将【甘宁】专属【火油引爆】传染逻辑与 0 费《袖箭》生成体系。  
- [ ] 填充第二幕（虎牢血关·吕布/董卓）、第三幕（赤壁冥河·曹操）及隐藏第四幕（天命之灵）全部怪物池。

### 第四阶段：视听打磨、数值平衡与进阶模式（第 9 \~ 10 周）

- [ ] 接入水墨刀光 Shader、屏幕震动（Screen Shake）、受击顿帧（Hit Stop）与动态伤害数字跳动。  
- [ ] 设计 1 \~ 20 阶【乱世煞气（Ascension）】进阶难度系统。  
- [ ] 导出战报统计面板与创意工坊自定义 JSON Mod 加载器。