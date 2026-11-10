export class DamagePipeline {
  public calculate(
    source: any,
    target: any,
    baseDamage: number,
    tags: string[] = [],
    damageType: 'NORMAL' | 'THORNS' | 'HP_LOSS' | 'FIRE' = 'NORMAL'
  ): number {
    if (damageType === 'HP_LOSS') {
      return baseDamage;
    }

    let flatMod = 0;
    let attackerMult = 1.0;
    let defenderMult = 1.0;

    // Attacker buffs
    if (source && source.buffs) {
      // 武力 (Strength)
      const str = source.buffs.STRENGTH || 0;
      flatMod += str;

      // 刀势 (Blade Stance) - only for attacks with BLADE tag
      if (tags.includes('BLADE')) {
        const blade = source.buffs.BLADE_STANCE || 0;
        flatMod += blade * 3;
      }

      // 百步穿杨 (Dart Boost) - only for DART attacks
      if (tags.includes('DART')) {
        const dartBoost = source.buffs.DART_BOOST || 0;
        flatMod += dartBoost;
      }

      // 怯战 (Weak) - deals 25% less damage
      if (source.buffs.WEAK && source.buffs.WEAK > 0) {
        attackerMult *= 0.75;
      }
    }

    // Defender buffs & debuffs
    if (target && target.buffs) {
      // 破绽 (Vulnerable) - takes 50% more damage
      if (target.buffs.VULNERABLE && target.buffs.VULNERABLE > 0) {
        defenderMult *= 1.5;
      }

      // 空城 (Kong Cheng) - takes 50% less damage
      if (target.buffs.KONG_CHENG && target.buffs.KONG_CHENG > 0) {
        defenderMult *= 0.5;
      }
    }

    const totalBase = Math.max(0, baseDamage + flatMod);
    const finalDmg = Math.floor(totalBase * attackerMult * defenderMult);
    return Math.max(0, finalDmg);
  }

  public calculateBlock(
    source: any,
    baseBlock: number
  ): number {
    let flatMod = 0;
    let mult = 1.0;

    if (source && source.buffs) {
      // 守备 (Dexterity)
      const dex = source.buffs.DEXTERITY || 0;
      flatMod += dex;

      // 断粮 (Frail) - gains 25% less block
      if (source.buffs.FRAIL && source.buffs.FRAIL > 0) {
        mult *= 0.75;
      }
    }

    return Math.max(0, Math.floor((baseBlock + flatMod) * mult));
  }
}
