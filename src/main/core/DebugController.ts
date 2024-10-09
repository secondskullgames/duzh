import { levelUp as _levelUp } from '../actions/levelUp';
import Sounds from '../sounds/Sounds';
import { ItemFactory } from '../items/ItemFactory';
import MapInstance from '../maps/MapInstance';
import { die } from '@main/actions/die';
import { MapController } from '@main/maps/MapController';
import { Faction } from '@main/units/Faction';
import { Game } from '@main/core/Game';
import { inject, injectable } from 'inversify';

@injectable()
export class DebugController {
  private _isMapRevealed: boolean;

  constructor(
    @inject(Game)
    private readonly game: Game,
    @inject(MapController)
    private readonly mapController: MapController,
    @inject(ItemFactory)
    private readonly itemFactory: ItemFactory
  ) {
    this._isMapRevealed = false;
  }

  toggleRevealMap = async () => {
    this._isMapRevealed = !this._isMapRevealed;
  };

  isMapRevealed = () => this._isMapRevealed;

  killPlayer = async () => {
    const { state } = this.game;
    const playerUnit = state.getPlayerUnit();
    await die(playerUnit, this.game);
  };

  levelUp = async () => {
    const { state } = this.game;
    const playerUnit = state.getPlayerUnit();
    _levelUp(playerUnit, this.game);
  };

  awardEquipment = async () => {
    const { itemFactory } = this;
    const { soundPlayer, state, ticker } = this.game;

    // eslint-disable-next-line no-alert
    const id = prompt('Enter a valid equipment_id')!;
    const item = await itemFactory.createInventoryEquipment(id);
    const playerUnit = state.getPlayerUnit();
    playerUnit.getInventory().add(item);
    ticker.log(`Picked up a ${item.name}.`, { turn: state.getTurn() });
    soundPlayer.playSound(Sounds.PICK_UP_ITEM);
  };

  attachToWindow = () => {
    const { mapController } = this;
    const { state } = this.game;
    const rootElelement = document.getElementById('debug');
    const items = [
      {
        label: 'Reveal Map',
        onClick: () => this.toggleRevealMap()
      },
      {
        label: 'Kill Enemies',
        onClick: () => this.killEnemies(state.getPlayerUnit().getMap())
      },
      {
        label: 'Kill Player',
        onClick: () => this.killPlayer()
      },
      {
        label: 'Level Up',
        onClick: () => this.levelUp()
      },
      {
        label: 'Next Level',
        onClick: () => mapController.loadNextMap(this.game)
      },
      {
        label: 'Award Equipment',
        onClick: () => this.awardEquipment()
      }
    ];
    if (rootElelement) {
      for (const item of items) {
        const button = document.createElement('button');
        button.addEventListener('click', item.onClick);
        button.innerHTML = item.label;
        rootElelement.appendChild(button);
      }
      rootElelement.style.display = 'block';
    }
  };

  private killEnemies = async (map: MapInstance) => {
    for (const unit of map.getAllUnits()) {
      if (unit.getFaction() === Faction.ENEMY) {
        await die(unit, this.game);
      }
    }
  };
}
