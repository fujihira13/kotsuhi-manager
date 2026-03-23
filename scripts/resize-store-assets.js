import sharp from 'sharp';

const icon = sharp('mobile/assets/images/icon.png');
const featureGraphic = sharp('mobile/assets/images/feature-graphic.png');

await icon
  .resize(512, 512)
  .toFile('mobile/assets/images/icon-512x512.png');
console.log('icon-512x512.png 生成完了');

await featureGraphic
  .resize(1024, 500, { fit: 'cover' })
  .toFile('mobile/assets/images/feature-graphic-1024x500.png');
console.log('feature-graphic-1024x500.png 生成完了');
