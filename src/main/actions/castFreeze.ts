import Unit from '../units/Unit';
import Sounds from '../sounds/Sounds';
import { isHostile } from '@main/units/UnitUtils';
import { Game } from '@main/core/Game';

const getLogMessage = (unit: Unit, target: Unit, duration: number): string => {
  return `${target.getName()} is frozen for ${duration} turns!`;
};

export const castFreeze = async (
  unit: Unit,
  radius: number,
  duration: number,
  game: Game
) => {
  const { soundPlayer, state, ticker } = game;
  const targetUnits = _getTargetUnits(unit, radius);
  for (const targetUnit of targetUnits) {
    targetUnit.setFrozen(duration);
    soundPlayer.playSound(Sounds.SPECIAL_ATTACK); // TODO
    const message = getLogMessage(unit, targetUnit, duration);
    ticker.log(message, { turn: state.getTurn() });
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
