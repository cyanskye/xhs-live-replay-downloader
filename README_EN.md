# Xiaohongshu Live Replay Downloader

[中文](README.md)

A small tool for downloading Xiaohongshu live replay videos.

> Tested on macOS only.

---

![demo](assets/demo.png)

## Why

Some Xiaohongshu live replay links cannot be handled directly by regular download tools.

This tool does one thing: save a Xiaohongshu live replay video to your computer.

## Features

- Download Xiaohongshu live replays
- Check a link before downloading
- Save to `~/Downloads` by default
- No Xiaohongshu account required
- No browser cookies used
- Can be used as an AI Agent Skill

## Install

### One-line install

```bash
curl -fsSL https://raw.githubusercontent.com/cyanskye/xhs-live-replay-downloader/main/install.sh | bash
```

### Or clone and install

```bash
git clone https://github.com/cyanskye/xhs-live-replay-downloader.git
cd xhs-live-replay-downloader
npm install -g .
```

## Usage

### Check a link first

```bash
xhs-live-replay --dry-run '<xiaohongshu live replay url>'
```

If the link can be downloaded, you will see:

```text
正在检查链接...
已找到可下载视频地址。
如果要下载，请去掉 --dry-run 再运行一次。
```

### Download

```bash
xhs-live-replay '<xiaohongshu live replay url>'
```

The video is saved to:

```text
~/Downloads
```

### Choose another folder

```bash
xhs-live-replay --output-dir ./downloads '<xiaohongshu live replay url>'
```

## Run Without Installing

```bash
npx github:cyanskye/xhs-live-replay-downloader --dry-run '<xiaohongshu live replay url>'
```

```bash
npx github:cyanskye/xhs-live-replay-downloader '<xiaohongshu live replay url>'
```

## Supported Links

Tested link forms:

```text
https://www.xiaohongshu.com/fe/live-h5/page/live_replay/...
https://www.xiaohongshu.com/hina/livereplay/...
```

If a link is expired, login-gated, or captcha-gated, the tool stops.

## AI Agent Skill

The repository includes a generic Skill:

```text
skills/xhs-live-replay-downloader
```

After installing the command, copy that folder into any AI tool that supports `SKILL.md`. Then ask:

```text
Download this Xiaohongshu live replay: <url>
```

## Update

Run the installer again:

```bash
curl -fsSL https://raw.githubusercontent.com/cyanskye/xhs-live-replay-downloader/main/install.sh | bash
```

## Project Structure

```text
assets/         demo image
bin/            command line tool
skills/         AI Agent Skill
install.sh      macOS installer
README.md       Chinese docs
```

## License

MIT

## Author

magicsang — [@cyanskye](https://github.com/cyanskye)
