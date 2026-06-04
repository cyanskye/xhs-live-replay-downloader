#!/usr/bin/env node

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

function usage(exitCode = 2) {
  const script = path.basename(process.argv[1]);
  console.error(`Usage: ${script} [--dry-run] [--output-dir DIR] [--timeout-ms N] <xiaohongshu-live-replay-url>`);
  process.exit(exitCode);
}

function parseArgs(argv) {
  const opts = {
    dryRun: false,
    outputDir: path.join(os.homedir(), 'Downloads'),
    timeoutMs: 30000,
  };
  const positional = [];

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--dry-run') {
      opts.dryRun = true;
    } else if (arg === '--output-dir') {
      opts.outputDir = argv[++i];
      if (!opts.outputDir) usage();
    } else if (arg === '--timeout-ms') {
      opts.timeoutMs = Number(argv[++i]);
      if (!Number.isFinite(opts.timeoutMs) || opts.timeoutMs <= 0) usage();
    } else if (arg === '-h' || arg === '--help') {
      usage(0);
    } else if (arg.startsWith('-')) {
      console.error(`Unknown option: ${arg}`);
      usage();
    } else {
      positional.push(arg);
    }
  }

  if (positional.length !== 1) usage();
  opts.url = positional[0];
  return opts;
}

function ensureCommand(command, help) {
  const result = spawnSync('which', [command], { encoding: 'utf8' });
  if (result.status !== 0) {
    throw new Error(`${command} not found. ${help}`);
  }
}

function chromeExecutablePath() {
  const candidates = [
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
  ];
  return candidates.find((candidate) => fs.existsSync(candidate));
}

function safeName(value) {
  return String(value)
    .replace(/[\\/:*?"<>|]+/g, '-')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 120);
}

function collectM3u8Urls(text) {
  const urls = new Set();
  if (!text) return urls;
  for (const match of text.matchAll(/https?:\/\/[^"'\\\s<>]+?\.m3u8(?:\?[^"'\\\s<>]*)?/g)) {
    urls.add(match[0].replace(/\\u0026/g, '&'));
  }
  return urls;
}

function parseReplayUrl(url) {
  const parsed = new URL(url);
  const replayMatch = parsed.pathname.match(/(?:live_replay|livereplay)\/(\d+)/);
  return {
    replayId: replayMatch ? replayMatch[1] : null,
    clipId: parsed.searchParams.get('share_source_id'),
    hostId: parsed.searchParams.get('host_id'),
  };
}

async function extractM3u8FromApi(url) {
  const ids = parseReplayUrl(url);
  if (!ids.clipId || !ids.hostId) {
    return {
      m3u8Url: null,
      candidates: [],
      apiResponses: [],
      title: '',
      pageText: '',
      method: 'direct_api',
      error: 'Missing share_source_id or host_id in URL.',
    };
  }

  const apiUrl = `https://www.xiaohongshu.com/api/sns/v1/live/dynamic/clip_detail_web?clip_id=${encodeURIComponent(ids.clipId)}&host_id=${encodeURIComponent(ids.hostId)}`;
  const response = await fetch(apiUrl, {
    headers: {
      Referer: 'https://www.xiaohongshu.com/',
      'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
      Accept: 'application/json,text/plain,*/*',
    },
  });
  const body = await response.text();
  const candidates = [...collectM3u8Urls(body)];

  return {
    m3u8Url: candidates[0] || null,
    candidates,
    apiResponses: [{ url: apiUrl, status: response.status }],
    title: '',
    pageText: '',
    method: 'direct_api',
  };
}

async function extractM3u8WithBrowser(url, timeoutMs) {
  let playwright;
  try {
    playwright = require('playwright');
  } catch {
    throw new Error('Playwright is not installed, and browser fallback is unavailable.');
  }

  const { chromium, devices } = playwright;
  const launchOptions = { headless: true };
  const executablePath = chromeExecutablePath();
  if (executablePath) launchOptions.executablePath = executablePath;

  const browser = await chromium.launch(launchOptions);
  try {
    const context = await browser.newContext({
      ...devices['iPhone 13'],
      locale: 'zh-CN',
      timezoneId: 'Asia/Shanghai',
      extraHTTPHeaders: {
        Referer: 'https://www.xiaohongshu.com/',
      },
    });
    const page = await context.newPage();
    const candidates = new Set();
    const apiResponses = [];

    page.on('request', (request) => {
      const requestUrl = request.url();
      if (requestUrl.includes('.m3u8')) candidates.add(requestUrl);
    });

    page.on('response', async (response) => {
      const responseUrl = response.url();
      if (responseUrl.includes('.m3u8')) candidates.add(responseUrl);
      if (!responseUrl.includes('/api/sns/v1/live/dynamic/clip_detail_web')) return;

      try {
        const body = await response.text();
        apiResponses.push({ url: responseUrl, status: response.status() });
        for (const m3u8 of collectM3u8Urls(body)) candidates.add(m3u8);
      } catch (error) {
        apiResponses.push({ url: responseUrl, status: response.status(), error: error.message });
      }
    });

    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: timeoutMs });
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline && candidates.size === 0) {
      await page.waitForTimeout(500);
    }

    const title = await page.title().catch(() => '');
    const pageText = await page.locator('body').innerText({ timeout: 3000 }).catch(() => '');
    return {
      m3u8Url: [...candidates][0] || null,
      candidates: [...candidates],
      apiResponses,
      title,
      pageText: pageText.slice(0, 500).replace(/\s+/g, ' '),
      method: 'browser_fallback',
    };
  } finally {
    await browser.close();
  }
}

async function extractM3u8BestEffort(url, timeoutMs) {
  const direct = await extractM3u8FromApi(url);
  if (direct.m3u8Url) return direct;

  try {
    return await extractM3u8WithBrowser(url, timeoutMs);
  } catch (error) {
    direct.fallbackError = error.message;
    return direct;
  }
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    stdio: options.stdio || 'pipe',
    encoding: 'utf8',
  });
  if (result.status !== 0) {
    const stderr = result.stderr ? `\n${result.stderr.trim()}` : '';
    throw new Error(`${command} failed with exit code ${result.status}.${stderr}`);
  }
  return result;
}

