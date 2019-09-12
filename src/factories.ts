import * as Theory from "./theory";
import {
  ErrorBase,
  MathBase,
  TypeCheckBase,
  RelationsBase,
  BooleanBase,
  StringsBase,
  LogicalBase
} from "ann-music-base";

/**
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *                  NOTE - INTERFACES                      *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 */

/**
 * Note name is made from letter + accidental? + octave
 */
type NoteName = string;

/**
 * Set of characteds used for note naming
 */
type NoteLetter = "A" | "B" | "C" | "D" | "E" | "F" | "G";

/**
 * Note step represents index of NoteLetter.
 * It starts from 'C' at index 0
 */
type NoteStep = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/**
 * Octave is integer value
 */
type NoteOctave = number;

/**
 * Accidental can be '#', 'b', or natural - '' */
type NoteAccidental = string;

/**
 * Alteration is numerical value of @NoteAccidental
 * Each '#' adds 1, and 'b' adds -1
 */
type NoteAlteration = number;

/**
 * There are 12 different standard pitches in an octave.
 * Each at distance of 1 halfstep. C, C#, D, ...B
 */
type NotePC = string;

/**
 * Chroma is numerical value of a NotePC.
 * Starting at 0: 'C', and ending at 11: 'B'
 */
type NoteChroma = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;

/**
 * Midi value represents keyID in MIDI devices.
 * Conceptually, it is @NoteChroma accross octaves
 */
type NoteMidi = number;

/**
 * Positive number representing tone frequency.
 * Human ear can differ frequencies from 20Hz-20KHz
 */
type NoteFreq = number;

/**
 * Piano key color - black / white
 */
type NoteColor = string;

/**
 * Note duration value. Can be: 1, 2, 4, 8, 16, 32, 64
 */
type NoteDuration = number;

/**
 * Note object. Collection of note properties.
 * It extends @NoteMethods (optionals) interface in case you want them
 */
export interface NoteProps {
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
}

interface NoNote extends Partial<NoteProps> {
  readonly valid: false;
  readonly name: "";
}

/**
 * Every note property is of @NoteProp type
 */
type NoteProp =
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
 * Comparable properties are those that can be used for comparing and other operations
 */
type NoteComparable = "midi" | "frequency" | "chroma" | "step" | "octave";

type NoteTransposable = "midi" | "frequency" | "octave";

/**
 * Comparable function type has @note and @other (note) to compare and param @compare to represent property on which to compare
 */
type NoteCompareFn = (
  note: NoteProps,
  other: NoteProps,
  compare?: NoteComparable
) => boolean | number;

type NoteComparePartialFn = (
  other: NoteProps,
  compare?: NoteComparable
) => boolean | number;
/**
 * Note comparison type represents record of comparison functions
 */
type NoteComparison = Record<string, NoteCompareFn>;

type NoteComparisonPartial = Record<string, NoteComparePartialFn>;

/**
 * Note properties from which the Note object can be constructed
 */
type InitProps = Partial<{
  name: NoteName;
  midi: NoteMidi;
  frequency: NoteFreq;
}>;

/**
 * Generic interface for distance fn params. It is an object with 3 properties:
 * @param {T} from
 * @param {T} to
 * @param {U} comparable property
 *
 */
interface DistanceFnParams<T, U> {
  from: T;
  to: T;
  comparable?: U;
}

/**
 * Generic Distance fn type.
 * @param {T} params
 * @return {number}
 */
type DistanceFn<T> = (params: T) => number;

/**
 * Generic comparable fn
 * @param {T} type of fn parameters that will be compared
 * @param {U} return type of comparison. Can be boolean, number, string, etc
 * @return {U}
 */
type ComparableFn<T, U> = (a: T, b?: T) => U;

/**
 * Generic transposable fn
 * @param {T} first argument type. One that will be transposed
 * @param {U} second argument type. One used for transposition
 * @return {U} returns transposed value
 */
