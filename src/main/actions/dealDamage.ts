import { Unit } from '@main/entities/units';

type DealDamageParams = Readonly<{
  sourceUnit?: Unit;
  targetUnit: Unit;
}>;

/** @return the amount of adjusted damage taken */
export const dealDamage = async (
  baseDamage: number,
  params: DealDamageParams
): Promise<number> => {
  const sourceUnit = params.sourceUnit ?? null;
  const targetUnit = params.targetUnit;
  const { damageTaken } = targetUnit.takeDamage(baseDamage, sourceUnit);
  sourceUnit?.refreshCombat();
  targetUnit.refreshCombat();
  return damageTaken;
};
