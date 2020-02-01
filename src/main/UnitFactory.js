{
  window.jwb = window.jwb || {};
  jwb.UnitFactory = {
    PLAYER: ({ x, y }) => new Unit(
      jwb.UnitClass.PLAYER,
      'player',
      1,
      { x, y },
      // Green/brown colors
      {
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
      }
    ),
    ENEMY_BLUE: ({ x, y }) => {
      const enemyUnit = new Unit(
        jwb.UnitClass.ENEMY_HUMAN,
        'enemy_blue',
        1,
        { x, y },
        {
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
        }
      );

      enemyUnit.aiHandler = u => {
        const { weightedRandom } = jwb.utils.RandomUtils;
        const { distance } = jwb.utils.MapUtils;
        const { playerUnit } = jwb.state;

        let behavior;
        const distanceToPlayer = distance(u, playerUnit);

        if (distanceToPlayer === 1) {
          if ((u.life / u.maxLife) >= 0.5) {
            behavior = 'ATTACK_PLAYER';
          } else {
            behavior = weightedRandom({
              'ATTACK_PLAYER': 0.25,
              'WANDER': 0.5,
              'FLEE_FROM_PLAYER': 0.25
            });
          }
        } else if (distanceToPlayer >= 5) {
          behavior = weightedRandom({
            'WANDER': 0.1,
            'ATTACK_PLAYER': 0.2,
            'STAY': 0.6
          });
        } else {
          behavior = weightedRandom({
            'ATTACK_PLAYER': 0.9,
            'STAY': 0.1
          });
        }
        return jwb.UnitBehaviors[behavior].call(null, u);
      };
      return enemyUnit;
    },
    ENEMY_RED: ({ x, y }) => {
      const enemyUnit = new Unit(
        jwb.UnitClass.ENEMY_HUMAN,
        'enemy_red',
        1,
        { x, y },
        {
          '#800080': '#c00000', // Shirt
          '#ff00ff': '#cc0000', // Upper Sleeves
          '#000080': '#c00000', // Lower sleeves
          '#00ffff': '#ffc0c0', // Hands
          '#000000': '#c00000', // Belt
          '#808080': '#800000', // Skirt
          '#c0c0c0': '#800000', // Legs
          '#008000': '#000000', // Socks
          '#00ff00': '#000000', // Shoes
          '#ff8040': '#ffc0c0'  // Face
        }
      );

      enemyUnit.aiHandler = u => {
        const { weightedRandom } = jwb.utils.RandomUtils;
        const { distance } = jwb.utils.MapUtils;
        const { playerUnit } = jwb.state;

        let behavior;
        const distanceToPlayer = distance(u, playerUnit);

        if (distanceToPlayer === 1) {
          behavior = 'ATTACK_PLAYER';
        } else if (distanceToPlayer >= 8) {
          behavior = weightedRandom({
            'WANDER': 0.5,
            'STAY': 0.25,
            'ATTACK_PLAYER': 0.25
          });
        } else {
          behavior = weightedRandom({
            'ATTACK_PLAYER': 0.9,
            'STAY': 0.1
          });
        }
        return jwb.UnitBehaviors[behavior].call(null, u);
      };
      return enemyUnit;
    },

    FULL_AGGRO: ({ x, y }) => {
      const enemyUnit = new Unit(
        jwb.UnitClass.ENEMY_HUMAN,
        'enemy_red',
        1,
        { x, y },
        {
          '#800080': '#c00000', // Shirt
          '#ff00ff': '#cc0000', // Upper Sleeves
          '#000080': '#c00000', // Lower sleeves
          '#00ffff': '#ffc0c0', // Hands
          '#000000': '#c00000', // Belt
          '#808080': '#800000', // Skirt
          '#c0c0c0': '#800000', // Legs
          '#008000': '#000000', // Socks
          '#00ff00': '#000000', // Shoes
          '#ff8040': '#ffc0c0'  // Face
        }
      );

      enemyUnit.aiHandler = u => jwb.UnitBehaviors.ATTACK_PLAYER.call(null, u);
      return enemyUnit;
    }
  };
}