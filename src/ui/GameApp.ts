import { CharacterId, CardData, RelicDef, MapNode, EnemyDef } from '../types.ts';
import { RunState } from '../map/RunState.ts';
import { ActionQueueManager } from '../core/ActionQueueManager.ts';
import { EventBus } from '../core/EventBus.ts';
import { DamagePipeline } from '../core/DamagePipeline.ts';
import { DeckManager } from '../battle/DeckManager.ts';
import { OrbManager } from '../battle/OrbManager.ts';
import { PlayerUnit, EnemyUnit } from '../battle/BattleEntities.ts';
import { BattleStateMachine } from '../battle/BattleStateMachine.ts';
import { SoundEngine } from '../audio/SoundEngine.ts';
import { VfxManager } from '../vfx/VfxManager.ts';
import { HandCardLayout } from './HandCardLayout.ts';
import { BezierTargetingArrow } from './BezierTargetingArrow.ts';
import { IntentIndicator } from './IntentIndicator.ts';
import { GameIcons } from './GameIcons.ts';
import { ACT_LORE, PROLOGUE_DIALOGUE, BOSS_DIALOGUES } from '../story/LoreDialogues.ts';
import { SvgCharacters } from '../vfx/SvgCharacters.ts';
import { SvgBackgrounds } from '../vfx/SvgBackgrounds.ts';

// Data imports
import guanyuCards from '../../data/cards/guanyu.json';
import zhugeliangCards from '../../data/cards/zhugeliang.json';
import ganningCards from '../../data/cards/ganning.json';
import relicsData from '../../data/relics/relics.json';
import enemiesAct1 from '../../data/enemies/enemies_act1.json';
import enemiesAct2 from '../../data/enemies/enemies_act2.json';
import enemiesAct3 from '../../data/enemies/enemies_act3.json';
import enemiesAct4 from '../../data/enemies/enemies_act4.json';
import eventsData from '../../data/events/events.json';

export type GameScreen =
  | 'TITLE'
  | 'PROLOGUE'
  | 'MAP'
  | 'BATTLE'
  | 'REWARD'
  | 'REST'
  | 'SHOP'
  | 'EVENT'
  | 'TREASURE'
  | 'VICTORY'
  | 'DEFEAT';

export class GameApp {
  public screen: GameScreen = 'TITLE';
  public runState: RunState;
  public soundEngine: SoundEngine;
  public vfxManager: VfxManager;
  public targetingArrow: BezierTargetingArrow;

  // Battle session
  public currentBattle: BattleStateMachine | null = null;
  public draggingCard: CardData | null = null;
  public selectedCard: CardData | null = null;
  public hoveredCardIndex: number = -1;

  // Reward session
  public rewardCards: CardData[] = [];
  public rewardGold: number = 0;
  public rewardRelic: RelicDef | null = null;

  // Event session
  public currentEvent: any = null;

  // Shop session
  public shopCards: Array<{ card: CardData; price: number }> = [];
  public shopRelics: Array<{ relic: RelicDef; price: number }> = [];

  // Notification toast
  public toasts: string[] = [];

  constructor() {
    this.soundEngine = new SoundEngine();
    const canvas = document.getElementById('vfx-canvas') as HTMLCanvasElement;
    this.vfxManager = new VfxManager(canvas);
    this.targetingArrow = new BezierTargetingArrow();
    this.runState = new RunState('GUAN_YU');

    this.initGlobalInputHandlers();
    this.render();
  }

  public notify(msg: string): void {
    this.toasts.push(msg);
    this.renderToast();
    setTimeout(() => {
      this.toasts.shift();
      this.renderToast();
    }, 3200);
  }

  private renderToast(): void {
    const el = document.getElementById('toast-container');
    if (!el) return;
    el.innerHTML = this.toasts.map((t) => `<div class="toast-message">${t}</div>`).join('');
  }

  public startNewGame(charId: CharacterId): void {
    this.runState = new RunState(charId);

    let cardPool: CardData[] = [];
    if (charId === 'GUAN_YU') {
      cardPool = (guanyuCards as CardData[]);
      this.runState.deck = [
        ...this.getCardCopies(cardPool, 'gy_strike', 4),
        ...this.getCardCopies(cardPool, 'gy_defend', 4),
        ...this.getCardCopies(cardPool, 'gy_drag_blade', 1),
        ...this.getCardCopies(cardPool, 'gy_warm_wine_slash', 1)
      ];
      this.runState.addRelic((relicsData as RelicDef[]).find((r) => r.id === 'relic_beard')!);
    } else if (charId === 'ZHUGE_LIANG') {
      cardPool = (zhugeliangCards as CardData[]);
      this.runState.deck = [
        ...this.getCardCopies(cardPool, 'zgl_strike', 4),
        ...this.getCardCopies(cardPool, 'zgl_defend', 4),
        ...this.getCardCopies(cardPool, 'zgl_eight_trigrams', 1),
        ...this.getCardCopies(cardPool, 'zgl_east_wind', 1)
      ];
      this.runState.addRelic((relicsData as RelicDef[]).find((r) => r.id === 'relic_trigram')!);
    } else if (charId === 'GAN_NING') {
      cardPool = (ganningCards as CardData[]);
      this.runState.deck = [
        ...this.getCardCopies(cardPool, 'gn_strike', 4),
        ...this.getCardCopies(cardPool, 'gn_defend', 4),
        ...this.getCardCopies(cardPool, 'gn_feather_bell', 1),
        ...this.getCardCopies(cardPool, 'gn_oil_splash', 1)
      ];
      this.runState.addRelic((relicsData as RelicDef[]).find((r) => r.id === 'relic_bell')!);
    }

    this.screen = 'PROLOGUE';
    this.render();
  }

  private getCardCopies(pool: CardData[], id: string, count: number): CardData[] {
    const found = pool.find((c) => c.id === id);
    if (!found) return [];
    return Array.from({ length: count }, () => JSON.parse(JSON.stringify(found)));
  }

  public chooseNeowBlessing(type: 'GOLD' | 'HP' | 'RELIC' | 'CARD'): void {
    if (type === 'GOLD') {
      this.runState.addGold(100);
      this.notify('南华仙书赐福：获赠 100 铢军饷！');
    } else if (type === 'HP') {
      this.runState.modifyMaxHp(12);
      this.notify('南华仙书赐福：气血大增，最大生命 +12！');
    } else if (type === 'RELIC') {
      const rareRelic = (relicsData as RelicDef[]).find((r) => r.id === 'relic_red_hare');
      if (rareRelic) this.runState.addRelic(rareRelic);
      this.notify('南华仙书赐福：赠予宝马【赤兔】！');
    } else if (type === 'CARD') {
      if (this.runState.deck.length > 0) {
        this.runState.upgradeCard(this.runState.deck[0]);
        this.notify(`南华仙书赐福：锻造强化了《${this.runState.deck[0].name}》！`);
      }
    }

    this.screen = 'MAP';
    this.render();
  }

