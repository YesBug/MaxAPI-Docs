const fs = require("node:fs");
const path = require("node:path");

const source = process.argv[2] || "api-reference/openapi.json";
const output = process.argv[3] || "en/api-reference/openapi.json";
const document = JSON.parse(fs.readFileSync(source, "utf8"));

const exact = new Map(Object.entries({
  "查询任务状态": "Get task status",
  "查询视频生成状态": "Get video generation status",
  "提交视频生成任务": "Create a video generation task",
  "视频生成": "Generate video",
  "文生视频": "Generate video from text",
  "图生视频": "Generate video from image",
  "生成视频": "Generate video",
  "生成图像": "Generate image",
  "图像生成": "Generate image",
  "生成音乐": "Generate music",
  "生成歌词": "Generate lyrics",
  "获取歌词": "Get lyrics",
  "获取音乐": "Get music",
  "创建嵌入": "Create embeddings",
  "创建转录": "Create transcription",
  "创建翻译": "Create translation",
  "内容补全接口": "Create completion",
  "取消任务": "Cancel task",
  "查询任务": "Get task",
  "查询单个任务": "Get task",
  "查询所有任务": "List tasks",
  "查询任务队列": "Get task queue",
  "查询积分余额": "Get credit balance",
  "下载视频": "Download video",
  "下载视频文件": "Download video file",
  "创建角色": "Create character",
  "编辑视频(remix)": "Remix video",
  "提交Imagine任务": "Create Imagine task",
  "提交Blend任务": "Create Blend task",
  "提交Describe任务": "Create Describe task",
  "提交Shorten任务": "Create Shorten task",
  "执行动作": "Run action",
  "分页查询任务": "List tasks with pagination",
  "上传音乐": "Upload music",
  "扩展视频": "Extend video",
  "获取模型列表": "List models",
  "获取模板列表": "List templates",
  "余额查询": "Get balance",
  "查询详情": "Get details",
  "回调演示": "Callback example",
  "模型列表": "List models",
}));

function englishSummary(summary, method, route) {
  if (!summary) return `${method.toUpperCase()} ${route}`;
  if (!/[\u3400-\u9fff]/.test(summary)) return summary;
  if (exact.has(summary)) return exact.get(summary);

  const rules = [
    [/查询|获取/g, "Get "],
    [/创建|提交/g, "Create "],
    [/生成/g, "Generate "],
    [/下载/g, "Download "],
    [/上传/g, "Upload "],
    [/取消/g, "Cancel "],
    [/任务/g, "task"],
    [/视频/g, "video"],
    [/图像|图片/g, "image"],
    [/音乐/g, "music"],
    [/接口/g, "API"],
  ];
  let translated = summary;
  for (const [pattern, replacement] of rules) translated = translated.replace(pattern, replacement);
  translated = translated.replace(/[\u3400-\u9fff]+/g, "").replace(/\s+/g, " ").trim();
  return translated || `${method.toUpperCase()} ${route}`;
}

document.info.title = "MaxAPI Model API";
document.info.description = "APIs for text, image, video, audio, and music models available through MaxAPI.";
document.servers = [{ url: "https://api.maxapi.ai", description: "MaxAPI production" }];

for (const [route, pathItem] of Object.entries(document.paths || {})) {
  for (const method of ["get", "post", "put", "patch", "delete", "head", "options"]) {
    const operation = pathItem[method];
    if (!operation) continue;
    operation.summary = englishSummary(operation.summary, method, route);
    if (operation.description && /[\u3400-\u9fff]/.test(operation.description)) {
      operation.description = `Use this endpoint to call the provider-compatible ${operation.summary.toLowerCase()} operation through MaxAPI.`;
    }
    operation.tags = ["MaxAPI endpoints"];
  }
}

function removeChineseDescriptions(value) {
  if (Array.isArray(value)) return value.forEach(removeChineseDescriptions);
  if (!value || typeof value !== "object") return;
  if (typeof value.description === "string" && /[\u3400-\u9fff]/.test(value.description)) {
    delete value.description;
  }
  for (const child of Object.values(value)) removeChineseDescriptions(child);
}

removeChineseDescriptions(document.components);
fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, `${JSON.stringify(document, null, 2)}\n`);
console.log(`Prepared ${output}`);
