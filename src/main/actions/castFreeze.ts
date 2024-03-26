import Unit from '../units/Unit';
import Sounds from '../sounds/Sounds';
import { GameState } from '@main/core/GameState';
import { isHostile } from '@main/units/UnitUtils';

const getLogMessage = (unit: Unit, target: Unit, duration: number): string => {
  return `${target.getName()} is frozen for ${duration} turns!`;
};

export const castFreeze = async (
  unit: Unit,
  radius: number,
  duration: number,
  state: GameState
) => {
  const targetUnits = _getTargetUnits(unit, radius);
  for (const targetUnit of targetUnits) {
    targetUnit.setFrozen(duration);
    state.getSoundPlayer().playSound(Sounds.SPECIAL_ATTACK); // TODO
    const message = getLogMessage(unit, targetUnit, duration);
    state.ticker.log(message, state);
  }
};

const _getTargetUnits = (unit: Unit, radius: number): Unit[] => {
  const map = unit.getMap();
  const coordinates = unit.getCoordinates();
  const targetUnits = [];
  for (let x = coordinates.x - radius; x <= coordinates.x + radius; x++) {
    for (let y = coordinates.y - radius; y <= coordinates.y + radius; y++) {
      if (map.contains({ x, y })) {
        const targetUnit = map.getUnit({ x, y });
        // Maybe this should hit friendlies.  Not like we have any
        if (targetUnit && isHostile(unit, targetUnit)) {
          targetUnits.push(targetUnit);
        }
      }
    }
  }
  return targetUnits;
};
