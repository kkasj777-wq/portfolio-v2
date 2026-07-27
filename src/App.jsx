import { useEffect, useMemo, useRef, useState } from 'react';
import './index.css';
import rawData from './data/works.json';
import previewData from './data/previews.json';
import originalScripts from './data/scripts.json';
import StarBorder from './components/StarBorder';
import PillNav from './components/PillNav';
import MagicBento from './components/MagicBento';
import LiquidChrome from './components/LiquidChrome';
import PortfolioMotion from './components/PortfolioMotion';

const portfolioChromeColor = [0.025, 0.105, 0.135];

const asset = (path = '') => {
  if (/^(?:https?:)?\/\//.test(path) || path.startsWith('data:')) return path;
  return `${import.meta.env.BASE_URL}${path.replace(/^\/+/, '')}`;
};

const featuredIds = [
  'yafobuyu',
  'shoudian',
  'tongyoulu',
  'maimai',
  'ai_miaoxu',
  'ai_nianhua',
  'jinyan',
  'naicha',
  'mufeng',
  'xiayan',
  'fanjiagxiang',
  'qishuku',
  'zoumagang',
];

const seriesPortalIds = ['tongyoulu', 'maimai'];
const coverOverrides = {
  yafobuyu: 'assets/frames/yafobuyu/frame_06.jpg',
  shoudian: 'assets/frames/shoudian/frame_07.jpg',
  tongyoulu: 'assets/frames/tongyoulu/hero-poster.jpg',
  maimai: 'assets/frames/maimai/ep09/frame_06.jpg',
  jinyan: 'assets/frames/jinyan/frame_07.jpg',
  naicha: 'assets/img/naicha/still_01.jpg',
  mufeng: 'assets/frames/mufeng/frame_02.jpg',
  xiayan: 'assets/frames/xiayan/frame_03.jpg',
  qishuku: 'assets/frames/qishuku/frame_03.jpg',
  zoumagang: 'assets/frames/zoumagang/frame_03.jpg',
  dongdeng: 'assets/frames/dongdeng/frame_04.jpg',
  xindong: 'assets/frames/xindong/frame_02.jpg',
};

const commercialIds = [
  'naicha',
  'hongguo_menglong',
  'hongguo_zuixu',
  'hongguo_luding',
  'hongguo_chuanyue',
  'hongguo_zhanqing',
  'hongguo_dangjianpai',
  'hongguo_bts',
];

const damagedFrames = new Set([
  'assets/frames/dongdeng/frame_02.jpg',
  'assets/frames/dongdeng/frame_03.jpg',
  'assets/frames/dongdeng/frame_07.jpg',
  'assets/frames/xindong/frame_03.jpg',
  'assets/frames/xindong/frame_05.jpg',
]);
const tongyouEpisodeTitles = [
  '第1集 · 浮生无迹 · 归乡逢幽',
  '第2集 · 渝州巷年',
  '第3集 · 江畔古楼',
  '第4集 · 黄桷渡 · 燃茶案',
  '第5集 · 傀灵寄忆',
  '第6集 · 黄桷渡 · 忌渡',
  '第7集 · 南山旧约',
];

const projectSlogans = {
  yafobuyu: '崖佛不语，年年替爱守望。',
  shoudian: '有些光照亮石刻，也照见父子之间没有说出口的话。',
  tongyoulu: '若世间无人记得你，就去问精怪与山城。',
  maimai: '每一块面包，都替一个小小心愿施法。',
  xindong: '心动不是意外，是勇气终于按下发送键。',
  jinyan: '当语言被夺走，沉默开始作证。',
  mufeng: '追着风走，才听见人物心里的方向。',
  qishuku: '被丢弃的书，也在等一个守门人。',
  taoyan: '最讨厌的那个人，可能藏着最难面对的自己。',
  shancheng: '山城不只向上生长，也让热血找到出口。',
  zoumagang: '一条街名，藏着一座城不肯遗忘的传说。',
  dongdeng: '冬天把时间放慢，让等待露出真实形状。',
  xiayan: '一方砚，磨出石头里沉睡的山河。',
  douyun: '豆香会散，手艺留下。',
  fanjiagxiang: '一百种成长，都从有人愿意陪伴开始。',
  cixiu_video: '针线走过的地方，时间有了纹理。',
  banhua_video: '刀落木上，旧故事重新显影。',
  img_cixiu: '把柔软的线，绣成有力量的视觉。',
  img_ke: '每一道刻痕，都是材料记住的决定。',
  img_nianhua: '让旧年画进入今天的目光。',
  img_muban: '一块木板，印出年味的层次。',
  img_xiu_man: '让非遗从针脚里走进漫画叙事。',
  img_taoyi: '泥土经过手，才有自己的呼吸。',
  img_taoyi_man: '当陶土进入漫画，手艺也有了角色。',
  img_zhanban: '把非遗讲清楚，也让它一眼被记住。',
  img_long: '龙不是符号，是不断生长的线。',
  img_long_world: '从一条龙纹，打开一个想象世界。',
  photo_night: '城市睡着以后，光开始说话。',
  photo_nature: '把风景留在它最接近呼吸的一秒。',
  photo_urban: '建筑写下秩序，街道留下人的尺度。',
  photo_people: '真正的故事，总在人没有摆好姿势之前发生。',
  naicha: '一杯滚烫的奶茶，装下年轻人第一次认真创业。',
  hongguo_menglong: '镜头之外，商业短剧靠每一个现场动作落地。',
  hongguo_zuixu: '逆袭写在剧情里，执行落在每一场戏里。',
  hongguo_luding: '奇幻越大胆，现场越需要准确。',
  hongguo_chuanyue: '穿越的是角色，不能穿帮的是现场。',
  hongguo_zhanqing: '权谋在台前推进，协作在幕后咬合。',
  hongguo_dangjianpai: '甜宠要快，现场判断更要快。',
  hongguo_bts: '合影是一秒，背后是完整的片场协作。',
  ai_miaoxu: '让古老纹样循着光，再次长成今天的故事。',
  ai_guangyu: '穿过数字孤岛，重新遇见真实的自己。',
  ai_poying: '最难摆脱的影子，也许一直在等待被拥抱。',
  ai_wanlaixin: '有些信来得很晚，却仍能抵达想念。',
  ai_nianhua: '把团圆画进新年，也把传统带进新的影像。',
  ai_mufeng4k: '风越过草原，把成长写进四季。',
};

const episodeStoryData = {
  tongyoulu: [
    {
      slogan: '当全世界都查无此人，故乡成了唯一证词。',
      synopsis: '林砚发现自己的身份记录正在消失，只能循着深夜来电返回渝州旧宅。一册古书与黄桷树灵现身，把他推入人与精怪共同存在的隐秘世界。',
    },
    {
      slogan: '巷子会老，等一个名字的人不会。',
      synopsis: '林砚在老巷与树洞间追索一段被时间遮住的童年记忆。现实人物与旧日身影交叠，他第一次看见“被遗忘”如何改变一个人的归处。',
    },
    {
      slogan: '江水不说话，古楼替亡者亮灯。',
      synopsis: '一座临江古楼在夜色中重新亮起红灯，老人与神秘女子的往事随江雾浮现。林砚循着异象进入旧楼，也离自己的身世更近一步。',
    },
    {
      slogan: '一盏燃尽的茶，藏着没有熄灭的冤。',
      synopsis: '废弃茶馆留下白色信物、烧灼痕迹与无法散去的执念。林砚从残存物件和当事人的记忆中拼回燃茶案，让被掩埋的真相再次见光。',
    },
    {
      slogan: '被遗忘的心愿，会寄居在最小的灵物里。',
      synopsis: '一只傀灵把旧店、食物与人的记忆连接起来。林砚跟随它寻找寄存多年的情感，也看见温柔如何穿过失去继续抵达后来的人。',
    },
    {
      slogan: '过河有禁忌，回头才是代价。',
      synopsis: '江边老人、夜船与“忌渡”的规矩构成新的谜局。林砚必须在渡与不渡之间作出选择，并承担打破禁忌之后真正的代价。',
    },
    {
      slogan: '旧约未赴，南山不散。',
      synopsis: '南山旧院、红衣女子与一场迟到多年的约定汇成最终线索。林砚替执念完成告别，也把七集以来的相遇重新拉回自己的身世与守护选择。',
    },
  ],
  maimai: [
    {
      slogan: '真正的朋友，会顺着水波回来。',
      synopsis: '小猫牵挂住在池塘里的小鱼泡泡。麦麦做出小鱼面包，让一句没来得及说完的想念有机会沿着水面抵达朋友。',
    },
    {
      slogan: '柔软不是退缩，是让心愿有地方降落。',
      synopsis: '小兔带着难以说出口的愿望来到面包店。云朵面包托起它的勇气，也帮助它跨过眼前的阻碍，把心里话送到最想念的人身边。',
    },
    {
      slogan: '找到平衡，力量才会回来。',
      synopsis: '小熊猫觉得自己失去了力量。麦麦把太极的阴阳与节奏揉进面团，让它在一收一放之间重新找到身体与内心的平衡。',
    },
    {
      slogan: '麻烦吹成泡泡，也能轻轻越过。',
      synopsis: '朋友们被一段难以通过的路拦住。泡泡面包把沉重的问题变得轻盈，让大家在合作与尝试中一起抵达河的另一边。',
    },
    {
      slogan: '不必变成别人，也能跑出自己的路。',
      synopsis: '小柯基因为自己的短腿而烦恼，想要一份能改变身体的伸缩面包。一次奇妙体验后，它开始看见自己的节奏与可爱并不需要被修正。',
    },
    {
      slogan: '速度会追上脚步，友情要先等一等。',
      synopsis: '一对朋友因为步伐不同而难以同行。彩虹面包带来轻快的力量，也让它们明白真正的伙伴会调整速度、一起走完这段路。',
    },
    {
      slogan: '一小片绿色，也能唤醒整座森林。',
      synopsis: '小浣熊守着一片逐渐枯萎的树林，希望找回从前的花草。绿化面包让种子与勇气一起发芽，森林也重新有了颜色。',
    },
    {
      slogan: '声音不必完美，真心会替它发亮。',
      synopsis: '小鸟因为声音变得难听而不敢再唱。音乐面包帮助它找回节奏和自信，重新站上朋友们面前唱出属于自己的声音。',
    },
    {
      slogan: '梦想飞得再远，也要从一次尝试起飞。',
      synopsis: '小羊一次次尝试飞行却总是失败。飞行面包把它送进想象中的星空，也让多年坚持终于得到一次勇敢的回应。',
    },
    {
      slogan: '跌下去不可怕，愿意再弹起来就好。',
      synopsis: '朋友遇到跨不过去的高度与挫折。弹簧面包让脚步获得回弹的力量，也把“失败一次”变成“再试一次”的起点。',
    },
    {
      slogan: '最好的礼物，是大家一起画出来的。',
      synopsis: '伙伴们想为树爷爷准备生日装饰，却不知道怎样留下最漂亮的颜色。绘画面包让想象变成图案，也把每个人的心意拼成礼物。',
    },
    {
      slogan: '愿每个闭上的眼睛，都有星光来接。',
      synopsis: '一只小鹿被不安和梦境困扰。好梦面包引来森林星光，为它编织一场柔软的夜游，让害怕慢慢变成安心。',
    },
    {
      slogan: '房子会变出来，安心要自己住进去。',
      synopsis: '小猴渴望拥有一间真正属于自己的小屋。房屋面包搭起奇妙空间，也让它理解“家”不只是墙壁，更是愿意停下来的安全感。',
    },
    {
      slogan: '勇气不是不害怕，是带着星光再走一步。',
      synopsis: '小狐狸面对未知总想后退。勇气面包点亮尾巴上的星形印记，让它带着仍然存在的害怕，主动迈出下一步。',
    },
    {
      slogan: '黑夜没有变小，是心里的光亮了。',
      synopsis: '小刺猬害怕黑暗，在星星面包与月亮面包之间作出选择。发光面包点亮它的眼睛，也让它终于敢独自走过夜色。',
    },
  ],
};

const atmospherePresets = {
  yafobuyu: { kind: 'stone', mark: '佑', meta: 'CLIFF BUDDHA / PRAYER' },
  shoudian: { kind: 'cinema', mark: '光', meta: 'FLASHLIGHT / MEMORY' },
  tongyoulu: { kind: 'spirit', mark: '幽', meta: 'SPIRIT ARCHIVE / 07' },
  maimai: { kind: 'bakery', mark: '麦', meta: 'MAGIC RECIPE / 15' },
  naicha: { kind: 'studio', mark: 'REC', meta: 'SOHU × LETV / 12' },
  jinyan: { kind: 'silence', mark: '禁', meta: 'VOICE / SILENCE' },
  mufeng: { kind: 'wind', mark: '風', meta: 'WIND STUDY / 01' },
  xiayan: { kind: 'stone', mark: '砚', meta: 'CRAFT / STONE' },
  fanjiagxiang: { kind: 'documentary', mark: '100', meta: 'QIJIANG / YOUTH' },
  qishuku: { kind: 'archive', mark: '书', meta: 'FORBIDDEN ARCHIVE' },
  zoumagang: { kind: 'folklore', mark: '岗', meta: 'FOLKLORE / ORIGIN' },
};

const categoryAtmosphereKinds = {
  系列导演: 'cinema',
  导演短片: 'cinema',
  纪录导演: 'documentary',
  纪录影像: 'documentary',
  商业现场: 'studio',
  商业实战: 'studio',
  'AI 影像': 'archive',
  实验影像: 'archive',
  平面视觉: 'registration',
  非遗影像: 'craft',
  摄影: 'aperture',
};

const getProjectAtmosphere = (work) => {
  if (atmospherePresets[work.id]) return atmospherePresets[work.id];
  if (work.id.startsWith('hongguo_')) return { kind: 'studio', mark: '场', meta: 'VERTICAL DRAMA / SET' };
  return {
    kind: categoryAtmosphereKinds[work.category] || 'cinema',
    mark: '◌',
    meta: 'VISUAL ARCHIVE / DIRECTOR CUT',
  };
};

const projectProfiles = {
  yafobuyu: {
    category: '导演短片',
    sub: '大足石刻 · 亲情守护 · 剧情短片',
    role: '导演 / 编剧',
    desc: '以大足石刻与崖佛意象为情感场域，在童年与成年两条时间线中讲述祈愿、守护和亲情记忆。首页展示片由原片两段各 15 秒画面组成。',
  },
  shoudian: {
    category: '导演短片',
    sub: '大足石刻 · 父子关系 · 剧情短片',
    role: '导演 / 编剧',
    desc: '以一支旧手电串联家庭记忆与父子关系，结尾回到大足石刻，在共同观看与陪伴中完成情感回应。网站完整保留原片 04:33 之后直至结尾的段落。',
  },
  tongyoulu: {
    title: '通幽录 · 渝州篇',
    category: '系列导演',
    sub: '中式悬疑 · 山城奇幻 · 7 集系列',
    role: 'AI 导演 / 剧本开发 / 剪辑',
    desc: '一个被全世界遗忘的少年回到渝州老宅，在《通幽录》与黄桷树精的指引下，为精怪了结心愿，也逐步逼近自己被抹去的真相。',
    video: 'assets/video/tongyoulu-hero-clean.mp4',
    caseStudy: {
      goal: '以重庆山城气质为底色，完成一套 7 集中式悬疑与都市奇幻系列，并在长线叙事中保持人物、世界规则和视觉风格一致。',
      role: '负责 AI 导演统筹、剧本开发与剪辑，把人物动机、场次信息和情绪节奏转译为可执行镜头。',
      method: '从人物小传、世界规则和文学剧本出发，首集拆解为 176 条镜头指令；以统一的角色、场景与影调标准推进各集。',
      result: '完成 7 集系列影像，累计成片 60+ 分钟；网站保留逐集 30 秒预览与独立画面档案。',
    },
  },
  maimai: {
    category: '系列导演',
    sub: '儿童奇幻 · 15 集 AI 系列动画',
    role: '导演 / 系列策划 / 制作',
    desc: '围绕一间魔法面包店展开的单元式治愈故事。每集以一种奇妙面包回应孩子成长中的困惑与愿望。',
    caseStudy: {
      goal: '完成 15 集儿童奇幻系列，让每个单元故事独立成立，同时保持角色、面包店世界和成长主题连续。',
      role: '负责导演、系列策划与制作，统筹每集主题、画面呈现和系列一致性。',
      method: '以“一种魔法面包回应一种成长困惑”为单元结构，持续统一角色、场景、视觉规则与叙事基调。',
      result: '完成 15 集系列交付；15 个分集均配置独立预览、正式片名与画面档案。',
    },
  },
  jinyan: {
    category: '导演短片',
    sub: '剧情短片 · 表达与沉默',
    role: '导演 / 剪辑',
  },
  mufeng: {
    category: '导演短片',
    sub: '人物短片 · 以风作为叙事意象',
    role: '导演 / 摄影',
  },
  xiayan: {
    category: '纪录导演',
    sub: '非遗纪录 · 峡砚制作技艺',
    role: '导演 / 剪辑',
  },
  naicha: {
    category: '商业现场',
    sub: '校园青春励志网络剧',
    role: '导演助理 / 分镜数字化 / 后期品控',
    caseStudy: {
      goal: '在校园青春励志网络剧的真实制作流程中，协助剧本、现场执行与后期交付保持衔接。',
      role: '担任导演助理，参与剧本研读、30+ 场次调度协作、分镜脚本数字化与后期品控。',
      method: '把导演意图整理为可执行的分镜与现场信息，并在拍摄和后期阶段持续核对内容与节奏。',
      result: '参与项目完成并在搜狐视频、乐视 TV 播出；网站保留平台剧集与公开片段入口。',
    },
    officialMedia: [
      {
        platform: '乐视 TV',
        code: 'LETV / EP01',
        title: '《奶茶滚烫》· 第 01 集',
        duration: '10:16',
        cover: 'assets/img/naicha/still_01.jpg',
        url: 'https://www.le.com/ptv/vplay/78015366.html',
      },
      {
        platform: '乐视 TV',
        code: 'LETV / EP02',
        title: '《奶茶滚烫》· 第 02 集',
        duration: '10:14',
        cover: 'assets/img/naicha/still_02.jpg',
        url: 'https://www.le.com/ptv/vplay/78015365.html',
      },
      {
        platform: '搜狐视频',
        code: 'SOHU / CUT01',
        title: '美妆魔法惊艳开场',
        duration: '02:53',
        cover: 'assets/img/naicha/still_03.jpg',
        url: 'https://tv.sohu.com/v/cGwvOTk4NTkzMC83MTI1MjkwNTEuc2h0bWw=.html',
      },
      {
        platform: '搜狐视频',
        code: 'SOHU / CUT02',
        title: '火锅奶茶创意出圈',
        duration: '02:46',
        cover: 'assets/img/naicha/still_04.jpg',
        url: 'https://tv.sohu.com/v/cGwvOTk4NTkzMC83MTI1Mjg5NjIuc2h0bWw=.html',
      },
      {
        platform: '搜狐视频',
        code: 'SOHU / CUT03',
        title: '意外冲突 · 兄弟情破裂',
        duration: '02:24',
        cover: 'assets/img/naicha/still_05.jpg',
        url: 'https://tv.sohu.com/v/cGwvOTk4NTkzMC83MTI2OTUxMzAuc2h0bWw=.html',
      },
      {
        platform: '搜狐视频',
        code: 'SOHU / CUT04',
        title: '直播引流 · 三人和好',
        duration: '03:42',
        cover: 'assets/img/naicha/still_06.jpg',
        url: 'https://tv.sohu.com/v/cGwvOTk4NTkzMC83MTI2OTQ3ODguc2h0bWw=.html',
      },
    ],
  },
  qishuku: {
    category: 'AI 影像',
    sub: '实验志怪 · 叙事概念短片',
    role: '导演 / 视觉统筹',
  },
  zoumagang: {
    category: 'AI 影像',
    sub: '民俗传说 · 实验短片',
    role: '导演 / 视觉统筹',
  },
  hongguo_zuixu: {
    category: '商业现场',
    sub: '红果商业短剧 · 61 集',
    role: '艺人助理 / 现场协作',
  },
  hongguo_chuanyue: {
    title: '红果短剧《穿越成了诸葛卧龙》',
    category: '商业现场',
    role: '艺人助理 / 现场协作',
  },
};

const strengths = [
  {
    no: '01',
    title: '剧本与世界观开发',
    en: 'SCREENWRITING',
    text: '从核心命题、人物小传和阵营关系出发，完成分场大纲、文学剧本与长线伏笔设计，让角色动机推动剧情。',
    tags: ['人物小传', '分场大纲', '人物弧光'],
  },
  {
    no: '02',
    title: '从文字到镜头',
    en: 'DIRECTING',
    text: '把文学剧本转译为可执行的景别、机位、构图、光影与声音方案，用镜头调度建立信息层级和情绪节奏。',
    tags: ['视听语言', '分镜脚本', '场面调度'],
  },
  {
    no: '03',
    title: 'AI 系列剧统筹',
    en: 'AI SERIES PIPELINE',
    text: '在多集项目中统一角色、场景、服化道和影调，并管理镜头指令、生成迭代、质控与后期交付。',
    tags: ['角色一致性', '镜头指令', '全流程质控'],
  },
  {
    no: '04',
    title: '现场与后期节奏',
    en: 'PRODUCTION',
    text: '拥有短剧现场协作、30+ 场次调度、分镜数字化与剪辑品控经验，理解创作意图如何落到真实制作条件。',
    tags: ['商业短剧', '现场执行', '剪辑品控'],
  },
];

const experience = [
  {
    year: '2026',
    company: '《通幽录 · 渝州篇》',
    role: 'AI 导演 / 剧本开发',
    text: '负责系列影像导演统筹；从人物小传、世界规则和文学剧本出发，将第一集拆解为 176 镜头指令并完成系列化交付。',
  },
  {
    year: '2026',
    company: '《麦麦的魔法面包店》',
    role: '导演 / 系列策划',
    text: '完成 15 集儿童奇幻系列创作，以单元故事维持角色一致性、主题连续性和稳定的视觉世界。',
  },
  {
    year: '2025.10 — 2025.11',
    company: '重庆数艺影视',
    role: '导演助理',
    text: '参与网络剧《奶茶滚烫》，协助导演统筹 30+ 场次调度，参与剧本研读、分镜脚本数字化与后期品控。',
  },
  {
    year: '2025.11 — 2026.02',
    company: '商业短剧项目',
    role: '现场协作',
    text: '参与多部商业短剧制作，在真实片场理解竖屏内容的开篇钩子、冲突密度、人物情绪和现场执行节奏。',
  },
  {
    year: '2023.09 — 2024.06',
    company: '重庆工程学院校团委',
    role: '宣传部负责人',
    text: '负责校级新媒体与公众号运营，撰写新闻稿、简报与快讯，并参与校园影像拍摄。',
  },
];

const recognitions = [
  {
    year: '综合创作类荣誉',
    title: '重庆市“金色之秋”文物比赛三等奖',
    note: '现有资料未标明获奖年份与参赛项目',
  },
  {
    year: '作品传播',
    title: '綦江非遗与留守儿童纪录片',
    note: '团中央及《中国青年》杂志社转载 · 现有资料未载片名与年份',
  },
  {
    year: '2023—2024 学年度',
    title: '重庆工程学院优秀共青团员',
    note: '校级荣誉',
  },
];

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12h13M13 6l6 6-6 6" />
    </svg>
  );
}

