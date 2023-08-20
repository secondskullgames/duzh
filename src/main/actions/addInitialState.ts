import Game from '../core/Game';
import UnitFactory from '../entities/units/UnitFactory';
import ImageFactory from '../graphics/images/ImageFactory';
import MapSpec from '../schemas/MapSpec';
import { Feature } from '../utils/features';
import ItemFactory from '../items/ItemFactory';
import Ticker from '../core/Ticker';
import Dungeon from '../core/Dungeon';

type Context = Readonly<{
  game: Game,
  imageFactory: ImageFactory,
  ticker: Ticker
}>;

export const addInitialState = async ({ game, imageFactory, ticker }: Context) => {
  const playerUnit = await UnitFactory.createPlayerUnit({
    imageFactory
  });
  if (Feature.isEnabled(Feature.GOD_MODE)) {
    ticker.log('You are a god! Use your power wisely!', { turn: game.getTurn() });
    for (const equipmentId of ['god_sword', 'god_armor']) {
      const equipment = await ItemFactory.createEquipment(equipmentId, { imageFactory });
      playerUnit.getEquipment().add(equipment);
      equipment.attach(playerUnit);
      ticker.log(`Equipped ${equipment.getName()}.`, { turn: game.getTurn() });
    }
  }
  game.setPlayerUnit(playerUnit);
  const mapSpecs: MapSpec[] = [
    { type: 'generated', id: '1' },
    { type: 'generated', id: '2' },
    { type: 'generated', id: '3' },
    { type: 'generated', id: '4' },
    { type: 'generated', id: '5' },
    { type: 'generated', id: '6' },
    { type: 'predefined', id: '7' },
    { type: 'predefined', id: '8' }
  ];
  const dungeon = new Dungeon({ mapSpecs });
  game.loadDungeon(dungeon);
};