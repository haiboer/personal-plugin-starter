# 插件界面与用户接口开发参考

## 1. 页面边界

`src/StarterPage.vue`、`src/DetailsPage.vue` 和 `src/starter-style.css` 给出简洁的分组列表、单元格、主按钮与手机/宽屏布局。样式采用接近 WeUI 的尺寸与配色，作为业务区域参考；不要复制平台头像、账号管理或插件管理控件。

独立预览的 `src/preview.ts` 和 `src/preview-style.css` 在页面上方模拟一条**固定**的返回、标题、更多、关闭控制区，便于开发者检查内容与安全区域。该文件只进入 `build:standalone`。正式 `src/shell-entry.ts` 不导入它；Shell 自己绘制顶部控制区，业务页面从控制区下方开始。插件不得绘制第二条平台导航或遮挡控制区。`src/host-navigation.ts` 示范向支持该接口的 Shell 报告详情标题和内部返回，组件卸载和插件停用时清理；旧宿主继续用 `PluginRoute.title`。业务创建、搜索、筛选等按钮留在内容区，不放进平台顶栏。

## 2. 用户身份与授权

`src/auth.ts` 的 `AuthAdapter` 是业务层唯一的身份入口：`session()` 读取当前身份，`getAccessToken(scope)` 申请当前操作的凭证，`onSessionChanged()` 处理退出、切号及撤权，`dispose()` 关闭适配器。`BusinessIdentity` 包含 `source`（`standalone` 或 `shell`）和来源内不透明 `subject`；不同来源的相同名称或邮箱绝不自动合并。

- 独立产品：用 `createStandaloneAuthAdapter` 包装自己的真实登录服务。开发者自行处理登录、账号、数据和部署。
- Shell 接入：用 `createShellAuthAdapter` 包装**平台审核后提供**的宿主能力。不能通过前端构造 `subject`、读取主账号 Cookie，或把 `PluginContext` 当作后台凭证。
- 模板的 `getAccessToken(scope)` 是旧 scope 型适配位置；`src/host-identity.ts` 在已登记托管模式下调用宿主可选 `getHostedAccessToken()`，由宿主处理网页与手机会话。两者字段和授权语义不同，不能混用。开发时可注入测试 provider 运行单元测试，但不能把测试身份或令牌带入上线产物。具体后端接入见[托管身份与后台](HOSTED_IDENTITY_AND_BACKEND.md)。

平台仅为**已审核登记**的插件签发凭证。模板没有自己的获准 `release_id` 或后台验签服务；可调用示例不表示这个模板身份已上线。第三方开发者应使用平台批准的实际字段、版本和在线复核契约。

## 3. 用户数据接口样例

`src/user-api.ts` 定义 `CurrentUser`、`UserItem` 和 `UserApi`。以下 `/v1/me`、`/v1/me/items` 是**插件自有后台的示例路径**，不是 Shell 公共端点。开发者可按自己的业务修改路径和数据模型，服务端仍须从已验证凭证确定用户，不能信任 URL、请求体或前端传来的用户 ID。

| 请求 | 所需 scope | 成功响应示例 | 服务端规则 |
| --- | --- | --- | --- |
| `GET /v1/me` | `profile.read` | `{ "id": "internal-user-1", "displayName": "示例用户", "identity": { "source": "shell", "subject": "opaque-sub" } }` | 从令牌映射内部用户；只返回必要字段 |
| `GET /v1/me/items` | `items.read` | `[{ "id": "item-1", "title": "我的记录", "updatedAt": "2026-10-28T00:00:00Z" }]` | 只按当前内部用户查询；不得由客户端指定 owner |

所有受保护接口只接受 `Authorization: Bearer <插件后台专用凭证>`。401 表示登录失效或凭证错误；403 表示资格、scope 或资源权限不足；429 表示限流；503 表示在线授权状态无法核验且没有允许的短时缓存。错误正文不得泄露令牌、账号信息或资源是否属于其他用户。新增写接口时须在数据事务前复核用户资格和资源归属。

```ts
import { createUserApi } from './user-api';
import { createShellAuthAdapter } from './auth';

// hostProvider 只由平台批准的宿主实例提供；此处为接入位置，不是现成 API。
const auth = createShellAuthAdapter(hostProvider);
const api = createUserApi(auth, 'https://api.your-plugin.example');
const user = await api.me();
const items = await api.myItems();

// 插件停用、卸载或离开实例时执行：
api.dispose();
auth.dispose();
```

客户端只向配置的 HTTPS 来源发送 Bearer 凭证，不带 Cookie，禁用缓存与重定向。401 提示重新登录，403 提示没有资格，503 显示服务不可用；不要自动转用独立身份、无限重试或保留旧用户的数据。`onSessionChanged` 会取消进行中的请求并丢弃迟到结果。凭证仅在请求过程中使用，不写入 URL、localStorage、日志或错误提示。

后台必须分别验证独立与 Shell 两种来源的凭证；对于 Shell 凭证，还要逐次验证签名、签发者、后台受众、时效、插件版本、scope 和有效授权状态，再把 `(iss, plugin_id, sub)` 映射为内部用户。读取或修改每条私有资源时继续检查所有者；撤权或下线后拒绝受保护请求。独立账号与 Shell 账号绑定、旧数据迁移均需用户明确发起并分别验证，不能按昵称/邮箱合并。

## 4. 本地检查与提交

`npm run dev` 可检查固定导航、主页和子页；`npm run typecheck`、`npm run test`、`npm run build:plugin`、`npm run build:standalone`、`npm run check:manifest`、`npm run check:consistency`、`npm run check:package` 检查代码和产物。申请接入时提交 manifest、版本、完整 `dist/SHA256SUMS`、后台来源、权限与数据用途、未登录/撤权/跨账号测试证据。模板检查通过不代表上线批准；正式审核与授权由平台管理。