function VolumeIcon({ muted }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 10v4h3l4 3V7l-4 3H4Z" />
      {muted ? (
        <>
          <path d="m15 10 5 5" />
          <path d="m20 10-5 5" />
        </>
      ) : (
        <>
          <path d="M15 9.5c1.4 1.4 1.4 3.6 0 5" />
          <path d="M18 7c2.8 2.8 2.8 7.2 0 10" />
        </>
      )}
    </svg>
  );
}
function AmbientField() {
  return (
    <div className="ambient-field" aria-hidden="true">
      <span className="ambient-grid" />
      <span className="ambient-glow ambient-glow-a" />
      <span className="ambient-glow ambient-glow-b" />
      <span className="ambient-scan" />
      <span className="ambient-axis ambient-axis-a" />
      <span className="ambient-axis ambient-axis-b" />
    </div>
  );
}

function PortfolioStage({ children, paused = false }) {
  const stageRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [pageVisible, setPageVisible] = useState(!document.hidden);
  const [isMobile, setIsMobile] = useState(() => window.matchMedia('(max-width: 768px)').matches);
  const [reduceMotion, setReduceMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return undefined;
    const observer = new IntersectionObserver(([entry]) => setIsVisible(entry.isIntersecting), {
      rootMargin: '-80px 0px',
      threshold: 0,
    });
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const mobile = window.matchMedia('(max-width: 768px)');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMobile = () => setIsMobile(mobile.matches);
    const updateMotion = () => setReduceMotion(reducedMotion.matches);
    const updateVisibility = () => setPageVisible(!document.hidden);
    mobile.addEventListener('change', updateMobile);
    reducedMotion.addEventListener('change', updateMotion);
    document.addEventListener('visibilitychange', updateVisibility);
    return () => {
      mobile.removeEventListener('change', updateMobile);
      reducedMotion.removeEventListener('change', updateMotion);
      document.removeEventListener('visibilitychange', updateVisibility);
    };
  }, []);

  return (
    <div className="portfolio-stage" ref={stageRef}>
      <div className="portfolio-liquid-layer" aria-hidden="true">
        <LiquidChrome
          baseColor={portfolioChromeColor}
          speed={isMobile ? 0.46 : 0.68}
          amplitude={isMobile ? 0.48 : 0.66}
          frequencyX={2.15}
          frequencyY={1.35}
          interactive={!isMobile}
          paused={paused || !isVisible || !pageVisible || reduceMotion}
        />
      </div>
      <MagicBento
        className="portfolio-stage-content"
        enableStars
        enableSpotlight
        enableBorderGlow
        enableTilt
        enableMagnetism
        clickEffect
        spotlightRadius={300}
        particleCount={7}
      >
        {children}
      </MagicBento>
    </div>
  );
}

