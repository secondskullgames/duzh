{
  const TILE_WIDTH = 32;
  const TILE_HEIGHT = 24;

  const WIDTH = 20; // in tiles
  const HEIGHT = 20; // in tiles

  const SCREEN_WIDTH = 640;
  const SCREEN_HEIGHT = 480;

  const BOTTOM_PANEL_HEIGHT = 4 * TILE_HEIGHT;
  const BOTTOM_PANEL_WIDTH = 6 * TILE_WIDTH;
  const BOTTOM_BAR_WIDTH = 8 * TILE_WIDTH;
  const BOTTOM_BAR_HEIGHT = 2 * TILE_HEIGHT;

  const INVENTORY_LEFT = 2 * TILE_WIDTH;
  const INVENTORY_TOP = 2 * TILE_HEIGHT;
  const INVENTORY_WIDTH = 16 * TILE_WIDTH;
  const INVENTORY_HEIGHT = 12 * TILE_HEIGHT;

  const LINE_HEIGHT = 16;

  /**
   * @constructor
   */
  function SpriteRenderer() {
    const _container = document.getElementById('container');
    _container.innerHTML = '';
    const _canvas = document.createElement('canvas');
    _container.appendChild(_canvas);
    _canvas.width = WIDTH * TILE_WIDTH;
    _canvas.height = HEIGHT * TILE_HEIGHT;
    const _context = _canvas.getContext('2d');
    _context.imageSmoothingEnabled = false;
    _context.textBaseline = 'middle';

    /**
     * @return {!Promise<void>}
     */
    function render() {
      const { screen } = jwb.state;
      switch (screen) {
        case 'GAME':
          return _renderGameScreen();
        case 'INVENTORY':
          return _renderGameScreen()
            .then(() => _renderInventory());
        default:
          throw `Invalid screen ${screen}`;
      }
    }

    /**
     * @return {!Promise<void>}
     */
    function _renderGameScreen() {
      const { revealTiles } = jwb.actions;
      revealTiles();
      return _waitForSprites()
        .then(() => {
          _context.fillStyle = '#000';
          _context.fillRect(0, 0, _canvas.width, _canvas.height);
          return Promise.all([
            _renderTiles(),
            _renderItems(),
            _renderUnits(),
            _renderPlayerInfo(),
            _renderBottomBar(),
            _renderMessages()
          ]);
        });
    }

    /**
     * @returns {!Promise<*>}
     * @private
     */
    function _waitForSprites() {
      const { map } = jwb.state;
      const elements = [];

      for (let y = 0; y < map.height; y++) {
        for (let x = 0; x < map.width; x++) {
          if (map.contains(x, y)) {
            elements.push(map.getTile(x, y), map.getItem(x, y), map.getUnit(x, y));
          }
        }
      }

      const sprites = elements.filter(element => !!element)
        .map(element => element.getSprite())
        .filter(sprite => !!sprite);

      const promises = sprites.map(sprite => sprite.whenReady);

      return Promise.all(promises);
    }

    /**
     * @returns {!Promise<*>}
     * @private
     */
    function _renderTiles() {
      return new Promise(resolve => {
        const { map } = jwb.state;
        for (let y = 0; y < map.height; y++) {
          for (let x = 0; x < map.width; x++) {
            if (_isTileRevealed({ x, y })) {
              const tile = map.getTile(x, y);
              if (!!tile) {
                _renderElement(tile, { x, y });
              }
            }
          }
        }
        resolve();
      });
    }

    /**
     * @return {!Promise<*>}
     * @private
     */
    function _renderItems() {
      const { map } = jwb.state;
      const promises = [];
      for (let y = 0; y < map.height; y++) {
        for (let x = 0; x < map.width; x++) {
          if (_isTileRevealed({ x, y })) {
            const item = map.getItem(x, y);
            if (!!item) {
              promises.push(_drawEllipse(x, y, '#888', TILE_WIDTH * 3 / 8, TILE_HEIGHT * 3 / 8));
              promises.push(_renderElement(item, { x, y }));
            }
          }
        }
      }
      return Promise.all(promises);
    }

    /**
     * @return {!Promise<*>}
     * @private
     */
    function _renderUnits() {
      const { map, playerUnit } = jwb.state;
      const promises = [];
      for (let y = 0; y < map.height; y++) {
        for (let x = 0; x < map.width; x++) {
          if (_isTileRevealed({ x, y })) {
            const unit = map.getUnit(x, y);
            if (!!unit) {
              if (unit === playerUnit) {
                promises.push(_drawEllipse(x, y, '#0f0', TILE_WIDTH * 3 / 8, TILE_HEIGHT * 3 / 8));
              } else {
                promises.push(_drawEllipse(x, y, '#888', TILE_WIDTH * 3 / 8, TILE_HEIGHT * 3 / 8));
              }
              promises.push(_renderElement(unit, { x, y }));
            }
          }
        }
      }
      return Promise.all(promises);
    }

    /**
     * @param {!int} x tile x coordinate
     * @param {!int} y tile y coordinate
     * @param {!string} color (in hex form)
     * @param {!int} width
     * @param {!int} height
     * @return {!Promise<void>}
     * @private
     */
    function _drawEllipse(x, y, color, width, height) {
      _context.fillStyle = color;
      const topLeftPixel = _gridToPixel({ x, y });
      const [cx, cy] = [topLeftPixel.x + TILE_WIDTH / 2, topLeftPixel.y + TILE_HEIGHT / 2];
      _context.moveTo(cx, cy);
      _context.beginPath();
      _context.ellipse(cx, cy, width, height, 0, 0, 2 * Math.PI);
      _context.fill();
      return new Promise(resolve => { resolve(); });
    }

    /**
     * @return {!Promise<void>}
     * @private
     */
    function _renderInventory() {
      const { playerUnit, inventoryCategory, inventoryIndex } = jwb.state;
      const { inventory } = playerUnit;

      _drawRect(INVENTORY_LEFT, INVENTORY_TOP, INVENTORY_WIDTH, INVENTORY_HEIGHT);

      // draw equipment

      const equipmentLeft = INVENTORY_LEFT + TILE_WIDTH;
      const inventoryLeft = (_canvas.width + TILE_WIDTH) / 2;

      // draw titles
      _context.fillStyle = '#fff';
      _context.textAlign = 'center';
      _context.font = '20px Monospace';
      _context.fillText('EQUIPMENT', _canvas.width / 4, INVENTORY_TOP + 12);
      _context.fillText('INVENTORY', _canvas.width * 3 / 4, INVENTORY_TOP + 12);

      // draw equipment items
      // for now, just display them all in one list

      _context.font = '10px sans-serif';
      _context.textAlign = 'left';

      let y = INVENTORY_TOP + 64;
      Object.entries(playerUnit.equipment).forEach(([slot, equipmentList]) => {
        equipmentList.forEach(equipment => {
          _context.fillText(`${slot} - ${equipment.name}`, equipmentLeft, y);
          y += LINE_HEIGHT;
        });
      });

      // draw inventory categories
      const inventoryCategories = Object.keys(inventory);
      const categoryWidth = 60;
      const xOffset = 4;

      _context.font = '14px Monospace';
      _context.textAlign = 'center';

      for (let i = 0; i < inventoryCategories.length; i++) {
        const x = inventoryLeft + i * categoryWidth + (categoryWidth / 2) + xOffset;
        _context.fillText(inventoryCategories[i], x, INVENTORY_TOP + 40);
        if (inventoryCategories[i] === inventoryCategory) {
          _context.fillRect(x - (categoryWidth / 2) + 4, INVENTORY_TOP + 48, categoryWidth - 8, 1);
        }
      }

      // draw inventory items

      const items = inventory[inventoryCategory];
      const x = inventoryLeft + 8;

      _context.font = '10px sans-serif';
      _context.textAlign = 'left';

      for (let i = 0; i < items.length; i++) {
        const y = INVENTORY_TOP + 64 + LINE_HEIGHT * i;
        if (i === inventoryIndex) {
          _context.fillStyle = '#fc0';
        } else {
          _context.fillStyle = '#fff';
        }
        _context.fillText(items[i].name, x, y);
      }
      _context.fillStyle = '#fff';

      return new Promise(resolve => { resolve(); });
    }

    /**
     * @param {!int} x
     * @param {!int} y
     * @returns {!boolean}
     * @private
     */
    function _isPixelOnScreen({ x, y}) {
      return (
        (x >= -TILE_WIDTH) &&
        (x <= SCREEN_WIDTH + TILE_WIDTH) &&
        (y >= -TILE_HEIGHT) &&
        (y <= SCREEN_HEIGHT + TILE_HEIGHT)
      );
    }

    /**
     * @param {!int} x
     * @param {!int} y
     * @private
     */
    function _isTileRevealed({ x, y }) {
      const { coordinatesEquals } = jwb.utils.MapUtils;
      if (jwb.DEBUG) {
        return true;
      }
      return jwb.state.map.revealedTiles.some(tile => coordinatesEquals({ x, y }, tile));
    }

    /**
     * @param {!(Unit | MapItem | Tile)} element
     * @param {!int} x
     * @param {!int} y
     * @private
     */
    function _renderElement(element, { x, y }) {
      const pixel = _gridToPixel({ x, y });

      if (!_isPixelOnScreen(pixel)) {
        return;
      }

      const sprite = element.getSprite();
      if (!!sprite) {
        _drawSprite(element.getSprite(), pixel);
      }
    }

    /**
     * @param {!Sprite} sprite
     * @param {!int} x
     * @param {!int} y
     * @private
     */
    function _drawSprite(sprite, { x, y }) {
      _context.drawImage(sprite.image, x + sprite.dx, y + sprite.dy);
    }

    /**
     * Renders the bottom-left area of the screen, showing information about the player
     * @return {!Promise<void>}
     * @private
     */
    function _renderPlayerInfo() {
      return new Promise(resolve => {
        const { playerUnit } = jwb.state;

        const top = SCREEN_HEIGHT - BOTTOM_PANEL_HEIGHT;
        _drawRect(0, top, BOTTOM_PANEL_WIDTH, BOTTOM_PANEL_HEIGHT);

        const lines = [
          playerUnit.name,
          `Level ${playerUnit.level}`,
          `Life: ${playerUnit.life}/${playerUnit.maxLife}`,
          `Damage: ${playerUnit.getDamage()}`,
        ];
        const experienceToNextLevel = playerUnit.experienceToNextLevel(playerUnit.level);
        if (experienceToNextLevel !== null) {
          lines.push(`Experience: ${playerUnit.experience}/${experienceToNextLevel}`);
        }
        _context.fillStyle = '#fff';
        _context.textAlign = 'left';
        _context.font = '10px sans-serif';

        const left = 4;
        for (let i = 0; i < lines.length; i++) {
          let y = top + (LINE_HEIGHT / 2) + (LINE_HEIGHT * i);
          _context.fillText(lines[i], left, y);
        }
        resolve();
      });
    }

    /**
    * @return {!Promise<void>}
    * @private
    */
    function _renderMessages() {
      return new Promise(resolve => {
        const { messages } = jwb.state;
        _context.fillStyle = '#000';
        _context.strokeStyle = '#fff';

        const left = SCREEN_WIDTH - BOTTOM_PANEL_WIDTH;
        const top = SCREEN_HEIGHT - BOTTOM_PANEL_HEIGHT;
        _drawRect(left, top, BOTTOM_PANEL_WIDTH, BOTTOM_PANEL_HEIGHT);

        _context.fillStyle = '#fff';
        _context.textAlign = 'left';
        _context.font = '10px sans-serif';

        const textLeft = left + 4;

        for (let i = 0; i < messages.length; i++) {
          let y = top + (LINE_HEIGHT / 2) + (LINE_HEIGHT * i);
          _context.fillText(messages[i], textLeft, y);
        }
        resolve();
      });
    }

    /**
     * @return {!Promise<void>}
     * @private
     */
    function _renderBottomBar() {
      return new Promise(resolve => {
        const left = BOTTOM_PANEL_WIDTH;
        const top = SCREEN_HEIGHT - BOTTOM_BAR_HEIGHT;
        const width = SCREEN_WIDTH - 2 * BOTTOM_PANEL_WIDTH;

        _drawRect(left, top, width, BOTTOM_BAR_HEIGHT);

        const { mapIndex, turn } = jwb.state;
        _context.textAlign = 'left';
        _context.fillStyle = '#fff';
        const textLeft = left + 4;
        _context.fillText(`Level: ${mapIndex + 1}`, textLeft, top + 8);
        _context.fillText(`Turn: ${turn}`, textLeft, top + 8 + LINE_HEIGHT);
        resolve();
      });
    }

    /**
     * @private
     */
    function _drawRect(left, top, width, height) {
      _context.fillStyle = '#000';
      _context.fillRect(left, top, width, height);
      _context.strokeStyle = '#fff';
      _context.strokeRect(left, top, width, height);
    }

    /**
     * @private
     */
    function _gridToPixel({ x, y }) {
      const { playerUnit } = jwb.state;
      return {
        x: ((x - playerUnit.x) * TILE_WIDTH) + (SCREEN_WIDTH - TILE_WIDTH) / 2,
        y: ((y - playerUnit.y) * TILE_HEIGHT) + (SCREEN_HEIGHT - TILE_HEIGHT)/ 2
      };
    }

    this.render = render.bind(this);
  }

  window.jwb = window.jwb || {};
  jwb.SpriteRenderer = SpriteRenderer;
}
