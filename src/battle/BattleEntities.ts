import { EnemyDef, EnemyIntent, EnemyMoveDef } from '../types.ts';
import { DealDamageAction } from './actions/DealDamageAction.ts';
import { GainBlockAction } from './actions/GainBlockAction.ts';
import { ApplyBuffAction } from './actions/ApplyBuffAction.ts';

export class PlayerUnit {
  public id: string;
  public name: string;
  public title: string;
  public maxHp: number;
  public currentHp: number;
  public block: number = 0;
  public energy: number = 3;
  public maxEnergy: number = 3;
  public buffs: Record<string, number> = {};
  public selfHpLossCountThisBattle: number = 0;

  constructor(id: string, name: string, title: string, maxHp: number, currentHp?: number) {
    this.id = id;
    this.name = name;
    this.title = title;
    this.maxHp = maxHp;
    this.currentHp = currentHp ?? maxHp;
  }

  public takeDamage(amount: number, damageType: string = 'NORMAL'): number {
    let unblocked = amount;
    if (damageType !== 'HP_LOSS') {
      if (this.block >= amount) {
        this.block -= amount;
        return 0;
      } else {
        unblocked = amount - this.block;
        this.block = 0;
      }
    }
    this.currentHp = Math.max(0, this.currentHp - unblocked);
    return unblocked;
  }

  public loseHpDirectly(amount: number): void {
    this.currentHp = Math.max(0, this.currentHp - amount);
    this.selfHpLossCountThisBattle++;
  }

  public gainBlock(amount: number): void {
    this.block += amount;
  }

  public addBuff(id: string, stacks: number): void {
    this.buffs[id] = (this.buffs[id] || 0) + stacks;
    if (this.buffs[id] <= 0) {
      delete this.buffs[id];
    }
  }

  public removeBuff(id: string): void {
    delete this.buffs[id];
  }

  public gainEnergy(amount: number): void {
    this.energy = Math.min(9, this.energy + amount);
  }

  public spendEnergy(amount: number): boolean {
    if (this.energy >= amount) {
      this.energy -= amount;
      return true;
    }
    return false;
  }

  public resetEnergy(): void {
    this.energy = this.maxEnergy;
  }

  public isDead(): boolean {
    return this.currentHp <= 0;
  }

  public onTurnEnd(): void {
    // Check Barricade / 铁桶军阵
    if (!this.buffs.BARRICADE) {
      this.block = 0;
    }

    // Oil burn on player if any
    if (this.buffs.OIL_BURN && this.buffs.OIL_BURN > 0) {
      const burn = this.buffs.OIL_BURN;
      this.takeDamage(burn, 'HP_LOSS');
      this.buffs.OIL_BURN = Math.floor(burn / 2);
      if (this.buffs.OIL_BURN <= 0) delete this.buffs.OIL_BURN;
    }

    // Decrement temporary turn debuffs
    ['VULNERABLE', 'WEAK', 'FRAIL'].forEach((id) => {
      if (this.buffs[id] && this.buffs[id] > 0) {
        this.buffs[id]--;
        if (this.buffs[id] <= 0) delete this.buffs[id];
      }
    });

    // Clear Kong Cheng if active
    if (this.buffs.KONG_CHENG) {
      delete this.buffs.KONG_CHENG;
    }
  }
}

export class EnemyUnit {
  public id: string;
  public enemy_id: string;
  public name: string;
  public title: string;
  public maxHp: number;
  public currentHp: number;
  public block: number = 0;
  public buffs: Record<string, number> = {};
  public currentMoveKey: string = '';
  public intent: EnemyIntent = { type: 'UNKNOWN', description: '思考中...' };
  public consecutiveMoves: Record<string, number> = {};

  private def: EnemyDef;

  constructor(def: EnemyDef, hpRoll: number, instanceIndex: number = 0) {
    this.def = def;
    this.id = `${def.enemy_id}_${instanceIndex}`;
    this.enemy_id = def.enemy_id;
    this.name = def.name;
    this.title = def.title || '';
    this.maxHp = hpRoll;
    this.currentHp = hpRoll;
  }

  public takeDamage(amount: number, damageType: string = 'NORMAL'): number {
    let unblocked = amount;
    if (damageType !== 'HP_LOSS') {
      if (this.block >= amount) {
        this.block -= amount;
        return 0;
      } else {
        unblocked = amount - this.block;
        this.block = 0;
      }
    }
    this.currentHp = Math.max(0, this.currentHp - unblocked);
    return unblocked;
  }

