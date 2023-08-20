import Game from './Game';
import { loadNextMap } from '../actions/loadNextMap';
import { killEnemies } from '../actions/debug/killEnemies';
import { levelUp as _levelUp } from '../actions/levelUp';
import { die } from '../actions/die';
import ItemFactory from '../items/ItemFactory';
import ImageFactory from '../graphics/images/ImageFactory';
import { playSound } from '../sounds/playSound';
import Sounds from '../sounds/Sounds';
import Ticker from './Ticker';
import MapFactory from '../maps/MapFactory';

type Props = Readonly<{
  game: Game,
  imageFactory: ImageFactory,
  mapFactory: MapFactory,
  ticker: Ticker
}>;

export class Debug {
  private readonly game: Game;
  private readonly imageFactory: ImageFactory;
  private readonly mapFactory: MapFactory;
  private readonly ticker: Ticker;
  private _isMapRevealed: boolean;

  constructor({ game, imageFactory, mapFactory, ticker }: Props) {
    this.game = game;
    this.imageFactory = imageFactory;
    this.mapFactory = mapFactory;
    this.ticker = ticker;
    this._isMapRevealed = false;
  }

  toggleRevealMap = async () => {
    this._isMapRevealed = !this._isMapRevealed;
  };

  isMapRevealed = () => this._isMapRevealed;

  killPlayer = async () => {
    const playerUnit = this.game.getPlayerUnit();
    await die(playerUnit, {
      game: this.game,
      map: this.game.getMap(),
      imageFactory: this.imageFactory,
      ticker: this.ticker
    });
  };

  levelUp = async () => {
    const playerUnit = this.game.getPlayerUnit();
    _levelUp(playerUnit, {
      game: this.game,
      ticker: this.ticker
    });
  };

  awardEquipment = async () => {
    const id = prompt('Enter a valid equipment_id')!;
    const item = await ItemFactory.createInventoryEquipment(id);
    const playerUnit = this.game.getPlayerUnit();
    playerUnit.getInventory().add(item);
    this.ticker.log(`Picked up a ${item.name}.`, { turn: this.game.getTurn() });
    playSound(Sounds.PICK_UP_ITEM);
  };

  attachToWindow = () => {
    // @ts-ignore
    window.jwb = window.jwb ?? {};
    // @ts-ignore
    window.jwb.debug = {
      ...this,
      killEnemies: () => killEnemies({
        game: this.game,
        map: this.game.getMap()
      }),
      nextLevel: async () => {
        await loadNextMap({
          game: this.game,
          mapFactory: this.mapFactory,
          imageFactory: this.imageFactory
        });
      }
    };
  };
}
