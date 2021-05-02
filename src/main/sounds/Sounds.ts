import PLAYER_HITS_ENEMY from '../../../data/sounds/player_hits_enemy.json';
import ENEMY_HITS_PLAYER from '../../../data/sounds/enemy_hits_player.json';
import ENEMY_DIES        from '../../../data/sounds/enemy_dies.json';
import PLAYER_DIES       from '../../../data/sounds/player_dies.json';
import LEVEL_UP          from '../../../data/sounds/level_up.json';
import DEFLECTED_HIT     from '../../../data/sounds/deflected_hit.json';
import PICK_UP_ITEM      from '../../../data/sounds/pick_up_item.json';
import USE_POTION        from '../../../data/sounds/use_potion.json';
import OPEN_DOOR         from '../../../data/sounds/open_door.json';
import FOOTSTEP          from '../../../data/sounds/footstep.json';
import DESCEND_STAIRS    from '../../../data/sounds/descend_stairs.json';

const Sounds: {[key: string]: [number, number][]} = <any>{
  PLAYER_HITS_ENEMY,
  ENEMY_HITS_PLAYER,
  ENEMY_DIES,
  PLAYER_DIES,
  LEVEL_UP,
  DEFLECTED_HIT,
  PICK_UP_ITEM,
  USE_POTION,
  OPEN_DOOR,
  FOOTSTEP,
  DESCEND_STAIRS,
};

export default Sounds;