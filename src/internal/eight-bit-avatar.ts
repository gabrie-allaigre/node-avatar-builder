import path from 'path';
import {GroupImageBuilder} from './core-avatar';

const GROUPS = [
  ['background', 'face', 'clothes', 'hair', 'eye', 'mouth']
];

export class EightBitImageBuilder extends GroupImageBuilder {

  constructor(sexe: 'female' | 'male') {
    super(path.join(__dirname, '../../assets/8bit', sexe), GROUPS);
  }
}

export class FemaleEightBitImageBuilder extends EightBitImageBuilder {

  constructor() {
    super('female');
  }
}

export class MaleEightBitImageBuilder extends EightBitImageBuilder {

  constructor() {
    super('male');
  }
}
