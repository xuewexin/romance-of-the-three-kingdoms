import { ActionQueueManager } from '../core/ActionQueueManager.ts';
import { EventBus } from '../core/EventBus.ts';
import { DamagePipeline } from '../core/DamagePipeline.ts';
import { DeckManager } from './DeckManager.ts';
import { OrbManager } from './OrbManager.ts';
import { PlayerUnit, EnemyUnit } from './BattleEntities.ts';
import { CardData, CardActionDef } from '../types.ts';
import { DealDamageAction } from './actions/DealDamageAction.ts';
import { GainBlockAction } from './actions/GainBlockAction.ts';
import { DrawCardAction } from './actions/DrawCardAction.ts';
import { ApplyBuffAction } from './actions/ApplyBuffAction.ts';
import { DiscardCardAction } from './actions/DiscardCardAction.ts';

export type BattlePhase =
  | 'BATTLE_START'
  | 'PLAYER_TURN_START'
  | 'PLAYER_ACTION'
  | 'PLAYER_TURN_END'
  | 'ENEMY_TURN_START'
  | 'ENEMY_ACTION'
  | 'VICTORY'
  | 'DEFEAT';

export class BattleStateMachine {
  public phase: BattlePhase = 'BATTLE_START';
  public turnCount: number = 0;
  public playedTagsThisTurn: string[] = [];
  public cardsPlayedThisTurn: number = 0;
  public totalCardsPlayedThisBattle: number = 0;

  public player: PlayerUnit;
  public enemies: EnemyUnit[];
  public deckManager: DeckManager;
  public orbManager: OrbManager;
  public actionQueue: ActionQueueManager;
  public eventBus: EventBus;
  public damagePipeline: DamagePipeline;
  public relics: any[];
  public rng: any;
  public vfxManager: any;
  public soundEngine: any;
  public uiNotify: (msg: string) => void;
  public onBattleEnd: (victory: boolean) => void;

  constructor(
    player: PlayerUnit,
    enemies: EnemyUnit[],
    deckManager: DeckManager,
    orbManager: OrbManager,
    actionQueue: ActionQueueManager,
    eventBus: EventBus,
    damagePipeline: DamagePipeline,
    relics: any[],
    rng: any,
    vfxManager: any,
    soundEngine: any,
    uiNotify: (msg: string) => void,
    onBattleEnd: (victory: boolean) => void
  ) {
    this.player = player;
    this.enemies = enemies;
    this.deckManager = deckManager;
    this.orbManager = orbManager;
    this.actionQueue = actionQueue;
    this.eventBus = eventBus;
    this.damagePipeline = damagePipeline;
    this.relics = relics;
    this.rng = rng;
    this.vfxManager = vfxManager;
    this.soundEngine = soundEngine;
    this.uiNotify = uiNotify;
    this.onBattleEnd = onBattleEnd;
  }

  public isBattleOver(): boolean {
    return this.player.isDead() || this.areAllEnemiesDead();
  }

  public areAllEnemiesDead(): boolean {
    return this.enemies.every((e) => e.isDead());
  }

  public async startBattle(): Promise<void> {
    this.phase = 'BATTLE_START';
    this.turnCount = 0;
    this.totalCardsPlayedThisBattle = 0;

    // Relic triggers: ON_BATTLE_START
    await this.eventBus.emit('ON_BATTLE_START', {
      player: this.player,
      enemies: this.enemies,
      relics: this.relics
    });

    // Check specific starting relics
    for (const relic of this.relics) {
      if (relic.id === 'relic_trigram' && this.orbManager) {
        // 诸葛亮八卦盘
        const orbTypes: any[] = ['FIRE', 'MIST', 'THUNDER', 'WIND'];
        await this.orbManager.channel(this.rng.choice(orbTypes), this);
        this.player.addBuff('FOCUS', 1);
        this.uiNotify('【乾坤八卦盘】显圣：阵眼运转，运筹 +1！');
      } else if (relic.id === 'relic_bell' && this.player.id === 'GAN_NING') {
        // 甘宁百翎铃
        this.uiNotify('【百翎惊帆铃】回响：江东水匪迅捷出击！');
      }
    }

    // Decide initial enemy moves
    for (const enemy of this.enemies) {
      enemy.decideIntent(1, this.player, this.rng);
    }

    await this.startPlayerTurn();
  }

