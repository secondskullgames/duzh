import Unit from '../entities/units/Unit';
import { gameOver } from './gameOver';
import { playSound } from '../sounds/playSound';
import Sounds from '../sounds/Sounds';
import Game from '../core/Game';
import { randChance } from '../utils/random';
import ObjectFactory from '../entities/objects/ObjectFactory';
import ImageFactory from '../graphics/images/ImageFactory';
import Ticker from '../core/Ticker';
import MapInstance from '../maps/MapInstance';
import ItemFactory from '../items/ItemFactory';

type Context = Readonly<{
  game: Game,
  map: MapInstance,
  imageFactory: ImageFactory,
  ticker: Ticker
}>;

// TODO this should be enemy-specific? add loot tables
const HEALTH_GLOBE_DROP_CHANCE = 0.25;

export const die = async (
  unit: Unit,
  { game, map, imageFactory, ticker }: Context
) => {
  const playerUnit = game.getPlayerUnit();
  const coordinates = unit.getCoordinates();

  map.removeUnit(unit);
  if (unit === playerUnit) {
    await gameOver({ game });
    return;
  } else {
    playSound(Sounds.ENEMY_DIES);
    ticker.log(`${unit.getName()} dies!`, { turn: game.getTurn() });

    if (randChance(HEALTH_GLOBE_DROP_CHANCE)) {
      const healthGlobe = await ObjectFactory.createHealthGlobe(coordinates, { imageFactory })
      map.addObject(healthGlobe);
    }

    // TODO make this more systematic
    if (unit.getUnitType() === 'WIZARD') {
      const key = await ItemFactory.createMapItem('key', coordinates, { imageFactory });
      map.addObject(key);
    }
  }
};