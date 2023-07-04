import Coordinates from '../geometry/Coordinates';
import { checkNotNull } from '../utils/preconditions';
import Equipment from './Equipment';
import { ShootBolt } from '../entities/units/abilities/ShootBolt';
import { GlobalContext } from '../core/GlobalContext';

export type EquipmentScriptName = 'bolt_sword';


export type EquipmentScript = Readonly<{
  onAttack?: (
    equipment: Equipment,
    target: Coordinates,
    context: GlobalContext
  ) => Promise<void>;

  onMove?: (
    equipment: Equipment,
    target: Coordinates,
    context: GlobalContext
  ) => Promise<void>;
}>;

const BoltSwordScript: EquipmentScript = {
  onMove: async (
    equipment: Equipment,
    target: Coordinates,
    { state, imageFactory, ticker }: GlobalContext
  ) => {
    const unit = checkNotNull(equipment.getUnit());

    const map = state.getMap();
    const direction = unit.getDirection();
    let coordinates = Coordinates.plus(unit.getCoordinates(), direction);
    while (map.contains(coordinates) && !map.isBlocked(coordinates)) {
      coordinates = Coordinates.plus(coordinates, direction);
    }

    if (map.contains(coordinates) && map.isTileRevealed(coordinates) && map.getUnit(coordinates)) {
      await ShootBolt.use(
        unit,
        target,
        { state, imageFactory, ticker }
      );
    }
  }
};

export namespace EquipmentScript {
  export const forName = (name: EquipmentScriptName): EquipmentScript => {
    switch (name) {
      case 'bolt_sword': return BoltSwordScript;
      default:           throw new Error(`Unknown equipment script ${name}`);
    }
  }
}