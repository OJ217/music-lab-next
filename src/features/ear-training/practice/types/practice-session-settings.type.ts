import { t } from 'i18next';
import { z } from 'zod';

import { SelectData } from '@/types';

const selectOptionFormatter = (s: any) => ({ label: t(`selectOptions.${s}`), value: s });

// ******************
// ** Playing Mode **
// ******************
const PLAYING_MODES = ['ascending', 'descending', 'harmonic', 'ascending-descending'] as const;
const NON_HARMONIC_PLAYING_MODES = ['ascending', 'ascending-descending'] as const;

export type PlayingMode = (typeof PLAYING_MODES)[number];
export type NonHarmonicPlayingMode = (typeof NON_HARMONIC_PLAYING_MODES)[number];

export const PLAYING_MODE_SELECT_OPTIONS: SelectData<PlayingMode> = PLAYING_MODES.map(selectOptionFormatter);

export const NON_HARMONIC_PLAYING_MODE_SELECT_OPTIONS: SelectData<NonHarmonicPlayingMode> = NON_HARMONIC_PLAYING_MODES.map(selectOptionFormatter);

// *********************
// ** Fixed Root Note **
// *********************
export const FIXED_ROOT_NOTES = ['C4', 'C#4', 'D4', 'D#4', 'E4', 'F4', 'F#4', 'G4', 'G#4', 'A4', 'A#4', 'B4'];

export const FIXED_ROOT_NOTE_SELECT_OPTIONS = FIXED_ROOT_NOTES.map(note => ({ label: note, value: note }));

// *******************
// ** Note Duration **
// *******************
export const NOTE_DURATIONS = ['whole', 'half', 'quarter', 'eighth'] as const;
export type NoteDuration = (typeof NOTE_DURATIONS)[number];

export const NOTE_DURATION_SELECT_OPTIONS: SelectData<NoteDuration> = NOTE_DURATIONS.map(selectOptionFormatter);

export const NOTE_DURATION: Record<NoteDuration, number> = {
	whole: 0.25,
	half: 0.5,
	quarter: 1,
	eighth: 2
};

// ***********************
// ** Practice Settings **
// ***********************
export interface EarTrainingPracticeSettingsBase {
	numberOfQuestions: number;
	fixedRoot: {
		enabled: boolean;
		rootNote: string;
	};
	tempo: number;
	questionDuration: number;
	autoFeedback: boolean;
	settingsLocked: boolean;
	noteDuration: NoteDuration;
}

const practiceSettingsBaseSchema = z.object({
	numberOfQuestions: z.number().min(10).max(100),
	fixedRoot: z.object({
		enabled: z.boolean(),
		rootNote: z.string()
	}),
	tempo: z.number().min(60).max(180),
	questionDuration: z.number().min(1).max(30),
	autoFeedback: z.boolean(),
	settingsLocked: z.boolean()
});

// ********************************
// ** Interval Practice Settings **
// ********************************

const INTERVAL_TYPES = ['all', 'major', 'minor', 'perfect'] as const;
export type IntervalType = (typeof INTERVAL_TYPES)[number];

export const INTERVAL_TYPE_GROUP_SELECT_OPTIONS: SelectData<IntervalType> = INTERVAL_TYPES.map(selectOptionFormatter);

export const INTERVAL_TYPE_GROUPS: Record<IntervalType, string[]> = {
	all: ['m2', 'M2', 'm3', 'M3', 'P4', 'd5', 'P5', 'm6', 'M6', 'm7', 'M7', 'P8'],
	major: ['M2', 'M3', 'M6', 'M7'],
	minor: ['m2', 'm3', 'm6', 'm7'],
	perfect: ['P4', 'P5', 'P8']
	// custom: []
};

export interface IntervalPracticeSettings extends EarTrainingPracticeSettingsBase {
	typeGroup: IntervalType;
	playingMode: PlayingMode;
}

export const DEFAULT_INTERVAL_PRACTICE_SETTINGS: IntervalPracticeSettings = {
	numberOfQuestions: 10,
	typeGroup: 'all',
	fixedRoot: {
		enabled: false,
		rootNote: 'C4'
	},
	playingMode: 'harmonic',
	tempo: 80,
	questionDuration: 30,
	autoFeedback: true,
	settingsLocked: false,
	noteDuration: 'half'
};

export const intervalPracticeSettingsSchema = practiceSettingsBaseSchema.extend({
	intervalTypeGroup: z.enum(INTERVAL_TYPES).default('all'),
	playingMode: z.enum(PLAYING_MODES).default('harmonic'),
	noteDuration: z.enum(NOTE_DURATIONS).default('whole')
});

