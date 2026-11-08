# 第三方插件开发指南

本仓库是可复制的**通用代码模板**和本地工具，不是已发布的公共 SDK，也不附带真实后台。正式提交时，平台会按当时有效的 SDK、身份契约与 manifest 标准复核兼容性。仓库内的 `sdk/`、`contract/` 是较早快照；当前 Shell 已增加可选宿主导航和托管身份模式，见[平台开发指南](https://github.com/haiboer/personal-plugin-workbench/blob/codex/telegram-032-documentation/docs/PLUGIN_DEVELOPMENT_GUIDE.md)。

使用编码大模型开发时，可先交给它[大模型开发流程](AI_DEVELOPMENT_WORKFLOW.md)中的可复制任务，再按本指南核对实现细节。
界面、安全区域、用户数据和授权适配的代码示例见[界面与用户接口参考](FRONTEND_AND_USER_API.md)。

## 从模板到自己的插件

1. 复制本仓库到自己的新仓库，确定一个真实业务闭环、唯一反向域名 ID、名称、版本、数据所有者、后台需求和可验收动作。不要保留 `com.example.starter`、`https://api.example.com` 申请审核；不要把某个已有插件的 ID 或后台配置作为默认值。
2. 同步修改 `package.json`、`plugin-manifest.json`、`src/manifest.ts`、`src/index.ts` 的标识与路由；首页路由保持 `path:''`，子页使用相对路径。把示例页面、数据类型和 `/v1/me/items` 路径改为自己的业务，按实际用途填写能力、后台受众和数据申报。
3. 选择平台**已登记的身份模式**。旧 scope 型示例见 `src/auth.ts`、`src/user-api.ts`；托管身份签发示例见 `src/hosted-token.ts` 与[托管接入指南](HOSTED_IDENTITY_AND_BACKEND.md)。两种模式不可混用，签发成功也不等于插件后台已经验签或用户数据已经隔离。
4. 前端按[界面标准](FRONTEND_AND_USER_API.md)实现页面，后台按自己的接口契约验签、在线复核、用户映射与业务授权。模板不实现生产后台；需要后台的插件须自行交付源码、无凭据配置和部署指南。
5. 按下文命令验证，再提交清单、完整构建、摘要、接口和数据说明、A/B/管理员验收、升级回滚材料。Shell 审核后才可安装、赋权和发布。

## 开发依据

1. `sdk/src/index.ts` 定义当前插件 manifest、路由、菜单和生命周期接口。
2. `contract/plugin-manifest.schema.json` 与 `contract/src/validate.mjs` 定义提交清单的校验规则。
3. [平台接入规则](PLATFORM_RULES.md)规定成为 Shell 插件时的入口、审核、权限和数据边界。

## 开发步骤

1. 将 `com.example.starter` 改为唯一的反向域名插件 ID，保持 `plugin-manifest.json` 与 `src/manifest.ts` 中的 ID、名称和版本一致。两份清单目前不会自动同步。
2. 在 `src/index.ts` 用 `definePlugin` 声明主页（`path: ''`）、菜单和可选子页标题；在 `src/StarterPage.vue`、`src/DetailsPage.vue` 实现共用业务区域，并参考 `src/starter-style.css` 的分组列表样式。`src/navigation.ts` 根据当前入口转换相对导航路径；`src/host-navigation.ts` 在宿主支持时报告详情标题与内部返回，并在页面离开、插件停用时清理。旧宿主仍使用静态路由标题；`src/preview.ts` 复用路由与启停回调。正式 Shell 顶部返回、标题、更多和关闭由平台绘制，插件不再绘制第二条。
3. 按实际需要申报能力、后端来源和数据用途。`backend.origin` 须为不含路径、查询参数和凭据的 HTTPS 来源。没有后台时，样例地址仅供格式演示；现有 Schema 要求后台字段，“无后台”的正式申报方法尚待平台确认。
4. 运行 `npm run dev` 检查页面和子路由；`npm run typecheck`、`npm run test` 检查类型、路由、启停清理和清单一致性；`npm run build:plugin` 生成 Shell 模块，`npm run build:standalone` 生成独立网页，再运行 `npm run check:manifest` 和 `npm run check:consistency`。后者核对 JSON 与运行时定义、路由、菜单及产物，但仍不代表安全审核。预览没有 Shell 登录或授权能力。

独立网页的产物是 `standalone-dist/`，可由开发者自行托管；如部署在子目录，构建时传 `npm run build:standalone -- --base=/子目录/`，并为子路由刷新配置回退到 `index.html`。`vite.standalone.config.ts` 当前以 `es2022` 为构建目标，手机浏览器与 WebView 支持情况需实测。`dist/shell-entry.js` 则依赖 Shell 宿主提供 Vue、Ionic 和 SDK，不能作为独立网页部署。

提交清单与运行时 SDK 的能力字段目前**没有自动映射**；分别按 `contract/` 和 `sdk/` 的定义填写并说明用途。能力声明不是授权或安全沙箱。模板的 `src/host-navigation.ts` 使用可选桥接保持旧快照可编译；正式接入时以平台审核的 SDK 类型为准，不能把模板快照自行改成平台标准。

## 申请接入时提交

- 开发者身份、插件 ID、版本化 manifest、源码或可复现构建来源。
- 与 `entry.shell` 一致的前端产物及 SHA-256、路由和能力说明。
- 后端接口与来源、数据类别/用途、用户隔离、保留/导出/删除规则。
- Web/Android/iOS 实际支持范围及未登录、无权限、撤权、停用、直接访问和跨账号测试结果。
- 升级时的变更、权限差异、数据迁移和回滚方案。

平台负责审批、集成、上线和用户赋权。模板本身没有自助发布入口或第三方远程隔离容器；已登记托管模式可由 Shell 签发插件专用短期凭证，但本仓库没有获准的发布 ID、后台客户端凭据、真实交换服务或用户资格。本地校验不等于上线许可。

## 审核、验收与回滚

提交源码提交号、`plugin-manifest.json`、`dist/` 所有入口与分块的 SHA-256 清单、后端 origin/受众、能力用途、数据归属与导出声明、部署指南和测试结果。审核使用固定受审版本；开发者站点后续变动不能自动改变 Shell 安装包。安装管理员先验证 HTTPS、健康、版本和身份依赖，再开启真实交换。

用获准普通用户 A/B 与管理员检查登录、业务读写、跨账号隔离、管理拒绝与允许、退出和撤权；检查独立预览与 Shell 页面、手机和平板布局。失败时恢复上一受审构建和匹配的后台发布配置；数据迁移前备份，回滚不删除数据卷。记录状态码和版本，不记录令牌或私有内容。