  public async startPlayerTurn(): Promise<void> {
    if (this.isBattleOver()) {
      this.checkBattleEnd();
      return;
    }

    this.turnCount++;
    this.phase = 'PLAYER_TURN_START';
    this.playedTagsThisTurn = [];
    this.cardsPlayedThisTurn = 0;

    // Reset Energy
    this.player.resetEnergy();

    // Red Hare relic bonus
    if (this.turnCount === 1) {
      const redHare = this.relics.find((r) => r.id === 'relic_red_hare');
      if (redHare) {
        this.player.gainEnergy(1);
        this.uiNotify('【赤兔马】嘶鸣：首回合军令 +1！');
      }
    }

    // Farming policy relic: +4 Block each turn
    const farming = this.relics.find((r) => r.id === 'relic_farming_policy');
    if (farming) {
      this.actionQueue.addToBottom(new GainBlockAction(this.player, 4), this);
    }

    // Straw boats buff check: draw cards if hit last turn
    if (this.player.buffs.STRAW_BOATS && this.player.buffs.STRAW_BOATS > 0) {
      const draws = this.player.buffs.STRAW_BOATS;
      this.actionQueue.addToBottom(new DrawCardAction(draws), this);
      delete this.player.buffs.STRAW_BOATS;
      this.uiNotify(`【草船借箭】得手：引得万箭，额外抽 ${draws} 张牌！`);
    }

    // Draw cards: 5 cards standard
    let drawCount = 5;
    if (this.turnCount === 1) {
      if (this.relics.some((r) => r.id === 'relic_bell')) {
        drawCount += 2;
        // add sleeve dart
        this.deckManager.addCardToHand({
          id: 'gn_sleeve_dart',
          name: '袖箭',
          character: 'GAN_NING',
          rarity: 'COMMON',
          type: 'ATTACK',
          cost: 0,
          target: 'SINGLE_ENEMY',
          exhaust: true,
          tags: ['DART', 'STRIKE'],
          description: '造成 4 点穿甲伤害。【消耗】。',
          base_stats: { damage: 4 },
          actions: [{ type: 'DEAL_DART_DAMAGE', value_ref: 'damage' }]
        });
      }
      if (this.relics.some((r) => r.id === 'relic_red_hare')) {
        drawCount += 2;
      }
    }

    this.actionQueue.addToBottom(new DrawCardAction(drawCount), this);

    await this.eventBus.emit('ON_TURN_START', {
      turn: this.turnCount,
      player: this.player
    });

    this.phase = 'PLAYER_ACTION';
  }

  public canPlayCard(card: CardData): boolean {
    if (this.phase !== 'PLAYER_ACTION') return false;
    if (this.actionQueue.getQueueLength() > 0) return false;
    return this.player.energy >= card.cost;
  }

