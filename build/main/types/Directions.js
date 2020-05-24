"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Directions = {
    N: { dx: 0, dy: -1 },
    E: { dx: 1, dy: 0 },
    S: { dx: 0, dy: 1 },
    W: { dx: -1, dy: 0 }
};
function _equals(first, second) {
    return first.dx === second.dx && first.dy === second.dy;
}
function _directionToString(direction) {
    if (_equals(direction, Directions.N)) {
        return 'N';
    }
    else if (_equals(direction, Directions.E)) {
        return 'E';
    }
    else if (_equals(direction, Directions.S)) {
        return 'S';
    }
    else if (_equals(direction, Directions.W)) {
        return 'W';
    }
    throw "Invalid direction " + direction;
}
exports.default = {
    N: Directions.N,
    E: Directions.E,
    S: Directions.S,
    W: Directions.W,
    values: function () { return [Directions.N, Directions.E, Directions.S, Directions.W]; },
    toString: _directionToString
};
//# sourceMappingURL=Directions.js.map