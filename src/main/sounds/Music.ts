import { randChoice } from '../utils/random';
import { transpose8vb } from './AudioUtils';
import SoundPlayer from './SoundPlayer';
import { Figure, Suite } from './types';

let PLAYER: SoundPlayer | null = null;

let ACTIVE_MUSIC: Suite | Figure[] | null = null;

const _getMusicPlayer = () => new SoundPlayer(4, 0.12);

const playSuite = (suite: Suite) => {
  ACTIVE_MUSIC = suite;
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
        if (ACTIVE_MUSIC === suite) {
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
      if (ACTIVE_MUSIC === suite) {
        playSuite(suite);
      }
    },
    sections.length * suite.length * numRepeats
  );
};

const playMusic = (figures: Figure[]) => {
  ACTIVE_MUSIC = figures;
  const length = figures[0].map(sample => sample[1]).reduce((a, b) => a + b);
  for (const figure of figures) {
    playFigure(figure);
  }

  setTimeout(() => {
    if (ACTIVE_MUSIC === figures) {
      playMusic(figures);
    }
  }, length);
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
  ACTIVE_MUSIC = null;
};

const loadMusic = async (filename: string): Promise<Figure[]> =>
  (await import(
    /* webpackMode: "lazy-once" */
    /* webpackChunkName: "model" */
    `../../../data/music/${filename}.json`
  )).default;

export default {
  loadMusic,
  playFigure,
  playMusic,
  playSuite,
  stop
};
