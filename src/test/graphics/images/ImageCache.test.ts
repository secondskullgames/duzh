import ImageCache from '../../../main/graphics/images/ImageCache';
import Color from '../../../main/graphics/Color';
import Image from '../../../main/graphics/images/Image';

test('caches and retrieves an image', () => {
  const cache = ImageCache.create();
  const key = {
    filename: 'test',
    transparentColor: Color.fromHex('#ffffff')
  };
  const image = {} as Image;
  cache.put(key, image);
  expect(cache.get(key)).toBe(image);
});