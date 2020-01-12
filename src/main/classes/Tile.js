{
  /**
   * @param {string} name
   * @param {string} char
   * @param {boolean} isBlocking
   */
  function Tile(name, char, isBlocking) {
    return {
      class: 'Tile',
      name,
      char,
      isBlocking
    };
  }

  jwb.Tile = Tile;
}