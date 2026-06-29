/**
 * 公共类型入口（barrel）。
 *
 * 实际定义按领域拆分在同目录下的独立文件中：
 * - `client.ts`   — 客户端配置与底层 HTTP 请求类型。
 * - `response.ts` — 禅道 API 响应与归一化结果类型。
 * - `options.ts`  — 进程级全局选项与高阶 `request()` 选项。
 * - `profile.ts`  — 本地持久化 profile 类型。
 * - `data.ts`     — 本地数据处理（过滤 / 搜索 / 排序 / 摘取）类型。
 * - `module.ts`   — 模块 / 动作注册表与命令解析类型。
 */
export * from './client.js';
export * from './response.js';
export * from './options.js';
export * from './profile.js';
export * from './data.js';
export * from './module.js';
