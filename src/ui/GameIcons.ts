// Commercial-grade Game Icons (Zero Emojis, pure vector game icons styled for Three Kingdoms DBG)

export class GameIcons {
  // 0. 大汉龙纹金印 (Dragon Imperial Seal / Brand Crest)
  public static readonly DRAGON_SEAL = `
    <svg viewBox="0 0 32 32" width="24" height="24" class="game-ico ico-seal">
      <defs>
        <linearGradient id="seal_grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ffd700"/>
          <stop offset="50%" stop-color="#d4af37"/>
          <stop offset="100%" stop-color="#996515"/>
        </linearGradient>
      </defs>
      <rect x="3" y="3" width="26" height="26" rx="4" fill="url(#seal_grad)" stroke="#fff" stroke-width="1.2"/>
      <rect x="6" y="6" width="20" height="20" rx="2" fill="#8b1e28" stroke="#d4af37" stroke-width="1.2"/>
      <path d="M10 11 L22 11 M16 11 L16 21 M11 16 L21 16 M12 21 L20 21" stroke="#ffd700" stroke-width="1.8" stroke-linecap="round"/>
    </svg>
  `;

  // 1. 五铢方孔铜钱 (Ancient Bronze Coin with Square Hole)
  public static readonly COIN = `
    <svg viewBox="0 0 32 32" width="20" height="20" class="game-ico ico-coin">
      <circle cx="16" cy="16" r="14" fill="#c69214" stroke="#785507" stroke-width="2"/>
      <circle cx="16" cy="16" r="12" fill="none" stroke="#f5d061" stroke-width="1.2"/>
      <rect x="11.5" y="11.5" width="9" height="9" fill="#1e1808" stroke="#785507" stroke-width="1.5"/>
      <line x1="8" y1="16" x2="10" y2="16" stroke="#f5d061" stroke-width="1.2"/>
      <line x1="22" y1="16" x2="24" y2="16" stroke="#f5d061" stroke-width="1.2"/>
      <line x1="16" y1="8" x2="16" y2="10" stroke="#f5d061" stroke-width="1.2"/>
      <line x1="16" y1="22" x2="16" y2="24" stroke="#f5d061" stroke-width="1.2"/>
    </svg>
  `;

  // 2. 气血灵玉 / 生命玉璧 (HP Heart / Jade Health Emblem)
  public static readonly HP_HEART = `
    <svg viewBox="0 0 32 32" width="20" height="20" class="game-ico ico-hp">
      <defs>
        <linearGradient id="hp_grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#ff4d4f"/>
          <stop offset="100%" stop-color="#991b1b"/>
        </linearGradient>
      </defs>
      <path d="M16 29 C4 20 2 12 6 6 C10 1 15 3 16 7 C17 3 22 1 26 6 C30 12 28 20 16 29 Z" 
            fill="url(#hp_grad)" stroke="#fecaca" stroke-width="1.5" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.5))"/>
      <path d="M9 7 C7 11 9 16 12 18" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" fill="none" opacity="0.6"/>
    </svg>
  `;

  // 3. 锦绣战图 / 战役卷轴 (Campaign Map Scroll)
  public static readonly MAP_SCROLL = `
    <svg viewBox="0 0 32 32" width="20" height="20" class="game-ico ico-map">
      <path d="M6 8 L12 5 L20 8 L26 5 L26 23 L20 26 L12 23 L6 26 Z" fill="#d4af37" stroke="#5c4308" stroke-width="1.5"/>
      <path d="M12 5 L12 23" stroke="#5c4308" stroke-width="1.5"/>
      <path d="M20 8 L20 26" stroke="#5c4308" stroke-width="1.5"/>
      <circle cx="16" cy="14" r="2.5" fill="#c02c38"/>
      <path d="M14 16 Q16 19 18 16" stroke="#78350f" stroke-width="1.2" fill="none"/>
    </svg>
  `;

  // 4. 抽牌堆 (Draw Pile - Stack of War Cards)
  public static readonly DRAW_PILE = `
    <svg viewBox="0 0 32 32" width="20" height="20" class="game-ico ico-deck">
      <rect x="5" y="11" width="16" height="18" rx="2" fill="#1e2430" stroke="#475569" stroke-width="1.5"/>
      <rect x="8" y="8" width="16" height="18" rx="2" fill="#2d3748" stroke="#64748b" stroke-width="1.5"/>
      <rect x="11" y="5" width="16" height="18" rx="2" fill="#3b82f6" stroke="#93c5fd" stroke-width="1.5"/>
      <line x1="15" y1="11" x2="23" y2="11" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round"/>
      <circle cx="19" cy="16" r="3" fill="#ffffff" opacity="0.8"/>
    </svg>
  `;

