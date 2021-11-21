import { randChoice } from '../utils/random';
import { transpose8vb } from './AudioUtils';
import SoundPlayer from './SoundPlayer';
import { Figure, Suite } from './types';

let PLAYER: SoundPlayer | null = null;

let ACTIVE_SUITE: Suite | null = null;

const TITLE_THEME: Figure = [[600,500],[300,250],[150,250],[900,500],[450,250],[300,250],[500,500],[300,250],[200,250],[200,500],[300,125],[600,125],[900,125],[1200,125],[1500,250]];
const GAME_OVER: Figure = [[400,150],[300,150],[238,150],[200,150],[300,160],[238,160],[200,160],[150,160],[238,200],[200,200],[150,240],[100,280],[75,1000]];

const _getMusicPlayer = () => new SoundPlayer(4, 0.12);

const playSuite = (suite: Suite) => {
  ACTIVE_SUITE = suite;
  const sections = Object.values(suite.sections);
  const numRepeats = 4;

  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    const bass = (!!section.bass) ? randChoice(section.bass) : null;
    let lead: Figure | null;
    if (!!section.lead) {
      do {
        lead = randChoice(section.lead);
      } while (lead === bass);
    }

    for (let j = 0; j < numRepeats; j++) {
      setTimeout(() => {
        if (suite === ACTIVE_SUITE) {
          const figures = [
            ...(!!bass ? [bass.map(transpose8vb)] : []),
            ...(!!lead ? [lead] : [])
          ];
          for (const figure of figures) {
            playFigure(figure);
          }
        }
      }, ((numRepeats * i) + j) * suite.length);
    }
  }

  setTimeout(
    () => {
      if (suite === ACTIVE_SUITE) {
        playSuite(suite);
      }
    },
    sections.length * suite.length * numRepeats
  );
};

const playMusic = (figures: Figure[]) => {
  const length = figures[0].map(sample => sample[1]).reduce((a, b) => a + b);
  for (const figure of figures) {
    playFigure(figure);
  }
  setTimeout(() => playMusic(figures), length);
};

const playFigure = (figure: Figure) => {
  if (!PLAYER) {
    PLAYER = _getMusicPlayer();
  }
  PLAYER.playSound(figure, false);
};

const stopMusic = () => {
  if (PLAYER) {
    PLAYER.stop();
  }
};

const stop = () => {
  stopMusic();
  ACTIVE_SUITE = null;
};

const loadMusic = async (filename: string): Promise<Figure[]> =>
  (await import(`../../../data/music/${filename}.json`)).default;

export default {
  TITLE_THEME,
  GAME_OVER,
  loadMusic,
  playFigure,
  playMusic,
  playSuite,
  stop
};