  public gainBlock(amount: number): void {
    this.block += amount;
  }

  public addBuff(id: string, stacks: number): void {
    this.buffs[id] = (this.buffs[id] || 0) + stacks;
    if (this.buffs[id] <= 0) {
      delete this.buffs[id];
    }
  }

  public removeBuff(id: string): void {
    delete this.buffs[id];
  }

  public isDead(): boolean {
    return this.currentHp <= 0;
  }

  public decideIntent(turnNumber: number, player: PlayerUnit, rng: any): void {
    if (this.isDead()) return;

    let selectedMoveKey = '';

    // Check Turn 1 fixed move
    if (turnNumber === 1 && this.def.ai_pattern.turn_1) {
      selectedMoveKey = this.def.ai_pattern.turn_1;
    }

    // Check conditional triggers
    if (!selectedMoveKey && this.def.ai_pattern.conditional) {
      for (const cond of this.def.ai_pattern.conditional) {
        if (cond.if_self_has_buff && this.buffs[cond.if_self_has_buff]) {
          selectedMoveKey = cond.force_move;
          break;
        }
        if (cond.if_hp_below_pct !== undefined) {
          const pct = (this.currentHp / this.maxHp) * 100;
          if (pct <= cond.if_hp_below_pct) {
            selectedMoveKey = cond.force_move;
            break;
          }
        }
      }
    }

    // Weighted random fallback
    if (!selectedMoveKey) {
      const weights = { ...this.def.ai_pattern.default_weights };
      // Filter out moves that exceed max_consecutive
      for (const [k, count] of Object.entries(this.consecutiveMoves)) {
        const moveDef = this.def.moves[k];
        if (moveDef && moveDef.max_consecutive && count >= moveDef.max_consecutive) {
          delete weights[k];
        }
      }

      const keys = Object.keys(weights);
      if (keys.length === 0) {
        keys.push(Object.keys(this.def.moves)[0]);
      }

      let totalWeight = 0;
      for (const k of keys) totalWeight += weights[k] || 1;
      let roll = (rng ? rng.next() : Math.random()) * totalWeight;

      for (const k of keys) {
        roll -= weights[k] || 1;
        if (roll <= 0) {
          selectedMoveKey = k;
          break;
        }
      }
      if (!selectedMoveKey) selectedMoveKey = keys[0];
    }

    this.currentMoveKey = selectedMoveKey;
    const move = this.def.moves[selectedMoveKey];
    if (!move) return;

    // Track consecutive
    for (const k of Object.keys(this.consecutiveMoves)) {
      if (k !== selectedMoveKey) this.consecutiveMoves[k] = 0;
    }
    this.consecutiveMoves[selectedMoveKey] = (this.consecutiveMoves[selectedMoveKey] || 0) + 1;

    // Calculate dynamic intent numbers
    const str = this.buffs.STRENGTH || 0;
    let calculatedDmg = move.base_damage ? Math.max(0, move.base_damage + str) : undefined;
    if (calculatedDmg && this.buffs.WEAK) {
      calculatedDmg = Math.floor(calculatedDmg * 0.75);
    }
    if (calculatedDmg && player && player.buffs.VULNERABLE) {
      calculatedDmg = Math.floor(calculatedDmg * 1.5);
    }

    this.intent = {
      type: (move.intent_type as any) || 'UNKNOWN',
      damage: calculatedDmg,
      hits: move.hits,
      block: move.block,
      description: move.description || ''
    };
  }

  public async executeMove(ctx: any): Promise<void> {
    if (this.isDead()) return;
    const move = this.def.moves[this.currentMoveKey];
    if (!move) return;

    for (const actionDef of move.actions) {
      await ctx.executeEnemyActionDef(actionDef, this);
    }
  }

  public onTurnEnd(): void {
    this.block = 0;

    // Oil burn DoT
    if (this.buffs.OIL_BURN && this.buffs.OIL_BURN > 0) {
      const burn = this.buffs.OIL_BURN;
      this.takeDamage(burn, 'HP_LOSS');
      this.buffs.OIL_BURN = Math.floor(burn / 2);
      if (this.buffs.OIL_BURN <= 0) delete this.buffs.OIL_BURN;
    }

    // Decrement temporary status
    ['VULNERABLE', 'WEAK', 'FRAIL'].forEach((id) => {
      if (this.buffs[id] && this.buffs[id] > 0) {
        this.buffs[id]--;
        if (this.buffs[id] <= 0) delete this.buffs[id];
      }
    });
  }
}
