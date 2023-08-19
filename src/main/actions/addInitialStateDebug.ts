import GameState from '../core/GameState';
import UnitFactory from '../entities/units/UnitFactory';
import MapSpec from '../schemas/MapSpec';
import { Feature } from '../utils/features';
import ItemFactory from '../items/ItemFactory';
import Ticker from '../core/Ticker';
import Dungeon from '../core/Dungeon';

type Context = Readonly<{
  state: GameState,
  itemFactory: ItemFactory,
  unitFactory: UnitFactory,
  ticker: Ticker
}>;

export const addInitialStateDebug = async ({ state, itemFactory, unitFactory, ticker }: Context) => {
  const playerUnit = await unitFactory.createPlayerUnit();
  if (Feature.isEnabled(Feature.GOD_MODE)) {
    ticker.log('You are a god! Use your power wisely!', { turn: state.getTurn() });
    for (const equipmentId of ['god_sword', 'god_armor']) {
      const equipment = await itemFactory.createEquipment(equipmentId);
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