# Claude Code 环境配置记录

> 记录当前电脑 Claude Code 的所有扩展配置，便于在新电脑上快速恢复。

---

## 一、Marketplaces（市场源）

| 名称 | 来源仓库 | 安装命令 |
|------|----------|----------|
| claude-code-plugins | `anthropics/claude-code` | `/install-plugin claude-code-plugins` |
| superpowers-marketplace | `obra/superpowers-marketplace` | `/install-plugin superpowers-marketplace` |
| anthropic-agent-skills | `anthropics/skills` | `/install-plugin anthropic-agent-skills` |

---

## 二、已安装的 Plugins（插件）

| 插件名 | 所属市场 | 版本 | 说明 |
|--------|----------|------|------|
| frontend-design | claude-code-plugins | 1.0.0 | 前端界面设计辅助 |
| pr-review-toolkit | claude-code-plugins | 1.0.0 | PR 代码审查工具集 |
| superpowers | superpowers-marketplace | 5.1.0 | 增强工作流（brainstorming、TDD、调试等） |
| document-skills | anthropic-agent-skills | d211d437443a | 文档处理技能（docx、pdf、xlsx、pptx 等） |

### 安装命令

在 Claude Code 中依次执行：

```
/install-plugin frontend-design@claude-code-plugins
/install-plugin pr-review-toolkit@claude-code-plugins
/install-plugin superpowers@superpowers-marketplace
/install-plugin document-skills@anthropic-agent-skills
```

---

## 三、MCP Servers

MCP 配置已写入项目 `.claude/settings.json`，跟随项目目录迁移，无需额外操作。

| 名称 | 类型 | 用途 |
|------|------|------|
| zai-mcp-server | stdio (npx) | 图片分析、视频分析、OCR、UI 对比等 |
| web-search-prime | http | 网页搜索 |
| web-reader | http | 网页内容抓取与转换 |
| zread | http | GitHub 仓库文件读取与搜索 |

> API Key 绑定的是智谱 BigModel 平台，如更换环境需确认 Key 有效性。

---

## 四、全局配置（~/.claude/settings.json）

以下配置需要在**新电脑的全局 settings.json** 中手动设置：

```json
{
  "env": {
    "ANTHROPIC_AUTH_TOKEN": "<你的Token>",
    "ANTHROPIC_BASE_URL": "https://open.bigmodel.cn/api/anthropic",
    "API_TIMEOUT_MS": "3000000",
    "CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC": "1",
    "ANTHROPIC_DEFAULT_HAIKU_MODEL": "glm-4.5-air",
    "ANTHROPIC_DEFAULT_SONNET_MODEL": "glm-5-turbo",
    "ANTHROPIC_DEFAULT_OPUS_MODEL": "glm-5.1"
  },
  "enabledPlugins": {
    "frontend-design@claude-code-plugins": true,
    "pr-review-toolkit@claude-code-plugins": true,
    "superpowers@superpowers-marketplace": true,
    "document-skills@anthropic-agent-skills": true
  },
  "extraKnownMarketplaces": {
    "claude-code-plugins": {
      "source": { "source": "github", "repo": "anthropics/claude-code" }
    },
    "superpowers-marketplace": {
      "source": { "source": "github", "repo": "obra/superpowers-marketplace" }
    },
    "anthropic-agent-skills": {
      "source": { "source": "github", "repo": "anthropics/skills" }
    }
  },
  "skipDangerousModePermissionPrompt": true
}
```

---

## 五、新电脑迁移步骤

1. 安装 Claude Code
2. 配置全局 `~/.claude/settings.json`（参考上方第四节）
3. 在 Claude Code 中执行上方第二节的 4 条 `/install-plugin` 命令
4. 复制项目 `.claude/` 目录（MCP、Skills、Hooks、CLAUDE.md 自动生效）
