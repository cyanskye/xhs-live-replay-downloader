# xhs-live-replay-downloader

Extract and download Xiaohongshu live replay HLS streams.

The tool is intentionally lightweight: for normal public replay share links, it parses `share_source_id` and `host_id` from the URL, calls Xiaohongshu's public live replay detail endpoint, extracts the returned `.m3u8`, and optionally downloads it with `yt-dlp`.

## Supported links

Known supported forms:

```text
https://www.xiaohongshu.com/fe/live-h5/page/live_replay/<replay_id>?share_source_id=<clip_id>&host_id=<host_id>...
https://www.xiaohongshu.com/hina/livereplay/<replay_id>?share_source_id=<clip_id>&host_id=<host_id>...
```

The `.m3u8` URL is not constructed from the replay ID. It is extracted from the live replay API response because Xiaohongshu uses multiple HLS URL shapes.

## Requirements

Required for extracting `.m3u8`:

- Node.js 18+

Required for downloading:

- `yt-dlp`
- `ffmpeg` / `ffprobe`

Optional fallback:

- Playwright and Chrome/Chromium

The browser fallback is only used if direct API extraction fails, for example when the share URL format changes.

## Usage

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

Run from a local checkout:

```bash
npm run check
node bin/xhs-live-replay.js --dry-run '<xiaohongshu live replay url>'
```

Install the optional browser fallback in a local checkout:

```bash
npm install playwright
```

## Safety defaults

- Does not use your browser profile or cookies.
- Does not log in to Xiaohongshu.
- Does not bypass login, captchas, paywalls, or access restrictions.
- Uses direct API extraction first to avoid unnecessary browser automation.
- Runs one replay at a time.

If the replay is not publicly accessible, the tool should fail instead of trying to bypass access controls.

## Notes

Xiaohongshu can change endpoint behavior or replay link formats at any time. Treat this as a convenience tool for public replay links you are allowed to save.
