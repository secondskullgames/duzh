import { GameEngine } from './GameEngine';
import GameState from './GameState';
import UnitService from '../entities/units/UnitService';
import GameRenderer from '../graphics/renderers/GameRenderer';

type Props = Readonly<{
  engine: GameEngine,
  renderer: GameRenderer,
  state: GameState,
  unitService: UnitService
}>;

export class Debug {
  private readonly engine: GameEngine;
  private readonly renderer: GameRenderer;
  private readonly state: GameState;
  private readonly unitService: UnitService;
  private revealMap: boolean;

  constructor({ engine, renderer, state, unitService }: Props) {
    this.engine = engine;
    this.renderer = renderer;
    this.state = state;
    this.unitService = unitService;
    this.revealMap = false;
  }

  toggleRevealMap = async () => {
    this.revealMap = !this.revealMap;
    await this.renderer.render();
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
    await this.renderer.render();
  };

  killPlayer = async () => {
    const playerUnit = this.state.getPlayerUnit();
    await this.unitService.dealDamage(playerUnit.getMaxLife(), {
      targetUnit: playerUnit
    })
    await this.renderer.render();
  };

  nextLevel = async () => {
    await this.engine.loadNextMap();
    await this.renderer.render();
  };

  levelUp = async () => {
    const playerUnit = this.state.getPlayerUnit();
    this.unitService.levelUp(playerUnit);
    await this.renderer.render();
  };

  attachToWindow = () => {
    // @ts-ignore
    window.jwb = window.jwb ?? {};
    // @ts-ignore
    window.jwb.debug = this;
  };
}
