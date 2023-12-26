import { unequipItem } from './unequipItem';
import InventoryItem from '../items/InventoryItem';
import Equipment from '../equipment/Equipment';
import Unit from '../entities/units/Unit';
import GameState from '../core/GameState';
import { playSound } from '../sounds/playSound';
import Sounds from '../sounds/Sounds';
import { Session } from '../core/Session';
import { Feature } from '../utils/features';
import { abilityForName } from '../entities/units/abilities/abilityForName';
import { AbilityName } from '../entities/units/abilities/AbilityName';

type Context = Readonly<{
  state: GameState;
  session: Session;
}>;

export const equipItem = async (
  item: InventoryItem,
  equipment: Equipment,
  unit: Unit,
  { state, session }: Context
) => {
  const currentEquipment = unit.getEquipment().getBySlot(equipment.slot);
  if (currentEquipment) {
    unequipItem(currentEquipment, unit);
  }

  unit.getEquipment().add(equipment);
  equipment.attach(unit);
  session.getTicker().log(`Equipped ${equipment.getName()}.`, { turn: state.getTurn() });

  if (Feature.isEnabled(Feature.ITEM_ABILITIES)) {
    const abilityName = equipment.getAbilityName();
    if (abilityName) {
      unit.learnAbility(abilityForName(abilityName));
    }
  }

  playSound(Sounds.BLOCKED);
};
