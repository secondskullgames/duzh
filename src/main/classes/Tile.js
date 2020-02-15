{
  /**
   * @param {!string} name
   * @param {!string} char
   * @param {?(function(): ?Sprite)} spriteSupplier This is lazy-loaded so that we can avoid dependency issues (see types.js)
   * @param {!boolean} isBlocking
   */
  function Tile(name, char, spriteSupplier, isBlocking) {
    this.class = 'Tile';
    this.name = name;
    this.char = char;
    /**
     * @private
     */
    this._spriteSupplier = spriteSupplier;
    this.isBlocking = isBlocking;
    /**
     * @type {Sprite | null}
     * @private
     */
    this._sprite = null;

    this.getSprite = function() {
      if (!this._sprite && this._spriteSupplier) {
        this._sprite = this._spriteSupplier();
      }
      return this._sprite;
    }.bind(this);
  }

  jwb.Tile = Tile;
}
