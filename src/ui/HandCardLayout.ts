export interface CardLayoutTransform {
  translateX: number;
  translateY: number;
  rotateDeg: number;
  zIndex: number;
}

export class HandCardLayout {
  public static calculateTransforms(
    cardsCount: number,
    hoveredIndex: number = -1
  ): CardLayoutTransform[] {
    if (cardsCount === 0) return [];

    const transforms: CardLayoutTransform[] = [];
    const cardWidth = 145;
    // Spacing between cards
    const spacing = Math.min(cardWidth * 0.78, 680 / Math.max(cardsCount, 1));
    const startX = -((cardsCount - 1) * spacing) / 2;

    for (let i = 0; i < cardsCount; i++) {
      const x = Math.round(startX + i * spacing);
      // Flat horizontal layout without steep arc
      let y = 0;
      let angle = 0;
      let zIndex = 10 + i;

      if (i === hoveredIndex) {
        y = -28;
        zIndex = 100;
      }

      transforms.push({
        translateX: x,
        translateY: y,
        rotateDeg: angle,
        zIndex
      });
    }

    return transforms;
  }
}