  public enterNode(node: MapNode): void {
    const target = this.runState.advanceToNode(node.id);
    if (!target) return;

    this.soundEngine.playCardPlay();

    switch (target.type) {
      case 'BATTLE':
        this.startBattle(false);
        break;
      case 'ELITE':
        this.startBattle(true);
        break;
      case 'BOSS':
        this.startBossBattle();
        break;
      case 'REST':
        this.screen = 'REST';
        this.render();
        break;
      case 'SHOP':
        this.openShop();
        break;
      case 'EVENT':
        this.openEvent();
        break;
      case 'TREASURE':
        this.openTreasure();
        break;
    }
  }

  public getEnemiesPoolForAct(): EnemyDef[] {
    switch (this.runState.act) {
      case 1:
        return (enemiesAct1 as unknown as EnemyDef[]);
      case 2:
        return (enemiesAct2 as unknown as EnemyDef[]);
      case 3:
        return (enemiesAct3 as unknown as EnemyDef[]);
      case 4:
      default:
        return (enemiesAct4 as unknown as EnemyDef[]);
    }
  }

  public startBattle(isElite: boolean): void {
    const pool = this.getEnemiesPoolForAct();
    let enemyDefs: EnemyDef[] = [];

    if (isElite) {
      const elite = pool.find((e) => e.enemy_id.startsWith('elite_'));
      if (elite) enemyDefs = [elite];
    } else {
      const regulars = pool.filter((e) => e.enemy_id.startsWith('enemy_'));
      if (regulars.length > 0) {
        const count = this.runState.rng.range(1, Math.min(2, regulars.length));
        const picked = this.runState.rng.shuffle(regulars).slice(0, count);
        enemyDefs = picked;
      }
    }

    if (enemyDefs.length === 0) {
      enemyDefs = [pool[0]];
    }

    this.initBattleSession(enemyDefs);
  }

  public startBossBattle(): void {
    const pool = this.getEnemiesPoolForAct();
    const boss = pool.find((e) => e.enemy_id.startsWith('boss_')) || pool[pool.length - 1];
    this.initBattleSession([boss]);
  }

  private initBattleSession(enemyDefs: EnemyDef[]): void {
    this.selectedCard = null;
    this.draggingCard = null;

    const playerUnit = new PlayerUnit(
      this.runState.characterId,
      this.runState.characterName,
      this.runState.characterTitle,
      this.runState.maxHp,
      this.runState.currentHp
    );

    const enemyUnits = enemyDefs.map((def, idx) => {
      const hp = this.runState.rng.range(def.max_hp_range[0], def.max_hp_range[1]);
      return new EnemyUnit(def, hp, idx);
    });

    const deckManager = new DeckManager(this.runState.rng);
    deckManager.initialize(this.runState.deck);

    const orbManager =
      this.runState.characterId === 'ZHUGE_LIANG' ? new OrbManager(3) : (null as any);

    const actionQueue = new ActionQueueManager();
    const eventBus = new EventBus();
    const damagePipeline = new DamagePipeline();

    this.currentBattle = new BattleStateMachine(
      playerUnit,
      enemyUnits,
      deckManager,
      orbManager,
      actionQueue,
      eventBus,
      damagePipeline,
      this.runState.relics,
      this.runState.rng,
      this.vfxManager,
      this.soundEngine,
      (msg) => this.notify(msg),
      (victory) => this.handleBattleEnded(victory)
    );

    this.screen = 'BATTLE';
    this.render();
    this.currentBattle.startBattle().then(() => this.render());
  }

  private handleBattleEnded(victory: boolean): void {
    if (!this.currentBattle) return;

    this.runState.currentHp = Math.min(
      this.runState.maxHp,
      Math.max(0, this.currentBattle.player.currentHp)
    );

    if (victory) {
      const isBoss = this.currentBattle.enemies.some((e) => e.enemy_id.startsWith('boss_'));
      const isElite = this.currentBattle.enemies.some((e) => e.enemy_id.startsWith('elite_'));

      const bossEnemy = this.currentBattle.enemies.find((e) => e.enemy_id.startsWith('boss_'));
      if (bossEnemy && BOSS_DIALOGUES[bossEnemy.enemy_id]) {
        const dialog = BOSS_DIALOGUES[bossEnemy.enemy_id].postVictory;
        if (dialog.length > 0) {
          this.notify(`${dialog[0].speaker}：“${dialog[0].text}”`);
        }
      }

      this.rewardGold = this.runState.rng.range(15, 25) + (isElite ? 25 : 0) + (isBoss ? 50 : 0);
      this.runState.addGold(this.rewardGold);

      let cardPool: CardData[] = [];
      if (this.runState.characterId === 'GUAN_YU') cardPool = guanyuCards as CardData[];
      else if (this.runState.characterId === 'ZHUGE_LIANG') cardPool = zhugeliangCards as CardData[];
      else cardPool = ganningCards as CardData[];

      this.rewardCards = this.runState.rng
        .shuffle(cardPool.filter((c) => c.rarity !== 'STATUS' && c.rarity !== 'CURSE'))
        .slice(0, 3)
        .map((c) => JSON.parse(JSON.stringify(c)));

      this.rewardRelic = null;
      if (isElite || isBoss) {
        const availableRelics = (relicsData as RelicDef[]).filter(
          (r) => !this.runState.relics.some((existing) => existing.id === r.id)
        );
        if (availableRelics.length > 0) {
          this.rewardRelic = this.runState.rng.choice(availableRelics);
        }
      }

      if (isBoss) {
        if (this.runState.act >= 4) {
          this.screen = 'VICTORY';
          this.render();
          return;
        } else {
          this.runState.nextAct();
          this.notify(`斩断第 ${this.runState.act - 1} 幕魔障，向新战区进发！`);
        }
      }

      this.screen = 'REWARD';
      this.render();
    } else {
      this.screen = 'DEFEAT';
      this.render();
    }
  }

