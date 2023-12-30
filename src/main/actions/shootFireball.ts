import { dealDamage } from './dealDamage';
import { die } from './die';
import Unit from '../entities/units/Unit';
import Coordinates from '../geometry/Coordinates';
import { UnitAbilityContext } from '../entities/units/abilities/UnitAbility';
import { playSound } from '../sounds/playSound';
import Sounds from '../sounds/Sounds';
import AnimationFactory from '../graphics/animations/AnimationFactory';
import { playAnimation } from '../graphics/animations/playAnimation';
import { sleep } from '../utils/promises';
import Direction from '../geometry/Direction';

const getDamageLogMessage = (unit: Unit, target: Unit, damageTaken: number): string => {
  return `${unit.getName()}'s fireball hit ${target.getName()} for ${damageTaken} damage!`;
};

export const shootFireball = async (
  unit: Unit,
  direction: Direction,
  damage: number,
  { state, map, session }: UnitAbilityContext
) => {
  const { dx, dy } = direction;
  unit.setDirection(direction);

  const coordinatesList = [];
  let { x, y } = Coordinates.plus(unit.getCoordinates(), direction);
  while (map.contains({ x, y }) && !map.isBlocked({ x, y })) {
    coordinatesList.push({ x, y });
    x += dx;
    y += dy;
  }

  const targetUnit = map.getUnit({ x, y });
  if (targetUnit) {
    playSound(Sounds.PLAYER_HITS_ENEMY);
    const fireballAnimation = await AnimationFactory.getFireballAnimation(
      unit,
      { dx, dy },
      coordinatesList,
      targetUnit,
      { map, imageFactory: session.getImageFactory() }
    );
    await playAnimation(fireballAnimation, { map });
    const adjustedDamage = await dealDamage(damage, {
      sourceUnit: unit,
      targetUnit
    });
    const message = getDamageLogMessage(unit, targetUnit, adjustedDamage);
    session.getTicker().log(message, { turn: state.getTurn() });
    if (targetUnit.getLife() <= 0) {
      await sleep(100);
      await die(targetUnit, { state, map, session });
    }
  } else {
    const fireballAnimation = await AnimationFactory.getFireballAnimation(
      unit,
      direction,
      coordinatesList,
      null,
      { map, imageFactory: session.getImageFactory() }
    );
    await playAnimation(fireballAnimation, { map });
  }
};
