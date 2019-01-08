import {
  AvatarBuilder,
  CircleMaskImageBuilder,
  ComposeImageBuilder,
  DEFAULT_COLORS,
  FillStyleImageBuilder,
  GridImageBuilder,
  GroupImageBuilder,
  LongShadowImageBuilder,
  MarginImageBuilder,
  RandomFillStyleImageBuilder,
  RandomImageBuilder,
  RoundedRectMaskImageBuilder,
  ScoreShadowImageBuilder,
  ShadowImageBuilder
} from './internal/core-avatar';
import {CatImageBuilder} from './internal/cat-avatar';
import {FemaleEightBitImageBuilder, MaleEightBitImageBuilder} from './internal/eight-bit-avatar';
import {GithubImageBuilder} from './internal/github-avatar';
import {IdenticonImageBuilder} from './internal/identicon-avatar';
import {SquareImageBuilder} from './internal/square-avatar';
import {TriangleImageBuilder} from './internal/triangle-avatar';
import {ComposeCache, FolderCache, LRUCache, MemoryCache} from './internal/cache';
import LRU from 'lru-cache';
import {IAvatarBuilder, ICache, IColor, IImageBuilder, IMargin, IOptions, IShadow} from './common';

namespace Avatar {

  /**
   * Build a avatar builder
   * @param imageBuilder a image builder (use Avatar.Image.)
   * @param width width of avatar result
   * @param height height of avatar result
   * @param options builder options (cache,...)
   */
  export function builder(imageBuilder: IImageBuilder, width: number, height: number, options?: IOptions): IAvatarBuilder {
    return new AvatarBuilder(imageBuilder, width, height, options);
  }

  /**
   * Create a builder for cat avatar
   * @param size width & height of image
   * @param options builder options (cache,...)
   */
  export function catBuilder(size: number = 256, options?: IOptions): IAvatarBuilder {
    return new AvatarBuilder(Image.cat(), size, size, options);
  }

  /**
   * Create a builder github avatar
   * @param size width & height of image
   * @param precision precision
   * @param options builder options (cache,...)
   */
  export function githubBuilder(size: number = 256, precision: number = 3, options?: IOptions): IAvatarBuilder {
    return new AvatarBuilder(Image.github(precision), size, size, options);
  }

  /**
   * Create a builder triangle avatar
   * @param size width & height of image
   * @param precision triangle precision
   * @param colors list of colors
   * @param options builder options (cache,...)
   */
  export function triangleBuilder(size: number = 256, precision: number = 4, colors: string[] = DEFAULT_COLORS, options?: IOptions): IAvatarBuilder {
    return new AvatarBuilder(Image.triangle(precision, colors), size, size, options);
  }

  /**
   * Create a builder identicon avatar
   * @param size width & height of image
   * @param options builder options (cache,...)
   * @constructor
   */
  export function identiconBuilder(size: number = 256, options?: IOptions): IAvatarBuilder {
    return new AvatarBuilder(Image.identicon(), size, size, options);
  }

  /**
   * Create a builder avatar like min block https://github.com/flouthoc/minBlock.js
   * @param size width & height of image
   * @param precision block number for line
   * @param colors list of colors
   * @param options builder options (cache,...)
   */
  export function squareBuilder(size: number = 256, precision: number = 3, colors: string[] = DEFAULT_COLORS, options?: IOptions): IAvatarBuilder {
    return new AvatarBuilder(Image.square(precision, colors), size, size, options);
  }

  /**
   * Build avatar with 8bit female
   * @param size width & height of image
   * @param options builder options (cache,...)
   */
  export function female8bitBuilder(size: number = 256, options?: IOptions): IAvatarBuilder {
    return new AvatarBuilder(new FemaleEightBitImageBuilder(), size, size, options);
  }

  /**
   * Build avatar with 8bit male
   * @param size width & height of image
   * @param options builder options (cache,...)
   */
  export function male8bitBuilder(size: number = 256, options?: IOptions): IAvatarBuilder {
    return new AvatarBuilder(new MaleEightBitImageBuilder(), size, size, options);
  }

  export namespace Image {

    /**
     * Compose multi image builder
     * @param imageBuilders image builder to compose (in order)
     */
    export function compose(...imageBuilders: IImageBuilder[]): IImageBuilder {
      return new ComposeImageBuilder(imageBuilders);
    }

    /**
     * Random choosing avatar (by id)
     * @param imageBuilders
     */
    export function random(...imageBuilders: IImageBuilder[]): IImageBuilder {
      return new RandomImageBuilder(imageBuilders);
    }

    /**
     * Add margin to child image builder
     * @param imageBuilder child image builder
     * @param margin size of margin
     */
    export function margin(imageBuilder: IImageBuilder, margin: number | IMargin = 10): IImageBuilder {
      return new MarginImageBuilder(imageBuilder, margin);
    }

