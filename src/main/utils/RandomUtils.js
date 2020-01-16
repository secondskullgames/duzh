{
  /**
   * @param {int} min
   * @param {int} max inclusive
   * @private
   */
  function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  function randChoice(list) {
    return list[randInt(0, list.length - 1)] || null;
  }

  window.jwb = window.jwb || {};
  jwb.utils = jwb.utils || {};
  jwb.utils.RandomUtils = {
    randInt,
    randChoice
  };
  console.log('loaded utils');
}