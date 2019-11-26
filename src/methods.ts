/**
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *                 NOTE - STATIC METHODS                   *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 */

import { BaseBoolean, BaseMaths, BaseRelations, BaseFunctional, BaseTypings } from 'ann-music-base';

import { Note } from './properties';
import { A4_KEY, A_440, BLACK_KEYS, FLATS, KEYS, REGEX, SHARPS, WHITE_KEYS } from './theory';
import {
  NoteProps,
  NoteAccidental,
  NoteChroma,
  NoteComparableFns,
  NoteFreq,
  NoteInit,
  NoteLetter,
  NoteMidi,
  NoteName,
  NoteOctave,
  NoteProp,
  NoteTransposableProperty,
  NoteMetricProperty,
  CurriedTransposeFn,
  CurriedDistanceFn,
  CurriedCompareFn,
} from './types';

const { both, either } = BaseBoolean;
const { inc, sub, div } = BaseMaths;
const { eq, geq, gt, inSegment, isPositive, leq, lt, neq } = BaseRelations;
const { isInteger, isNumber } = BaseTypings;
const { curry } = BaseFunctional;
const CompareFns = { lt, leq, eq, neq, gt, geq };

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

function TransposeFn(property: NoteTransposableProperty, amount: number, note: NoteInit): NoteProps {
  const n = Note(note);
  return Note({ [property]: n[property] + amount });
}

function DistanceFn(property: NoteMetricProperty, note: NoteInit, other: NoteInit): number {
  const [n, o] = [Note(note), Note(other)];
  return o[property] - n[property];
}

function CompareFn(fn: NoteComparableFns, property: NoteMetricProperty, note: NoteInit, other: NoteInit): boolean {
  const [n, o] = [Note(note), Note(other)];
  const f = CompareFns[fn];
  return f(n[property], o[property]);
}

export const Transpose: CurriedTransposeFn = curry(TransposeFn);
export const Distance: CurriedDistanceFn = curry(DistanceFn);
export const Compare: CurriedCompareFn = curry(CompareFn);

export const property = (prop: NoteProp) => (note: NoteInit) => Note(note)[prop];

export function simplify(name: NoteName, keepAccidental = true): NoteName {
  const note = Note({ name });

  if (!note) return undefined;

  const { chroma, alteration, octave } = note;

  const isSharp = isPositive(alteration);

  const useSharps = isSharp === keepAccidental;

  const pc = either(SHARPS[chroma], FLATS[chroma], useSharps);

  return pc + octave;
}

export function enharmonic(note: NoteName): NoteName {
  return simplify(note, false);
}
