import Unit from './Unit';
import { Coordinates, Direction, EquipmentSlot } from '../types/types';
import { playSound } from '../sounds/AudioUtils';
import Sounds from '../sounds/Sounds';
import { playAttackingAnimation } from '../graphics/animations/Animations';

function moveOrAttack(unit: Unit, { x, y }: Coordinates): Promise<void> {
  const { messages, playerUnit } = jwb.state;
  const map = jwb.state.getMap();
  unit.direction = { dx: x - unit.x, dy: y - unit.y };

  return new Promise(resolve => {
    if (map.contains({ x, y }) && !map.isBlocked({ x, y })) {
      [unit.x, unit.y] = [x, y];
      if (unit === playerUnit) {
        playSound(Sounds.FOOTSTEP);
      }
      resolve();
    } else {
      const targetUnit = map.getUnit({ x, y });
      if (!!targetUnit) {
        const damage = unit.getDamage();
        messages.push(`${unit.name} (${unit.level}) hit ${targetUnit.name} (${targetUnit.level}) for ${damage} damage!`);
        playAttackingAnimation(unit, targetUnit)
          .then(() => targetUnit.takeDamage(damage, unit))
          .then(() => resolve());
      } else {
        resolve();
      }
    }
  });
}

function fireProjectile(unit: Unit, { dx, dy }: Direction): Promise<void> {
  unit.direction = { dx, dy };

  return unit.sprite.update()
    .then(() => jwb.renderer.render())
    .then(() => new Promise(resolve => {
      if (!unit.equipment.get(EquipmentSlot.RANGED_WEAPON)) {
        // change direction and re-render, but don't do anything (don't spend a turn)
        resolve();
        return;
      }
      const map = jwb.state.getMap();
      let { x, y } = unit;
      do {
        x += dx;
        y += dy;
      } while (!map.isBlocked({ x, y }));

      const targetUnit = map.getUnit({ x, y });
      if (!!targetUnit) {
        const { messages } = jwb.state;
        const damage = unit.getRangedDamage();
        messages.push(`${unit.name} (${unit.level}) hit ${targetUnit.name} (${targetUnit.level}) for ${damage} damage!`);
        playAttackingAnimation(unit, targetUnit)
          .then(() => targetUnit.takeDamage(damage, unit))
          .then(() => resolve());
      } else {
        resolve();
      }
    }));
}

export {
  moveOrAttack,
  fireProjectile
};