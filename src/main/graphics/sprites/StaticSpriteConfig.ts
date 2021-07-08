import map_bow from '../../../../data/sprites/static/map_bow.json';
import map_helmet from '../../../../data/sprites/static/map_helmet.json';
import map_mail from '../../../../data/sprites/static/map_mail.json';
import map_potion from '../../../../data/sprites/static/map_potion.json';
import map_scroll from '../../../../data/sprites/static/map_scroll.json';
import map_sword from '../../../../data/sprites/static/map_sword.json';
import { Offsets } from './Sprite';

type StaticSpriteConfig = {
  name: string,
  filename: string,
  offsets: Offsets
}

const StaticSpriteConfig: Record<string, StaticSpriteConfig> = {
  map_bow,
  map_helmet,
  map_mail,
  map_potion,
  map_scroll,
  map_sword,
};

export default StaticSpriteConfig;

