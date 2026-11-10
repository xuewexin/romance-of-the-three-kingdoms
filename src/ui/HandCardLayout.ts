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
    // Arc spread angle (classic Slay the Spire hand fan)
    const maxSpreadAngle = 24;
    const stepAngle = cardsCount > 1 ? Math.min(5, (maxSpreadAngle * 2) / (cardsCount - 1)) : 0;
    const startAngle = -(stepAngle * (cardsCount - 1)) / 2;

    const cardWidth = 140;
    // Spacing between cards
    const spacing = Math.min(cardWidth * 0.74, 620 / Math.max(cardsCount, 1));
    const startX = -((cardsCount - 1) * spacing) / 2;

    for (let i = 0; i < cardsCount; i++) {
      const x = Math.round(startX + i * spacing);
      const angle = Math.round((startAngle + i * stepAngle) * 10) / 10;
      // Arc curvature height: natural parabolic curve
      const normalizedDist = cardsCount > 1 ? (i - (cardsCount - 1) / 2) / ((cardsCount - 1) / 2) : 0;
      let y = Math.round(Math.abs(normalizedDist) * 12);
      let zIndex = 10 + i;

      if (i === hoveredIndex) {
        y -= 34;
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
