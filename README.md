# MaxAPI Docs

MaxAPI 开发者文档，使用 [Mintlify](https://mintlify.com) 构建。

## 本地开发

```bash
npm install
npm run docs:dev
```

## 验证文档

```bash
npm run docs:validate
```

## 更新 OpenAPI

从后端导出最新 OpenAPI JSON 后运行：

```bash
npm run openapi:prepare -- /path/to/openapi.json api-reference/openapi.json
npm run openapi:english
npm run openapi:navigation
npm run docs:validate
```

生成脚本会设置 MaxAPI 生产环境 Base URL，并兼容处理 OpenAPI 3.0 不支持的 `type: null` 字段。英文脚本会生成独立的英文 API 规范，导航脚本会为中英文站点按模型厂商重新组织全部接口。不要直接手工修改生成后的 OpenAPI 文件。
