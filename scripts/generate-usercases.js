const fs = require("node:fs");
const path = require("node:path");

const cases = [
  {
    slug: "aider", zh: "Aider", en: "Aider", url: "https://aider.chat/",
    zhDesc: "在终端中使用 AI 结对编程，并通过 MaxAPI 调用模型。",
    enDesc: "Use AI pair programming in your terminal with models from MaxAPI.",
    kind: "cli", install: "pipx install aider-chat", start: "aider --model YOUR_MODEL_ID",
    env: "OPENAI_API_BASE", envUrl: "https://api.maxapi.ai/v1",
  },
  {
    slug: "chatbox", zh: "Chatbox", en: "Chatbox", url: "https://chatboxai.app/",
    zhDesc: "在桌面、移动端和网页中使用 MaxAPI 模型聊天。",
    enDesc: "Chat with MaxAPI models on desktop, mobile, and the web.", kind: "gui",
    provider: "OpenAI API 兼容 / OpenAI API Compatible", baseLabel: "API Host",
  },
  {
    slug: "claude-code", zh: "Claude Code", en: "Claude Code", url: "https://docs.anthropic.com/en/docs/claude-code/overview",
    zhDesc: "通过 Anthropic 兼容协议将 Claude Code 接入 MaxAPI。",
    enDesc: "Connect Claude Code to MaxAPI through the Anthropic-compatible API.",
    kind: "cli", install: "npm install -g @anthropic-ai/claude-code", start: "claude",
    env: "ANTHROPIC_BASE_URL", envUrl: "https://api.maxapi.ai/anthropic", keyEnv: "ANTHROPIC_API_KEY",
  },
  {
    slug: "cline", zh: "Cline", en: "Cline", url: "https://github.com/cline/cline",
    zhDesc: "在 VS Code 中使用 MaxAPI 完成 Agent 编程任务。",
    enDesc: "Use MaxAPI for agentic coding tasks in VS Code.", kind: "gui",
    provider: "OpenAI Compatible", baseLabel: "Base URL",
  },
  {
    slug: "codex", zh: "OpenAI Codex CLI", en: "OpenAI Codex CLI", url: "https://github.com/openai/codex",
    zhDesc: "通过自定义模型供应商在 Codex CLI 中使用 MaxAPI。",
    enDesc: "Use MaxAPI in Codex CLI through a custom model provider.", kind: "codex",
  },
  {
    slug: "continue", zh: "Continue", en: "Continue", url: "https://www.continue.dev/",
    zhDesc: "在 VS Code 或 JetBrains 中配置 MaxAPI 模型。",
    enDesc: "Configure MaxAPI models in VS Code or JetBrains.", kind: "continue",
  },
  {
    slug: "cursor", zh: "Cursor", en: "Cursor", url: "https://cursor.com/",
    zhDesc: "覆盖 Cursor 的 OpenAI Base URL 并调用 MaxAPI。",
    enDesc: "Override the OpenAI base URL in Cursor to call MaxAPI.", kind: "gui",
    provider: "OpenAI", baseLabel: "Override OpenAI Base URL",
  },
  {
    slug: "gemini-cli", zh: "Gemini CLI", en: "Gemini CLI", url: "https://github.com/google-gemini/gemini-cli",
    zhDesc: "在支持 OpenAI 兼容配置的 CLI 工作流中调用 MaxAPI。",
    enDesc: "Call MaxAPI from an OpenAI-compatible CLI workflow.",
    kind: "cli", install: "npm install -g @google/gemini-cli", start: "gemini",
    env: "OPENAI_BASE_URL", envUrl: "https://api.maxapi.ai/v1",
  },
  {
    slug: "goamz", zh: "GoAMZ", en: "GoAMZ", url: "https://api.maxapi.ai/modelmak",
    zhDesc: "为 GoAMZ 的对话、Midjourney、可灵、Luma 和 Suno 模块配置 MaxAPI。",
    enDesc: "Configure MaxAPI for GoAMZ chat, Midjourney, Kling, Luma, and Suno modules.", kind: "goamz",
  },
  {
    slug: "immersive-translate", zh: "沉浸式翻译", en: "Immersive Translate", url: "https://immersivetranslate.com/",
    zhDesc: "使用 MaxAPI 文本模型翻译网页、PDF、电子书和字幕。",
    enDesc: "Translate webpages, PDFs, ebooks, and subtitles with MaxAPI text models.", kind: "translate",
  },
  {
    slug: "lobechat", zh: "LobeChat", en: "LobeChat", url: "https://lobechat.com/",
    zhDesc: "在 LobeChat 中添加 MaxAPI OpenAI 兼容供应商。",
    enDesc: "Add MaxAPI as an OpenAI-compatible provider in LobeChat.", kind: "gui",
    provider: "OpenAI Compatible", baseLabel: "API Proxy Address",
  },
  {
    slug: "roo-code", zh: "Roo Code", en: "Roo Code", url: "https://github.com/RooVetGit/Roo-Code",
    zhDesc: "在 Roo Code 的 Code、Architect、Ask 和 Debug 模式中使用 MaxAPI。",
    enDesc: "Use MaxAPI in Roo Code's Code, Architect, Ask, and Debug modes.", kind: "gui",
    provider: "OpenAI Compatible", baseLabel: "Base URL",
  },
  {
    slug: "zed", zh: "Zed 编辑器", en: "Zed editor", url: "https://zed.dev/",
    zhDesc: "为 Zed 的 AI 助手配置 MaxAPI OpenAI 兼容接口。",
    enDesc: "Configure the Zed AI assistant with the MaxAPI OpenAI-compatible API.", kind: "zed",
  },
];

