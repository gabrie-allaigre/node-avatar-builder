import {Canvas, createCanvas} from 'canvas';
import {IAvatarBuilder, IImageBuilder, IRandom} from '../common';

const CENTER_PATCH_TYPES = [0, 4, 8, 15];
const PATCH_GRIDS = 5;
const DEFAULT_PATCH_SIZE = 20.0;
const PATCH_SYMMETRIC = 1;
const PATCH_INVERTED = 2;
const PATCH_MOVETO = -1;
const patch0 = [0, 4, 24, 20];
const patch1 = [0, 4, 20];
const patch2 = [2, 24, 20];
const patch3 = [0, 2, 20, 22];
const patch4 = [2, 14, 22, 10];
const patch5 = [0, 14, 24, 22];
const patch6 = [2, 24, 22, 13, 11, 22, 20];
const patch7 = [0, 14, 22];
const patch8 = [6, 8, 18, 16];
const patch9 = [4, 20, 10, 12, 2];
const patch10 = [0, 2, 12, 10];
const patch11 = [10, 14, 22];
const patch12 = [20, 12, 24];
const patch13 = [10, 2, 12];
const patch14 = [0, 2, 10];
const PATCH_TYPES = [patch0, patch1, patch2,
  patch3, patch4, patch5, patch6, patch7, patch8, patch9, patch10,
  patch11, patch12, patch13, patch14, patch0];
const PATCH_FLAGS = [PATCH_SYMMETRIC, 0, 0, 0,
  PATCH_SYMMETRIC, 0, 0, 0, PATCH_SYMMETRIC, 0, 0, 0, 0, 0, 0,
  PATCH_SYMMETRIC + PATCH_INVERTED];

/**
 * 9-block Identicon renderer.
 * <p>
 * <p>
 * Current implementation uses only the lower 32 bits of identicon code.
 * </p>
 *
 * @inspired by don for NineBlockIdenticon
 */
export class IdenticonImageBuilder implements IImageBuilder {

  constructor(
    private patchSize = DEFAULT_PATCH_SIZE,
    private backgroundColor = {red: 255, green: 255, blue: 255}
  ) {
  }

  async buildImage(avatar: IAvatarBuilder, random: IRandom, width: number, height: number): Promise<Canvas> {
    const size = Math.min(width, height);

    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    ctx.translate((width - size) / 2, (height - size) / 2);

    const code = random.nextInt(4294967296);

    this.renderQuilt(ctx, code, size);

    return canvas;
  }

  private renderQuilt(ctx, code: number, size: number): any {
    const middleType = CENTER_PATCH_TYPES[code & 0x3];
    const middleInvert = ((code >> 2) & 0x1) != 0;
    const cornerType = (code >> 3) & 0x0f;
    const cornerInvert = ((code >> 7) & 0x1) != 0;
    let cornerTurn = (code >> 8) & 0x3;
    const sideType = (code >> 10) & 0x0f;
    const sideInvert = ((code >> 14) & 0x1) != 0;
    let sideTurn = (code >> 15) & 0x3;
    const blue = ((code >> 16) & 0x01f) << 3;
    const green = ((code >> 21) & 0x01f) << 3;
    const red = ((code >> 27) & 0x01f) << 3;

    const fillColor = `rgb(${red}, ${green}, ${blue})`;

    let strokeColor;
    if (IdenticonImageBuilder.getColorDistance({red: red, green: green, blue: blue}, {
      red: this.backgroundColor.red,
      green: this.backgroundColor.green,
      blue: this.backgroundColor.blue
    }) < 32.0) {
      const color = IdenticonImageBuilder.getComplementaryColor({red: red, green: green, blue: blue});
      strokeColor = `rgb(${color.red}, ${color.green}, ${color.blue})`;
    }

    ctx.fillStyle = `rgb(${this.backgroundColor.red},${this.backgroundColor.green},${this.backgroundColor.blue}`;
    ctx.fillRect(0, 0, size, size);

    const blockSize = Math.ceil(size / 3);
    const blockSize2 = Math.ceil(blockSize * 2);

    // middle patch
    this.drawPatch(ctx, blockSize, blockSize, blockSize, middleType, 0,
      middleInvert, fillColor, strokeColor);

    // side patchs, starting from top and moving clock-wise
    this.drawPatch(ctx, blockSize, 0, blockSize, sideType, sideTurn++, sideInvert,
      fillColor, strokeColor);
    this.drawPatch(ctx, blockSize2, blockSize, blockSize, sideType, sideTurn++,
      sideInvert, fillColor, strokeColor);
    this.drawPatch(ctx, blockSize, blockSize2, blockSize, sideType, sideTurn++,
      sideInvert, fillColor, strokeColor);
    this.drawPatch(ctx, 0, blockSize, blockSize, sideType, sideTurn++, sideInvert,
      fillColor, strokeColor);

    // corner patchs, starting from top left and moving clock-wise
    this.drawPatch(ctx, 0, 0, blockSize, cornerType, cornerTurn++, cornerInvert,
      fillColor, strokeColor);
    this.drawPatch(ctx, blockSize2, 0, blockSize, cornerType, cornerTurn++,
      cornerInvert, fillColor, strokeColor);
    this.drawPatch(ctx, blockSize2, blockSize2, blockSize, cornerType,
      cornerTurn++, cornerInvert, fillColor, strokeColor);
    this.drawPatch(ctx, 0, blockSize2, blockSize, cornerType, cornerTurn++,
      cornerInvert, fillColor, strokeColor);
  }

