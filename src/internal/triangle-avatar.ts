import {Canvas, createCanvas} from 'canvas';
import {DEFAULT_COLORS} from './core-avatar';
import {IAvatarBuilder, IImageBuilder, IRandom} from '../common';

export class TriangleImageBuilder implements IImageBuilder {

  constructor(
    private precision: number = 4,
    private colors: any[] = DEFAULT_COLORS
  ) {
  }

  async buildImage(avatar: IAvatarBuilder, random: IRandom, width: number, height: number): Promise<Canvas> {
    const size = Math.min(width, height);

    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    ctx.translate((width - size) / 2, (height - size) / 2);

    const index = random.nextInt(this.colors.length);
    const fillColor = this.colors[index];

    const s = random.nextInt(4);
    const n = s + this.precision;
    let p = size;
    const d = size / n;
    let i = s;

    while (p > 0) {
      switch (i % 4) {
        case 0:
          ctx.drawImage(TriangleImageBuilder.drawTriangle(size, fillColor, [{x: 0, y: 0}, {x: p, y: 0}, {x: 0, y: p}]), 0, 0);
          break;
        case 1:
          ctx.drawImage(TriangleImageBuilder.drawTriangle(size, fillColor, [{x: size, y: 0}, {x: size, y: p}, {x: size - p, y: 0}]), 0, 0);
          break;
        case 2:
          ctx.drawImage(TriangleImageBuilder.drawTriangle(size, fillColor, [{x: size, y: size}, {x: size - p, y: size}, {x: size, y: size - p}]), 0, 0);
          break;
        case 3:
          ctx.drawImage(TriangleImageBuilder.drawTriangle(size, fillColor, [{x: 0, y: size}, {x: 0, y: size - p}, {x: p, y: size}]), 0, 0);
          break;
      }

      p -= Math.floor(random.nextDouble() % (d / 2) + d / 2);
      i++;
    }


    return canvas;
  }

  private static drawTriangle(size: number, color: string, points: { x: number, y: number }[]): any {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = color;

    ctx.shadowColor = 'rgba(0,0,0,0.75)';
    ctx.shadowBlur = Math.max(1, Math.floor(size / 20));
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.closePath();
    ctx.fill();
    return canvas;
  }

}