function downloadM3u8(m3u8Url, outputDir, replayId) {
  fs.mkdirSync(outputDir, { recursive: true });
  const baseName = safeName(`xhs-live-replay-${replayId || Date.now()}`);
  const template = path.join(outputDir, `${baseName}.%(ext)s`);
  run('yt-dlp', [
    '-N', '16',
    '--referer', 'https://www.xiaohongshu.com/',
    '--user-agent', 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    '-o', template,
    m3u8Url,
  ], { stdio: 'inherit' });
  return path.join(outputDir, `${baseName}.mp4`);
}

function verifyMp4(filePath) {
  const result = run('ffprobe', [
    '-v', 'error',
    '-show_entries', 'format=duration,size,bit_rate',
    '-show_entries', 'stream=codec_type,codec_name,width,height,bit_rate',
    '-of', 'json',
    filePath,
  ]);
  return JSON.parse(result.stdout);
}

function validateReplayUrl(url) {
  const parsed = new URL(url);
  if (!['www.xiaohongshu.com', 'xiaohongshu.com'].includes(parsed.hostname)) {
    throw new Error('Expected a xiaohongshu.com URL.');
  }
  if (!/(?:live_replay|livereplay)\//.test(parsed.pathname)) {
    throw new Error('Expected a Xiaohongshu live replay URL containing /live_replay/ or /livereplay/.');
  }
}

(async () => {
  const opts = parseArgs(process.argv.slice(2));
  validateReplayUrl(opts.url);

  if (!opts.dryRun) {
    ensureCommand('yt-dlp', 'Install yt-dlp first.');
    ensureCommand('ffprobe', 'Install ffmpeg first.');
  }

  console.error('Extracting replay m3u8...');
  const extraction = await extractM3u8BestEffort(opts.url, opts.timeoutMs);
  if (!extraction.m3u8Url) {
    console.error(JSON.stringify(extraction, null, 2));
    throw new Error('No m3u8 URL found. The replay may be expired, login-gated, or not publicly accessible.');
  }

  console.log(JSON.stringify({
    status: opts.dryRun ? 'm3u8_found' : 'm3u8_found_downloading',
    method: extraction.method,
    title: extraction.title,
    m3u8Url: extraction.m3u8Url,
    apiResponses: extraction.apiResponses,
  }, null, 2));

  if (opts.dryRun) return;

  const outputPath = downloadM3u8(extraction.m3u8Url, opts.outputDir, parseReplayUrl(opts.url).replayId);
  const probe = verifyMp4(outputPath);
  console.log(JSON.stringify({
    status: 'downloaded',
    outputPath,
    probe,
  }, null, 2));
})().catch((error) => {
  console.error(`ERROR: ${error.message}`);
  process.exit(1);
});
