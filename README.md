# Personal Plugin Starter

面向第三方开发者的**通用** Shell 插件起步仓库：Ionic Vue 业务页面、Shell 入口、可选宿主导航适配、身份及后台请求示例、SDK 源码快照和 manifest 校验器。业务示例是“我的记录”，不依赖任何已上线插件。

从[完整开发指南](docs/DEVELOPER_GUIDE.md)开始；[前端与用户接口](docs/FRONTEND_AND_USER_API.md)、[托管身份与后台接入](docs/HOSTED_IDENTITY_AND_BACKEND.md)、[平台规则](docs/PLATFORM_RULES.md)分别说明实际接口边界。本仓库所带 `sdk/`、`contract/` 是较早的快照；申请审核前须按当时 Shell 发布的 SDK 和清单规范复核。平台现行通用标准见[Shell 文档分支](https://github.com/haiboer/personal-plugin-workbench/tree/codex/telegram-032-documentation/docs)。

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

`npm run dev` 显示固定的顶部导航预览；正式 Shell 入口不渲染这条导航，由 Shell 提供返回、标题、更多和关闭。独立预览不含真实 Shell 登录或用户授权。独立网页与插件模块复用示例页面、路由和启停资源；独立页不代表完整的账号、后台或部署方案。`build:standalone` 的 `standalone-dist/` 可作为静态网页产物，`build:plugin` 的 `dist/shell-entry.js` 是依赖宿主提供 Vue/Ionic/SDK 的插件模块，不能直接当独立网页部署。旧命令 `build`、`build:preview` 仍分别是这两种构建的别名。

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
| `src/starter-style.css`、`src/preview-style.css` | 业务样式参考与仅用于独立预览的固定顶栏 |
| `src/auth.ts`、`src/user-api.ts` | 双身份适配接口与用户私有数据请求示例 |
| `src/host-navigation.ts` | 可选宿主动态标题、返回与清理示例；旧宿主继续使用路由静态标题 |
| `src/hosted-token.ts` | 已登记托管模式下的同源签发请求示例；不实现后台验签 |
| `plugin-manifest.json` | 提交审核的版本化清单 |
| `sdk/`、`contract/` | 随仓库提供的接口及校验器快照 |

模板中的 `https://api.example.com` 仅是清单占位地址。真实插件须提供经审核的 HTTPS 后台来源及逐次授权校验；纯本地插件如何申报“无后台”仍待平台确定，不要带占位地址申请上线。若自行托管 `standalone-dist/` 到网站子目录，构建时可传 `npm run build:standalone -- --base=/子目录/`，托管服务还需把子路由刷新请求回退到 `index.html`；目标手机浏览器与 WebView 的兼容性需实测。

使用编码大模型时，从[大模型开发流程与可复制任务](docs/AI_DEVELOPMENT_WORKFLOW.md)开始；人工开发可阅读[开发指南](docs/DEVELOPER_GUIDE.md)、[界面与用户接口参考](docs/FRONTEND_AND_USER_API.md)和[平台接入规则](docs/PLATFORM_RULES.md)。当前 Shell 仍采用构建时集成；通过构建或清单校验不等于获准上线。模板代码按 [MIT 许可证](LICENSE)开放。

## 登录授权适配器

`src/auth.ts` 提供独立版与旧 scope 型 Shell 版两个授权适配器，业务代码共用 `AuthAdapter`。独立版需要开发者接入自己的真实登录服务；Shell 版须由经过平台审核的宿主实例提供凭证。`src/hosted-token.ts` 单独演示已登记**托管身份模式**的同源签发请求；这两种模式不能拼接使用。会话改变或停用时调用 `dispose()`，迟到凭证会被丢弃。模板不含真实后台验签、在线复核或正式用户数据。

`src/user-api.ts` 示范如何按 scope 请求插件自有后台的用户资料与私有数据；其中的接口路径是插件后台样例，不是已发布的 Shell 平台 API。服务端验权与数据归属规则见[界面与用户接口参考](docs/FRONTEND_AND_USER_API.md)。
