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
var RandomUtils_1 = require("../../utils/RandomUtils");
var RoomCorridorDungeonGenerator2 = /** @class */ (function (_super) {
    __extends(RoomCorridorDungeonGenerator2, _super);
    /**
     * @param minRoomDimension outer width, including wall
     * @param maxRoomDimension outer width, including wall
     * @param minRoomPadding minimum padding between each room and its containing section
     */
    function RoomCorridorDungeonGenerator2(tileSet, minRoomDimension, maxRoomDimension, minRoomPadding) {
        var _this = _super.call(this, tileSet) || this;
        _this._minRoomDimension = minRoomDimension;
        _this._maxRoomDimension = maxRoomDimension;
        _this._minRoomPadding = minRoomPadding;
        return _this;
    }
    RoomCorridorDungeonGenerator2.prototype.generateTiles = function (width, height) {
        // 1. Recursively subdivide the map into sections.
        //    Each section must fall within the max dimensions.
        // 2. Add rooms within sections, with appropriate padding.
        //    (Don't add a room for every section; approximately half.  Rules TBD.)
        var sections = this._generateSections(0, 0, width, height);
        this._removeRooms(sections);
        // 3. Construct a minimal spanning tree between sections (including those without rooms).
        var minimalSpanningTree = this._generateMinimalSpanningTree(sections);
        // 4.  Add all optional connections between sections.
        var optionalConnections = this._generateOptionalConnections(sections, minimalSpanningTree);
        // 5. Add "red-red" connections in empty rooms.
        // 6. Add "red-green" connections in empty rooms only if:
        //    - both edges connect to a room
        //    - there is no red-red connection in the section
        var internalConnections = this._addInternalConnections(sections, minimalSpanningTree, optionalConnections);
        // Compute the actual tiles based on section/connection specifications.
        var tiles = this._renderRoomsAndConnections(sections, __spreadArrays(minimalSpanningTree, [optionalConnections]), internalConnections);
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
        var splitDirection = this._getSplitDirection(width, height);
        if (splitDirection === 'HORIZONTAL') {
            var splitX = this._getSplitPoint(width);
            var leftWidth = splitX;
            var leftSections = this._generateSections(0, 0, leftWidth, height);
            var rightWidth = width - splitX;
            var rightSections = this._generateSections(splitX, 0, rightWidth, height);
            return __spreadArrays(leftSections, rightSections);
        }
        else if (splitDirection === 'VERTICAL') {
            var splitY = this._getSplitPoint(height);
            var topHeight = splitY;
            var bottomHeight = height - splitY;
            var topSections = this._generateSections(0, 0, width, topHeight);
            var bottomSections = this._generateSections(0, splitY, width, bottomHeight);
            return __spreadArrays(topSections, bottomSections);
        }
        else {
            var rect = {
                left: left,
                top: top,
                width: width,
                height: height
            };
            var padding = 1;
            var topPadding = 2;
            var roomRect = {
                left: left + padding,
                top: top + topPadding,
                width: width - (2 * padding),
                height: height - padding - topPadding
            };
            return [{ rect: rect, roomRect: roomRect }];
        }
    };
    RoomCorridorDungeonGenerator2.prototype._getSplitDirection = function (width, height) {
        // First, make sure the area is large enough to support two sections; if not, we're done
        var minSectionDimension = this._minRoomDimension + (2 * this._minRoomPadding);
        var canSplitHorizontally = (width >= (2 * minSectionDimension));
        var canSplitVertically = (height >= (2 * minSectionDimension));
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
     * @param dimension width or height
     * @returns the min X/Y coordinate of the *second* room
     */
    RoomCorridorDungeonGenerator2.prototype._getSplitPoint = function (dimension) {
        var minSectionDimension = this._minRoomDimension + 2 * this._minRoomPadding;
        var minSplitPoint = minSectionDimension;
        var maxSplitPoint = dimension - minSectionDimension;
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
        var _this = this;
        var connectedSection = RandomUtils_1.randChoice(sections);
        var connectedSections = [connectedSection];
        var unconnectedSections = __spreadArrays(sections).filter(function (section) { return section !== connectedSection; });
        RandomUtils_1.shuffle(unconnectedSections);
        var connections = [];
        unconnectedSections.forEach(function (section) {
            RandomUtils_1.shuffle(connectedSections);
            connectedSections.forEach(function (connectedSection) {
                if (_this._canConnect(connectedSection, section)) {
                    unconnectedSections.splice(unconnectedSections.indexOf(section), 1);
                    connectedSections.push(section);
                }
            });
        });
        return connections;
    };
    RoomCorridorDungeonGenerator2.prototype._generateOptionalConnections = function (sections, minimalSpanningTree) {
        throw 'TODO';
    };
    RoomCorridorDungeonGenerator2.prototype._addRedRedConnections = function (sections, minimalSpanningTree) {
        throw 'TODO';
    };
    RoomCorridorDungeonGenerator2.prototype._addInternalConnections = function (sections, minimalSpanningTree, optionalConnections) {
        throw 'TODO';
    };
    RoomCorridorDungeonGenerator2.prototype._renderRoomsAndConnections = function (sections, param2, internalConnections) {
        throw 'TODO';
    };
    RoomCorridorDungeonGenerator2.prototype._addWalls = function (tiles) {
        throw 'TODO';
    };
    RoomCorridorDungeonGenerator2.prototype._canConnect = function (connectedSection, section) {
        throw 'TODO';
    };
    return RoomCorridorDungeonGenerator2;
}(DungeonGenerator_1.default));
exports.default = RoomCorridorDungeonGenerator2;
//# sourceMappingURL=RoomCorridorDungeonGenerator2.js.map