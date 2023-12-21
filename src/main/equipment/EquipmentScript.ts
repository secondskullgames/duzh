import Equipment from './Equipment';
import GameState from '../core/GameState';
import Coordinates from '../geometry/Coordinates';
import { checkNotNull } from '../utils/preconditions';
import { ShootBolt } from '../entities/units/abilities/ShootBolt';
import ImageFactory from '../graphics/images/ImageFactory';
import MapInstance from '../maps/MapInstance';
import { Session } from '../core/Session';

export type EquipmentScriptName = 'bolt_sword';

type Context = Readonly<{
  state: GameState;
  session: Session;
  map: MapInstance;
  imageFactory: ImageFactory;
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
    { state, session, map, imageFactory }: Context
  ) => {
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
      await ShootBolt.use(unit, target, { state, map, imageFactory, session });
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
