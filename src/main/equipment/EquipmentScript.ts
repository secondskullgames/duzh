import GameState from '../core/GameState';
import Coordinates from '../geometry/Coordinates';
import { checkNotNull } from '../utils/preconditions';
import Equipment from './Equipment';
import { UnitAbilities } from '../entities/units/abilities/UnitAbilities';
import GameRenderer from '../graphics/renderers/GameRenderer';
import AnimationFactory from '../graphics/animations/AnimationFactory';

export type EquipmentScript = 'bolt_sword';

export namespace EquipmentScript {
  export const onAttack = async (equipment: Equipment, script: EquipmentScript, target: Coordinates) => {
  };

  export const onMove = async (equipment: Equipment, script: EquipmentScript, target: Coordinates) => {
    const unit = checkNotNull(equipment.getUnit());

    const state = GameState.getInstance();
    const map = state.getMap();
    switch (script) {
      case 'bolt_sword': {
        const direction = unit.getDirection();
        let coordinates = Coordinates.plus(unit.getCoordinates(), direction);
        while (map.contains(coordinates) && !map.isBlocked(coordinates)) {
          coordinates = Coordinates.plus(coordinates, direction);
        }

        if (map.contains(coordinates) && map.isTileRevealed(coordinates) && map.getUnit(coordinates)) {
          await UnitAbilities.BOLT.use(
            unit,
            target,
            {
              state,
              renderer: GameRenderer.getInstance(),
              animationFactory: AnimationFactory.getInstance()
            }
          );
        }
      }
    }
  };
}
