import bow from '../../../../data/sprites/bow.json';
import helmet from '../../../../data/sprites/helmet.json';
import mail from '../../../../data/sprites/mail.json';
import player from '../../../../data/sprites/player.json';
import shield2 from '../../../../data/sprites/shield2.json';
import snake from '../../../../data/sprites/snake.json';
import sword from '../../../../data/sprites/sword.json';
import zombie from '../../../../data/sprites/zombie.json';

type SpriteConfig = {
  name: string,
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

enum SpriteName {
  BOW = 'BOW',
  HELMET = 'HELMET',
  MAIL = 'MAIL',
  SHIELD = 'SHIELD',
  SNAKE = 'SNAKE',
  SWORD = 'SWORD',
  PLAYER = 'PLAYER',
  ZOMBIE = 'ZOMBIE'
}

const SpriteConfigs: ({ [name in SpriteName]: SpriteConfig }) = {
  BOW:     bow,
  HELMET:  helmet,
  MAIL:    mail,
  SHIELD:  shield2,
  SNAKE:   snake,
  SWORD:   sword,
  PLAYER:  player,
  ZOMBIE:  zombie
};

export { SpriteConfigs };
export type { SpriteConfig };