function ProjectAtmosphere({ work, episode, preset }) {
  const episodeMeta = episode
    ? `EP ${String(episode.ep || 1).padStart(2, '0')} / ${episode.title}`
    : preset.meta;

  return (
    <div className="project-atmosphere" data-atmosphere={preset.kind} aria-hidden="true">
      <span className="atmo-mesh" />
      <span className="atmo-glow atmo-glow-a" />
      <span className="atmo-glow atmo-glow-b" />
      <span className="atmo-orbit" />
      <span className="atmo-scan" />
      <b className="atmo-mark">{preset.mark}</b>
      <small className="atmo-meta">{episodeMeta}</small>
      <small className="atmo-coordinate">DIRECTOR ARCHIVE / {work.year || '2026'}</small>
    </div>
  );
}

const navigationItems = [
  { label: '首页', href: '#top' },
  { label: '作品', href: '#works' },
  { label: '编剧', href: '#writing' },
  { label: '商业', href: '#commercial' },
  { label: '经历', href: '#experience' },
  { label: '能力', href: '#strengths' },
  { label: '联系', href: '#contact' },
];

function Navigation() {
  const [activeHref, setActiveHref] = useState('#top');

  useEffect(() => {
    let frame = 0;
    const updateActiveSection = () => {
      frame = 0;
      const probe = window.scrollY + Math.min(window.innerHeight * 0.42, 420);
      let current = navigationItems[0].href;

      navigationItems.forEach(({ href }) => {
        if (!href.startsWith('#')) return;
        const section = document.querySelector(href);
        if (section && section.offsetTop <= probe) current = href;
      });
      setActiveHref(current);
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(updateActiveSection);
    };

    updateActiveSection();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <PillNav
      logo={asset('assets/logo-w.svg')}
      logoAlt="王陈鑫作品集标志"
      items={navigationItems}
      activeHref={activeHref}
      baseColor="#05070a"
      pillColor="#0b1117"
      pillTextColor="#cbd4dc"
      hoveredPillTextColor="#02100e"
    />
  );
}

function FlowVisibility() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => entry.target.classList.toggle('is-flow-visible', entry.isIntersecting));
      },
      { rootMargin: '180px 0px', threshold: 0.01 },
    );
    const observeNode = (node) => {
      if (!(node instanceof Element)) return;
      if (node.matches('.flow-card, .episode-tab')) observer.observe(node);
      node.querySelectorAll?.('.flow-card, .episode-tab').forEach((element) => observer.observe(element));
    };
    const unobserveNode = (node) => {
      if (!(node instanceof Element)) return;
      if (node.matches('.flow-card, .episode-tab')) observer.unobserve(node);
      node.querySelectorAll?.('.flow-card, .episode-tab').forEach((element) => observer.unobserve(element));
    };

    document.querySelectorAll('.flow-card, .episode-tab').forEach((element) => observer.observe(element));
    const mutations = new MutationObserver((records) => {
      records.forEach((record) => {
        record.addedNodes.forEach(observeNode);
        record.removedNodes.forEach(unobserveNode);
      });
    });
    mutations.observe(document.body, { childList: true, subtree: true });

    return () => {
      mutations.disconnect();
      observer.disconnect();
    };
  }, []);

  return null;
}

