import GameState from './GameState';
import { Session } from './Session';
import { loadNextMap } from '../actions/loadNextMap';
import { killEnemies } from '../actions/debug/killEnemies';
import { levelUp as _levelUp } from '../actions/levelUp';
import { die } from '../actions/die';
import ItemFactory from '../items/ItemFactory';
import ImageFactory from '../graphics/images/ImageFactory';
import { playSound } from '../sounds/playSound';
import Sounds from '../sounds/Sounds';

type Props = Readonly<{
  state: GameState;
  imageFactory: ImageFactory;
  session: Session;
}>;

export class Debug {
  private readonly state: GameState;
  private readonly imageFactory: ImageFactory;
  private readonly session: Session;
  private _isMapRevealed: boolean;

  constructor({ state, imageFactory, session }: Props) {
    this.state = state;
    this.imageFactory = imageFactory;
    this.session = session;
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
      imageFactory: this.imageFactory,
      session: this.session
    });
  };

  levelUp = async () => {
    const playerUnit = this.state.getPlayerUnit();
    _levelUp(playerUnit, {
      state: this.state,
      session: this.session
    });
  };

  awardEquipment = async () => {
    // eslint-disable-next-line no-alert
    const id = prompt('Enter a valid equipment_id')!;
    const item = await ItemFactory.createInventoryEquipment(id);
    const playerUnit = this.state.getPlayerUnit();
    playerUnit.getInventory().add(item);
    this.session
      .getTicker()
      .log(`Picked up a ${item.name}.`, { turn: this.state.getTurn() });
    playSound(Sounds.PICK_UP_ITEM);
  };

  attachToWindow = () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window.jwb = window.jwb ?? {};
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window.jwb.debug = {
      ...this,
      killEnemies: () =>
        killEnemies({
          state: this.state,
          map: this.state.getMap()
        }),
      nextLevel: async () => {
        await loadNextMap({
          state: this.state,
          session: this.session
        });
      }
    };
  };
}