  // --- Card Execution Handling (Click & Drag unified) ---
  public tryPlayCard(card: CardData, targetEnemy?: EnemyUnit): void {
    if (!this.currentBattle) return;

    if (!this.currentBattle.canPlayCard(card)) {
      this.soundEngine.playBlock();
      if (this.currentBattle.player.energy < card.cost) {
        this.notify('军令不足！无法使用此牌');
      } else {
        this.notify('行动结算中，请稍候...');
      }
      return;
    }

    const aliveEnemies = this.currentBattle.enemies.filter((e) => !e.isDead());

    if (card.target === 'SINGLE_ENEMY') {
      if (targetEnemy) {
        this.executeCardOnTarget(card, targetEnemy);
      } else if (aliveEnemies.length === 1) {
        // Auto-target the only alive enemy!
        this.executeCardOnTarget(card, aliveEnemies[0]);
      } else {
        // Multiple enemies: select this card to choose target
        this.selectedCard = card;
        this.notify(`已选择《${card.name}》，请点击指定攻击目标！`);
        this.render();
      }
    } else {
      // Self or All enemies cards trigger immediately
      this.executeCardOnTarget(card);
    }
  }

  private executeCardOnTarget(card: CardData, target?: EnemyUnit): void {
    if (!this.currentBattle) return;
    this.selectedCard = null;
    this.draggingCard = null;
    this.targetingArrow.hide();

    this.currentBattle.playCard(card, target).then(() => {
      this.render();
    });
  }

  public openRestSite(): void {
    this.screen = 'REST';
    this.render();
  }

  public doRestHeal(): void {
    const healAmount = Math.floor(this.runState.maxHp * 0.3);
    const healed = this.runState.heal(healAmount);
    this.soundEngine.playVictory();
    this.notify(`在军帐中整军休憩，恢复了 ${healed} 点生命值！`);
    this.screen = 'MAP';
    this.render();
  }

  public doRestForge(cardId: string): void {
    const card = this.runState.deck.find((c) => c.id === cardId && !c.upgraded);
    if (card) {
      this.runState.upgradeCard(card);
      this.soundEngine.playHeavyHit();
      this.notify(`军械司炉火淬炼，成功将《${card.name}》强化！`);
    }
    this.screen = 'MAP';
    this.render();
  }

  public openShop(): void {
    let cardPool: CardData[] = [];
    if (this.runState.characterId === 'GUAN_YU') cardPool = guanyuCards as CardData[];
    else if (this.runState.characterId === 'ZHUGE_LIANG') cardPool = zhugeliangCards as CardData[];
    else cardPool = ganningCards as CardData[];

    this.shopCards = this.runState.rng.shuffle(cardPool).slice(0, 4).map((c) => ({
      card: JSON.parse(JSON.stringify(c)),
      price: c.rarity === 'RARE' ? 120 : c.rarity === 'UNCOMMON' ? 75 : 45
    }));

    const availableRelics = (relicsData as RelicDef[]).filter(
      (r) => !this.runState.relics.some((existing) => existing.id === r.id)
    );
    this.shopRelics = this.runState.rng.shuffle(availableRelics).slice(0, 2).map((r) => ({
      relic: r,
      price: 150
    }));

    this.screen = 'SHOP';
    this.render();
  }

  public buyCard(index: number): void {
    const item = this.shopCards[index];
    if (!item) return;
    if (this.runState.spendGold(item.price)) {
      this.runState.addCard(item.card);
      this.shopCards.splice(index, 1);
      this.soundEngine.playCardDraw();
      this.notify(`从西域行商处购得《${item.card.name}》！`);
      this.render();
    } else {
      this.notify('军资铜钱不足！');
    }
  }

  public buyRelic(index: number): void {
    const item = this.shopRelics[index];
    if (!item) return;
    if (this.runState.spendGold(item.price)) {
      this.runState.addRelic(item.relic);
      this.shopRelics.splice(index, 1);
      this.soundEngine.playVictory();
      this.notify(`佩戴兵符【${item.relic.name}】！`);
      this.render();
    } else {
      this.notify('军资铜钱不足！');
    }
  }

  public removeCardFromShop(cardId: string): void {
    if (this.runState.spendGold(50)) {
      if (this.runState.removeCard(cardId)) {
        this.soundEngine.playSlash();
        this.notify('精简军备，永久移除了 1 张卡牌！');
        this.render();
      }
    } else {
      this.notify('铜钱不足 50 铢！');
    }
  }

  public openEvent(): void {
    const events = eventsData as any[];
    this.currentEvent = this.runState.rng.choice(events);
    this.screen = 'EVENT';
    this.render();
  }

  public handleEventChoice(optionId: string): void {
    if (!this.currentEvent) return;

    if (this.currentEvent.id === 'event_bone_scrape') {
      if (optionId === 'opt_scrape') {
        const dmg = Math.floor(this.runState.currentHp * 0.15);
        this.runState.currentHp = Math.max(1, this.runState.currentHp - dmg);
        this.runState.modifyMaxHp(8);
        this.runState.addGold(100);
        this.notify(`神医刮骨：失去 ${dmg} 生命，最大生命 +8，获赠 100 铜钱！`);
      } else {
        const heal = Math.floor(this.runState.maxHp * 0.3);
        this.runState.heal(heal);
        this.notify(`神医敷药：调理气血，回复 ${heal} 点生命！`);
      }
    } else if (this.currentEvent.id === 'event_straw_boats') {
      if (optionId === 'opt_drum_arrows') {
        this.runState.currentHp = Math.max(1, this.runState.currentHp - 10);
        const relic = (relicsData as RelicDef[]).find((r) => r.id === 'relic_zhuge_crossbow');
        if (relic) this.runState.addRelic(relic);
        this.notify('满载羽箭：获得兵符【元戎连弩机】！');
      } else {
        this.runState.addGold(50);
        this.notify('顺流撤离：打捞辎重，获得 50 铜钱！');
      }
    } else if (this.currentEvent.id === 'event_three_visits') {
      if (optionId === 'opt_wait_respect') {
        this.runState.modifyMaxHp(5);
        this.notify('卧龙点拨：感悟大道，全军士气大振，最大生命 +5！');
      } else {
        this.runState.spendGold(40);
        const card = (zhugeliangCards as CardData[]).find((c) => c.id === 'zgl_qimen_dunjia');
        if (card) this.runState.addCard(card);
        this.notify('奉礼求策：获赠强力兵法《奇门遁甲》！');
      }
    } else if (this.currentEvent.id === 'event_warm_wine') {
      if (optionId === 'opt_kill_instant') {
        const relic = (relicsData as RelicDef[]).find((r) => r.id === 'relic_warm_wine_goblet');
        if (relic) this.runState.addRelic(relic);
        this.runState.addGold(80);
        this.notify('温酒斩将：名震诸侯！获得【温酒金樽】与 80 铜钱！');
      } else {
        this.runState.heal(20);
        this.runState.addGold(50);
        this.notify('饮酒豪情：气血沸腾，恢复 20 生命与 50 铜钱！');
      }
    }

    this.screen = 'MAP';
    this.render();
  }

