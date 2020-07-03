import Unit from './Unit';
import Sounds from '../sounds/Sounds';
import { Coordinates, Direction, EquipmentSlot } from '../types/types';
import { playSound } from '../sounds/SoundFX';
import { playArrowAnimation, playAttackingAnimation } from '../graphics/animations/Animations';
import UnitAbilities from './UnitAbilities';

function attack(unit: Unit, target: Unit): Promise<void> {
  const damage = unit.getDamage();
  jwb.state.messages.push(`${unit.name} hit ${target.name}`);
  jwb.state.messages.push(`for ${damage} damage!`);

  return playAttackingAnimation(unit, target)
    .then(() => target.takeDamage(damage, unit));
}

function heavyAttack(unit: Unit, target: Unit): Promise<void> {
  const damage = unit.getDamage() * 2;
  jwb.state.messages.push(`${unit.name} hit ${target.name}`);
  jwb.state.messages.push(`for ${damage} damage!`);

  return unit.useAbility(UnitAbilities.HEAVY_ATTACK) // TODO this should not be hardcoded here
    .then(() => playAttackingAnimation(unit, target))
    .then(() => target.takeDamage(damage, unit));
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
      const coordinatesList = [];
      let { x, y } = { x: unit.x + dx, y: unit.y + dy };
      while (map.contains({ x, y }) && !map.isBlocked({ x, y })) {
        coordinatesList.push({ x, y });
        x += dx;
        y += dy;
      }

      const targetUnit = map.getUnit({ x, y });
      if (!!targetUnit) {
        const { messages } = jwb.state;
        const damage = unit.getRangedDamage();
        messages.push(`${unit.name} hit ${targetUnit.name}`);
        messages.push(`for ${damage} damage!`);

        playArrowAnimation(unit, { dx, dy }, coordinatesList, targetUnit)
          .then(() => targetUnit.takeDamage(damage, unit))
          .then(() => resolve());
      } else {
        playArrowAnimation(unit, { dx, dy }, coordinatesList, null)
          .then(() => resolve());
      }
    }));
}

export {
  attack,
  heavyAttack,
  fireProjectile
};