import GameState from '../core/GameState';
import Coordinates from '../geometry/Coordinates';
import { checkNotNull } from '../utils/preconditions';
import Equipment from './Equipment';
import { UnitAbilities } from '../units/abilities/UnitAbilities';

export type EquipmentScript = 'bolt_sword';

export namespace EquipmentScript {
  export const onAttack = async (equipment: Equipment, script: EquipmentScript, target: Coordinates) => {
    const unit = checkNotNull(equipment.getUnit());
  };

  export const onMove = async (equipment: Equipment, script: EquipmentScript, target: Coordinates) => {
    const unit = checkNotNull(equipment.getUnit());

    const map = GameState.getInstance().getMap();
    switch (script) {
      case 'bolt_sword': {
        const { dx, dy } = unit.getDirection();
        let coordinates = Coordinates.plus(unit.getCoordinates(), { dx, dy });
        while (map.contains(coordinates) && !map.isBlocked(coordinates)) {
          coordinates = Coordinates.plus(coordinates, { dx, dy });
        }

        if (map.contains(coordinates) && map.isTileRevealed(coordinates) && map.getUnit(coordinates)) {
          await UnitAbilities.BOLT.use(unit, target);
        }
      }
    }
  };
}