type TransposableFn<T, U> = (a: T, b?: U) => U;

interface Named {
  readonly name: string;
}

/**
 * Applied generic to Note
 * @param {NoteName} from
 * @param {NoteName} to
 * @param {NoteComparable} comparable
 */
type NoteDistanceFnParams = DistanceFnParams<NoteName, NoteComparable>;

/**
 * Applied generic type of DistanceFn<T> for Note
 * @param {NoteDistanceFnParams} params
 * @return {number}
 */
type NoteDistanceFn = DistanceFn<NoteDistanceFnParams>;

interface NoteBuilderProps {
  distance?: boolean;
  transpose?: boolean;
  compare?: boolean;
}

const CustomError = ErrorBase.CustomError;
const { inc, dec } = MathBase;

const { isInteger, isNumber } = TypeCheckBase;

const NoteError = CustomError("Note");

const EmptyNote: NoteProps = {
  name: "",
  letter: "C",
  step: 0,
  octave: -1,
  accidental: "",
  alteration: 0,
  pc: "",
  chroma: 0,
  midi: -1,
  frequency: -1,
  color: "",
  valid: false
};
const { lt, leq, eq, neq, gt, geq, cmp, isNegative, inSegment } = RelationsBase;
const { tokenize, capitalize, substitute } = StringsBase;
const { either } = BooleanBase;
const { and2: both } = LogicalBase;

/**
 * Generate Note static methods
 */
function GenerateNoteStaticMethods() {
  const Midi = {
    toFrequency: function(key: NoteMidi, tuning = Theory.A_440): NoteFreq {
      return tuning * 2 ** ((key - Theory.MIDDLE_KEY) / Theory.OCTAVE_RANGE);
    },
    toOctaves: function(key: NoteMidi) {
      return Math.floor(key / Theory.OCTAVE_RANGE);
    }
  };

  const Frequency = {
    toMidi: function(freq: NoteFreq, tuning = Theory.A_440) {
      return Math.ceil(
        Theory.OCTAVE_RANGE * Math.log2(freq / tuning) + Theory.MIDDLE_KEY
      );
    }
  };

  const Accidental = {
    toAlteration: function(accidental: NoteAccidental): number {
      return accidental.length * (accidental[0] === "b" ? -1 : 1);
    }
  };

  const Letter = {
    toStep: function(letter: NoteLetter): number {
      return (letter.charCodeAt(0) + 3) % 7;
    },
    toIndex: function(letter: NoteLetter) {
      return Theory.SHARPS.indexOf(letter);
    }
  };

  const Octave = {
    parse: function(octave?: string): NoteOctave {
      return either(
        Number.parseInt(octave || ""),
        Theory.STANDARD_OCTAVE,
        Number.isInteger(Number.parseInt(octave || ""))
      );
    },
    toSemitones: function(octave: number) {
      return Theory.OCTAVE_RANGE * inc(octave);
    }
  };

  const Validators = {
    isName: (name: string): boolean => Theory.NOTE_REGEX.test(name) === true,
    isMidi: (midi: number): boolean =>
      both(isInteger(midi), inSegment(0, 135, midi)),
    isChroma: (chroma: number): boolean =>
      both(isInteger(chroma), inSegment(0, 11, chroma)),
    isFrequency: (freq: number): boolean => both(isNumber(freq), gt(freq, 0)),
    isKey: (key: string): boolean => Theory.KEYS.includes(key)
  };

  const property = (prop = "name") => (note: InitProps): any => {
    const _note = Note(note);
    return _note["name"];
  };

  function simplify(name: NoteName, keepAccidental = true): NoteName {
    const note = Note({ name });

    if (!note) return "";

    const { chroma, alteration, octave } = note;

    const isSharp = alteration >= 0;

    /**
     * Use sharps if:
     * 1) It's already sharp && keepAccidental = true
     * 2) It's not sharp && keepAccidental = false (don't use given accidental)
     */
    const useSharps = isSharp == keepAccidental;

    const pc = either(Theory.SHARPS[chroma], Theory.FLATS[chroma], useSharps);

    return pc + octave;
  }

  function enharmonic(note: NoteName): NoteName {
    return simplify(note, false);
  }

  function transpose(b: NoteProps, n: number) {
    return Note({ midi: b.midi + n });
  }

  function distance(
    note: NoteProps,
    other: NoteProps,
    compare: NoteComparable
  ) {
    return other[compare] - note[compare];
  }

  const compare: NoteComparison = {
    lt: (note, other, compare = "midi") => lt(note[compare], other[compare]),
    leq: (note, other, compare = "midi") => leq(note[compare], other[compare]),
    eq: (note, other, compare = "midi") => eq(note[compare], other[compare]),
    neq: (note, other, compare = "midi") => neq(note[compare], other[compare]),
    gt: (note, other, compare = "midi") => gt(note[compare], other[compare]),
    geq: (note, other, compare = "midi") => geq(note[compare], other[compare]),
    cmp: (note, other, compare = "midi") => cmp(note[compare], other[compare])
  };

  return {
    Midi,
    Frequency,
    Accidental,
    Letter,
    Octave,
    Validators,
    property,
    simplify,
    enharmonic,
    transpose,
    distance,
    compare
  };
}

