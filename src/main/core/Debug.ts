import GameState from './GameState';
import UnitService from '../entities/units/UnitService';
import GameRenderer from '../graphics/renderers/GameRenderer';
import { loadNextMap } from '../actions/loadNextMap';
import { killEnemies } from '../actions/debug/killEnemies';

type Props = Readonly<{
  renderer: GameRenderer,
  state: GameState,
  unitService: UnitService
}>;

export class Debug {
  private readonly renderer: GameRenderer;
  private readonly state: GameState;
  private readonly unitService: UnitService;
  private revealMap: boolean;

  constructor({ renderer, state, unitService }: Props) {
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

  killPlayer = async () => {
    const playerUnit = this.state.getPlayerUnit();
    await this.unitService.dealDamage(playerUnit.getMaxLife(), {
      targetUnit: playerUnit
    })
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
    window.jwb.debug = {
      ...this,
      killEnemies,
      nextLevel: () => loadNextMap({
        state: this.state,
        renderer: this.renderer
      })
    };
  };
}
