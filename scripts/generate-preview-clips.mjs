import { existsSync, mkdirSync, statSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
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
  'ffmpeg.exe'
);
const previewRoot = join(siteRoot, 'public', 'assets', 'video', 'previews');
const force = process.argv.includes('--force');

if (!existsSync(ffmpegPath)) {
  throw new Error(`ffmpeg was not found at ${ffmpegPath}`);
}

const previewSources = [
  ['tongyoulu/ep01', 'F:\\作品集\\《通幽路》\\第一集最最最终版.mp4'],
  ['tongyoulu/ep02', 'F:\\作品集\\《通幽路》\\第二集最终版 加片头片尾版.mp4'],
  ['tongyoulu/ep03', 'F:\\作品集\\《通幽路》\\《通幽录》第三集-江畔古楼.mp4'],
  ['tongyoulu/ep04', 'F:\\作品集\\《通幽路》\\《通幽录》第四集成片终版.mp4'],
  ['tongyoulu/ep05', 'F:\\作品集\\《通幽路》\\《通幽录》第五集成片终版.mp4'],
  ['tongyoulu/ep06', 'F:\\作品集\\《通幽路》\\第六集.mp4'],
  ['tongyoulu/ep07', 'F:\\作品集\\《通幽路》\\第七集.mp4'],

  ['maimai/ep01', 'F:\\作品集\\麦麦的面包店\\麦麦的面包店\\第一集 小鱼面包.mp4'],
  ['maimai/ep02', 'F:\\作品集\\麦麦的面包店\\麦麦的面包店\\第二集  云朵面包.MOV'],
  ['maimai/ep03', 'F:\\作品集\\麦麦的面包店\\麦麦的面包店\\第三集 太极面包.mp4'],
  ['maimai/ep04', 'F:\\作品集\\麦麦的面包店\\麦麦的面包店\\第四集 泡泡面包.mp4'],
  ['maimai/ep05', 'F:\\作品集\\麦麦的面包店\\麦麦的面包店\\第五集 伸缩面包.mp4'],
  ['maimai/ep06', 'F:\\作品集\\麦麦的面包店\\麦麦的面包店\\第六集 彩虹面包.mp4'],
  ['maimai/ep07', 'F:\\作品集\\麦麦的面包店\\麦麦的面包店\\第七集 绿化面包.mp4'],
  ['maimai/ep08', 'F:\\作品集\\麦麦的面包店\\麦麦的面包店\\第八集 音乐面包.mp4'],
  ['maimai/ep09', 'F:\\作品集\\麦麦的面包店\\麦麦的面包店\\第九集 飞行面包.mp4'],
  ['maimai/ep10', 'F:\\作品集\\麦麦的面包店\\麦麦的面包店\\第十集 弹簧面包.MP4'],
  ['maimai/ep11', 'F:\\作品集\\麦麦的面包店\\麦麦的面包店\\第十一集 绘画面包.mp4'],
  ['maimai/ep12', 'F:\\作品集\\麦麦的面包店\\麦麦的面包店\\第十二集 好梦面包.mp4'],
  ['maimai/ep13', 'F:\\作品集\\麦麦的面包店\\麦麦的面包店\\第十三集 房屋面包.MP4'],
  ['maimai/ep14', 'F:\\作品集\\麦麦的面包店\\麦麦的面包店\\第十四集 勇气面包.MP4'],
  ['maimai/ep15', 'F:\\作品集\\麦麦的面包店\\麦麦的面包店\\第十五集 发光面包.MP4'],

  ['xindong', 'F:\\作品集\\a视频类\\剧情片\\心动策划案.mp4'],
  ['jinyan', 'F:\\作品集\\a视频类\\剧情片\\禁言最终和谐版.mp4'],
  ['mufeng', 'F:\\作品集\\a视频类\\剧情片\\牧   风 MP4.mp4'],
  ['qishuku', 'F:\\作品集\\4k\\弃书库的守门人_1_chr2_prob4.mp4'],
  ['taoyan', 'F:\\作品集\\4k\\我最讨厌的人_10_chr2_prob4.mp4'],
  ['shancheng', 'F:\\作品集\\4k\\热血山城_1_chr2_prob4.mp4'],
  ['zoumagang', 'F:\\作品集\\4k\\走马岗的来历_1_chf3_ghq5.mp4'],
  ['dongdeng', 'F:\\作品集\\a视频类\\纪录片\\冬等最终版.mp4'],
  ['xiayan', 'F:\\作品集\\a视频类\\纪录片\\峡砚3.0.mp4'],
  ['douyun', 'F:\\作品集\\a视频类\\纪录片\\豆晕4k.mp4'],
  ['fanjiagxiang', 'F:\\作品集\\a视频类\\宣传片\\反家乡纪录片.mp4'],
  ['cixiu_video', 'F:\\作品集\\a视频类\\刺绣\\2fde86f02369febb106c446f612c7305_raw.mp4'],
  ['banhua_video', 'F:\\作品集\\a视频类\\非遗版画\\14ed9a4953c31526caf8005404c96af5_raw.mp4']
];

