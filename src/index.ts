import {
  BaseBoolean,
  BaseErrors,
  BaseFunctional,
  BaseMaths,
  BaseRelations,
  BaseStrings,
  BaseTypings,
} from 'ann-music-base';

const { both, either } = BaseBoolean;
const { CustomError } = BaseErrors;
const { curry } = BaseFunctional;
const { dec, inc } = BaseMaths;
const { eq, geq, gt, inSegment, isNegative, isPositive, leq, lt, neq } = BaseRelations;
const { capitalize, substitute, tokenize } = BaseStrings;
const { isInteger, isNumber, isObject } = BaseTypings;

const NoteError = CustomError('Note');

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

interface CurriedNoteTransposable {
  (by: Transposable, note: InitProp): number;
  (by: Transposable, note?: InitProp): (note: InitProp) => number;
}
interface CurriedNoteDistance {
  (note: InitProps, other: InitProps, compare: NoteComparableProp): number;
  (note: InitProps, other: InitProps): (compare: NoteComparableProp) => number;
  (note: InitProps): (other: InitProps, compare: NoteComparableProp) => number;
}
interface CurriedNoteCompare {
  (fn: NoteComparableFns, note: InitProps, other: InitProps, compare: NoteComparableProp): boolean;
  (fn: NoteComparableFns, note: InitProps, other: InitProps): (compare: NoteComparableProp) => boolean;
  (fn: NoteComparableFns, note: InitProps): (other: InitProps, compare: NoteComparableProp) => boolean;
  (fn: NoteComparableFns): (note: InitProps, other: InitProps, compare: NoteComparableProp) => boolean;
}

/**
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *                 NOTE - THEORY CONSTANTS                 *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 */
namespace Theory {
  /** Note keys */
  export const KEYS = [
    'name',
    'letter',
    'step',
    'octave',
    'accidental',
    'alteration',
    'pc',
    'chroma',
    'midi',
    'frequency',
    'color',
    'valid',
  ];

  /**
   * Standard tuning frequency (Tone A4) from which we derive other tones/frequencies
   */
  export const A_440 = 440.0;

  /**
   * Midi value of A4.
   * We can use this to find out all the other midi keys easily
   */
  export const A4_KEY = 69;

  /**
   * Default octave value used if no octave given
   */
  export const OCTAVE = 4;

  /**
   * Letters used for note naming.
   */
  export const LETTERS = 'CDEFGAB';

  /**
   * Accidental types for flat/sharp note
   */
  export const ACCIDENTALS = ['b', '#'];

  /**
   * All pitch (classes) in standard use
   */
  export const NOTES = 'C C# Db D D# Eb E F F# Gb G G# Ab A A# Bb B'.split(' ');

  /**
   * Function to extract note types from @NOTES
   * @param {NoteAccidental} accidental
   */
  export const notes = (accidental: NoteAccidental) => NOTES.filter(note => accidental.includes(note[1] || ' '));

  /**
   * 12 standard pitch classes with # used for black keys
   * => [C, C#, D, D#, E, F#, G, G#, A, A#, B]
   */
  export const SHARPS = notes('# ');

  /**
   * 12 standard pitch classes with b used for black keys
   * => [C, Db, D, Eb, E, Gb, G, Ab, A, Bb, B]
   */
  export const FLATS = notes('b ');

  /**
   * Only the white keys (natural notes)
   * => [C, D, E, F, G, A, B]
   */
  export const NATURAL = notes(' ');

  /**
   * Only black keys (sharps)
   * => [C#, D#, F#, G#, A#]
   */
  export const SHARP = notes('#');

  /**
   * Only black keys (flats)
   * => [Db, Eb, Gb, Ab, Bb]
   */
  export const FLAT = notes('b');

  /**
   * Indexes of white keys in 12-note octave
   */
  export const WHITE_KEYS = [0, 2, 4, 5, 7, 9, 11];

  /**
   * Indexes of black keys in 12-note octave
   */
  export const BLACK_KEYS = [1, 3, 4, 8, 10];

  /**
   * Regular expression used to tokenize @NoteName
   * It returns {letter, accidental, octave, duration and "rest"}
   *
   * Groups:
   * 1) Capturing @NoteLetter
   *    (?<Tletter>[a-gA-G])
   *
   * 2) @NoteAccidental - On or more (exclusively) #, b or x (= ##)
   *    (?<Taccidental>#{1,}|b{1,}|x{1,}|)
   *
   * 3) Optional number for octave. Default is @OCTAVE
   *    (?<Toct>-?\d*)
   *
   * 4) Optional note duration value @NoteDuration
   *    (?<Tduration>(\/(1|2|4|8|16|32|64))?)
   *
   * 5) Collecting whitespace and part not being parsed (can be used to check for errors)
   *    \s*(?<Trest>.*)
   */
  export const REGEX = /^(?<Tletter>[a-gA-G])(?<Taccidental>#{1,}|b{1,}|x{1,}|)(?<Toct>-?\d*)(?<Tduration>(\/(1|2|4|8|16|32|64))?)\s*(?<Trest>.*)$/;

  export const EmptyNote: NoNote = {
    name: '',
    valid: false,
  };
}

/**
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *                 NOTE - STATIC METHODS                   *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 */
namespace Static {
  const { A_440, A4_KEY, REGEX, SHARPS, FLATS } = Theory;

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
    isKey: (key: string): boolean => Theory.KEYS.includes(key),
    isMidi: (midi: InitProps): midi is NoteMidi => both(isInteger(midi), inSegment(0, 135, +midi)),
    isName: (name: InitProps): name is NoteName => REGEX.test(name as string) === true,
    isNote: (note: any): boolean => Note(note).valid,
  };