  public async playCard(card: CardData, targetEnemy?: EnemyUnit): Promise<boolean> {
    if (!this.canPlayCard(card)) return false;

    // Spend energy
    this.player.spendEnergy(card.cost);
    this.cardsPlayedThisTurn++;
    this.totalCardsPlayedThisBattle++;

    // Track tags for combo chains
    if (card.provides_tag) {
      this.playedTagsThisTurn.push(card.provides_tag);
    }
    if (card.tags) {
      for (const t of card.tags) {
        this.playedTagsThisTurn.push(t);
      }
    }

    // Remove from hand
    if (card.exhaust) {
      this.deckManager.exhaustCard(card);
      if (this.vfxManager) this.vfxManager.playExhaustEffect();
    } else {
      this.deckManager.discardCard(card);
    }

    // Sound
    if (this.soundEngine) {
      this.soundEngine.playCardPlay();
    }

    // Relic triggers: 孟德新书 (every 10 cards)
    const mende = this.relics.find((r) => r.id === 'relic_mende_book');
    if (mende) {
      mende.counter = ((mende.counter || 0) + 1) % 10;
      if (mende.counter === 0) {
        this.uiNotify('【孟德新书】顿悟：下一次使用军令免除！');
        this.player.gainEnergy(1);
      }
    }

    // Relic triggers: 元戎连弩机 (every 3rd attack)
    if (card.type === 'ATTACK') {
      const crossbow = this.relics.find((r) => r.id === 'relic_zhuge_crossbow');
      if (crossbow) {
        crossbow.counter = ((crossbow.counter || 0) + 1) % 3;
        if (crossbow.counter === 0) {
          const alive = this.enemies.filter((e) => !e.isDead());
          if (alive.length > 0) {
            const tgt = this.rng.choice(alive);
            this.actionQueue.addToBottom(
              new DealDamageAction(this.player, tgt, 5, ['DART'], 'NORMAL'),
              this
            );
            this.uiNotify('【元戎连弩机】连发！');
          }
        }
      }
    }

    // Zhuge Liang: Orb trigger on skill played
    if (this.orbManager) {
      await this.orbManager.onCardPlayed(card, this);
    }

    // Execute card actions
    for (const actionDef of card.actions) {
      this.executeCardActionDef(actionDef, this.player, targetEnemy, card);
    }

    // Consume Blade Stance on BLADE attack
    if (card.tags && card.tags.includes('BLADE') && card.type === 'ATTACK') {
      if (card.id !== 'gy_crescent_slash') {
        // Blade stance applies to this attack, then clears
        this.player.removeBuff('BLADE_STANCE');
      }
    }

    await this.eventBus.emit('ON_CARD_PLAYED', { card, player: this.player });

    this.checkBattleEnd();
    return true;
  }

