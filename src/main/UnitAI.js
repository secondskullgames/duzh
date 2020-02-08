{
  const HUMAN_CAUTIOUS = unit => {
    const { weightedRandom } = jwb.utils.RandomUtils;
    const { manhattanDistance } = jwb.utils.MapUtils;
    const { playerUnit } = jwb.state;

    let behavior;
    const distanceToPlayer = manhattanDistance(unit, playerUnit);

    if (distanceToPlayer === 1) {
      if ((unit.life / unit.maxLife) >= 0.4) {
        behavior = 'ATTACK_PLAYER';
      } else {
        behavior = weightedRandom({
          'ATTACK_PLAYER': 0.2,
          'WANDER': 0.5,
          'FLEE_FROM_PLAYER': 0.3
        });
      }
    } else if (distanceToPlayer >= 5) {
      behavior = weightedRandom({
        'WANDER': 0.3,
        'ATTACK_PLAYER': 0.1,
        'STAY': 0.6
      });
    } else {
      behavior = weightedRandom({
        'ATTACK_PLAYER': 0.5,
        'WANDER': 0.3,
        'STAY': 0.2
      });
    }
    return jwb.UnitBehaviors[behavior].call(null, unit);
  };

  const HUMAN_AGGRESSIVE = unit => {
    const { weightedRandom } = jwb.utils.RandomUtils;
    const { manhattanDistance } = jwb.utils.MapUtils;
    const { playerUnit } = jwb.state;

    let behavior;
    const distanceToPlayer = manhattanDistance(unit, playerUnit);

    if (distanceToPlayer === 1) {
      behavior = 'ATTACK_PLAYER';
    } else if (distanceToPlayer >= 8) {
      behavior = weightedRandom({
        'WANDER': 0.4,
        'STAY': 0.4,
        'ATTACK_PLAYER': 0.2
      });
    } else {
      behavior = weightedRandom({
        'ATTACK_PLAYER': 0.9,
        'STAY': 0.1
      });
    }
    return jwb.UnitBehaviors[behavior].call(null, unit);
  };

  const FULL_AGGRO = unit => jwb.UnitBehaviors.ATTACK_PLAYER.call(null, unit);

  window.jwb = window.jwb || {};
  jwb.UnitAI = {
    HUMAN_CAUTIOUS,
    HUMAN_AGGRESSIVE,
    FULL_AGGRO
  };
}