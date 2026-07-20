const fs = require("node:fs");
const path = require("node:path");

const source = process.argv[2];
const output = process.argv[3] || "api-reference/openapi.json";

if (!source) {
  throw new Error("Usage: node scripts/prepare-openapi.js <source> [output]");
}

const document = JSON.parse(fs.readFileSync(source, "utf8"));

// Some exported schemas use JSON Schema's `type: null`, which OpenAPI 3.0
// does not accept. Preserve the intent using OpenAPI 3.0's `nullable` flag.
function normalizeOpenApi30(value) {
  if (Array.isArray(value)) {
    value.forEach(normalizeOpenApi30);
    return;
  }

  if (!value || typeof value !== "object") return;

  if (value.type === "null") {
    value.type = "string";
    value.nullable = true;
  }

  for (const child of Object.values(value)) {
    normalizeOpenApi30(child);
  }
}

normalizeOpenApi30(document);

// Provider response examples can contain signed asset URLs whose query
// parameters resemble live cloud credentials. Never publish those values.
function redactCredentialPatterns(value) {
  if (typeof value === "string") {
    return value
      .replace(/LTAI[A-Za-z0-9]{12,}/g, "ALIYUN_ACCESS_KEY_ID")
      .replace(/(?:AKIA|ASIA)[A-Z0-9]{16}/g, "AWS_ACCESS_KEY_ID");
  }

  if (Array.isArray(value)) {
    for (let index = 0; index < value.length; index += 1) {
      value[index] = redactCredentialPatterns(value[index]);
    }
    return value;
  }

  if (value && typeof value === "object") {
    for (const [key, child] of Object.entries(value)) {
      value[key] = redactCredentialPatterns(child);
    }
  }

  return value;
}

redactCredentialPatterns(document);
document.info = {
  ...document.info,
  title: "MaxAPI 模型 API",
  description: "MaxAPI 文本、图像、视频、音频和音乐模型接口。",
};
document.servers = [
  {
    url: "https://api.maxapi.ai",
    description: "MaxAPI 生产环境",
  },
];

fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, `${JSON.stringify(document, null, 2)}\n`);
console.log(`Prepared ${output}`);
