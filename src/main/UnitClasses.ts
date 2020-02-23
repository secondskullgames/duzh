import SpriteFactory from './SpriteFactory';
import UnitClass from './classes/UnitClass';
import { HUMAN_AGGRESSIVE, HUMAN_CAUTIOUS } from './UnitAI';
import Colors from './types/Colors';

const PLAYER: UnitClass = {
  name: 'PLAYER',
  sprite: SpriteFactory.PLAYER,
  // Green/brown colors
  paletteSwaps: {
    [Colors.DARK_PURPLE]: Colors.DARK_BROWN, // Shirt
    [Colors.MAGENTA]: Colors.DARK_GREEN, // Upper Sleeves
    [Colors.DARK_BLUE]: Colors.DARK_GREEN, // Lower sleeves
    [Colors.CYAN]: Colors.LIGHT_PINK, // Hands
    [Colors.BLACK]: Colors.BLACK, // Belt
    [Colors.DARK_GRAY]: Colors.DARK_BROWN, // Skirt
    [Colors.LIGHT_GRAY]: Colors.LIGHT_BROWN, // Legs
    [Colors.DARK_GREEN]: Colors.DARK_BROWN, // Socks
    [Colors.GREEN]: Colors.DARK_BROWN, // Shoes
    [Colors.ORANGE]: Colors.LIGHT_PINK // Face
  },
  startingLife: 100,
  startingDamage: 10,
  minLevel: 1,
  maxLevel: 20,
  lifePerLevel: level => 10,
  damagePerLevel: level => 2,
  experienceToNextLevel: currentLevel => (currentLevel < 10) ? 2 * currentLevel + 4: null, // 6, 8, 10, 12, 14...
};

const ENEMY_HUMAN_BLUE: UnitClass = {
  name: 'ENEMY_HUMAN_BLUE',
  sprite: SpriteFactory.PLAYER,
  paletteSwaps: {
    [Colors.DARK_PURPLE]: Colors.MEDIUM_BLUE, // Shirt
    [Colors.MAGENTA]: Colors.MEDIUM_BLUE, // Upper Sleeves
    [Colors.DARK_BLUE]: Colors.MEDIUM_BLUE, // Lower sleeves
    [Colors.CYAN]: Colors.LIGHT_PINK, // Hands
    [Colors.BLACK]: Colors.MEDIUM_BLUE, // Belt
    [Colors.DARK_GRAY]: Colors.DARK_BLUE, // Skirt
    [Colors.LIGHT_GRAY]: Colors.DARK_BLUE, // Legs
    [Colors.DARK_GREEN]: Colors.BLACK, // Socks
    [Colors.GREEN]: Colors.BLACK, // Shoes
    [Colors.ORANGE]: Colors.LIGHT_PINK // Face
  },
  startingLife: 75,
  startingDamage: 4,
  minLevel: 1,
  maxLevel: 3,
  lifePerLevel: () => 12,
  damagePerLevel: () => 2,
  aiHandler: HUMAN_CAUTIOUS,
};

const ENEMY_HUMAN_RED: UnitClass = {
  name: 'ENEMY_HUMAN_RED',
  sprite: SpriteFactory.PLAYER,
  paletteSwaps: {
    [Colors.DARK_PURPLE]: Colors.MEDIUM_RED, // Shirt
    [Colors.MAGENTA]: Colors.MEDIUM_RED, // Upper Sleeves
    [Colors.DARK_BLUE]: Colors.MEDIUM_RED, // Lower sleeves
    [Colors.CYAN]: Colors.LIGHT_PINK, // Hands
    [Colors.BLACK]: Colors.MEDIUM_RED, // Belt
    [Colors.DARK_GRAY]: Colors.DARK_RED, // Skirt
    [Colors.LIGHT_GRAY]: Colors.DARK_RED, // Legs
    [Colors.DARK_GREEN]: Colors.BLACK, // Socks
    [Colors.GREEN]: Colors.BLACK, // Shoes
    [Colors.ORANGE]: Colors.LIGHT_PINK // Face
  },
  startingLife: 55,
  startingDamage: 6,
  minLevel: 1,
  maxLevel: 5,
  lifePerLevel: () => 10,
  damagePerLevel: () => 3,
  aiHandler: HUMAN_AGGRESSIVE
};

const ENEMY_HUMAN_BLACK: UnitClass = {
  name: 'ENEMY_HUMAN_BLACK',
  sprite: SpriteFactory.PLAYER,
  paletteSwaps: {
    [Colors.DARK_PURPLE]: Colors.DARKER_GRAY, // Shirt
    [Colors.MAGENTA]: Colors.DARKER_GRAY, // Upper Sleeves
    [Colors.DARK_BLUE]: Colors.DARKER_GRAY, // Lower sleeves
    [Colors.CYAN]: Colors.BLACK, // Hands
    [Colors.BLACK]: Colors.LIGHT_GRAY, // Belt
    [Colors.DARK_GRAY]: Colors.DARKER_GRAY, // Skirt
    [Colors.LIGHT_GRAY]: Colors.DARKER_GRAY, // Legs
    [Colors.DARK_GREEN]: Colors.BLACK, // Socks
    [Colors.GREEN]: Colors.BLACK, // Shoes
    [Colors.ORANGE]: Colors.LIGHT_GRAY, // Face
    [Colors.TEAL]: Colors.RED, // Eyes
    [Colors.LIGHT_BROWN]: Colors.LIGHT_GRAY // Hair
  },
  startingLife: 100,
  startingDamage: 10,
  minLevel: 3,
  maxLevel: 9,
  lifePerLevel: () => 18,
  damagePerLevel: () => 4,
  aiHandler: HUMAN_AGGRESSIVE
};

function getEnemyClasses() {
  return [ENEMY_HUMAN_BLUE, ENEMY_HUMAN_RED, ENEMY_HUMAN_BLACK];
}

export default {
  PLAYER,
  ENEMY_HUMAN_BLUE,
  ENEMY_HUMAN_RED,
  ENEMY_HUMAN_BLACK,
  getEnemyClasses
};