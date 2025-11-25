import { z } from 'zod';

/** frequency (Hz), duration (ms) */
export const SampleSchema = z.array(z.number()).length(2);

export type Sample = z.infer<typeof SampleSchema>;

export const FigureSchema = z.array(SampleSchema);
export type Figure = z.infer<typeof FigureSchema>;

export const MusicModelSchema = z.object({
  id: z.string(),
  voices: z.array(FigureSchema)
});
export type MusicModel = z.infer<typeof MusicModelSchema>;

export const SoundEffectSchema = z.object({
  id: z.string(),
  samples: z.array(SampleSchema)
});
export type SoundEffect = z.infer<typeof SoundEffectSchema>;

export const SuiteSchema = z.object({
  length: z.number(),
  sections: z.record(
    z.string(),
    z.object({
      bass: z.array(FigureSchema).optional(),
      lead: z.array(FigureSchema).optional()
    })
  )
});

export type Suite = z.infer<typeof SuiteSchema>;
