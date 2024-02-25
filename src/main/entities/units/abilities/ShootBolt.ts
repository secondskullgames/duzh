import { type UnitAbility } from './UnitAbility';
import { AbilityName } from './AbilityName';
import Unit from '../Unit';
import Coordinates from '../../../geometry/Coordinates';
import { pointAt } from '../../../utils/geometry';
import Sounds from '../../../sounds/Sounds';
import { playAnimation } from '../../../graphics/animations/playAnimation';
import { dealDamage } from '../../../actions/dealDamage';
import { sleep } from '../../../utils/promises';
import { die } from '../../../actions/die';
import { Session } from '../../../core/Session';
import { GameState } from '../../../core/GameState';
import { getMeleeDamage } from '../UnitUtils';
import { isBlocked } from '../../../maps/MapUtils';

const getDamageLogMessage = (unit: Unit, target: Unit, damageTaken: number): string => {
  return `${unit.getName()}'s bolt hit ${target.getName()} for ${damageTaken} damage!`;
};

export const ShootBolt: UnitAbility = {
  name: AbilityName.BOLT,
  icon: null,
  manaCost: 0,
  innate: false,

  use: async (
    unit: Unit,
    coordinates: Coordinates | null,
    session: Session,
    state: GameState
  ) => {
    if (!coordinates) {
      throw new Error('Bolt requires a target!');
    }

    const map = session.getMap();
    const { dx, dy } = pointAt(unit.getCoordinates(), coordinates);
    unit.setDirection({ dx, dy });

    // unit.spendMana(0); // TODO

    const coordinatesList = [];
    let { x, y } = Coordinates.plus(unit.getCoordinates(), { dx, dy });
    while (map.contains({ x, y }) && !isBlocked(map, { x, y })) {
      coordinatesList.push({ x, y });
      x += dx;
      y += dy;
    }

    const targetUnit = map.getUnit({ x, y });
    if (targetUnit) {
      const damage = getMeleeDamage(unit);
      const adjustedDamage = await dealDamage(damage, {
        sourceUnit: unit,
        targetUnit
      });
      const message = getDamageLogMessage(unit, targetUnit, adjustedDamage);
      const boltAnimation = await state
        .getAnimationFactory()
        .getBoltAnimation(unit, { dx, dy }, coordinatesList, targetUnit, map);
      await playAnimation(boltAnimation, { map });
      state.getSoundPlayer().playSound(Sounds.PLAYER_HITS_ENEMY);
      session.getTicker().log(message, { turn: session.getTurn() });
      if (targetUnit.getLife() <= 0) {
        await sleep(100);
        await die(targetUnit, state, session);
      }
    } else {
      const boltAnimation = await state
        .getAnimationFactory()
        .getBoltAnimation(unit, { dx, dy }, coordinatesList, null, map);
      await playAnimation(boltAnimation, { map });
    }
  }
};
