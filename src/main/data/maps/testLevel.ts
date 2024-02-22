import PredefinedMapModel from '../../schemas/PredefinedMapModel';

export default (): PredefinedMapModel => ({
  imageFilename: 'test',
  tileset: 'catacomb',
  levelNumber: 1,
  tileColors: {
    BLACK: 'NONE',
    LIGHT_GRAY: 'FLOOR',
    DARK_GRAY: 'WALL'
  },
  defaultTile: 'FLOOR',
  enemyColors: {
    BLUE: 'dragon_shooter'
  },
  itemColors: {
    MAGENTA: 'floor_fire_scroll'
  },
  equipmentColors: {
    YELLOW: 'fire_sword',
    DARK_YELLOW: 'iron_shield'
  },
  objectColors: {
    DARK_BROWN: 'door_vertical',
    LIGHT_BROWN: 'door_horizontal',
    DARK_BLUE: 'movable_block'
  },
  startingPointColor: 'RED',
  fogOfWar: {
    enabled: false
  }
});