export const NOTE = {
  Theory,
  withMethods: NoteBuilder,
  ...GenerateNoteStaticMethods()
};

/**
 * Note factory function
 * @param {InitProps} props
 * @return {NoteProps}
 */
export function Note(props: InitProps): NoteProps {
  const { name, midi, frequency } = props;
  const { isName, isMidi, isFrequency } = NOTE.Validators;
  const { toIndex, toStep } = NOTE.Letter;
  const { toAlteration } = NOTE.Accidental;
  const { toSemitones, parse } = NOTE.Octave;
  const { toFrequency, toOctaves } = NOTE.Midi;
  const { toMidi } = NOTE.Frequency;

  function fromName(note: NoteName): NoteProps {
    // Example: A#4

    if (!isName(note))
      return NoteError("InvalidConstructor", note, EmptyNote) as NoteProps;
    const tokens = {
      ...{
        Tletter: "",
        Taccidental: "",
        Toct: "4",
        Trest: ""
      },
      ...tokenize(note, Theory.NOTE_REGEX)
    };

    const { Tletter, Taccidental, Toct, Trest } = tokens;

    if (Trest)
      return NoteError("InvalidConstructor", note, EmptyNote) as NoteProps;

    const letter = capitalize(Tletter) as NoteLetter; // A
    const step = toStep(letter) as NoteStep; // 5

    const accidental = substitute(Taccidental, /x/g, "##") as NoteAccidental; // #
    const alteration = toAlteration(accidental) as NoteAlteration; // +1

    /** Offset (number of keys) from first letter - C **/
    const offset = toIndex(letter); // 10

    /** Note position is calculated as: letter offset from the start + in place alteration **/
    const semitonesAltered = offset + alteration; // 11

    /** Because of the alteration, note can slip into the previous/next octave **/
    const octavesAltered = Math.floor(semitonesAltered / Theory.OCTAVE_RANGE); // 0
    const octave = parse(Toct) as NoteOctave; // 4

    const pc = (letter + accidental) as NotePC; // A#

    /**
     *  @example
     *  Chroma of Cb != 0. Enharmonic note for Cb == B so the chroma == 11
     *  altered == -1
     *  alteredOct == -1
     */
    const chroma = either(
      (semitonesAltered - toSemitones(octavesAltered) + 12) %
        Theory.OCTAVE_RANGE,
      semitonesAltered % Theory.OCTAVE_RANGE,
      isNegative(octavesAltered)
    ) as NoteChroma; // 10

    const midi = (toSemitones(octave + octavesAltered) + chroma) as NoteMidi; // 70
    const frequency = toFrequency(midi) as NoteFreq; // 466.164

    const name = (pc + octave) as NoteName; // A#4

    const color = either(
      "white",
      "black",
      Theory.WHITE_KEYS.includes(chroma)
    ) as NoteColor; // 'black'

    const valid = true;

    return Object.freeze({
      name,
      letter,
      step,
      accidental,
      alteration,
      octave,
      pc,
      chroma,
      midi,
      frequency,
      color,
      valid
    });
  }

  function fromMidi(midi: NoteMidi, useSharps = true): NoteProps {
    if (!isMidi(midi))
      return NoteError("InvalidConstructor", "" + midi, EmptyNote) as NoteProps;
    const frequency = toFrequency(midi) as NoteFreq;
    const octave = dec(toOctaves(midi)) as NoteOctave;

    const chroma = (midi - toSemitones(octave)) as NoteChroma;
    const pc = either(
      Theory.SHARPS[chroma],
      Theory.FLATS[chroma],
      useSharps
    ) as NotePC;

    const name = (pc + octave) as NoteName;

    const tokens = {
      ...{
        Tletter: "",
        Taccidental: "",
        Toct: "4",
        Trest: ""
      },
      ...tokenize(name, Theory.NOTE_REGEX)
    };

    const { Tletter, Taccidental, Toct, Trest } = tokens;

    // const { Tletter, Taccidental } = tokenize(name, Theory.NOTE_REGEX);

    const letter = capitalize(Tletter) as NoteLetter;
    const step = toStep(letter) as NoteStep;

    const accidental = substitute(Taccidental, /x/g, "##") as NoteAccidental;
    const alteration = toAlteration(accidental) as NoteAlteration;

    const color = either(
      "white",
      "black",
      Theory.WHITE_KEYS.includes(chroma)
    ) as NoteColor;

    const valid = true;

    return Object.freeze({
      name,
      letter,
      step,
      accidental,
      alteration,
      octave,
      pc,
      chroma,
      midi,
      frequency,
      color,
      valid
    });
  }

  function fromFrequency(
    frequency: NoteFreq,
    tuning = Theory.A_440
  ): NoteProps {
    if (!isFrequency(frequency))
      return NoteError("InvalidConstructor", "greska", EmptyNote) as NoteProps;

    const midi = toMidi(frequency, tuning);
    return fromMidi(midi);
  }

  return isName(name || "")
    ? fromName(name || "")
    : isMidi(midi || -1)
    ? fromMidi(midi || -1, true)
    : isFrequency(frequency || -1)
    ? fromFrequency(frequency || -1, 440)
    : EmptyNote;
}