  public executeCardActionDef(
    def: CardActionDef,
    source: any,
    target?: EnemyUnit,
    cardContext?: CardData
  ): void {
    const stats = cardContext?.upgraded && cardContext.upgraded_stats
      ? { ...cardContext.base_stats, ...cardContext.upgraded_stats }
      : cardContext?.base_stats || {};

    const rawVal = def.value !== undefined ? def.value : (def.value_ref ? stats[def.value_ref] : 0);

    switch (def.type) {
      case 'DEAL_DAMAGE': {
        const hits = def.hits || 1;
        for (let i = 0; i < hits; i++) {
          if (target && !target.isDead()) {
            this.actionQueue.addToBottom(
              new DealDamageAction(source, target, rawVal, cardContext?.tags || [], 'NORMAL'),
              this
            );
          }
        }
        break;
      }

      case 'FATAL_DAMAGE': {
        if (target && !target.isDead()) {
          this.actionQueue.addToBottom(
            new DealDamageAction(
              source,
              target,
              rawVal,
              cardContext?.tags || [],
              'NORMAL',
              def.on_fatal_actions
            ),
            this
          );
        }
        break;
      }

      case 'DEAL_DAMAGE_ALL': {
        for (const enemy of this.enemies) {
          if (!enemy.isDead()) {
            this.actionQueue.addToBottom(
              new DealDamageAction(source, enemy, rawVal, cardContext?.tags || [], 'NORMAL'),
              this
            );
          }
        }
        break;
      }

      case 'GAIN_BLOCK': {
        this.actionQueue.addToBottom(new GainBlockAction(source, rawVal), this);
        break;
      }

      case 'DRAW_CARD': {
        this.actionQueue.addToBottom(new DrawCardAction(rawVal), this);
        break;
      }

      case 'GAIN_ENERGY': {
        source.gainEnergy(rawVal);
        this.uiNotify(`恢复 ${rawVal} 点军令！`);
        break;
      }

      case 'LOSE_HP': {
        source.loseHpDirectly(rawVal);
        if (this.vfxManager) this.vfxManager.spawnDamageText(source, rawVal, 'HP_LOSS');
        // Trigger blood rage if present
        if (source.buffs.BLOOD_RAGE) {
          source.addBuff('STRENGTH', source.buffs.BLOOD_RAGE);
          this.uiNotify(`【死战不退】触发：获得 ${source.buffs.BLOOD_RAGE} 点武力！`);
        }
        break;
      }

      case 'REMOVE_ALL_DEBUFFS': {
        ['VULNERABLE', 'WEAK', 'FRAIL', 'OIL_BURN'].forEach((id) => {
          delete source.buffs[id];
        });
        this.uiNotify('拔除体内一切煞气与负面状态！');
        break;
      }

      case 'APPLY_BUFF': {
        if (def.buff_id) {
          this.actionQueue.addToBottom(
            new ApplyBuffAction(source, def.buff_id, rawVal || def.value || 1),
            this
          );
        }
        break;
      }

      case 'APPLY_BUFF_ALL': {
        if (def.buff_id) {
          for (const enemy of this.enemies) {
            if (!enemy.isDead()) {
              this.actionQueue.addToBottom(
                new ApplyBuffAction(enemy, def.buff_id, rawVal || def.value || 1),
                this
              );
            }
          }
        }
        break;
      }

      case 'CONSUME_BLADE_STANCE_SLASH': {
        // 青龙偃月斩
        const stance = source.buffs.BLADE_STANCE || 0;
        const totalBonus = stance * 6; // 双倍倍率
        const damage = rawVal + totalBonus;
        source.removeBuff('BLADE_STANCE');
        if (target && !target.isDead()) {
          this.actionQueue.addToBottom(
            new DealDamageAction(source, target, damage, ['BLADE', 'STRIKE'], 'NORMAL'),
            this
          );
        }
        this.uiNotify(`【青龙偃月】倾泻 ${stance} 层刀势，重创敌将！`);
        break;
      }

      case 'DAMAGE_EQUAL_TO_BLOCK': {
        // 重甲冲锋
        const blk = source.block || 0;
        if (target && !target.isDead()) {
          this.actionQueue.addToBottom(
            new DealDamageAction(source, target, blk, ['STRIKE', 'DEFEND'], 'NORMAL'),
            this
          );
        }
        break;
      }

      case 'BLOOD_SCALED_DAMAGE': {
        // 血染征袍
        const bonus = (source.selfHpLossCountThisBattle || 0) * 4;
        const dmg = rawVal + bonus;
        if (target && !target.isDead()) {
          this.actionQueue.addToBottom(
            new DealDamageAction(source, target, dmg, ['STRIKE'], 'NORMAL'),
            this
          );
        }
        break;
      }

      case 'CHANNEL_ORB': {
        if (this.orbManager && def.buff_id) {
          this.orbManager.channel(def.buff_id as any, this);
        }
        break;
      }

      case 'CHANNEL_RANDOM_ORB': {
        if (this.orbManager) {
          const types: any[] = ['FIRE', 'MIST', 'THUNDER', 'WIND'];
          this.orbManager.channel(this.rng.choice(types), this);
        }
        break;
      }

      case 'EVOKE_ALL_ORBS': {
        if (this.orbManager) {
          this.orbManager.evokeAll(this);
        }
        break;
      }

      case 'EMPTY_HAND_KONG_CHENG': {
        if (this.deckManager.getHand().length === 0) {
          source.addBuff('KONG_CHENG', 1);
          this.uiNotify('【空城计】大成：琴声悠扬，抚平杀机（本回合受到伤害减免 50%）！');
        }
        break;
      }

      case 'COMBO_DEAL_DAMAGE_ALL': {
        // 火烧赤壁 (Combo: WIND)
        const hasWind = this.playedTagsThisTurn.includes('WIND');
        let dmg = rawVal;
        if (hasWind) {
          dmg *= 2;
          this.uiNotify('【东风助火】连环引发！业火蔓延全场！');
        }
        for (const enemy of this.enemies) {
          if (!enemy.isDead()) {
            this.actionQueue.addToBottom(
              new DealDamageAction(source, enemy, dmg, ['FIRE'], 'FIRE'),
              this
            );
            if (hasWind) {
              this.actionQueue.addToBottom(new ApplyBuffAction(enemy, 'OIL_BURN', 6), this);
            }
          }
        }
        break;
      }

      case 'SCRY': {
        // 观星
        const scryCount = rawVal || 4;
        const scried = this.deckManager.scry(scryCount);
        if (scried.length > 0) {
          this.uiNotify(`【观星】检视顶层 ${scried.length} 张牌`);
        }
        break;
      }

      case 'DEAL_DART_DAMAGE': {
        // 袖箭
        if (target && !target.isDead()) {
          this.actionQueue.addToBottom(
            new DealDamageAction(source, target, rawVal, ['DART', 'STRIKE'], 'NORMAL'),
            this
          );
        }
        break;
      }

      case 'ADD_CARD_TO_HAND': {
        if (def.card_id === 'gn_sleeve_dart') {
          const count = rawVal || def.count || 2;
          for (let i = 0; i < count; i++) {
            this.deckManager.addCardToHand({
              id: 'gn_sleeve_dart',
              name: '袖箭',
              character: 'GAN_NING',
              rarity: 'COMMON',
              type: 'ATTACK',
              cost: 0,
              target: 'SINGLE_ENEMY',
              exhaust: true,
              tags: ['DART', 'STRIKE'],
              description: '造成 4 点穿甲伤害。【消耗】。',
              base_stats: { damage: 4 },
              actions: [{ type: 'DEAL_DART_DAMAGE', value_ref: 'damage' }]
            });
          }
          this.uiNotify(`入手 ${count} 枚袖箭！`);
        }
        break;
      }

      case 'IGNITE_OIL_DAMAGE': {
        // 火箭引爆
        if (target && !target.isDead()) {
          this.actionQueue.addToBottom(
            new DealDamageAction(source, target, rawVal, ['FIRE', 'STRIKE'], 'FIRE'),
            this
          );

          const oil = target.buffs.OIL_BURN || 0;
          if (oil > 0) {
            // Trigger full oil burn instantly
            this.actionQueue.addToBottom(
              new DealDamageAction(source, target, oil, ['FIRE'], 'HP_LOSS'),
              this
            );
            // Spread 50% to other enemies
            const spread = Math.floor(oil / 2);
            if (spread > 0) {
              for (const other of this.enemies) {
                if (other !== target && !other.isDead()) {
                  this.actionQueue.addToBottom(
                    new ApplyBuffAction(other, 'OIL_BURN', spread),
                    this
                  );
                }
              }
            }
            target.removeBuff('OIL_BURN');
            this.uiNotify(`【引燃烈焰】爆破 ${oil} 点火油，火海蔓延！`);
          }
        }
        break;
      }

      case 'COMBO_REPEAT_ATTACK': {
        // 千刃狂澜
        const repeatCount = this.cardsPlayedThisTurn;
        for (let i = 0; i < repeatCount; i++) {
          if (target && !target.isDead()) {
            this.actionQueue.addToBottom(
              new DealDamageAction(source, target, rawVal, ['STRIKE'], 'NORMAL'),
              this
            );
          }
        }
        this.uiNotify(`【千刃狂澜】触发 ${repeatCount} 次连击斩！`);
        break;
      }

      case 'PLAYER_CHOOSE_DISCARD': {
        const hand = this.deckManager.getHand();
        const discardCount = Math.min(def.count || 2, hand.length);
        for (let i = 0; i < discardCount; i++) {
          const c = hand[0];
          if (c) {
            this.actionQueue.addToBottom(new DiscardCardAction(c), this);
          }
        }
        break;
      }
    }
  }

