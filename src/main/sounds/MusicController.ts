import { transpose8vb } from '@lib/audio/AudioUtils';
import SoundPlayer from '@lib/audio/SoundPlayer';
import { Figure, Suite } from '@lib/audio/types';
import { randChoice } from '@lib/utils/random';
import { Globals } from '@main/core/globals';

export default class MusicController {
  private activeMusic: Suite | Figure[] | null = null;

  constructor(private readonly soundPlayer: SoundPlayer) {}

  playSuite = (suite: Suite) => {
    this.activeMusic = suite;
    const sections = Object.values(suite.sections);
    const numRepeats = 4;

    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];
      const bass = section.bass ? randChoice(section.bass) : null;
      let lead: Figure | null;
      if (section.lead) {
        do {
          lead = randChoice(section.lead);
        } while (lead === bass);
      }

      for (let j = 0; j < numRepeats; j++) {
        setTimeout(
          () => {
            if (this.activeMusic === suite) {
              const figures = [
                ...(bass ? [bass.map(transpose8vb)] : []),
                ...(lead ? [lead] : [])
              ];
              for (const figure of figures) {
                this.playFigure(figure);
              }
            }
          },
          (numRepeats * i + j) * suite.length
        );
      }
    }

    setTimeout(
      () => {
        if (this.activeMusic === suite) {
          this.playSuite(suite);
        }
      },
      sections.length * suite.length * numRepeats
    );
  };

  playMusic = (figures: Figure[]) => {
    this.activeMusic = figures;
    const length = figures[0].map(sample => sample[1]).reduce((a, b) => a + b);
    for (const figure of figures) {
      this.playFigure(figure);
    }

    setTimeout(() => {
      if (this.activeMusic === figures) {
        this.playMusic(figures);
      }
    }, length);
  };

  playFigure = (figure: Figure) => {
    this.soundPlayer.playSound(figure, false);
  };

  stopMusic = () => {
    this.soundPlayer.stop();
  };

  stop = () => {
    this.soundPlayer.stop();
    this.activeMusic = null;
  };

  loadMusic = async (filename: string): Promise<Figure[]> => {
    const { assetLoader } = Globals;
    return assetLoader.loadDataAsset(`music/${filename}.json`);
  };
}
