import type { Animation } from './Animation';
import GameRenderer from '../renderers/GameRenderer';
import { sleep } from '../../utils/promises';
import GameState from '../../core/GameState';

export const playAnimation = async (animation: Animation) => {
  const state = GameState.getInstance();
  const renderer = GameRenderer.getInstance();
  const map = state.getMap();

  for (let i = 0; i < animation.frames.length; i++) {
    const frame = animation.frames[i];
    for (const projectile of (frame.projectiles ?? [])) {
      map.projectiles.add(projectile);
    }
    for (let j = 0; j < frame.units.length; j++) {
      const { unit, activity, frameNumber, direction } = frame.units[j];
      unit.setActivity(activity, frameNumber ?? 1, direction ?? unit.getDirection());
    }

    await renderer.render();

    if (!!frame.postDelay) {
      console.log(`sleep ${frame.postDelay}`);
      await sleep(frame.postDelay);
    }

    for (const projectile of (frame.projectiles ?? [])) {
      map.removeProjectile(projectile);
    }
  }
};