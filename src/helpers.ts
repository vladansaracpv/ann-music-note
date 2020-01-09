/**
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *                 NOTE - STATIC METHODS                   *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 */

import { BaseTypings } from 'ann-music-base';
import {
  NoteProps,
  NoteChroma,
  NoteComparableFns,
  NoteFreq,
  NoteInit,
  NoteMidi,
  NoteName,
  NoteOctave,
  NoteAlteration,
  NoteProp,
  NoteTransposableProperty,
  NoteMetricProperty,
  CurriedTransposeFn,
  CurriedDistanceFn,
  CurriedCompareFn,
  NAccidental,
} from './types';
import { SHARPS, FLATS } from './theory';
import { toSteps } from '@packages/scale/methods';

const { isNumber, isString } = BaseTypings;

export namespace Accidental {
  export interface NoteAccidental {
    type: string;
    alteration: number;
  }

  const EmptyAccidental = { type: '', alteration: 0 };

  const isType = (type: string): boolean => {
    const { length } = type;
    const head = type[0];

    if (!length) return true;
    if (!'#b'.includes(head)) return false;

    return head.repeat(length) === type;
  };

  function toAlteration(type: string) {
    return type.length * (type[0] === 'b' ? -1 : 1);
  }

  function toType(value: number) {
    return value <= 0 ? 'b'.repeat(value) : '#'.repeat(value);
  }

  export const NoteAccidental = (src: any): NoteAccidental => {
    if (isNumber(src)) return { type: toType(src), alteration: src };
    if (isString(src) && isType(src)) return { type: src, alteration: toAlteration(src) };
    return EmptyAccidental;
  };
}

export namespace Letter {
  type LetterType = '' | 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';
  type LetterStep = 0 | 1 | 2 | 3 | 4 | 5 | 6;
  type LetterIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;

  export interface NoteLetter {
    char: LetterType;
    step: LetterStep;
    index: LetterIndex;
  }

  const EmptyLetter = { char: '', step: NaN, index: NaN };

  export function NoteLetter(char: LetterType): NoteLetter {
    return {
      char,
      step: ((char.charCodeAt(0) + 3) % 7) as LetterStep,
      index: SHARPS.indexOf(char) as LetterIndex,
    };
  }
}

export namespace Pitch {
  type ChromaType = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;

  interface NotePitch {
    pc: string;
    chroma: ChromaType;
  }

  export function NotePitch(
    letter: Letter.NoteLetter,
    accidental: Accidental.NoteAccidental,
    sharps = true,
  ): NotePitch {
    const pc = letter.char + accidental.type;
    const chroma = (accidental.type.includes('#') ? SHARPS.indexOf(pc) : FLATS.indexOf(pc)) as ChromaType;

    return { pc, chroma };
  }
}
