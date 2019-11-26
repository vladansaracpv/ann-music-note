/**
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *                 NOTE - STATIC METHODS                   *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 */

import { BaseBoolean, BaseMaths, BaseRelations, BaseTypings } from 'ann-music-base';

import {
  NoteName,
  NoteAccidental,
  NoteMidi,
  NoteFreq,
  NoteLetter,
  NoteOctave,
  NoteChroma,
  NoteInit,
  NoteProp,
  NoteComparableFns,
} from './types';

import { A_440, A4_KEY, REGEX, SHARPS, FLATS, KEYS, WHITE_KEYS, BLACK_KEYS } from './theory';

import { Note } from './properties';

const { both, either } = BaseBoolean;
const { inc, sub, div } = BaseMaths;
const { eq, geq, gt, inSegment, isPositive, leq, lt, neq } = BaseRelations;
const { isInteger, isNumber } = BaseTypings;
const CompareFn = { lt, leq, eq, neq, gt, geq };

export const Midi = {
  toFrequency: (midi: NoteMidi, tuning = A_440): NoteFreq => 2 ** div(sub(midi, A4_KEY), 12) * tuning,
  toOctaves: (midi: NoteMidi) => Math.floor(midi / 12) - 1,
};

export const Frequency = {
  toMidi: (f: NoteFreq, tuning = A_440) => Math.ceil(12 * Math.log2(f / tuning) + A4_KEY),
};

export const Accidental = {
  toAlteration: (accidental: NoteAccidental) => accidental.length * (accidental[0] === 'b' ? -1 : 1),
};

export const Letter = {
  toIndex: (letter: NoteLetter) => SHARPS.indexOf(letter),
  toStep: (letter: NoteLetter) => (letter.charCodeAt(0) + 3) % 7,
};

export const Octave = {
  parse: (octave?: string): NoteOctave => (isInteger(Number.parseInt(octave, 10)) ? Number.parseInt(octave, 10) : 4),
  toSemitones: (octave: number) => 12 * inc(octave),
};

export const Validators = {
  isChroma: (chroma: NoteChroma): boolean => both(isInteger(chroma), inSegment(0, 11, +chroma)),
  isFrequency: (freq: any): freq is NoteFreq => isNumber(freq) && gt(freq, 0),
  isKey: (key: string): boolean => KEYS.includes(key),
  isMidi: (midi: any): midi is NoteMidi => both(isInteger(midi), inSegment(0, 135, +midi)),
  isName: (name: any): name is NoteName => REGEX.test(name as string) === true,
  isNote: (note: any): boolean => Note(note).valid,
};

export const Chroma = {
  isWhite(chroma: NoteChroma) {
    return WHITE_KEYS.includes(chroma);
  },
  isBlack(chroma: NoteChroma) {
    return BLACK_KEYS.includes(chroma);
  },
};

export const Transpose = {
  byMidi: (m: NoteMidi) => (note: NoteInit) => {
    const n = Note(note);
    return Note({ midi: n.midi + m });
  },
  byFrequency: (f: NoteFreq) => (note: NoteInit) => {
    const n = Note(note);
    return Note({ frequency: n.frequency + f });
  },
  byOctave: (o: NoteOctave) => (note: NoteInit) => {
    const n = Note(note);
    return Note({ name: n.pc + (n.octave + o) });
  },
};

export const Distance = {
  byMidi: (m: NoteMidi) => (note: NoteInit, other: NoteInit) => {
    const [n, o] = [Note(note), Note(other)];
    return o.midi - n.midi;
  },
  byFrequency: (f: NoteFreq) => (note: NoteInit, other: NoteInit) => {
    const [n, o] = [Note(note), Note(other)];
    return o.frequency - n.frequency;
  },
  byChroma: (c: NoteChroma) => (note: NoteInit, other: NoteInit) => {
    const [n, o] = [Note(note), Note(other)];
    return o.chroma - n.chroma;
  },
  byOctave: (o: NoteOctave) => (note: NoteInit, other: NoteInit) => {
    const [n, o] = [Note(note), Note(other)];
    return o.octave - n.octave;
  },
};

export const Compare = {
  byMidi: (fn: NoteComparableFns) => (note: NoteInit, other: NoteInit) => {
    const [n, o] = [Note(note), Note(other)];
    const f = CompareFn[fn];
    return f(n.midi, o.midi);
  },
  byFrequency: (fn: NoteComparableFns) => (note: NoteInit, other: NoteInit) => {
    const [n, o] = [Note(note), Note(other)];
    const f = CompareFn[fn];
    return f(n.frequency, o.frequency);
  },
  byChroma: (fn: NoteComparableFns) => (note: NoteInit, other: NoteInit) => {
    const [n, o] = [Note(note), Note(other)];
    const f = CompareFn[fn];
    return f(n.chroma, o.chroma);
  },
  byOctave: (fn: NoteComparableFns) => (note: NoteInit, other: NoteInit) => {
    const [n, o] = [Note(note), Note(other)];
    const f = CompareFn[fn];
    return f(n.octave, o.octave);
  },
};

export const property = (prop: NoteProp) => (note: NoteInit) => Note(note)[prop];

export function simplify(name: NoteName, keepAccidental = true): NoteName {
  const note = Note({ name });

  if (!note) return undefined;

  const { chroma, alteration, octave } = note;

  const isSharp = isPositive(alteration);

  const useSharps = isSharp === keepAccidental;

  /**
   * Use sharps if:
   * 1) It's already sharp && keepAccidental = true
   * 2) It's not sharp && keepAccidental = false (don't use given accidental)
   */
  const pc = either(SHARPS[chroma], FLATS[chroma], useSharps);

  return pc + octave;
}

export function enharmonic(note: NoteName): NoteName {
  return simplify(note, false);
}
