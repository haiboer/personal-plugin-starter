# 编码代理协作规则

本仓库是第三方插件起步模板。接到开发任务时先读 `README.md`、`docs/AI_DEVELOPMENT_WORKFLOW.md`、`docs/DEVELOPER_GUIDE.md`、`docs/PLATFORM_RULES.md`，再读 `sdk/src/index.ts` 与 `contract/plugin-manifest.schema.json`。

- 只实现开发者明确提出的业务功能；缺失的后台、授权和数据规则须在交付报告中说明，不得编造。
- `plugin-manifest.json` 与 `src/manifest.ts` 的 ID、名称、版本保持一致；插件首页路由使用空路径。
- 不通过修改 `sdk/`、`contract/` 或 Shell/Core 绕过校验。插件不得获取平台主账号令牌或其他插件数据。
- 本地预览、构建和清单校验不是平台审核。不要自行发布、赋权或声称第三方安全隔离已实现。
- 完成改动后执行相关构建与清单检查，记录实际结果和未验证项；检查变更中是否含凭据或个人数据。
