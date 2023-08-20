import { updateRevealedTiles } from './updateRevealedTiles';
import Unit from '../entities/units/Unit';
import { sortBy } from '../utils/arrays';
import Game from '../core/Game';
import ImageFactory from '../graphics/images/ImageFactory';
import Ticker from '../core/Ticker';
import MapInstance from '../maps/MapInstance';

type Context = Readonly<{
  game: Game,
  map: MapInstance,
  imageFactory: ImageFactory,
  ticker: Ticker
}>;

export const playTurn = async ({ game, map, imageFactory, ticker }: Context) => {
  const sortedUnits = _sortUnits(map.getAllUnits());
  for (const unit of sortedUnits) {
    if (unit.getLife() > 0) {
      await unit.update({ game, map, imageFactory, ticker });
    }
  }

  for (const object of map.getAllObjects()) {
    await object.update({ game, map, imageFactory, ticker });
  }

  updateRevealedTiles({ game, map });
  game.nextTurn();
};

/**
 * Sort the list of units such that the player unit is first in the order,
 * and other units appear in unspecified order
 */
const _sortUnits = (units: Unit[]): Unit[] => sortBy(
  units,
  unit => (unit.getFaction() === 'PLAYER') ? 0 : 1
);