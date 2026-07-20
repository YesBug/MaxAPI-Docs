const fs = require("node:fs");

const specPath = process.argv[2] || "api-reference/openapi.json";
const docsPath = process.argv[3] || "docs.json";
const spec = JSON.parse(fs.readFileSync(specPath, "utf8"));
const docs = JSON.parse(fs.readFileSync(docsPath, "utf8"));

const vendors = [
  ["Google", /谷歌|google|gemini|banana|veo|vertex|aistudio/i],
  ["字节跳动", /豆包|seedance/i],
  ["阿里云", /阿里|wan|z-image/i],
  ["快手可灵", /可灵|kling/i],
  ["Vidu", /vidu/i],
  ["MiniMax", /minimax|hailuo/i],
  ["Midjourney", /midjourney|\bmj\b|insightface/i],
  ["Suno", /suno/i],
  ["Luma AI", /luma/i],
  ["Stability AI", /stable diffusion|stable image|sdxl|\/sd\//i],
  ["Fish Audio", /fish audio|\/fish\//i],
  ["Ideogram", /ideogram/i],
  ["Runway", /runway/i],
  ["MewXAI", /mewx|星月熊/i],
  ["佐糖", /佐糖/i],
  ["PPT 服务", /ppt|文多多|韦尼克/i],
  ["OpenAI", /openai|dall[·-]?e|sora|chat|completions|embeddings|audio/i],
];

const groups = new Map(vendors.map(([name]) => [name, []]));
groups.set("其他与兼容接口", []);

function classify(method, route, operation) {
  // Explicit vendor namespaces take precedence over names mentioned in
  // descriptions or examples (for example, SD docs may link to Google Drive).
  const namespaceRules = [
    ["Stability AI", /^\/sd\//],
    ["Fish Audio", /^\/fish\//],
    ["Suno", /^\/suno\//],
    ["Luma AI", /^\/luma(?:-vip)?\//],
    ["Midjourney", /^\/(?:mj|mj-fast|mj-relax)\//],
    ["快手可灵", /^\/kling\//],
    ["Runway", /^\/runwayml\//],
    ["Ideogram", /^\/ideogram\//],
    ["MiniMax", /^\/hailuo\//],
    ["字节跳动", /^\/seedance\//],
    ["阿里云", /^\/wan\//],
    ["Google", /^\/(?:vertex|aistudio|veo)\//],
  ];

  for (const [name, pattern] of namespaceRules) {
    if (pattern.test(route)) return name;
  }

  const haystack = [route, operation.summary, operation.description, ...(operation.tags || [])]
    .filter(Boolean)
    .join(" ");

  for (const [name, pattern] of vendors) {
    if (pattern.test(haystack)) return name;
  }

  return "其他与兼容接口";
}

const methods = ["get", "post", "put", "patch", "delete", "head", "options"];
for (const [route, pathItem] of Object.entries(spec.paths || {})) {
  for (const method of methods) {
    const operation = pathItem[method];
    if (!operation) continue;
    groups.get(classify(method, route, operation)).push(`${method.toUpperCase()} ${route}`);
  }
}

const source = specPath.replace(/^\.\//, "");
const englishSource = "en/api-reference/openapi.json";
const englishVendorNames = {
  "阿里云": "Alibaba Cloud",
  "字节跳动": "ByteDance",
  "快手可灵": "Kling AI",
  "佐糖": "PicWish",
  "PPT 服务": "Presentation services",
  "其他与兼容接口": "Other and compatible APIs",
};

function vendorGroups(openapi, english = false) {
  return [...groups.entries()]
    .filter(([, pages]) => pages.length > 0)
    .map(([group, pages]) => ({
      group: english ? englishVendorNames[group] || group : group,
      expanded: false,
      openapi,
      pages,
    }));
}

function tabs({ english = false } = {}) {
  const prefix = english ? "en/" : "";
  const openapi = english ? englishSource : source;
  return [
    {
      tab: english ? "Documentation" : "文档",
      icon: "book-open",
      groups: [
        {
          group: english ? "Getting started" : "开始使用",
          pages: [`${prefix}index`, `${prefix}quickstart`],
        },
        {
          group: english ? "Developer guides" : "开发指南",
          pages: [
            `${prefix}guides/authentication`,
            `${prefix}guides/async-tasks`,
            `${prefix}guides/errors`,
          ],
        },
      ],
    },
    {
      tab: "API Reference",
      icon: "square-terminal",
      groups: [
        {
          group: english ? "API overview" : "接口说明",
          pages: [`${prefix}api-reference/overview`],
        },
        {
          group: english ? "Browse by provider" : "按厂商浏览",
          pages: vendorGroups(openapi, english),
        },
      ],
    },
  ];
}

docs.navigation = {
  interaction: { drilldown: false },
  languages: [
    {
      language: "cn",
      default: true,
      navbar: {
        links: [{ label: "模型列表", href: "https://api.maxapi.ai/modelmak" }],
        primary: { type: "button", label: "获取KEY", href: "http://api.maxapi.ai" },
      },
      tabs: tabs(),
    },
    {
      language: "en",
      navbar: {
        links: [{ label: "Models", href: "https://api.maxapi.ai/modelmak" }],
        primary: { type: "button", label: "Get API key", href: "http://api.maxapi.ai" },
      },
      tabs: tabs({ english: true }),
    },
  ],
};
delete docs.navbar;

const assigned = [...groups.values()].reduce((total, pages) => total + pages.length, 0);
fs.writeFileSync(docsPath, `${JSON.stringify(docs, null, 2)}\n`);
const localizedVendorGroups = docs.navigation.languages[0].tabs[1].groups[1].pages;
console.log(`Organized ${assigned} operations into ${localizedVendorGroups.length} collapsible vendor groups per language.`);
for (const group of localizedVendorGroups) {
  console.log(`${group.group}: ${group.pages.length}`);
}
