import { GameEngine } from './GameEngine';
import GameState from './GameState';
import UnitService from '../entities/units/UnitService';

type Props = Readonly<{
  engine: GameEngine,
  state: GameState,
  unitService: UnitService
}>;

export class Debug {
  private readonly engine: GameEngine;
  private readonly state: GameState;
  private readonly unitService: UnitService;
  private revealMap: boolean;

  constructor({ engine, state, unitService }: Props) {
    this.engine = engine;
    this.state = state;
    this.unitService = unitService;
    this.revealMap = false;
  }

  toggleRevealMap = async () => {
    this.revealMap = !this.revealMap;
    await this.engine.render();
  };

  isMapRevealed = () => this.revealMap;

  killEnemies = async () => {
    const { state } = this;
    const map = state.getMap();
    const playerUnit = state.getPlayerUnit();
    for (const unit of map.getAllUnits()) {
      if (unit !== playerUnit) {
        map.removeUnit(unit);
      }
    }
    await this.engine.render();
  };

  killPlayer = async () => {
    const playerUnit = this.state.getPlayerUnit();
    await this.unitService.dealDamage(playerUnit.getMaxLife(), {
      targetUnit: playerUnit
    })
    await this.engine.render();
  };

  nextLevel = async () => {
    await this.engine.loadNextMap();
    await this.engine.render();
  };

  levelUp = async () => {
    const playerUnit = this.state.getPlayerUnit();
    this.unitService.levelUp(playerUnit);
    await this.engine.render();
  };

  attachToWindow = () => {
    // @ts-ignore
    window.jwb = window.jwb ?? {};
    // @ts-ignore
    window.jwb.debug = this;
  };
}
