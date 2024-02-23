import Equipment from './Equipment';
import { GameState } from '../core/GameState';
import Coordinates from '../geometry/Coordinates';
import { checkNotNull } from '../utils/preconditions';
import { ShootBolt } from '../entities/units/abilities/ShootBolt';
import { Session } from '../core/Session';

export type EquipmentScriptName = 'bolt_sword';

export type EquipmentScript = Readonly<{
  onAttack?: (
    equipment: Equipment,
    target: Coordinates,
    state: GameState,
    session: Session
  ) => Promise<void>;

  onMove?: (
    equipment: Equipment,
    target: Coordinates,
    state: GameState,
    session: Session
  ) => Promise<void>;
}>;

const BoltSwordScript: EquipmentScript = {
  onMove: async (
    equipment: Equipment,
    target: Coordinates,
    state: GameState,
    session: Session
  ) => {
    const map = session.getMap();
    const unit = checkNotNull(equipment.getUnit());

    const direction = unit.getDirection();
    let coordinates = Coordinates.plus(unit.getCoordinates(), direction);
    while (map.contains(coordinates) && !map.isBlocked(coordinates)) {
      coordinates = Coordinates.plus(coordinates, direction);
    }

    if (
      map.contains(coordinates) &&
      map.isTileRevealed(coordinates) &&
      map.getUnit(coordinates)
    ) {
      // TODO it is sketchy to invoke a fake Ability here
      await ShootBolt.use(unit, target, session, state);
      // but don't record its usage
    }
  }
};

export namespace EquipmentScript {
  export const forName = (name: EquipmentScriptName): EquipmentScript => {
    switch (name) {
      case 'bolt_sword':
        return BoltSwordScript;
      default:
        throw new Error(`Unknown equipment script ${name}`);
    }
  };
}
