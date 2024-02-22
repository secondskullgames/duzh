import GeneratedMapModel from '../schemas/GeneratedMapModel';
import PredefinedMapModel from '../schemas/PredefinedMapModel';

export const levelTwo = (): GeneratedMapModel => ({
  levelNumber: 2,
  width: 22,
  height: 20,
  enemies: [
    { id: 'green_snake', count: 1 },
    { id: 'red_snake', count: 2 },
    { id: 'grunt', count: 2 }
  ],
  items: [
    { id: 'life_potion', count: 2 },
    { id: 'mana_potion', count: 1 },
    { id: 'floor_fire_scroll', count: 1 }
  ],
  equipment: [{ id: 'short_bow', count: 1 }],
  objects: [{ id: 'health_globe', count: 2 }],
  fogOfWar: {
    enabled: true,
    radius: 3
  }
});

export const levelThree = (): GeneratedMapModel => ({
  levelNumber: 3,
  width: 24,
  height: 22,
  enemies: [
    { id: 'red_snake', count: 1 },
    { id: 'grunt', count: 2 },
    { id: 'goblin_soldier', count: 2 }
  ],
  items: [{ id: 'life_potion', count: 3 }],
  equipment: [{ id: 'bronze_chain_mail', count: 1 }],
  objects: [{ id: 'health_globe', count: 2 }],
  fogOfWar: {
    enabled: true,
    radius: 3
  }
});

export const levelFour = (): GeneratedMapModel => ({
  levelNumber: 4,
  width: 24,
  height: 24,
  enemies: [
    { id: 'grunt', count: 2 },
    { id: 'goblin_soldier', count: 2 },
    { id: 'red_beetle', count: 1 },
    { id: 'green_blob', count: 1 }
  ],
  items: [{ id: 'life_potion', count: 3 }],
  equipment: [
    { id: 'iron_sword', count: 1 },
    { id: 'iron_shield', count: 1 }
  ],
  objects: [{ id: 'health_globe', count: 3 }],
  fogOfWar: {
    enabled: true,
    radius: 3
  }
});

export const levelFive = (): GeneratedMapModel => ({
  levelNumber: 5,
  width: 26,
  height: 24,
  enemies: [
    { id: 'grunt', count: 1 },
    { id: 'goblin_soldier', count: 2 },
    { id: 'red_beetle', count: 1 },
    { id: 'green_blob', count: 1 },
    { id: 'scorpion', count: 1 },
    { id: 'archer', count: 1 },
    { id: 'fire_golem', count: 1 }
  ],
  items: [
    { id: 'life_potion', count: 3 },
    { id: 'floor_fire_scroll', count: 1 }
  ],
  equipment: [
    { id: 'iron_chain_mail', count: 1 },
    { id: 'long_bow', count: 1 }
  ],
  objects: [
    { id: 'health_globe', count: 3 },
    { id: 'mirror', count: 1 }
  ],
  fogOfWar: {
    enabled: true,
    radius: 3
  }
});

export const levelSix = (): GeneratedMapModel => ({
  levelNumber: 6,
  width: 28,
  height: 24,
  enemies: [
    { id: 'goblin_soldier', count: 2 },
    { id: 'red_beetle', count: 1 },
    { id: 'green_blob', count: 1 },
    { id: 'scorpion', count: 1 },
    { id: 'fire_golem', count: 2 },
    { id: 'golem', count: 2 }
  ],
  items: [
    { id: 'life_potion', count: 3 },
    { id: 'floor_fire_scroll', count: 1 }
  ],
  equipment: [{ id: 'steel_sword', count: 1 }],
  objects: [{ id: 'health_globe', count: 3 }],
  fogOfWar: {
    enabled: true,
    radius: 3
  }
});

export const levelSeven = (): PredefinedMapModel => ({
  imageFilename: '7',
  tileset: 'dungeon',
  levelNumber: 7,
  tileColors: {
    BLACK: 'FLOOR',
    DARK_GRAY: 'WALL',
    LIGHT_GRAY: 'WALL_TOP',
    GREEN: 'STAIRS_DOWN',
    DARK_BROWN: 'FLOOR',
    BLUE: 'FLOOR',
    RED: 'FLOOR'
  },
  defaultTile: 'FLOOR',
  enemyColors: {
    RED: 'robed_wizard'
  },
  itemColors: {},
  equipmentColors: {},
  objectColors: {
    DARK_BROWN: 'door_vertical'
  },
  startingPointColor: 'BLUE',
  fogOfWar: {
    enabled: false
  }
});

export const levelEight = (): PredefinedMapModel => ({
  imageFilename: '8',
  tileset: 'dungeon',
  levelNumber: 8,
  tileColors: {
    BLACK: 'FLOOR',
    DARK_GRAY: 'WALL',
    LIGHT_GRAY: 'WALL_TOP',
    GREEN: 'STAIRS_DOWN',
    DARK_GREEN: 'FLOOR',
    DARK_BLUE: 'FLOOR',
    DARK_RED: 'FLOOR',
    DARK_YELLOW: 'FLOOR',
    YELLOW: 'FLOOR',
    DARK_BROWN: 'FLOOR',
    CYAN: 'FLOOR',
    BLUE: 'FLOOR'
  },
  defaultTile: 'FLOOR',
  enemyColors: {
    DARK_GREEN: 'goblin_soldier',
    DARK_BLUE: 'golem'
  },
  itemColors: {
    DARK_RED: 'life_potion',
    DARK_YELLOW: 'floor_fire_scroll',
    YELLOW: 'key'
  },
  equipmentColors: {},
  objectColors: {
    DARK_BROWN: 'door_vertical',
    CYAN: 'mirror'
  },
  startingPointColor: 'BLUE',
  fogOfWar: {
    enabled: true,
    radius: 3
  }
});
