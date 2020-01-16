{
  window.jwb = window.jwb || {};
  jwb.UnitFactory = {
    PLAYER: ({ x, y }) => {
      return new Unit(jwb.SpriteFactory.PLAYER(), x, y, 'player', 12, 100, 0.2)
    },
    ENEMY: ({ x, y }) => {
      const enemyUnit = new Unit(jwb.SpriteFactory.PLAYER(), x, y, 'enemy', 6, 60, 0.2);
      const { WANDER, ATTACK_PLAYER, FLEE_FROM_PLAYER, STAY } = jwb.UnitBehaviors;
      const { randChoice } = jwb.utils.RandomUtils;
      enemyUnit.aiHandler = u => {
        let behavior;
        if ((u.currentHP / u.maxHP) >= 0.5) {
          behavior = randChoice([ATTACK_PLAYER, ATTACK_PLAYER, WANDER, STAY]);
        } else {
          behavior = randChoice([FLEE_FROM_PLAYER, WANDER, ATTACK_PLAYER]);
        }
        return behavior.call(null, u);
      };
      return enemyUnit;
    }
  };
}
