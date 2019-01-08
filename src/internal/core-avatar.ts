import {Canvas, createCanvas, loadImage} from 'canvas';
import path from 'path';
import fs from 'fs';
import seedrandom from 'seedrandom';
import {LRUCache} from './cache';
import {IAvatarBuilder, IColor, IImageBuilder, IMargin, IOptions, IRandom, IShadow} from '../common';

export const DEFAULT_COLORS = [
  '#6e1e78', '#82be00', '#a1006b', '#009aa6', '#cd0037', '#0088ce', '#e05206', '#d52b1e', '#ffb612', '#d2e100'
];

const DEFAULT_OPTIONS: IOptions = {
  cache: new LRUCache()
};

export class Random implements IRandom {

  constructor(
    private rng: any
  ) {
  }

  /**
   * Next double [0..1[
   */
  nextDouble(): number {
    return this.rng();
  }

  /**
   * Next integer [0..max[
   * @param max
   */
  nextInt(max: number): number {
    return Math.floor(max * this.rng());
  }
}

export class AvatarBuilder implements IAvatarBuilder {

  public readonly options: IOptions;

  constructor(
    private imageBuilder: IImageBuilder,
    public readonly width: number,
    public readonly height: number,
    options?: IOptions
  ) {
    if (options) {
      this.options = {...DEFAULT_OPTIONS, ...options};
    } else {
      this.options = DEFAULT_OPTIONS;
    }
  }

  create(id: string): Promise<Buffer> {
    if (!this.options.cache) {
      return this.createBuffer(id);
    }
    return this.options.cache.getOrCreate(id, () => this.createBuffer(id));
  }

  private async createBuffer(id: string): Promise<Buffer> {
    const random = new Random(seedrandom(id));
    const canvas = await this.imageBuilder.buildImage(this, random, this.width, this.height);
    return canvas.toBuffer();
  }
}

/**
 * Compose multi builder
 */
export class ComposeImageBuilder implements IImageBuilder {

  constructor(
    private imageBuilders: IImageBuilder[]
  ) {
  }

  async buildImage(avatarBuilder: IAvatarBuilder, random: IRandom, width: number, height: number): Promise<Canvas> {
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    for (const imageBuilder of this.imageBuilders) {
      const image = await imageBuilder.buildImage(avatarBuilder, random, width, height);
      ctx.drawImage(image, 0, 0);
    }

    return canvas;
  }
}

/**
 * Random avatar builder, choose random builder
 */
export class RandomImageBuilder implements IImageBuilder {

  constructor(
    private imageBuilders: IImageBuilder[]
  ) {
  }

  async buildImage(avatarBuilder: IAvatarBuilder, random: IRandom, width: number, height: number): Promise<Canvas> {
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    const index = random.nextInt(this.imageBuilders.length);
    const image = await this.imageBuilders[index].buildImage(avatarBuilder, random, width, height);
    ctx.drawImage(image, 0, 0);

    return canvas;
  }
}

/**
 * Add margin in child
 */
export class MarginImageBuilder implements IImageBuilder {

  private margin: IMargin;

  constructor(
    private imageBuilder: IImageBuilder,
    margin: number | IMargin = 10
  ) {
    if (margin instanceof Object) {
      this.margin = <IMargin>margin;
    } else {
      const num = margin as number;
      this.margin = {top: num, bottom: num, left: num, right: num};
    }
  }

  async buildImage(avatarBuilder: IAvatarBuilder, random: IRandom, width: number, height: number): Promise<Canvas> {
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    const imgWidth = width - (this.margin.left + this.margin.right);
    const imgHeight = height - (this.margin.top + this.margin.bottom);

    const image = await this.imageBuilder.buildImage(avatarBuilder, random, imgWidth, imgHeight);

    ctx.drawImage(image, this.margin.left, this.margin.top);

    return canvas;
  }
}

/**
 * Fill background with color
 */
export class FillStyleImageBuilder implements IImageBuilder {

  constructor(
    private fillStyle: any
  ) {
  }

  async buildImage(avatarBuilder: IAvatarBuilder, random: IRandom, width: number, height: number): Promise<Canvas> {
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = this.fillStyle;
    ctx.fillRect(0, 0, width, height);

    return canvas;
  }
}

