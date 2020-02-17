import Sprite from '../classes/Sprite';
import { chainPromises } from './PromiseUtils';

function playAnimation(sprite: Sprite, keys: string[], delay: number) {
  const currentKey = sprite.key;
  const renderer = jwb.renderer;
  const promises = [];
  keys.forEach(key => {
    promises.push(() => new Promise(resolve => {
      sprite.setImage(key);
      setTimeout(() => {
        renderer.render()
          .then(() => resolve());
      }, delay);
    }));
  });
  return chainPromises(promises)
    .then(() => sprite.setImage(currentKey))
    .then(() => renderer.render());
}

export {
  playAnimation
};