// *****************************
// ** Chord Practice Settings **
// *****************************

const CHORD_TYPES = ['all', 'triad', 'seventh', 'major', 'minor', 'dim_and_aug', 'dim_and_aug_triad', 'dim_and_aug_seventh'] as const;
export type ChordTypeGroup = (typeof CHORD_TYPES)[number];

export const CHORD_TYPE_GROUPS: Record<ChordTypeGroup, string[]> = {
	all: ['maj', 'min', 'aug', 'dim', '7', 'maj7', 'min7', 'mM7', 'dim7', 'maj7#5', 'm7b5'],
	triad: ['maj', 'min', 'aug', 'dim'],
	seventh: ['7', 'maj7', 'min7', 'mM7', 'dim7', 'maj7#5', 'm7b5'],
	major: ['maj', '7', 'maj7'],
	minor: ['min', 'min7', 'mM7'],
	dim_and_aug: ['aug', 'dim', 'dim7', 'maj7#5'],
	dim_and_aug_triad: ['dim', 'aug'],
	dim_and_aug_seventh: ['dim7', 'm7b5', 'maj7#5']
	// custom: []
};

export const CHORD_TYPE_GROUP_SELECT_OPTIONS: SelectData<ChordTypeGroup> = CHORD_TYPES.map(selectOptionFormatter);

export const CHORD_INVERSION_SELECT_OPTIONS: SelectData<string> = [
	{ label: t('rootInversion'), value: '0' },
	...Array.from({ length: 3 }).map((_, i) => ({ value: (i + 1).toString(), label: t('chordInversion', { inversion: i + 1 }) }))
];

export const CHORD_WITHOUT_INVERSIONS = ['aug', 'dim7'];

export interface ChordPracticeSettings extends EarTrainingPracticeSettingsBase {
	typeGroup: ChordTypeGroup;
	inversions: string[];
	playingMode: PlayingMode;
}

export const DEFAULT_CHORD_PRACTICE_SETTINGS: ChordPracticeSettings = {
	numberOfQuestions: 10,
	typeGroup: 'all',
	inversions: ['0', '1', '2', '3'],
	fixedRoot: {
		enabled: false,
		rootNote: 'C4'
	},
	playingMode: 'harmonic',
	tempo: 100,
	questionDuration: 30,
	autoFeedback: true,
	settingsLocked: false,
	noteDuration: 'whole'
};

export const chordPracticeSettingsSchema = practiceSettingsBaseSchema.extend({
	modeTypeGroup: z.enum(CHORD_TYPES).default('all'),
	playingMode: z.enum(PLAYING_MODES).default('harmonic'),
	noteDuration: z.enum(NOTE_DURATIONS).default('whole')
});

// ****************************
// ** Mode Practice Settings **
// ****************************

const MODE_TYPES = ['all', 'major', 'minor'] as const;
export type ModeType = (typeof MODE_TYPES)[number];

export const MODE_TYPE_GROUPS: Record<ModeType, string[]> = {
	all: ['ionian', 'lydian', 'mixolydian', 'aeolian', 'dorian', 'locrian', 'phrygian', 'harmonic major', 'mixolydian b6', 'harmonic minor', 'melodic minor'],
	major: ['ionian', 'lydian', 'mixolydian', 'harmonic major', 'mixolydian b6'],
	minor: ['aeolian', 'dorian', 'locrian', 'phrygian', 'harmonic minor', 'melodic minor']
	// custom: []
};

export const MODE_TYPE_GROUP_SELECT_OPTIONS: SelectData<ModeType> = MODE_TYPES.map(selectOptionFormatter);

export interface ModePracticeSettings extends EarTrainingPracticeSettingsBase {
	typeGroup: ModeType;
	playingMode: NonHarmonicPlayingMode;
}

export const DEFAULT_MODE_PRACTICE_SETTINGS: ModePracticeSettings = {
	numberOfQuestions: 10,
	typeGroup: 'all',
	fixedRoot: {
		enabled: false,
		rootNote: 'C4'
	},
	playingMode: 'ascending',
	tempo: 80,
	questionDuration: 30,
	autoFeedback: true,
	settingsLocked: false,
	noteDuration: 'eighth'
};

export const modePracticeSettingsSchema = practiceSettingsBaseSchema.extend({
	modeTypeGroup: z.enum(MODE_TYPES).default('all'),
	playingMode: z.enum(NON_HARMONIC_PLAYING_MODES).default('ascending'),
	noteDuration: z.enum(NOTE_DURATIONS).default('eighth')
});
