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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var DungeonGenerator_1 = require("./DungeonGenerator");
var types_1 = require("../../types/types");
var RandomUtils_1 = require("../../utils/RandomUtils");
var MapUtils_1 = require("../MapUtils");
var ROOM_PADDING = [2, 2, 1, 1]; // left, top, right, bottom;
var RoomCorridorDungeonGenerator2 = /** @class */ (function (_super) {
    __extends(RoomCorridorDungeonGenerator2, _super);
    /**
     * @param minRoomDimension inner width, not including wall
     * @param maxRoomDimension inner width, not including wall
     */
    function RoomCorridorDungeonGenerator2(tileSet, minRoomDimension, maxRoomDimension) {
        var _this = _super.call(this, tileSet) || this;
        _this._minRoomDimension = minRoomDimension;
        _this._maxRoomDimension = maxRoomDimension;
        return _this;
    }
    RoomCorridorDungeonGenerator2.prototype.generateTiles = function (width, height) {
        // 1. Recursively subdivide the map into sections.
        //    Each section must fall within the max dimensions.
        // 2. Add rooms within sections, with appropriate padding.
        //    (Don't add a room for every section; approximately half.  Rules TBD.)
        var sections = this._generateSections(0, 0, width, height);
        //this._removeRooms(sections);
        // 3. Construct a minimal spanning tree between sections (including those without rooms).
        var minimalSpanningTree = this._generateMinimalSpanningTree(sections);
        // 4.  Add all optional connections between sections.
        var optionalConnections = this._generateOptionalConnections(sections, minimalSpanningTree);
        // 5. Add "red-red" connections in empty rooms.
        // 6. Add "red-green" connections in empty rooms only if:
        //    - both edges connect to a room
        //    - there is no red-red connection in the section
        var internalConnections = this._addInternalConnections(sections, minimalSpanningTree, optionalConnections);
        // TODO
        var debugOutput = "\n      Sections: " + sections.map(function (section) { return "(" + section.rect.left + ", " + section.rect.top + ", " + section.rect.width + ", " + section.rect.height + ")"; }).join('; ') + "\n\n      MST: " + minimalSpanningTree.map(this._connectionToString).join('; ') + ",\n      opt: " + optionalConnections.map(this._connectionToString).join('; ') + ",\n      Internal: " + internalConnections.map(function (connection) { return connection.section + ", " + connection.neighbors.length; }) + "\n    ";
        console.log(debugOutput);
        // END TODO
        // Compute the actual tiles based on section/connection specifications.
        var tiles = this._generateTiles(width, height, sections, __spreadArrays(minimalSpanningTree, optionalConnections), internalConnections);
        // 7. Add walls.
        this._addWalls(tiles);
        return {
            tiles: tiles,
            rooms: [],
            width: width,
            height: height
        };
    };
    /**
     * Generate a rectangular area of tiles with the specified dimensions, consisting of any number of rooms connected
     * by corridors.  To do so, split the area into two sub-areas and call this method recursively.  If this area is
     * not large enough to form two sub-regions, just return a single section.
     */
    RoomCorridorDungeonGenerator2.prototype._generateSections = function (left, top, width, height) {
        console.log("_generateSections(" + left + "," + top + "," + width + "," + height + ")");
        var splitDirection = this._getSplitDirection(width, height);
        if (splitDirection === 'HORIZONTAL') {
            var splitX = this._getSplitPoint(left, width, splitDirection);
            var leftWidth = splitX - left;
            var leftSections = this._generateSections(left, top, leftWidth, height);
            var rightWidth = width - leftWidth;
            var rightSections = this._generateSections(splitX, top, rightWidth, height);
            return __spreadArrays(leftSections, rightSections);
        }
        else if (splitDirection === 'VERTICAL') {
            var splitY = this._getSplitPoint(top, height, splitDirection);
            var topHeight = splitY - top;
            var bottomHeight = height - topHeight;
            var topSections = this._generateSections(left, top, width, topHeight);
            var bottomSections = this._generateSections(left, splitY, width, bottomHeight);
            return __spreadArrays(topSections, bottomSections);
        }
        else {
            // base case: generate single section
            var rect = {
                left: left,
                top: top,
                width: width,
                height: height
            };
            var padding = 1;
            var leftPadding = 2;
            var topPadding = 2;
            var roomRect = {
                left: left + leftPadding,
                top: top + topPadding,
                width: width - padding - leftPadding,
                height: height - padding - topPadding
            };
            return [{ rect: rect, roomRect: roomRect }];
        }
    };
    RoomCorridorDungeonGenerator2.prototype._getSplitDirection = function (width, height) {
        // First, make sure the area is large enough to support two sections; if not, we're done
        var minWidth = this._minRoomDimension + ROOM_PADDING[0] + ROOM_PADDING[2];
        var minHeight = this._minRoomDimension + ROOM_PADDING[1] + ROOM_PADDING[3];
        var canSplitHorizontally = (width >= (2 * minWidth));
        var canSplitVertically = (height >= (2 * minHeight));
        if (canSplitHorizontally) {
            return 'HORIZONTAL';
        }
        else if (canSplitVertically) {
            return 'VERTICAL';
        }
        else {
            return null;
        }
    };
    /**
     * @param start left or top
     * @param dimension width or height
     * @returns the min X/Y coordinate of the *second* room
     */
    RoomCorridorDungeonGenerator2.prototype._getSplitPoint = function (start, dimension, direction) {
        var minWidth = this._minRoomDimension + ROOM_PADDING[0] + ROOM_PADDING[2];
        var minHeight = this._minRoomDimension + ROOM_PADDING[1] + ROOM_PADDING[3];
        var minSectionDimension = (direction === 'HORIZONTAL' ? minWidth : minHeight);
        var minSplitPoint = start + minSectionDimension;
        var maxSplitPoint = start + dimension - minSectionDimension;
        return RandomUtils_1.randInt(minSplitPoint, maxSplitPoint);
    };
    RoomCorridorDungeonGenerator2.prototype._removeRooms = function (sections) {
        var minRooms = 3;
        var maxRooms = Math.max(sections.length - 1, minRooms);
        if (sections.length < minRooms) {
            throw 'Not enough sections';
        }
        var numRooms = RandomUtils_1.randInt(minRooms, maxRooms);
        var shuffledSections = __spreadArrays(sections);
        RandomUtils_1.shuffle(shuffledSections);
        for (var i = numRooms; i < shuffledSections.length; i++) {
            shuffledSections[i].roomRect = null;
        }
    };
    RoomCorridorDungeonGenerator2.prototype._generateMinimalSpanningTree = function (sections) {
        var connectedSection = RandomUtils_1.randChoice(sections);
        var connectedSections = [connectedSection];
        var unconnectedSections = __spreadArrays(sections).filter(function (section) { return section !== connectedSection; });
        RandomUtils_1.shuffle(unconnectedSections);
        var connections = [];
        while (unconnectedSections.length > 0) {
            RandomUtils_1.shuffle(connectedSections);
            var connectedAny = false;
            for (var i = 0; i < connectedSections.length; i++) {
                var connectedSection_1 = connectedSections[i];
                for (var j = 0; j < unconnectedSections.length; j++) {
                    var unconnectedSection = unconnectedSections[j];
                    if (this._canConnect(connectedSection_1, unconnectedSection)) {
                        unconnectedSections.splice(j, 1);
                        connectedSections.push(unconnectedSection);
                        connections.push(this._buildConnection(connectedSection_1, unconnectedSection));
                        connectedAny = true;
                        break;
                    }
                }
            }
            if (!connectedAny) {
                console.log('connected:');
                connectedSections.forEach(function (x) { return console.log(x); });
                console.log('unconnected:');
                unconnectedSections.forEach(function (x) { return console.log(x); });
                'Failed to generate minimal spanning tree';
            }
        }
        return connections;
    };
    RoomCorridorDungeonGenerator2.prototype._generateOptionalConnections = function (sections, spanningConnections) {
        var _this = this;
        var optionalConnections = [];
        var _loop_1 = function (i) {
            var first = sections[i];
            var _loop_2 = function (j) {
                var second = sections[j];
                if (this_1._canConnect(first, second)) {
                    if (!spanningConnections.some(function (connection) { return _this._connectionMatches(connection, first, second); })) {
                        optionalConnections.push(this_1._buildConnection(first, second));
                    }
                }
            };
            for (var j = i + 1; j < sections.length; j++) {
                _loop_2(j);
            }
        };
        var this_1 = this;
        for (var i = 0; i < sections.length; i++) {
            _loop_1(i);
        }
        return optionalConnections;
    };
    RoomCorridorDungeonGenerator2.prototype._addInternalConnections = function (sections, spanningConnections, optionalConnections) {
        var _this = this;
        var internalConnections = [];
        sections.forEach(function (section) {
            if (!section.roomRect) {
                var connectedSections_1 = [];
                sections.forEach(function (otherSection) {
                    if (!spanningConnections.some(function (connection) { return _this._connectionMatches(connection, section, otherSection); })) {
                        connectedSections_1.push(otherSection);
                    }
                });
                internalConnections.push({ section: section, neighbors: connectedSections_1 });
            }
        });
        return internalConnections;
    };
    RoomCorridorDungeonGenerator2.prototype._generateTiles = function (width, height, sections, connections, internalConnections) {
        var tiles = [];
        for (var y = 0; y < height; y++) {
            var row = [];
            for (var x = 0; x < width; x++) {
                row.push(types_1.TileType.NONE);
            }
            tiles.push(row);
        }
        // add floor tiles for rooms
        sections.forEach(function (section) {
            if (!!section.roomRect) {
                for (var y = section.roomRect.top; y < section.roomRect.top + section.roomRect.height; y++) {
                    for (var x = section.roomRect.left; x < section.roomRect.left + section.roomRect.width; x++) {
                        tiles[y][x] = types_1.TileType.FLOOR;
                    }
                }
            }
        });
        // add floor tiles for connections
        connections.forEach(function (connection) {
            var dx = Math.sign(connection.endCoordinates.x - connection.startCoordinates.x);
            var dy = Math.sign(connection.endCoordinates.y - connection.startCoordinates.y);
            var _a = connection.startCoordinates, x = _a.x, y = _a.y;
            while (!MapUtils_1.coordinatesEquals({ x: x, y: y }, connection.endCoordinates)) {
                tiles[y][x] = types_1.TileType.FLOOR_HALL;
                x += dx;
                y += dy;
            }
            tiles[y][x] = types_1.TileType.FLOOR_HALL;
        });
        return tiles;
    };
    RoomCorridorDungeonGenerator2.prototype._addWalls = function (tiles) {
        var height = tiles.length;
        var width = tiles[0].length;
        for (var y = 0; y < height - 2; y++) {
            for (var x = 0; x < width; x++) {
                if (tiles[y][x] === types_1.TileType.NONE
                    && tiles[y + 1][x] === types_1.TileType.NONE
                    && (tiles[y + 2][x] === types_1.TileType.FLOOR || tiles[y + 2][x] === types_1.TileType.FLOOR_HALL)) {
                    tiles[y][x] = types_1.TileType.WALL_TOP;
                    tiles[y + 1][x] = (tiles[y + 2][x] === types_1.TileType.FLOOR) ? types_1.TileType.WALL : types_1.TileType.WALL_HALL;
                }
            }
        }
    };
    RoomCorridorDungeonGenerator2.prototype._canConnect = function (first, second) {
        return MapUtils_1.areAdjacent(first.rect, second.rect, 5);
    };
    RoomCorridorDungeonGenerator2.prototype._connectionMatches = function (connection, first, second) {
        // ref. equality should be fine
        if (connection.start === first && connection.end === second) {
            return true;
        }
        else if (connection.start === second && connection.end === first) {
            return true;
        }
        else {
            return false;
        }
    };
    RoomCorridorDungeonGenerator2.prototype._buildConnection = function (first, second) {
        var connectionPoint; // on the starting edge of `second`
        var firstCoordinates;
        var secondCoordinates;
        // right-left
        if (first.rect.left + first.rect.width === second.rect.left) {
            var top_1 = Math.max(first.rect.top, second.rect.top);
            var bottom = Math.min(first.rect.top + first.rect.height, second.rect.top + second.rect.height); // exclusive
            connectionPoint = {
                x: second.rect.left,
                y: RandomUtils_1.randInt(top_1 + 2, bottom - 2) // should be in range since we checked _canConnect already
            };
            firstCoordinates = { x: connectionPoint.x - 1, y: connectionPoint.y };
            secondCoordinates = { x: connectionPoint.x + 1, y: connectionPoint.y };
        }
        // bottom-top
        else if (first.rect.top + first.rect.height === second.rect.top) {
            var left = Math.max(first.rect.left, second.rect.left);
            var right = Math.min(first.rect.left + first.rect.width, second.rect.left + second.rect.width); // exclusive
            connectionPoint = {
                x: RandomUtils_1.randInt(left + 2, right - 2),
                y: second.rect.top
            };
            firstCoordinates = { x: connectionPoint.x, y: connectionPoint.y - 1 };
            secondCoordinates = { x: connectionPoint.x, y: connectionPoint.y + 1 };
        }
        // left-right
        else if (first.rect.left === second.rect.left + second.rect.width) {
            var top_2 = Math.max(first.rect.top, second.rect.top);
            var bottom = Math.min(first.rect.top + first.rect.height, second.rect.top + second.rect.height); // exclusive
            connectionPoint = {
                x: first.rect.left,
                y: RandomUtils_1.randInt(top_2 + 2, bottom - 2) // should be in range since we checked _canConnect already
            };
            firstCoordinates = { x: connectionPoint.x + 1, y: connectionPoint.y };
            secondCoordinates = { x: connectionPoint.x - 1, y: connectionPoint.y };
        }
        // top-bottom
        else if (first.rect.top === second.rect.top + second.rect.height) {
            var left = Math.max(first.rect.left, second.rect.left);
            var right = Math.min(first.rect.left + first.rect.width, second.rect.left + second.rect.width); // exclusive
            connectionPoint = {
                x: RandomUtils_1.randInt(left + 2, right - 2),
                y: first.rect.top
            };
            firstCoordinates = { x: connectionPoint.x, y: connectionPoint.y + 1 };
            secondCoordinates = { x: connectionPoint.x, y: connectionPoint.y - 1 };
        }
        else {
            throw 'Failed to build connection';
        }
        return {
            start: first,
            end: second,
            startCoordinates: firstCoordinates,
            endCoordinates: secondCoordinates
        };
    };
    RoomCorridorDungeonGenerator2.prototype._connectionToString = function (connection) {
        return "[(" + connection.startCoordinates.x + ", " + connection.startCoordinates.y + ")-(" + connection.endCoordinates.x + ", " + connection.endCoordinates.y + ")]";
    };
    return RoomCorridorDungeonGenerator2;
}(DungeonGenerator_1.default));
exports.default = RoomCorridorDungeonGenerator2;
//# sourceMappingURL=RoomCorridorDungeonGenerator2.js.map