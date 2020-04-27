"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var TestDungeonGenerator = require("./maps/generation/TestDungeonGenerator");
function test() {
    Object.values(TestDungeonGenerator).forEach(function (test) { return test(); });
}
console.log('a');
test();
//# sourceMappingURL=index.js.map