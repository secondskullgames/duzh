import { resolvedPromise } from '../utils/PromiseUtils';
import Unit from './Unit';
import { Entity, Tile } from '../types';

const WIDTH = 80;
const HEIGHT = 32;

class AsciiRenderer {
  private readonly _container: HTMLDivElement;
  private readonly _pre: HTMLPreElement;

  constructor() {
    this._container = <any>document.getElementById('container');
    this._container.innerHTML = '';
    this._pre = document.createElement('pre');
    this._container.appendChild(this._pre);
  }

  render(): Promise<any> {
    const { screen } = jwb.state;
    switch (screen) {
      case 'GAME':
        return this._renderGameScreen();
      case 'INVENTORY':
        return this._renderInventoryScreen();
      default:
        throw `Invalid screen ${screen}`;
    }
  }

  private _renderGameScreen(): Promise<any> {
    const map = jwb.state.getMap();

    const lines: string[] = ['', '', '']; // extra room for messages
    const mapHeight = HEIGHT - 7;
    for (let y = 0; y < mapHeight; y++) {
      let line = '';
      for (let x = 0; x < WIDTH; x++) {
        if (map.contains({ x, y })) {
          const element = map.getUnit({ x, y }) || map.getItem({ x, y }) || map.getTile({ x, y });
          line += this._renderElement(element);
        } else {
          line += ' ';
        }
      }
      lines.push(line);
    }
    lines.push('', '', '');
    lines.push(this._getStatusLine());
    this._addMessageLines(lines);
    this._pre.innerHTML = lines.map(line => line.padEnd(WIDTH, ' ')).join('\n');
    return resolvedPromise();
  }

  private _renderInventoryScreen(): Promise<any> {
    const { state } = jwb;
    const { playerUnit } = state;
    const { inventory } = playerUnit;

    const inventoryLines: string[] = [];

    const items = inventory.get(inventory.selectedCategory);
    inventoryLines.push(inventory.selectedCategory);
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item === inventory.selectedItem) {
        inventoryLines.push(`<span style="color: #f00">${item.name}</span>`);
      } else {
        inventoryLines.push(item.name);
      }
    }

    const lines = ['INVENTORY', ''];

    for (let y = 0; y < HEIGHT - 3; y++) {
      let line = (y < inventoryLines.length) ? inventoryLines[y] : '';
      lines.push(line);
    }
    lines.push(this._getStatusLine());
    this._addMessageLines(lines);
    this._pre.innerHTML = lines.map(line => line.padEnd(WIDTH, ' ')).join('\n');
    return resolvedPromise();
  }

  private _renderElement(element: Tile | Entity): string {
    if (element instanceof Unit) {
      return `<span style="color: ${(element.name === 'player') ? '#0cf' : '#f00'}">@</span>`;
    } else {
      return element.char;
    }
  }

  private _getStatusLine(): string {
    const { playerUnit, mapIndex } = jwb.state;
    return `HP: ${playerUnit.life}/${playerUnit.maxLife}    Damage: ${playerUnit.getDamage()}    Level: ${(mapIndex || 0) + 1}`;
  }

  private _addMessageLines(lines: string[]): void {
    const { messages } = jwb.state;
    for (let i = 0; i < messages.length; i++) {
      const message = messages.pop();
      if (!!message) {
        lines[i] = message;
      }
    }
  }
}

export default AsciiRenderer;
