import path from 'path';
import fs from 'fs';
import LRU from 'lru-cache';
import {ICache} from '../common';

export class MemoryCache implements ICache {

  private map: { [key: string]: Buffer } = {};

  async getOrCreate(id: string, createCallback: () => Promise<Buffer>): Promise<Buffer> {
    let element = this.map[id];
    if (!element) {
      element = await createCallback();
      this.map[id] = element;
    }
    return element;
  }
}

export class LRUCache implements ICache {

  private lru: LRU.Cache<string, Buffer>;

  constructor(options: LRU.Options<string, Buffer> = {max: 50}) {
    this.lru = new LRU<string, Buffer>(options);
  }

  async getOrCreate(id: string, createCallback: () => Promise<Buffer>): Promise<Buffer> {
    let element = this.lru.get(id);
    if (!element) {
      element = await createCallback();
      this.lru.set(id, element);
    }
    return element;
  }
}

export class FolderCache implements ICache {

  constructor(
    private location: string = './tmp/avatar'
  ) {
    if (!fs.existsSync(location)) {
      fs.mkdirSync(location, {recursive: true});
    }
  }

  async getOrCreate(id: string, createCallback: () => Promise<Buffer>): Promise<Buffer> {
    const file = path.join(this.location, `${id}.png`);
    if (fs.existsSync(file)) {
      return fs.readFileSync(file);
    }

    const buffer = await createCallback();
    fs.writeFileSync(file, buffer);
    return buffer;
  }
}

export class ComposeCache implements ICache {

  constructor(
    private caches: ICache[]
  ) {
  }

  getOrCreate(id: string, createCallback: () => Promise<Buffer>): Promise<Buffer> {
    return ComposeCache._getOrCreate(this.caches, id, createCallback);
  }

  private static _getOrCreate(caches: ICache[], id: string, createCallback: () => Promise<Buffer>): Promise<Buffer> {
    const [first, ...rest] = caches;
    return first.getOrCreate(id, rest.length === 0 ? createCallback : () => {
      return ComposeCache._getOrCreate(rest, id, createCallback);
    });
  }
}