  private drawPatch(ctx, x: number, y: number, size: number, patch: number, turn: number, invert: boolean, fillColor: string, strokeColor: string) {
    patch %= PATCH_TYPES.length;
    turn %= 4;
    if ((PATCH_FLAGS[patch] & PATCH_INVERTED) != 0) {
      invert = !invert;
    }

    const scale = size / this.patchSize;
    const offset = size / 2.0;

    // paint background
    ctx.fillStyle = invert ? fillColor : `rgb(${this.backgroundColor.red},${this.backgroundColor.green},${this.backgroundColor.blue}`;
    ctx.fillRect(x, y, size, size);

    ctx.save();

    ctx.translate(x + offset, y + offset);
    ctx.scale(scale, scale);
    ctx.rotate(turn * 90 * (Math.PI / 180));

    if (strokeColor != null) {
      ctx.strokeStyle = strokeColor;
      ctx.beginPath();
      this.drawPath(ctx, patch);
      ctx.stroke();
    }

    ctx.fillStyle = invert ? `rgb(${this.backgroundColor.red},${this.backgroundColor.green},${this.backgroundColor.blue}` : fillColor;
    ctx.beginPath();
    this.drawPath(ctx, patch);
    ctx.fill();

    ctx.restore();
  }

  private drawPath(ctx, path: number): void {
    const patchOffset = this.patchSize / 2;
    const patchScale = this.patchSize / 4;

    let moveTo = true;
    const patchVertices = PATCH_TYPES[path];
    for (let j = 0; j < patchVertices.length; j++) {
      const v = patchVertices[j];
      if (v == PATCH_MOVETO) {
        moveTo = true;
      }
      const vx = ((v % PATCH_GRIDS) * patchScale) - patchOffset;
      const vy = Math.floor(v / PATCH_GRIDS) * patchScale - patchOffset;
      if (!moveTo) {
        ctx.lineTo(vx, vy);
      } else {
        moveTo = false;
        ctx.moveTo(vx, vy);
      }
    }
  }

  private static getColorDistance(color1: { red: number, green: number, blue: number }, color2: { red: number, green: number, blue: number }): number {
    const dx = color1.red - color2.red;
    const dy = color1.green - color2.green;
    const dz = color1.blue - color2.blue;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  private static getComplementaryColor(color: { red: number, green: number, blue: number }): { red: number, green: number, blue: number } {
    return {red: color.red ^ 0xFF, green: color.green ^ 0xFF, blue: color.blue ^ 0xFF};
  }
}

