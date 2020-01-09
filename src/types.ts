/**
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *                  NOTE - INTERFACES                      *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 */

/**
 * Note name is made from letter + accidental? + octave
 */
export type NoteName = string;

/**
 * Set of characteds used for note naming
 */
export type NoteLetter = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';

/**
 * Note step represents index of NoteLetter.
 * It starts from 'C' at index 0
 */
export type NoteStep = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/**
 * Octave is integer value
 */
export type NoteOctave = number;

/**
 * Accidental can be '#', 'b', or natural - ''
 */
export type NoteAccidental = string;

/**
 * Alteration is numerical value of @NoteAccidental
 * Each '#' adds 1, and 'b' adds -1
 */
export type NoteAlteration = number;

/**
 * There are 12 different standard pitches in an octave.
 * Each at distance of 1 halfstep. C, C#, D, ...B
 */
export type NotePC = string;

/**
 * Chroma is numerical value of a NotePC.
 * Starting at 0: 'C', and ending at 11: 'B'
 */
export type NoteChroma = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;

/**
 * Midi value represents keyID in MIDI devices.
 * Conceptually, it is @NoteChroma accross octaves
 */
export type NoteMidi = number;

/**
 * Positive number representing tone frequency.
 * Human ear can differ frequencies from 20Hz-20KHz
 */
export type NoteFreq = number;

/**
 * Note duration value. Can be: 1, 2, 4, 8, 16, 32, 64
 */
export type NoteDuration = number;

/**
 * Every note property is of @NoteProp type
 */
export type NoteProp =
  | NoteName
  | NoteLetter
  | NoteStep
  | NoteOctave
  | NoteAccidental
  | NoteAlteration
  | NotePC
  | NoteChroma
  | NoteMidi
  | NoteFreq;

/**
 * Note object. Collection of note properties.
 * It extends @NoteMethods (optionals) export interface in case you want them
 */
export type NoteProps = Readonly<{
  name: NoteName;
  letter: NoteLetter;
  step: NoteStep;
  octave: NoteOctave;
  accidental: NoteAccidental;
  alteration: NoteAlteration;
  pc: NotePC;
  chroma: NoteChroma;
  midi: NoteMidi;
  frequency: NoteFreq;
  valid: boolean;
}>;

export type NoteComparableFns = 'lt' | 'leq' | 'eq' | 'neq' | 'gt' | 'geq';
export type NoteMetricProperty = 'midi' | 'frequency' | 'chroma' | 'octave';
export type NoteTransposableProperty = 'midi' | 'frequency';

export interface CurriedDistanceFn {
  (property: NoteMetricProperty): (note: NoteInit, other: NoteInit) => number;
  (property: NoteMetricProperty, note: NoteInit): (other: NoteInit) => number;
  (property: NoteMetricProperty, note: NoteInit, other: NoteInit): number;
}

export interface CurriedTransposeFn {
  (property: NoteTransposableProperty): (amount: number, note: NoteInit) => NoteProps;
  (property: NoteTransposableProperty, amount: number): (note: NoteInit) => NoteProps;
  (property: NoteTransposableProperty, amount: number, note: NoteInit): NoteProps;
}

export interface CurriedCompareFn {
  (fn: NoteComparableFns): (property: NoteMetricProperty, note: NoteInit, other: NoteInit) => boolean;
  (fn: NoteComparableFns, property: NoteMetricProperty): (note: NoteInit, other: NoteInit) => boolean;
  (fn: NoteComparableFns, property: NoteMetricProperty, note: NoteInit): (other: NoteInit) => boolean;
  (fn: NoteComparableFns, property: NoteMetricProperty, note: NoteInit, other: NoteInit): boolean;
}

/**
 * Note properties from which the Note object can be constructed
 */
export type NoteInit = Partial<{
  name?: NoteName;
  midi?: NoteMidi;
  frequency?: NoteFreq;
  sharps?: boolean;
  tuning?: number;
}>;

export interface NAccidental {
  type: string;
  value: number;
}