  public openTreasure(): void {
    const availableRelics = (relicsData as RelicDef[]).filter(
      (r) => !this.runState.relics.some((existing) => existing.id === r.id)
    );
    if (availableRelics.length > 0) {
      const picked = this.runState.rng.choice(availableRelics);
      this.runState.addRelic(picked);
      this.soundEngine.playVictory();
      this.notify(`开启军资宝库封印匣，获得兵符【${picked.name}】！`);
    }
    this.screen = 'MAP';
    this.render();
  }

  private initGlobalInputHandlers(): void {
    window.addEventListener('mousemove', (e) => {
      const activeCard = this.draggingCard || this.selectedCard;
      if (activeCard && this.screen === 'BATTLE') {
        const startX = window.innerWidth / 2;
        const startY = window.innerHeight - 120;
        this.targetingArrow.update(startX, startY, e.clientX, e.clientY);
      }
    });

    window.addEventListener('mouseup', (e) => {
      if (this.draggingCard && this.screen === 'BATTLE') {
        const card = this.draggingCard;
        this.draggingCard = null;
        this.targetingArrow.hide();

        // Check if dropped onto any enemy
        let targetEnemy: EnemyUnit | undefined = undefined;
        if (this.currentBattle) {
          for (const enemy of this.currentBattle.enemies) {
            if (enemy.isDead()) continue;
            const el = document.getElementById(`unit-${enemy.id}`);
            if (el) {
              const rect = el.getBoundingClientRect();
              if (
                e.clientX >= rect.left &&
                e.clientX <= rect.right &&
                e.clientY >= rect.top &&
                e.clientY <= rect.bottom
              ) {
                targetEnemy = enemy;
                break;
              }
            }
          }
        }

        // Only play if released above card tray (clientY < window.innerHeight * 0.75)
        if (e.clientY < window.innerHeight * 0.75) {
          this.tryPlayCard(card, targetEnemy);
        } else {
          this.render();
        }
      }
    });
  }

  public render(): void {
    const root = document.getElementById('game-app');
    if (!root) return;

    let html = `
      <header class="game-header">
        <div class="brand-plaque">
          <div class="dragon-crest">${GameIcons.DRAGON_SEAL}</div>
          <div class="brand-title">乱世残卷 · 建安魔障</div>
        </div>
        <div class="military-stats-board">
          <div class="hero-hp-vessel">
            <div class="vessel-badge">${GameIcons.HP_HEART}</div>
            <div class="vessel-info">
              <span class="vessel-label">气血</span>
              <span class="vessel-val"><b>${this.runState.currentHp}</b> / ${this.runState.maxHp}</span>
            </div>
          </div>
          <div class="military-treasury-tally">
            <div class="tally-badge">${GameIcons.COIN}</div>
            <div class="tally-info">
              <span class="tally-label">军饷</span>
              <span class="tally-val"><b>${this.runState.gold}</b> 铢</span>
            </div>
          </div>
          <div class="campaign-map-tablet">
            <div class="tablet-badge">${GameIcons.MAP_SCROLL}</div>
            <div class="tablet-info">
              <span class="tablet-label">战役</span>
              <span class="tablet-val">第 <b>${this.runState.act}</b> 幕 · <b>${this.runState.currentFloor + 1}</b> 层</span>
            </div>
          </div>
        </div>
        <div class="relics-bar">
          ${this.runState.relics
            .map(
              (r) => `
            <div class="relic-item" title="${r.name}：${r.description}&#10;“${r.flavor}”">
              <span class="relic-icon">${GameIcons.RELIC_SEAL}</span>
              <span class="relic-name">${r.name}</span>
            </div>
          `
            )
            .join('')}
        </div>
      </header>
      <main class="game-content">
    `;

    switch (this.screen) {
      case 'TITLE':
        html += this.renderTitleScreen();
        break;
      case 'PROLOGUE':
        html += this.renderPrologueScreen();
        break;
      case 'MAP':
        html += this.renderMapScreen();
        break;
      case 'BATTLE':
        html += this.renderBattleScreen();
        break;
      case 'REWARD':
        html += this.renderRewardScreen();
        break;
      case 'REST':
        html += this.renderRestScreen();
        break;
      case 'SHOP':
        html += this.renderShopScreen();
        break;
      case 'EVENT':
        html += this.renderEventScreen();
        break;
      case 'VICTORY':
        html += this.renderVictoryScreen();
        break;
      case 'DEFEAT':
        html += this.renderDefeatScreen();
        break;
    }

    html += `</main><div id="toast-container"></div>`;
    root.innerHTML = html;
    this.bindEvents();
  }

