import Unit from '../units/Unit';

export const attack = async (source: Unit, target: Unit, damage?: number) => {
  if (damage === undefined) {
    damage = source.getDamage();
  }

  await source.startAttack(target);
  await target.takeDamage(damage, { sourceUnit: source });
};
