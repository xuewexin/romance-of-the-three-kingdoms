import { OrbInstance, OrbType } from '../types.ts';
import { DealDamageAction } from './actions/DealDamageAction.ts';
import { GainBlockAction } from './actions/GainBlockAction.ts';
import { DrawCardAction } from './actions/DrawCardAction.ts';

export class OrbManager {
  private maxSlots: number = 3;
  private orbs: OrbInstance[] = [];

  constructor(slots: number = 3) {
    this.maxSlots = slots;
  }

  public getOrbs(): OrbInstance[] {
    return this.orbs;
  }

  public getMaxSlots(): number {
    return this.maxSlots;
  }

  public createOrb(type: OrbType): OrbInstance {
    switch (type) {
      case 'FIRE':
        return {
          type: 'FIRE',
          name: '离火阵眼',
          passiveValue: 3,
          evokeValue: 8,
          description: '回合末灼烧最低生命敌人；激发时对全体造成 8 点烈火伤害'
        };
      case 'MIST':
        return {
          type: 'MIST',
          name: '玄雾阵眼',
          passiveValue: 3,
          evokeValue: 7,
          description: '回合末提供 3 点格挡；激发时获得 7 点格挡'
        };
      case 'THUNDER':
        return {
          type: 'THUNDER',
          name: '神雷阵眼',
          passiveValue: 2,
          evokeValue: 6,
          description: '打出韬略牌时引雷劈击 2 点；激发时释放 3 段连环神雷'
        };
      case 'WIND':
        return {
          type: 'WIND',
          name: '巽风阵眼',
          passiveValue: 0,
          evokeValue: 1,
          description: '无回合末效果；激发时回复 1 点军令并抽取 1 张牌'
        };
    }
  }

  public async channel(type: OrbType, ctx: any): Promise<void> {
    if (this.orbs.length >= this.maxSlots) {
      await this.evokeOldest(ctx);
    }
    const newOrb = this.createOrb(type);
    this.orbs.push(newOrb);
    if (ctx.vfxManager) {
      ctx.vfxManager.playOrbChannelEffect(newOrb);
    }
  }

  public async evokeOldest(ctx: any): Promise<void> {
    if (this.orbs.length === 0) return;
    const orb = this.orbs.shift()!;
    await this.executeEvoke(orb, ctx);
  }

  public async evokeAll(ctx: any): Promise<void> {
    const list = [...this.orbs];
    this.orbs = [];
    for (const orb of list) {
      await this.executeEvoke(orb, ctx);
    }
  }

  private async executeEvoke(orb: OrbInstance, ctx: any): Promise<void> {
    const focus = (ctx.player && ctx.player.buffs && ctx.player.buffs.FOCUS) || 0;
    const value = orb.evokeValue + focus;

    if (ctx.vfxManager) {
      ctx.vfxManager.playOrbEvokeEffect(orb);
    }

    switch (orb.type) {
      case 'FIRE':
        // Deal damage to all enemies
        if (ctx.enemies) {
          for (const enemy of ctx.enemies) {
            if (!enemy.isDead()) {
              ctx.actionQueue.addToTop(
                new DealDamageAction(ctx.player, enemy, value, ['FIRE'], 'FIRE'),
                ctx
              );
            }
          }
        }
        break;
      case 'MIST':
        ctx.actionQueue.addToTop(new GainBlockAction(ctx.player, value), ctx);
        break;
      case 'THUNDER':
        // Hit random enemy 3 times
        for (let i = 0; i < 3; i++) {
          const alive = (ctx.enemies || []).filter((e: any) => !e.isDead());
          if (alive.length > 0) {
            const target = ctx.rng ? ctx.rng.choice(alive) : alive[0];
            ctx.actionQueue.addToTop(
              new DealDamageAction(ctx.player, target, value, ['THUNDER'], 'NORMAL'),
              ctx
            );
          }
        }
        break;
      case 'WIND':
        ctx.player.gainEnergy(1);
        ctx.actionQueue.addToTop(new DrawCardAction(1), ctx);
        break;
    }
  }

  public async triggerPassives(ctx: any): Promise<void> {
    const focus = (ctx.player && ctx.player.buffs && ctx.player.buffs.FOCUS) || 0;

    for (const orb of this.orbs) {
      const value = orb.passiveValue + focus;
      if (value <= 0) continue;

      switch (orb.type) {
        case 'FIRE': {
          // Lowest HP alive enemy
          const alive = (ctx.enemies || []).filter((e: any) => !e.isDead());
          if (alive.length > 0) {
            alive.sort((a: any, b: any) => a.currentHp - b.currentHp);
            ctx.actionQueue.addToBottom(
              new DealDamageAction(ctx.player, alive[0], value, ['FIRE'], 'FIRE'),
              ctx
            );
          }
          break;
        }
        case 'MIST': {
          ctx.actionQueue.addToBottom(new GainBlockAction(ctx.player, value), ctx);
          break;
        }
      }
    }
  }

  public async onCardPlayed(card: any, ctx: any): Promise<void> {
    // If thunder orb is active and played a SKILL card
    if (card.type === 'SKILL') {
      const focus = (ctx.player && ctx.player.buffs && ctx.player.buffs.FOCUS) || 0;
      for (const orb of this.orbs) {
        if (orb.type === 'THUNDER') {
          const value = orb.passiveValue + focus;
          const alive = (ctx.enemies || []).filter((e: any) => !e.isDead());
          if (alive.length > 0) {
            const target = ctx.rng ? ctx.rng.choice(alive) : alive[0];
            ctx.actionQueue.addToTop(
              new DealDamageAction(ctx.player, target, value, ['THUNDER'], 'NORMAL'),
              ctx
            );
          }
        }
      }
    }
  }

  public clear(): void {
    this.orbs = [];
  }
}
