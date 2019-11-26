import { BaseBoolean, BaseErrors, BaseRelations, BaseStrings } from 'ann-music-base';

import {
  NoteName,
  NoteAccidental,
  NoteMidi,
  NoteFreq,
  NoteLetter,
  NoteOctave,
  NoteChroma,
  NoteInit,
  NoteProps,
  NoteStep,
  NoteAlteration,
  NotePC,
  NoteColor,
} from './types';

import * as Theory from './theory';
import { Validators, Letter, Accidental, Octave, Midi, Frequency, Chroma } from './methods';

const { either } = BaseBoolean;
const { CustomError } = BaseErrors;
const { isNegative } = BaseRelations;
const { capitalize, substitute, tokenize } = BaseStrings;

const NoteError = CustomError('Note');

export function Note({ name, midi, frequency, sharps = true, tuning = 440 }: NoteInit = {}): NoteProps {
  const { isName, isMidi, isFrequency } = Validators;

  const { toIndex, toStep } = Letter;
  const { toAlteration } = Accidental;
  const { toSemitones, parse } = Octave;
  const { toFrequency, toOctaves } = Midi;
  const { toMidi } = Frequency;
  const { isWhite } = Chroma;
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
      name,
      octave,
      frequency,
      midi,
      pc,
      chroma,
      letter,
      step,
      accidental,
      alteration,
      color,
      valid,
    };
  }

  function fromMidi(midi: NoteMidi, useSharps = true): NoteProps {
    const octave = toOctaves(midi) as NoteOctave;

    const chroma = (midi % 12) as NoteChroma;
    const pc = either(SHARPS[chroma], FLATS[chroma], useSharps) as NotePC;

    const name = `${pc}${octave}` as NoteName;

    return fromName(name);
  }

  function fromFrequency(frequency: NoteFreq, useSharps = true, tuning = Theory.A_440): NoteProps {
    const midi = toMidi(frequency, tuning);
    return fromMidi(midi, useSharps);
  }

  if (isName(name)) return fromName(name);
  if (isMidi(midi)) return fromMidi(midi, sharps) as NoteProps;
  if (isFrequency(frequency)) return fromFrequency(frequency, sharps, tuning) as NoteProps;

  return NoteError('InvalidConstructor', { name, midi, frequency }, EmptyNote);
}
