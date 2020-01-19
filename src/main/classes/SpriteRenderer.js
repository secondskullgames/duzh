{
  const TILE_WIDTH = 32;
  const TILE_HEIGHT = 24;

  const WIDTH = 20; // in tiles
  const HEIGHT = 20; // in tiles

  const SCREEN_WIDTH = WIDTH * TILE_WIDTH;
  const SCREEN_HEIGHT = HEIGHT * TILE_HEIGHT;

  const BOTTOM_PANEL_HEIGHT = 4 * TILE_HEIGHT;
  const BOTTOM_PANEL_WIDTH = 6 * TILE_WIDTH;
  const BOTTOM_BAR_WIDTH = 8 * TILE_WIDTH;
  const BOTTOM_BAR_HEIGHT = 2 * TILE_HEIGHT;

  const INVENTORY_LEFT = 4 * TILE_WIDTH;
  const INVENTORY_TOP = 2 * TILE_HEIGHT;
  const INVENTORY_WIDTH = 12 * TILE_WIDTH;
  const INVENTORY_HEIGHT = 8 * TILE_HEIGHT;

  const LINE_HEIGHT = 16;

  /**
   * @constructor
   */
  function SpriteRenderer() {
    const _container = document.getElementById('container');
    _container.innerHTML = '';
    const _canvas = _createCanvas();
    _container.appendChild(_canvas);
    _canvas.width = WIDTH * TILE_WIDTH;
    _canvas.height = HEIGHT * TILE_HEIGHT;
    const _context = _canvas.getContext('2d');
    _context.imageSmoothingEnabled = false;
    _context.textBaseline = 'middle';

    /**
     * @returns {HTMLCanvasElement}
     * @private
     */
    function _createCanvas() {
      return document.createElement('canvas');
    }

    /**
     * @return {Promise<void>}
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

    function _renderGameScreen() {
      return _waitForSprites()
        .then(() => {
          _context.fillStyle = '#000';
          _context.fillRect(0, 0, _canvas.width, _canvas.height);
          _renderTiles();
          _renderItems();
          _renderUnits();
          _renderPlayerInfo();
          _renderBottomBar();
          _renderMessages();
        });
    }

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

    function _renderTiles() {
      const { map } = jwb.state;
      for (let y = 0; y < map.height; y++) {
        for (let x = 0; x < map.width; x++) {
          const tile = map.getTile(x, y);
          if (!!tile) {
            _renderElement(tile, { x, y });
          }
        }
      }
    }

    function _renderItems() {
      const { map } = jwb.state;
      for (let y = 0; y < map.height; y++) {
        for (let x = 0; x < map.width; x++) {
          const item = map.getItem(x, y);
          if (!!item) {
            _drawEllipse(x, y, '#888', TILE_WIDTH * 3 / 8, TILE_HEIGHT * 3 / 8);
            _renderElement(item, { x, y })
          }
        }
      }
    }

    function _renderUnits() {
      const { map, playerUnit } = jwb.state;
      for (let y = 0; y < map.height; y++) {
        for (let x = 0; x < map.width; x++) {
          const unit = map.getUnit(x, y);
          if (!!unit) {
            if (unit === playerUnit) {
              _drawEllipse(x, y, '#0f0', TILE_WIDTH * 3 / 8, TILE_HEIGHT * 3 / 8);
            } else {
              _drawEllipse(x, y, '#888', TILE_WIDTH * 3 / 8, TILE_HEIGHT * 3 / 8);
            }
            _renderElement(unit, { x, y });
          }
        }
      }
    }

    /**
     * @param x tile x coordinate
     * @param y tile y coordinate
     * @param color
     * @param width
     * @param height
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
    }

    function _renderInventory() {
      const { state } = jwb;
      const { playerUnit, inventoryCategory, inventoryIndex } = state;
      const { inventory } = playerUnit;

      _drawRect(INVENTORY_LEFT, INVENTORY_TOP, INVENTORY_WIDTH, INVENTORY_HEIGHT);

      // draw title
      _context.fillStyle = '#fff';
      _context.textAlign = 'center';
      _context.font = '20px Monospace';
      _context.fillText('INVENTORY', _canvas.width / 2, INVENTORY_TOP + 12);

      // draw categories
      _context.textAlign = 'center';

      const categories = Object.keys(inventory);
      const categoryWidth = 60;
      const xOffset = 4;

      _context.font = '14px Monospace';

      for (let i = 0; i < categories.length; i++) {
        const x = INVENTORY_LEFT + i * categoryWidth + (categoryWidth / 2) + xOffset;
        _context.fillText(categories[i], x, INVENTORY_TOP + 40);
        if (categories[i] === inventoryCategory) {
          _context.fillRect(x - (categoryWidth / 2) + 4, INVENTORY_TOP + 48, categoryWidth - 8, 1);
        }
      }

      _context.textAlign = 'left';

      const items = inventory[inventoryCategory];
      const x = INVENTORY_LEFT + 8;

      _context.font = '10px sans-serif';
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

      return (resolve => resolve());
    }

    /**
     * @param pixel
     * @returns {boolean}
     * @private
     */
    function _isPixelOnScreen(pixel) {
      return (
        (pixel.x >= -TILE_WIDTH) &&
        (pixel.x <= SCREEN_WIDTH + TILE_WIDTH) &&
        (pixel.y >= -TILE_HEIGHT) &&
        (pixel.y <= SCREEN_HEIGHT + TILE_HEIGHT)
      );
    }

    /**
     * @param {Unit | MapItem | Tile} element
     * @param {Coordinates} {x, y}
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

    function _drawSprite(sprite, pixel) {
      _context.drawImage(sprite.image, pixel.x + sprite.dx, pixel.y + sprite.dy);
    }

    /**
     * @return the bottom-left area of the screen, showing information about the player
     * @private
     */
    function _renderPlayerInfo() {
      const { playerUnit } = jwb.state;

      const top = SCREEN_HEIGHT - BOTTOM_PANEL_HEIGHT;
      _drawRect(0, top, BOTTOM_PANEL_WIDTH, BOTTOM_PANEL_HEIGHT);

      const lines = [
        playerUnit.name,
        `Level ${playerUnit.level}`,
        `Life: ${playerUnit.life}/${playerUnit.maxLife}`,
        `Damage: ${playerUnit.getDamage()}`,
      ];
      if (playerUnit.experienceToNextLevel !== null) {
        lines.push(`Experience: ${playerUnit.experience}/${playerUnit.experienceToNextLevel}`);
      }
      _context.fillStyle = '#fff';
      _context.textAlign = 'left';
      _context.font = '10px sans-serif';

      const left = 4;
      for (let i = 0; i < lines.length; i++) {
        let y = top + (LINE_HEIGHT / 2) + (LINE_HEIGHT * i);
        _context.fillText(lines[i], left, y);
      }
    }

    function _renderMessages() {
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
    }

    function _renderBottomBar() {
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
