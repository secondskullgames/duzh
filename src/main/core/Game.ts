import MapInstance from '../maps/MapInstance';
import Unit from '../entities/units/Unit';
import { type UnitAbility } from '../entities/units/abilities/UnitAbility';
import { checkNotNull, checkState } from '../utils/preconditions';
import { clear } from '../utils/arrays';
import { GameScreen } from './GameScreen';
import { AbilityName } from '../entities/units/abilities/AbilityName';
import Dungeon, { GetMapContext } from './Dungeon';

/**
 * Global mutable state
 */
export default class Game {
  private dungeon: Dungeon | null;
  private playerUnit: Unit | null;
  private map: MapInstance | null;
  private turn: number;
  private queuedAbility: UnitAbility | null;
  /**
   * TODO this should really be somewhere more specialized
   */
  private selectedLevelUpScreenAbility: AbilityName | null;
  private readonly generatedEquipmentIds: string[];

  constructor() {
    this.dungeon = null;
    this.playerUnit = null;
    this.map = null;
    this.turn = 1;
    this.queuedAbility = null;
    this.selectedLevelUpScreenAbility = null;
    this.generatedEquipmentIds = [];
  }

  getPlayerUnit = (): Unit => checkNotNull(this.playerUnit);
  setPlayerUnit = (unit: Unit): void => {
    checkState(this.playerUnit === null);
    this.playerUnit = unit;
  };
  
  loadDungeon = (dungeon: Dungeon) => {
    this.dungeon = dungeon;
  };

  hasNextMap = (): boolean => {
    const dungeon = checkNotNull(this.dungeon);
    return !!dungeon.getNextMapId(this.map?.id);
  };

  loadNextMap = async ({ game, mapFactory, imageFactory }: GetMapContext) => {
    const dungeon = checkNotNull(this.dungeon);
    
    const nextMapId = dungeon.getNextMapId(this.map?.id);
    this.map = await dungeon.getMap(`${nextMapId}`, { game, mapFactory, imageFactory });
  };

  getMap = (): MapInstance => checkNotNull(this.map, 'Tried to retrieve map before map was loaded');

  getTurn = () => this.turn;
  nextTurn = () => { this.turn++; };

  getQueuedAbility = (): UnitAbility | null => this.queuedAbility;
  setQueuedAbility = (ability: UnitAbility | null) => {
    this.queuedAbility = ability;
  };

  getSelectedLevelUpScreenAbility = (): AbilityName | null => {
    if (!this.selectedLevelUpScreenAbility) {
      const learnableAbilities = this.getPlayerUnit().getLearnableAbilities();
      this.selectedLevelUpScreenAbility = learnableAbilities[0] ?? null;
    }
    return this.selectedLevelUpScreenAbility;
  }

  selectNextLevelUpScreenAbility = () => {
    const learnableAbilities = this.getPlayerUnit().getLearnableAbilities();
    const index = this.selectedLevelUpScreenAbility
      ? learnableAbilities.indexOf(this.selectedLevelUpScreenAbility)
      : -1;
    this.selectedLevelUpScreenAbility = learnableAbilities[(index + 1) % learnableAbilities.length] ?? null;
  }

  selectPreviousLevelUpScreenAbility = () => {
    const learnableAbilities = this.getPlayerUnit().getLearnableAbilities();
    const index = this.selectedLevelUpScreenAbility
      ? learnableAbilities.indexOf(this.selectedLevelUpScreenAbility)
      : -1;
    const length = learnableAbilities.length;
    this.selectedLevelUpScreenAbility = learnableAbilities[(index + length - 1) % length] ?? null;
  };

  getGeneratedEquipmentIds = (): string[] => this.generatedEquipmentIds;

  recordEquipmentGenerated = (equipmentId: string) => {
    this.generatedEquipmentIds.push(equipmentId);
  };
}