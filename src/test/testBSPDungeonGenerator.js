{
  const generator = new BSPDungeonGenerator(6, 4);

  function testRandInt() {
    const { randInt } = jwb.utils.RandomUtils;
    const realFunc = Math.random;
    Math.random = () => 0;
    let result = randInt(3, 7);
    console.assert(result === 3, `randInt(): expected min === 3 but got ${result}`);
    Math.random = () => 1;
    result = randInt(3, 7);
    console.assert(result === 7, `randInt(): expected max === 7 but got ${result}`);
    Math.random = realFunc;
  }

  /**
   * 0  3  67   11 14
   * V  V  VV   V  V
   * ###############
   *    #  ##
   *    #       #  #
   */
  function testGetSplitPoint() {
    const realFunc = Math.random;
    Math.random = () => 0;
    let result = generator._getSplitPoint(3, 15);
    console.assert(result === 7, `_getSplitPoint(): expected min === 6 but got ${result}`);
    Math.random = () => 1;
    result = generator._getSplitPoint(3, 15);
    console.assert(result === 11, `_getSplitPoint(): expected max === 11 but got ${result}`);
    Math.random = realFunc;
  }

  testRandInt();
  testGetSplitPoint();
}