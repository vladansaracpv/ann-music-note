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
 * Piano key color - black / white
 */
export type NoteColor = string;

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
  | NoteFreq
  | NoteColor;

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
  color: NoteColor;
  valid: boolean;
}>;

// const a = {
//   name: 'A#4',
//   octave: 4,
//   tone: {
//     letter: 'A',
//     step: 5,
//   },
//   accidental: {
//     type: '#',
//     value: 1,
//   },
//   pc: {
//     type: 'A#',
//     value: 10,
//   },
//   midi: 70,
//   frequency: 466.164,
//   color: 'black',
//   valid: true,
// };

/**
 * Note properties from which the Note object can be constructed
 */

export type InitProp = NoteName | NoteMidi | NoteFreq;

export type InitProps = InitProp | NoteProps;

export interface NoNote extends Partial<NoteProps> {
  readonly valid: false;
  readonly name: '';
}

/**
 * Note comparison types
 */
export type NoteComparableProp = 'midi' | 'frequency' | 'chroma' | 'step' | 'octave';
export type NoteComparableFns = 'lt' | 'leq' | 'eq' | 'neq' | 'gt' | 'geq';

export type NoteCompareFn = (note: InitProps, other: InitProps, compare?: NoteComparableProp) => boolean | number;
export type NoteCompareTo = (other: InitProps, compare?: NoteComparableProp) => boolean | number;

export type NoteCompareFns = Record<NoteComparableFns, NoteCompareFn>;
export type NoteCompareToFns = Record<NoteComparableFns, NoteCompareTo>;

/**
 * Note transposition types
 */
export type NoteTransposableProp = 'midi' | 'frequency' | 'octave';
export type NoteTransposableFns = 'transpose';

export type NoteTransposeFn = (note: NoteProps, by: number, key?: NoteTransposableProp) => NoteProps;
export type NoteTransposeBy = (by: number, key?: NoteTransposableProp) => NoteProps;

export type NoteTransposeFns = Record<NoteTransposableFns, NoteTransposeFn>;
export type NoteTransposeByFns = Record<NoteTransposableFns, NoteTransposeBy>;

/**
 * Note distance types
 */
export type NoteDistProp = 'midi' | 'frequency' | 'chroma' | 'step';
export type NoteDistFns = 'distance';

export type NoteDistanceFn = (note: NoteProps, other: NoteProps, compare?: NoteDistProp) => number;
export type NoteDistanceTo = (other: InitProps, compare?: NoteDistProp) => number;

export type NoteDistanceFns = Record<NoteDistFns, NoteDistanceFn>;
export type NoteDistanceToFns = Record<NoteDistFns, NoteDistanceTo>;

export interface InitMethods {
  transpose?: boolean;
  distance?: boolean;
  compare?: boolean;
}

export interface Transposable {
  value: number;
  prop?: NoteTransposableProp;
}

export interface CurriedNoteTransposable {
  (by: Transposable, note: InitProp): number;
  (by: Transposable, note?: InitProp): (note: InitProp) => number;
}
export interface CurriedNoteDistance {
  (note: InitProps, other: InitProps, compare: NoteComparableProp): number;
  (note: InitProps, other: InitProps): (compare: NoteComparableProp) => number;
  (note: InitProps): (other: InitProps, compare: NoteComparableProp) => number;
}
export interface CurriedNoteCompare {
  (fn: NoteComparableFns, note: InitProps, other: InitProps, compare: NoteComparableProp): boolean;
  (fn: NoteComparableFns, note: InitProps, other: InitProps): (compare: NoteComparableProp) => boolean;
  (fn: NoteComparableFns, note: InitProps): (other: InitProps, compare: NoteComparableProp) => boolean;
  (fn: NoteComparableFns): (note: InitProps, other: InitProps, compare: NoteComparableProp) => boolean;
}

export type NoteInit = Partial<{
  name?: NoteName;
  midi?: NoteMidi;
  frequency?: NoteFreq;
  sharps?: boolean;
  tuning?: number;
}>;
