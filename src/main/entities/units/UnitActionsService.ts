import Unit from './Unit';
import Direction from '../../geometry/Direction';
import Coordinates from '../../geometry/Coordinates';
import GameState from '../../core/GameState';
import { GameEngine } from '../../core/GameEngine';
import UnitService from './UnitService';
import { checkNotNull } from '../../utils/preconditions';
import { playSound } from '../../sounds/SoundFX';
import Sounds from '../../sounds/Sounds';
import Door from '../objects/Door';
import Block from '../objects/Block';
import { gameOver } from '../../actions/gameOver';

type Props = {
  state: GameState,
  engine: GameEngine,
  unitService: UnitService
};

export default class UnitActionsService {
  private readonly state: GameState;
  private readonly engine: GameEngine;
  private readonly unitService: UnitService;

  constructor({ state, engine, unitService }: Props) {
    this.state = state;
    this.engine = engine;
    this.unitService = unitService;
  }

  walk = async (unit: Unit, direction: Direction) => {
    const { state } = this;
    const map = state.getMap();
    const coordinates = Coordinates.plus(unit.getCoordinates(), direction);

    if (!map.contains(coordinates) || map.isBlocked(coordinates)) {
      // do nothing
    } else {
      await this.unitService.moveUnit(unit, coordinates);
    }
  };

  attack = async (attacker: Unit, defender: Unit) => {
    const { state, unitService } = this;
    const playerUnit = state.getPlayerUnit();

    const damage = attacker.getDamage();
    playSound(Sounds.PLAYER_HITS_ENEMY);
    await unitService.startAttack(attacker, defender);
    const adjustedDamage = await unitService.dealDamage(damage, {
      sourceUnit: attacker,
      targetUnit: defender
    });

    state.logMessage(`${attacker.getName()} hit ${defender.getName()} for ${adjustedDamage} damage!`);

    if (defender.getLife() <= 0) {
      await this._die(defender);
      if (attacker === playerUnit) {
        unitService.awardExperience(attacker, 1);
      }
    }
  };

  private _die = async (defender: Unit) => {
    const { state } = this;
    const map = state.getMap();
    const playerUnit = state.getPlayerUnit();

    map.removeUnit(defender);
    if (defender === playerUnit) {
      await gameOver({ state });
      return;
    } else {
      playSound(Sounds.ENEMY_DIES);
      state.logMessage(`${defender.getName()} dies!`);
    }
  };

  openDoor = async (unit: Unit, door: Door) => {
    const keys = unit.getInventory().get('KEY');
    if (keys.length > 0) {
      unit.getInventory().remove(keys[0]);
      playSound(Sounds.OPEN_DOOR);
      await door.open();
    } else {
      playSound(Sounds.BLOCKED);
    }
  };

  pushBlock = async (unit: Unit, block: Block) => {
    const { state, unitService } = this;
    const map = state.getMap();
    const coordinates = block.getCoordinates();
    const { dx, dy } = Coordinates.difference(unit.getCoordinates(), coordinates);
    const nextCoordinates = Coordinates.plus(coordinates, { dx, dy });

    if (map.contains(nextCoordinates) && !map.isBlocked(nextCoordinates)) {
      await block.moveTo(nextCoordinates);
      await unitService.moveUnit(unit, coordinates);
    }
  };

  private static INSTANCE: UnitActionsService | null = null;
  static getInstance = (): UnitActionsService => checkNotNull(UnitActionsService.INSTANCE);
  static setInstance = (instance: UnitActionsService) => { UnitActionsService.INSTANCE = instance; };
}