# Current update: 2.3.1 HUD, viewport and easy difficulty

Same original URL with ?build=2.3.1. Compact rounded graphite HUD, edge announcements, natural neutral stone palette, separate full-scene and visible-control viewport sizing. Easy AI incoming damage 45% and slower fire/reaction; 3s deployment protection in clutch. Normal damage80%; hard unchanged. 66 checks pass; actual browser combat and 844x390 DOM layout verified. True iPhone viewport behavior needs device confirmation. Screenshot outputs/v2.3.1-hud.png.

---

# Historical update: 2.3 One-minute Clutch

Same project and original domain: https://lotus-moba-lab-jarvais.snowypanda18.chatgpt.site/?build=2.3.0

New third mode: three 50–70s solo tactical missions (retake / postplant / site clear), fast loadout selection, three-star scoring, immediate retries and between-mission augments. Original MOBA and fixed-five-round SPIKE remain. Friend formation offsets and soft separation reduce stacking.

61 tests pass. Browser verified movement, firing, two kills, actual defuse victory, scoring, augment selection, next mission, failure/retry and 844×390 layout. See docs/2.3-一分钟残局.md. Earlier access/browser limitations below are historical and were resolved this session.

---

# Historical update: 2.2 Ancient City Operation

The SAME project and SAME local URL http://localhost:8778/ now serve 2.2. Refresh the existing tab. No new game directory or duplicate domain was created.

New: real-path ground/minimap navigation, three budget-safe quick loadouts, death attribution and round report/MVP/advice. Original hero showroom podium and unified slate/ivory/copper presentation. Existing MOBA/SPIKE modes and mobile controls remain. Details: docs/2.2-古城行动更新.md.

Hosted publication still cannot access the original Site (project_not_found); the old HTTPS URL has NOT been updated to 2.2. Current visual QA is limited by the Work browser control setting.

---

# Historical update: 2.1 Tactical Cooperation

Local play: http://localhost:8778/?build=2.1.0 . Existing game entry still offers MOBA / SPIKE. Command A/B/C, follow/hold/auto; choose one free tactical device per round (Y), pick up dropped weapons (X), pass Spike to a nearby teammate. Smarter healing, cover/reload, intel rotation and one defuser with cover. Tactical HUD, original outline/marker/loot and stonework changes. Full details: docs/2.1-战术与美术更新.md.

**2.1 is saved locally; the original hosted Site could not be accessed (project_not_found). No duplicate Site was created. Browser QA is blocked by Work's disabled local-browser setting despite user authorization; do not claim new visual/device verification.**

---

# Current version 2.0 / saved 2026-10-29

Two modes in the same entry: MOBA and SPIKE. SPIKE is a fixed five-round match, starts with 800 credits, buy phase, persistent credits, surviving weapons/armor, plant/defuse and site turrets. WASD, Space, Q/E/R/F, G objective hold, T reload, X interaction. Perspective camera, dynamic shadows and original Lotus-inspired geometry. Raised floors now have solid foundations.

Run: `python3 -m http.server 8778 --directory dist` then open `http://localhost:8778/?build=2.0.0`.

Current joystick is original `dist/joystick.mjs`; nipplejs is no longer used. Gun shop images were requested by the user and reused from their Clutch Lab project: copyright Riot Games, sources in `dist/assets/weapons/sources.json`. Not CC0; no commercial authorization is claimed. Terrain contours and heights are an approximation; gameplay remains a top-down adaptation, not identical FPS behavior. iPhone browser fullscreen remains subject to iOS; use Safari Add to Home Screen. Fullscreen enter/exit and viewport resize are handled.

Tests: `node --test tests/*.test.mjs`. Existing 29 checks passed; focused economy, objective, ammo, path and controls checks pass. Browser tested purchase, movement, shooting, console. Real-device compatibility and performance are not guaranteed.

The following documents the earlier prototype and may contain superseded implementation details; use guide.html and the current code for version 2.0.

---

# Valorant MOBA Q版 · 莲华古城

个人学习用单人 5v5 手机横屏游戏。按用户选择交付浏览器版，保留指定英雄名称，不宣称可商用。Three.js 真 3D 低模渲染；所有模型由几何体生成，无 Riot 原版模型/贴图。完整工程说明和真实可运行核心代码见 `dist/guide.html`，资源逐项来源见 `docs/资源与许可证.md`。

## 工程搭建步骤

