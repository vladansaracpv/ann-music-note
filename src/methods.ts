/**
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *                 NOTE - STATIC METHODS                   *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 */
import { BaseBoolean, BaseFunctional, BaseMaths, BaseRelations, BaseTypings } from 'ann-music-base';

import {
  NoteName,
  NoteAccidental,
  NoteMidi,
  NoteFreq,
  NoteLetter,
  NoteOctave,
  NoteChroma,
  InitProps,
  NoteInit,
  NoteProp,
  InitMethods,
  Transposable,
  NoteComparableProp,
  NoteComparableFns,
  CurriedNoteDistance,
  CurriedNoteCompare,
  CurriedNoteTransposable,
} from './types';

import { A_440, A4_KEY, REGEX, SHARPS, FLATS, KEYS, WHITE_KEYS, BLACK_KEYS, EmptyNote } from './theory';

import { Note } from './properties';

const { both, either } = BaseBoolean;
const { curry } = BaseFunctional;
const { inc } = BaseMaths;
const { eq, geq, gt, inSegment, isNegative, isPositive, leq, lt, neq } = BaseRelations;
const { isInteger, isNumber, isObject } = BaseTypings;

export const Midi = {
  toFrequency: (midi: NoteMidi, tuning = A_440): NoteFreq => 2 ** ((midi - A4_KEY) / 12) * tuning,
  toOctaves: (midi: NoteMidi) => Math.floor(midi / 12),
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
  parse: (octave?: string): NoteOctave =>
    either(Number.parseInt(octave, 10), 4, isInteger(Number.parseInt(octave, 10))),
  toSemitones: (octave: number) => 12 * inc(octave),
};

export const Validators = {
  isChroma: (chroma: NoteChroma): boolean => both(isInteger(chroma), inSegment(0, 11, +chroma)),
  isFrequency: (freq: InitProps): freq is NoteFreq => isNumber(freq) && gt(freq, 0),
  isKey: (key: string): boolean => KEYS.includes(key),
  isMidi: (midi: InitProps): midi is NoteMidi => both(isInteger(midi), inSegment(0, 135, +midi)),
  isName: (name: InitProps): name is NoteName => REGEX.test(name as string) === true,
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

/**
 * Note builder
 * @param {InitProps} prop - note to construct
 * @param {InitMethods} methods - what methods to include? transpose | distance | compare
 * @return NoteProps with methods binded to it
 */
export function build(prop: NoteInit, methods: InitMethods = {}) {
  const note = Note(prop);

  if (!note.valid) return EmptyNote;

  const { transpose, distance, compare } = methods;

  // const transposeBy = transpose && Transpose.transposeBy(note);
  // const distanceTo = distance && Distance.distanceTo(note);
  // const compareBy = compare && Compare.compareBy(note);

  return {
    ...note,
    // distanceTo,
    // transposeBy,
    // ...compareBy,
  };
}

export const Transpose: CurriedNoteTransposable = curry(NoteTranspose);

export const Distance: CurriedNoteDistance = curry(NoteDistance);

export const Compare: CurriedNoteCompare = curry(NoteCompare);

function NoteTranspose(by: Transposable = { value: 1, prop: 'midi' }, note?: NoteInit) {
  const { value, prop } = by;
  const { midi, frequency, pc, octave } = Note(note);

  if (eq(prop, 'frequency')) return Note({ frequency: frequency + value });

  if (eq(prop, 'octave')) return Note({ name: pc + (octave + value) });

  return Note({ midi: midi + value });
}

function NoteDistance(note: NoteInit, other?: NoteInit, compare?: NoteComparableProp) {
  const n = Note(note);
  const o = Note(other);
  return (o[compare] - n[compare]) as number;
}

function NoteCompare(f: NoteComparableFns, note: NoteInit, other: NoteInit, compare: NoteComparableProp) {
  const CompareFn = { lt, leq, eq, neq, gt, geq };
  const fn = CompareFn[f];
  const first = Note(note);
  const second = Note(other);
  return fn(first[compare], second[compare]);
}
