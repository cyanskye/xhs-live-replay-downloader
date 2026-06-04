#!/usr/bin/env bash
set -euo pipefail

REPO="cyanskye/xhs-live-replay-downloader"

if [[ "$(uname -s)" != "Darwin" ]]; then
  echo "This installer is only tested on macOS." >&2
  exit 1
fi

if ! command -v brew >/dev/null 2>&1; then
  echo "Homebrew is required. Install it first: https://brew.sh" >&2
  exit 1
fi

echo "Installing runtime dependencies with Homebrew..."
brew list node >/dev/null 2>&1 || brew install node
brew list yt-dlp >/dev/null 2>&1 || brew install yt-dlp
brew list ffmpeg >/dev/null 2>&1 || brew install ffmpeg

echo "Installing xhs-live-replay from GitHub..."
npm install -g "github:${REPO}"

echo
echo "Done."
echo "Try:"
echo "  xhs-live-replay --dry-run '<xiaohongshu live replay url>'"
echo "  xhs-live-replay '<xiaohongshu live replay url>'"