  // 5. 弃牌堆 (Discard Pile)
  public static readonly DISCARD_PILE = `
    <svg viewBox="0 0 32 32" width="20" height="20" class="game-ico ico-discard">
      <rect x="6" y="8" width="16" height="18" rx="2" transform="rotate(-12 14 17)" fill="#1f2937" stroke="#4b5563" stroke-width="1.5"/>
      <rect x="10" y="8" width="16" height="18" rx="2" transform="rotate(10 18 17)" fill="#374151" stroke="#6b7280" stroke-width="1.5"/>
      <path d="M15 12 L21 18 M21 12 L15 18" stroke="#ef4444" stroke-width="2" stroke-linecap="round"/>
    </svg>
  `;

  // 6. 消耗堆 (Exhaust Pile / Ash Urn)
  public static readonly EXHAUST_PILE = `
    <svg viewBox="0 0 32 32" width="20" height="20" class="game-ico ico-exhaust">
      <path d="M8 25 Q16 28 24 25 L22 14 Q16 12 10 14 Z" fill="#27272a" stroke="#71717a" stroke-width="1.5"/>
      <path d="M12 13 Q16 5 20 13" stroke="#a1a1aa" stroke-width="1.5" fill="none"/>
      <circle cx="16" cy="8" r="1.5" fill="#f43f5e"/>
      <path d="M13 20 Q16 16 19 20" stroke="#f43f5e" stroke-width="1.5" fill="none"/>
    </svg>
  `;

  // 7. 武技攻击标志 (Attack Swords Icon)
  public static readonly SWORD_ATTACK = `
    <svg viewBox="0 0 32 32" width="20" height="20" class="game-ico ico-attack">
      <path d="M6 26 L12 20 M8 24 L10 26 M10 18 L26 6 L22 2 L14 14 Z" fill="#ef4444" stroke="#b91c1c" stroke-width="1.5"/>
      <line x1="22" y1="2" x2="26" y2="6" stroke="#fecaca" stroke-width="2"/>
    </svg>
  `;

  // 8. 韬略技能标志 (Skill Strategy Scroll)
  public static readonly SCROLL_SKILL = `
    <svg viewBox="0 0 32 32" width="20" height="20" class="game-ico ico-skill">
      <path d="M8 6 C5 6 5 10 8 10 L24 10 C27 10 27 6 24 6 Z" fill="#38bdf8" stroke="#0284c7" stroke-width="1.5"/>
      <rect x="8" y="10" width="16" height="14" fill="#0369a1" stroke="#0284c7" stroke-width="1.2"/>
      <path d="M8 24 C5 24 5 28 8 28 L24 28 C27 28 27 24 24 24 Z" fill="#38bdf8" stroke="#0284c7" stroke-width="1.5"/>
      <line x1="12" y1="14" x2="20" y2="14" stroke="#bae6fd" stroke-width="1.5"/>
      <line x1="12" y1="18" x2="18" y2="18" stroke="#bae6fd" stroke-width="1.5"/>
    </svg>
  `;

  // 9. 兵法能力标志 (Power Banner / Tiger Tally)
  public static readonly POWER_TALLY = `
    <svg viewBox="0 0 32 32" width="20" height="20" class="game-ico ico-power">
      <path d="M7 6 L25 6 L21 16 L25 26 L7 26 Z" fill="#d97706" stroke="#f59e0b" stroke-width="1.5"/>
      <line x1="7" y1="4" x2="7" y2="28" stroke="#ffd700" stroke-width="3" stroke-linecap="round"/>
      <circle cx="14" cy="16" r="3" fill="#ffffff" opacity="0.9"/>
    </svg>
  `;

