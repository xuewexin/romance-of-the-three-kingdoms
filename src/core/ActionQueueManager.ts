export abstract class GameAction {
  public isDone: boolean = false;
  public duration: number = 0.25;

  public abstract execute(ctx: any): Promise<void>;
}

export class ActionQueueManager {
  private queue: GameAction[] = [];
  private isProcessing: boolean = false;

  public addToBottom(action: GameAction, ctx: any): void {
    this.queue.push(action);
    this.processNext(ctx);
  }

  public addToTop(action: GameAction, ctx: any): void {
    this.queue.unshift(action);
    this.processNext(ctx);
  }

  public clear(): void {
    this.queue = [];
    this.isProcessing = false;
  }

  public getQueueLength(): number {
    return this.queue.length;
  }

  private async processNext(ctx: any): Promise<void> {
    if (this.isProcessing) return;
    this.isProcessing = true;

    while (this.queue.length > 0) {
      const currentAction = this.queue.shift()!;

      if (ctx.isBattleOver && ctx.isBattleOver()) {
        this.queue = [];
        break;
      }

      try {
        await currentAction.execute(ctx);
      } catch (err) {
        console.error('Error executing action:', err);
      }
    }

    this.isProcessing = false;
    if (ctx.onQueueEmpty) {
      ctx.onQueueEmpty();
    }
  }
}
