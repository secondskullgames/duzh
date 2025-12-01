import { die } from '@main/actions/die';
import { Game } from '@main/core/Game';
import { MapController } from '@main/maps/MapController';
import { Faction } from '@main/units/Faction';
import { levelUp as _levelUp } from '../actions/levelUp';
import { ItemFactory } from '../items/ItemFactory';
import MapInstance from '../maps/MapInstance';

export class DebugController {
  constructor(
    private readonly game: Game,
    private readonly mapController: MapController,
    private readonly itemFactory: ItemFactory
  ) {}

  revealMap = async () => {
    const { state } = this.game;
    const playerUnit = state.getPlayerUnit();
    const map = playerUnit.getMap();
    for (let y = 0; y < map.height; y++) {
      for (let x = 0; x < map.width; x++) {
        map.revealTile({ x, y });
      }
    }
  };

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
    const { soundController, state, ticker } = this.game;
    const id = prompt('Enter a valid equipment_id')!;
    const item = await itemFactory.createInventoryEquipment(id);
    const playerUnit = state.getPlayerUnit();
    playerUnit.getInventory().add(item);
    ticker.log(`Picked up a ${item.name}.`, { turn: state.getTurn() });
    soundController.playSound('pick_up_item');
  };

  awardItem = async () => {
    const { itemFactory } = this;
    const { soundController, state, ticker } = this.game;
    const id = prompt('Enter a valid item_id')!;
    const item = await itemFactory.createInventoryItem(id);
    const playerUnit = state.getPlayerUnit();
    playerUnit.getInventory().add(item);
    ticker.log(`Picked up a ${item.name}.`, { turn: state.getTurn() });
    soundController.playSound('pick_up_item');
  };

  attachToWindow = () => {
    const { mapController } = this;
    const { state } = this.game;
    const rootElelement = document.getElementById('debug');
    const items = [
      {
        label: 'Reveal Map',
        onClick: () => this.revealMap()
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
      },
      {
        label: 'Award Item',
        onClick: () => this.awardItem()
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