  public async executeEnemyActionDef(def: CardActionDef, enemy: EnemyUnit): Promise<void> {
    switch (def.type) {
      case 'DEAL_DAMAGE': {
        const dmg = def.value || 0;
        this.actionQueue.addToBottom(
          new DealDamageAction(enemy, this.player, dmg, [], 'NORMAL'),
          this
        );
        break;
      }
      case 'DEAL_MULTI_DAMAGE': {
        const dmg = def.value || 0;
        const hits = def.hits || 1;
        for (let i = 0; i < hits; i++) {
          this.actionQueue.addToBottom(
            new DealDamageAction(enemy, this.player, dmg, [], 'NORMAL'),
            this
          );
        }
        break;
      }
      case 'GAIN_BLOCK': {
        this.actionQueue.addToBottom(new GainBlockAction(enemy, def.value || 0), this);
        break;
      }
      case 'APPLY_BUFF': {
        if (def.buff_id) {
          this.actionQueue.addToBottom(
            new ApplyBuffAction(enemy, def.buff_id, def.stacks || 1),
            this
          );
        }
        break;
      }
      case 'APPLY_BUFF_PLAYER': {
        if (def.buff_id) {
          this.actionQueue.addToBottom(
            new ApplyBuffAction(this.player, def.buff_id, def.stacks || 1),
            this
          );
        }
        break;
      }
      case 'REMOVE_BUFF': {
        if (def.buff_id) {
          enemy.removeBuff(def.buff_id);
        }
        break;
      }
    }
  }

