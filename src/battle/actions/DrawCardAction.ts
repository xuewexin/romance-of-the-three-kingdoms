import { GameAction } from '../../core/ActionQueueManager.ts';

export class DrawCardAction extends GameAction {
  private count: number;

  constructor(count: number = 1) {
    super();
    this.count = count;
    this.duration = 0.12;
  }

  public async execute(ctx: any): Promise<void> {
    if (!ctx.deckManager) return;
    for (let i = 0; i < this.count; i++) {
      const drawn = ctx.deckManager.drawCard();
      if (!drawn) break;
      if (ctx.soundEngine) {
        ctx.soundEngine.playCardDraw();
      }
      if (ctx.onStateChange) {
        ctx.onStateChange();
      }
      await new Promise((res) => setTimeout(res, 80));
    }
  }
}
