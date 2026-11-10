export class VfxManager {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private particles: any[] = [];
  private floatingTexts: any[] = [];
  private slashArcs: any[] = [];
  private lightningBolts: any[] = [];
  private spriteFx: any[] = [];
  private isRunning: boolean = false;

  private slashSprite: HTMLImageElement = new Image();
  private fireSprite: HTMLImageElement = new Image();

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.slashSprite.src = '/assets/vfx/vfx_slash_dragon.jpg';
    this.fireSprite.src = '/assets/vfx/vfx_fire_burst.jpg';
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.startLoop();
  }

  public resize(): void {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  private startLoop(): void {
    this.isRunning = true;
    const loop = () => {
      this.updateAndRender();
      if (this.isRunning) {
        requestAnimationFrame(loop);
      }
    };
    requestAnimationFrame(loop);
  }

  // Character combat action animations
  private getUnitElement(unitId: string): HTMLElement | null {
    if (!unitId) return null;
    if (unitId === 'player' || unitId === 'GUAN_YU' || unitId === 'ZHUGE_LIANG' || unitId === 'GAN_NING') {
      return document.getElementById('unit-player') || document.getElementById(`unit-${unitId}`);
    }
    return document.getElementById(`unit-${unitId}`) || document.getElementById('unit-player');
  }

  // 动作姿态切换：无缝切换真实 2D 动作图片 (idle, attack, defend, crit, ultimate, defeat, victory)
  public setUnitActionPose(
    unitId: string,
    pose: 'idle' | 'attack' | 'defend' | 'crit' | 'ultimate' | 'defeat' | 'victory',
    durationMs: number = 0
  ): void {
    const el = this.getUnitElement(unitId);
    if (!el) return;

    const frames = el.querySelectorAll<HTMLElement>('.action-pose-frame');
    if (frames.length === 0) return;

    frames.forEach((f) => {
      if (f.dataset.pose === pose) {
        f.classList.add('active-pose');
      } else {
        f.classList.remove('active-pose');
      }
    });

    if (durationMs > 0 && pose !== 'idle') {
      setTimeout(() => {
        // 若已处于战败或战胜终结姿态，不切回待机
        if (!el.classList.contains('anim-defeat-kneel') && !el.classList.contains('anim-victory-pose')) {
          this.setUnitActionPose(unitId, 'idle', 0);
        }
      }, durationMs);
    }
  }

  // 1. 真实攻击动作：动作图切换(斩击/重斩/大招)、疾步冲刺近身、挥刀/扇劈斩、凌空翻回
  public triggerAttackAnimation(
    sourceId: string,
    targetId?: string,
    isCrit: boolean = false,
    isUltimate: boolean = false
  ): void {
    const sourceEl = this.getUnitElement(sourceId);
    if (!sourceEl) return;
    const isPlayer = sourceId === 'player' || sourceId === 'GUAN_YU' || sourceId === 'ZHUGE_LIANG' || sourceId === 'GAN_NING';

    // 切换对应的动作图片帧
    const pose = isUltimate ? 'ultimate' : isCrit ? 'crit' : 'attack';
    this.setUnitActionPose(sourceId, pose, 580);

    // 计算攻击冲刺距离 (目标在视野中的横向差值)
    let dashDistance = isPlayer ? 380 : -380;
    if (targetId) {
      const targetEl = this.getUnitElement(targetId);
      if (targetEl) {
        const sourceRect = sourceEl.getBoundingClientRect();
        const targetRect = targetEl.getBoundingClientRect();
        const deltaX = (targetRect.left + targetRect.width / 2) - (sourceRect.left + sourceRect.width / 2);
        // 冲刺到敌方面前 (保持80px安全打击身位)
        dashDistance = isPlayer ? Math.max(180, deltaX - 90) : Math.min(-180, deltaX + 90);
      }
    }

    sourceEl.style.setProperty('--dash-distance', `${dashDistance}px`);
    const animClass = isPlayer ? 'anim-hero-sprint-slash' : 'anim-enemy-sprint-slash';
    sourceEl.classList.remove('anim-hero-sprint-slash', 'anim-enemy-sprint-slash', 'anim-hit-recoil', 'anim-shield-brace');
    void sourceEl.offsetWidth;
    sourceEl.classList.add(animClass);

    setTimeout(() => {
      sourceEl.classList.remove(animClass);
    }, 560);
  }

  // 2. 真实受击动作：切换受创败阵姿态、重创震退、血墨飞溅、通体赤红闪烁
  public triggerHitAnimation(targetId: string): void {
    this.setUnitActionPose(targetId, 'defeat', 420);
    const el = this.getUnitElement(targetId);
    if (!el) return;
    el.classList.remove('anim-hit-recoil');
    void el.offsetWidth;
    el.classList.add('anim-hit-recoil');

    // 溅射受击墨滴粒子
    const pos = this.getTargetCenter({ id: targetId });
    for (let i = 0; i < 12; i++) {
      this.particles.push({
        x: pos.x + (Math.random() - 0.5) * 40,
        y: pos.y + (Math.random() - 0.5) * 40,
        vx: (Math.random() - 0.5) * 8,
        vy: -Math.random() * 6 - 2,
        size: Math.random() * 8 + 4,
        color: Math.random() > 0.4 ? '#b91c1c' : '#18181b',
        life: 1.0,
        decay: 0.05,
        type: 'slash_ink'
      });
    }

    setTimeout(() => {
      el.classList.remove('anim-hit-recoil');
    }, 450);
  }

  // 3. 真实防御姿态：切换横刀架御/奇门八卦动作图片、玄武金光八卦护盾绽放
  public triggerDefendAnimation(targetId: string): void {
    this.setUnitActionPose(targetId, 'defend', 500);
    const el = this.getUnitElement(targetId);
    if (!el) return;
    el.classList.remove('anim-shield-brace');
    void el.offsetWidth;
    el.classList.add('anim-shield-brace');
    setTimeout(() => {
      el.classList.remove('anim-shield-brace');
    }, 480);
  }

  // 4. 真实战胜姿态：切换高举神兵/抚须凯旋动作图片、金芒万丈、三军振臂
  public triggerVictoryAnimation(playerId: string = 'player'): void {
    this.setUnitActionPose(playerId, 'victory', 0);
    const el = this.getUnitElement(playerId);
    if (!el) return;
    el.classList.add('anim-victory-pose');
    this.screenShake(6, 400);

    // 庆祝金雨与华光粒子
    const center = this.getTargetCenter({ id: playerId });
    for (let i = 0; i < 40; i++) {
      const angle = (i / 40) * Math.PI * 2;
      const speed = Math.random() * 6 + 2;
      this.particles.push({
        x: center.x,
        y: center.y - 30,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        size: Math.random() * 7 + 4,
        color: ['#ffd700', '#f59e0b', '#fef08a', '#fbbf24'][Math.floor(Math.random() * 4)],
        life: 1.2,
        decay: 0.025,
        type: 'buff'
      });
    }
  }

  // 5. 真实战败动作：切换力竭败阵/横刀半跪动作图片、消融于水墨迷障
  public triggerDefeatAnimation(playerId: string = 'player'): void {
    this.setUnitActionPose(playerId, 'defeat', 0);
    const el = this.getUnitElement(playerId);
    if (!el) return;
    el.classList.add('anim-defeat-kneel');
    this.screenShake(10, 500);

    const center = this.getTargetCenter({ id: playerId });
    for (let i = 0; i < 25; i++) {
      this.particles.push({
        x: center.x + (Math.random() - 0.5) * 50,
        y: center.y + 20,
        vx: (Math.random() - 0.5) * 3,
        vy: -Math.random() * 4 - 1,
        size: Math.random() * 12 + 6,
        color: '#27272a',
        life: 1.0,
        decay: 0.02,
        type: 'slash_ink'
      });
    }
  }

  public screenShake(intensity: number = 8, durationMs: number = 200): void {
    const container = document.getElementById('game-app');
    if (!container) return;
    const start = performance.now();
    const shake = () => {
      const elapsed = performance.now() - start;
      if (elapsed < durationMs) {
        const x = (Math.random() * 2 - 1) * intensity;
        const y = (Math.random() * 2 - 1) * intensity;
        container.style.transform = `translate(${x}px, ${y}px)`;
        requestAnimationFrame(shake);
      } else {
        container.style.transform = 'none';
      }
    };
    requestAnimationFrame(shake);
  }

  // 1. 水墨青龙刀光斩击
  public playSlashEffect(target: any, isCrescent: boolean = false): void {
    this.screenShake(isCrescent ? 12 : 7, isCrescent ? 250 : 180);
    const pos = this.getTargetCenter(target);

    // Glowing Slash Sprite with Screen Blend Mode
    this.spriteFx.push({
      img: this.slashSprite,
      x: pos.x,
      y: pos.y,
      size: isCrescent ? 280 : 200,
      rotation: (Math.random() - 0.5) * 0.5,
      life: 1.0,
      decay: 0.08
    });

    // Glowing Slash Arc
    this.slashArcs.push({
      x: pos.x,
      y: pos.y,
      radius: isCrescent ? 140 : 90,
      startAngle: -Math.PI * 0.75,
      endAngle: Math.PI * 0.25,
      color: isCrescent ? '#20c997' : '#f8f9fa',
      strokeWidth: isCrescent ? 12 : 6,
      life: 1.0,
      decay: 0.08
    });

    // Ink drops and sparks
    const count = isCrescent ? 35 : 20;
    for (let i = 0; i < count; i++) {
      const angle = (Math.random() - 0.5) * Math.PI * 2;
      const speed = Math.random() * 14 + 4;
      this.particles.push({
        x: pos.x + (Math.random() - 0.5) * 40,
        y: pos.y + (Math.random() - 0.5) * 40,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 8 + 3,
        color: isCrescent
          ? ['#20c997', '#099268', '#12b886', '#0d0f14'][Math.floor(Math.random() * 4)]
          : ['#e03131', '#1a1a1a', '#f1f3f5', '#adb5bd'][Math.floor(Math.random() * 4)],
        life: 1.0,
        decay: 0.04 + Math.random() * 0.03,
        type: 'slash_ink'
      });
    }
  }

  // 2. 九天引雷 / 真实折线闪电
  public playThunderEffect(target: any): void {
    this.screenShake(12, 280);
    const pos = this.getTargetCenter(target);

    const points: Array<{ x: number; y: number }> = [];
    let curX = pos.x + (Math.random() - 0.5) * 40;
    let curY = 0;
    points.push({ x: curX, y: curY });

    while (curY < pos.y) {
      curY += Math.random() * 40 + 20;
      curX += (Math.random() - 0.5) * 60;
      points.push({ x: curX, y: Math.min(pos.y, curY) });
    }

    this.lightningBolts.push({
      points,
      color: '#67e8f9',
      width: 5,
      life: 1.0,
      decay: 0.07
    });

    for (let i = 0; i < 30; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 12 + 2;
      this.particles.push({
        x: pos.x,
        y: pos.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        size: Math.random() * 5 + 2,
        color: ['#e0f2fe', '#38bdf8', '#0284c7', '#ffffff'][Math.floor(Math.random() * 4)],
        life: 1.0,
        decay: 0.05,
        type: 'spark'
      });
    }
  }

  // 3. 业火焚原 / 火油引燃爆破
  public playFireEffect(target: any): void {
    this.screenShake(9, 220);
    const pos = this.getTargetCenter(target);

    // Explosive Fire Burst Sprite
    this.spriteFx.push({
      img: this.fireSprite,
      x: pos.x,
      y: pos.y - 15,
      size: 240,
      rotation: Math.random() * Math.PI * 2,
      life: 1.0,
      decay: 0.07
    });

    for (let i = 0; i < 35; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 8 + 3;
      this.particles.push({
        x: pos.x + (Math.random() - 0.5) * 50,
        y: pos.y + 20,
        vx: Math.cos(angle) * speed,
        vy: -Math.random() * 8 - 4,
        size: Math.random() * 12 + 6,
        color: ['#ef4444', '#f97316', '#facc15', '#7c2d12', '#18181b'][Math.floor(Math.random() * 5)],
        life: 1.0,
        decay: 0.035 + Math.random() * 0.025,
        type: 'ember'
      });
    }
  }

  // 4. 玄武金盾筑防
  public playShieldEffect(target: any): void {
    const pos = this.getTargetCenter(target);
    for (let i = 0; i < 20; i++) {
      const angle = (i / 20) * Math.PI * 2;
      this.particles.push({
        x: pos.x + Math.cos(angle) * 55,
        y: pos.y + Math.sin(angle) * 55,
        vx: Math.cos(angle) * 3,
        vy: Math.sin(angle) * 3,
        size: 6,
        color: '#ffd700',
        life: 1.0,
        decay: 0.05,
        type: 'ring'
      });
    }
  }

  // 5. 袖箭破空
  public playDartEffect(target: any): void {
    const pos = this.getTargetCenter(target);
    for (let i = 0; i < 15; i++) {
      this.particles.push({
        x: pos.x - 120 + i * 8,
        y: pos.y + (Math.random() - 0.5) * 20,
        vx: 14 + Math.random() * 6,
        vy: (Math.random() - 0.5) * 3,
        size: 3,
        color: '#e2e8f0',
        life: 1.0,
        decay: 0.06,
        type: 'tracer'
      });
    }
  }

  public playBuffEffect(target: any, buffId: string): void {
    const pos = this.getTargetCenter(target);
    const color = buffId === 'STRENGTH' ? '#ef4444' : buffId === 'DEXTERITY' ? '#22c55e' : '#38bdf8';
    for (let i = 0; i < 16; i++) {
      this.particles.push({
        x: pos.x + (Math.random() - 0.5) * 50,
        y: pos.y + 30,
        vx: (Math.random() - 0.5) * 3,
        vy: -Math.random() * 5 - 2,
        size: 5,
        color,
        life: 1.0,
        decay: 0.03,
        type: 'buff'
      });
    }
  }

  public playOrbChannelEffect(orb: any): void {
    const colors: Record<string, string> = {
      FIRE: '#ef4444',
      MIST: '#10b981',
      THUNDER: '#38bdf8',
      WIND: '#a855f7'
    };
    const c = colors[orb.type] || '#ffd700';
    for (let i = 0; i < 20; i++) {
      this.particles.push({
        x: window.innerWidth * 0.28 + (Math.random() - 0.5) * 60,
        y: window.innerHeight * 0.45 + (Math.random() - 0.5) * 60,
        vx: (Math.random() - 0.5) * 5,
        vy: (Math.random() - 0.5) * 5,
        size: 6,
        color: c,
        life: 1.0,
        decay: 0.04,
        type: 'orb'
      });
    }
  }

  public playOrbEvokeEffect(orb: any): void {
    this.screenShake(6, 180);
  }

  public playExhaustEffect(): void {
    for (let i = 0; i < 25; i++) {
      this.particles.push({
        x: window.innerWidth / 2 + (Math.random() - 0.5) * 160,
        y: window.innerHeight - 150,
        vx: (Math.random() - 0.5) * 3,
        vy: -Math.random() * 6 - 2,
        size: 7,
        color: '#52525b',
        life: 1.0,
        decay: 0.03,
        type: 'smoke'
      });
    }
  }

  public spawnDamageText(target: any, amount: number, type: string = 'NORMAL'): void {
    const pos = this.getTargetCenter(target);
    let color = '#ff4d4f';
    let text = `-${amount}`;
    let prefix = '斩';

    if (type === 'BLOCK') {
      color = '#ffd700';
      text = `+${amount}`;
      prefix = '盾';
    } else if (type === 'HP_LOSS') {
      color = '#dc2626';
      text = `-${amount}`;
      prefix = '煞';
    } else if (type === 'FIRE') {
      color = '#f97316';
      text = `-${amount}`;
      prefix = '炎';
    } else if (type === 'THORNS') {
      color = '#e11d48';
      text = `-${amount}`;
      prefix = '烈';
    }

    this.floatingTexts.push({
      x: pos.x + (Math.random() - 0.5) * 40,
      y: pos.y - 30,
      vy: -2.2,
      text: `${prefix} ${text}`,
      color,
      life: 1.0,
      scale: 1.5
    });
  }

  private getTargetCenter(target: any): { x: number; y: number } {
    if (target && target.id) {
      const el = this.getUnitElement(target.id);
      if (el) {
        const rect = el.getBoundingClientRect();
        return {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2
        };
      }
    }
    if (target && target.isDead !== undefined && target.id === 'player') {
      return { x: window.innerWidth * 0.28, y: window.innerHeight * 0.45 };
    }
    return { x: window.innerWidth * 0.72, y: window.innerHeight * 0.45 };
  }

  private updateAndRender(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // 1. Render Sprite VFX (Screen Blend Mode)
    for (let i = this.spriteFx.length - 1; i >= 0; i--) {
      const fx = this.spriteFx[i];
      fx.life -= fx.decay;
      if (fx.life <= 0) {
        this.spriteFx.splice(i, 1);
        continue;
      }
      if (fx.img && fx.img.complete && fx.img.naturalWidth > 0) {
        this.ctx.save();
        this.ctx.globalAlpha = Math.min(1.0, fx.life * 1.5);
        this.ctx.globalCompositeOperation = 'screen';
        this.ctx.translate(fx.x, fx.y);
        this.ctx.rotate(fx.rotation);
        this.ctx.drawImage(fx.img, -fx.size / 2, -fx.size / 2, fx.size, fx.size);
        this.ctx.restore();
      }
    }

    // 2. Render Lightning Bolts
    for (let i = this.lightningBolts.length - 1; i >= 0; i--) {
      const bolt = this.lightningBolts[i];
      bolt.life -= bolt.decay;
      if (bolt.life <= 0) {
        this.lightningBolts.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.globalAlpha = bolt.life;
      this.ctx.strokeStyle = bolt.color;
      this.ctx.lineWidth = bolt.width;
      this.ctx.shadowColor = bolt.color;
      this.ctx.shadowBlur = 15;

      this.ctx.beginPath();
      if (bolt.points.length > 0) {
        this.ctx.moveTo(bolt.points[0].x, bolt.points[0].y);
        for (let j = 1; j < bolt.points.length; j++) {
          this.ctx.lineTo(bolt.points[j].x, bolt.points[j].y);
        }
      }
      this.ctx.stroke();
      this.ctx.restore();
    }

    // 3. Render Slash Arcs
    for (let i = this.slashArcs.length - 1; i >= 0; i--) {
      const arc = this.slashArcs[i];
      arc.life -= arc.decay;
      if (arc.life <= 0) {
        this.slashArcs.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.globalAlpha = arc.life;
      this.ctx.strokeStyle = arc.color;
      this.ctx.lineWidth = arc.strokeWidth * arc.life;
      this.ctx.shadowColor = arc.color;
      this.ctx.shadowBlur = 20;

      this.ctx.beginPath();
      this.ctx.arc(arc.x, arc.y, arc.radius, arc.startAngle, arc.endAngle);
      this.ctx.stroke();
      this.ctx.restore();
    }

    // 4. Render Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= p.decay;

      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.globalAlpha = Math.max(0, p.life);
      this.ctx.fillStyle = p.color;

      if (p.type === 'slash_ink') {
        this.ctx.beginPath();
        this.ctx.ellipse(p.x, p.y, p.size * 2, p.size * 0.6, Math.PI / 4, 0, Math.PI * 2);
        this.ctx.fill();
      } else if (p.type === 'tracer') {
        this.ctx.beginPath();
        this.ctx.rect(p.x, p.y, 16, 2.5);
        this.ctx.fill();
      } else {
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        this.ctx.fill();
      }
      this.ctx.restore();
    }

    // 5. Render Floating Calligraphy Damage Texts
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const t = this.floatingTexts[i];
      t.y += t.vy;
      t.life -= 0.022;

      if (t.life <= 0) {
        this.floatingTexts.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.globalAlpha = Math.max(0, t.life);
      this.ctx.font = `bold ${Math.round(26 * t.scale)}px "Noto Serif SC", "SimSun", serif`;
      this.ctx.fillStyle = t.color;
      this.ctx.strokeStyle = '#000000';
      this.ctx.lineWidth = 5;
      this.ctx.textAlign = 'center';
      this.ctx.shadowColor = t.color;
      this.ctx.shadowBlur = 10;
      this.ctx.strokeText(t.text, t.x, t.y);
      this.ctx.fillText(t.text, t.x, t.y);
      this.ctx.restore();
    }
  }
}