  export const Chroma = {
    isWhite(chroma: NoteChroma) {
      return Theory.WHITE_KEYS.includes(chroma);
    },
    isBlack(chroma: NoteChroma) {
      return Theory.BLACK_KEYS.includes(chroma);
    },
  };

  export const property = (prop: NoteProp) => (note: InitProps) => Note(note)[prop];

  export function simplify(name: NoteName, keepAccidental = true): NoteName {
    const note = Note(name);

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
  export function build(prop: InitProps, methods: InitMethods = {}) {
    const note = Note(prop);

    if (!note.valid) return Theory.EmptyNote;

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

  function NoteTranspose(by: Transposable = { value: 1, prop: 'midi' }, note?: InitProp) {
    const { value, prop } = by;
    const { midi, frequency, pc, octave } = Note(note);

    if (eq(prop, 'frequency')) return Note(frequency + value, 'freq');

    if (eq(prop, 'octave')) return Note(pc + (octave + value));

    return Note(midi + value, 'midi');
  }

  function NoteDistance(note: InitProps, other?: InitProps, compare?: NoteComparableProp) {
    const n = Note(note);
    const o = Note(other);
    return (o[compare] - n[compare]) as number;
  }

  function NoteCompare(f: NoteComparableFns, note: InitProps, other: InitProps, compare: NoteComparableProp) {
    const CompareFn = { lt, leq, eq, neq, gt, geq };
    const fn = CompareFn[f];
    const first = Note(note);
    const second = Note(other);
    return fn(first[compare], second[compare]);
  }
}

export const NOTE = {
  ...Theory,
  ...Static,
};

/**
 * Note factory function
 * @param {InitProps} src
 * @param {'midi'|'freq'} midiOrFreq
 * @return {NoteProps}
 */
export type MidiOrFreq = 'midi' | 'freq';
export function Note(src: InitProps, midiOrFreq: MidiOrFreq = 'midi', sharps = true): NoteProps {
  const { isName, isMidi, isFrequency } = NOTE.Validators;

  if (isObject(src) && isName(src.name)) return src;

  const { toIndex, toStep } = NOTE.Letter;
  const { toAlteration } = NOTE.Accidental;
  const { toSemitones, parse } = NOTE.Octave;
  const { toFrequency, toOctaves } = NOTE.Midi;
  const { toMidi } = NOTE.Frequency;
  const { isWhite } = NOTE.Chroma;
  const { EmptyNote, SHARPS, FLATS, REGEX } = Theory;

  function fromName(note: NoteName): NoteProps {
    const { Tletter, Taccidental, Toct, Trest } = {
      Tletter: '',
      Taccidental: '',
      Toct: '',
      Trest: '',
      ...tokenize(note, REGEX),
    };

    if (Trest || !Tletter) {
      return NoteError('InvalidConstructor', note, EmptyNote);
    }

    const letter = capitalize(Tletter) as NoteLetter;
    const step = toStep(letter) as NoteStep;

    const accidental = substitute(Taccidental, /x/g, '##') as NoteAccidental;
    const alteration = toAlteration(accidental) as NoteAlteration;

    // Offset (number of keys) from first letter - C
    const offset = toIndex(letter);

    // Note position is calculated as: letter offset from the start + in place alteration
    const semitonesAltered = offset + alteration;

    // Because of the alteration, note can slip into the previous/next octave
    const octavesAltered = Math.floor(semitonesAltered / 12);

    const octave = (parse(Toct) + octavesAltered) as NoteOctave;

    const pc: NotePC = `${letter}${accidental}`;

    /**
     *  @example
     *  Chroma of Cb != 0. Enharmonic note for Cb == B so the chroma == 11
     *  altered == -1
     *  alteredOct == -1
     */
    const chroma = either(
      (semitonesAltered - toSemitones(octavesAltered) + 12) % 12,
      semitonesAltered % 12,
      isNegative(octavesAltered),
    ) as NoteChroma;

    const midi = (toSemitones(octave) + chroma) as NoteMidi;

    const frequency = toFrequency(midi) as NoteFreq;

    const name = `${pc}${octave}` as NoteName;

    const color: NoteColor = isWhite(chroma) ? 'white' : 'black';

    const valid = true;

    return {
      letter,
      step,
      accidental,
      alteration,
      pc,
      chroma,
      name,
      octave,
      midi,
      frequency,
      color,
      valid,
    };
  }

  function fromMidi(midi: NoteMidi, useSharps = sharps): NoteProps {
    const octave = dec(toOctaves(midi)) as NoteOctave;

    const chroma = (midi % 12) as NoteChroma;
    const pc = either(SHARPS[chroma], FLATS[chroma], useSharps) as NotePC;

    const name = `${pc}${octave}` as NoteName;

    return fromName(name);
  }

  function fromFrequency(frequency: NoteFreq, tuning = Theory.A_440): NoteProps {
    const midi = toMidi(frequency, tuning);
    return fromMidi(midi);
  }

  if (isName(src)) return fromName(src);
  if (isMidi(src) && midiOrFreq === 'midi') return fromMidi(src) as NoteProps;
  if (isFrequency(src)) return fromFrequency(src) as NoteProps;

  // return EmptyNote as NoteProps;
  return NoteError('InvalidConstructor', src, EmptyNote);
}