const frontmatter = (title, description) => `---\ntitle: "${title}"\ndescription: "${description}"\n---\n`;
const warningZh = `<Warning>\n  请仅在受信任的设备上保存 API Key。不要将真实密钥提交到 Git 仓库或分享给他人。\n</Warning>`;
const warningEn = `<Warning>\n  Store API keys only on trusted devices. Never commit a real key to Git or share it with others.\n</Warning>`;

function cliPage(item, english) {
  const title = english ? item.en : item.zh;
  const desc = english ? item.enDesc : item.zhDesc;
  const keyEnv = item.keyEnv || "OPENAI_API_KEY";
  return `${frontmatter(title, desc)}\n[${title}](${item.url}) ${english ? "is a command-line AI tool that can use a custom model endpoint." : "是一款可以使用自定义模型端点的命令行 AI 工具。"}\n\n<Steps>\n  <Step title="${english ? "Install" : "安装"}">\n\n\`\`\`bash\n${item.install}\n\`\`\`\n  </Step>\n  <Step title="${english ? "Configure MaxAPI" : "配置 MaxAPI"}">\n\n\`\`\`bash\nexport ${keyEnv}="YOUR_API_KEY"\nexport ${item.env}="${item.envUrl}"\n\`\`\`\n  </Step>\n  <Step title="${english ? "Start the tool" : "启动工具"}">\n\n\`\`\`bash\n${item.start}\n\`\`\`\n  </Step>\n</Steps>\n\n${english ? warningEn : warningZh}\n\n<Note>\n  ${english ? "Replace `YOUR_MODEL_ID` with an ID from the MaxAPI model list. Environment-variable names can differ between tool versions; check the tool's current documentation if the value is not detected." : "请将 `YOUR_MODEL_ID` 替换为 MaxAPI 模型列表中的模型 ID。不同工具版本使用的环境变量名称可能不同；如果配置未生效，请检查工具的当前版本文档。"}\n</Note>\n`;
}

