{
  const TILE_WIDTH = 32;
  const TILE_HEIGHT = 24;

  const WIDTH = 20; // in tiles
  const HEIGHT = 16; // in tiles

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

    function render() {
      const { screen } = jwb.state;
      switch (screen) {
        case 'GAME':
          return _renderGameScreen();
        case 'INVENTORY':
          _renderGameScreen()
            .then(() => _renderInventory());
          break;
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

      const promises = elements.filter(element => !!element)
        .map(element => element.getSprite())
        .filter(sprite => !!sprite)
        .map(sprite => sprite.whenReady);

      return Promise.all(promises);
    }

    function _renderTiles() {
      const { map } = jwb.state;
      for (let y = 0; y < HEIGHT; y++) {
        for (let x = 0; x < WIDTH; x++) {
          if (map.contains(x, y)) {
            [map.getTile(x, y)]
              .filter(element => !!element)
              .forEach(element => {
                _renderElement(element, { x, y })
              });
          }
        }
      }
    }

    function _renderItems() {
      const { map } = jwb.state;
      for (let y = 0; y < HEIGHT; y++) {
        for (let x = 0; x < WIDTH; x++) {
          if (map.contains(x, y)) {
            [map.getItem(x, y)]
              .filter(element => !!element)
              .forEach(element => {
                _drawEllipse(x, y, '#888', TILE_WIDTH * 3 / 8, TILE_HEIGHT * 3 / 8);
                _renderElement(element, { x, y })
              });
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
      const [cx, cy] = [(x + 0.5) * TILE_WIDTH, (y + 0.5) * TILE_HEIGHT];
      _context.moveTo(cx, cy);
      _context.beginPath();
      _context.ellipse(cx, cy, width, height, 0, 0, 2 * Math.PI);
      _context.fill();
    }

    function _renderUnits() {
      const { map, playerUnit } = jwb.state;
      for (let y = 0; y < HEIGHT; y++) {
        for (let x = 0; x < WIDTH; x++) {
          if (map.contains(x, y)) {
            [map.getUnit(x, y)]
              .filter(unit => !!unit)
              .forEach(unit => {
                if (unit === playerUnit) {
                  _drawEllipse(x, y, '#0f0', TILE_WIDTH * 3 / 8, TILE_HEIGHT * 3 / 8);
                } else {
                  _drawEllipse(x, y, '#888', TILE_WIDTH * 3 / 8, TILE_HEIGHT * 3 / 8);
                }
                _renderElement(unit, { x, y });
              });
          }
        }
      }
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
        let text;
        if (i === inventoryIndex) {
          _context.fillStyle = '#fc0';
        } else {
          _context.fillStyle = '#fff';
        }
        _context.fillText(items[i].name, x, y);
      }
      _context.fillStyle = '#fff';
    }

    /**
     * @param {Unit | MapItem | Tile} element
     * @param {Coordinates} {x, y}
     * @private
     */
    function _renderElement(element, { x, y }) {
      const { Tiles } = jwb.types;
      const pixel = { x: x * TILE_WIDTH, y: y * TILE_HEIGHT };
      switch (element.class) {
        case 'Unit': {
          const sprite = element.getSprite();
          if (sprite) {
            _drawSprite(sprite, pixel);
          } else {
            // TODO TEMP CODE
            _context.fillStyle = (element === jwb.state.playerUnit ? '#00f' : '#f00');
            _context.fillRect(pixel.x, pixel.y, TILE_WIDTH, TILE_HEIGHT);
          }
          break;
        }
        case 'MapItem':
          const sprite = element.getSprite();
          if (sprite) {
            _drawSprite(sprite, pixel);
          } else {
            // TODO TEMP CODE
            _context.fillStyle = '#0f0';
            _context.fillRect(pixel.x, pixel.y, TILE_WIDTH, TILE_HEIGHT);
          }
          break;
        case 'Tile': {
          const sprite = element.getSprite();
          if (sprite) {
            _drawSprite(sprite, pixel);
          } else {
            // TODO TEMP CODE
            switch (element.name) {
              case 'STAIRS_DOWN':
                _context.fillStyle = '#000';
                _context.fillRect(pixel.x, pixel.y, TILE_WIDTH, TILE_HEIGHT);
                _context.fillStyle = '#fff';
                _context.font = '20px Monospace';
                _context.textAlign = 'center';
                _context.fillText('>', pixel.x + TILE_WIDTH / 2, pixel.y + TILE_HEIGHT / 2);
                break;
              default:
                _context.fillStyle = '#000';
                _context.fillRect(pixel.x, pixel.y, TILE_WIDTH, TILE_HEIGHT);
            }
          }
          break;
        }
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
        'Chigz Jupsiz [hardcoded]',
        'Level 1 [hardcoded]',
        `HP: ${playerUnit.currentHP}/${playerUnit.maxHP}`,
        'Food: 50/100 [hardcoded]',
        `Damage: ${playerUnit.getDamage()}`,
        'Defense: 11 [hardcoded]'
      ];
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
        _context.fillText(messages.pop(), textLeft, y);
      }
    }

    function _renderBottomBar() {
      const left = BOTTOM_PANEL_WIDTH;
      const top = SCREEN_HEIGHT - BOTTOM_BAR_HEIGHT;
      const width = SCREEN_WIDTH - 2 * BOTTOM_PANEL_WIDTH;

      _drawRect(left, top, width, BOTTOM_BAR_HEIGHT);

      const { mapIndex } = jwb.state;
      _context.textAlign = 'left';
      _context.fillStyle = '#fff';
      const textLeft = left + 4;
      _context.fillText(`Level ${mapIndex + 1}`, textLeft, top + 8);
    }

    function _drawRect(left, top, width, height) {
      _context.fillStyle = '#000';
      _context.fillRect(left, top, width, height);
      _context.strokeStyle = '#fff';
      _context.strokeRect(left, top, width, height);
    }

    this.render = render.bind(this);
  }

  window.jwb = window.jwb || {};
  jwb.SpriteRenderer = SpriteRenderer;
}
