"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var DungeonGenerator_1 = require("./DungeonGenerator");
var Pathfinder_1 = require("../../utils/Pathfinder");
var TileEligibilityChecker_1 = require("./TileEligibilityChecker");
var types_1 = require("../../types/types");
var RandomUtils_1 = require("../../utils/RandomUtils");
var ArrayUtils_1 = require("../../utils/ArrayUtils");
var MapUtils_1 = require("../MapUtils");
/**
 * Based on http://www.roguebasin.com/index.php?title=Basic_BSP_Dungeon_generation
 */
var RoomCorridorDungeonGenerator = /** @class */ (function (_super) {
    __extends(RoomCorridorDungeonGenerator, _super);
    /**
     * @param minRoomDimension outer width, including wall
     * @param maxRoomDimension outer width, including wall
     * @param minRoomPadding minimum padding between each room and its containing section
     */
    function RoomCorridorDungeonGenerator(tileSet, minRoomDimension, maxRoomDimension, minRoomPadding) {
        var _this = _super.call(this, tileSet) || this;
        _this._minRoomDimension = minRoomDimension;
        _this._maxRoomDimension = maxRoomDimension;
        _this._minRoomPadding = minRoomPadding;
        return _this;
    }
    RoomCorridorDungeonGenerator.prototype.generateTiles = function (width, height) {
        var _this = this;
        // Create a section with dimensions (width, height - 1) and then shift it down by one tile.
        // This is so we have room to add a WALL_TOP tile in the top slot if necessary
        var section = (function () {
            var section = _this._generateSection(width, height - 1);
            var connectedRoomPairs = _this._joinSection(section, [], true);
            _this._joinSection(section, connectedRoomPairs, false);
            return _this._shiftVertically(section, 1);
        })();
        this._addWalls(section);
        return section;
    };
    /**
     * Generate a rectangular area of tiles with the specified dimensions, consisting of any number of rooms connected
     * by corridors.  To do so, split the area into two sub-areas and call this method recursively.  If this area is
     * not large enough to form two sub-regions, just return a single section.
     */
    RoomCorridorDungeonGenerator.prototype._generateSection = function (width, height) {
        var splitDirection = this._getSplitDirection(width, height);
        if (splitDirection === 'HORIZONTAL') {
            var splitX_1 = this._getSplitPoint(width);
            var leftWidth = splitX_1;
            var leftSection = this._generateSection(leftWidth, height);
            var rightWidth = width - splitX_1;
            var rightSection = this._generateSection(rightWidth, height);
            var tiles = [];
            for (var y = 0; y < leftSection.tiles.length; y++) {
                var row = __spreadArrays(leftSection.tiles[y], rightSection.tiles[y]);
                tiles.push(row);
            }
            // rightSection.rooms are relative to its own origin, we need to offset them by rightSection's coordinates
            // relative to this section's coordinates
            var rightRooms = rightSection.rooms
                .map(function (room) { return (__assign(__assign({}, room), { left: room.left + splitX_1 })); });
            return {
                width: width,
                height: height,
                rooms: __spreadArrays(leftSection.rooms, rightRooms),
                tiles: tiles
            };
        }
        else if (splitDirection === 'VERTICAL') {
            var splitY_1 = this._getSplitPoint(height);
            var topHeight = splitY_1;
            var bottomHeight = height - splitY_1;
            var topSection = this._generateSection(width, topHeight);
            var bottomSection = this._generateSection(width, bottomHeight);
            var tiles = __spreadArrays(topSection.tiles, bottomSection.tiles);
            var bottomRooms = bottomSection.rooms
                .map(function (room) { return (__assign(__assign({}, room), { top: room.top + splitY_1 })); });
            return {
                width: width,
                height: height,
                rooms: __spreadArrays(topSection.rooms, bottomRooms),
                tiles: tiles
            };
        }
        else {
            // Base case: return a single section
            return this._generateSingleSection(width, height);
        }
    };
    RoomCorridorDungeonGenerator.prototype._getSplitDirection = function (width, height) {
        // First, make sure the area is large enough to support two sections; if not, we're done
        var minSectionDimension = this._minRoomDimension + (2 * this._minRoomPadding);
        var canSplitHorizontally = (width >= (2 * minSectionDimension));
        var canSplitVertically = (height >= (2 * minSectionDimension));
        // @ts-ignore
        var splitDirections = __spreadArrays((canSplitHorizontally ? ['HORIZONTAL'] : []), (canSplitVertically ? ['VERTICAL'] : []), ((!canSplitHorizontally && !canSplitVertically) ? ['NONE'] : []));
        if (splitDirections.length > 0) {
            return RandomUtils_1.randChoice(splitDirections);
        }
        return 'NONE';
    };
    /**
     * Create a rectangular section of tiles, consisting of a room surrounded by empty spaces.  The room can be placed
     * anywhere in the region at random, and can occupy a variable amount of space in the region
     * (within the specified parameters).
     */
    RoomCorridorDungeonGenerator.prototype._generateSingleSection = function (width, height) {
        var maxRoomWidth = Math.min(width - (2 * this._minRoomPadding), this._maxRoomDimension);
        var maxRoomHeight = Math.min(height - (2 * this._minRoomPadding), this._maxRoomDimension);
        console.assert(maxRoomWidth >= this._minRoomDimension && maxRoomHeight >= this._minRoomDimension, 'calculate room dimensions failed');
        var roomWidth = RandomUtils_1.randInt(this._minRoomDimension, maxRoomWidth);
        var roomHeight = RandomUtils_1.randInt(this._minRoomDimension, maxRoomHeight);
        var roomTiles = this._generateRoomTiles(roomWidth, roomHeight);
        var roomLeft = RandomUtils_1.randInt(this._minRoomPadding, width - roomWidth - this._minRoomPadding);
        var roomTop = RandomUtils_1.randInt(this._minRoomPadding, height - roomHeight - this._minRoomPadding);
        var tiles = [];
        // x, y are relative to the section's origin
        // roomX, roomY are relative to the room's origin
        for (var y = 0; y < height; y++) {
            tiles[y] = [];
            var roomY = y - roomTop;
            for (var x = 0; x < width; x++) {
                var roomX = x - roomLeft;
                if (roomX >= 0 && roomX < roomWidth && roomY >= 0 && roomY < roomHeight) {
                    tiles[y][x] = roomTiles[roomY][roomX];
                }
                else {
                    tiles[y][x] = types_1.TileType.NONE;
                }
            }
        }
        var room = {
            left: roomLeft,
            top: roomTop,
            width: roomWidth,
            height: roomHeight,
            exits: []
        };
        return { width: width, height: height, rooms: [room], tiles: tiles };
    };
    RoomCorridorDungeonGenerator.prototype._generateRoomTiles = function (width, height) {
        var tiles = [];
        for (var y = 0; y < height; y++) {
            tiles[y] = [];
            for (var x = 0; x < width; x++) {
                if (x > 0 && x < (width - 1) && y === 0) {
                    tiles[y][x] = types_1.TileType.WALL_TOP;
                }
                else if (x === 0 || x === (width - 1) || y === 0 || y === (height - 1)) {
                    tiles[y][x] = types_1.TileType.WALL;
                }
                else {
                    tiles[y][x] = types_1.TileType.FLOOR;
                }
            }
        }
        return tiles;
    };
    /**
     * @param dimension width or height
     * @returns the min X/Y coordinate of the *second* room
     */
    RoomCorridorDungeonGenerator.prototype._getSplitPoint = function (dimension) {
        var minSectionDimension = this._minRoomDimension + 2 * this._minRoomPadding;
        var minSplitPoint = minSectionDimension;
        var maxSplitPoint = dimension - minSectionDimension;
        return RandomUtils_1.randInt(minSplitPoint, maxSplitPoint);
    };
    RoomCorridorDungeonGenerator.prototype._joinSection = function (section, existingRoomPairs, logError) {
        var _this = this;
        var connectedRoomPairs = [];
        var unconnectedRooms = __spreadArrays(section.rooms);
        var connectedRooms = [];
        var nextRoom = unconnectedRooms.pop();
        if (!!nextRoom) {
            connectedRooms.push(nextRoom);
        }
        while (unconnectedRooms.length > 0) {
            var candidatePairs = connectedRooms
                .flatMap(function (connectedRoom) { return unconnectedRooms.map(function (unconnectedRoom) { return [connectedRoom, unconnectedRoom]; }); })
                .filter(function (_a) {
                var connectedRoom = _a[0], unconnectedRoom = _a[1];
                return !existingRoomPairs.some(function (_a) {
                    var firstExistingRoom = _a[0], secondExistingRoom = _a[1];
                    return (_this._coordinatePairEquals([connectedRoom, unconnectedRoom], [firstExistingRoom, secondExistingRoom]));
                });
            })
                .filter(function (_a) {
                var connectedRoom = _a[0], unconnectedRoom = _a[1];
                return _this._canJoinRooms(connectedRoom, unconnectedRoom);
            });
            RandomUtils_1.shuffle(candidatePairs);
            var joinedAnyRooms = false;
            for (var _i = 0, candidatePairs_1 = candidatePairs; _i < candidatePairs_1.length; _i++) {
                var _a = candidatePairs_1[_i], connectedRoom = _a[0], unconnectedRoom = _a[1];
                if (this._joinRooms(connectedRoom, unconnectedRoom, section)) {
                    connectedRoomPairs.push([connectedRoom, unconnectedRoom]);
                    unconnectedRooms.splice(unconnectedRooms.indexOf(unconnectedRoom), 1);
                    connectedRooms.push(unconnectedRoom);
                    joinedAnyRooms = true;
                    break;
                }
            }
            if (!joinedAnyRooms) {
                if (logError) {
                    console.error('Couldn\'t connect rooms!');
                    this._logSections('fux', section);
                    debugger;
                }
                break;
            }
        }
        return connectedRoomPairs;
    };
    /**
     * add walls above corridor tiles if possible
     */
    RoomCorridorDungeonGenerator.prototype._addWalls = function (section) {
        for (var y = 0; y < section.height; y++) {
            for (var x = 0; x < section.width; x++) {
                if (y > 0) {
                    if (section.tiles[y][x] === types_1.TileType.FLOOR_HALL) {
                        if (section.tiles[y - 1][x] === types_1.TileType.NONE || section.tiles[y - 1][x] === types_1.TileType.WALL) {
                            section.tiles[y - 1][x] = types_1.TileType.WALL_HALL;
                        }
                    }
                }
            }
        }
    };
    RoomCorridorDungeonGenerator.prototype._canJoinRooms = function (first, second) {
        return (first !== second); // && (first.exits.length < MAX_EXITS) && (second.exits.length < MAX_EXITS);
    };
    RoomCorridorDungeonGenerator.prototype._joinRooms = function (firstRoom, secondRoom, section) {
        var firstExitCandidates = this._getExitCandidates(firstRoom);
        var secondExitCandidates = this._getExitCandidates(secondRoom);
        var exitPairs = [];
        for (var _i = 0, firstExitCandidates_1 = firstExitCandidates; _i < firstExitCandidates_1.length; _i++) {
            var firstExit = firstExitCandidates_1[_i];
            for (var _a = 0, secondExitCandidates_1 = secondExitCandidates; _a < secondExitCandidates_1.length; _a++) {
                var secondExit = secondExitCandidates_1[_a];
                exitPairs.push([firstExit, secondExit]);
            }
        }
        exitPairs = ArrayUtils_1.sortBy(exitPairs, function (_a) {
            var first = _a[0], second = _a[1];
            return MapUtils_1.hypotenuse(first, second);
        });
        for (var i = 0; i < exitPairs.length; i++) {
            var _b = exitPairs[i], firstExit = _b[0], secondExit = _b[1];
            if (this._joinExits(firstExit, secondExit, section)) {
                firstRoom.exits.push(firstExit);
                secondRoom.exits.push(secondExit);
                return true;
            }
        }
        return false;
    };
    RoomCorridorDungeonGenerator.prototype._getExitCandidates = function (room) {
        var eligibleSides = ['TOP', 'RIGHT', 'BOTTOM', 'LEFT'];
        var candidates = [];
        eligibleSides.forEach(function (side) {
            switch (side) {
                case 'TOP':
                    for (var x = room.left + 1; x < room.left + room.width - 1; x++) {
                        candidates.push({ x: x, y: room.top });
                    }
                    break;
                case 'RIGHT':
                    for (var y = room.top + 1; y < room.top + room.height - 1; y++) {
                        candidates.push({ x: room.left + room.width - 1, y: y });
                    }
                    break;
                case 'BOTTOM':
                    for (var x = room.left + 1; x < room.left + room.width - 1; x++) {
                        candidates.push({ x: x, y: room.top + room.height - 1 });
                    }
                    break;
                case 'LEFT':
                    for (var y = room.top + 1; y < room.top + room.height - 1; y++) {
                        candidates.push({ x: room.left, y: y });
                    }
                    break;
                default:
                    throw "Unknown side " + side;
            }
        });
        return candidates.filter(function (_a) {
            var x = _a.x, y = _a.y;
            return !room.exits.some(function (exit) { return MapUtils_1.isAdjacent(exit, { x: x, y: y }); });
        });
    };
    /**
     * Find a path between the specified exits between rooms.
     */
    RoomCorridorDungeonGenerator.prototype._joinExits = function (firstExit, secondExit, section) {
        var _this = this;
        var tileChecker = new TileEligibilityChecker_1.default();
        var unblockedTiles = [];
        for (var y = 0; y < section.height; y++) {
            for (var x = 0; x < section.width; x++) {
                if (!tileChecker.isBlocked({ x: x, y: y }, section, [firstExit, secondExit])) {
                    unblockedTiles.push({ x: x, y: y });
                }
            }
        }
        var tileCostCalculator = function (first, second) { return _this._calculateTileCost(section, first, second); };
        var path = new Pathfinder_1.default(tileCostCalculator).findPath(firstExit, secondExit, unblockedTiles);
        path.forEach(function (_a) {
            var x = _a.x, y = _a.y;
            section.tiles[y][x] = types_1.TileType.FLOOR_HALL;
        });
        return (path.length > 0);
    };
    RoomCorridorDungeonGenerator.prototype._calculateTileCost = function (section, first, second) {
        // prefer reusing floor hall tiles
        return (section.tiles[second.y][second.x] === types_1.TileType.FLOOR_HALL) ? 0.5 : 1;
    };
    ;
    RoomCorridorDungeonGenerator.prototype._emptyRow = function (width) {
        var row = [];
        for (var x = 0; x < width; x++) {
            row.push(types_1.TileType.NONE);
        }
        return row;
    };
    RoomCorridorDungeonGenerator.prototype._coordinatePairEquals = function (firstPair, secondPair) {
        // it's ok to use !== here, rooms will be referentially equal
        return ((firstPair[0] === secondPair[0] && firstPair[1] === secondPair[1]) ||
            (firstPair[0] === secondPair[1] && firstPair[1] === secondPair[0]));
    };
    RoomCorridorDungeonGenerator.prototype._logSections = function (name) {
        var sections = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            sections[_i - 1] = arguments[_i];
        }
        console.log("Sections for " + name + ":");
        sections.forEach(function (section) { return console.log(section.tiles
            .map(function (row) { return row.map(function (tile) {
            if (MapUtils_1.isBlocking(tile)) {
                return '#';
            }
            return '.';
        }).join(''); })
            .join('\n')); });
        console.log();
    };
    RoomCorridorDungeonGenerator.prototype._shiftVertically = function (section, dy) {
        return __assign(__assign({}, section), { rooms: section.rooms.map(function (room) { return ({
                left: room.left,
                top: room.top + dy,
                width: room.width,
                height: room.height,
                exits: room.exits.map(function (_a) {
                    var x = _a.x, y = _a.y;
                    return ({ x: x, y: y + dy });
                })
            }); }), tiles: __spreadArrays([this._emptyRow(section.width)], section.tiles) });
    };
    return RoomCorridorDungeonGenerator;
}(DungeonGenerator_1.default));
exports.default = RoomCorridorDungeonGenerator;
//# sourceMappingURL=RoomCorridorDungeonGenerator.js.map