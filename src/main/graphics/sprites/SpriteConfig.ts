import player from '../../../../data/sprites/player.json';
import zombie from '../../../../data/sprites/zombie.json';
import bow from '../../../../data/sprites/bow.json';
import mail from '../../../../data/sprites/mail.json';
import shield2 from '../../../../data/sprites/shield2.json';
import snake from '../../../../data/sprites/snake.json';
import sword from '../../../../data/sprites/sword.json';

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

const SpriteConfigs: ({ [name: string]: SpriteConfig }) = {
  BOW:     bow,
  MAIL:    mail,
  SHIELD:  shield2,
  SNAKE:   snake,
  SWORD:   sword,
  PLAYER:  player,
  ZOMBIE:  zombie
};

console.log(SpriteConfigs);

export { SpriteConfigs };
export type { SpriteConfig };

