import Sprite from './Sprite';
import { chainPromises } from '../../utils/PromiseUtils';

function playAnimation(sprite: Sprite, keys: string[], delay: number) {
  const { renderer } = jwb;
  const promises: (() => Promise<any>)[] = [];
  keys.forEach(key => {
    promises.push(() => new Promise(resolve => {
      sprite.setImage(key)
        .then(() => renderer.render())
        .then(() => {
          setTimeout(() => { resolve(); }, delay);
        });
    }));
  });
  return chainPromises(promises)
    .then(() => sprite.setImage(sprite.defaultKey))
    .then(() => renderer.render());
}

export {
  playAnimation
};