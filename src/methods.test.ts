import { Midi, Frequency, Accidental, Letter, Octave, Validators, Chroma, property, simplify, enharmonic } from './methods';

describe('\n ** NOTE STATIC METHODS **', () => {
  describe("\n 1. Midi:", () => {
    const { toFrequency, toOctaves } = Midi;
    describe("\n - toFrequency(midi: NoteMidi, tuning = A_440) \n", () => {
      test("toFrequency(69) is equal to: 440 ", () => {
        expect(toFrequency(69)).toBe(440);
      });
    });

    describe("\n - toOctaves: (midi: NoteMidi) \n", () => {
      test("toOctaves(69) is equal to: 4 ", () => {
        expect(toOctaves(69)).toBe(4);
      });
    });
  })


});