# xhs-live-replay-downloader

小红书直播回放 `.m3u8` 提取与下载工具。

这是一个 **CLI 核心 + Codex Skill 使用说明** 的项目：

- 普通用户可以直接用命令行下载。
- Codex 用户可以把 `codex-skill/xhs-live-replay-downloader` 当作 Skill 使用，让 Codex 自动执行 dry-run、下载和验证。

> 作者目前只在 macOS 环境测试过。Linux/Windows 可能可用，但没有系统验证。

## 它怎么工作

对于公开可访问的小红书直播回放分享链接，本工具会：

1. 从 URL 里解析 `share_source_id` 和 `host_id`。
2. 请求小红书直播回放详情接口：

```text
https://www.xiaohongshu.com/api/sns/v1/live/dynamic/clip_detail_web?clip_id=<share_source_id>&host_id=<host_id>
```

3. 从接口响应里提取真实的 `.m3u8` 地址。
4. 可选：调用 `yt-dlp` 下载并用 `ffprobe` 验证视频。

不会用你的浏览器账号、cookies 或小红书登录态。

## 支持的链接

已验证的链接形态：

```text
https://www.xiaohongshu.com/fe/live-h5/page/live_replay/<replay_id>?share_source_id=<clip_id>&host_id=<host_id>...
https://www.xiaohongshu.com/hina/livereplay/<replay_id>?share_source_id=<clip_id>&host_id=<host_id>...
```

`.m3u8` 地址不要自己拼。小红书会返回不同形态的 HLS 地址，必须从接口响应里提取。

## 一键安装，macOS

需要 Homebrew。脚本会安装或检查：

- Node.js
- `yt-dlp`
- `ffmpeg` / `ffprobe`
- 本工具 CLI

```bash
curl -fsSL https://raw.githubusercontent.com/cyanskye/xhs-live-replay-downloader/main/scripts/install-macos.sh | bash
```

安装后：

```bash
xhs-live-replay --dry-run '<小红书直播回放链接>'
xhs-live-replay '<小红书直播回放链接>'
```

## 不安装直接用

只提取 HLS 地址：

```bash
npx github:cyanskye/xhs-live-replay-downloader --dry-run '<小红书直播回放链接>'
```

下载到 `~/Downloads`：

```bash
npx github:cyanskye/xhs-live-replay-downloader '<小红书直播回放链接>'
```

下载到指定目录：

```bash
npx github:cyanskye/xhs-live-replay-downloader --output-dir ./downloads '<小红书直播回放链接>'
```

## Codex Skill

Skill 文件在：

```text
codex-skill/xhs-live-replay-downloader/SKILL.md
```

推荐做法：

1. 先用上面的 macOS 一键脚本安装 CLI。
2. 把 `codex-skill/xhs-live-replay-downloader` 复制到你的 Codex skills 目录。
3. 之后可以直接让 Codex 处理：

```text
下载这个小红书直播回放：<链接>
```

Skill 会优先 dry-run，确认拿到 `.m3u8` 后再下载。

## 本地开发

```bash
git clone https://github.com/cyanskye/xhs-live-replay-downloader.git
cd xhs-live-replay-downloader
npm run check
node bin/xhs-live-replay.js --dry-run '<小红书直播回放链接>'
```

## 风控和边界

默认策略是保守的：

- 不登录小红书。
- 不读取浏览器 cookies。
- 不绕过验证码、登录、付费墙或访问限制。
- 默认一次处理一个链接。
- direct API 失败时才尝试浏览器兜底。

如果回放不是公开可访问，本工具应该失败，而不是尝试绕过限制。

---

# xhs-live-replay-downloader

Extract and download Xiaohongshu live replay `.m3u8` streams.

This repository provides both a **CLI implementation** and a **Codex Skill wrapper**:

- Regular users can run the command line tool directly.
- Codex users can install the Skill under `codex-skill/xhs-live-replay-downloader` and let Codex run dry-runs, downloads, and verification.

> Tested by the author on macOS only. Linux and Windows may work, but are not systematically verified.

## How It Works

For public Xiaohongshu live replay share links, the tool:

1. Parses `share_source_id` and `host_id` from the URL.
2. Calls Xiaohongshu's live replay detail endpoint:

```text
https://www.xiaohongshu.com/api/sns/v1/live/dynamic/clip_detail_web?clip_id=<share_source_id>&host_id=<host_id>
```

3. Extracts the real `.m3u8` URL from the response.
4. Optionally downloads it with `yt-dlp` and verifies the MP4 with `ffprobe`.

It does not use your browser account, cookies, or Xiaohongshu login session.

## Supported Links

Known supported forms:

```text
https://www.xiaohongshu.com/fe/live-h5/page/live_replay/<replay_id>?share_source_id=<clip_id>&host_id=<host_id>...
https://www.xiaohongshu.com/hina/livereplay/<replay_id>?share_source_id=<clip_id>&host_id=<host_id>...
```

Do not construct the `.m3u8` URL manually. Xiaohongshu returns multiple HLS URL shapes, so the HLS URL must be extracted from the API response.

## One-Line Install, macOS

Requires Homebrew. The installer checks or installs:

- Node.js
- `yt-dlp`
- `ffmpeg` / `ffprobe`
- this CLI

```bash
curl -fsSL https://raw.githubusercontent.com/cyanskye/xhs-live-replay-downloader/main/scripts/install-macos.sh | bash
```

Then run:

```bash
xhs-live-replay --dry-run '<xiaohongshu live replay url>'
xhs-live-replay '<xiaohongshu live replay url>'
```

## Run Without Installing

Only extract the HLS URL:

```bash
npx github:cyanskye/xhs-live-replay-downloader --dry-run '<xiaohongshu live replay url>'
```

Download to `~/Downloads`:

```bash
npx github:cyanskye/xhs-live-replay-downloader '<xiaohongshu live replay url>'
```

Download to a chosen directory:

```bash
npx github:cyanskye/xhs-live-replay-downloader --output-dir ./downloads '<xiaohongshu live replay url>'
```

## Codex Skill

The Skill lives at:

```text
codex-skill/xhs-live-replay-downloader/SKILL.md
```

Recommended setup:

1. Install the CLI with the macOS one-line installer above.
2. Copy `codex-skill/xhs-live-replay-downloader` into your Codex skills directory.
3. Ask Codex:

```text
Download this Xiaohongshu live replay: <url>
```

The Skill should dry-run first, then download after confirming the `.m3u8` was found.

## Local Development

```bash
git clone https://github.com/cyanskye/xhs-live-replay-downloader.git
cd xhs-live-replay-downloader
npm run check
node bin/xhs-live-replay.js --dry-run '<xiaohongshu live replay url>'
```

## Safety Boundaries

The default behavior is conservative:

- No Xiaohongshu login.
- No browser cookies.
- No captcha, login, paywall, or access-control bypass.
- One replay at a time.
- Browser fallback is only used if direct API extraction fails.

If a replay is not publicly accessible, the tool should fail rather than bypass access controls.
