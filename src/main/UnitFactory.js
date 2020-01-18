{
  window.jwb = window.jwb || {};
  jwb.UnitFactory = {
    PLAYER: ({ x, y }) => new Unit(
      jwb.SpriteFactory.PLAYER(),
      jwb.UnitClass.PLAYER,
      'player',
      1,
      { x, y }
    ),
    ENEMY: ({ x, y }) => {
      const enemyUnit = new Unit(
        jwb.SpriteFactory.ENEMY_PLAYER(),
        jwb.UnitClass.ENEMY_HUMAN,
        'enemy',
        1,
        { x, y }
      );

      enemyUnit.aiHandler = u => {
        const { weightedRandom } = jwb.utils.RandomUtils;
        const { distance } = jwb.utils.MapUtils;
        const { playerUnit } = jwb.state;

        let behavior;
        const distanceToPlayer = distance(u, playerUnit);

        if (distanceToPlayer === 1) {
          if ((u.life / u.maxLife) >= 0.5) {
            behavior = weightedRandom({
              'ATTACK_PLAYER': 0.8,
              'WANDER': 0.2,
            });
          } else {
            behavior = weightedRandom({
              'ATTACK_PLAYER': 0.8,
              'WANDER': 0.2,
            });
          }
        } else {
          if ((u.life / u.maxLife) >= 0.5) {
            behavior = weightedRandom({
              'ATTACK_PLAYER': 0.5,
              'WANDER': 0.3,
              'STAY': 0.2
            });
          } else {
            behavior = weightedRandom({
              'ATTACK_PLAYER': 0.3,
              'FLEE_FROM_PLAYER': 0.3,
              'WANDER': 0.2,
              'STAY': 0.2
            });
          }
        }
        return jwb.UnitBehaviors[behavior].call(null, u);
      };
      return enemyUnit;
    }
  };
}
