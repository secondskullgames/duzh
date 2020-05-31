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
var ROOM_PADDING = [2, 3, 1, 1]; // left, top, right, bottom;
var MIN_ROOM_FRACTION = 0.25;
var MAX_ROOM_FRACTION = 0.75;
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
        var _this = this;
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
        var externalConnections = __spreadArrays(minimalSpanningTree, optionalConnections);
        this._stripOrphanedConnections(externalConnections, internalConnections);
        // TODO
        var debugOutput = "\n      Sections: " + sections.map(function (section) { return _this._sectionToString(section); }).join('; ') + "\n      MST: " + minimalSpanningTree.map(this._connectionToString).join('; ') + "\n      opt: " + optionalConnections.map(this._connectionToString).join('; ') + "\n      external: " + externalConnections.map(this._connectionToString).join('; ') + "\n      Internal: " + internalConnections.map(function (connection) { return _this._sectionToString(connection.section) + ", " + connection.neighbors.length; }).join('; ') + "\n    ";
        console.log(debugOutput);
        // END TODO
        // Compute the actual tiles based on section/connection specifications.
        var tiles = this._generateTiles(width, height, sections, externalConnections, internalConnections);
        // 7. Add walls.
        this._addWalls(tiles);
        return {
            tiles: tiles,
            rooms: [],
            width: width,
            height: height
        };
    };
    RoomCorridorDungeonGenerator2.prototype._sectionToString = function (section) {
        return "(" + section.rect.left + ", " + section.rect.top + ", " + section.rect.width + ", " + section.rect.height + ")";
    };
    /**
     * Generate a rectangular area of tiles with the specified dimensions, consisting of any number of rooms connected
     * by corridors.  To do so, split the area into two sub-areas and call this method recursively.  If this area is
     * not large enough to form two sub-regions, just return a single section.
     */
    RoomCorridorDungeonGenerator2.prototype._generateSections = function (left, top, width, height) {
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
        var minRooms = Math.max(3, Math.round(sections.length * MIN_ROOM_FRACTION));
        var maxRooms = Math.max(minRooms, sections.length * MAX_ROOM_FRACTION);
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
                var neighbors = sections.filter(function (s) { return s !== section; }).filter(function (s) { return _this._canConnect(section, s); });
                neighbors.forEach(function (neighbor) {
                    if (spanningConnections.some(function (connection) { return _this._connectionMatches(connection, section, neighbor); })) {
                        connectedSections_1.push(neighbor);
                    }
                });
                if (connectedSections_1.length === 1) {
                    RandomUtils_1.shuffle(neighbors);
                    var _loop_3 = function (neighbor) {
                        if (optionalConnections.some(function (connection) { return _this._connectionMatches(connection, section, neighbor); })) {
                            connectedSections_1.push(neighbor);
                            return "break";
                        }
                    };
                    for (var _i = 0, neighbors_1 = neighbors; _i < neighbors_1.length; _i++) {
                        var neighbor = neighbors_1[_i];
                        var state_1 = _loop_3(neighbor);
                        if (state_1 === "break")
                            break;
                    }
                }
                if (connectedSections_1.length > 0) {
                    internalConnections.push({ section: section, neighbors: connectedSections_1 });
                }
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
        this._addTilesForInternalConnections(tiles, internalConnections, connections);
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
        var direction = (firstCoordinates.x === secondCoordinates.x) ? 'VERTICAL' : 'HORIZONTAL';
        var middleCoordinates = {
            x: (firstCoordinates.x + secondCoordinates.x) / 2,
            y: (firstCoordinates.y + secondCoordinates.y) / 2
        };
        return {
            start: first,
            end: second,
            startCoordinates: firstCoordinates,
            endCoordinates: secondCoordinates,
            middleCoordinates: middleCoordinates,
            direction: direction
        };
    };
    RoomCorridorDungeonGenerator2.prototype._connectionToString = function (connection) {
        return "[(" + connection.startCoordinates.x + ", " + connection.startCoordinates.y + ")-(" + connection.endCoordinates.x + ", " + connection.endCoordinates.y + ")]";
    };
    RoomCorridorDungeonGenerator2.prototype._addTilesForInternalConnections = function (tiles, internalConnections, connections) {
        var _this = this;
        internalConnections.forEach(function (internalConnection) {
            var neighbors = __spreadArrays(internalConnection.neighbors);
            RandomUtils_1.shuffle(neighbors);
            var _loop_4 = function (i) {
                var firstNeighbor = internalConnection.neighbors[i];
                var secondNeighbor = internalConnection.neighbors[i + 1];
                var firstConnection = connections.filter(function (c) { return _this._connectionMatches(c, internalConnection.section, firstNeighbor); })[0];
                var secondConnection = connections.filter(function (c) { return _this._connectionMatches(c, internalConnection.section, secondNeighbor); })[0];
                if (!firstConnection || !secondConnection) {
                    console.error('fux3');
                    console.log(connections.map(_this._connectionToString).join(', '));
                    console.log(neighbors.join(' '));
                    console.log(firstNeighbor.rect);
                    console.log(secondNeighbor.rect);
                    return { value: void 0 };
                }
                if (firstConnection.direction !== secondConnection.direction) {
                    // join perpendicularly
                    _this._joinPerpendicularly(tiles, firstConnection, secondConnection);
                }
                else {
                    // join parallel connections
                    _this._joinParallelConnections(tiles, firstConnection, secondConnection);
                }
            };
            for (var i = 0; i < neighbors.length - 1; i++) {
                var state_2 = _loop_4(i);
                if (typeof state_2 === "object")
                    return state_2.value;
            }
        });
    };
    RoomCorridorDungeonGenerator2.prototype._joinPerpendicularly = function (tiles, firstConnection, secondConnection) {
        var start = firstConnection.middleCoordinates;
        var middle = {
            x: ((firstConnection.direction === 'VERTICAL') ? firstConnection : secondConnection).middleCoordinates.x,
            y: ((firstConnection.direction === 'HORIZONTAL') ? firstConnection : secondConnection).middleCoordinates.y
        };
        var end = secondConnection.middleCoordinates;
        var dx = Math.sign(middle.x - start.x);
        var dy = Math.sign(middle.y - start.y);
        var x = start.x, y = start.y;
        while (!MapUtils_1.coordinatesEquals({ x: x, y: y }, middle)) {
            tiles[y][x] = types_1.TileType.FLOOR_HALL;
            x += dx;
            y += dy;
        }
        dx = Math.sign(end.x - middle.x);
        dy = Math.sign(end.y - middle.y);
        while (!MapUtils_1.coordinatesEquals({ x: x, y: y }, end)) {
            tiles[y][x] = types_1.TileType.FLOOR_HALL;
            x += dx;
            y += dy;
        }
    };
    RoomCorridorDungeonGenerator2.prototype._joinParallelConnections = function (tiles, firstConnection, secondConnection) {
        var start = firstConnection.middleCoordinates;
        var middle = {
            x: Math.round((firstConnection.middleCoordinates.x + secondConnection.middleCoordinates.x) / 2),
            y: Math.round((firstConnection.middleCoordinates.y + secondConnection.middleCoordinates.y) / 2)
        };
        var end = secondConnection.middleCoordinates;
        var xDistance = end.x - start.x;
        var yDistance = end.y - start.y;
        var dx = Math.sign(xDistance);
        var dy = Math.sign(yDistance);
        var majorDirection = (Math.abs(xDistance) >= Math.abs(yDistance)) ? 'HORIZONTAL' : 'VERTICAL';
        var x = start.x, y = start.y;
        switch (majorDirection) {
            case 'HORIZONTAL':
                while (x !== middle.x) {
                    tiles[y][x] = types_1.TileType.FLOOR_HALL;
                    x += dx;
                }
                while (y !== end.y) {
                    tiles[y][x] = types_1.TileType.FLOOR_HALL;
                    y += dy;
                }
                while (x !== end.x) {
                    tiles[y][x] = types_1.TileType.FLOOR_HALL;
                    x += dx;
                }
                break;
            case 'VERTICAL':
                while (y !== middle.y) {
                    tiles[y][x] = types_1.TileType.FLOOR_HALL;
                    y += dy;
                }
                while (x !== end.x) {
                    tiles[y][x] = types_1.TileType.FLOOR_HALL;
                    x += dx;
                }
                while (y !== end.y) {
                    tiles[y][x] = types_1.TileType.FLOOR_HALL;
                    y += dy;
                }
                break;
        }
    };
    /**
     * A connection is orphaned if, for either of its endpoints, there is neither a room nor a connected
     * internal connection that connects to that endpoint.
     *
     * @return a copy of `externalConnections` with the desired elements removed
     */
    RoomCorridorDungeonGenerator2.prototype._stripOrphanedConnections = function (externalConnections, internalConnections) {
        var _this = this;
        var removedAnyConnections = false;
        var _loop_5 = function () {
            var orphanedConnections = externalConnections.filter(function (connection) {
                return _this._isOrphanedConnection(connection, internalConnections);
            });
            this_2._subtract(externalConnections, orphanedConnections);
            internalConnections.forEach(function (internalConnection) {
                _this._pruneInternalConnection(internalConnection, orphanedConnections);
            });
            var orphanedInternalConnections = internalConnections.filter(function (internalConnection) {
                return _this._isOrphanedInternalConnection(internalConnection, internalConnections);
            });
            this_2._subtract(internalConnections, orphanedInternalConnections);
            removedAnyConnections = (orphanedConnections.length > 0 || orphanedInternalConnections.length > 0);
            console.log("stripping: " + orphanedConnections.length + ", " + orphanedInternalConnections.length);
            var missedOrphans = externalConnections.filter(function (connection) {
                return _this._isOrphanedConnection(connection, internalConnections);
            });
            if (missedOrphans.length > 0 && !removedAnyConnections) {
                console.log('fuck, missed orphans: ' + missedOrphans.map(this_2._connectionToString).join('; '));
                debugger;
            }
        };
        var this_2 = this;
        do {
            _loop_5();
        } while (removedAnyConnections);
    };
    RoomCorridorDungeonGenerator2.prototype._isOrphanedConnection = function (connection, internalConnections) {
        var start = connection.start, end = connection.end;
        var startHasInternalConnection = false;
        var endHasInternalConnection = false;
        for (var _i = 0, internalConnections_1 = internalConnections; _i < internalConnections_1.length; _i++) {
            var internalConnection = internalConnections_1[_i];
            if (internalConnection.section === start && internalConnection.neighbors.indexOf(end) > -1) {
                startHasInternalConnection = true;
            }
            if (internalConnection.section === end && internalConnection.neighbors.indexOf(start) > -1) {
                endHasInternalConnection = true;
            }
        }
        return !((!!start.roomRect || startHasInternalConnection)
            && (!!end.roomRect || endHasInternalConnection));
    };
    RoomCorridorDungeonGenerator2.prototype._pruneInternalConnection = function (internalConnection, orphanedConnections) {
        var _loop_6 = function (connection) {
            var section = internalConnection.section, neighbors = internalConnection.neighbors;
            var start = connection.start, end = connection.end;
            var updatedNeighbors = neighbors.filter(function (neighbor) {
                if (section === start && neighbor === end) {
                    return false;
                }
                if (section === end && neighbor === start) {
                    return false;
                }
                return true;
            });
            this_3._replace(neighbors, updatedNeighbors);
        };
        var this_3 = this;
        for (var _i = 0, orphanedConnections_1 = orphanedConnections; _i < orphanedConnections_1.length; _i++) {
            var connection = orphanedConnections_1[_i];
            _loop_6(connection);
        }
    };
    /**
     * An internal connection is orphaned if at most one of its neighbors has either a room or another
     * internal connection
     */
    RoomCorridorDungeonGenerator2.prototype._isOrphanedInternalConnection = function (internalConnection, internalConnections) {
        var connectedNeighbors = 0;
        var section = internalConnection.section, neighbors = internalConnection.neighbors;
        neighbors.forEach(function (neighbor) {
            var neighborHasInternalConnection = internalConnections.find(function (other) { return other.section === neighbor && other.neighbors.indexOf(section) > -1; });
            if (!!neighbor.roomRect || neighborHasInternalConnection) {
                connectedNeighbors++;
            }
        });
        return connectedNeighbors <= 1;
    };
    RoomCorridorDungeonGenerator2.prototype._replace = function (array, contents) {
        array.splice(0, array.length);
        array.push.apply(array, contents);
    };
    RoomCorridorDungeonGenerator2.prototype._subtract = function (array, toRemove) {
        var updated = array.filter(function (element) { return toRemove.indexOf(element) === -1; });
        this._replace(array, updated);
    };
    return RoomCorridorDungeonGenerator2;
}(DungeonGenerator_1.default));
exports.default = RoomCorridorDungeonGenerator2;
//# sourceMappingURL=RoomCorridorDungeonGenerator2.js.map