import GameState from './GameState';
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
import SpriteFactory from '../graphics/sprites/SpriteFactory';
import UnitFactory from '../entities/units/UnitFactory';

type Props = Readonly<{
  state: GameState,
  imageFactory: ImageFactory,
  spriteFactory: SpriteFactory,
  mapFactory: MapFactory,
  itemFactory: ItemFactory,
  unitFactory: UnitFactory,
  ticker: Ticker
}>;

export class Debug {
  private readonly state: GameState;
  private readonly imageFactory: ImageFactory;
  private readonly spriteFactory: SpriteFactory;
  private readonly mapFactory: MapFactory;
  private readonly itemFactory: ItemFactory;
  private readonly unitFactory: UnitFactory;
  private readonly ticker: Ticker;
  private _isMapRevealed: boolean;

  constructor({ state, imageFactory, spriteFactory, mapFactory, itemFactory, unitFactory, ticker }: Props) {
    this.state = state;
    this.imageFactory = imageFactory;
    this.spriteFactory = spriteFactory;
    this.mapFactory = mapFactory;
    this.itemFactory = itemFactory;
    this.unitFactory = unitFactory;
    this.ticker = ticker;
    this._isMapRevealed = false;
  }

  toggleRevealMap = async () => {
    this._isMapRevealed = !this._isMapRevealed;
  };

  isMapRevealed = () => this._isMapRevealed;

  killPlayer = async () => {
    const playerUnit = this.state.getPlayerUnit();
    await die(playerUnit, {
      state: this.state,
      map: this.state.getMap(),
      spriteFactory: this.spriteFactory,
      itemFactory: this.itemFactory,
      unitFactory: this.unitFactory,
      ticker: this.ticker
    });
  };

  levelUp = async () => {
    const playerUnit = this.state.getPlayerUnit();
    _levelUp(playerUnit, {
      state: this.state,
      ticker: this.ticker
    });
  };

  awardEquipment = async () => {
    const id = prompt('Enter a valid equipment_id')!;
    const item = await this.itemFactory.createInventoryEquipment(id);
    const playerUnit = this.state.getPlayerUnit();
    playerUnit.getInventory().add(item);
    this.ticker.log(`Picked up a ${item.name}.`, { turn: this.state.getTurn() });
    playSound(Sounds.PICK_UP_ITEM);
  };

  attachToWindow = () => {
    // @ts-ignore
    window.jwb = window.jwb ?? {};
    // @ts-ignore
    window.jwb.debug = {
      ...this,
      killEnemies: () => killEnemies({
        state: this.state,
        map: this.state.getMap()
      }),
      nextLevel: async () => {
        await loadNextMap({
          state: this.state,
          mapFactory: this.mapFactory,
          imageFactory: this.imageFactory,
          spriteFactory: this.spriteFactory,
          itemFactory: this.itemFactory
        });
      }
    };
  };
}
