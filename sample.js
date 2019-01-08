const Avatar = require('./lib');
const {createCanvas} = require('canvas');
const fs = require('fs');

if (!fs.existsSync('./tmp')) {
  fs.mkdirSync(location, {recursive: true});
}

// General

const generalAvatar = Avatar.builder(Avatar.Image.margin(Avatar.Image.circleMask(Avatar.Image.identicon())), 128, 128);
generalAvatar.create('gabriel').then(buffer => fs.writeFileSync('tmp/avatar-gabriel.png', buffer));
generalAvatar.create('allaigre').then(buffer => fs.writeFileSync('tmp/avatar-allaigre.png', buffer));

// Cat example

const catAvatar = Avatar.catBuilder(256);

catAvatar.create('sample2-1').then(buffer => fs.writeFileSync('tmp/sample2-1.png', buffer));
catAvatar.create('sample2-2').then(buffer => fs.writeFileSync('tmp/sample2-2.png', buffer));

Avatar.builder(Avatar.Image.compose(Avatar.Image.fillStyle('#FAFAFA'), Avatar.Image.cat()), 256, 256).create('sample2-3').then(buffer => fs.writeFileSync('tmp/sample2-3.png', buffer));

// Github example

Avatar.githubBuilder(128).create('sample3').then(buffer => fs.writeFileSync('tmp/sample3-1.png', buffer));
Avatar.builder(Avatar.Image.compose(Avatar.Image.fillStyle('#FAFAFA'), Avatar.Image.github()), 128, 128).create('sample3').then(buffer => fs.writeFileSync('tmp/sample3-2.png', buffer));

// Square example

Avatar.squareBuilder(128).create('sample5-1').then(buffer => fs.writeFileSync('tmp/sample5-1.png', buffer));
Avatar.squareBuilder(128, 6).create('sample5-2').then(buffer => fs.writeFileSync('tmp/sample5-2.png', buffer));

// Custome image builder

Avatar.builder(Avatar.Image.compose(Avatar.Image.fillStyle('#FAFAFA'), Avatar.Image.grid({
  buildImage: function (avatarBuilder, random, width, height) {
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    const nb = random.nextInt(10) + 10;
    for (let i = 0; i < nb; i++) {
      const red = random.nextInt(256);
      const green = random.nextInt(256);
      const blue = random.nextInt(256);

      ctx.fillStyle = `rgb(${red},${green},${blue})`;

      const x = random.nextInt(width);
      const y = random.nextInt(height);

      ctx.fillRect(x, y, random.nextInt(width - x), random.nextInt(height - y));
    }

    return Promise.resolve(canvas);
  }
}, 2, 2)), 256, 256).create('sample3').then(buffer => fs.writeFileSync('tmp/sample4.png', buffer));

// Big example

const width = 1024;
const height = 512;
const size = 64;

const avatar = Avatar.builder(Avatar.Image.grid(Avatar.Image.random(
  Avatar.Image.compose(Avatar.Image.fillStyle('#FAFAFA'), Avatar.Image.cat()),
  Avatar.Image.compose(Avatar.Image.fillStyle('#FAFAFA'), Avatar.Image.longShadow(Avatar.Image.margin(Avatar.Image.cat()))),
  Avatar.Image.compose(
    Avatar.Image.fillStyle('#FFFFFF'),
    Avatar.Image.margin(Avatar.Image.circleMask(Avatar.Image.compose(
      Avatar.Image.randomFillStyle(),
      Avatar.Image.longShadow(Avatar.Image.margin(Avatar.Image.cat()))
      )
    ), 5)),
  Avatar.Image.compose(
    Avatar.Image.fillStyle('#FFFFFF'),
    Avatar.Image.margin(Avatar.Image.roundedRectMask(Avatar.Image.scoreShadow(Avatar.Image.compose(
      Avatar.Image.randomFillStyle(),
      Avatar.Image.margin(Avatar.Image.cat())
      )
    )), 5)
  ),
  Avatar.Image.female8bit(),
  Avatar.Image.compose(Avatar.Image.fillStyle('#FFFFFF'), Avatar.Image.circleMask(Avatar.Image.female8bit())),
  Avatar.Image.male8bit(),
  Avatar.Image.compose(Avatar.Image.fillStyle('#FFFFFF'), Avatar.Image.roundedRectMask(Avatar.Image.male8bit())),
  Avatar.Image.compose(Avatar.Image.fillStyle('#FFFFFF'), Avatar.Image.github()),
  Avatar.Image.compose(Avatar.Image.fillStyle('#FFFFFF'), Avatar.Image.triangle()),
  Avatar.Image.identicon(),
  Avatar.Image.square()
), width / size, height / size), width, height, {
  cache: Avatar.Cache.compose(Avatar.Cache.lru(), Avatar.Cache.folder())
});

avatar.create('sample1').then(buffer => fs.writeFileSync('tmp/sample1.png', buffer));

// Triangle

Avatar.builder(Avatar.Image.grid(Avatar.Image.triangle(), 4, 1), 512, 128).create('gabriel').then(buffer => fs.writeFileSync('tmp/triangle1.png', buffer));

// Square

Avatar.builder(Avatar.Image.grid(Avatar.Image.square(), 4, 1), 512, 128).create('gabriel').then(buffer => fs.writeFileSync('tmp/square1.png', buffer));

// Identicon

Avatar.builder(Avatar.Image.grid(Avatar.Image.identicon(), 4, 1), 512, 128).create('gabriel').then(buffer => fs.writeFileSync('tmp/identicon1.png', buffer));

// Github

Avatar.builder(Avatar.Image.grid(Avatar.Image.github(), 4, 1), 512, 128).create('gabriel').then(buffer => fs.writeFileSync('tmp/github1.png', buffer));

// Cat

Avatar.builder(Avatar.Image.grid(Avatar.Image.cat(), 4, 1), 512, 128).create('gabriel').then(buffer => fs.writeFileSync('tmp/cat1.png', buffer));

Avatar.builder(Avatar.Image.grid(
  Avatar.Image.margin(Avatar.Image.roundedRectMask(Avatar.Image.compose(
    Avatar.Image.randomFillStyle(),
    Avatar.Image.shadow(Avatar.Image.margin(Avatar.Image.cat(), 8), {blur: 5, offsetX: 2.5, offsetY: -2.5, color: 'rgba(0,0,0,0.75)'})
  ), 32), 8), 4, 1), 512, 128).create('gabriel').then(buffer => fs.writeFileSync('tmp/cat2.png', buffer));

// Male 8bit

Avatar.builder(Avatar.Image.grid(Avatar.Image.male8bit(), 4, 1), 512, 128).create('gabriel').then(buffer => fs.writeFileSync('tmp/8bitmale.png', buffer));

// Female 8bit

Avatar.builder(Avatar.Image.grid(Avatar.Image.female8bit(), 4, 1), 512, 128).create('gabriel').then(buffer => fs.writeFileSync('tmp/8bitfemale.png', buffer));
