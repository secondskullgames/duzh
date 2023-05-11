import GameState from './GameState';
import GameRenderer from '../graphics/renderers/GameRenderer';
import { loadNextMap } from '../actions/loadNextMap';
import { killEnemies } from '../actions/debug/killEnemies';
import { levelUp as _levelUp } from '../actions/levelUp';
import { die } from '../actions/die';

type Props = Readonly<{
  renderer: GameRenderer,
  state: GameState
}>;

export class Debug {
  private readonly renderer: GameRenderer;
  private readonly state: GameState;
  private _isMapRevealed: boolean;

  constructor({ renderer, state }: Props) {
    this.renderer = renderer;
    this.state = state;
    this._isMapRevealed = false;
  }

  toggleRevealMap = async () => {
    this._isMapRevealed = !this._isMapRevealed;
    await this.renderer.render();
  };

  isMapRevealed = () => this._isMapRevealed;

  killPlayer = async () => {
    const playerUnit = this.state.getPlayerUnit();
    await die(playerUnit, { state: this.state });
    await this.renderer.render();
  };

  levelUp = async () => {
    const playerUnit = this.state.getPlayerUnit();
    _levelUp(playerUnit);
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
