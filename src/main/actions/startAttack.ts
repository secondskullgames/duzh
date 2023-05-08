import Unit from '../entities/units/Unit';
import { playAnimation } from '../graphics/animations/playAnimation';
import GameRenderer from '../graphics/renderers/GameRenderer';
import { EquipmentScript } from '../equipment/EquipmentScript';
import AnimationFactory from '../graphics/animations/AnimationFactory';
import GameState from '../core/GameState';

type Props = Readonly<{
  state: GameState,
  renderer: GameRenderer
}>;

export const startAttack = async (
  unit: Unit,
  target: Unit,
  { state, renderer }: Props
) => {
  const animation = AnimationFactory.getAttackingAnimation(unit, target, { state });
  await playAnimation(animation, { state, renderer });

  for (const equipment of unit.getEquipment().getAll()) {
    if (equipment.script) {
      await EquipmentScript.onAttack(equipment, equipment.script, target.getCoordinates());
    }
  }

  unit.refreshCombat();
};