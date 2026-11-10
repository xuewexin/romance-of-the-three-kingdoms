import { CardData } from '../types.ts';

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
    const maxSpreadAngle = 26; // max total arc spread in degrees
    const stepAngle = cardsCount > 1 ? Math.min(6, (maxSpreadAngle * 2) / (cardsCount - 1)) : 0;
    const startAngle = -(stepAngle * (cardsCount - 1)) / 2;

    const cardWidth = 140;
    const spacing = Math.min(cardWidth * 0.72, 600 / Math.max(cardsCount, 1));
    const startX = -((cardsCount - 1) * spacing) / 2;

    for (let i = 0; i < cardsCount; i++) {
      let x = startX + i * spacing;
      let angle = startAngle + i * stepAngle;
      // Arc curvature height
      const normalizedDist = cardsCount > 1 ? (i - (cardsCount - 1) / 2) / ((cardsCount - 1) / 2) : 0;
      let y = Math.abs(normalizedDist) * 22;
      let zIndex = 10 + i;

      if (i === hoveredIndex) {
        y -= 50;
        angle = 0; // straighten when hovered
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
