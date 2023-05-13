import GameState from '../core/GameState';
import Coordinates from '../geometry/Coordinates';
import { checkNotNull } from '../utils/preconditions';
import Equipment from './Equipment';
import GameRenderer from '../graphics/renderers/GameRenderer';
import { Bolt } from '../entities/units/abilities/Bolt';
import ImageFactory from '../graphics/images/ImageFactory';

export type EquipmentScriptName = 'bolt_sword';

type Context = Readonly<{
  state: GameState,
  renderer: GameRenderer,
  imageFactory: ImageFactory
}>;

export type EquipmentScript = Readonly<{
  onAttack?: (
    equipment: Equipment,
    target: Coordinates,
    { state }: Context
  ) => Promise<void>;

  onMove?: (
    equipment: Equipment,
    target: Coordinates,
    { state, renderer, imageFactory }: Context
  ) => Promise<void>;
}>;

const BoltSwordScript: EquipmentScript = {
  onMove: async (
    equipment: Equipment,
    target: Coordinates,
    { state, renderer, imageFactory }: Context
  ) => {
    const unit = checkNotNull(equipment.getUnit());

    const map = state.getMap();
    const direction = unit.getDirection();
    let coordinates = Coordinates.plus(unit.getCoordinates(), direction);
    while (map.contains(coordinates) && !map.isBlocked(coordinates)) {
      coordinates = Coordinates.plus(coordinates, direction);
    }

    if (map.contains(coordinates) && map.isTileRevealed(coordinates) && map.getUnit(coordinates)) {
      await Bolt.use(
        unit,
        target,
        {
          state,
          renderer,
          imageFactory
        }
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