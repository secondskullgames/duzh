import Unit from '@main/units/Unit';
import { AbilityName } from '@main/abilities/AbilityName';

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
    const learnableAbilities = playerUnit.getCurrentlyLearnableAbilities();
    const index = this.selectedAbility
      ? learnableAbilities.indexOf(this.selectedAbility)
      : -1;
    this.selectedAbility =
      learnableAbilities[(index + 1) % learnableAbilities.length] ?? null;
  };

  selectPreviousAbility = (playerUnit: Unit) => {
    const learnableAbilities = playerUnit.getCurrentlyLearnableAbilities();
    const index = this.selectedAbility
      ? learnableAbilities.indexOf(this.selectedAbility)
      : -1;
    const length = learnableAbilities.length;
    this.selectedAbility = learnableAbilities[(index + length - 1) % length] ?? null;
  };
}
