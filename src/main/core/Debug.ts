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

type Props = Readonly<{
  state: GameState,
  imageFactory: ImageFactory,
  ticker: Ticker
}>;

export class Debug {
  private readonly state: GameState;
  private readonly imageFactory: ImageFactory;
  private readonly ticker: Ticker;
  private _isMapRevealed: boolean;

  constructor({ state, imageFactory, ticker }: Props) {
    this.state = state;
    this.imageFactory = imageFactory;
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
      imageFactory: this.imageFactory,
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
    const item = await ItemFactory.createInventoryEquipment(id);
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
        state: this.state
      }),
      nextLevel: async () => {
        await loadNextMap({
          state: this.state
        });
      }
    };
  };
}
