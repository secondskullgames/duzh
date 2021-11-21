import DEFLECTED_HIT from '../../../data/sounds/deflected_hit.json';
import DESCEND_STAIRS from '../../../data/sounds/descend_stairs.json';
import ENEMY_DIES from '../../../data/sounds/enemy_dies.json';
import ENEMY_HITS_PLAYER from '../../../data/sounds/enemy_hits_player.json';
import FOOTSTEP from '../../../data/sounds/footstep.json';
import LEVEL_UP from '../../../data/sounds/level_up.json';
import OPEN_DOOR from '../../../data/sounds/open_door.json';
import PICK_UP_ITEM from '../../../data/sounds/pick_up_item.json';
import PLAYER_DIES from '../../../data/sounds/player_dies.json';
import PLAYER_HITS_ENEMY from '../../../data/sounds/player_hits_enemy.json';
import SPECIAL_ATTACK from '../../../data/sounds/special_attack.json';
import USE_POTION from '../../../data/sounds/use_potion.json';

const Sounds: {[key: string]: [number, number][]} = <any>{
  DEFLECTED_HIT,
  DESCEND_STAIRS,
  ENEMY_HITS_PLAYER,
  ENEMY_DIES,
  FOOTSTEP,
  LEVEL_UP,
  PICK_UP_ITEM,
  PLAYER_DIES,
  PLAYER_HITS_ENEMY,
  OPEN_DOOR,
  SPECIAL_ATTACK,
  USE_POTION
};

export default Sounds;
