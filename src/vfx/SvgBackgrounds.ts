// Three Kingdoms atmospheric battle scenery with real painted backgrounds and SVG fallbacks

export class SvgBackgrounds {
  public static getActBackground(act: number): string {
    const bgIndex = Math.min(Math.max(1, act), 3);
    const bgUrl = `/assets/backgrounds/bg_act${bgIndex}.jpg`;

    return `
      <div class="scenery-bg scenery-act${act}">
        <img src="${bgUrl}" class="real-scenery-bg-img" alt="Three Kingdoms Battlefield" 
             onerror="this.style.display='none'; if(this.nextElementSibling) this.nextElementSibling.style.display='block';" />
        <div class="fallback-scenery-svg" style="display:none; width:100%; height:100%;">
          ${this.getSvgVectorBackground(act)}
        </div>
        <div class="scenery-overlay-vignette"></div>
      </div>
    `;
  }

  public static getSvgVectorBackground(act: number): string {
    switch (act) {
      case 1:
        return `
          <svg viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid slice" class="bg-svg">
            <rect width="1920" height="1080" fill="#141419"/>
            <circle cx="1400" cy="240" r="80" fill="#ffd43b" opacity="0.3"/>
            <path d="M0 680 Q320 540 650 640 T1300 580 T1920 620 L1920 1080 L0 1080 Z" fill="#181920" opacity="0.8"/>
            <polygon points="150,920 1770,920 1920,1080 0,1080" fill="#1a1c23" stroke="#ffd43b" stroke-width="1.5" stroke-opacity="0.3"/>
          </svg>
        `;
      case 2:
        return `
          <svg viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid slice" class="bg-svg">
            <rect width="1920" height="1080" fill="#2b1113"/>
            <circle cx="960" cy="400" r="120" fill="#e03131" opacity="0.6"/>
            <polygon points="120,890 1800,890 1920,1080 0,1080" fill="#201113"/>
          </svg>
        `;
      case 3:
        return `
          <svg viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid slice" class="bg-svg">
            <rect width="1920" height="1080" fill="#0a1120"/>
            <ellipse cx="960" cy="720" rx="900" ry="90" fill="#e8590c" opacity="0.45"/>
            <polygon points="100,880 1820,880 1920,1080 0,1080" fill="#1b1d24" stroke="#495057" stroke-width="1.5"/>
          </svg>
        `;
      default:
        return `
          <svg viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid slice" class="bg-svg">
            <rect width="1920" height="1080" fill="#090a10"/>
            <circle cx="960" cy="520" r="280" fill="none" stroke="#d4af37" stroke-width="2.5" stroke-dasharray="15,8" opacity="0.6"/>
          </svg>
        `;
    }
  }
}
