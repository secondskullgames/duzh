{
  const MAX_EXITS = 2;

  /**
   * Based on http://www.roguebasin.com/index.php?title=Basic_BSP_Dungeon_generation
   *
   * @param {!int} minRoomDimension outer width, including wall
   * @param {!int} maxRoomDimension outer width, including wall
   * @param {!int} minRoomPadding
   * @constructor
   */
  function DungeonGenerator(minRoomDimension, maxRoomDimension, minRoomPadding) {
    const { MapUtils, RandomUtils } = jwb.utils;
    const { pickUnoccupiedLocations } = MapUtils;
    const { randInt, randChoice } = RandomUtils;

    /**
     * @param {!int} level
     * @param {!int} width
     * @param {!int} height
     * @param {!int} numEnemies
     * @param {!Function} enemyUnitSupplier (Coordinates -> Unit)
     * @param {!int} numItems
     * @param {!Function} itemSupplier (Coordinates -> Item)
     * @return MapSupplier
     */
    function generateDungeon(level, width, height, numEnemies, enemyUnitSupplier, numItems, itemSupplier) {
      const { Tiles } = jwb.types;
      const section = _generateSection(width, height);
      _joinSection(section);
      const { tiles } = section;
      const [stairsLocation] = pickUnoccupiedLocations(tiles, [Tiles.FLOOR], [], 1);
      const [playerLocation] = pickUnoccupiedLocations(tiles, [Tiles.FLOOR, Tiles.FLOOR_HALL], [stairsLocation], 1);
      const enemyLocations = pickUnoccupiedLocations(tiles, [Tiles.FLOOR, Tiles.FLOOR_HALL], [stairsLocation, playerLocation], numEnemies);
      const itemLocations = pickUnoccupiedLocations(tiles, [Tiles.FLOOR, Tiles.FLOOR_HALL], [stairsLocation, playerLocation, ...enemyLocations], numItems);
      tiles[stairsLocation.y][stairsLocation.x] = Tiles.STAIRS_DOWN;
      return new MapSupplier(level, width, height, tiles, section.rooms, playerLocation, enemyLocations, enemyUnitSupplier, itemLocations, itemSupplier)
    }

    /**
     * Generate a rectangular area of tiles with the specified dimensions, consisting of any number of rooms connected
     * by corridors.  To do so, split the area into two sub-areas and call this method recursively.  If this area is
     * not large enough to form two sub-regions, just return a single section.
     *
     * @param {!int} width
     * @param {!int} height
     * @return {!MapSection}
     * @private
     */
    function _generateSection(width, height) {
      // First, make sure the area is large enough to support two sections; if not, we're done
      const minSectionDimension = minRoomDimension + (2 * minRoomPadding);
      const canSplitHorizontally = (width >= (2 * minSectionDimension));
      const canSplitVertically = (height >= (2 * minSectionDimension));

      const mustSplitHorizontally = width > (maxRoomDimension + 2 * minRoomPadding);
      const mustSplitVertically = height > (maxRoomDimension + 2 * minRoomPadding);

      const splitDirections = [
        ...(canSplitHorizontally ? ['HORIZONTAL'] : []),
        ...(canSplitVertically ? ['VERTICAL'] : []),
        ...((!mustSplitHorizontally && !mustSplitVertically) ? [null] : [])
      ];

      /*
       * MATH IS HARD
       *
       * 3  4  5  6  7  8  9  10 11 12 13 14 15
       * #  #  #  #  #  #  #  #  #  #  #  #  #
       * #                 |                 #
       * #                 |                 #
       * #  #  #  #  #  #  #  #  #  #  #  #  #
       *
       * left: 3
       * right: 16
       * width: 13
       * splitX: 9
       * leftWidth = 6            = splitX - left
       * rightWidth = 7           = right - splitX
       */
      if (splitDirections.length > 0) {
        const direction = randChoice(splitDirections);
        if (direction === 'HORIZONTAL') {
          const splitX = _getSplitPoint(width);
          const leftWidth = splitX;
          const rightWidth = width - splitX;
          const leftSection = _generateSection(leftWidth, height);
          const rightSection = _generateSection(rightWidth, height);

          const tiles = [];
          for (let y = 0; y < leftSection.tiles.length; y++) {
            const row = [...leftSection.tiles[y], ...rightSection.tiles[y]];
            tiles.push(row);
          }
          // rightSection.rooms are relative to its own origin, we need to offset them by rightSection's coordinates
          // relative to this section's coordinates
          const rightRooms = rightSection.rooms
            .map(room => ({ ...room, left: room.left + splitX }));

          return {
            width,
            height,
            rooms: [...leftSection.rooms, ...rightRooms],
            tiles
          };
        } else if (direction === 'VERTICAL') {
          const splitY = _getSplitPoint(height);
          const topHeight = splitY;
          const bottomHeight = height - splitY;
          const topSection = _generateSection(width, topHeight);
          const bottomSection = _generateSection(width, bottomHeight);
          const tiles = [...topSection.tiles, ...bottomSection.tiles];
          const bottomRooms = bottomSection.rooms
            .map(room => ({ ...room, top: room.top + splitY }));
          return {
            width,
            height,
            rooms: [...topSection.rooms, ...bottomRooms],
            tiles
          };
        }
      }

      // Base case: return a single section
      return _generateSingleSection(width, height);
    }

    /**
     * Create a rectangular section of tiles, consisting of a room surrounded by empty spaces.  The room can be placed
     * anywhere in the region at random, and can occupy a variable amount of space in the region
     * (within the specified parameters).
     *
     * @param {!int} width section width
     * @param {!int} height section height
     * @return {!MapSection}
     * @private
     */
    function _generateSingleSection(width, height) {
      const { Tiles } = jwb.types;
      const maxRoomWidth = width - (2 * minRoomPadding);
      const maxRoomHeight = height - (2 * minRoomPadding);
      const roomWidth = randInt(minRoomDimension, maxRoomWidth);
      const roomHeight = randInt(minRoomDimension, maxRoomHeight);
      const roomTiles = _generateRoomTiles(roomWidth, roomHeight);

      const roomLeft = randInt(minRoomPadding, width - roomWidth - minRoomPadding);
      const roomTop = randInt(minRoomPadding, height - roomHeight - minRoomPadding);
      const tiles = [];
      // x, y are relative to the section's origin
      // roomX, roomY are relative to the room's origin
      for (let y = 0; y < height; y++) {
        tiles[y] = [];
        const roomY = y - roomTop;
        for (let x = 0; x < width; x++) {
          const roomX = x - roomLeft;
          if (roomX >= 0 && roomX < roomWidth && roomY >= 0 && roomY < roomHeight) {
            tiles[y][x] = roomTiles[roomY][roomX];
          } else {
            tiles[y][x] = Tiles.NONE;
          }
        }
      }

      /**
       * @type Room
       */
      const room = {
        left: roomLeft,
        top: roomTop,
        width: roomWidth,
        height: roomHeight,
        exits: []
      };
      return { width, height, rooms: [room], tiles };
    }

    /**
     * @param {!int} width
     * @param {!int} height
     * @return {!Tile[][]}
     * @private
     */
    function _generateRoomTiles(width, height) {
      const { Tiles } = jwb.types;
      const tiles = [];
      for (let y = 0; y < height; y++) {
        tiles[y] = [];
        for (let x = 0; x < width; x++) {
          if (x > 0 && x < (width - 1) && y === 0) {
            tiles[y][x] = Tiles.WALL_TOP;
          } else if (x === 0 || x === (width - 1) || y === 0 || y === (height - 1)) {
            tiles[y][x] = Tiles.WALL;
          } else {
            tiles[y][x] = Tiles.FLOOR;
          }
        }
      }
      return tiles;
    }

    /**
     * @param {!int} dimension width or height
     * @returns {!int} the min X/Y coordinate of the *second* room
     * @private
     */
    function _getSplitPoint(dimension) {
      const minSectionDimension = minRoomDimension + 2 * minRoomPadding;
      const minSplitPoint = minSectionDimension;
      const maxSplitPoint = dimension - minSectionDimension;
      return randInt(minSplitPoint, maxSplitPoint);
    }

    /**
     * @param {!MapSection} section
     * @private
     */
    function _joinSection(section) {
      const { shuffle } = jwb.utils.RandomUtils;
      const { Tiles } = jwb.types;

      const unconnectedRooms = [...section.rooms];
      const connectedRooms = [];
      connectedRooms.push(unconnectedRooms.pop());

      while (unconnectedRooms.length > 0) {
        const candidatePairs = connectedRooms
          .flatMap(connectedRoom => unconnectedRooms.map(unconnectedRoom => [connectedRoom, unconnectedRoom]))
          .filter(([connectedRoom, unconnectedRoom]) => _canJoinRooms(connectedRoom, unconnectedRoom));
        shuffle(candidatePairs);

        let joinedAnyRooms = false;
        for (let [connectedRoom, unconnectedRoom] of candidatePairs) {
          if (_joinRooms(connectedRoom, unconnectedRoom, section)) {
            unconnectedRooms.splice(unconnectedRooms.indexOf(unconnectedRoom), 1);
            connectedRooms.push(unconnectedRoom);
            joinedAnyRooms = true;
            break;
          }
        }

        if (!joinedAnyRooms) {
          console.error('Couldn\'t connect rooms!');
          break;
        }
      }

      // add some extra connections for fun
      const candidatePairs = connectedRooms
        .flatMap(first => connectedRooms.map(second => [first, second]))
        .filter(([first, second]) => _canJoinRooms(first, second));
      shuffle(candidatePairs);

      if (candidatePairs.length > 0) {
        for (let [first, second] of candidatePairs) {
          if (_canJoinRooms(first, second)) {
            _joinRooms(first, second, section); // don't care if it worked
          }
        }
      }

      // add walls above corridor tiles if possible
      for (let y = 0; y < section.height; y++) {
        for (let x = 0; x < section.width; x++) {
          if (y > 0) {
            if (section.tiles[y][x] === Tiles.FLOOR_HALL) {
              if (section.tiles[y - 1][x] === Tiles.NONE || section.tiles[y - 1][x] === Tiles.WALL) {
                section.tiles[y - 1][x] = Tiles.WALL_HALL;
              }
            }
          }
        }
      }
    }

    /**
     * @param {Room} first
     * @param {Room} second
     * @private
     */
    function _canJoinRooms(first, second) {
      return (first !== second) && (first.exits.length < MAX_EXITS) && (second.exits.length < MAX_EXITS);
    }

    /**
     * @param {!Room} first
     * @param {!Room} second
     * @param {!MapSection} section
     * @return {!boolean}
     * @private
     */
    function _joinRooms(first, second, section) {
      const { shuffle } = jwb.utils.RandomUtils;
      const firstExitCandidates = _getExitCandidates(first);
      const secondExitCandidates = _getExitCandidates(second);
      shuffle(firstExitCandidates);
      shuffle(secondExitCandidates);

      for (let firstExit of firstExitCandidates) {
        for (let secondExit of secondExitCandidates) {
          if (_joinExits(firstExit, secondExit, section)) {
            first.exits.push(firstExit);
            second.exits.push(secondExit);
            return true;
          }
        }
      }

      return false;
    }

    /**
     * @param {!Room} room
     * @return {!Coordinates[]}
     * @private
     */
    function _getExitCandidates(room) {
      const eligibleSides = [
        ...(!room.exits.some(exit => exit.y === room.top) ? ['TOP'] : []),
        ...(!room.exits.some(exit => exit.x === room.left + room.width - 1) ? ['RIGHT'] : []),
        ...(!room.exits.some(exit => exit.y === room.top + room.height - 1) ? ['BOTTOM'] : []),
        ...(!room.exits.some(exit => exit.x === room.left) ? ['LEFT'] : [])
      ];

      if (eligibleSides.length === 0) {
        throw 'Error: out of eligible sides';
      }

      const candidates = [];
      eligibleSides.forEach(side => {
        switch (side) {
          case 'TOP':
            for (let x = room.left + 1; x < room.left + room.width - 1; x++) {
              candidates.push({ x, y: room.top });
            }
            break;
          case 'RIGHT':
            for (let y = room.top + 1; y < room.top + room.height - 1; y++) {
              candidates.push({ x: room.left + room.width - 1, y });
            }
            break;
          case 'BOTTOM':
            for (let x = room.left + 1; x < room.left + room.width - 1; x++) {
              candidates.push({ x, y: room.top + room.height - 1 });
            }
            break;
          case 'LEFT':
            for (let y = room.top + 1; y < room.top + room.height - 1; y++) {
              candidates.push({ x: room.left, y });
            }
            break;
          default:
            throw `Unknown side ${side}`;
        }
      });

      return candidates;
    }

    /**
     * @param {!Coordinates} firstExit
     * @param {!Coordinates} secondExit
     * @param {!MapSection} section
     * @return {!boolean}
     * @private
     */
    function _joinExits(firstExit, secondExit, section) {
      const { Tiles } = jwb.types;
      const { coordinatesEquals } = jwb.utils.MapUtils;

      const blockedTileDetector = ({ x, y }) => {
        // can't draw a path through an existing room or a wall
        const blockedTileTypes = [Tiles.FLOOR, Tiles.WALL, Tiles.WALL_HALL, Tiles.WALL_TOP];

        if ([firstExit, secondExit].some(exit => coordinatesEquals({ x, y }, exit))) {
          return false;
        } else if (section.tiles[y][x] === Tiles.NONE || section.tiles[y][x] === Tiles.FLOOR_HALL) {
          // skip the check if we're within 2 tiles of an exit
          const isNextToExit = [-2, -1, 1, 2].some(dy => (
            [firstExit, secondExit].some(exit => coordinatesEquals(exit, { x, y: y + dy }))
          ));

          if (isNextToExit) {
            return false;
          }

          // can't draw tiles near walls
          for (let dy of [-2, -1, 1, 2]) {
            if ((y + dy >= 0) && (y + dy < section.height)) {
              const tile = section.tiles[y + dy][x];
              if (blockedTileTypes.indexOf(tile) > -1) {
                return true;
              }
            }
          }
          return false;
        } else if (blockedTileTypes.indexOf(section.tiles[y][x]) > -1) {
          return true;
        }
        // how'd we get here?
        return true;
      };

      const mapRect = { left: 0, top: 0, width: section.width, height: section.height };
      const path = new jwb.Pathfinder(blockedTileDetector).findPath(firstExit, secondExit, mapRect);
      path.forEach(({ x, y }) => {
        section.tiles[y][x] = Tiles.FLOOR_HALL;
      });

      return (path.length > 0);
    }

    function _logSections(name, ...sections) {
      console.log(`Sections for ${name}:`);
      sections.forEach(section => console.log(section.tiles
        .map(row => row.map(tile => tile.char).join(''))
        .join('\n')));
      console.log();
    }

    return {
      generateDungeon
    };
  }

  window.jwb = window.jwb || {};
  jwb.DungeonGenerator = DungeonGenerator;
}