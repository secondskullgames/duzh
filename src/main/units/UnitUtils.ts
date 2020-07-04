import Unit from './Unit';
import { playAttackingAnimation } from '../graphics/animations/Animations';
import UnitAbilities from './UnitAbilities';

function attack(unit: Unit, target: Unit): Promise<void> {
  const damage = unit.getDamage();
  jwb.state.messages.push(`${unit.name} hit ${target.name} for ${damage} damage!`);

  return playAttackingAnimation(unit, target)
    .then(() => target.takeDamage(damage, unit));
}

function heavyAttack(unit: Unit, target: Unit): Promise<void> {
  const damage = unit.getDamage() * 2;
  jwb.state.messages.push(`${unit.name} hit ${target.name} for ${damage} damage!`);

  return unit.useAbility(UnitAbilities.HEAVY_ATTACK) // TODO this should not be hardcoded here
    .then(() => playAttackingAnimation(unit, target))
    .then(() => target.takeDamage(damage, unit));
}

export {
  attack,
  heavyAttack
};