  // 10. 格挡金盾 (Shield / Barrier)
  public static readonly SHIELD = `
    <svg viewBox="0 0 32 32" width="20" height="20" class="game-ico ico-shield">
      <path d="M16 3 L27 7 V16 C27 23 16 29 16 29 C16 29 5 23 5 16 V7 Z" fill="#2563eb" stroke="#93c5fd" stroke-width="2"/>
      <path d="M16 6 L24 9 V15 C24 20 16 25 16 25 C16 25 8 20 8 15 V9 Z" fill="#1d4ed8" stroke="#60a5fa" stroke-width="1"/>
      <circle cx="16" cy="15" r="3" fill="#ffffff" opacity="0.75"/>
    </svg>
  `;

  // 11. 兵符徽章 (Relic Seal / Talisman)
  public static readonly RELIC_SEAL = `
    <svg viewBox="0 0 32 32" width="18" height="18" class="game-ico ico-relic">
      <polygon points="16,3 28,10 28,22 16,29 4,22 4,10" fill="#78350f" stroke="#fbbf24" stroke-width="1.8"/>
      <circle cx="16" cy="16" r="5" fill="#f59e0b" stroke="#fef3c7" stroke-width="1.2"/>
    </svg>
  `;

  // 12. 锁定准星 (Target Crosshair)
  public static readonly TARGET_CROSSHAIR = `
    <svg viewBox="0 0 24 24" width="16" height="16" class="game-ico ico-crosshair">
      <circle cx="12" cy="12" r="8" fill="none" stroke="#ef4444" stroke-width="2"/>
      <line x1="12" y1="2" x2="12" y2="7" stroke="#ef4444" stroke-width="2"/>
      <line x1="12" y1="17" x2="12" y2="22" stroke="#ef4444" stroke-width="2"/>
      <line x1="2" y1="12" x2="7" y2="12" stroke="#ef4444" stroke-width="2"/>
      <line x1="17" y1="12" x2="22" y2="12" stroke="#ef4444" stroke-width="2"/>
      <circle cx="12" cy="12" r="2" fill="#ef4444"/>
    </svg>
  `;

  // 13. 诸葛亮天机元素 (Elemental Orbs)
  public static readonly ELEMENT_FIRE = `
    <svg viewBox="0 0 24 24" width="22" height="22">
      <path d="M12 2 C12 2 16 7 16 11 C16 15 13 18 12 18 C11 18 8 15 8 11 C8 7 12 2 12 2 Z" fill="#ef4444"/>
      <path d="M12 7 C12 7 14 10 14 12 C14 14 13 16 12 16 C11 16 10 14 10 12 C10 10 12 7 12 7 Z" fill="#fbbf24"/>
    </svg>
  `;

  public static readonly ELEMENT_MIST = `
    <svg viewBox="0 0 24 24" width="22" height="22">
      <path d="M4 14 C4 11 7 10 9 10 C10 7 14 7 15 9 C18 9 20 11 20 14 C20 17 18 18 16 18 L7 18 C4 18 4 14 4 14 Z" fill="#10b981" opacity="0.9"/>
      <path d="M6 15 L18 15" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round"/>
    </svg>
  `;

  public static readonly ELEMENT_THUNDER = `
    <svg viewBox="0 0 24 24" width="22" height="22">
      <polygon points="13,2 4,13 11,13 9,22 20,9 13,9" fill="#38bdf8" stroke="#bae6fd" stroke-width="1.5"/>
    </svg>
  `;

  public static readonly ELEMENT_WIND = `
    <svg viewBox="0 0 24 24" width="22" height="22">
      <path d="M3 10 Q12 10 14 7 A3 3 0 0 0 11 4" stroke="#c084fc" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <path d="M2 14 Q15 14 17 17 A3 3 0 0 0 14 20" stroke="#c084fc" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <path d="M5 18 H12" stroke="#e9d5ff" stroke-width="2" stroke-linecap="round"/>
    </svg>
  `;

  // 14. 战役地图节点图标 (Procedural DAG Map Node Badges)
  public static readonly NODE_ENEMY = `
    <svg viewBox="0 0 24 24" width="24" height="24" class="node-ico">
      <path d="M4 20 L9 15 M19 5 L8 16 L5 13 L16 2 Z" fill="#ef4444" stroke="#991b1b" stroke-width="1.5"/>
      <path d="M20 20 L15 15 M5 5 L16 16 L19 13 L8 2 Z" fill="#ef4444" stroke="#991b1b" stroke-width="1.5"/>
    </svg>
  `;

