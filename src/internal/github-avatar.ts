import {Canvas, createCanvas} from 'canvas';
import {IAvatarBuilder, IImageBuilder, IRandom} from '../common';

export class GithubImageBuilder implements IImageBuilder {

  constructor(
    private precision: number = 3
  ) {
  }

  async buildImage(avatar: IAvatarBuilder, random: IRandom, width: number, height: number): Promise<Canvas> {
    const size = Math.min(width, height);

    const red = random.nextInt(256);
    const green = random.nextInt(256);
    const blue = random.nextInt(256);

    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    ctx.translate((width - size) / 2, (height - size) / 2);

    ctx.fillStyle = `rgb(${red},${green},${blue})`;

    const mult = size / ((this.precision * 2) - 1);
    for (let x = 0; x < this.precision; x++) {
      for (let y = 0; y < this.precision * 2; y++) {
        if (random.nextDouble() < 0.5) {
          ctx.fillRect(Math.floor(x * mult), Math.floor(y * mult), Math.ceil(mult), Math.ceil(mult));
          ctx.fillRect(Math.floor(size - (x + 1) * mult), Math.floor(y * mult), Math.ceil(mult), Math.ceil(mult));
        }
      }
    }

    return canvas;
  }
}
