import { GameAction } from '../../core/ActionQueueManager.ts';

export class ApplyBuffAction extends GameAction {
  private target: any;
  private buffId: string;
  private stacks: number;

  constructor(target: any, buffId: string, stacks: number = 1) {
    super();
    this.target = target;
    this.buffId = buffId;
    this.stacks = stacks;
    this.duration = 0.15;
  }

  public async execute(ctx: any): Promise<void> {
    if (!this.target || this.target.isDead()) return;

    this.target.addBuff(this.buffId, this.stacks);
    if (ctx.vfxManager) {
      ctx.vfxManager.playBuffEffect(this.target, this.buffId);
    }

    await new Promise((res) => setTimeout(res, this.duration * 1000));
  }
}
