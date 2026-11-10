// Character visual rendering with real multi-action pose sprite packs and SVG vector fallbacks
// Styled as authentic 2D living Three Kingdoms animated warriors (待机、攻击、防御、暴击、大招、战胜、失败)

export interface ActionPack {
  idle: string;
  attack: string;
  defend: string;
  crit: string;
  ultimate: string;
  defeat: string;
  victory: string;
}

export class SvgCharacters {
  public static getUnitActionPack(id: string): ActionPack {
    const packs: Record<string, ActionPack> = {
      GUAN_YU: {
        idle: '/assets/characters/guanyu/idle.png',
        attack: '/assets/characters/guanyu/attack.png',
        defend: '/assets/characters/guanyu/defend.png',
        crit: '/assets/characters/guanyu/crit.png',
        ultimate: '/assets/characters/guanyu/ultimate.png',
        defeat: '/assets/characters/guanyu/defeat.png',
        victory: '/assets/characters/guanyu/victory.png'
      },
      ZHUGE_LIANG: {
        idle: '/assets/characters/zhugeliang/idle.png',
        attack: '/assets/characters/zhugeliang/attack.png',
        defend: '/assets/characters/zhugeliang/defend.png',
        crit: '/assets/characters/zhugeliang/crit.png',
        ultimate: '/assets/characters/zhugeliang/ultimate.png',
        defeat: '/assets/characters/zhugeliang/defeat.png',
        victory: '/assets/characters/zhugeliang/victory.png'
      },
      GAN_NING: {
        idle: '/assets/characters/ganning/idle.png',
        attack: '/assets/characters/ganning/attack.png',
        defend: '/assets/characters/ganning/defend.png',
        crit: '/assets/characters/ganning/crit.png',
        ultimate: '/assets/characters/ganning/ultimate.png',
        defeat: '/assets/characters/ganning/defeat.png',
        victory: '/assets/characters/ganning/victory.png'
      },
      boss_lv_bu: {
        idle: '/assets/enemies/lvbu/idle.png',
        attack: '/assets/enemies/lvbu/attack.png',
        defend: '/assets/enemies/lvbu/defend.png',
        crit: '/assets/enemies/lvbu/crit.png',
        ultimate: '/assets/enemies/lvbu/ultimate.png',
        defeat: '/assets/enemies/lvbu/defeat.png',
        victory: '/assets/enemies/lvbu/victory.png'
      },
      enemy_xiliang_cavalry: {
        idle: '/assets/enemies/lvbu/idle.png',
        attack: '/assets/enemies/lvbu/attack.png',
        defend: '/assets/enemies/lvbu/defend.png',
        crit: '/assets/enemies/lvbu/crit.png',
        ultimate: '/assets/enemies/lvbu/ultimate.png',
        defeat: '/assets/enemies/lvbu/defeat.png',
        victory: '/assets/enemies/lvbu/victory.png'
      },
      elite_gao_shun: {
        idle: '/assets/enemies/lvbu/idle.png',
        attack: '/assets/enemies/lvbu/attack.png',
        defend: '/assets/enemies/lvbu/defend.png',
        crit: '/assets/enemies/lvbu/crit.png',
        ultimate: '/assets/enemies/lvbu/ultimate.png',
        defeat: '/assets/enemies/lvbu/defeat.png',
        victory: '/assets/enemies/lvbu/victory.png'
      },
      boss_cao_cao: {
        idle: '/assets/enemies/caocao/idle.png',
        attack: '/assets/enemies/caocao/attack.png',
        defend: '/assets/enemies/caocao/defend.png',
        crit: '/assets/enemies/caocao/crit.png',
        ultimate: '/assets/enemies/caocao/ultimate.png',
        defeat: '/assets/enemies/caocao/defeat.png',
        victory: '/assets/enemies/caocao/victory.png'
      },
      enemy_water_soldier: {
        idle: '/assets/enemies/caocao/idle.png',
        attack: '/assets/enemies/caocao/attack.png',
        defend: '/assets/enemies/caocao/defend.png',
        crit: '/assets/enemies/caocao/crit.png',
        ultimate: '/assets/enemies/caocao/ultimate.png',
        defeat: '/assets/enemies/caocao/defeat.png',
        victory: '/assets/enemies/caocao/victory.png'
      },
      elite_dian_wei: {
        idle: '/assets/enemies/caocao/idle.png',
        attack: '/assets/enemies/caocao/attack.png',
        defend: '/assets/enemies/caocao/defend.png',
        crit: '/assets/enemies/caocao/crit.png',
        ultimate: '/assets/enemies/caocao/ultimate.png',
        defeat: '/assets/enemies/caocao/defeat.png',
        victory: '/assets/enemies/caocao/victory.png'
      },
      boss_destiny_spirit: {
        idle: '/assets/enemies/caocao/idle.png',
        attack: '/assets/enemies/caocao/attack.png',
        defend: '/assets/enemies/caocao/defend.png',
        crit: '/assets/enemies/caocao/crit.png',
        ultimate: '/assets/enemies/caocao/ultimate.png',
        defeat: '/assets/enemies/caocao/defeat.png',
        victory: '/assets/enemies/caocao/victory.png'
      },
      boss_zhang_jiao: {
        idle: '/assets/enemies/zhang_jiao.jpg',
        attack: '/assets/enemies/yellow_warrior.jpg',
        defend: '/assets/enemies/zhang_jiao.jpg',
        crit: '/assets/enemies/yellow_warrior.jpg',
        ultimate: '/assets/enemies/zhang_jiao.jpg',
        defeat: '/assets/enemies/zhang_jiao.jpg',
        victory: '/assets/enemies/zhang_jiao.jpg'
      },
      enemy_yellow_chanter: {
        idle: '/assets/enemies/zhang_jiao.jpg',
        attack: '/assets/enemies/yellow_warrior.jpg',
        defend: '/assets/enemies/zhang_jiao.jpg',
        crit: '/assets/enemies/yellow_warrior.jpg',
        ultimate: '/assets/enemies/zhang_jiao.jpg',
        defeat: '/assets/enemies/zhang_jiao.jpg',
        victory: '/assets/enemies/zhang_jiao.jpg'
      },
      enemy_talisman_warrior: {
        idle: '/assets/enemies/yellow_warrior.jpg',
        attack: '/assets/enemies/yellow_warrior.jpg',
        defend: '/assets/enemies/yellow_warrior.jpg',
        crit: '/assets/enemies/yellow_warrior.jpg',
        ultimate: '/assets/enemies/yellow_warrior.jpg',
        defeat: '/assets/enemies/yellow_warrior.jpg',
        victory: '/assets/enemies/yellow_warrior.jpg'
      },
      elite_guan_hai: {
        idle: '/assets/enemies/yellow_warrior.jpg',
        attack: '/assets/enemies/yellow_warrior.jpg',
        defend: '/assets/enemies/yellow_warrior.jpg',
        crit: '/assets/enemies/yellow_warrior.jpg',
        ultimate: '/assets/enemies/yellow_warrior.jpg',
        defeat: '/assets/enemies/yellow_warrior.jpg',
        victory: '/assets/enemies/yellow_warrior.jpg'
      }
    };

    return packs[id] || {
      idle: '/assets/characters/guanyu/idle.png',
      attack: '/assets/characters/guanyu/attack.png',
      defend: '/assets/characters/guanyu/defend.png',
      crit: '/assets/characters/guanyu/crit.png',
      ultimate: '/assets/characters/guanyu/ultimate.png',
      defeat: '/assets/characters/guanyu/defeat.png',
      victory: '/assets/characters/guanyu/victory.png'
    };
  }

