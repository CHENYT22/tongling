# 通灵网站清单修改设计规格

## 目标

以用户提供的 `tuling - 副本.zip` 为唯一原始源码基准，参考 `tuling网页修改清单.md` 和 `tongling.zip` 中的 `tuling-public-datasets` 修改件，只实现清单 A 至 G 中明确描述的页面、数据、交互与验收变化。保留清单外既有逻辑、样式、组件和反馈模块。

## 来源与优先级

1. 用户当前请求决定授权范围：只做清单内改动，采用最小差异方式。
2. `tuling网页修改清单.md` 的“修改件表现”定义目标行为；“设计团队确认项”和“建议确认顺序”只作为验收备注，不扩展需求。
3. `tongling.zip/tuling-public-datasets` 是目标实现参考和缺失资源来源。
4. 原始 ZIP 中清单外的既有行为优先保留；参考包中的 `.codex-sync`、`127.0.0.1%3A8766`、GitHub 配置和其他工程辅助文件不进入交付。

## 实现方式

采用逐文件差异移植，不整体覆盖原项目。

- 全站共享：在现有 HTML、CSS、JS 内完成品牌、术语、邮箱、标题、页脚、访问保护文案、缓存 query string 和 `.mei-layout` 布局调整。
- 首页：保留现有页面组件顺序，仅替换清单指定文案、流程节点与 CTA；将静态雷达图片载体替换为动态 SVG，并从榜单视图数据渲染模型、轴标签、图例和切换动画。
- 公共数据集页：引入 `public-datasets-data/catalog.json`、4 个 XML、21 张 JPG、`public-datasets.js` 和 `datasets-integrated.css`；页面按概览、能力类别、任务地图、浏览器四段组织。筛选、URL 历史、键盘快捷键、详情字段导航和安全内容渲染均沿用参考实现，不改变其他页面数据逻辑。
- 测评框架页：引入 `framework-page.css`，按清单增加标准化 Hero、能力链路、三层架构、流程、指标、公式、覆盖、动态雷达、工具和限制责任区。
- 榜单与自有数据集页：只完成清单指定的品牌、简化说明、榜单视图接口与轻量文案替换。

## 数据流与安全边界

- `catalog.json` 提供 193 条目、33 任务、1930 标准字段及四类 XML 的索引信息。
- `public-datasets.js` 读取 catalog 和 XML，构建任务与条目索引，并在浏览器中渲染详情。
- XML 内容通过允许节点和属性清单转换为 DOM；外链仅允许 `http:` 和 `https:`，并使用安全的打开方式。
- 图片只引用参考包中提供的本地 `doc-001.jpg` 至 `doc-021.jpg`，不生成或替换图片内容。
- 解析、图片或网络加载失败时显示页面内错误/空状态，不影响导航和其他页面运行。

## 变更文件边界

预计修改现有文件：

- `index.html`
- `datasets.html`
- `framework.html`
- `leaderboard.html`
- `owned.html`
- `app.js`
- `datasets.js`
- `leaderboard.js`
- `subpages.js`
- `gate.js`
- `styles.css`
- `vitality-blue.css`
- `animations.css`

预计新增运行文件：

- `datasets-integrated.css`
- `framework-page.css`
- `public-datasets.js`
- `public-datasets-data/catalog.json`
- `public-datasets-data/affective.xml`
- `public-datasets-data/cognitive.xml`
- `public-datasets-data/concern.xml`
- `public-datasets-data/safety.xml`
- `public-datasets-data/assets/doc-001.jpg` 至 `doc-021.jpg`

`data.js` 与用户清单明确说明两版一致，因此保持字节不变。

## 验证

1. 先编写/扩展静态回归检查，使其在原始源码上因缺少目标行为而失败。
2. 移植最小差异后，验证品牌、术语、邮箱、资源引用、雷达接口、URL 状态和安全渲染检查通过。
3. 校验 `catalog.json`、4 个 XML、21 张 JPG，以及 193 条目、33 任务、1930 标准字段的结构数量。
4. 运行参考包已有的 UI/数据验证逻辑，但在执行前检查脚本内容，避免运行工程辅助或无关指令。
5. 通过本地 HTTP 服务验证五个页面可打开、资源无 404、主要交互无控制台错误。
6. 使用浏览器完成桌面与移动端的视觉和交互抽查，明确区分自动测试、构建/静态检查和浏览器视觉 QA。

## 交付

将最终网站复制到当前任务的 `outputs` 目录，提供完整文件夹和 ZIP。交付说明列出全部变更文件、关键代码片段、逐项完成状态、运行方式和验证结果，不包含 `.git`、`.codex-sync`、本地预览快照或本规格文件。
