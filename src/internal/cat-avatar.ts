import path from 'path';
import {GroupImageBuilder} from './core-avatar';

const GROUPS = [
  ['bodies', 'furs', 'eyes', 'mouths'],
  ['bodies', 'furs', 'eyes', 'mouths', 'accessories'],
  ['bodies', 'furs', 'eyes', 'mouths', 'zzs',]
];

export class CatImageBuilder extends GroupImageBuilder {

  constructor() {
    super(path.join(__dirname, '../../assets/cat'), GROUPS);
  }
}
