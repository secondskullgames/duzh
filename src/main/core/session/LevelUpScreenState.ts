import { AbilityName } from '../../entities/units/abilities/AbilityName';
import Unit from '../../entities/units/Unit';

export class LevelUpScreenState {
  private selectedAbility: AbilityName | null;

  constructor() {
    this.selectedAbility = null;
  }

  getSelectedAbility = (): AbilityName | null => this.selectedAbility;

  setSelectedAbility = (ability: AbilityName | null): void => {
    this.selectedAbility = ability;
  };

  selectNextAbility = (playerUnit: Unit) => {
    const learnableAbilities = playerUnit.getLearnableAbilities();
    const index = this.selectedAbility
      ? learnableAbilities.indexOf(this.selectedAbility)
      : -1;
    this.selectedAbility =
      learnableAbilities[(index + 1) % learnableAbilities.length] ?? null;
  };

  selectPreviousAbility = (playerUnit: Unit) => {
    const learnableAbilities = playerUnit.getLearnableAbilities();
    const index = this.selectedAbility
      ? learnableAbilities.indexOf(this.selectedAbility)
      : -1;
    const length = learnableAbilities.length;
    this.selectedAbility = learnableAbilities[(index + length - 1) % length] ?? null;
  };
}