  private renderTitleScreen(): string {
    return `
      <div class="title-screen-container">
        ${SvgBackgrounds.getActBackground(1)}
        <div class="title-screen ink-card">
          <h1 class="main-title">乱世残卷：建安魔障</h1>
          <p class="subtitle">三国题材卡牌构筑肉鸽（DBG Roguelike）</p>
          <p class="tagline">“熹平九鼎崩，天下英雄皆入魔障。持南华仙书，重定乾坤之序！”</p>
          
          <div class="character-select">
            <div class="char-card active" data-char="GUAN_YU">
              <div class="char-avatar-box">${SvgCharacters.renderUnitVisual('GUAN_YU', '关羽')}</div>
              <h3>关羽 · 武圣</h3>
              <p class="char-desc">陷阵狂刀 · 刀势蓄力与刮骨血怒</p>
              <div class="char-stats">气血: 80 | 兵符: 武圣战髯</div>
              <button class="btn-primary start-btn" data-char="GUAN_YU">出征</button>
            </div>

            <div class="char-card" data-char="ZHUGE_LIANG">
              <div class="char-avatar-box">${SvgCharacters.renderUnitVisual('ZHUGE_LIANG', '诸葛亮')}</div>
              <h3>诸葛亮 · 卧龙</h3>
              <p class="char-desc">奇门八阵 · 四象阵眼与借东风连环</p>
              <div class="char-stats">气血: 70 | 兵符: 乾坤八卦盘</div>
              <button class="btn-primary start-btn" data-char="ZHUGE_LIANG">出征</button>
            </div>

            <div class="char-card" data-char="GAN_NING">
              <div class="char-avatar-box">${SvgCharacters.renderUnitVisual('GAN_NING', '甘宁')}</div>
              <h3>甘宁 · 锦帆</h3>
              <p class="char-desc">火油覆阵 · 0费袖箭与百骑劫营</p>
              <div class="char-stats">气血: 72 | 兵符: 百翎惊帆铃</div>
              <button class="btn-primary start-btn" data-char="GAN_NING">出征</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  private renderPrologueScreen(): string {
    const act = ACT_LORE[this.runState.act];
    return `
      <div class="prologue-screen-container">
        ${SvgBackgrounds.getActBackground(this.runState.act)}
        <div class="prologue-screen ink-card">
          <h2>${act.title}</h2>
          <div class="lore-box">
            ${PROLOGUE_DIALOGUE.map(
              (d) => `<p><b style="color: ${d.color}">${d.speaker}</b>: ${d.text}</p>`
            ).join('')}
          </div>
          <p class="act-intro">${act.introText}</p>
          
          <div class="neow-blessings">
            <h3>选择南华仙书赐福：</h3>
            <div class="blessing-buttons">
              <button class="btn-secondary blessing-btn" data-blessing="GOLD">${GameIcons.BLESSING_GOLD} 获得 100 铢军饷</button>
              <button class="btn-secondary blessing-btn" data-blessing="HP">${GameIcons.HP_HEART} 最大生命值 +12</button>
              <button class="btn-secondary blessing-btn" data-blessing="RELIC">${GameIcons.BLESSING_HORSE} 获赠传奇兵符【赤兔马】</button>
              <button class="btn-secondary blessing-btn" data-blessing="CARD">${GameIcons.SWORD_ATTACK} 随机锻造强化 1 张初始卡牌</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  private renderMapScreen(): string {
    const act = ACT_LORE[this.runState.act];
    const nodes = this.runState.mapNodes;
    const maxFloor = 14;

    let gridHtml = '';
    for (let floor = maxFloor; floor >= 0; floor--) {
      const floorNodes = nodes.filter((n) => n.floor === floor);
      gridHtml += `
        <div class="map-row" data-floor="${floor}">
          <span class="floor-label">第 ${floor + 1} 层</span>
          <div class="nodes-container">
            ${floorNodes
              .map((node) => {
                const nodeIcon = GameIcons.getMapNodeSvg(node.type);
                const statusClass = node.visited
                  ? 'visited'
                  : node.available
                  ? 'available'
                  : 'locked';
                return `
                <div class="map-node ${statusClass} node-type-${node.type.toLowerCase()}" 
                     data-id="${node.id}" title="${node.type}">
                  <span class="node-icon">${nodeIcon}</span>
                </div>
              `;
              })
              .join('')}
          </div>
        </div>
      `;
    }

    return `
      <div class="map-screen-container">
        ${SvgBackgrounds.getActBackground(this.runState.act)}
        <div class="map-screen">
          <div class="map-header">
            <h2>${act.title} · ${act.subtitle}</h2>
            <div class="legend">
              <span class="legend-item">${GameIcons.NODE_ENEMY} 前哨战</span>
              <span class="legend-item">${GameIcons.NODE_ELITE} 猛将营</span>
              <span class="legend-item">${GameIcons.NODE_EVENT} 奇遇</span>
              <span class="legend-item">${GameIcons.NODE_SHOP} 西域行商</span>
              <span class="legend-item">${GameIcons.NODE_REST} 大军营帐</span>
              <span class="legend-item">${GameIcons.NODE_TREASURE} 军资宝库</span>
              <span class="legend-item">${GameIcons.NODE_BOSS} 守关大将</span>
            </div>
          </div>
          <div class="map-scroll-area">
            ${gridHtml}
          </div>
        </div>
      </div>
    `;
  }

  private renderBattleScreen(): string {
    if (!this.currentBattle) return '';

    const player = this.currentBattle.player;
    const enemies = this.currentBattle.enemies;
    const hand = this.currentBattle.deckManager.getHand();
    const orbs = this.currentBattle.orbManager ? this.currentBattle.orbManager.getOrbs() : [];
    const maxSlots = this.currentBattle.orbManager
      ? this.currentBattle.orbManager.getMaxSlots()
      : 0;

    const transforms = HandCardLayout.calculateTransforms(hand.length, -1);

    return `
      <div class="battle-screen">
        <!-- Authentic Three Kingdoms Scenery Background -->
        ${SvgBackgrounds.getActBackground(this.runState.act)}

        <!-- Battlefield -->
        <div class="battlefield">
          <!-- Player Unit -->
          <div class="unit-wrapper player-side" id="unit-player">
            <!-- Zhuge Liang Orbs -->
            ${
              maxSlots > 0
                ? `
              <div class="orb-container">
                ${Array.from({ length: maxSlots })
                  .map((_, i) => {
                    const orb = orbs[i];
                    return `
                    <div class="orb-slot ${orb ? `active orb-${orb.type.toLowerCase()}` : 'empty'}" 
                         title="${orb ? `${orb.name}：${orb.description}` : '空阵眼槽位'}">
                      ${orb ? `<span class="orb-symbol">${
                        orb.type === 'FIRE'
                          ? GameIcons.ELEMENT_FIRE
                          : orb.type === 'MIST'
                          ? GameIcons.ELEMENT_MIST
                          : orb.type === 'THUNDER'
                          ? GameIcons.ELEMENT_THUNDER
                          : GameIcons.ELEMENT_WIND
                      }</span>` : ''}
                    </div>
                  `;
                  })
                  .join('')}
              </div>
            `
                : ''
            }

            <div class="unit-sprite player-sprite">
              ${SvgCharacters.renderUnitVisual(player.id, player.name)}
              ${player.block > 0 ? `<div class="block-badge"><span class="badge-icon">${GameIcons.SHIELD}</span> <span>${player.block}</span></div>` : ''}
            </div>

            <div class="unit-info">
              <div class="unit-name">${player.name}</div>
              <div class="hp-bar-bg">
                <div class="hp-bar-fill" style="width: ${(player.currentHp / player.maxHp) * 100}%"></div>
                <span class="hp-text">${player.currentHp} / ${player.maxHp}</span>
              </div>
              <div class="buffs-list">
                ${Object.entries(player.buffs)
                  .map(
                    ([k, v]) => `
                  <span class="buff-tag buff-${k.toLowerCase()}" title="${k}: ${v}">
                    ${k === 'STRENGTH' ? '武' : k === 'BLADE_STANCE' ? '势' : k === 'FOCUS' ? '运' : k === 'BARRICADE' ? '壁' : k.slice(0, 2)} ${v}
                  </span>
                `
                  )
                  .join('')}
              </div>
            </div>
          </div>

          <!-- Enemies -->
          <div class="enemies-container">
            ${enemies
              .map((enemy) => {
                if (enemy.isDead()) return '';
                const isTargetCandidate = this.selectedCard && this.selectedCard.target === 'SINGLE_ENEMY';
                return `
                <div class="unit-wrapper enemy-side ${isTargetCandidate ? 'targetable' : ''}" id="unit-${enemy.id}" data-enemy-id="${enemy.id}">
                  <!-- Intent Header -->
                  ${IntentIndicator.render(enemy.intent)}

                  <div class="unit-sprite enemy-sprite">
                    ${SvgCharacters.renderUnitVisual(enemy.enemy_id, enemy.name)}
                    ${enemy.block > 0 ? `<div class="block-badge"><span class="badge-icon">${GameIcons.SHIELD}</span> <span>${enemy.block}</span></div>` : ''}
                    ${isTargetCandidate ? `<div class="target-crosshair"><span class="crosshair-icon">${GameIcons.TARGET_CROSSHAIR}</span> <span>击破</span></div>` : ''}
                  </div>

                  <div class="unit-info">
                    <div class="unit-name">${enemy.name}</div>
                    <div class="hp-bar-bg">
                      <div class="hp-bar-fill enemy-fill" style="width: ${(enemy.currentHp / enemy.maxHp) * 100}%"></div>
                      <span class="hp-text">${enemy.currentHp} / ${enemy.maxHp}</span>
                    </div>
                    <div class="buffs-list">
                      ${Object.entries(enemy.buffs)
                        .map(
                          ([k, v]) => `
                        <span class="buff-tag buff-${k.toLowerCase()}" title="${k}: ${v}">
                          ${k === 'STRENGTH' ? '武' : k === 'OIL_BURN' ? '油' : k === 'THORNS' ? '烈' : k === 'VULNERABLE' ? '破' : k.slice(0, 2)} ${v}
                        </span>
                      `
                        )
                        .join('')}
                    </div>
                  </div>
                </div>
              `;
              })
              .join('')}
          </div>
        </div>

        <!-- Controls / Energy / End Turn -->
        <div class="battle-controls">
          <!-- Eight Trigrams Bronze Energy Crucible -->
          <div class="energy-crucible" title="主公军令 (出牌所需点数)">
            <div class="crucible-trigram-ring">☰☱☲☳☴☵☶☷</div>
            <div class="crucible-core">
              <span class="energy-val">${player.energy}</span>
              <span class="energy-slash">/</span>
              <span class="energy-max">${player.maxEnergy}</span>
            </div>
            <div class="crucible-label">军令</div>
          </div>

          <!-- Military Command Slips (Deck Counts) -->
          <div class="deck-slips-container">
            <div class="military-slip" title="尚存可用军令牌">
              <span class="slip-icon">${GameIcons.DRAW_PILE}</span>
              <span class="slip-title">牌堆</span>
              <span class="slip-count">${this.currentBattle.deckManager.getDrawPile().length}</span>
            </div>
            <div class="military-slip" title="已打出及弃置战牌">
              <span class="slip-icon">${GameIcons.DISCARD_PILE}</span>
              <span class="slip-title">弃牌</span>
              <span class="slip-count">${this.currentBattle.deckManager.getDiscardPile().length}</span>
            </div>
            <div class="military-slip" title="战局中已焚毁战策">
              <span class="slip-icon">${GameIcons.EXHAUST_PILE}</span>
              <span class="slip-title">损耗</span>
              <span class="slip-count">${this.currentBattle.deckManager.getExhaustPile().length}</span>
            </div>
            <div class="military-slip military-hint-ribbon">
              <span>点击或向上拖拽出牌</span>
            </div>
          </div>

          <!-- Grand Tiger Tally End Turn Button -->
          <button class="tiger-tally-btn end-turn-btn" ${this.currentBattle.phase !== 'PLAYER_ACTION' ? 'disabled' : ''}>
            <div class="tally-face">
              <div class="tally-title">鸣金收兵</div>
              <div class="tally-turn">第 ${this.currentBattle.turnCount} 回合</div>
            </div>
          </button>
        </div>

        <!-- Hand Cards Flat Tray -->
        <div class="hand-container">
          ${hand
            .map((card, idx) => {
              const tf = transforms[idx] || { translateX: 0, translateY: 0, rotateDeg: 0, zIndex: 10 };
              const canAfford = player.energy >= card.cost;
              const isSelected = this.selectedCard === card;
              const hasCombo =
                card.combo_require &&
                this.currentBattle?.playedTagsThisTurn.includes(card.combo_require);

              const cardIconSvg =
                card.type === 'ATTACK'
                  ? GameIcons.SWORD_ATTACK
                  : card.type === 'SKILL'
                  ? GameIcons.SCROLL_SKILL
                  : GameIcons.POWER_TALLY;

              return `
              <div class="hand-card card-type-${card.type.toLowerCase()} ${canAfford ? 'affordable' : 'unaffordable'} ${isSelected ? 'selected' : ''} ${hasCombo ? 'combo-active' : ''}"
                   data-index="${idx}"
                   style="--card-x: ${tf.translateX}px; --card-y: ${isSelected ? -34 : tf.translateY}px; z-index: ${isSelected ? 120 : tf.zIndex};">
                <div class="card-cost">${card.cost}</div>
                <div class="card-name">${card.name}</div>
                <div class="card-type-label">${card.type === 'ATTACK' ? '武技' : card.type === 'SKILL' ? '韬略' : '兵法'}</div>
                <div class="card-art">${cardIconSvg}</div>
                <div class="card-desc">${card.description}</div>
                <div class="card-play-hint">${canAfford ? '【出牌】' : '【军令不足】'}</div>
                ${card.exhaust ? '<div class="card-badge">消耗</div>' : ''}
              </div>
            `;
            })
            .join('')}
        </div>
      </div>
    `;
  }

  private renderRewardScreen(): string {
    return `
      <div class="reward-screen-container">
        ${SvgBackgrounds.getActBackground(this.runState.act)}
        <div class="reward-screen ink-card">
          <h2>战斗凯旋</h2>
          <p class="subtitle">缴获军资与阵前领悟</p>

          <div class="reward-gold-box">
            <span class="reward-icon">${GameIcons.COIN}</span> 缴获铜钱: <b>+${this.rewardGold}</b> 铢
          </div>

          ${
            this.rewardRelic
              ? `
            <div class="reward-relic-box">
              <h3>斩获稀世兵符：【${this.rewardRelic.name}】</h3>
              <p>${this.rewardRelic.description}</p>
              <button class="btn-primary claim-relic-btn">收入军囊</button>
            </div>
          `
              : ''
          }

          <div class="reward-cards-selection">
            <h3>研习阵法（三选一加入牌组）：</h3>
            <div class="cards-grid">
              ${this.rewardCards
                .map(
                  (card, idx) => `
                <div class="reward-card card-type-${card.type.toLowerCase()}" data-card-idx="${idx}">
                  <div class="card-cost">${card.cost}</div>
                  <div class="card-name">${card.name}</div>
                  <div class="card-type-label">${card.type === 'ATTACK' ? '武技' : card.type === 'SKILL' ? '韬略' : '兵法'}</div>
                  <div class="card-desc">${card.description}</div>
                  <button class="btn-secondary pick-card-btn" data-card-idx="${idx}">收录此牌</button>
                </div>
              `
                )
                .join('')}
            </div>
          </div>

          <button class="btn-primary proceed-btn">整军前行</button>
        </div>
      </div>
    `;
  }

  private renderRestScreen(): string {
    const healAmount = Math.floor(this.runState.maxHp * 0.3);
    return `
      <div class="rest-screen-container">
        ${SvgBackgrounds.getActBackground(this.runState.act)}
        <div class="rest-screen ink-card">
          <h2>大军营帐</h2>
          <p class="subtitle">篝火明灭，正是修整军势、淬炼兵锋之时。</p>

          <div class="rest-choices">
            <div class="rest-option" id="btn-rest-heal">
              <div class="option-icon">${GameIcons.REST_HEAL}</div>
              <h3>【休整调息】</h3>
              <p>全军埋锅造饭，回复 <b>${healAmount}</b> 点生命值（当前：${this.runState.currentHp}/${this.runState.maxHp}）。</p>
              <button class="btn-primary">休整</button>
            </div>

            <div class="rest-option" id="btn-rest-forge">
              <div class="option-icon">${GameIcons.REST_FORGE}</div>
              <h3>【军械淬炼】</h3>
              <p>选择牌库中的 1 张卡牌进行永久强化升级。</p>
              <button class="btn-secondary">锻造</button>
            </div>
          </div>

          <div id="forge-deck-list" style="display: none; margin-top: 20px;">
            <h3>选择需要强化的卡牌：</h3>
            <div class="cards-grid">
              ${this.runState.deck
                .filter((c) => !c.upgraded)
                .map(
                  (c) => `
                <div class="reward-card forge-card-pick" data-card-id="${c.id}">
                  <div class="card-cost">${c.cost}</div>
                  <div class="card-name">${c.name}</div>
                  <div class="card-desc">${c.description}</div>
                  <button class="btn-secondary">淬炼升级</button>
                </div>
              `
                )
                .join('')}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  private renderShopScreen(): string {
    return `
      <div class="shop-screen-container">
        ${SvgBackgrounds.getActBackground(this.runState.act)}
        <div class="shop-screen ink-card">
          <h2>西域行商</h2>
          <p class="subtitle">“驼铃阵阵，中原煞气弥漫，老夫手里可尽是压箱底的灵物兵符！”</p>

          <div class="shop-section">
            <h3>韬略秘籍（点击购入）：</h3>
            <div class="cards-grid">
              ${this.shopCards
                .map(
                  (item, idx) => `
                <div class="shop-card-item card-type-${item.card.type.toLowerCase()}" data-shop-card-idx="${idx}">
                  <div class="card-cost">${item.card.cost}</div>
                  <div class="card-name">${item.card.name}</div>
                  <div class="card-desc">${item.card.description}</div>
                  <div class="shop-price">${GameIcons.COIN} <span>${item.price} 铢</span></div>
                  <button class="btn-primary buy-card-btn" data-shop-card-idx="${idx}">购买</button>
                </div>
              `
                )
                .join('')}
            </div>
          </div>

          <div class="shop-section">
            <h3>军阵兵符：</h3>
            <div class="relics-shop-grid">
              ${this.shopRelics
                .map(
                  (item, idx) => `
                <div class="shop-relic-item" data-shop-relic-idx="${idx}">
                  <h4>${GameIcons.RELIC_SEAL} ${item.relic.name}</h4>
                  <p>${item.relic.description}</p>
                  <div class="shop-price">${GameIcons.COIN} <span>${item.price} 铢</span></div>
                  <button class="btn-secondary buy-relic-btn" data-shop-relic-idx="${idx}">购买</button>
                </div>
              `
                )
                .join('')}
            </div>
          </div>

          <div class="shop-section">
            <h3>精简军备：</h3>
            <p>花费 50 铜钱从牌组中永久剔除一张废牌。</p>
            <div class="deck-remove-chips">
              ${this.runState.deck
                .map(
                  (c) => `
                <button class="btn-secondary remove-card-btn" data-card-id="${c.id}">
                  剔除 《${c.name}》 (50铢)
                </button>
              `
                )
                .join('')}
            </div>
          </div>

          <button class="btn-primary leave-shop-btn" style="margin-top: 24px;">离开集市</button>
        </div>
      </div>
    `;
  }

  private renderEventScreen(): string {
    if (!this.currentEvent) return '';
    return `
      <div class="event-screen-container">
        ${SvgBackgrounds.getActBackground(this.runState.act)}
        <div class="event-screen ink-card">
          <h2>${this.currentEvent.title}</h2>
          <div class="event-story">${this.currentEvent.story}</div>

          <div class="event-options">
            ${this.currentEvent.options
              .map(
                (opt: any) => `
              <div class="event-option-box">
                <h4>${opt.title}</h4>
                <p>${opt.desc}</p>
                <button class="btn-primary choose-event-btn" data-opt-id="${opt.id}">做出抉择</button>
              </div>
            `
              )
              .join('')}
          </div>
        </div>
      </div>
    `;
  }

  private renderVictoryScreen(): string {
    return `
      <div class="victory-screen-container">
        ${SvgBackgrounds.getActBackground(4)}
        <div class="victory-screen ink-card">
          <h1 style="color: #ffd700; font-size: 2.6rem;">天命克成 · 魔障皆斩</h1>
          <p class="subtitle">九鼎归位，九州清平！宿命轮回的无尽黑夜终得破晓！</p>
          <p style="margin: 20px 0; line-height: 1.8;">
            将军提三尺青锋，横跨颍川、虎牢、赤壁与九鼎祭坛，尽斩黄天妖术与诸候执念煞气。<br>
            万代功名化作残卷轻烟，人间烽火再归定数！
          </p>
          <div class="stats-summary">
            <p>最终气血: ${this.runState.currentHp} / ${this.runState.maxHp}</p>
            <p>所携兵符: ${this.runState.relics.length} 件</p>
            <p>牌组规模: ${this.runState.deck.length} 张</p>
          </div>
          <button class="btn-primary restart-btn">再入轮回</button>
        </div>
      </div>
    `;
  }

  private renderDefeatScreen(): string {
    return `
      <div class="defeat-screen-container">
        ${SvgBackgrounds.getActBackground(this.runState.act)}
        <div class="defeat-screen ink-card">
          <h1 style="color: #ff4d4f; font-size: 2.6rem;">英魂饮恨</h1>
          <p class="subtitle">煞气滔天，九州再陷轮回……</p>
          <p style="margin: 20px 0;">南华仙书合拢，名将之躯缓缓消散于历史残卷之中……</p>
          <button class="btn-primary restart-btn">逆天改命 · 重新出征</button>
        </div>
      </div>
    `;
  }

  private bindEvents(): void {
    // Title buttons
    document.querySelectorAll('.start-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const char = (e.currentTarget as HTMLElement).dataset.char as CharacterId;
        this.startNewGame(char);
      });
    });

    // Prologue blessings
    document.querySelectorAll('.blessing-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const blessing = (e.currentTarget as HTMLElement).dataset.blessing as any;
        this.chooseNeowBlessing(blessing);
      });
    });

    // Map nodes
    document.querySelectorAll('.map-node.available').forEach((nodeEl) => {
      nodeEl.addEventListener('click', (e) => {
        const nodeId = (e.currentTarget as HTMLElement).dataset.id;
        if (nodeId) {
          const node = this.runState.mapNodes.find((n) => n.id === nodeId);
          if (node) this.enterNode(node);
        }
      });
    });

    // Click on enemies in battle (for targeting)
    document.querySelectorAll('.enemy-side').forEach((enemyEl) => {
      enemyEl.addEventListener('click', (e) => {
        if (!this.currentBattle) return;
        const enemyId = (enemyEl as HTMLElement).dataset.enemyId;
        const enemy = this.currentBattle.enemies.find((en) => en.id === enemyId);

        if (enemy && !enemy.isDead() && this.selectedCard) {
          this.executeCardOnTarget(this.selectedCard, enemy);
        }
      });
    });

    // Hand cards interaction (unified click & mousedown)
    document.querySelectorAll('.hand-card').forEach((cardEl) => {
      const idx = parseInt((cardEl as HTMLElement).dataset.index || '0');

      // Click to play directly or select
      cardEl.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!this.currentBattle) return;
        const hand = this.currentBattle.deckManager.getHand();
        const card = hand[idx];
        if (card) {
          this.tryPlayCard(card);
        }
      });

      // Mousedown for drag to play
      cardEl.addEventListener('mousedown', (e) => {
        if (!this.currentBattle) return;
        const hand = this.currentBattle.deckManager.getHand();
        const card = hand[idx];
        if (card && this.currentBattle.canPlayCard(card)) {
          this.draggingCard = card;
        }
      });
    });

    // End turn button
    const endTurnBtn = document.querySelector('.end-turn-btn');
    if (endTurnBtn) {
      endTurnBtn.addEventListener('click', () => {
        if (this.currentBattle) {
          this.soundEngine.playCardPlay();
          this.selectedCard = null;
          this.draggingCard = null;
          this.targetingArrow.hide();
          this.currentBattle.endPlayerTurn().then(() => this.render());
        }
      });
    }

    // Reward buttons
    document.querySelectorAll('.pick-card-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt((e.currentTarget as HTMLElement).dataset.cardIdx || '0');
        const card = this.rewardCards[idx];
        if (card) {
          this.runState.addCard(card);
          this.notify(`收录卡牌《${card.name}》进入牌组！`);
          this.screen = 'MAP';
          this.render();
        }
      });
    });

    const claimRelicBtn = document.querySelector('.claim-relic-btn');
    if (claimRelicBtn && this.rewardRelic) {
      claimRelicBtn.addEventListener('click', () => {
        this.runState.addRelic(this.rewardRelic!);
        this.notify(`佩戴兵符【${this.rewardRelic!.name}】！`);
        this.rewardRelic = null;
        this.render();
      });
    }

    const proceedBtn = document.querySelector('.proceed-btn');
    if (proceedBtn) {
      proceedBtn.addEventListener('click', () => {
        this.screen = 'MAP';
        this.render();
      });
    }

    // Rest buttons
    const restHeal = document.getElementById('btn-rest-heal');
    if (restHeal) {
      restHeal.addEventListener('click', () => this.doRestHeal());
    }

    const restForge = document.getElementById('btn-rest-forge');
    if (restForge) {
      restForge.addEventListener('click', () => {
        const forgeList = document.getElementById('forge-deck-list');
        if (forgeList) forgeList.style.display = 'block';
      });
    }

    document.querySelectorAll('.forge-card-pick').forEach((el) => {
      el.addEventListener('click', (e) => {
        const cardId = (e.currentTarget as HTMLElement).dataset.cardId;
        if (cardId) this.doRestForge(cardId);
      });
    });

    // Shop buttons
    document.querySelectorAll('.buy-card-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt((e.currentTarget as HTMLElement).dataset.shopCardIdx || '0');
        this.buyCard(idx);
      });
    });

    document.querySelectorAll('.buy-relic-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt((e.currentTarget as HTMLElement).dataset.shopRelicIdx || '0');
        this.buyRelic(idx);
      });
    });

    document.querySelectorAll('.remove-card-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const cardId = (e.currentTarget as HTMLElement).dataset.cardId;
        if (cardId) this.removeCardFromShop(cardId);
      });
    });

    const leaveShopBtn = document.querySelector('.leave-shop-btn');
    if (leaveShopBtn) {
      leaveShopBtn.addEventListener('click', () => {
        this.screen = 'MAP';
        this.render();
      });
    }

    // Event buttons
    document.querySelectorAll('.choose-event-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const optId = (e.currentTarget as HTMLElement).dataset.optId;
        if (optId) this.handleEventChoice(optId);
      });
    });

    // Restart button
    document.querySelectorAll('.restart-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.screen = 'TITLE';
        this.render();
      });
    });
  }
}
