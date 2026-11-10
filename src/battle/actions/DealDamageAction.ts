import { GameAction } from '../../core/ActionQueueManager.ts';

export class DealDamageAction extends GameAction {
  private source: any;
  private target: any;
  private baseDamage: number;
  private tags: string[];
  private damageType: 'NORMAL' | 'THORNS' | 'HP_LOSS' | 'FIRE';
  private onFatalActions?: any[];

  constructor(
    source: any,
    target: any,
    baseDamage: number,
    tags: string[] = [],
    damageType: 'NORMAL' | 'THORNS' | 'HP_LOSS' | 'FIRE' = 'NORMAL',
    onFatalActions?: any[]
  ) {
    super();
    this.source = source;
    this.target = target;
    this.baseDamage = baseDamage;
    this.tags = tags;
    this.damageType = damageType;
    this.onFatalActions = onFatalActions;
    this.duration = 0.22;
  }

  public async execute(ctx: any): Promise<void> {
    if (!this.target || this.target.isDead()) return;

    const finalDmg = ctx.damagePipeline.calculate(
      this.source,
      this.target,
      this.baseDamage,
      this.tags,
      this.damageType
    );

    if (ctx.vfxManager) {
      if (this.source && this.source.id) {
        ctx.vfxManager.triggerAttackAnimation(this.source.id);
      }
      if (this.target && this.target.id) {
        ctx.vfxManager.triggerHitAnimation(this.target.id);
      }

      if (this.tags.includes('FIRE') || this.damageType === 'FIRE') {
        ctx.vfxManager.playFireEffect(this.target);
      } else if (this.tags.includes('THUNDER')) {
        ctx.vfxManager.playThunderEffect(this.target);
      } else if (this.tags.includes('DART')) {
        ctx.vfxManager.playDartEffect(this.target);
      } else {
        const isCrescent = this.tags.includes('BLADE') || this.baseDamage >= 12;
        ctx.vfxManager.playSlashEffect(this.target, isCrescent);
      }
    }

    if (ctx.soundEngine) {
      if (this.tags.includes('FIRE') || this.damageType === 'FIRE') {
        ctx.soundEngine.playFire();
      } else if (this.tags.includes('THUNDER')) {
        ctx.soundEngine.playThunder();
      } else {
        ctx.soundEngine.playSlash();
      }
    }

    const unblockedDmg = this.target.takeDamage(finalDmg, this.damageType);

    if (ctx.vfxManager) {
      ctx.vfxManager.spawnDamageText(this.target, finalDmg, this.damageType);
    }

    if (this.damageType === 'NORMAL' && this.source) {
      await ctx.eventBus.emit('ON_ATTACKED', {
        attacker: this.source,
        defender: this.target,
        unblockedDmg,
        queue: ctx.actionQueue
      });

      if (this.target.buffs && this.target.buffs.THORNS > 0 && !this.source.isDead()) {
        const thorns = this.target.buffs.THORNS;
        ctx.actionQueue.addToTop(
          new DealDamageAction(this.target, this.source, thorns, [], 'THORNS'),
          ctx
        );
      }
    }

    if (this.target.isDead()) {
      if (this.onFatalActions && this.onFatalActions.length > 0) {
        for (const actionDef of this.onFatalActions) {
          ctx.executeCardActionDef(actionDef, this.source, this.target);
        }
      }
      await ctx.eventBus.emit('ON_MONSTER_DEATH', {
        monster: this.target,
        killer: this.source
      });
    }

    await new Promise((res) => setTimeout(res, this.duration * 1000));
  }
}