  public static getUnitImageUrl(id: string): string | null {
    return this.getUnitActionPack(id).idle;
  }

  public static renderUnitVisual(id: string, name: string): string {
    const isPlayer = id === 'GUAN_YU' || id === 'ZHUGE_LIANG' || id === 'GAN_NING' || id === 'player';
    const pack = this.getUnitActionPack(id);

    return `
      <div class="character-warrior-figure ${isPlayer ? 'hero-warrior' : 'enemy-warrior'}" data-char-id="${id}">
        <!-- Footstep ground contact shadow -->
        <div class="ground-contact-shadow"></div>

        <!-- Dragon Qi / Martial Flames Aura -->
        <div class="warrior-dragon-aura">
          <div class="aura-flame flame-1"></div>
          <div class="aura-flame flame-2"></div>
        </div>

        <!-- Living warrior silhouette body with full multi-action pose layers -->
        <div class="warrior-silhouette-body">
          <div class="action-pose-layers">
            <img src="${pack.idle}" alt="${name} 待机" class="action-pose-frame pose-idle active-pose" data-pose="idle" />
            <img src="${pack.attack}" alt="${name} 攻击" class="action-pose-frame pose-attack" data-pose="attack" />
            <img src="${pack.defend}" alt="${name} 防御" class="action-pose-frame pose-defend" data-pose="defend" />
            <img src="${pack.crit}" alt="${name} 暴击" class="action-pose-frame pose-crit" data-pose="crit" />
            <img src="${pack.ultimate}" alt="${name} 大招" class="action-pose-frame pose-ultimate" data-pose="ultimate" />
            <img src="${pack.defeat}" alt="${name} 战败" class="action-pose-frame pose-defeat" data-pose="defeat" />
            <img src="${pack.victory}" alt="${name} 战胜" class="action-pose-frame pose-victory" data-pose="victory" />
          </div>
          
          <!-- Dynamic Green Dragon Crescent Blade Glimmer -->
          <div class="blade-gleam-streak"></div>

          <!-- Soft bottom mist blend -->
          <div class="feet-ink-gradient"></div>

          <!-- Defensive Xuanwu Bagua Shield Barrier -->
          <div class="warrior-shield-barrier">
            <div class="barrier-trigram-ring">☯</div>
          </div>

          <!-- Fallback vector SVG if images fail -->
          <div class="character-fallback-svg" style="display:none; width:100%; height:100%;">
            ${this.getCharacterSvg(id)}
          </div>
        </div>
      </div>
    `;
  }

