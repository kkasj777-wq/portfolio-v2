import {
  copyFileSync,
  existsSync,
  mkdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { spawn } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const siteRoot = resolve(scriptDir, '..');
const ffmpegPath = join(
  siteRoot,
  'build',
  'ffmpeg-package',
  'node_modules',
  '@ffmpeg-installer',
  'win32-x64',
  'ffmpeg.exe',
);
const previewRoot = join(siteRoot, 'public', 'assets', 'video', 'previews');

const targets = [
  {
    key: 'hongguo_menglong',
    title: '猛龙下山',
    seriesId: '7641106063080557592',
    episodeId: '7641109102822706200',
    start: 35,
  },
  {
    key: 'hongguo_zuixu',
    title: '赘婿复仇，麒麟上身，我无敌了！',
    seriesId: '7604033108312083480',
    episodeId: '7604035078074682393',
    start: 30,
  },
  {
    key: 'hongguo_luding',
    title: '人到晚年，绝美魔女拿我当炉鼎',
    seriesId: '7516455152690154558',
    episodeId: '7516760581165026366',
    start: 35,
  },
  {
    key: 'hongguo_chuanyue',
    title: '穿越成了诸葛卧龙',
    seriesId: '7376857379536653336',
    episodeId: '7376879743443930136',
    start: 25,
  },
  {
    key: 'hongguo_zhanqing',
    title: '斩情归来，拿回我的江山',
    seriesId: '7600403174360370238',
    episodeId: '7600405369524866073',
    start: 25,
  },
  {
    key: 'hongguo_dangjianpai',
    title: '让你当挡箭牌，你真把老板娶了',
    seriesId: '7606591532514167870',
    episodeId: '7606593391240940606',
    start: 25,
  },
];

if (!existsSync(ffmpegPath)) {
  throw new Error(`ffmpeg was not found at ${ffmpegPath}`);
}

mkdirSync(previewRoot, { recursive: true });

function runFfmpeg(args) {
  return new Promise((resolvePromise, rejectPromise) => {
    const child = spawn(ffmpegPath, args, {
      stdio: ['ignore', 'ignore', 'pipe'],
      windowsHide: true,
    });
    let stderr = '';
    child.stderr.setEncoding('utf8');
    child.stderr.on('data', (chunk) => {
      stderr += chunk;
    });
    child.on('error', rejectPromise);
    child.on('close', (code) => {
      if (code === 0) resolvePromise();
      else rejectPromise(new Error(stderr || `ffmpeg exited with code ${code}`));
    });
  });
}

async function fetchPlayerData(target) {
  const playerUrl = `https://hongguoduanju.com/player/${target.seriesId}/${target.episodeId}`;
  const response = await fetch(playerUrl, {
    headers: {
      'user-agent': 'Mozilla/5.0',
      accept: 'text/html,application/xhtml+xml',
    },
  });
  if (!response.ok) {
    throw new Error(`${target.title}: player page returned HTTP ${response.status}`);
  }

  const html = await response.text();
  const playerMatch = html.match(/"video_player_info":(\{.*?\}),"seriesDetail"/s);
  if (!playerMatch) {
    throw new Error(`${target.title}: official player data was not found`);
  }

  const seriesStart = html.indexOf('"seriesDetail":');
  const seriesNameMatch = seriesStart >= 0
    ? html.slice(seriesStart, seriesStart + 4000).match(/"series_name":"([^"]+)"/)
    : null;
  const seriesName = seriesNameMatch?.[1] || target.title;
  if (seriesName !== target.title) {
    throw new Error(`${target.key}: expected “${target.title}” but official page returned “${seriesName}”`);
  }

  const playerInfo = JSON.parse(playerMatch[1]);
  if (!playerInfo.main_url) {
    throw new Error(`${target.title}: official video URL was empty`);
  }

  return { playerInfo, playerUrl };
}

async function buildPreview(target) {
  const outputPath = join(previewRoot, `${target.key}.mp4`);
  const partialPath = `${outputPath}.part.mp4`;
  const { playerInfo, playerUrl } = await fetchPlayerData(target);

  rmSync(partialPath, { force: true, maxRetries: 10, retryDelay: 200 });
  await runFfmpeg([
    '-y', '-hide_banner', '-loglevel', 'error',
    '-ss', String(target.start), '-i', playerInfo.main_url, '-t', '15',
    '-map', '0:v:0', '-map', '0:a?',
    '-vf', "scale=w='if(gt(iw,720),720,iw)':h=-2,fps=24",
    '-af', 'atrim=duration=14.98,asetpts=PTS-STARTPTS',
    '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '27', '-pix_fmt', 'yuv420p',
    '-c:a', 'aac', '-b:a', '80k', '-ac', '2', '-movflags', '+faststart',
    partialPath,
  ]);

  copyFileSync(partialPath, outputPath);
  rmSync(partialPath, { force: true });

  const result = {
    key: target.key,
    title: target.title,
    seriesId: target.seriesId,
    episodeId: target.episodeId,
    officialPlayer: playerUrl,
    sourceDurationSeconds: playerInfo.duration,
    previewStartSeconds: target.start,
    previewDurationSeconds: 15,
    preview: `assets/video/previews/${target.key}.mp4`,
    bytes: statSync(outputPath).size,
  };
  console.log(`Ready: ${target.title} (${target.start}s -> 15s)`);
  return result;
}

async function mapWithConcurrency(items, limit, worker) {
  const results = new Array(items.length);
  const errors = [];
  let cursor = 0;

  async function next() {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      try {
        results[index] = await worker(items[index]);
      } catch (error) {
        errors.push(error);
      }
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, next));
  if (errors.length) {
    throw new AggregateError(errors, `${errors.length} Hongguo preview(s) failed`);
  }
  return results;
}

const manifest = await mapWithConcurrency(targets, 3, buildPreview);
writeFileSync(
  join(previewRoot, 'hongguo-sources.json'),
  `${JSON.stringify({ generatedAt: new Date().toISOString(), works: manifest }, null, 2)}\n`,
  'utf8',
);
