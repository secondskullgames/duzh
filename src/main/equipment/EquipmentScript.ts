import GameState from '../core/GameState';
import Coordinates from '../geometry/Coordinates';
import UnitAbility from '../units/UnitAbility';
import { checkNotNull } from '../utils/preconditions';
import Equipment from './Equipment';

type EquipmentScript = 'bolt_sword';

namespace EquipmentScript {
  export const onAttack = async (equipment: Equipment, script: EquipmentScript, target: Coordinates) => {
    const unit = checkNotNull(equipment.getUnit());
  };

  export const onMove = async (equipment: Equipment, script: EquipmentScript, target: Coordinates) => {
    const unit = checkNotNull(equipment.getUnit());

    const map = GameState.getInstance().getMap();
    switch (script) {
      case 'bolt_sword': {
        const { dx, dy } = unit.direction;
        let x = unit.x + dx;
        let y = unit.y + dy;
        while (map.contains({ x, y }) && !map.isBlocked({ x, y })) {
          x += dx;
          y += dy;
        }

        if (map.contains({ x, y }) && map.isTileRevealed({ x, y }) && map.getUnit({ x, y })) {
          await UnitAbility.BOLT.use(unit, target);
        }
      }
    }
  };
}

export default EquipmentScript;