function guiPage(item, english) {
  const title = english ? item.en : item.zh;
  const desc = english ? item.enDesc : item.zhDesc;
  return `${frontmatter(title, desc)}\n[${title}](${item.url}) ${english ? "supports custom OpenAI-compatible model providers." : "支持自定义 OpenAI 兼容模型供应商。"}\n\n<Steps>\n  <Step title="${english ? "Install and open settings" : "安装并打开设置"}">\n    ${english ? `Install ${title}, then open its model or provider settings.` : `安装 ${title}，然后打开模型或供应商设置。`}\n  </Step>\n  <Step title="${english ? "Add MaxAPI" : "添加 MaxAPI"}">\n\n| ${english ? "Field" : "字段"} | ${english ? "Value" : "填写内容"} |\n| --- | --- |\n| ${english ? "Provider" : "供应商"} | \`${item.provider}\` |\n| ${item.baseLabel} | \`https://api.maxapi.ai/v1\` |\n| API Key | \`YOUR_API_KEY\` |\n| ${english ? "Model" : "模型"} | \`YOUR_MODEL_ID\` |\n  </Step>\n  <Step title="${english ? "Verify" : "验证连接"}">\n    ${english ? "Save the configuration, run the built-in connection test when available, then start a new chat." : "保存配置。如果客户端提供连接测试，请先完成测试，然后新建对话。"}\n  </Step>\n</Steps>\n\n${english ? warningEn : warningZh}\n\n<Note>\n  ${english ? "Some clients restrict agent mode or autocomplete when using third-party endpoints. These restrictions come from the client, not MaxAPI." : "部分客户端会限制第三方端点使用 Agent 模式或自动补全。这些限制来自客户端本身，并非 MaxAPI。"}\n</Note>\n`;
}

