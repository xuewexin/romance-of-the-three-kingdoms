export type GameEventType =
  | 'ON_BATTLE_START'
  | 'ON_TURN_START'
  | 'ON_CARD_PLAYED'
  | 'ON_CARD_DISCARDED'
  | 'ON_MODIFY_DAMAGE_GIVE'
  | 'ON_ATTACKED'
  | 'ON_MONSTER_DEATH'
  | 'ON_TURN_END'
  | 'ON_DAMAGE_DEALT'
  | 'ON_BLOCK_GAINED';

export type EventCallback = (payload: any) => Promise<void> | void;

export class EventBus {
  private listeners: Map<GameEventType, EventCallback[]> = new Map();

  public on(event: GameEventType, callback: EventCallback): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
    return () => this.off(event, callback);
  }

  public off(event: GameEventType, callback: EventCallback): void {
    const list = this.listeners.get(event);
    if (!list) return;
    this.listeners.set(
      event,
      list.filter((cb) => cb !== callback)
    );
  }

  public async emit(event: GameEventType, payload: any): Promise<void> {
    const list = this.listeners.get(event);
    if (!list || list.length === 0) return;
    for (const callback of list) {
      await callback(payload);
    }
  }

  public clear(): void {
    this.listeners.clear();
  }
}
