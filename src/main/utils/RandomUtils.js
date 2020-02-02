{
  /**
   * @param {!int} min
   * @param {!int} max inclusive
   * @return {!int}
   * @private
   */
  function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  /**
   * @template {T}
   * @param {!T[]} list
   * @return {T} (null if `list` is empty
   * @private
   */
  function randChoice(list) {
    return list[randInt(0, list.length - 1)] || null;
  }

  /**
   * @template {T}
   * @param {Object<T, number>} probabilityMap
   * @return T
   */
  function weightedRandom(probabilityMap) {
    const total = Object.values(probabilityMap).reduce((a, b) => a + b);
    const rand = Math.random() * total;
    let counter = 0;
    const entries = Object.entries(probabilityMap);
    for (let i = 0; i < entries.length; i++) {
      const [key, value] = entries[i];
      counter += value;
      if (counter > rand) {
        return key;
      }
    }

    throw 'fux';
  }

  window.jwb = window.jwb || {};
  jwb.utils = jwb.utils || {};
  jwb.utils.RandomUtils = {
    randInt,
    randChoice,
    weightedRandom
  };
}
