import {Canvas} from 'canvas';

/**
 * Interface for margin image builder
 */
export interface IMargin {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

/**
 * Parameter for shadow
 */
export interface IShadow {
  blur: number;
  color: any;
  offsetX: number;
  offsetY: number;
}

/**
 * Color
 */
export interface IColor {
  red: number;
  green: number;
  blue: number;
  alpha: number;
}

/**
 * Interface for options for avatar builder
 */
export interface IOptions {
  cache?: ICache
}

/**
 * Interface for random
 */
export interface IRandom {

  /**
   * Next double [0..1[
   */
  nextDouble(): number;

  /**
   * Next integer [0..max[
   * @param max
   */
  nextInt(max: number): number;

}

/**
 * Interface for avatar builder
 */
export interface IAvatarBuilder {

  readonly width: number;
  readonly height: number;
  readonly options: IOptions;

  /**
   * Create a avatar image, png buffer
   * @param id identifier
   */
  create(id: string): Promise<Buffer>;

}

/**
 * Interface for image builder
 */
export interface IImageBuilder {

  /**
   * Build a avatar, return canvas
   * @param avatarBuilder Current avatar builder
   * @param random random
   * @param width size
   * @param height size
   */
  buildImage(avatarBuilder: IAvatarBuilder, random: IRandom, width: number, height: number): Promise<Canvas>;

}

/**
 * Interface for cache
 */
export interface ICache {

  /**
   * Get a buffer from cache with id, if not found use createCallback
   * @param id identifier
   * @param createCallback create buffer
   */
  getOrCreate(id: string, createCallback: () => Promise<Buffer>): Promise<Buffer>

}
