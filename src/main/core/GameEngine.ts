import { Renderer } from '../graphics/renderers/Renderer';
import Unit from '../units/Unit';
import { sortBy } from '../utils/arrays';
import GameState from './GameState';

type Props = Readonly<{
  renderer: Renderer
}>;

export class GameEngine {
  private renderer: Renderer;
  constructor({ renderer }: Props) {
    this.renderer = renderer;
  }

  playTurn = async () => {
    const state = GameState.getInstance();
    const map = state.getMap();

    const sortedUnits = _sortUnits(map.units);
    for (const unit of sortedUnits) {
      await unit.update();
    }

    // TODO: update other things
    for (const spawner of map.spawners) {
      await spawner.update();
    }

    await this.render();
    state.nextTurn();
  };

  render = async () => this.renderer.render();
}

/**
 * Sort the list of units such that the player unit is first in the order,
 * and other units appear in unspecified order
 */
const _sortUnits = (units: Unit[]): Unit[] => sortBy(
  units,
  unit => (unit.getFaction() === 'PLAYER') ? 0 : 1
);
