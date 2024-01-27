import GameState from './GameState';
import { Session } from './Session';
import { loadNextMap } from '../actions/loadNextMap';
import { killEnemies } from '../actions/debug/killEnemies';
import { levelUp as _levelUp } from '../actions/levelUp';
import { die } from '../actions/die';
import ItemFactory from '../items/ItemFactory';
import { playSound } from '../sounds/playSound';
import Sounds from '../sounds/Sounds';

type Props = Readonly<{
  state: GameState;
  session: Session;
}>;

export class Debug {
  private readonly state: GameState;
  private readonly session: Session;
  private _isMapRevealed: boolean;

  constructor({ state, session }: Props) {
    this.state = state;
    this.session = session;
    this._isMapRevealed = false;
  }

  toggleRevealMap = async () => {
    this._isMapRevealed = !this._isMapRevealed;
  };

  isMapRevealed = () => this._isMapRevealed;

  killPlayer = async () => {
    const playerUnit = this.session.getPlayerUnit();
    await die(playerUnit, {
      state: this.state,
      map: this.session.getMap(),
      session: this.session
    });
  };

  levelUp = async () => {
    const playerUnit = this.session.getPlayerUnit();
    _levelUp(playerUnit, this.session);
  };

  awardEquipment = async () => {
    // eslint-disable-next-line no-alert
    const id = prompt('Enter a valid equipment_id')!;
    const item = await ItemFactory.createInventoryEquipment(id);
    const playerUnit = this.session.getPlayerUnit();
    playerUnit.getInventory().add(item);
    this.session
      .getTicker()
      .log(`Picked up a ${item.name}.`, { turn: this.session.getTurn() });
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
      killEnemies: () => killEnemies(this.session.getMap(), this.session),
      nextLevel: async () => {
        await loadNextMap({
          state: this.state,
          session: this.session
        });
      }
    };
  };
}
