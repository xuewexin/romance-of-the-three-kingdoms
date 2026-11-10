import { CardData } from '../types.ts';
import { SeededRandom } from '../core/SeededRandom.ts';

export class DeckManager {
  private drawPile: CardData[] = [];
  private hand: CardData[] = [];
  private discardPile: CardData[] = [];
  private exhaustPile: CardData[] = [];
  private maxHandSize: number = 10;

  private rng: SeededRandom;

  constructor(rng: SeededRandom) {
    this.rng = rng;
  }

  public initialize(cards: CardData[]): void {
    this.drawPile = this.rng.shuffle(cards.map((c) => ({ ...c })));
    this.hand = [];
    this.discardPile = [];
    this.exhaustPile = [];
  }

  public drawCard(): CardData | null {
    if (this.hand.length >= this.maxHandSize) {
      return null;
    }

    if (this.drawPile.length === 0) {
      if (this.discardPile.length === 0) {
        return null; // No cards left to draw
      }
      // Reshuffle discard into draw
      this.drawPile = this.rng.shuffle([...this.discardPile]);
      this.discardPile = [];
    }

    const card = this.drawPile.pop();
    if (card) {
      this.hand.push(card);
      return card;
    }
    return null;
  }

  public drawMultiple(count: number): CardData[] {
    const drawn: CardData[] = [];
    for (let i = 0; i < count; i++) {
      const card = this.drawCard();
      if (card) drawn.push(card);
    }
    return drawn;
  }

  public discardCard(card: CardData): void {
    const idx = this.hand.indexOf(card);
    if (idx !== -1) {
      this.hand.splice(idx, 1);
      this.discardPile.push(card);
    }
  }

  public exhaustCard(card: CardData): void {
    const idx = this.hand.indexOf(card);
    if (idx !== -1) {
      this.hand.splice(idx, 1);
      this.exhaustPile.push(card);
    }
  }

  public addCardToHand(card: CardData): boolean {
    if (this.hand.length < this.maxHandSize) {
      this.hand.push({ ...card });
      return true;
    }
    this.discardPile.push({ ...card });
    return false;
  }

  public discardHand(): void {
    const retained: CardData[] = [];
    for (const card of this.hand) {
      if (card.retain) {
        retained.push(card);
      } else {
        this.discardPile.push(card);
      }
    }
    this.hand = retained;
  }

  public scry(count: number): CardData[] {
    const topCards = this.drawPile.slice(-count);
    return topCards;
  }

  public discardFromDrawPile(card: CardData): void {
    const idx = this.drawPile.indexOf(card);
    if (idx !== -1) {
      this.drawPile.splice(idx, 1);
      this.discardPile.push(card);
    }
  }

  public getHand(): CardData[] {
    return this.hand;
  }

  public getDrawPile(): CardData[] {
    return this.drawPile;
  }

  public getDiscardPile(): CardData[] {
    return this.discardPile;
  }

  public getExhaustPile(): CardData[] {
    return this.exhaustPile;
  }
}