  public static readonly NODE_ELITE = `
    <svg viewBox="0 0 24 24" width="26" height="26" class="node-ico">
      <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" fill="#dc2626" stroke="#fbbf24" stroke-width="1.5"/>
      <circle cx="12" cy="12" r="3" fill="#ffffff"/>
    </svg>
  `;

  public static readonly NODE_REST = `
    <svg viewBox="0 0 24 24" width="24" height="24" class="node-ico">
      <path d="M3 20 L12 4 L21 20 Z" fill="#059669" stroke="#34d399" stroke-width="1.5"/>
      <path d="M9 20 L12 13 L15 20 Z" fill="#022c22"/>
    </svg>
  `;

  public static readonly NODE_SHOP = `
    <svg viewBox="0 0 24 24" width="24" height="24" class="node-ico">
      <rect x="4" y="9" width="16" height="12" rx="2" fill="#d97706" stroke="#fcd34d" stroke-width="1.5"/>
      <path d="M4 9 L12 3 L20 9 Z" fill="#b45309" stroke="#fcd34d" stroke-width="1.5"/>
      <circle cx="12" cy="15" r="2.5" fill="#fcd34d"/>
    </svg>
  `;

  public static readonly NODE_EVENT = `
    <svg viewBox="0 0 24 24" width="24" height="24" class="node-ico">
      <circle cx="12" cy="12" r="10" fill="#4f46e5" stroke="#a5b4fc" stroke-width="1.5"/>
      <circle cx="12" cy="17" r="1.5" fill="#ffffff"/>
      <path d="M9 9 C9 7 15 7 15 9 C15 11 12 11 12 13.5" stroke="#ffffff" stroke-width="2" stroke-linecap="round" fill="none"/>
    </svg>
  `;

  public static readonly NODE_TREASURE = `
    <svg viewBox="0 0 24 24" width="24" height="24" class="node-ico">
      <rect x="3" y="10" width="18" height="11" rx="2" fill="#78350f" stroke="#fbbf24" stroke-width="1.5"/>
      <path d="M3 10 C3 7 7 5 12 5 C17 5 21 7 21 10 Z" fill="#92400e" stroke="#fbbf24" stroke-width="1.5"/>
      <rect x="10" y="11" width="4" height="5" rx="1" fill="#fbbf24"/>
    </svg>
  `;

  public static readonly NODE_BOSS = `
    <svg viewBox="0 0 24 24" width="28" height="28" class="node-ico">
      <path d="M4 18 L6 7 L10 11 L12 4 L14 11 L18 7 L20 18 Z" fill="#991b1b" stroke="#ffd700" stroke-width="1.8"/>
      <circle cx="12" cy="14" r="2.5" fill="#ffd700"/>
    </svg>
  `;

  // 15. 营地休憩选项图标 (Camp Rest Options)
  public static readonly REST_HEAL = `
    <svg viewBox="0 0 32 32" width="28" height="28">
      <path d="M16 4 C16 4 19 8 19 12 C19 16 16 18 16 18 C16 18 13 16 13 12 C13 8 16 4 16 4 Z" fill="#10b981"/>
      <path d="M8 16 C8 12 12 12 16 16 C20 12 24 12 24 16 C24 22 18 26 16 28 C14 26 8 22 8 16 Z" fill="#059669" stroke="#34d399" stroke-width="1.5"/>
      <path d="M16 19 L16 25 M13 22 L19 22" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/>
    </svg>
  `;

  public static readonly REST_FORGE = `
    <svg viewBox="0 0 32 32" width="28" height="28">
      <polygon points="6,26 26,26 24,19 8,19" fill="#374151" stroke="#9ca3af" stroke-width="1.5"/>
      <path d="M12 18 L18 8 L22 10 L16 20 Z" fill="#ef4444" stroke="#fca5a5" stroke-width="1.5"/>
      <path d="M10 12 Q14 6 16 12 Q18 7 20 12" stroke="#f59e0b" stroke-width="2" fill="none"/>
    </svg>
  `;

  // 16. 祈愿赏赐图标 (Blessings)
  public static readonly BLESSING_GOLD = `
    <svg viewBox="0 0 24 24" width="20" height="20" class="game-ico">
      <ellipse cx="12" cy="15" rx="8" ry="4" fill="#c69214" stroke="#785507" stroke-width="1.2"/>
      <ellipse cx="12" cy="11" rx="8" ry="4" fill="#eab308" stroke="#785507" stroke-width="1.2"/>
      <ellipse cx="12" cy="7" rx="8" ry="4" fill="#facc15" stroke="#785507" stroke-width="1.2"/>
    </svg>
  `;