    /**
     * Create a image with background fill style
     * @param fillStyle canvas fill style (color, gradient)
     */
    export function fillStyle(fillStyle: any): IImageBuilder {
      return new FillStyleImageBuilder(fillStyle);
    }

    /**
     * Create a image with background random fill style
     * @param fillStyles canvas fill style (color, gradient)
     */
    export function randomFillStyle(fillStyles: any[] = DEFAULT_COLORS): IImageBuilder {
      return new RandomFillStyleImageBuilder(fillStyles);
    }

    /**
     * Create a circle mask with child image
     * @param imageBuilder child image builder
     */
    export function circleMask(imageBuilder: IImageBuilder): IImageBuilder {
      return new CircleMaskImageBuilder(imageBuilder);
    }

    /**
     * Create a rounded rect mask with child image
     * @param imageBuilder child image
     * @param radius radius of rounded
     */
    export function roundedRectMask(imageBuilder: IImageBuilder, radius: number = 10): IImageBuilder {
      return new RoundedRectMaskImageBuilder(imageBuilder, radius);
    }

    /**
     * Create a shadow below child image
     * @param imageBuilder child image
     * @param shadow shadow option
     */
    export function shadow(imageBuilder: IImageBuilder, shadow: IShadow = {blur: 10, color: '#000000', offsetX: 0, offsetY: 0}): IImageBuilder {
      return new ShadowImageBuilder(imageBuilder, shadow);
    }

    /**
     * Create a score shadow (half-image shadow)
     * @param imageBuilder child image
     * @param shadowColor shadow color
     */
    export function scoreShadow(imageBuilder: IImageBuilder, shadowColor: IColor = {red: 0, green: 0, blue: 0, alpha: 24}): IImageBuilder {
      return new ScoreShadowImageBuilder(imageBuilder, shadowColor);
    }

    /**
     * Create a long shadow
     * @param imageBuilder child image
     * @param shadowColor shadow color
     */
    export function longShadow(imageBuilder: IImageBuilder, shadowColor: IColor = {red: 0, green: 0, blue: 0, alpha: 64}): IImageBuilder {
      return new LongShadowImageBuilder(imageBuilder, shadowColor);
    }

    /**
     *
     * @param pathLocation
     * @param groups
     */
    export function group(pathLocation: string, groups: string[][]): IImageBuilder {
      return new GroupImageBuilder(pathLocation, groups);
    }

    /**
     * Identicon image
     * @param patchSize size of patch
     * @param backgroundColor background color
     */
    export function identicon(patchSize = 20, backgroundColor = {red: 255, green: 255, blue: 255}): IdenticonImageBuilder {
      return new IdenticonImageBuilder(patchSize, backgroundColor);
    }

    /**
     * Mini block image
     * @param precision number of block by line
     * @param colors list of colors
     */
    export function square(precision: number = 3, colors: any[] = DEFAULT_COLORS): IImageBuilder {
      return new SquareImageBuilder(precision, colors);
    }

    /**
     * Triangle image
     * @param precision
     * @param colors list of colors
     */
    export function triangle(precision: number = 4, colors: any[] = DEFAULT_COLORS): IImageBuilder {
      return new TriangleImageBuilder(precision, colors);
    }

    /**
     * Github image generator
     * @param precision
     */
    export function github(precision: number = 3): IImageBuilder {
      return new GithubImageBuilder(precision);
    }

    /**
     * Cat avatar image
     */
    export function cat(): IImageBuilder {
      return new CatImageBuilder();
    }

    /**
     * 8bit male avatar
     */
    export function male8bit(): IImageBuilder {
      return new MaleEightBitImageBuilder();
    }

    /**
     * 8bit female avatar
     */
    export function female8bit(): IImageBuilder {
      return new FemaleEightBitImageBuilder();
    }

    /**
     * Create a grid avatar, call gridx * gridy times iage builder
     * @param imageBuilder
     * @param gridx number of element for x
     * @param gridy number of element for y
     */
    export function grid(imageBuilder: IImageBuilder, gridx: number, gridy: number): IImageBuilder {
      return new GridImageBuilder(imageBuilder, gridx, gridy);
    }
  }

  export namespace Cache {

    /**
     * Memory cache
     */
    export function memory(): ICache {
      return new MemoryCache();
    }

    /**
     * LRU cache
     * @param options
     */
    export function lru(options: LRU.Options<string, Buffer> = {max: 50}): ICache {
      return new LRUCache();
    }

    /**
     * Folder cache
     * @param location
     */
    export function folder(location: string = './tmp/avatar'): ICache {
      return new FolderCache(location)
    }

    /**
     * Compose multi cache
     * @param caches
     */
    export function compose(...caches: ICache[]): ICache {
      return new ComposeCache(caches);
    }
  }
}

export default Avatar;
module.exports = Avatar;
