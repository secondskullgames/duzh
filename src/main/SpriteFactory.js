{
  const SpriteFactory = {
    PLAYER_GREEN_BROWN: () => new Sprite('player_standing_SE_1', { dx: -4, dy: -20 }, '#ffffff', {
      '#800080': '#804000', // Shirt
      '#ff00ff': '#008000', // Upper Sleeves
      '#000080': '#008000', // Lower sleeves
      '#00ffff': '#ffc0c0', // Hands
      '#000000': '#000000', // Belt
      '#808080': '#804000', // Skirt
      '#c0c0c0': '#c08040', // Legs
      '#008000': '#804000', // Socks
      '#00ff00': '#804000', // Shoes
      '#ff8040': '#ffc0c0'  // Face
    }),
    PLAYER_BLACK: () => new Sprite('player_standing_SE_1', { dx: -4, dy: -20 }, '#ffffff', {
      '#800080': '#000040', // Shirt
      '#ff00ff': '#000040', // Upper Sleeves
      '#000080': '#000040', // Lower sleeves
      '#00ffff': '#ffc0c0', // Hands
      '#000000': '#000040', // Belt
      '#808080': '#000040', // Skirt
      '#c0c0c0': '#000040',  // Legs
      '#008000': '#000000', // Socks
      '#00ff00': '#000000', // Shoes
      '#ff8040': '#ffc0c0'  // Face
    }),
    PLAYER_BLUE: () => new Sprite('player_standing_SE_1', { dx: -4, dy: -20 }, '#ffffff', {
      '#800080': '#0000c0', // Shirt
      '#ff00ff': '#0000cc', // Upper Sleeves
      '#000080': '#0000c0', // Lower sleeves
      '#00ffff': '#ffc0c0', // Hands
      '#000000': '#0000c0', // Belt
      '#808080': '#000080', // Skirt
      '#c0c0c0': '#000080',  // Legs
      '#008000': '#000000', // Socks
      '#00ff00': '#000000', // Shoes
      '#ff8040': '#ffc0c0'  // Face
    }),
    PLAYER_RED: () => new Sprite('player_standing_SE_1', { dx: -4, dy: -20 }, '#ffffff', {
      '#800080': '#c00000', // Shirt
      '#ff00ff': '#cc0000', // Upper Sleeves
      '#000080': '#c00000', // Lower sleeves
      '#00ffff': '#ffc0c0', // Hands
      '#000000': '#c00000', // Belt
      '#808080': '#800000', // Skirt
      '#c0c0c0': '#800000',  // Legs
      '#008000': '#000000', // Socks
      '#00ff00': '#000000', // Shoes
      '#ff8040': '#ffc0c0'  // Face
    }),
    WALL_TOP: () => new Sprite('tile_wall_top', { dx: 0, dy: 0 }, '#ffffff'),
    FLOOR: () => new Sprite('tile_floor', { dx: 0, dy: 0 }, '#ffffff'),
    FLOOR_HALL: () => new Sprite('tile_floor_hall', { dx: 0, dy: 0 }, '#ffffff'),
    MAP_SWORD: () => new Sprite('sword_icon_small', { dx: 0, dy: -8 }, '#ffffff'),
    MAP_POTION: () => new Sprite('potion_small', { dx: 0, dy: -8 }, '#ffffff'),
    STAIRS_DOWN: () => new Sprite('stairs_down2', { dx: 0, dy: 0 }, '#ffffff')
  };

  window.jwb = window.jwb || {};
  jwb.SpriteFactory = SpriteFactory;
}
