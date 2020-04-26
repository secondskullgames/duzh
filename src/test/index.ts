import * as TestDungeonGenerator from './maps/generation/TestDungeonGenerator';

function test() {
  Object.values(TestDungeonGenerator).forEach(test => test());
}

console.log('a');
test();