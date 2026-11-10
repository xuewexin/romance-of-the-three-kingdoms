import { CharacterId, CardData, RelicDef, MapNode } from '../types.ts';
import { SeededRandom } from '../core/SeededRandom.ts';
import { DagMapGenerator } from './DagMapGenerator.ts';

export class RunState {
  public characterId: CharacterId = 'GUAN_YU';
  public characterName: string = '关羽';
  public characterTitle: string = '汉寿亭侯 · 忠义武圣';
  public maxHp: number = 80;
  public currentHp: number = 80;
  public gold: number = 99;
  public act: number = 1;
  public currentFloor: number = 0;
  public currentNodeId: string | null = null;
  public mapNodes: MapNode[] = [];
  public deck: CardData[] = [];
  public relics: RelicDef[] = [];
  public seed: number;
  public rng: SeededRandom;
  public ascension: number = 0;

  constructor(characterId: CharacterId = 'GUAN_YU', seed?: number) {
    this.characterId = characterId;
    this.seed = seed ?? Math.floor(Math.random() * 1000000);
    this.rng = new SeededRandom(this.seed);
    this.initCharacter(characterId);
    this.mapNodes = DagMapGenerator.generate(this.act, this.rng);
  }

  public initCharacter(id: CharacterId): void {
    this.characterId = id;
    if (id === 'GUAN_YU') {
      this.characterName = '关羽';
      this.characterTitle = '汉寿亭侯 · 忠义武圣';
      this.maxHp = 80;
      this.currentHp = 80;
    } else if (id === 'ZHUGE_LIANG') {
      this.characterName = '诸葛亮';
      this.characterTitle = '卧龙武侯 · 奇门鬼谋';
      this.maxHp = 70;
      this.currentHp = 70;
    } else if (id === 'GAN_NING') {
      this.characterName = '甘宁';
      this.characterTitle = '锦帆猛将 · 夜袭破营';
      this.maxHp = 72;
      this.currentHp = 72;
    }
  }

  public advanceToNode(nodeId: string): MapNode | null {
    const targetNode = this.mapNodes.find((n) => n.id === nodeId);
    if (!targetNode) return null;

    targetNode.visited = true;
    this.currentNodeId = nodeId;
    this.currentFloor = targetNode.floor;

    // Update availability for next floor
    for (const node of this.mapNodes) {
      node.available = false;
    }
    let hasAvailable = false;
    for (const childId of targetNode.children) {
      const child = this.mapNodes.find((n) => n.id === childId);
      if (child) {
        child.available = true;
        hasAvailable = true;
      }
    }

    // 防卡死兜底保障：若当前节点无子节点或断链，强行激活下一层所有未访问节点
    if (!hasAvailable && targetNode.floor < 14) {
      const nextFloor = targetNode.floor + 1;
      const nextNodes = this.mapNodes.filter((n) => n.floor === nextFloor && !n.visited);
      for (const n of nextNodes) {
        n.available = true;
      }
    }

    return targetNode;
  }

  // 地图救援函数：如果由于任何历史原因导致无可用节点，自动救援下一层
  public ensureNextFloorAvailable(): void {
    const hasAnyAvailable = this.mapNodes.some((n) => n.available);
    if (!hasAnyAvailable && this.currentFloor < 14) {
      const nextFloor = this.currentFloor + 1;
      const nextNodes = this.mapNodes.filter((n) => n.floor === nextFloor && !n.visited);
      if (nextNodes.length > 0) {
        for (const n of nextNodes) {
          n.available = true;
        }
      } else {
        // 如果第一层没走过
        const floor0Nodes = this.mapNodes.filter((n) => n.floor === 0);
        for (const n of floor0Nodes) {
          n.available = true;
        }
      }
    }
  }

  public heal(amount: number): number {
    const actual = Math.min(this.maxHp - this.currentHp, amount);
    this.currentHp += actual;
    return actual;
  }

  public modifyMaxHp(amount: number): void {
    this.maxHp += amount;
    this.currentHp = Math.min(this.maxHp, this.currentHp + amount);
  }

  public addGold(amount: number): void {
    this.gold += amount;
  }

  public spendGold(amount: number): boolean {
    if (this.gold >= amount) {
      this.gold -= amount;
      return true;
    }
    return false;
  }

  public addCard(card: CardData): void {
    this.deck.push({ ...card });
  }

  public removeCard(cardId: string): boolean {
    const idx = this.deck.findIndex((c) => c.id === cardId);
    if (idx !== -1) {
      this.deck.splice(idx, 1);
      return true;
    }
    return false;
  }

  public upgradeCard(card: CardData): void {
    card.upgraded = true;
    card.name += '+';
    if (card.upgraded_stats) {
      if (card.upgraded_stats.cost !== undefined) {
        card.cost = card.upgraded_stats.cost;
      }
    }
  }

  public addRelic(relic: RelicDef): void {
    if (!this.relics.some((r) => r.id === relic.id)) {
      this.relics.push({ ...relic });
    }
  }

  public nextAct(): void {
    this.act++;
    this.currentFloor = 0;
    this.currentNodeId = null;
    this.mapNodes = DagMapGenerator.generate(this.act, this.rng);
  }

  public saveToStorage(): void {
    try {
      const data = {
        characterId: this.characterId,
        maxHp: this.maxHp,
        currentHp: this.currentHp,
        gold: this.gold,
        act: this.act,
        currentFloor: this.currentFloor,
        currentNodeId: this.currentNodeId,
        deck: this.deck,
        relics: this.relics,
        seed: this.seed,
        ascension: this.ascension,
        mapNodes: this.mapNodes
      };
      localStorage.setItem('THREE_KINGDOMS_SPIRE_SAVE', JSON.stringify(data));
    } catch (e) {
      console.warn('Failed to save to localStorage:', e);
    }
  }

  public loadFromStorage(): boolean {
    try {
      const saved = localStorage.getItem('THREE_KINGDOMS_SPIRE_SAVE');
      if (!saved) return false;
      const data = JSON.parse(saved);
      this.characterId = data.characterId;
      this.initCharacter(this.characterId);
      this.maxHp = data.maxHp;
      this.currentHp = data.currentHp;
      this.gold = data.gold;
      this.act = data.act;
      this.currentFloor = data.currentFloor;
      this.currentNodeId = data.currentNodeId;
      this.deck = data.deck || [];
      this.relics = data.relics || [];
      this.seed = data.seed;
      this.ascension = data.ascension || 0;
      this.mapNodes = data.mapNodes || [];
      this.rng = new SeededRandom(this.seed);
      return true;
    } catch (e) {
      console.error('Failed to load from storage:', e);
      return false;
    }
  }

  public clearStorage(): void {
    localStorage.removeItem('THREE_KINGDOMS_SPIRE_SAVE');
  }
}
