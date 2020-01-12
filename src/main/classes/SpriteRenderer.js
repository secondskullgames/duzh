{
  const TILE_WIDTH = 32;
  const TILE_HEIGHT = 24;

  const WIDTH = 40; // 20; // in tiles
  const HEIGHT = 24; // 16; // in tiles

  /**
   * @constructor
   */
  function SpriteRenderer() {
    const container = document.getElementById('container');
    container.innerHTML = '';
    const canvas = _createCanvas();
    container.appendChild(canvas);
    canvas.width = WIDTH * TILE_WIDTH;
    canvas.height = HEIGHT * TILE_HEIGHT;
    const context = canvas.getContext('2d');

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
          return _renderInventoryScreen();
        default:
          throw `Invalid screen ${screen}`;
      }
    }

    function _renderGameScreen() {
      _waitForSprites()
        .then(() => {
          _renderTiles();
          _renderItems();
          _renderUnits();
        });
    }

    function _waitForSprites() {
      const { map } = jwb.state;
      const elements = [];

      for (let y = 0; y < HEIGHT; y++) {
        for (let x = 0; x < WIDTH; x++) {
          elements.push(map.getTile(x, y), map.getItem(x, y), map.getUnit(x, y));
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
                _renderElement(element, { x, y })
              });
          }
        }
      }
    }

    function _renderUnits() {
      const { map } = jwb.state;
      for (let y = 0; y < HEIGHT; y++) {
        for (let x = 0; x < WIDTH; x++) {
          if (map.contains(x, y)) {
            [map.getUnit(x, y)]
              .filter(element => !!element)
              .forEach(element => {
                _renderElement(element, { x, y })
              });
          }
        }
      }
    }

    function _renderInventoryScreen() {
      const { state } = jwb;
      const { playerUnit, inventoryCategory, inventoryIndex } = state;
      const { inventory } = playerUnit;

      const container = document.getElementById('container');

      const inventoryLines = [];

      if (inventoryCategory) {
        const items = inventory[inventoryCategory];
        inventoryLines.push(inventoryCategory);
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          if (i === inventoryIndex) {
            inventoryLines.push(`<span style="color: #f00">${item.name}</span>`);
          } else {
            inventoryLines.push(item.name);
          }
        }
      }

      const lines = ['INVENTORY', ''];

      for (let y = 0; y < HEIGHT - 3; y++) {
        let line = (y < inventoryLines.length) ? inventoryLines[y] : '';
        lines.push(line);
      }
      lines.push(_getStatusLine());
      _addActionLines(lines);
      container.innerHTML = lines.map(line => line.padEnd(WIDTH, ' ')).join('\n');
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
            context.fillStyle = (element === jwb.state.playerUnit ? '#00f' : '#f00');
            context.fillRect(pixel.x, pixel.y, TILE_WIDTH, TILE_HEIGHT);
          }
          break;
        }
        case 'MapItem':
          const sprite = element.getSprite();
          if (sprite) {
            _drawSprite(sprite, pixel);
          } else {
            // TODO TEMP CODE
            context.fillStyle = '#0f0';
            context.fillRect(pixel.x, pixel.y, TILE_WIDTH, TILE_HEIGHT);
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
                context.fillStyle = '#00f';
                break;
              default:
                context.fillStyle = '#000';
            }
            context.fillRect(pixel.x, pixel.y, TILE_WIDTH, TILE_HEIGHT);
          }
          break;
        }
      }
    }

    function _drawSprite(sprite, pixel) {
      context.drawImage(sprite.image, pixel.x + sprite.dx, pixel.y + sprite.dy);
    }

    function _getStatusLine() {
      const { playerUnit, mapIndex } = jwb.state;
      return `HP: ${playerUnit.currentHP}/${playerUnit.maxHP}    Damage: ${playerUnit.getDamage()}    Level: ${mapIndex + 1}`;
    }

    /**
     * @param {string[]} lines
     */
     function _addActionLines(lines) {
      const { messages } = jwb.state;
      for (let i = 0; i < messages.length; i++) {
        lines[i] = messages.pop();
      }
    }

    this.render = render.bind(this);
  }

  window.jwb = window.jwb || {};
  jwb.SpriteRenderer = SpriteRenderer;
}
