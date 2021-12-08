import Avatar from './lib';
import fs from 'fs';

if (!fs.existsSync('./tmp')) {
  fs.mkdirSync('./tmp', {recursive: true});
}

const generalAvatar = Avatar.builder(Avatar.Image.margin(Avatar.Image.circleMask(Avatar.Image.identicon())), 128, 128);
generalAvatar.create('gabriel').then(buffer => fs.writeFileSync('tmp/avatar-gabriel.png', buffer));
generalAvatar.create('allaigre').then(buffer => fs.writeFileSync('tmp/avatar-allaigre.png', buffer));