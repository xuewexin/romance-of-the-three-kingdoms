import { GameAction } from '../../core/ActionQueueManager.ts';
import { DealDamageAction } from './DealDamageAction.ts';

export class DiscardCardAction extends GameAction {
  private card: any;

  constructor(card: any) {
    super();
    this.card = card;
    this.duration = 0.15;
  }

  public async execute(ctx: any): Promise<void> {
    if (!ctx.deckManager || !this.card) return;
    ctx.deckManager.discardCard(this.card);

    if (this.card.id === 'gn_secret_crossing') {
      ctx.player.gainEnergy(2);
      ctx.deckManager.drawCard();
      if (ctx.uiNotify) ctx.uiNotify('【暗渡陈仓】触发：恢复 2 军令，抽 1 张牌！');
    } else if (this.card.id === 'zgl_silk_bag') {
      if (ctx.enemies) {
        for (const enemy of ctx.enemies) {
          if (!enemy.isDead()) {
            ctx.actionQueue.addToTop(
              new DealDamageAction(ctx.player, enemy, 8, ['THUNDER'], 'NORMAL'),
              ctx
            );
          }
        }
      }
      if (ctx.uiNotify) ctx.uiNotify('【锦囊天机】触发：天雷贯顶，全体受到 8 点伤害！');
    }

    await ctx.eventBus.emit('ON_CARD_DISCARDED', { card: this.card });
  }
}