  public async endPlayerTurn(): Promise<void> {
    if (this.phase !== 'PLAYER_ACTION') return;
    this.phase = 'PLAYER_TURN_END';

    // 1. Trigger Zhuge Liang's orb passives
    if (this.orbManager) {
      await this.orbManager.triggerPassives(this);
    }

    // 2. Trigger ON_TURN_END hook
    await this.eventBus.emit('ON_TURN_END', {
      player: this.player,
      turn: this.turnCount
    });

    // 3. Player end of turn ticks
    this.player.onTurnEnd();

    // 4. Discard hand
    this.deckManager.discardHand();

    if (this.checkBattleEnd()) return;

    // Transition to enemy turns
    await this.runEnemyTurn();
  }

  public async runEnemyTurn(): Promise<void> {
    this.phase = 'ENEMY_TURN_START';

    // Enemy action execution
    this.phase = 'ENEMY_ACTION';
    for (const enemy of this.enemies) {
      if (!enemy.isDead()) {
        await enemy.executeMove(this);
      }
    }

    // Wait until all enemy actions finish
    while (this.actionQueue.getQueueLength() > 0) {
      await new Promise((res) => setTimeout(res, 100));
    }

    if (this.checkBattleEnd()) return;

    // Enemy turn end status ticks
    for (const enemy of this.enemies) {
      if (!enemy.isDead()) {
        enemy.onTurnEnd();
      }
    }

    if (this.checkBattleEnd()) return;

    // Decide new intents for next turn
    for (const enemy of this.enemies) {
      if (!enemy.isDead()) {
        enemy.decideIntent(this.turnCount + 1, this.player, this.rng);
      }
    }

    // Back to player turn
    await this.startPlayerTurn();
  }

  public checkBattleEnd(): boolean {
    if (this.player.isDead()) {
      this.phase = 'DEFEAT';
      if (this.soundEngine) this.soundEngine.playDefeat();
      this.onBattleEnd(false);
      return true;
    }

    if (this.areAllEnemiesDead()) {
      this.phase = 'VICTORY';
      if (this.soundEngine) this.soundEngine.playVictory();

      // Guan Yu Starter Relic: 武圣战髯 (Heal 6 HP at end of battle)
      const beard = this.relics.find((r) => r.id === 'relic_beard');
      if (beard) {
        this.player.currentHp = Math.min(this.player.maxHp, this.player.currentHp + 6);
        this.uiNotify('【武圣战髯】抚须：战后气血平复，恢复 6 点生命！');
      }

      this.onBattleEnd(true);
      return true;
    }

    return false;
  }

  public onQueueEmpty(): void {
    // Called when the action queue finishes processing
  }
}
