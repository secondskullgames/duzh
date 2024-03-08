import { ImageCache } from '@lib/graphics/images/ImageCache';
import { Color } from '@lib/graphics/Color';
import { Image } from '@lib/graphics/images/Image';

test('caches and retrieves an image', () => {
  const cache = new ImageCache();
  const key = {
    filename: 'test',
    transparentColor: Color.fromHex('#ffffff')
  };
  const image = {} as Image;
  cache.put(key, image);
  expect(cache.get(key)).toBe(image);
});
