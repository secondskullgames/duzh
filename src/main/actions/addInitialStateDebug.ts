import GameState from '../core/GameState';
import UnitFactory from '../entities/units/UnitFactory';
import ImageFactory from '../graphics/images/ImageFactory';
import MapSpec from '../schemas/MapSpec';
import { Feature } from '../utils/features';
import ItemFactory from '../items/ItemFactory';
import Ticker from '../core/Ticker';
import Dungeon from '../core/Dungeon';

type Context = Readonly<{
  state: GameState,
  ticker: Ticker
}>;

export const addInitialStateDebug = async ({ state, ticker }: Context) => {
  const playerUnit = await UnitFactory.createPlayerUnit();
  if (Feature.isEnabled(Feature.GOD_MODE)) {
    ticker.log('You are a god! Use your power wisely!', { turn: state.getTurn() });
    for (const equipmentId of ['god_sword', 'god_armor']) {
      const equipment = await ItemFactory.createEquipment(equipmentId);
      playerUnit.getEquipment().add(equipment);
      equipment.attach(playerUnit);
      ticker.log(`Equipped ${equipment.getName()}.`, { turn: state.getTurn() });
    }
  }
  state.setPlayerUnit(playerUnit);
  const mapSpecs: MapSpec[] = [
    { type: 'predefined', id: 'test' }
  ];
  const dungeon = new Dungeon({ mapSpecs });
  state.loadDungeon(dungeon);
};