import type { Animation } from './Animation';
import { sleep } from '../../utils/promises';
import { GlobalContext } from '../../core/GlobalContext';

export const playAnimation = async (
  animation: Animation,
  context: GlobalContext
) => {
  const map = context.state.getMap();

  for (let i = 0; i < animation.frames.length; i++) {
    const frame = animation.frames[i];
    for (const projectile of (frame.projectiles ?? [])) {
      map.projectiles.add(projectile);
    }
    for (let j = 0; j < frame.units.length; j++) {
      const { unit, activity, frameNumber, direction } = frame.units[j];
      unit.setActivity(activity, frameNumber ?? 1, direction ?? unit.getDirection());
    }

    if (!!frame.postDelay) {
      await sleep(frame.postDelay);
    }

    for (const projectile of (frame.projectiles ?? [])) {
      map.removeProjectile(projectile);
    }
  }
};