/**
 * Fill background with random color
 */
export class RandomFillStyleImageBuilder implements IImageBuilder {

  constructor(
    private fillStyles: any[] = DEFAULT_COLORS
  ) {
  }

  async buildImage(avatarBuilder: IAvatarBuilder, random: IRandom, width: number, height: number): Promise<Canvas> {
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    const index = random.nextInt(this.fillStyles.length);
    ctx.fillStyle = this.fillStyles[index];
    ctx.fillRect(0, 0, width, height);

    return canvas;
  }
}

/**
 * Circle mask in child
 */
export class CircleMaskImageBuilder implements IImageBuilder {

  constructor(
    private imageBuilder: IImageBuilder
  ) {
  }

  async buildImage(avatarBuilder: IAvatarBuilder, random: IRandom, width: number, height: number): Promise<Canvas> {
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    const image = await this.imageBuilder.buildImage(avatarBuilder, random, width, height);

    ctx.beginPath();
    ctx.ellipse(width / 2, height / 2, width / 2, height / 2, 0, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(image, 0, 0);
    return canvas;
  }
}

/**
 * Rounded rect mask in child
 */
export class RoundedRectMaskImageBuilder implements IImageBuilder {

  private corner;

  constructor(
    private imageBuilder: IImageBuilder,
    radius: number = 10
  ) {
    this.corner = {tl: radius, tr: radius, br: radius, bl: radius};
  }

  async buildImage(avatarBuilder: IAvatarBuilder, random: IRandom, width: number, height: number): Promise<Canvas> {
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    const image = await this.imageBuilder.buildImage(avatarBuilder, random, width, height);

    ctx.beginPath();
    ctx.moveTo(this.corner.tl, 0);
    ctx.lineTo(width - this.corner.tr, 0);
    ctx.quadraticCurveTo(width, 0, width, this.corner.tr);
    ctx.lineTo(width, height - this.corner.br);
    ctx.quadraticCurveTo(width, height, width - this.corner.br, height);
    ctx.lineTo(this.corner.bl, height);
    ctx.quadraticCurveTo(0, height, 0, height - this.corner.bl);
    ctx.lineTo(0, this.corner.tl);
    ctx.quadraticCurveTo(0, 0, this.corner.tl, 0);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(image, 0, 0);
    return canvas;
  }
}

/**
 * Add a shadow
 */
export class ShadowImageBuilder implements IImageBuilder {

  constructor(
    private imageBuilder: IImageBuilder,
    private shadow: IShadow = {blur: 10, color: '#000000', offsetX: 0, offsetY: 0}
  ) {
  }

  async buildImage(avatarBuilder: IAvatarBuilder, random: IRandom, width: number, height: number): Promise<Canvas> {
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    ctx.shadowBlur = this.shadow.blur;
    ctx.shadowColor = this.shadow.color;
    ctx.shadowOffsetX = this.shadow.offsetX;
    ctx.shadowOffsetY = this.shadow.offsetY;

    const image = await this.imageBuilder.buildImage(avatarBuilder, random, width, height);
    ctx.drawImage(image, 0, 0);

    return canvas;
  }
}

/**
 * Add a score shadow
 */
export class ScoreShadowImageBuilder implements IImageBuilder {

  constructor(
    private imageBuilder: IImageBuilder,
    private shadowColor: IColor = {red: 0, green: 0, blue: 0, alpha: 24}
  ) {
  }

  async buildImage(avatarBuilder: IAvatarBuilder, random: IRandom, width: number, height: number): Promise<Canvas> {
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    const image = await this.imageBuilder.buildImage(avatarBuilder, random, width, height);
    ctx.drawImage(image, 0, 0);

    const score = this.createScore(width, height);
    ctx.drawImage(score, 0, 0);

    return canvas;
  }

