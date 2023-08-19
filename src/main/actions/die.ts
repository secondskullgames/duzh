import Unit from '../entities/units/Unit';
import { gameOver } from './gameOver';
import { playSound } from '../sounds/playSound';
import Sounds from '../sounds/Sounds';
import GameState from '../core/GameState';
import { randChance } from '../utils/random';
import ObjectFactory from '../entities/objects/ObjectFactory';
import Ticker from '../core/Ticker';
import MapInstance from '../maps/MapInstance';
import ItemFactory from '../items/ItemFactory';
import SpriteFactory from '../graphics/sprites/SpriteFactory';

type Context = Readonly<{
  state: GameState,
  map: MapInstance,
  spriteFactory: SpriteFactory,
  ticker: Ticker
}>;

// TODO this should be enemy-specific? add loot tables
const HEALTH_GLOBE_DROP_CHANCE = 0.25;

export const die = async (
  unit: Unit,
  { state, map, spriteFactory, ticker }: Context
) => {
  const playerUnit = state.getPlayerUnit();
  const coordinates = unit.getCoordinates();

  map.removeUnit(unit);
  if (unit === playerUnit) {
    await gameOver({ state });
    return;
  } else {
    playSound(Sounds.ENEMY_DIES);
    ticker.log(`${unit.getName()} dies!`, { turn: state.getTurn() });

    if (randChance(HEALTH_GLOBE_DROP_CHANCE)) {
      const healthGlobe = await ObjectFactory.createHealthGlobe(coordinates, { spriteFactory })
      map.addObject(healthGlobe);
    }

    // TODO make this more systematic
    if (unit.getUnitType() === 'WIZARD') {
      const key = await ItemFactory.createMapItem('key', coordinates, { spriteFactory });
      map.addObject(key);
    }
  }
};