  public static getCharacterSvg(id: string): string {
    switch (id) {
      case 'GUAN_YU':
        return `
          <svg viewBox="0 0 160 220" width="100%" height="100%" class="character-svg">
            <defs>
              <linearGradient id="gy_face" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#b83b38"/>
                <stop offset="100%" stop-color="#801815"/>
              </linearGradient>
              <linearGradient id="gy_robe" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#2d6a4f"/>
                <stop offset="100%" stop-color="#1b4332"/>
              </linearGradient>
            </defs>
            <rect x="0" y="0" width="160" height="220" fill="#0d1b14" />
            <path d="M20 220 L20 130 Q80 90 140 130 L140 220 Z" fill="url(#gy_robe)" stroke="#d4af37" stroke-width="2"/>
            <ellipse cx="80" cy="75" rx="30" ry="38" fill="url(#gy_face)" stroke="#5c100e" stroke-width="2"/>
            <path d="M48 60 Q80 20 112 60 Q80 45 48 60 Z" fill="#1b4332" stroke="#d4af37" stroke-width="2"/>
            <path d="M64 88 Q80 180 74 195 Q82 170 85 110 Q90 180 98 88 Z" fill="#151515" stroke="#000" stroke-width="2"/>
          </svg>
        `;

      case 'ZHUGE_LIANG':
        return `
          <svg viewBox="0 0 160 220" width="100%" height="100%" class="character-svg">
            <defs>
              <linearGradient id="zgl_robe" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#f8f9fa"/>
                <stop offset="100%" stop-color="#ced4da"/>
              </linearGradient>
            </defs>
            <rect x="0" y="0" width="160" height="220" fill="#0c1824" />
            <path d="M20 220 L20 130 Q80 85 140 130 L140 220 Z" fill="url(#zgl_robe)" stroke="#495057" stroke-width="2"/>
            <ellipse cx="80" cy="72" rx="26" ry="32" fill="#ffdfba" stroke="#cc9566" stroke-width="2"/>
            <path d="M52 56 Q80 15 108 56 Q80 42 52 56 Z" fill="#212529" stroke="#38bdf8" stroke-width="2"/>
            <path d="M60 140 Q80 110 100 140 L80 160 Z" fill="#38bdf8" opacity="0.6"/>
          </svg>
        `;

      case 'GAN_NING':
        return `
          <svg viewBox="0 0 160 220" width="100%" height="100%" class="character-svg">
            <rect x="0" y="0" width="160" height="220" fill="#1c0f08" />
            <path d="M20 220 L20 130 Q80 90 140 130 L140 220 Z" fill="#e8590c" stroke="#d9480f" stroke-width="2"/>
            <ellipse cx="80" cy="76" rx="28" ry="34" fill="#fcc419" stroke="#d9480f" stroke-width="2"/>
            <circle cx="50" cy="180" r="10" fill="#ffd43b" stroke="#f59f00" stroke-width="2"/>
            <circle cx="110" cy="180" r="10" fill="#ffd43b" stroke="#f59f00" stroke-width="2"/>
          </svg>
        `;

      default:
        return `
          <svg viewBox="0 0 160 220" width="100%" height="100%" class="character-svg enemy-svg">
            <rect x="0" y="0" width="160" height="220" fill="#1a0b0e" />
            <path d="M20 220 L20 130 Q80 90 140 130 L140 220 Z" fill="#343a40" stroke="#868e96" stroke-width="2"/>
            <ellipse cx="80" cy="76" rx="28" ry="34" fill="#f8f9fa" stroke="#495057" stroke-width="2"/>
          </svg>
        `;
    }
  }
}
