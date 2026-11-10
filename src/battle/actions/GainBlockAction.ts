import { GameAction } from '../../core/ActionQueueManager.ts';

export class GainBlockAction extends GameAction {
  private target: any;
  private baseBlock: number;

  constructor(target: any, baseBlock: number) {
    super();
    this.target = target;
    this.baseBlock = baseBlock;
    this.duration = 0.18;
  }

  public async execute(ctx: any): Promise<void> {
    if (!this.target || this.target.isDead()) return;

    const finalBlock = ctx.damagePipeline.calculateBlock(this.target, this.baseBlock);
    this.target.gainBlock(finalBlock);

    if (ctx.vfxManager) {
      if (this.target && this.target.id) {
        ctx.vfxManager.triggerDefendAnimation(this.target.id);
      }
      ctx.vfxManager.playShieldEffect(this.target);
      ctx.vfxManager.spawnDamageText(this.target, finalBlock, 'BLOCK');
    }
    if (ctx.soundEngine) {
      ctx.soundEngine.playBlock();
    }

    await ctx.eventBus.emit('ON_BLOCK_GAINED', {
      target: this.target,
      block: finalBlock
    });

    await new Promise((res) => setTimeout(res, this.duration * 1000));
  }
}
