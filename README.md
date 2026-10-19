# Personal Plugin Starter

面向第三方开发者的 Shell 插件起步仓库：Ionic Vue 业务页面、Shell 入口、SDK 源码快照及 manifest 校验器。

## 快速开始

需要 Node.js 22+、npm 10+：

```bash
npm install
npm run dev             # 独立预览业务页面
npm run build           # 生成 dist/shell-entry.js
npm run check:manifest  # 校验 plugin-manifest.json
npm run build:preview   # 可选：构建业务预览
```

`npm run dev` 不含 Shell 登录、用户授权或平台顶部控制区。开发者可以自行运行独立产品；只有申请作为 Shell 插件使用时，才须遵守平台的入口、审核、授权及安全规则。

## 修改样例

1. 修改 `package.json` 的包名，及 `plugin-manifest.json`、`src/manifest.ts` 的 ID、名称、版本。两份 manifest 要一致。
2. 在 `src/StarterPage.vue` 写业务页面，在 `src/index.ts` 声明路由、菜单和可选生命周期。
3. 按实际用途修改清单中的能力、后端与数据声明。示例后台地址只是占位。
4. 构建并校验；申请 Shell 接入时提交构建产物与审核材料。

| 文件 | 用途 |
| --- | --- |
| `src/StarterPage.vue` | 示例业务页面 |
| `src/index.ts`、`src/manifest.ts` | 当前 Shell 构建时接入定义 |
| `src/preview.ts`、`index.html` | 不依赖 Shell 的开发预览 |
| `src/shell-entry.ts` | Shell 接入入口 |
| `plugin-manifest.json` | 提交审核的版本化清单 |
| `sdk/`、`contract/` | 随仓库提供的接口及校验器快照 |

使用编码大模型时，从[大模型开发流程与可复制任务](docs/AI_DEVELOPMENT_WORKFLOW.md)开始；人工开发可阅读[开发指南](docs/DEVELOPER_GUIDE.md)和[平台接入规则](docs/PLATFORM_RULES.md)。当前 Shell 仍采用构建时集成；通过构建或清单校验不等于获准上线。模板代码按 [MIT 许可证](LICENSE)开放。