1. 解压到任意文件夹，保持 dist 目录完整。
2. 在工程目录运行 `python3 -m http.server 8778 --directory dist`。不需要 Unity、Godot、npm 或构建步骤。
3. 电脑在 Chrome / Safari 打开 http://localhost:8778 ，选择英雄与 AI 难度，点击「进入古城」。桌面 Chrome 已实测点击进入后真正全屏。Mac 也可用 Control + Command + F，Windows F11。
4. 手机直接打开交付的 HTTPS 试玩链接。在同一 Wi-Fi 使用本地工程时，地址需改为电脑局域网 IP，不能在手机使用 localhost。HTTP 局域网模式不保证全屏/PWA等安全上下文功能。
5. 手机横放，点击后请求全屏及横屏锁定。浏览器未提供对应接口时明确提示；竖屏会覆盖画面并冻结模拟，不能在竖屏游玩。iOS 可从 Safari 添加到主屏幕获得独立窗口。网页不能保证在所有系统隐藏状态栏或强制旋转系统。
6. 首次联网加载后，Service Worker 缓存本地资源，可在支持的浏览器离线再玩。音频、字体、脚本无外部 CDN。Hosted Site 的首次访问仍受平台登录要求影响。

## 操作

手机：左摇杆移动，右普攻长按，四技能点击。技能自动朝附近目标或角色面向释放。可点击地图中的敌人锁定，金色环标出目标。普攻优先锁定目标，其次可见敌方英雄，再次小兵 / 建筑 / 野怪；无目标也可朝面向挥击或发射。远程普攻为可躲避的非追踪弹道。蓝量120、自动回蓝，每个技能有独立CD。

电脑：WASD / 方向键移动；Space 普攻；Q E R 为三个小技能，F 大招；X 靠近机关交互；B 回城（3秒引导，移动/受伤打断）；Esc 暂停。设置可分调音乐/音效与渲染精度。开局一次点击启动音频与全屏，受浏览器策略限制；内嵌窗口没接口时会显示外部浏览器打开提示。

## 对局规则

- 1名玩家 + 4个AI队友，对抗5个AI敌人。每方五种英雄各一名。三条兵线、每方6塔+1水晶。
- 外塔 → 同路内塔 → 敌方水晶。任何一路双塔被毁即解除水晶保护；摧毁水晶是真正的胜负条件，无定时假结算。
- 兵线2秒出现，之后14秒一波；小兵逐波成长，每路每方最多15个，寿命110秒。英雄通过补刀、击杀和附近战斗经验升级至12级；死亡8至16秒复活。野怪35秒重生。
- AI具有沿路推进、攻击建筑、战斗施法、低血撤退、支援受攻击队友、基地防守和打野分工。难度改变反应间隔、撤退阈值、支援范围及打野积极性；不是机器学习/强化学习。所有可见单位可在小地图看到，无战争迷雾。
- 五种野怪给予45秒buff：风+22%移速，火攻击灼烧，圣愈每秒18恢复，脉冲CD恢复速度+40%，暗影+20%伤害。
- 双向旋转门开12秒关8秒，关闭真实阻挡；X可临时切换6秒。两道脆墙260HP，技能可破坏并更新寻路。A侧滑索可双向交互，1.1秒快速穿越。高台短边台阶可上下、长边阻挡；高台远程射程+3。
- 血条、蓝条、护盾、异常状态、buff倒计时、技能CD、击杀播报与声音、双方结算数据均接入真实模拟状态。

## 技能

原请求每人仅列出两个小技能。这里补齐第三技能并明确简化：

|英雄|普攻|Q|E|R（新增补齐）|F|
|---|---|---|---|---|---|
|捷风|远程风刃|升空1.6秒规避地面伤害|10米冲刺+加速|云幕减速场|穿透飞刃|
|火男|近战火焰+灼烧|火球爆炸+燃烧|火墙阻挡敌人+灼伤|近身炫目短眩晕|7秒范围火域|
|贤者|远程灵能|岩域减速|范围持续治疗|冰晶屏障阻挡敌人|全队存活英雄280护盾，8秒|
|KO|慢速重击|范围电击眩晕|冲锋击退|范围破片|范围压制技能5秒|
|克洛芙|近战暗影|3秒隐身加速|6秒标记，增伤35%|范围虹吸+自身回复|只能对附近已标记敌方英雄释放，斩杀|

这是机制抽象与原创补充，不是原版 Valorant 精确技能复现。屏障只阻挡敌人；暂未做技能手动拖拽瞄准、商店装备、联网、动画骨骼或真实原地图导航数据。

## 代码与资源导入

- `dist/engine.mjs`：无渲染依赖的对局、寻路、战斗、五英雄技能与机关。
- `dist/renderer.mjs`：Three.js 俯视相机、原创低模、实例化植被、单位与特效绘制。
- `dist/controls.mjs`：nipplejs虚拟摇杆、多指普攻、键盘与浏览器横屏全屏。
- `dist/audio.mjs`：AudioManager，Kenney CC0采样+原创技能/BGM合成，事件自动播放。
- `dist/main.mjs`：选人、HUD、交互、暂停、结算和诊断。
- `dist/vendor/`：已导入的固定版本开源代码与MIT许可证，不要删许可证。
- `dist/audio/`：已导入的5个OGG采样和CC0全文；无需手动去GitHub下载。
- `tests/game.test.mjs`：有真实水晶摧毁验证的模拟测试。

