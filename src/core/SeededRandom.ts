export class SeededRandom {
  private seed: number;

  constructor(seed: number = Math.floor(Math.random() * 1000000)) {
    this.seed = seed;
  }

  public getSeed(): number {
    return this.seed;
  }

  public next(): number {
    // Mulberry32
    let t = (this.seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  public range(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  public choice<T>(list: T[]): T {
    const idx = Math.floor(this.next() * list.length);
    return list[idx];
  }

  public shuffle<T>(array: T[]): T[] {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(this.next() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }
}
