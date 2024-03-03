import Unit from '../entities/units/Unit';
import Sounds from '../sounds/Sounds';
import { Session } from '@main/core/Session';
import { GameState } from '@main/core/GameState';
import { EventType } from '@main/core/EventLog';

export const castFreeze = async (
  unit: Unit,
  radius: number,
  duration: number,
  session: Session,
  state: GameState
) => {
  const targetUnits = _getTargetUnits(unit, radius);
  for (const targetUnit of targetUnits) {
    targetUnit.setFrozen(duration);
    state.getSoundPlayer().playSound(Sounds.SPECIAL_ATTACK); // TODO
    const message = `${targetUnit.getName()} is frozen for ${duration} turns!`;
    state.getEventLog().log({
      type: EventType.SPELL_USED,
      message,
      sessionId: session.id,
      turn: session.getTurn(),
      timestamp: new Date()
    });
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
        if (targetUnit && targetUnit.getFaction() !== unit.getFaction()) {
          targetUnits.push(targetUnit);
        }
      }
    }
  }
  return targetUnits;
};
