export type CharacterId = 'GUAN_YU' | 'ZHUGE_LIANG' | 'GAN_NING';

export type CardRarity = 'COMMON' | 'UNCOMMON' | 'RARE' | 'CURSE' | 'STATUS';
export type CardType = 'ATTACK' | 'SKILL' | 'POWER';
export type TargetType = 'SINGLE_ENEMY' | 'ALL_ENEMIES' | 'SELF' | 'NONE';

export interface CardActionDef {
  type: string;
  value?: number;
  value_ref?: string;
  hits?: number;
  buff_id?: string;
  stacks?: number;
  target?: 'TARGET' | 'SELF' | 'ALL_ENEMIES' | 'RANDOM_ENEMY';
  card_id?: string;
  count?: number;
  count_ref?: string;
  stat?: string;
  req_tag?: string;
  on_fatal_actions?: CardActionDef[];
}

export interface CardData {
  id: string;
  name: string;
  character: CharacterId | 'NEUTRAL';
  rarity: CardRarity;
  type: CardType;
  cost: number;
  target: TargetType;
  exhaust?: boolean;
  retain?: boolean;
  tags?: string[];
  description: string;
  base_stats: Record<string, number>;
  upgraded_stats?: Record<string, number>;
  actions: CardActionDef[];
  combo_require?: string;
  provides_tag?: string;
  upgraded?: boolean;
}

export type BuffId =
  | 'STRENGTH'        // 武力
  | 'DEXTERITY'       // 守备
  | 'FOCUS'           // 运筹 (诸葛亮)
  | 'BLADE_STANCE'    // 刀势 (关羽)
  | 'VULNERABLE'      // 破绽
  | 'WEAK'            // 怯战
  | 'FRAIL'           // 断粮
  | 'THORNS'          // 刚烈 (反伤)
  | 'OIL_BURN'        // 火油 (甘宁)
  | 'BARRICADE'       // 铁桶军阵 (格挡不清除)
  | 'KONG_CHENG'      // 空城计 (手牌为空时减伤50%)
  | 'BLOOD_RAGE'      // 死战不退 (受创获得武力)
  | 'DART_BOOST'      // 百步穿杨 (袖箭伤害增加)
  | 'THUNDER_CHARGE'  // 蓄雷 (张角等)
  | 'POISON'          // 蛊毒
  | 'METALLIC'        // 金属化
  | 'INTANGIBLE';     // 虚化

export interface BuffInstance {
  id: BuffId | string;
  name: string;
  stacks: number;
  icon: string;
  description: string;
  isDebuff?: boolean;
}

export type OrbType = 'FIRE' | 'MIST' | 'THUNDER' | 'WIND';

export interface OrbInstance {
  type: OrbType;
  name: string;
  passiveValue: number;
  evokeValue: number;
  description: string;
}

export interface EnemyIntent {
  type: 'ATTACK' | 'MULTI_ATTACK' | 'DEFEND' | 'BUFF' | 'DEBUFF' | 'ATTACK_DEBUFF' | 'UNKNOWN' | 'CHARGE';
  damage?: number;
  hits?: number;
  block?: number;
  buffId?: string;
  description: string;
}

export interface EnemyMoveDef {
  intent_type: string;
  base_damage?: number;
  hits?: number;
  block?: number;
  max_consecutive?: number;
  description?: string;
  actions: CardActionDef[];
}

export interface EnemyDef {
  enemy_id: string;
  name: string;
  title?: string;
  max_hp_range: number[];
  portraitSvg?: string;
  moves: Record<string, EnemyMoveDef>;
  ai_pattern: {
    turn_1?: string;
    conditional?: Array<{
      if_self_has_buff?: string;
      if_hp_below_pct?: number;
      force_move: string;
    }>;
    default_weights: Record<string, number>;
  };
}

export interface RelicDef {
  id: string;
  name: string;
  rarity: 'STARTER' | 'COMMON' | 'UNCOMMON' | 'RARE' | 'BOSS';
  character?: CharacterId;
  description: string;
  flavor: string;
  counter?: number;
}

export type MapNodeType = 'BATTLE' | 'ELITE' | 'REST' | 'SHOP' | 'EVENT' | 'TREASURE' | 'BOSS';

export interface MapNode {
  id: string;
  floor: number;
  col: number;
  type: MapNodeType;
  children: string[];
  parents: string[];
  visited?: boolean;
  available?: boolean;
}

export interface DialogueLine {
  speaker: string;
  avatar?: string;
  text: string;
  color?: string;
}
