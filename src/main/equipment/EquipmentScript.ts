import Equipment from './Equipment';
import { GameState } from '../core/GameState';
import Coordinates from '../geometry/Coordinates';
import { checkNotNull } from '../utils/preconditions';
import { ShootBolt } from '../entities/units/abilities/ShootBolt';
import { Session } from '../core/Session';

export type EquipmentScriptName = 'bolt_sword';

type Context = Readonly<{
  state: GameState;
  session: Session;
}>;

export type EquipmentScript = Readonly<{
  onAttack?: (
    equipment: Equipment,
    target: Coordinates,
    context: Context
  ) => Promise<void>;

  onMove?: (equipment: Equipment, target: Coordinates, context: Context) => Promise<void>;
}>;

const BoltSwordScript: EquipmentScript = {
  onMove: async (
    equipment: Equipment,
    target: Coordinates,
    { state, session }: Context
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
      await ShootBolt.use(unit, target, session, state);
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