function Hero({ onPlayShowreel, showreelOpen }) {
  const sectionRef = useRef(null);
  const videoRef = useRef(null);
  const [active, setActive] = useState(true);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => setActive(entry.isIntersecting),
      { rootMargin: '120px 0px', threshold: 0.01 },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (active && !showreelOpen) video.play().catch(() => {});
    else video.pause();
  }, [active, showreelOpen]);

  return (
    <section className="hero" id="top" ref={sectionRef}>
      <div className="hero-reel" aria-hidden="true">
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          poster={asset('assets/frames/tongyoulu/hero-poster.jpg')}
        >
          <source src={asset('assets/video/tongyoulu-hero-clean.mp4')} type="video/mp4" />
        </video>
        <div className="hero-reel-overlay" />
        <div className="hero-grid-lines" />
      </div>
      <div className="hero-monument" aria-hidden="true">
        <strong>07</strong>
        <span>EPISODES<br />ONE STORY UNIVERSE</span>
      </div>

      <div className="hero-side hero-side-left">
        <span>PORTFOLIO / 2026</span>
        <span>CHONGQING · CHINA</span>
      </div>
      <div className="hero-side hero-side-right">
        <span>DIRECTOR</span>
        <span>SCREENWRITER</span>
      </div>

      <div className="hero-inner page-shell">
        <div className="hero-kicker"><span /> DIRECTOR · SCREENWRITER · AI FILMMAKER</div>
        <h1>
          <span>王陈鑫</span>
          <em>WANG CHENXIN</em>
        </h1>
        <p className="hero-role">导演 <i>/</i> 编剧 <i>/</i> AI 影像创作者</p>
        <p className="hero-intro">
          从人物动机与文学剧本出发，把故事拆解为能够被执行的镜头。<br />
          用导演思维驾驭 AI，而不是让技术替代叙事。
        </p>
        <div className="hero-actions">
          <StarBorder
            as="button"
            className="action-showreel star-cta"
            type="button"
            color="#9efff8"
            speed="3.2s"
            thickness={2}
            onClick={onPlayShowreel}
            aria-haspopup="dialog"
            aria-controls="showreel-dialog"
          >
            <span className="action-play-icon" aria-hidden="true">▶</span> 播放 45S SHOWREEL
          </StarBorder>
          <StarBorder
            as="a"
            className="action-primary star-cta"
            color="#4ff5e9"
            speed="4.5s"
            thickness={2}
            href="#works"
          >
            查看精选作品 <ArrowIcon />
          </StarBorder>
        </div>

        <div className="hero-metrics">
          <div><strong>7</strong><span>通幽录系列集数</span></div>
          <div><strong>60+</strong><span>通幽录成片分钟</span></div>
          <div><strong>176</strong><span>首集镜头指令</span></div>
          <div><strong>{rawData.works?.length || 0}</strong><span>完整作品档案</span></div>
        </div>
      </div>

      <button type="button" className="reel-counter flow-hit" onClick={onPlayShowreel} aria-label="播放 45 秒 SHOWREEL">
        <span>SHOWREEL</span>
        <i><b style={{ width: '100%' }} /></i>
        <span>45S</span>
      </button>
      <a className="scroll-cue flow-hit" href="#works"><span /> ENTER THE ARCHIVE</a>
    </section>
  );
}

function SectionHeading({ index, eyebrow, title, description }) {
  const displayTitle = eyebrow.split('/')[0].trim();
  return (
    <header className="section-heading">
      <b className="section-display-title" aria-hidden="true">{displayTitle}</b>
      <div className="section-index">{index}</div>
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h2>{title}</h2>
      </div>
      {description && <p>{description}</p>}
    </header>
  );
}

