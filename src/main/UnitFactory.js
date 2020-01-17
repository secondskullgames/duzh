{
  window.jwb = window.jwb || {};
  jwb.UnitFactory = {
    PLAYER: ({ x, y }) => {
      return new Unit(jwb.SpriteFactory.PLAYER(), x, y, 'player', 12, 100, 0.2)
    },
    ENEMY: ({ x, y }) => {
      const enemyUnit = new Unit(jwb.SpriteFactory.PLAYER(), x, y, 'enemy', 6, 60, 0.2);
      const { weightedRandom } = jwb.utils.RandomUtils;
      enemyUnit.aiHandler = u => {
        let behavior;
        if ((u.currentHP / u.maxHP) >= 0.5) {
          behavior = weightedRandom({
            'ATTACK_PLAYER': 0.6,
            'WANDER': 0.3,
            'STAY': 0.1
          });
        } else {
          behavior = weightedRandom({
            'ATTACK_PLAYER': 0.4,
            'FLEE_FROM_PLAYER': 0.3,
            'WANDER': 0.2,
            'STAY': 0.1
          });
        }
        return jwb.UnitBehaviors[behavior].call(null, u);
      };
      return enemyUnit;
    }
  };
}
