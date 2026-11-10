export class BezierTargetingArrow {
  private svg: SVGSVGElement | null = null;
  private path: SVGPathElement | null = null;
  private head: SVGPolygonElement | null = null;
  private circles: SVGCircleElement[] = [];
  private numPoints: number = 16;

  constructor() {
    this.createSvg();
  }

  private createSvg(): void {
    const existing = document.getElementById('targeting-arrow-svg');
    if (existing) existing.remove();

    this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.svg.id = 'targeting-arrow-svg';
    this.svg.style.position = 'fixed';
    this.svg.style.top = '0';
    this.svg.style.left = '0';
    this.svg.style.width = '100vw';
    this.svg.style.height = '100vh';
    this.svg.style.pointerEvents = 'none';
    this.svg.style.zIndex = '999';
    this.svg.style.display = 'none';

    // Dotted curve nodes
    for (let i = 0; i < this.numPoints; i++) {
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('r', `${(i / this.numPoints) * 6 + 3}`);
      circle.setAttribute('fill', i > this.numPoints - 4 ? '#ff4d4f' : '#ffd700');
      circle.setAttribute('opacity', '0.85');
      this.svg.appendChild(circle);
      this.circles.push(circle);
    }

    // Arrow head
    this.head = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    this.head.setAttribute('fill', '#ff4d4f');
    this.svg.appendChild(this.head);

    document.body.appendChild(this.svg);
  }

  public update(startX: number, startY: number, endX: number, endY: number): void {
    if (!this.svg) return;
    this.svg.style.display = 'block';

    // Quadratic bezier control point
    const cx = (startX + endX) / 2;
    const cy = Math.min(startY, endY) - 120;

    // Position circles along bezier curve
    for (let i = 0; i < this.numPoints; i++) {
      const t = (i + 1) / (this.numPoints + 1);
      // B(t) = (1-t)^2 * P0 + 2(1-t)t * P1 + t^2 * P2
      const x = (1 - t) * (1 - t) * startX + 2 * (1 - t) * t * cx + t * t * endX;
      const y = (1 - t) * (1 - t) * startY + 2 * (1 - t) * t * cy + t * t * endY;

      this.circles[i].setAttribute('cx', `${x}`);
      this.circles[i].setAttribute('cy', `${y}`);
    }

    // Arrowhead angle
    const angle = Math.atan2(endY - cy, endX - cx);
    const arrowSize = 18;
    const tipX = endX;
    const tipY = endY;
    const leftX = endX - arrowSize * Math.cos(angle - Math.PI / 6);
    const leftY = endY - arrowSize * Math.sin(angle - Math.PI / 6);
    const rightX = endX - arrowSize * Math.cos(angle + Math.PI / 6);
    const rightY = endY - arrowSize * Math.sin(angle + Math.PI / 6);

    if (this.head) {
      this.head.setAttribute('points', `${tipX},${tipY} ${leftX},${leftY} ${rightX},${rightY}`);
    }
  }

  public hide(): void {
    if (this.svg) {
      this.svg.style.display = 'none';
    }
  }
}
