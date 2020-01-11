{
  /**
   * @param {int} min
   * @param {int} max inclusive
   * @private
   */
  function randInt(min, max)
  {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  function randChoice(list)
  {
    return list[randInt(0, list.length - 1)];
  }

  window.jwb = window.jwb || {};
  window.jwb.utils = window.jwb.utils || {};
  window.jwb.utils.RandomUtils = {
    randInt,
    randChoice
  };
}
