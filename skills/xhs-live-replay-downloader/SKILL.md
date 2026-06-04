---
name: xhs-live-replay-downloader
description: Download Xiaohongshu live replay pages by extracting the hidden HLS m3u8 URL from the public live replay API response, then downloading and verifying the MP4 with yt-dlp and ffprobe. Use when the user asks to download 小红书直播回放, 小红书 live replay, or xiaohongshu /live_replay and /livereplay links.
metadata:
  short-description: Download Xiaohongshu live replays
---

# Xiaohongshu Live Replay Downloader

Use the CLI from this repository as the deterministic implementation. Do not pass replay pages directly to `yt-dlp`; it does not reliably recognize Xiaohongshu live replay pages.

## Workflow

1. Confirm the URL is a Xiaohongshu live replay URL containing `/live_replay/` or `/livereplay/`.
2. Run a dry run first:

```bash
xhs-live-replay --dry-run --json '<xiaohongshu live replay url>'
```

3. If it returns `status: "m3u8_found"`, download:

```bash
xhs-live-replay --json '<xiaohongshu live replay url>'
```

4. Report the saved file path plus `ffprobe` verification from the CLI output.

## Install

On macOS, use the repository installer:

```bash
curl -fsSL https://raw.githubusercontent.com/cyanskye/xhs-live-replay-downloader/main/install.sh | bash
```

Or run without global install:

```bash
npx github:cyanskye/xhs-live-replay-downloader --dry-run --json '<url>'
```

## Safety Defaults

- Do not use browser profiles, cookies, or Xiaohongshu accounts unless the user explicitly asks and understands the risk.
- Do not bypass login, captchas, paywalls, or access restrictions.
- Prefer direct API extraction; browser fallback is only for changed share formats.
- Keep usage single-task and low-frequency.
