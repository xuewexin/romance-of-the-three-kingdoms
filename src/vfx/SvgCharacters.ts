// Character visual rendering with real painted art images and SVG vector fallbacks
// Styled as authentic 2D battle standees with ground shadows and combat postures

export class SvgCharacters {
  public static getUnitImageUrl(id: string): string | null {
    const map: Record<string, string> = {
      GUAN_YU: '/assets/characters/guanyu_idle.jpg',
      ZHUGE_LIANG: '/assets/characters/zhugeliang.jpg',
      GAN_NING: '/assets/characters/ganning.jpg',
      boss_zhang_jiao: '/assets/enemies/zhang_jiao.jpg',
      enemy_yellow_chanter: '/assets/enemies/zhang_jiao.jpg',
      enemy_talisman_warrior: '/assets/enemies/yellow_warrior.jpg',
      elite_guan_hai: '/assets/enemies/yellow_warrior.jpg',
      boss_lv_bu: '/assets/enemies/lv_bu.jpg',
      enemy_xiliang_cavalry: '/assets/enemies/lv_bu.jpg',
      elite_gao_shun: '/assets/enemies/lv_bu.jpg',
      boss_cao_cao: '/assets/enemies/cao_cao.jpg',
      enemy_water_soldier: '/assets/enemies/cao_cao.jpg',
      elite_dian_wei: '/assets/enemies/cao_cao.jpg',
      boss_destiny_spirit: '/assets/enemies/cao_cao.jpg'
    };
    return map[id] || null;
  }

  public static renderUnitVisual(id: string, name: string): string {
    const imgUrl = this.getUnitImageUrl(id);
    if (imgUrl) {
      return `
        <div class="character-standee unit-figure">
          <div class="standee-inner">
            <img src="${imgUrl}" alt="${name}" class="character-portrait-img" onerror="this.style.display='none'; if(this.nextElementSibling) this.nextElementSibling.style.display='block';" />
            <div class="standee-frame-rim"></div>
            <div class="character-fallback-svg" style="display:none; width:100%; height:100%;">
              ${this.getCharacterSvg(id)}
            </div>
          </div>
          <div class="ground-shadow"></div>
        </div>
      `;
    }
    return `
      <div class="character-standee unit-figure">
        <div class="standee-inner">
          ${this.getCharacterSvg(id)}
          <div class="standee-frame-rim"></div>
        </div>
        <div class="ground-shadow"></div>
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
