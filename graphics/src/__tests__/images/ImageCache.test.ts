import { Image, ImageCache } from '../../images/index.js';
import { Color } from '../../Color.js';

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
