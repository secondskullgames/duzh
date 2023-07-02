import GameState from './GameState';
import GameRenderer from '../graphics/renderers/GameRenderer';
import { loadNextMap } from '../actions/loadNextMap';
import { killEnemies } from '../actions/debug/killEnemies';
import { levelUp as _levelUp } from '../actions/levelUp';
import { die } from '../actions/die';
import ItemFactory from '../items/ItemFactory';
import ImageFactory from '../graphics/images/ImageFactory';
import { logMessage } from '../actions/logMessage';
import { playSound } from '../sounds/playSound';
import Sounds from '../sounds/Sounds';

type Props = Readonly<{
  state: GameState,
  imageFactory: ImageFactory
}>;

export class Debug {
  private readonly state: GameState;
  private readonly imageFactory: ImageFactory;
  private _isMapRevealed: boolean;

  constructor({ state, imageFactory }: Props) {
    this.state = state;
    this.imageFactory = imageFactory;
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
      imageFactory: this.imageFactory
    });
  };

  levelUp = async () => {
    const playerUnit = this.state.getPlayerUnit();
    _levelUp(playerUnit, { state: this.state });
  };

  awardEquipment = async () => {
    const id = prompt('Enter a valid equipment_id')!;
    const item = await ItemFactory.createInventoryEquipment(id);
    const playerUnit = this.state.getPlayerUnit();
    playerUnit.getInventory().add(item);
    logMessage(`Picked up a ${item.name}.`, { state: this.state });
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