  public static readonly BLESSING_HORSE = `
    <svg viewBox="0 0 24 24" width="20" height="20" class="game-ico">
      <path d="M4 19 C6 17 8 16 11 16 L12 11 L9 7 C9 7 12 5 15 7 C18 9 17 12 17 13 L19 16 C20 17 21 19 21 21 L3 21 Z" fill="#dc2626" stroke="#ffd700" stroke-width="1.5"/>
    </svg>
  `;

  // 17. 敌方意图矢量图标 (Intent Icons)
  public static getIntentIconSvg(type: string): string {
    switch (type) {
      case 'ATTACK':
        return `
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path d="M4 20 L8 16 M19 5 L7 17 L5 15 L17 3 Z" fill="#ef4444" stroke="#b91c1c" stroke-width="1.5"/>
          </svg>
        `;
      case 'MULTI_ATTACK':
        return `
          <svg viewBox="0 0 24 24" width="22" height="22">
            <path d="M3 19 L7 15 M18 4 L8 14 L6 12 L16 2 Z" fill="#ef4444" stroke="#b91c1c" stroke-width="1.2"/>
            <path d="M19 19 L15 15 M4 4 L14 14 L16 12 L6 2 Z" fill="#ef4444" stroke="#b91c1c" stroke-width="1.2"/>
          </svg>
        `;
      case 'DEFEND':
        return `
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path d="M12 2 L20 5 V12 C20 17 12 22 12 22 C12 22 4 17 4 12 V5 Z" fill="#3b82f6" stroke="#93c5fd" stroke-width="1.5"/>
          </svg>
        `;
      case 'BUFF':
        return `
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path d="M12 3 L18 10 H14 V21 H10 V10 H6 Z" fill="#eab308" stroke="#ca8a04" stroke-width="1.5"/>
          </svg>
        `;
      case 'CHARGE':
        return `
          <svg viewBox="0 0 24 24" width="20" height="20">
            <polygon points="13,2 4,14 12,14 11,22 20,10 12,10" fill="#06b6d4" stroke="#22d3ee" stroke-width="1.5"/>
          </svg>
        `;
      case 'ATTACK_DEBUFF':
        return `
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path d="M12 2 Q18 6 15 13 Q20 15 17 21 Q12 18 11 21 Q7 17 9 12 Q4 10 12 2 Z" fill="#f97316" stroke="#ea580c" stroke-width="1.5"/>
          </svg>
        `;
      case 'DEBUFF':
        return `
          <svg viewBox="0 0 24 24" width="20" height="20">
            <circle cx="12" cy="11" r="7" fill="#7c3aed" stroke="#c4b5fd" stroke-width="1.5"/>
            <circle cx="9.5" cy="10" r="1.5" fill="#000"/>
            <circle cx="14.5" cy="10" r="1.5" fill="#000"/>
            <path d="M10 15 H14" stroke="#000" stroke-width="1.5"/>
          </svg>
        `;
      default:
        return `
          <svg viewBox="0 0 24 24" width="20" height="20">
            <circle cx="12" cy="12" r="9" fill="#64748b" stroke="#cbd5e1" stroke-width="1.5"/>
            <circle cx="12" cy="16" r="1.5" fill="#ffffff"/>
            <path d="M10 9 C10 7.5 14 7.5 14 9 C14 11 12 11 12 13" stroke="#ffffff" stroke-width="1.5" fill="none"/>
          </svg>
        `;
    }
  }

  // 18. 地图节点 SVG 辅助方法
  public static getMapNodeSvg(type: string): string {
    switch (type) {
      case 'COMBAT':
        return this.NODE_ENEMY;
      case 'ELITE':
        return this.NODE_ELITE;
      case 'REST':
        return this.NODE_REST;
      case 'SHOP':
        return this.NODE_SHOP;
      case 'EVENT':
        return this.NODE_EVENT;
      case 'TREASURE':
        return this.NODE_TREASURE;
      case 'BOSS':
        return this.NODE_BOSS;
      default:
        return this.NODE_ENEMY;
    }
  }
}
