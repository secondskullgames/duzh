import ItemFactory from '../items/ItemFactory.js';
import UnitFactory from '../units/UnitFactory.js';
import RoomCorridorDungeonGenerator from './generation/RoomCorridorDungeonGenerator.js';
import BlobDungeonGenerator from './generation/BlobDungeonGenerator.js';
import { MapLayout } from '../types/types.js';
import { randInt } from '../utils/RandomUtils.js';
function createRandomMap(mapLayout, tileSet, level, width, height, numEnemies, numItems) {
    var dungeonGenerator = _getDungeonGenerator(mapLayout, tileSet);
    return dungeonGenerator.generateDungeon(level, width, height, numEnemies, UnitFactory.createRandomEnemy, numItems, ItemFactory.createRandomItem);
}
function _getDungeonGenerator(mapLayout, tileSet) {
    switch (mapLayout) {
        case MapLayout.ROOMS_AND_CORRIDORS: {
            var minRoomDimension = randInt(6, 6);
            var maxRoomDimension = randInt(9, 9);
            var minRoomPadding = 0;
            return new RoomCorridorDungeonGenerator(tileSet, minRoomDimension, maxRoomDimension, minRoomPadding);
        }
        case MapLayout.BLOB:
            return new BlobDungeonGenerator(tileSet);
    }
}
export default { createRandomMap: createRandomMap };
//# sourceMappingURL=MapFactory.js.map