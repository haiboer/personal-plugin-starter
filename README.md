# Shell 插件开发模板

## 在独立目录直接开始

平台项目根目录执行 `npm run create:plugin-starter -- /你的新目录/my-plugin`。导出的目录包含此模板及当前 `@personal/plugin-sdk` 源码快照，不需要先修改 Shell。目标目录必须不存在；脚本不会覆盖已有文件。

```bash
cd /你的新目录/my-plugin
npm install
npm run dev             # 浏览器预览业务页面
npm run typecheck       # Vue/TypeScript 类型检查
npm run test            # 路由、启停与清单一致性测试
npm run build:plugin    # 输出 dist/shell-entry.js，供 Shell 接入审核
npm run check:manifest  # 使用随包导出的契约校验清单
npm run check:consistency # 核对 JSON、运行时定义与构建产物
npm run build:standalone # 输出 standalone-dist/ 独立网页
```

浏览器预览会复用插件定义中的首页、子页和启停资源，但没有 Shell 顶部控制区、账号、插件权限或平台能力。开发者可自行扩展为独立产品，其账号/数据/部署由开发者负责。`standalone-dist/` 是静态网页产物，`dist/shell-entry.js` 是依赖宿主的插件模块，不能互换。预览结果不能代表 Shell 中的权限和隔离测试。导出的 `sdk/` 与 `contract/` 是生成时的代码快照，正式接入时须与平台当前 SDK 和 Schema 重新核对。

## 在平台工作区中接入

复制本目录到 `packages/plugins/<your-plugin>`，将 `com.example.starter`、包名、显示名和页面内容替换为自己的值。`plugin-manifest.json` 是提交平台审核的清单；`src/manifest.ts` 和 `src/index.ts` 是当前构建时集成的运行入口。两份清单的 ID、名称和版本必须一致。若从导出包接入平台工作区，先把依赖 `@personal/plugin-sdk: file:./sdk` 改回平台使用的版本，移除导出包中的 SDK 快照。

插件只提供 `ion-page` 内的业务内容。**不要绘制平台返回、关闭、更多按钮或 Shell 四标签栏**；这些由 Shell 的 `PluginHostChrome` 统一提供，插件页面自动占据其下方的区域。插件可自由实现自己的列表、表单、播放器和业务内导航。示例的 `src/navigation.ts` 使业务页面共用相对导航，独立页与 Shell 分别生成正确路径；子路由可声明 `title`，由平台显示在顶部。

接入步骤：

1. 修改包名、ID、版本及清单；使用唯一的反向域名 ID，并把示例后台地址替换为自己的真实 HTTPS 地址。后台由开发者自行部署，Shell 不接受用户粘贴任意 URL 作为插件入口。
2. 实现页面与 `definePlugin` 路由；`path: ''` 必须是首页。插件代码只使用 SDK/Core 提供的接口，不读取 Shell 私有状态或主账号令牌。
3. 将包加入 `apps/mobile/package.json` 的 workspace 依赖，在 `apps/mobile/src/plugin-catalog.ts` 注册。提交审核时同时提交版本、能力、后端和数据说明；上线由平台审核与授权决定。
4. 运行插件目录的 `npm run typecheck`、`npm run test`、`npm run build:plugin`、`npm run check:consistency`，再运行 `node packages/plugin-contract/bin/check-plugin.mjs packages/plugins/<your-plugin>/plugin-manifest.json` 和 `npm run build --workspace @personal/mobile`。检查通过仅代表格式与构建通过，不等于审核上线。

本模板的示例后台地址只是清单格式占位，不能用于生产；当前 Schema 要求 `backend`，纯本地插件如何正式申报“无后台”待平台确定。任何受保护的插件后台请求仍须验证平台授权、插件版本和数据所有者；前端隐藏入口不足以保护数据。独立网页部署到子目录时可传 `npm run build:standalone -- --base=/子目录/`，托管服务须对内部路由刷新回退到 `index.html`；目标手机浏览器和 WebView 需实测。详情见 `docs/THIRD_PARTY_PLUGIN_STANDARD.md`。

## 登录授权适配器

`src/auth.ts` 提供 `createStandaloneAuthAdapter` 和 `createShellAuthAdapter`。共用业务代码只消费 `AuthAdapter`。独立版的 `IdentityProvider` 由开发者自己的真实登录服务实现；Shell 版必须由经过平台审核的宿主实例提供，插件不能自行构造平台凭证。两个入口的身份来源分别为 `standalone` 和 `shell`；账号变化或插件停用调用 `dispose()`，迟到凭证会被丢弃。模板不包含正式 Shell 凭证桥接，也不会自动创建本地身份。协议和数据归属规则由平台审核后发布，接入前请勿把占位服务当作生产授权。
