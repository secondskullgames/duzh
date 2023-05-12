import GameState from '../core/GameState';
import Coordinates from '../geometry/Coordinates';
import { checkNotNull } from '../utils/preconditions';
import Equipment from './Equipment';
import GameRenderer from '../graphics/renderers/GameRenderer';
import { Bolt } from '../entities/units/abilities/Bolt';
import ImageFactory from '../graphics/images/ImageFactory';

export type EquipmentScript = 'bolt_sword';

type Context = Readonly<{
  state: GameState,
  renderer: GameRenderer,
  imageFactory: ImageFactory
}>;

export namespace EquipmentScript {
  export const onAttack = async (equipment: Equipment, script: EquipmentScript, target: Coordinates, { state }: Context) => {
  };

  export const onMove = async (
    equipment: Equipment,
    script: EquipmentScript,
    target: Coordinates,
    { state, renderer, imageFactory }: Context
  ) => {
    const unit = checkNotNull(equipment.getUnit());

    const map = state.getMap();
    switch (script) {
      case 'bolt_sword': {
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
    }
  };
}
