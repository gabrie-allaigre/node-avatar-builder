import {Canvas, createCanvas} from 'canvas';
import {DEFAULT_COLORS} from './core-avatar';
import {IAvatarBuilder, IImageBuilder, IRandom} from '../common';

/**
 * Build avatar image like min block https://github.com/flouthoc/minBlock.js
 */
export class SquareImageBuilder implements IImageBuilder {

  constructor(
    private precision: number = 3,
    private colors: any[] = DEFAULT_COLORS
  ) {
  }

  async buildImage(avatar: IAvatarBuilder, random: IRandom, width: number, height: number): Promise<Canvas> {
    const size = Math.min(width, height);
    const margin = Math.floor(size / (this.precision * 5));

    const index = random.nextInt(this.colors.length);
    const fillColor = this.colors[index];
    const backgroundColor = this.colors[(index + 1) % this.colors.length];

    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    ctx.translate((width - size) / 2, (height - size) / 2);

    ctx.fillStyle = fillColor;
    ctx.fillRect(0, 0, size, size);

    ctx.fillStyle = backgroundColor;
    ctx.fillRect(margin, margin, size - margin * 2, size - margin * 2);

    ctx.fillStyle = fillColor;
    const mult = (size - margin * 2) / this.precision;
    for (let x = 0; x < this.precision; x++) {
      for (let y = 0; y < this.precision; y++) {
        if (random.nextDouble() < 0.5) {
          ctx.fillRect(Math.floor(x * mult + margin), Math.floor(y * mult + margin), Math.ceil(mult), Math.ceil(mult));
        }
      }
    }

    return canvas;
  }
}
