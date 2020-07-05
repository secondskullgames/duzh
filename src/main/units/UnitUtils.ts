import Unit from './Unit';
import { playAttackingAnimation } from '../graphics/animations/Animations';

function attack(unit: Unit, target: Unit): Promise<void> {
  const damage = unit.getDamage();
  jwb.state.messages.push(`${unit.name} hit ${target.name} for ${damage} damage!`);

  return playAttackingAnimation(unit, target)
    .then(() => target.takeDamage(damage, unit));
}

function heavyAttack(unit: Unit, target: Unit): Promise<void> {
  const damage = unit.getDamage() * 2;
  jwb.state.messages.push(`${unit.name} hit ${target.name} for ${damage} damage!`);

  return playAttackingAnimation(unit, target)
    .then(() => target.takeDamage(damage, unit));
}

export {
  attack,
  heavyAttack
};