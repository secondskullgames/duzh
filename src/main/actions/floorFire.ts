import { recordKill } from './recordKill';
import { die } from './die';
import { dealDamage } from './dealDamage';
import Unit from '../entities/units/Unit';
import { ItemProcContext } from '../items/ItemProc';
import { playAnimation } from '../graphics/animations/playAnimation';
import { playSound } from '../sounds/playSound';
import Sounds from '../sounds/Sounds';
import AnimationFactory from '../graphics/animations/AnimationFactory';
import Coordinates from '../geometry/Coordinates';

export const floorFire = async (
  unit: Unit,
  damage: number,
  { state, map, session }: ItemProcContext
) => {
  // TODO - optimization opportunity
  const adjacentUnits: Unit[] = map.getAllUnits().filter(u => {
    const { dx, dy } = Coordinates.difference(unit.getCoordinates(), u.getCoordinates());
    return [-1, 0, 1].includes(dx) && [-1, 0, 1].includes(dy) && !(dx === 0 && dy === 0);
  });

  playSound(Sounds.PLAYER_HITS_ENEMY);
  const animation = await AnimationFactory.getFloorFireAnimation(unit, adjacentUnits, {
    map,
    imageFactory: session.getImageFactory()
  });
  await playAnimation(animation, { map });

  for (const adjacentUnit of adjacentUnits) {
    await dealDamage(damage, {
      sourceUnit: unit,
      targetUnit: adjacentUnit
    });

    if (adjacentUnit.getLife() <= 0) {
      await die(adjacentUnit, { map, session });
      recordKill(unit, adjacentUnit, session);
    }
  }
};
