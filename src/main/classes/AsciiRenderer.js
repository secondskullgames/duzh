{
  function AsciiRenderer() {
    const WIDTH = 80;
    const HEIGHT = 32;

    function render() {
      const { screen } = window.jwb.state;
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
      const { map } = window.jwb.state;

      const container = document.getElementById('container');
      const lines = ['', '', '']; // extra room for messages
      const mapHeight = HEIGHT - 7;
      for (let y = 0; y < mapHeight; y++) {
        let line = '';
        for (let x = 0; x < WIDTH; x++) {
          const element = map.getUnit(x, y) || map.getItem(x, y) || map.getTile(x, y);
          line += _renderElement(element);
        }
        lines.push(line);
      }
      lines.push('', '', '');
      lines.push(_getStatusLine());
      _addActionLines(lines);
      container.innerHTML = lines.map(line => line.padEnd(WIDTH, ' ')).join('\n');
    }

    function _renderInventoryScreen() {
      const { state } = window.jwb;
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
     * @private
     */
    function _renderElement(element) {
      switch (element.class) {
        case 'Unit':
          return `<span style="color: ${(element.name === 'player') ? '#0cf' : '#f00'}">@</span>`;
        case 'MapItem':
          return element.char;
        case 'Tile':
          return element.char;
      }
      return ' ';
    }

    function _getStatusLine() {
      const { playerUnit, mapIndex } = window.jwb.state;
      return `HP: ${playerUnit.currentHP}/${playerUnit.maxHP}    Damage: ${playerUnit.getDamage()}    Level: ${mapIndex + 1}`;
    }

    /**
     * @param {string[]} lines
     */
     function _addActionLines(lines) {
      const { messages } = window.jwb.state;
      for (let i = 0; i < messages.length; i++) {
        lines[i] = messages.pop();
      }
    }

    return { render };
  }

  window.jwb = window.jwb || {};
  window.jwb.renderer = new AsciiRenderer();
}