function About() {
  return (
    <section className="section about" id="about">
      <div className="page-shell">
        <SectionHeading
          index="04"
          eyebrow="PROFILE / DIRECTOR BIO"
          title="先理解人物为什么行动，再决定镜头如何移动。"
        />

        <div className="about-layout">
          <div className="identity-visual">
            <div className="identity-aura" />
            <span className="identity-code">W / 00</span>
            <strong>W</strong>
            <p>DIRECTOR<br />SCREENWRITER</p>
            <small>故事 / 人物 / 镜头 / 节奏</small>
          </div>

          <div className="about-copy">
            <span className="lead-mark">“</span>
            <p className="about-lead">
              我首先是一个讲故事的人。导演让我组织画面，编剧让我理解人物。
            </p>
            <p className="about-body">
              我的创作从世界观、人物小传和分场大纲开始，再进入分镜、场面调度、AI 镜头生成与后期节奏。
              技术可以提高产能，但角色动机、情绪递进与叙事取舍必须由创作者负责。
            </p>

            <div className="about-data">
              <div><small>身份</small><span>导演 / 编剧 / AI 影像创作者</span></div>
              <div><small>院校</small><span>重庆工程学院 · 数字媒体艺术</span></div>
              <div><small>地点</small><span>重庆 / 全国可远程</span></div>
              <div><small>状态</small><span className="status-live">开放合作</span></div>
            </div>

            <div className="tool-stack">
              <span>WRITING & DIRECTING</span>
              <ul>
                {['文学剧本', '人物小传', '分场大纲', '分镜脚本', '场面调度', '剪辑节奏'].map((tool) => (
                  <li key={tool}>{tool}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ScriptModal({ script, onClose, returnFocus }) {
  const [activeTab, setActiveTab] = useState('summary');
  const modalRef = useRef(null);

  useEffect(() => {
    setActiveTab('summary');
  }, [script.id]);

  useEffect(() => {
    const inertTargets = [
      document.querySelector('.pill-nav-container'),
      document.querySelector('.app > main'),
      document.querySelector('.app > footer'),
    ].filter(Boolean);
    inertTargets.forEach((element) => { element.inert = true; });

    const onKey = (event) => {
      if (event.key === 'Escape') {
        onClose();
        return;
      }
      if (event.key !== 'Tab') return;
      const focusable = [...(modalRef.current?.querySelectorAll(
        'button:not([disabled]), [href], [tabindex="0"]',
      ) || [])].filter((element) => element.getClientRects().length > 0);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.body.classList.add('modal-open');
    window.addEventListener('keydown', onKey);
    return () => {
      inertTargets.forEach((element) => { element.inert = false; });
      document.body.classList.remove('modal-open');
      window.removeEventListener('keydown', onKey);
      if (returnFocus?.isConnected) returnFocus.focus();
    };
  }, [onClose, returnFocus]);

  const tabs = [
    ['summary', '故事梗概', 'STORY'],
    ['characters', '人物小传', 'CHARACTERS'],
    ['chapters', script.outlineLabel || '分集大纲', 'OUTLINE'],
  ];

  return (
    <div ref={modalRef} className="script-modal" role="dialog" aria-modal="true" aria-label={`${script.title} 剧本档案`}>
      <button type="button" className="script-modal-backdrop" onClick={onClose} aria-label="关闭剧本档案" tabIndex="-1" />
      <div className="script-modal-shell">
        <header className="script-modal-hero">
          <div className="script-modal-code">
            <span>{script.code}</span>
            <i>ORIGINAL SCREENPLAY</i>
          </div>
          <h2>{script.title}</h2>
          <blockquote>“{script.slogan}”</blockquote>
          <div className="script-modal-meta">
            <span>{script.format}</span>
            <span>{script.period}</span>
            <b>仅展示概况 · 不公开剧本正文</b>
          </div>
        </header>

        <nav className="script-modal-tabs" role="tablist" aria-label={`${script.title} 内容分类`}>
          {tabs.map(([key, label, english]) => (
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === key}
              className={`flow-hit ${activeTab === key ? 'is-active' : ''}`}
              onClick={() => setActiveTab(key)}
              key={key}
            >
              <small>{english}</small>
              <strong>{label}</strong>
            </button>
          ))}
        </nav>

        <div className="script-modal-content" role="tabpanel">
          {activeTab === 'summary' && (
            <section className="script-summary-panel">
              <div className="script-panel-heading">
                <span>01 / STORY SYNOPSIS</span>
                <h3>故事梗概</h3>
              </div>
              <p>{script.synopsis}</p>
              <div className="script-summary-facts">
                <div><small>体量</small><strong>{script.format}</strong></div>
                <div><small>年代 / 地域</small><strong>{script.period}</strong></div>
                <div><small>人物规模</small><strong>{script.characters.length} 位主要人物</strong></div>
                <div><small>结构</small><strong>{script.chapters.length} {script.outlineLabel ? '章' : '集'}</strong></div>
              </div>
            </section>
          )}

          {activeTab === 'characters' && (
            <section className="script-characters-panel">
              <div className="script-panel-heading">
                <span>02 / CHARACTER ARCHIVE</span>
                <h3>人物小传</h3>
              </div>
              <div className="script-character-grid">
                {script.characters.map((character, index) => (
                  <article className="flow-card" key={character.name}>
                    <small>{String(index + 1).padStart(2, '0')}</small>
                    <h4>{character.name}</h4>
                    <b>{character.identity}</b>
                    <p>{character.bio}</p>
                  </article>
                ))}
              </div>
            </section>
          )}

          {activeTab === 'chapters' && (
            <section className="script-chapters-panel">
              <div className="script-panel-heading">
                <span>03 / NARRATIVE OUTLINE</span>
                <h3>{script.outlineLabel || '分集大纲'}</h3>
              </div>
              <div className="script-chapter-list">
                {script.chapters.map((chapter) => (
                  <article key={`${chapter.index}-${chapter.title}`}>
                    <span>{String(chapter.index).padStart(2, '0')}</span>
                    <div>
                      <small>{chapter.period}</small>
                      <h4>{chapter.title}</h4>
                    </div>
                    <p>{chapter.summary}</p>
                  </article>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      <StarBorder
        as="button"
        type="button"
        className="modal-close"
        color="#a68cff"
        speed="2.6s"
        thickness={2}
        onClick={onClose}
        aria-label="退出剧本档案"
        autoFocus
      >
        <span className="modal-close-copy"><strong>退出</strong><small>CLOSE</small></span>
        <span className="modal-close-icon" aria-hidden="true">×</span>
      </StarBorder>
    </div>
  );
}

function Writing({ onSelectScript }) {
  const methods = [
    {
      no: '01',
      title: '命题与世界规则',
      text: '先确定故事真正讨论的问题，再建立力量边界、行动代价与叙事规则，避免情节依靠临时设定强行推进。',
    },
    {
      no: '02',
      title: '人物动机与关系',
      text: '通过人物小传、欲望、恐惧与关系张力，明确角色为什么选择、为什么犹豫，以及选择会付出什么代价。',
    },
    {
      no: '03',
      title: '分场与镜头转译',
      text: '把文学剧本拆成信息明确的场次，再用景别、机位、构图、运动、光影和声音完成视觉化叙事。',
    },
  ];

  return (
    <section className="section writing" id="writing">
      <div className="page-shell">
        <SectionHeading
          index="02"
          eyebrow="SCREENWRITING / STORY DEVELOPMENT"
          title="编剧不是填满对白，而是设计选择与代价。"
          description="从人物和世界规则出发，建立能够支撑系列化创作、也能够真正落到镜头里的剧本。"
        />

        <div className="writing-feature">
          <div className="writing-still">
            <img src={asset('assets/frames/tongyoulu/ep03/frame_02.jpg')} alt="通幽录项目画面" loading="lazy" />
            <span>ORIGINAL SERIES / 2026</span>
          </div>
          <div className="writing-copy">
            <span className="eyebrow">FEATURED STORY WORLD</span>
            <h3>《通幽录 · 渝州篇》</h3>
            <p>
              被全世界遗忘的大学生林砚回到渝州老宅，发现外婆与千年黄桷树同时消失。
              一本记录精怪执念的古书，让他踏上找回自身存在、也替精怪完成未了心愿的旅程。
            </p>
            <dl>
              <div><dt>类型</dt><dd>都市奇幻 / 悬疑 / 微恐 / 成长</dd></div>
              <div><dt>核心主题</dt><dd>从被保护者成长为守护者</dd></div>
              <div><dt>创作职责</dt><dd>AI 导演 / 世界观与剧本开发 / 镜头转译</dd></div>
            </dl>
            <div className="writing-numbers">
              <div><strong>7</strong><span>集系列叙事</span></div>
              <div><strong>10′</strong><span>单集目标时长</span></div>
              <div><strong>176</strong><span>首集镜头指令</span></div>
            </div>
          </div>
        </div>

        <div className="writing-methods">
          {methods.map((method) => (
            <article key={method.no}>
              <span>{method.no}</span>
              <h3>{method.title}</h3>
              <p>{method.text}</p>
            </article>
          ))}
        </div>

        <div className="script-library">
          <div className="script-library-heading">
            <div>
              <span className="eyebrow">ORIGINAL SCREENPLAY ARCHIVE</span>
              <h3>原创剧本档案</h3>
            </div>
            <p>展示经现有申报材料核验的类型、体量与故事概况；完整剧本、对白和关键反转不公开。</p>
          </div>
          <div className="script-library-grid">
            {originalScripts.map((script) => (
              <button
                type="button"
                className="script-card"
                aria-label={`查看${script.title}的故事梗概、人物小传和${script.outlineLabel || '分集大纲'}`}
                onClick={() => onSelectScript(script)}
                key={script.title}
              >
                <span className="script-card-code">{script.code}</span>
                <div className="script-card-title">
                  <h4>{script.title}</h4>
                  <i>原创</i>
                </div>
                <p>{script.synopsis}</p>
                <div className="script-card-meta">
                  <span>{script.format}</span>
                  <span>{script.period}</span>
                </div>
                <span className="script-card-action">查看创作档案 <ArrowIcon /></span>
              </button>
            ))}
          </div>
        </div>

        <article className="writing-archive">
          <div className="writing-archive-code">
            <span>CONFIDENTIAL SCRIPT / 02</span>
            <strong>12<small>EP</small></strong>
          </div>
          <div className="writing-archive-copy">
            <span className="eyebrow">LONG-FORM STORY DEVELOPMENT</span>
            <h3>《奶茶滚烫》</h3>
            <p>
              校园创业题材短剧。项目材料保留完整的分集推进、人物关系与多轮结构修订痕迹；
              网站仅展示创作范围，不呈现剧本原页、对白与关键反转。
            </p>
          </div>
          <div className="writing-archive-meta">
            <span>校园 / 创业 / 青年成长</span>
            <span>分集推进 / 关系线 / 多轮改稿</span>
            <b>保密剧本开发</b>
          </div>
        </article>
        <p className="confidential-note">剧本与项目文件仅用于能力核验；网站不公开保密剧本原文。</p>
      </div>
    </section>
  );
}

function Works({ works, onSelect }) {
  const [view, setView] = useState('featured');
  const [category, setCategory] = useState('全部');
  const [visibleCount, setVisibleCount] = useState(12);
  const categories = useMemo(() => ['全部', ...new Set(works.map((work) => work.category))], [works]);
  const seriesWorks = seriesPortalIds.map((id) => works.find((work) => work.id === id)).filter(Boolean);
  const selected = useMemo(() => {
    if (view === 'featured') {
      return featuredIds.map((id) => works.find((work) => work.id === id)).filter(Boolean);
    }
    if (category === '全部') return works;
    return works.filter((work) => work.category === category);
  }, [category, view, works]);
  const selectedSeries = selected.filter((work) => seriesPortalIds.includes(work.id));
  const selectedGrid = selected.filter((work) => !seriesPortalIds.includes(work.id));
  const visibleWorks = view === 'all'
    ? selectedGrid.slice(0, visibleCount)
    : selectedGrid;
  const visibleArchiveCount = selectedSeries.length + visibleWorks.length;

  useEffect(() => {
    setVisibleCount(12);
  }, [category, view]);

  return (
    <section className="section works" id="works">
      <div className="page-shell">
        <SectionHeading
          index="01"
          eyebrow="SELECTED WORK / COMPLETE ARCHIVE"
          title="先看代表作，再进入完整作品档案。"
          description={`精选导演项目在前，全部 ${works.length} 项作品在后。系列项目可逐集查看独立内容与画面。`}
        />

        <div className="archive-switch" role="group" aria-label="作品视图">
          {[
            ['featured', '精选作品', featuredIds.length],
            ['all', '全部作品', works.length],
          ].map(([key, label, count]) => (
            <StarBorder
              as="button"
              type="button"
              aria-pressed={view === key}
              className={`archive-switch-tab ${view === key ? 'is-active' : ''}`}
              color={view === key ? '#d5fffb' : '#4ff5e9'}
              speed={view === key ? '4s' : '7s'}
              thickness={1}
              key={key}
              onClick={() => setView(key)}
            >
              <span>{label}</span><strong>{String(count).padStart(2, '0')}</strong>
            </StarBorder>
          ))}
        </div>

        {!!selectedSeries.length && (
          <div className="series-portals">
            {selectedSeries.map((work) => {
              const seriesIndex = seriesWorks.findIndex((series) => series.id === work.id);
              return (
                <button className="flow-card" type="button" key={work.id} onClick={() => onSelect(work)}>
                  <img
                    src={asset(coverOverrides[work.id] || work.thumb)}
                    alt=""
                    loading="lazy"
                    decoding="async"
                  />
                  <span className="series-portal-shade" />
                  <span className="series-portal-index">SERIES / 0{seriesIndex + 1}</span>
                  <span className="series-portal-copy">
                    <small>{work.sub}</small>
                    <strong>{work.title}</strong>
                    <b>{work.slogan}</b>
                    <i>{work.episodes.length} EPISODES · 逐集查看</i>
                  </span>
                  <span className="series-portal-arrow"><ArrowIcon /></span>
                </button>
              );
            })}
          </div>
        )}

        {view === 'all' && (
          <>
            <div className="work-filters" role="group" aria-label="全部作品分类">
              {categories.map((item) => (
                <button
                  type="button"
                  aria-pressed={item === category}
                  className={`flow-hit ${item === category ? 'is-active' : ''}`}
                  key={item}
                  onClick={() => setCategory(item)}
                >
                  {item}<sup>{item === '全部' ? works.length : works.filter((work) => work.category === item).length}</sup>
                </button>
              ))}
            </div>
            <div className="archive-status">
              <span>ARCHIVE / 2024—2026</span>
              <p>当前显示 {visibleArchiveCount} / {selected.length} 项</p>
            </div>
          </>
        )}

        <div className={`work-grid ${view === 'all' ? 'is-archive' : 'is-featured'}`}>
          {visibleWorks.map((work, index) => (
            <article
              className={`work-card flow-card work-card-${(index % 6) + 1}`}
              key={work.id}
            >
              <button
                type="button"
                className="work-card-trigger"
                aria-label={`查看项目：${work.title}`}
                onClick={() => onSelect(work)}
              />
              <div className="work-image">
                <img
                  src={asset(coverOverrides[work.id] || work.thumb)}
                  alt={work.title}
                  loading="lazy"
                  decoding="async"
                />
                <div className="work-scan" />
                {!!work.episodes?.length && <span className="episode-badge">{work.episodes.length} EP</span>}
                <span className="view-work">VIEW CASE <ArrowIcon /></span>
              </div>
              <div className="work-meta">
                <span>{String(index + 1).padStart(2, '0')} / {work.category}</span>
                <span>{work.year || '2026'}</span>
              </div>
              <h3>{work.title}</h3>
              <p>{work.sub || work.role}</p>
              <blockquote className="work-card-slogan">“{work.slogan}”</blockquote>
            </article>
          ))}
        </div>

        {view === 'all' && visibleCount < selectedGrid.length && (
          <StarBorder
            as="button"
            className="load-more"
            type="button"
            color="#4ff5e9"
            speed="5s"
            thickness={2}
            onClick={() => setVisibleCount((count) => count + 12)}
          >
            加载更多作品 <span>{Math.min(visibleCount + 12, selectedGrid.length) + selectedSeries.length} / {selected.length}</span>
          </StarBorder>
        )}
      </div>
    </section>
  );
}

function Commercial({ works, onSelect }) {
  const commercialWorks = commercialIds.map((id) => works.find((work) => work.id === id)).filter(Boolean);
  const [lead, ...redFruitWorks] = commercialWorks;

  return (
    <section className="section commercial" id="commercial">
      <div className="page-shell">
        <SectionHeading
          index="03"
          eyebrow="COMMERCIAL PRACTICE / ON-SET ARCHIVE"
          title="商业实战，不藏在导演作品后面。"
          description="网络剧与红果短剧片场履历独立呈现，保留项目、岗位和幕后材料，不把参与项目误写成个人导演成绩。"
        />

        <div className="commercial-overview">
          <button className="commercial-lead flow-card flow-warm" type="button" onClick={() => lead && onSelect(lead)}>
            {lead && <img src={asset(lead.thumb)} alt={lead.title} loading="lazy" decoding="async" />}
            <span className="commercial-film-grain" />
            <span className="commercial-lead-copy">
              <small>NETWORK DRAMA / DIRECTOR ASSISTANT</small>
              <strong>{lead?.title}</strong>
              <i>{lead?.role} · 30+ 场次协作</i>
            </span>
          </button>

          <div className="commercial-numbers">
            <div><strong>08</strong><span>商业项目档案</span></div>
            <div><strong>07</strong><span>红果短剧记录</span></div>
            <p>从剧本研读、现场调度到艺人协作与后期品控，真实制作经验单独归档。</p>
          </div>
        </div>

        <div className="redfruit-strip">
          {redFruitWorks.map((work, index) => (
            <button className="flow-card flow-warm" type="button" key={work.id} onClick={() => onSelect(work)}>
              <span className="redfruit-frame">
                <img src={asset(work.thumb)} alt={work.title} loading="lazy" decoding="async" />
                <i>RF / {String(index + 1).padStart(2, '0')}</i>
              </span>
              <strong>{work.title}</strong>
              <small>{work.role || '现场协作'}</small>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function Experience() {
  return (
    <section className="section experience" id="experience">
      <div className="page-shell">
        <SectionHeading
          index="05"
          eyebrow="EXPERIENCE / EDUCATION"
          title="创作与片场经历"
          description="从原创系列开发到真实片场，把剧本、镜头和制作条件放进同一套判断中。"
        />
        <div className="experience-list">
          {experience.map((item, index) => (
            <article key={item.company}>
              <span className="experience-no">0{index + 1}</span>
              <time>{item.year}</time>
              <div><h3>{item.company}</h3><span>{item.role}</span></div>
              <p>{item.text}</p>
            </article>
          ))}
        </div>

        <div className="award-strip">
          <span>VERIFIED RECOGNITION / EXPERIENCE</span>
          {recognitions.map((item) => (
            <article key={item.title}>
              <time>{item.year}</time>
              <strong>{item.title}</strong>
              <small>{item.note}</small>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Strengths() {
  return (
    <section className="section strengths" id="strengths">
      <div className="page-shell">
        <SectionHeading
          index="06"
          eyebrow="CAPABILITIES / STORY TO SCREEN"
          title="导演与编剧能力"
          description="贯通故事开发、镜头转译、AI 系列生产和真实片场执行。"
        />
        <div className="strength-grid">
          {strengths.map((item) => (
            <article key={item.no}>
              <div className="strength-top"><span>{item.no}</span><small>{item.en}</small></div>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
              <ul>{item.tags.map((tag) => <li key={tag}>{tag}</li>)}</ul>
              <i className="corner corner-a" /><i className="corner corner-b" />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Contact() {
  return (
    <footer className="contact" id="contact">
      <div className="contact-orb" />
      <div className="contact-grid-lines" />
      <div className="page-shell contact-inner">
        <span className="eyebrow">CONTACT / START A PROJECT</span>
        <h2>故事已经开始。<br /><em>下一镜，一起完成。</em></h2>
        <p>原创剧本 · 剧情短片 · AI 系列剧 · 商业短剧</p>
        <a className="contact-email flow-hit" href="mailto:3146652776@qq.com" aria-label="发送邮件至 3146652776@qq.com">EMAIL / 3146652776@qq.com</a>
        <div className="contact-meta">
          <span>WECHAT / 正式发布前开放</span>
          <span>CHONGQING / REMOTE</span>
          <span>© 2026 WANG CHENXIN</span>
        </div>
      </div>
    </footer>
  );
}

function ShowreelModal({ onClose, returnFocus }) {
  const modalRef = useRef(null);
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const pausedPrompt = isMuted ? '继续播放' : '点击有声播放';

  useEffect(() => {
    const inertTargets = [
      document.querySelector('.pill-nav-container'),
      document.querySelector('.app > main'),
      document.querySelector('.app > footer'),
    ].filter(Boolean);
    inertTargets.forEach((element) => { element.inert = true; });

    const onKey = (event) => {
      if (event.key === 'Escape') {
        onClose();
        return;
      }
      if (event.key !== 'Tab') return;
      const focusable = [...(modalRef.current?.querySelectorAll(
        'button:not([disabled]):not([tabindex="-1"]), [tabindex="0"]',
      ) || [])].filter((element) => element.getClientRects().length > 0);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.body.classList.add('modal-open');
    window.addEventListener('keydown', onKey);
    return () => {
      inertTargets.forEach((element) => { element.inert = false; });
      document.body.classList.remove('modal-open');
      window.removeEventListener('keydown', onKey);
      if (returnFocus?.isConnected) returnFocus.focus();
    };
  }, [onClose, returnFocus]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.play().catch(() => setIsPlaying(false));
  }, []);

  const togglePlayback = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) video.play().catch(() => setIsPlaying(false));
    else video.pause();
  };

  const toggleAudio = () => {
    const video = videoRef.current;
    if (!video) return;
    const nextMuted = !video.muted;
    video.muted = nextMuted;
    setIsMuted(nextMuted);
    if (video.paused) video.play().catch(() => setIsPlaying(false));
  };

  const onVideoKeyDown = (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    togglePlayback();
  };

  const elapsed = String(Math.min(45, Math.floor(currentTime))).padStart(2, '0');
  const progress = `${Math.min(100, (currentTime / 45) * 100)}%`;

  return (
    <div
      id="showreel-dialog"
      className="project-modal showreel-modal"
      style={{ '--project-accent': '#4ff5e9', '--project-accent-2': '#8a74ff' }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="showreel-title"
      aria-describedby="showreel-summary"
      ref={modalRef}
    >
      <button type="button" className="modal-backdrop" onClick={onClose} aria-label="关闭 SHOWREEL" tabIndex="-1" />
      <div className="showreel-shell">
        <header className="showreel-header">
          <div>
            <span>DIRECTOR SHOWREEL / 45 SEC</span>
            <h2 id="showreel-title">先看作品，再认识创作者。</h2>
          </div>
          <p id="showreel-summary">《崖佛不语，岁岁佑我》《通幽录》《手电》联合剪辑<br />点击画面暂停或继续，声音可独立控制。</p>
        </header>

        <div className={`showreel-stage modal-video-stage flow-card ${isPlaying ? 'is-playing' : 'is-paused'}`}>
          <video
            ref={videoRef}
            autoPlay
            muted={isMuted}
            loop
            playsInline
            preload="auto"
            poster={asset('assets/frames/yafobuyu/frame_06.jpg')}
            role="button"
            tabIndex="0"
            onClick={togglePlayback}
            onKeyDown={onVideoKeyDown}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
            aria-label={`${isPlaying ? '暂停' : pausedPrompt} 45 秒 SHOWREEL`}
          >
            <source src={asset('assets/video/showreel-45s.mp4')} type="video/mp4" />
          </video>
          <span className="modal-play-state" aria-hidden="true">
            <i>{isPlaying ? 'Ⅱ' : '▶'}</i>
            <span>
              <strong>{isPlaying ? '点击画面暂停' : pausedPrompt}</strong>
              <small>{isPlaying ? 'CLICK TO PAUSE' : isMuted ? 'CLICK TO PLAY' : 'CLICK FOR SOUND'}</small>
            </span>
          </span>
          <button
            className={`modal-audio-toggle flow-hit ${isMuted ? 'is-muted' : 'is-audible'}`}
            type="button"
            aria-label={isMuted ? '开启 SHOWREEL 声音' : '关闭 SHOWREEL 声音'}
            aria-pressed={!isMuted}
            onClick={toggleAudio}
          >
            <VolumeIcon muted={isMuted} />
            <span><strong>{isMuted ? '开启声音' : '声音已开启'}</strong><small>{isMuted ? 'SOUND OFF' : 'SOUND ON'}</small></span>
          </button>
        </div>

        <div className="showreel-progress">
          <span>{isPlaying ? 'PLAYING' : 'PAUSED'}</span>
          <i><b style={{ width: progress }} /></i>
          <time>00:{elapsed} / 00:45</time>
        </div>
        <footer className="showreel-credit">
          <span>FEATURED WORK / 03 FILMS</span>
          <strong>《崖佛不语，岁岁佑我》×《通幽录》×《手电》</strong>
          <small>导演 / 编剧 / AI 影像创作</small>
        </footer>
      </div>

      <StarBorder
        as="button"
        type="button"
        className="modal-close"
        color="#9efff8"
        speed="2.6s"
        thickness={2}
        onClick={onClose}
        aria-label="关闭 SHOWREEL"
        autoFocus
      >
        <span className="modal-close-copy"><strong>退出</strong><small>CLOSE</small></span>
        <span className="modal-close-icon" aria-hidden="true">×</span>
      </StarBorder>
    </div>
  );
}

function ProjectModal({ work, onClose, returnFocus }) {
  const [episodeIndex, setEpisodeIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [episodeMenuOpen, setEpisodeMenuOpen] = useState(false);
  const modalRef = useRef(null);
  const panelRef = useRef(null);
  const videoRef = useRef(null);
  const modalNavigationRef = useRef(null);
  const episodeTriggerRef = useRef(null);
  const videoSectionRef = useRef(null);
  const officialMediaSectionRef = useRef(null);
  const infoSectionRef = useRef(null);
  const caseStudySectionRef = useRef(null);
  const gallerySectionRef = useRef(null);

  useEffect(() => {
    const inertTargets = [
      document.querySelector('.pill-nav-container'),
      document.querySelector('.app > main'),
      document.querySelector('.app > footer'),
    ].filter(Boolean);
    inertTargets.forEach((element) => { element.inert = true; });

    const onKey = (event) => {
      if (event.key === 'Escape') {
        onClose();
        return;
      }
      if (event.key !== 'Tab') return;

      const focusable = [...(modalRef.current?.querySelectorAll(
        'a[href], button:not([disabled]):not([tabindex="-1"]), [tabindex="0"]',
      ) || [])].filter((element) => element.getClientRects().length > 0);
      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.body.classList.add('modal-open');
    window.addEventListener('keydown', onKey);
    return () => {
      inertTargets.forEach((element) => { element.inert = false; });
      document.body.classList.remove('modal-open');
      window.removeEventListener('keydown', onKey);
      if (returnFocus?.isConnected) returnFocus.focus();
    };
  }, [onClose, returnFocus]);

  useEffect(() => {
    setEpisodeIndex(0);
    setIsPlaying(false);
    setIsMuted(false);
    setEpisodeMenuOpen(false);
    panelRef.current?.scrollTo({ top: 0 });
  }, [work.id]);

  const episodes = work.episodes || [];
  const selectedEpisode = episodes[episodeIndex] || null;
  const activePreview = selectedEpisode?.preview || work.preview || work.video;
  const officialMedia = work.officialMedia || [];
  const hasMedia = Boolean(activePreview || officialMedia.length);
  const atmosphere = getProjectAtmosphere(work);
  const projectStyle = {
    '--project-accent': work.color || '#4ff5e9',
    '--project-accent-2': work.color2 || '#8a74ff',
  };
  const selectedEpisodeName = selectedEpisode?.title.replace(/^第\d+集\s*·?\s*/, '') || '';
  const pausedPrompt = isMuted ? '继续播放' : '点击有声播放';
  const previewDurationLabel = selectedEpisode
    ? work.id === 'tongyoulu' ? '30 秒' : '15 秒'
    : work.id === 'yafobuyu'
      ? '30 秒双片段'
      : work.id === 'shoudian'
        ? '04:33 至片尾完整段落'
        : '15 秒';

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !activePreview) return;
    setIsPlaying(false);
    video.play().catch(() => {
      setIsPlaying(false);
    });
  }, [activePreview]);

  const gallery = useMemo(() => {
    const source = selectedEpisode?.frames?.length
      ? selectedEpisode.frames
      : [work.thumb, ...(work.images || [])];
    const supplements = selectedEpisode
      ? [selectedEpisode.titleCard, coverOverrides[work.id], work.thumb]
      : [coverOverrides[work.id]];
    return [...new Set([...source, ...supplements].filter(
      (image) => image && !damagedFrames.has(image),
    ))].slice(0, 9);
  }, [selectedEpisode, work]);

  const selectEpisode = (index) => {
    setEpisodeIndex(index);
    setIsPlaying(false);
    setEpisodeMenuOpen(false);
    requestAnimationFrame(() => {
      panelRef.current?.scrollTo({ top: 0, behavior: 'auto' });
      episodeTriggerRef.current?.focus();
    });
  };

  const scrollModalTo = (targetRef) => {
    const panel = panelRef.current;
    const target = targetRef.current;
    if (!panel || !target) return;
    const navigationHeight = modalNavigationRef.current?.offsetHeight || 0;
    panel.scrollTo({
      top: Math.max(0, target.offsetTop - navigationHeight - 8),
      behavior: 'smooth',
    });
  };

  const togglePlayback = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().catch(() => setIsPlaying(false));
    } else {
      video.pause();
    }
  };

  const toggleAudio = () => {
    const video = videoRef.current;
    if (!video) return;
    const nextMuted = !video.muted;
    video.muted = nextMuted;
    setIsMuted(nextMuted);
    if (video.paused) video.play().catch(() => setIsPlaying(false));
  };

  const onVideoKeyDown = (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    togglePlayback();
  };

  return (
    <div
      ref={modalRef}
      className={`project-modal project-theme-${atmosphere.kind}`}
      style={projectStyle}
      role="dialog"
      aria-modal="true"
      aria-label={work.title}
    >
      <button type="button" className="modal-backdrop" onClick={onClose} aria-label="关闭项目详情" tabIndex="-1" />
      <ProjectAtmosphere work={work} episode={selectedEpisode} preset={atmosphere} />
      <StarBorder
        as="button"
        type="button"
        className="modal-close"
        color={work.color || '#9efff8'}
        speed="2.6s"
        thickness={2}
        onClick={onClose}
        aria-label="退出项目详情"
        autoFocus
      >
        <span className="modal-close-copy"><strong>退出</strong><small>CLOSE</small></span>
        <span className="modal-close-icon" aria-hidden="true">×</span>
      </StarBorder>
      <div className="modal-panel" ref={panelRef}>
        <div className="modal-navigation" ref={modalNavigationRef}>
          <div className="modal-navigation-bar">
            <div className="modal-project-chip">
              <small>PROJECT NAV</small>
              <strong>{work.title}</strong>
              <span>{selectedEpisode ? `EP ${String(episodeIndex + 1).padStart(2, '0')} · ${selectedEpisode.title}` : work.category}</span>
            </div>
            <nav className="modal-section-nav" aria-label={`${work.title} 项目导航`}>
              {hasMedia && (
                <button
                  className="flow-hit"
                  type="button"
                  onClick={() => scrollModalTo(activePreview ? videoSectionRef : officialMediaSectionRef)}
                >
                  视频
                </button>
              )}
              <button className="flow-hit" type="button" onClick={() => scrollModalTo(infoSectionRef)}>信息</button>
              {work.caseStudy && <button className="flow-hit" type="button" onClick={() => scrollModalTo(caseStudySectionRef)}>案例</button>}
              <button className="flow-hit" type="button" onClick={() => scrollModalTo(gallerySectionRef)}>画面</button>
              {!!episodes.length && (
                <button
                  ref={episodeTriggerRef}
                  className={`episode-menu-trigger flow-hit ${episodeMenuOpen ? 'is-open' : ''}`}
                  type="button"
                  aria-expanded={episodeMenuOpen}
                  aria-controls={`episode-menu-${work.id}`}
                  onClick={() => setEpisodeMenuOpen((open) => !open)}
                >
                  <span>选集</span>
                  <b>{String(episodeIndex + 1).padStart(2, '0')} / {String(episodes.length).padStart(2, '0')}</b>
                  <i aria-hidden="true">{episodeMenuOpen ? '−' : '+'}</i>
                </button>
              )}
            </nav>
          </div>

          {episodeMenuOpen && (
            <section
              id={`episode-menu-${work.id}`}
              className="episode-drawer"
              aria-label={`${work.title} 顶部分集选择`}
            >
              <div className="episode-drawer-heading">
                <div>
                  <span>EPISODE NAVIGATION</span>
                  <h3>选择要观看的分集</h3>
                </div>
                <p>{episodes.length} EPISODES</p>
              </div>
              <div className={`episode-selector ${episodes.length > 10 ? 'is-long' : ''}`}>
                {episodes.map((episode, index) => {
                  const isActive = index === episodeIndex;
                  return (
                    <StarBorder
                      as="button"
                      type="button"
                      className={`episode-tab ${isActive ? 'is-active' : ''}`}
                      color={isActive ? '#9efff8' : '#4f9d99'}
                      speed={isActive ? '3.2s' : '5.6s'}
                      thickness={isActive ? 2 : 1}
                      aria-pressed={isActive}
                      aria-label={`查看${episode.title}的 ${work.id === 'tongyoulu' ? '30' : '15'} 秒作品预览`}
                      key={`${episode.title}-${index}`}
                      onClick={() => selectEpisode(index)}
                    >
                      <img src={asset(episode.titleCard || episode.frames?.[0] || work.thumb)} alt="" loading="lazy" decoding="async" />
                      <span>EP {String(index + 1).padStart(2, '0')}</span>
                      <strong>{episode.title.replace(/^第\d+集\s*·?\s*/, '') || `第${index + 1}集`}</strong>
                    </StarBorder>
                  );
                })}
              </div>
            </section>
          )}
        </div>

        {activePreview && (
          <section ref={videoSectionRef} className="modal-video" aria-label={`${selectedEpisode?.title || work.title} 视频预览`}>
            <span className="modal-video-label">
              <strong>{previewDurationLabel}作品预览</strong>
              <em>{selectedEpisode ? `EP ${String(episodeIndex + 1).padStart(2, '0')} · ${selectedEpisode.title}` : work.title}</em>
            </span>
            {selectedEpisode && (
              <div className="episode-title-band">
                <span>EPISODE {String(episodeIndex + 1).padStart(2, '0')}</span>
                <strong>{selectedEpisodeName}</strong>
                <small>{work.id === 'tongyoulu' ? 'FINAL CUT TITLE' : 'SERIES CHAPTER'}</small>
              </div>
            )}
            <div className={`modal-video-stage flow-card ${isPlaying ? 'is-playing' : 'is-paused'}`}>
              <video
                ref={videoRef}
                key={activePreview}
                autoPlay
                muted={isMuted}
                loop
                playsInline
                preload="metadata"
                poster={asset(selectedEpisode?.frames?.[0] || coverOverrides[work.id] || work.thumb)}
                role="button"
                tabIndex="0"
                onClick={togglePlayback}
                onKeyDown={onVideoKeyDown}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                aria-label={`${isPlaying ? '暂停' : pausedPrompt}${selectedEpisode?.title || work.title} ${previewDurationLabel}作品预览`}
              >
                <source src={asset(activePreview)} type="video/mp4" />
              </video>
              <span className="modal-play-state" aria-hidden="true">
                <i>{isPlaying ? 'Ⅱ' : '▶'}</i>
                <span><strong>{isPlaying ? '点击画面暂停' : pausedPrompt}</strong><small>{isPlaying ? 'CLICK TO PAUSE' : isMuted ? 'CLICK TO PLAY' : 'CLICK FOR SOUND'}</small></span>
              </span>
              <button
                className={`modal-audio-toggle flow-hit ${isMuted ? 'is-muted' : 'is-audible'}`}
                type="button"
                aria-label={isMuted ? '开启视频声音' : '关闭视频声音'}
                aria-pressed={!isMuted}
                onClick={toggleAudio}
              >
                <VolumeIcon muted={isMuted} />
                <span><strong>{isMuted ? '开启声音' : '声音已开启'}</strong><small>{isMuted ? 'SOUND OFF' : 'SOUND ON'}</small></span>
              </button>
            </div>
            {selectedEpisode && (
              <div className="episode-story-copy" aria-label={`${selectedEpisode.title} 剧情简介`}>
                <span>THIS EPISODE / 本集故事</span>
                <blockquote>“{selectedEpisode.slogan}”</blockquote>
                <p>{selectedEpisode.synopsis}</p>
              </div>
            )}
          </section>
        )}

        {!!officialMedia.length && (
          <section ref={officialMediaSectionRef} className="official-media" aria-label={`${work.title} 平台播出视频`}>
            <div className="official-media-heading">
              <div>
                <span>ONLINE SCREENING / SOHU + LETV</span>
                <h3>搜狐与乐视播出内容</h3>
              </div>
              <p>点击卡片前往原平台播放<br />乐视完整剧集 · 搜狐精选公开片段</p>
            </div>
            <div className="official-media-grid">
              {officialMedia.map((media, index) => (
                <StarBorder
                  as="a"
                  className="official-media-card"
                  color={index < 2 ? '#9efff8' : '#4ff5e9'}
                  speed={index < 2 ? '4.2s' : '6s'}
                  thickness={1}
                  href={media.url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`前往${media.platform}观看${media.title}`}
                  key={media.url}
                >
                  <span className="official-media-visual">
                    <img src={asset(media.cover)} alt={`${work.title} ${media.title}剧照`} loading="lazy" decoding="async" />
                    <i>{media.platform}</i>
                    <b>{media.duration}</b>
                  </span>
                  <span className="official-media-copy">
                    <small>{media.code}</small>
                    <strong>{media.title}</strong>
                    <em>前往平台观看 <ArrowIcon /></em>
                  </span>
                </StarBorder>
              ))}
            </div>
            <div className="official-media-footnote">
              <a className="flow-hit" href="https://www.le.com/playlet/10080230.html" target="_blank" rel="noreferrer">乐视 12 集全集页</a>
              <a className="flow-hit" href="https://my.tv.sohu.com/pl/9985930/index.shtml" target="_blank" rel="noreferrer">搜狐 12 条片段合集</a>
              <span>平台版权与播放规则以搜狐、乐视页面为准</span>
            </div>
          </section>
        )}

        <header ref={infoSectionRef} className={`modal-project-header ${hasMedia ? 'is-after-video' : 'is-gallery-first'}`}>
          <span>{work.category} / {work.year || '2026'}</span>
          <h2>{work.title}</h2>
          <blockquote className="project-slogan">“{work.slogan}”</blockquote>
          <p>{work.desc || work.sub}</p>
          <div className="modal-credit-row">
            <span><small>ROLE</small><strong>{work.role || '导演 / 编剧'}</strong></span>
            {!!episodes.length && <span><small>SERIES</small><strong>{episodes.length} 集 · 每集独立画面档案</strong></span>}
          </div>
        </header>

        {work.caseStudy && (
          <section ref={caseStudySectionRef} className="case-study" aria-label={`${work.title} 案例研究`}>
            <div className="case-study-heading">
              <span>CASE STUDY / VERIFIED FACTS</span>
              <h3>从项目目标到可核验成果</h3>
            </div>
            <div className="case-study-grid">
              {[
                ['01', 'PROJECT GOAL', '项目目标 / 挑战', work.caseStudy.goal],
                ['02', 'MY ROLE', '我的职责', work.caseStudy.role],
                ['03', 'APPROACH', '创作 / 执行方法', work.caseStudy.method],
                ['04', 'OUTCOME', '可核验成果', work.caseStudy.result],
              ].map(([no, label, title, text]) => (
                <article className="case-study-card flow-card" key={`${label}-${title}`}>
                  <small><i>{no}</i>{label}</small>
                  <h4>{title}</h4>
                  <p>{text}</p>
                </article>
              ))}
            </div>
          </section>
        )}

        <div ref={gallerySectionRef} className="modal-gallery-heading">
          <span>{selectedEpisode ? `${selectedEpisode.title} / STILLS` : 'PROJECT GALLERY'}</span>
          <p>{gallery.length} 个画面</p>
        </div>
        <div className={`modal-gallery ${gallery.length === 9 ? 'is-nine' : ''}`}>
          {gallery.map((image, index) => (
            <figure key={image} className={index === 0 ? 'is-cover' : ''}>
              <img
                src={asset(image)}
                alt={`${work.title}${selectedEpisode ? ` ${selectedEpisode.title}` : ''} 项目画面 ${index + 1}`}
                loading="lazy"
                decoding="async"
              />
              <figcaption>{selectedEpisode ? `EP${String(episodeIndex + 1).padStart(2, '0')} / ` : ''}{String(index + 1).padStart(2, '0')}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const appRef = useRef(null);
  const works = (rawData.works || []).map((work) => {
    const episodes = (work.episodes || []).map((episode, index) => ({
      ...episode,
      ...episodeStoryData[work.id]?.[index],
      preview: previewData.episodes?.[work.id]?.[`ep${String(index + 1).padStart(2, '0')}`] || episode.preview,
    }));
    let enriched = {
      ...work,
      ...projectProfiles[work.id],
      slogan: projectSlogans[work.id] || '让作品自己留下被记住的理由。',
      preview: previewData.works?.[work.id] || work.preview,
      ...(episodes.length ? { episodes } : {}),
    };
    if (work.id.startsWith('hongguo_')) {
      enriched = { ...enriched, category: '商业现场', role: '艺人助理 / 现场协作' };
    }
    if (work.id === 'tongyoulu') {
      enriched = {
        ...enriched,
        episodes: (enriched.episodes || []).map((episode, index) => ({
          ...episode,
          title: tongyouEpisodeTitles[index] || episode.title,
          titleCard: `assets/frames/tongyoulu/titlecards/ep${String(index + 1).padStart(2, '0')}.jpg`,
        })),
      };
    }
    return enriched;
  });
  const [selectedWork, setSelectedWork] = useState(null);
  const modalOpenerRef = useRef(null);
  const openWork = (work) => {
    modalOpenerRef.current = document.activeElement;
    setSelectedWork(work);
  };
  const [showreelOpen, setShowreelOpen] = useState(false);
  const showreelOpenerRef = useRef(null);
  const openShowreel = () => {
    showreelOpenerRef.current = document.activeElement;
    setShowreelOpen(true);
  };
  const [selectedScript, setSelectedScript] = useState(null);
  const scriptOpenerRef = useRef(null);
  const openScript = (script) => {
    scriptOpenerRef.current = document.activeElement;
    setSelectedScript(script);
  };


  return (
    <div className="app" ref={appRef}>
      <PortfolioMotion scopeRef={appRef} />
      <AmbientField />
      <FlowVisibility />
      <Navigation />
      <main>
        <Hero onPlayShowreel={openShowreel} showreelOpen={showreelOpen} />
        <PortfolioStage paused={showreelOpen || Boolean(selectedWork) || Boolean(selectedScript)}>
          <Works works={works} onSelect={openWork} />
          <Writing onSelectScript={openScript} />
          <Commercial works={works} onSelect={openWork} />
          <About />
          <Experience />
          <Strengths />
          <Contact />
        </PortfolioStage>
      </main>
      {showreelOpen && (
        <ShowreelModal
          returnFocus={showreelOpenerRef.current}
          onClose={() => setShowreelOpen(false)}
        />
      )}
      {selectedWork && (
        <ProjectModal
          key={selectedWork.id}
          work={selectedWork}
          returnFocus={modalOpenerRef.current}
          onClose={() => setSelectedWork(null)}
        />
      )}
      {selectedScript && (
        <ScriptModal
          key={selectedScript.id}
          script={selectedScript}
          returnFocus={scriptOpenerRef.current}
          onClose={() => setSelectedScript(null)}
        />
      )}
    </div>
  );
}
