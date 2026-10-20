# Personal Plugin Starter

面向第三方开发者的 Shell 插件起步仓库：Ionic Vue 业务页面、Shell 入口、SDK 源码快照及 manifest 校验器。

## 快速开始

需要 Node.js 22+、npm 10+：

```bash
npm install
npm run dev                # 独立网页开发预览，复用插件路由与生命周期
npm run typecheck          # Vue/TypeScript 类型检查
npm run test               # 插件定义、导航、启停及清单一致性测试
npm run build:plugin       # 生成 dist/shell-entry.js，供平台审核接入
npm run build:standalone   # 生成 standalone-dist/ 网页产物
npm run check:manifest     # 校验 plugin-manifest.json 格式
npm run check:consistency  # 核对 JSON 与真实插件定义及构建产物
```

`npm run dev` 不含 Shell 登录、用户授权或平台顶部控制区。独立网页与插件模块复用示例页面、路由和启停资源；独立页不代表完整的账号、后台或部署方案。`build:standalone` 的 `standalone-dist/` 可作为静态网页产物，`build:plugin` 的 `dist/shell-entry.js` 是依赖宿主提供 Vue/Ionic/SDK 的插件模块，不能直接当独立网页部署。旧命令 `build`、`build:preview` 仍分别是这两种构建的别名。

## 修改样例

1. 修改 `package.json` 的包名，及 `plugin-manifest.json`、`src/manifest.ts` 的 ID、名称、版本。两份 manifest 要一致。
2. 在 `src/StarterPage.vue`、`src/DetailsPage.vue` 写共用业务页面，在 `src/index.ts` 声明路由、菜单和启停生命周期。业务导航使用 `src/navigation.ts`，分别适配独立页与 Shell 路径。
3. 按实际用途修改清单中的能力、后端与数据声明。示例后台地址只是占位。
4. 运行类型检查、测试、两种构建及两个清单检查；申请 Shell 接入时提交插件构建产物与审核材料。

| 文件 | 用途 |
| --- | --- |
| `src/StarterPage.vue` | 示例业务页面 |
| `src/index.ts`、`src/manifest.ts` | 当前 Shell 构建时接入定义 |
| `src/preview.ts`、`index.html` | 不依赖 Shell 的开发预览 |
| `src/shell-entry.ts` | Shell 接入入口 |
| `src/navigation.ts`、`src/plugin-resources.ts` | 共用导航适配与启停资源示例 |
| `plugin-manifest.json` | 提交审核的版本化清单 |
| `sdk/`、`contract/` | 随仓库提供的接口及校验器快照 |

模板中的 `https://api.example.com` 仅是清单占位地址。真实插件须提供经审核的 HTTPS 后台来源及逐次授权校验；纯本地插件如何申报“无后台”仍待平台确定，不要带占位地址申请上线。若自行托管 `standalone-dist/` 到网站子目录，构建时可传 `npm run build:standalone -- --base=/子目录/`，托管服务还需把子路由刷新请求回退到 `index.html`；目标手机浏览器与 WebView 的兼容性需实测。

使用编码大模型时，从[大模型开发流程与可复制任务](docs/AI_DEVELOPMENT_WORKFLOW.md)开始；人工开发可阅读[开发指南](docs/DEVELOPER_GUIDE.md)和[平台接入规则](docs/PLATFORM_RULES.md)。当前 Shell 仍采用构建时集成；通过构建或清单校验不等于获准上线。模板代码按 [MIT 许可证](LICENSE)开放。