运行验证：`node --test tests/game.test.mjs`。浏览器实际渲染检查和全模拟测试是两种证据，不宣称在实体手机完成兼容性与帧率测试。使用像素比上限1.5、不启用实时阴影、静态几何体复用、植被实例化、简化特效、小兵数量与寿命限制；不能保证所有手机不掉帧。


## 竞技与反馈更新（1.1）

- 普攻无目标也释放；新增攻击动作、可见弹道、命中音、伤害跳字、受击短闪、击杀屏幕反馈与连斩播报。长按普攻显示实际射程环。
- 点击敌人锁定；子弹有真实飞行时间、碰撞和墙体阻挡，可横向躲避。困难人机提前量瞄准并尝试横移躲弹。
- 防御塔优先攻击小兵，但英雄在塔下伤害对方英雄，会被塔锁定3秒。红色危险范围会提示转火。
- 小兵补刀22经验、英雄击杀140经验、野怪70经验、防御塔100经验；19米内友军分享60%经验；少量被动经验。升级增加55最大生命与6普攻伤害。没有无用途的商城或装备承诺。结算显示补刀。
- 核心机制与触屏均是原型实现，尚未经过真实玩家平衡测试，不把AI自动对局结果当成人类胜率。


## 手持步枪与输入更新（1.2）

按后续要求，全英雄改为手持原创低模狂徒风格步枪普攻，技能仍保留；火男普攻附带灼烧、KO慢射速重击、克洛芙较短射程。这里没有使用原版枪模。英雄移动缩至原速78%，小兵改为5.5米/秒。场景新增原创石板裂纹、藤蔓门廊、源能感战术箱体。两枚终极法球在地图(72,40)/(88,60)，靠近按X引导1.5秒，移动或受伤打断；完成后大招冷却减少12秒、回蓝30，45秒刷新，AI也可吸收。

键盘使用KeyboardEvent.code，兼容中文IME与不同键盘布局；点击画面自动获取焦点。切后台/失焦仅自动冻结，回焦或点击/按键恢复，不再把失焦变为必须手动关闭的暂停菜单。手动暂停仍需关闭暂停面板。角色选择、技能、普攻均有click无障碍备用路径，快速点按不会仅依赖下一帧轮询。

每三波出现一名耐久攻城兵，小兵优先清理兵线与建筑，避免永远追逐英雄。最新自动对局在505.4秒发生真实水晶摧毁；这是自动模拟证据，不是玩家平衡结论。


## 技能视觉更新（1.3）

新增原创SkillVFX（dist/vfx.mjs），用固定上限的实例化批次绘制火焰、烟团、火花、光环与屏障，不导入外部特效素材。火男火墙现在是红橙火柱；火球有抛物线飞行、拖尾、落点提示、真实延迟爆炸与余火；烈焰领域持续燃烧。炫目改为真实1.8秒致盲（不再是短眩晕），受影响英雄头顶有亮点，玩家被致盲时画面泛白但保留按钮。KO破片有投掷轨迹，电击与大招有紫蓝电弧；贤者岩域/屏障为冰晶，治疗有绿色上升十字光点；捷风有风环、烟雾、飞刃，克洛芙有紫色标记与暗影爆发。技能名在施法者头顶短暂显示，实际命中附带不同元素颜色的火星/碎片，伤害数字按元素区分。伤害与效果均来自实际模拟事件，未用虚构命中动画替代伤害判定。

火球/破片变为可走位躲避的延迟落点伤害；爆炸范围从爆点检查遮挡。屏障、伤害区域与显示共用同一坐标/尺寸/寿命。视觉是简化低模粒子，不是原版游戏的特效素材。首选电脑Chrome验证，实体手机性能仍待实测。

## 手机输入修复（1.3.1）

虚拟摇杆更换为原创Pointer Events输入（旧浏览器有Touch Events回退），使用client坐标与每次最新的可见矩形计算方向，避免Safari工具栏与页面偏移混用。多指分别绑定，松手、取消、旋转、尺寸变化和失焦都会归零。回城/机关与摇杆使用同一安全区容器和14px间距，避免刘海偏移导致重叠。iPhone不再显示桌面全屏提示，改为Safari分享→添加主屏幕→作为Web App打开指引；这不保证隐藏iOS手势条或绕过系统旋转锁。
