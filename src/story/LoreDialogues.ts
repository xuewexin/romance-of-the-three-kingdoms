import { DialogueLine } from '../types.ts';

export const ACT_LORE: Record<number, { title: string; subtitle: string; introText: string; environmentVisual: string }> = {
  1: {
    title: '第一幕：黄巾妖氛',
    subtitle: '巨鹿原野 · 符水与雷霆之夜',
    introText:
      '光和七年，天下大疫。天公将军张角以符水散疫，聚众三十六方号为“黄巾”。然而符水之中暗藏上古魔煞，中符者神智沦丧，化为不死尸兵。巨鹿原野上，妖氛遮日，雷霆翻滚。',
    environmentVisual: '阴沉的黄昏天空、被雷火点燃的麦田、插着黄巾符旗的破败箭楼'
  },
  2: {
    title: '第二幕：虎牢凶关',
    subtitle: '汜水关至虎牢关 · 焚城的血色烽烟',
    introText:
      '魔障蔓延，董卓进京焚烧洛阳二百里。西凉铁骑裹挟煞气驻守虎牢雄关，魔将吕布手持方天画戟，以一己之力镇压诸侯联军。关下堆积如山的重甲残骸，夜夜传来战马的悲鸣。',
    environmentVisual: '高耸险峻的黑色城关、赤红色的烈火硝烟、折断的巨型投石车'
  },
  3: {
    title: '第三幕：赤壁业火',
    subtitle: '长江赤壁 · 锁链与焚天冥河',
    introText:
      '建安十三年冬，八十三万曹军沿江而下。铁锁连环结成水上魔城，长江化作翻滚血浪与幽冥鬼火的冥河。唯有借得天机东风，以烈火焚尽锁链魔阵，方能破此绝境。',
    environmentVisual: '滚滚波涛的黑色长江、被烈焰焚烧的连环战船、狂风中飞扬的火雨'
  },
  4: {
    title: '第四幕：建安魔障·破局',
    subtitle: '九鼎残墟 · 命运与岁月的尽头',
    introText:
      '九鼎崩解，天命失序。古今名将之执念汇聚于此，凝为【建安天命之灵】。斩断此核心，方能终结煞气轮回，重还九州清明！',
    environmentVisual: '破碎的时空祭坛、悬浮的九鼎古器、倒流的岁月长河'
  }
};

export const PROLOGUE_DIALOGUE: DialogueLine[] = [
  {
    speaker: '南华仙书',
    avatar: '仙',
    text: '“破局者……你终于在煞气的沉沦中苏醒了。”',
    color: '#d4af37'
  },
  {
    speaker: '南华仙书',
    avatar: '仙',
    text: '“熹平年间九鼎崩毁，九州沉沦入永恒的死局轮回。名将化煞，苍生皆苦。”',
    color: '#d4af37'
  },
  {
    speaker: '南华仙书',
    avatar: '仙',
    text: '“手握军令，持三尺青锋，踏破这四幕魔障吧！在启程之前，受老夫一记仙书赐福——”',
    color: '#d4af37'
  }
];

export const BOSS_DIALOGUES: Record<string, { preBattle: DialogueLine[]; postVictory: DialogueLine[] }> = {
  boss_zhang_jiao: {
    preBattle: [
      {
        speaker: '张角',
        avatar: '雷',
        text: '“苍天已死，黄天当立！顺天者昌，逆天者……皆化作齑粉！”',
        color: '#ffd700'
      }
    ],
    postVictory: [
      {
        speaker: '张角',
        avatar: '雷',
        text: '“雷霆……竟劈不断这煞气宿命么……贫道愧对万千教众……”',
        color: '#8c8c8c'
      }
    ]
  },
  boss_lv_bu: {
    preBattle: [
      {
        speaker: '吕布',
        avatar: '戟',
        text: '“鼠辈！纵有关张在此，何人敢撄我方天画戟之锋芒！”',
        color: '#ff4d4f'
      }
    ],
    postVictory: [
      {
        speaker: '吕布',
        avatar: '戟',
        text: '“天下无双……天下无双又如何……赤兔，随我去矣……”',
        color: '#8c8c8c'
      }
    ]
  },
  boss_cao_cao: {
    preBattle: [
      {
        speaker: '曹操',
        avatar: '魏',
        text: '“对酒当歌，人生几何！既入赤壁冥河，便教你见识孤之霸业！”',
        color: '#722ed1'
      }
    ],
    postVictory: [
      {
        speaker: '曹操',
        avatar: '魏',
        text: '“周公吐哺，天下归心……孤之天下，终究成空么……”',
        color: '#8c8c8c'
      }
    ]
  },
  boss_destiny_spirit: {
    preBattle: [
      {
        speaker: '建安天命之灵',
        avatar: '鼎',
        text: '“凡人之躯，妄图逆转岁月长河？此地乃万世死局，受天命制裁吧！”',
        color: '#faad14'
      }
    ],
    postVictory: [
      {
        speaker: '建安天命之灵',
        avatar: '鼎',
        text: '“九鼎复位……魔障破除……九州山河，终于迎来了明日的曙光……”',
        color: '#52c41a'
      }
    ]
  }
};
