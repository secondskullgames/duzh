import Tile from './types/Tile';
import Sprite from './classes/Sprite';
import Colors from './types/Colors';
import Entity from './types/Entity';
import InventoryItem from './classes/InventoryItem';

interface Coordinates {
  x: number,
  y: number
}

interface Rect {
  left: number,
  top: number,
  width: number,
  height: number
}

interface Room extends Rect {
  exits: Coordinates[]
}

interface MapSection {
  width: number,
  height: number,
  rooms: Room[],
  tiles: Tile[][]
}

type PaletteSwaps = {
  [src in Colors]?: Colors
}

type Sample = [number, number];

enum ItemCategory {
  POTION = 'POTION',
  SCROLL = 'SCROLL',
  WEAPON = 'WEAPON'
}

enum EquipmentCategory {
  WEAPON = 'WEAPON',
  ARMOR = 'ARMOR'
}

enum GameScreen {
  GAME = 'GAME',
  INVENTORY = 'INVENTORY'
}

type SpriteSupplier = (paletteSwaps?: PaletteSwaps) => Sprite;

export {
  Coordinates,
  Rect,
  MapSection,
  PaletteSwaps,
  Tile,
  Room,
  Sample,
  ItemCategory,
  EquipmentCategory,
  GameScreen,
  SpriteSupplier
};
