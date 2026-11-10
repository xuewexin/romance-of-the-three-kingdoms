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
      ctx.deckManager.drawCard();
      if (ctx.soundEngine) {
        ctx.soundEngine.playCardDraw();
      }
      await new Promise((res) => setTimeout(res, 80));
    }
  }
}
