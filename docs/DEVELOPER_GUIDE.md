# 第三方插件开发指南

本仓库是初始代码和本地工具，不是已发布的公共 SDK。正式提交时，平台会按当时有效的 SDK 与 manifest 标准复核兼容性。

使用编码大模型开发时，可先交给它[大模型开发流程](AI_DEVELOPMENT_WORKFLOW.md)中的可复制任务，再按本指南核对实现细节。

## 开发依据

1. `sdk/src/index.ts` 定义当前插件 manifest、路由、菜单和生命周期接口。
2. `contract/plugin-manifest.schema.json` 与 `contract/src/validate.mjs` 定义提交清单的校验规则。
3. [平台接入规则](PLATFORM_RULES.md)规定成为 Shell 插件时的入口、审核、权限和数据边界。

## 开发步骤

1. 将 `com.example.starter` 改为唯一的反向域名插件 ID，保持 `plugin-manifest.json` 与 `src/manifest.ts` 中的 ID、名称和版本一致。两份清单目前不会自动同步。
2. 在 `src/index.ts` 用 `definePlugin` 声明主页（`path: ''`）、菜单和可选子页标题；在 `src/StarterPage.vue`、`src/DetailsPage.vue` 实现共用业务区域。`src/navigation.ts` 根据当前入口转换相对导航路径；`src/preview.ts` 复用插件的路由定义并调用启停回调。Shell 顶部返回、更多和关闭由平台绘制。
3. 按实际需要申报能力、后端来源和数据用途。`backend.origin` 须为不含路径、查询参数和凭据的 HTTPS 来源。没有后台时，样例地址仅供格式演示；现有 Schema 要求后台字段，“无后台”的正式申报方法尚待平台确认。
4. 运行 `npm run dev` 检查页面和子路由；`npm run typecheck`、`npm run test` 检查类型、路由、启停清理和清单一致性；`npm run build:plugin` 生成 Shell 模块，`npm run build:standalone` 生成独立网页，再运行 `npm run check:manifest` 和 `npm run check:consistency`。后者核对 JSON 与运行时定义、路由、菜单及产物，但仍不代表安全审核。预览没有 Shell 登录或授权能力。

独立网页的产物是 `standalone-dist/`，可由开发者自行托管；如部署在子目录，构建时传 `npm run build:standalone -- --base=/子目录/`，并为子路由刷新配置回退到 `index.html`。`vite.standalone.config.ts` 当前以 `es2022` 为构建目标，手机浏览器与 WebView 支持情况需实测。`dist/shell-entry.js` 则依赖 Shell 宿主提供 Vue、Ionic 和 SDK，不能作为独立网页部署。

提交清单与运行时 SDK 的能力字段目前**没有自动映射**；分别按 `contract/` 和 `sdk/` 的定义填写并说明用途。能力声明不是授权或安全沙箱。

## 申请接入时提交

- 开发者身份、插件 ID、版本化 manifest、源码或可复现构建来源。
- 与 `entry.shell` 一致的前端产物及 SHA-256、路由和能力说明。
- 后端接口与来源、数据类别/用途、用户隔离、保留/导出/删除规则。
- Web/Android/iOS 实际支持范围及未登录、无权限、撤权、停用、直接访问和跨账号测试结果。
- 升级时的变更、权限差异、数据迁移和回滚方案。

平台负责审批、集成、上线和用户赋权。当前没有自助发布入口、第三方远程隔离容器或插件专用后台令牌；本地校验不等于上线许可。
