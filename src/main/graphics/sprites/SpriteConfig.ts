import bow from '../../../../data/sprites/equipment/bow.json';
import helmet from '../../../../data/sprites/equipment/helmet.json';
import mail from '../../../../data/sprites/equipment/mail.json';
import player from '../../../../data/sprites/units/player.json';
import shield2 from '../../../../data/sprites/equipment/shield2.json';
import snake from '../../../../data/sprites/units/snake.json';
import sword from '../../../../data/sprites/equipment/sword.json';
import zombie from '../../../../data/sprites/units/zombie.json';
import { Offsets } from './Sprite';

type SpriteConfig = {
  name: string,
  offsets: Offsets,
  pattern?: string,
  patterns?: string[],
  animations: {
    [name: string]: {
      pattern?: string,
      frames: {
        activity: string,
        number: string
      }[]
    }
  }
}

const SpriteConfigs: ({ [name: string]: SpriteConfig }) = {
  bow,
  helmet,
  mail,
  shield2,
  snake,
  sword,
  player,
  zombie
};

export { SpriteConfigs };
export type { SpriteConfig };