/**
 * Note object builder. Used to assign methods beside note properties
 * @param {NoteBuilderProps} initProps
 * @param {InitProps} from
 */
function NoteBuilder(initProps: NoteBuilderProps, from: InitProps) {
  const { distance, transpose, compare } = initProps;

  const note = Note(from);

  const transposeFns = {
    transpose: (n: number) => NOTE.transpose(note, n)
  };

  const distanceFns: NoteComparisonPartial = {
    distance: (other, comparable = "midi") =>
      NOTE.distance(note, other, comparable)
  };

  const partialCompare = (fn: NoteCompareFn): NoteComparePartialFn => (
    other,
    compare = "midi"
  ) => fn(note, other, compare);

  const compareFns: NoteComparisonPartial = {
    lt: partialCompare(NOTE.compare.lt),
    leq: partialCompare(NOTE.compare.leq),
    eq: partialCompare(NOTE.compare.eq),
    neq: partialCompare(NOTE.compare.neq),
    gt: partialCompare(NOTE.compare.gt),
    geq: partialCompare(NOTE.compare.geq),
    cmp: partialCompare(NOTE.compare.cmp)
  };

  const withTranspose = transpose ? transposeFns : {};

  const withDistance = distance ? distanceFns : {};

  const withCompare = compare ? compareFns : {};

  return {
    ...note,
    ...withTranspose,
    ...withDistance,
    ...withCompare
  };
}