  private createScore(width: number, height: number): Canvas {
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    const score = ctx.getImageData(0, 0, width, height);
    let i = 0;
    for (let y = 0; y < height / 2; y++) {
      for (let x = 0; x < width; x++) {
        score.data[i] = this.shadowColor.red;  // R value
        score.data[i + 1] = this.shadowColor.green;    // G value
        score.data[i + 2] = this.shadowColor.blue;  // B value
        score.data[i + 3] = this.shadowColor.alpha;  // A value
        i += 4;
      }
    }
    ctx.putImageData(score, 0, 0);

    return canvas;
  }
}

/**
 * Add long shadow behind
 */
export class LongShadowImageBuilder implements IImageBuilder {

  constructor(
    private imageBuilder: IImageBuilder,
    private shadowColor: IColor = {red: 0, green: 0, blue: 0, alpha: 64}
  ) {
  }

  async buildImage(avatarBuilder: IAvatarBuilder, random: IRandom, width: number, height: number): Promise<Canvas> {
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    const image = await this.imageBuilder.buildImage(avatarBuilder, random, width, height);

    const score = this.createLong(image, width, height);
    ctx.drawImage(score, 0, 0);

    ctx.drawImage(image, 0, 0);

    return canvas;
  }

  private createLong(image: any, width: number, height: number): Canvas {
    const imageData = image.getContext('2d').getImageData(0, 0, width, height);

    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    const score = ctx.getImageData(0, 0, width, height);

    const n = this.shadowColor.alpha;
    const step = n / (width + height);

    let i = 0;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (LongShadowImageBuilder.isInShade(imageData, x, y)) {
          const alpha = (n - ((x + y) * step));

          score.data[i] = this.shadowColor.red;  // R value
          score.data[i + 1] = this.shadowColor.green;    // G value
          score.data[i + 2] = this.shadowColor.blue;  // B value
          score.data[i + 3] = alpha;  // A value
        }
        i += 4;
      }
    }
    ctx.putImageData(score, 0, 0);

    return canvas;
  }

  private static isInShade(imageData: any, x: number, y: number): boolean {
    let tx = x;
    let ty = y;
    while (true) {
      tx -= 1;
      ty -= 1;
      if (tx < 0 || ty < 0) {
        return false;
      } else {
        const alpha = imageData.data[ty * imageData.width * 4 + tx * 4 + 3];
        if (alpha > 0) {
          return true;
        }
      }
    }
  }
}

/**
 * Avatar with images folder
 */
export class GroupImageBuilder implements IImageBuilder {

  private partMap: Object;

  constructor(
    pathLocation: string,
    private groups: string[][]
  ) {
    this.partMap = GroupImageBuilder.buildPartMap(pathLocation);
  }

  async buildImage(avatarBuilder: IAvatarBuilder, random: IRandom, width: number, height: number): Promise<Canvas> {
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    const group = this.groups[random.nextInt(this.groups.length)];
    for (const part of group) {
      const fileNames = this.partMap[part];
      const fileName = fileNames[random.nextInt(fileNames.length)];

      const image = await loadImage(fileName);

      ctx.drawImage(image, 0, 0, width, height);
    }

    return canvas;
  }

  private static buildPartMap(partsLocation) {
    const regex = new RegExp('.png$', 'i');
    const dirs = fs
      .readdirSync(partsLocation)
      .filter(partsDir =>
        fs.statSync(path.join(partsLocation, partsDir)).isDirectory()
      );

    return dirs.reduce((parts, ps) => {
      const dir = path.join(partsLocation, ps);
      parts[ps] = fs.readdirSync(dir).filter(fileName =>
        regex.exec(fileName)).map(fileName => path.join(dir, fileName));
      return parts;
    }, {});
  }
}

/**
 * Grid builder
 */
export class GridImageBuilder implements IImageBuilder {

  constructor(
    private imageBuilders: IImageBuilder,
    private gridx: number,
    private gridy: number
  ) {
  }

  async buildImage(avatarBuilder: IAvatarBuilder, random: IRandom, width: number, height: number): Promise<Canvas> {
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    const sizex = Math.ceil(width / this.gridx);
    const sizey = Math.ceil(height / this.gridy);

    for (let y = 0; y < this.gridy; y++) {
      for (let x = 0; x < this.gridx; x++) {
        const image = await this.imageBuilders.buildImage(avatarBuilder, random, sizex, sizey);
        ctx.drawImage(image, x * sizex, y * sizey);
      }
    }

    return canvas;
  }
}