function specialPage(item, english) {
  const title = english ? item.en : item.zh;
  const desc = english ? item.enDesc : item.zhDesc;
  if (item.kind === "codex") return `${frontmatter(title, desc)}\n[Codex CLI](${item.url}) ${english ? "supports custom providers through `config.toml`." : "可以通过 `config.toml` 配置自定义供应商。"}\n\n<Steps>\n  <Step title="${english ? "Install" : "安装"}">\n\n\`\`\`bash\nnpm install -g @openai/codex\nexport MAXAPI_API_KEY="YOUR_API_KEY"\nmkdir -p ~/.codex\n\`\`\`\n  </Step>\n  <Step title="${english ? "Configure the provider" : "配置供应商"}">\n\n\`\`\`toml\nmodel = "YOUR_MODEL_ID"\nmodel_provider = "maxapi"\ndisable_response_storage = true\n\n[model_providers.maxapi]\nname = "MaxAPI"\nbase_url = "https://api.maxapi.ai/v1"\nenv_key = "MAXAPI_API_KEY"\nwire_api = "responses"\n\`\`\`\n  </Step>\n  <Step title="${english ? "Start" : "启动"}">\n\n\`\`\`bash\ncodex\n\`\`\`\n  </Step>\n</Steps>\n\n${english ? warningEn : warningZh}\n\n<Note>${english ? "Codex CLI requires the Responses protocol. Select a model and route that support `/v1/responses`." : "Codex CLI 要求使用 Responses 协议。请选择支持 `/v1/responses` 的模型和路由。"}</Note>\n`;
  if (item.kind === "continue") return `${frontmatter(title, desc)}\n[Continue](${item.url}) ${english ? "is an open-source coding assistant for VS Code and JetBrains." : "是适用于 VS Code 和 JetBrains 的开源编程助手。"}\n\n${english ? "Open **Continue: Open config**, then add:" : "打开 **Continue: Open config**，然后添加："}\n\n\`\`\`yaml\nmodels:\n  - name: MaxAPI model\n    provider: openai\n    model: YOUR_MODEL_ID\n    apiKey: YOUR_API_KEY\n    apiBase: https://api.maxapi.ai/v1\n\`\`\`\n\n${english ? warningEn : warningZh}\n\n${english ? "Select **MaxAPI model** from the model menu and start a chat. Use a fast model for autocomplete and a stronger model for agent tasks." : "从模型菜单选择 **MaxAPI model** 并开始对话。自动补全建议使用快速模型，Agent 任务建议使用能力更强的模型。"}\n`;
  if (item.kind === "goamz") return `${frontmatter(title, desc)}\n${english ? "Use the following MaxAPI addresses in the matching GoAMZ modules:" : "在 GoAMZ 的对应模块中填写以下 MaxAPI 地址："}\n\n| ${english ? "Module" : "模块"} | ${english ? "Address" : "地址"} |\n| --- | --- |\n| ${english ? "Chat / OneAPI" : "对话 / OneAPI"} | \`https://api.maxapi.ai\` |\n| Midjourney | \`https://api.maxapi.ai/mj\` |\n| Midjourney Fast | \`https://api.maxapi.ai/mj-fast/mj\` |\n| Midjourney Relax | \`https://api.maxapi.ai/mj-relax/mj\` |\n| Kling | \`https://api.maxapi.ai/kling/v1\` |\n| Luma | \`https://api.maxapi.ai\` |\n| Suno | \`https://api.maxapi.ai/suno/v1\` |\n\n<Note>${english ? "Restart the relevant account pool after changing an endpoint." : "修改端点后，请重启对应的账号池使配置生效。"}</Note>\n`;
  if (item.kind === "translate") return `${frontmatter(title, desc)}\n[${title}](${item.url}) ${english ? "can use a custom AI translation service." : "支持添加自定义 AI 翻译服务。"}\n\n<Steps>\n  <Step title="${english ? "Add a translation service" : "添加翻译服务"}">\n    ${english ? "Open **Settings → Translation services → Add custom translation service → Custom AI**." : "打开 **设置 → 翻译服务 → 添加自定义翻译服务 → 自定义 AI**。"}\n  </Step>\n  <Step title="${english ? "Enter MaxAPI settings" : "填写 MaxAPI 配置"}">\n\n| ${english ? "Field" : "字段"} | ${english ? "Value" : "填写内容"} |\n| --- | --- |\n| API URL | \`https://api.maxapi.ai/v1/chat/completions\` |\n| API Key | \`YOUR_API_KEY\` |\n| ${english ? "Model" : "模型"} | \`YOUR_MODEL_ID\` |\n  </Step>\n  <Step title="${english ? "Test and translate" : "测试并开始翻译"}">\n    ${english ? "Run the service test, then open a webpage and start translation." : "点击测试服务。测试成功后，打开网页并开始翻译。"}\n  </Step>\n</Steps>\n\n${english ? warningEn : warningZh}\n`;
  if (item.kind === "zed") return `${frontmatter(title, desc)}\n[Zed](${item.url}) ${english ? "supports custom language-model endpoints in `settings.json`." : "可以在 `settings.json` 中配置自定义模型端点。"}\n\n\`\`\`json\n{\n  "language_models": {\n    "openai": {\n      "api_url": "https://api.maxapi.ai/v1",\n      "api_key": "YOUR_API_KEY"\n    }\n  }\n}\n\`\`\`\n\n${english ? "Open the Assistant panel and select `YOUR_MODEL_ID`." : "打开 AI 助手面板，然后选择 `YOUR_MODEL_ID`。"}\n\n${english ? warningEn : warningZh}\n`;
}

for (const item of cases) {
  for (const english of [false, true]) {
    const directory = english ? "en/usercases" : "usercases";
    const content = item.kind === "cli" ? cliPage(item, english) : item.kind === "gui" ? guiPage(item, english) : specialPage(item, english);
    fs.mkdirSync(directory, { recursive: true });
    fs.writeFileSync(path.join(directory, `${item.slug}.mdx`), content);
  }
}

console.log(`Generated ${cases.length * 2} localized use-case pages.`);