// Hand-picked starts keep the website previews focused on story imagery.
// The Maimai episodes deliberately skip their repeated bakery/baking sequence
// and show the distinct magical payoff from each individual story instead.
const manualPreviewStarts = {
  'maimai/ep01': 66,
  'maimai/ep02': 65,
  'maimai/ep03': 60,
  'maimai/ep04': 92,
  'maimai/ep05': 64,
  'maimai/ep06': 81,
  'maimai/ep07': 88,
  'maimai/ep08': 78,
  'maimai/ep09': 88,
  'maimai/ep10': 70,
  'maimai/ep11': 64,
  'maimai/ep12': 85,
  'maimai/ep13': 62,
  'maimai/ep14': 68,
  'maimai/ep15': 60,
  fanjiagxiang: 55,
  jinyan: 140,
  taoyan: 105
};

const previewSelectionNotes = {
  'maimai/ep01': '小猫吃下小鱼面包后变身，进入水下与小鱼相遇',
  'maimai/ep02': '云朵面包出炉，小兔吃下后化作柔软云朵',
  'maimai/ep03': '熊猫在山巅与竹林间施展太极',
  'maimai/ep04': '泡泡面包生效，小老鼠乘泡泡越过断桥',
  'maimai/ep05': '小狗借伸缩面包伸长身体与手臂',
  'maimai/ep06': '青蛙与小鸭踏出彩虹道路并重归于好',
  'maimai/ep07': '彩色魔法将荒地变成繁花森林',
  'maimai/ep08': '音乐面包让小鸟唱歌并召集森林音乐会',
  'maimai/ep09': '小羊穿上宇航服飞向月球与星际乐园',
  'maimai/ep10': '仓鼠进入云端魔法树，并踩上弹簧云鞋',
  'maimai/ep11': '绘画面包分给伙伴，并为树爷爷装点生日派对',
  'maimai/ep12': '梦境泡泡唤醒小鹿，小鹿化作星光精灵',
  'maimai/ep13': '猴子吃下房屋面包，用金色魔法建起森林小屋',
  'maimai/ep14': '小狐狸吃下勇气面包，胸口亮起勇气之星',
  'maimai/ep15': '星星面包点亮小刺猬，让她不再害怕黑夜'
};

function getDurationSeconds(sourcePath) {
  const result = spawnSync(ffmpegPath, ['-hide_banner', '-i', sourcePath], {
    encoding: 'utf8',
    windowsHide: true
  });
  const probeText = `${result.stdout ?? ''}\n${result.stderr ?? ''}`;
  const match = probeText.match(/Duration:\s*(\d{2}):(\d{2}):(\d{2}(?:\.\d+)?)/);
  if (!match) throw new Error(`Could not read duration for ${sourcePath}`);
  return Number(match[1]) * 3600 + Number(match[2]) * 60 + Number(match[3]);
}

mkdirSync(previewRoot, { recursive: true });
const manifest = [];

for (const [key, sourcePath] of previewSources) {
  if (!existsSync(sourcePath)) throw new Error(`Source video was not found: ${sourcePath}`);

  const outputPath = join(previewRoot, `${key}.mp4`);
  mkdirSync(dirname(outputPath), { recursive: true });

  const duration = getDurationSeconds(sourcePath);
  const start = manualPreviewStarts[key] ?? (
    duration <= 18 ? 0 : Math.min(Math.round(duration * 32) / 100, duration - 16)
  );

  if (force || !existsSync(outputPath)) {
    const result = spawnSync(ffmpegPath, [
      '-y', '-hide_banner', '-loglevel', 'error',
      '-stream_loop', '-1', '-ss', String(start), '-i', sourcePath, '-t', '15',
      '-map', '0:v:0', '-map', '0:a?',
      '-vf', "scale=w='if(gt(a,16/9),1280,-2)':h='if(gt(a,16/9),-2,720)',pad=1280:720:(ow-iw)/2:(oh-ih)/2:color=black,fps=24",
      '-af', 'atrim=duration=14.98,asetpts=PTS-STARTPTS',
      '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '28', '-pix_fmt', 'yuv420p',
      '-c:a', 'aac', '-b:a', '96k', '-ac', '2', '-movflags', '+faststart',
      outputPath
    ], { encoding: 'utf8', windowsHide: true });

    if (result.status !== 0) {
      throw new Error(`ffmpeg failed for ${sourcePath}\n${result.stderr}`);
    }
  }

  manifest.push({
    key,
    preview: `assets/video/previews/${key}.mp4`,
    source: sourcePath,
    sourceDurationSeconds: Math.round(duration * 100) / 100,
    previewStartSeconds: start,
    previewDurationSeconds: 15,
    selectionNote: previewSelectionNotes[key],
    bytes: statSync(outputPath).size
  });

  console.log(`Ready: ${key} (${start.toFixed(1)}s -> 15s)`);
}

const manifestPath = join(previewRoot, 'manifest.json');
writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
console.log(`Manifest: ${manifestPath}`);
