import { SelectData } from '@/types';

// ***************************************
// ** BASE / COMMON Types and Constants **
// ***************************************
export type PlayingMode = 'ascending' | 'descending' | 'harmonic' | 'ascending-descending';
export type NonHarmonicPlayingMode = Exclude<PlayingMode, 'harmonic'>;

export const PLAYING_MODE_SELECT_OPTIONS: SelectData<PlayingMode> = [
	{ label: 'Ascending', value: 'ascending' },
	{ label: 'Descending', value: 'descending' },
	{ label: 'Harmonic', value: 'harmonic' }
];

export const NON_HARMONIC_PLAYING_MODE_SELECT_OPTIONS: SelectData<NonHarmonicPlayingMode> = [
	{ label: 'Ascending', value: 'ascending' },
	{ label: 'Descending', value: 'descending' },
	{ label: 'Ascending and Descending', value: 'ascending-descending' }
];

export const FIXED_ROOT_NOTES = ['C4', 'C#4', 'D4', 'D#4', 'E4', 'F4', 'F#4', 'G4', 'G#4', 'A4', 'A#4', 'B4'];
export const FIXED_ROOT_NOTE_SELECT_OPTIONS = FIXED_ROOT_NOTES.map(note => ({ label: note, value: note }));

export interface EarTrainingPracticeSettingsBase {
	numberOfQuestions: number;
	fixedRoot: {
		enabled: boolean;
		rootNote: string;
	};
	tempo: number;
	questionDuration: number;
	autoFeedback: boolean;
}

// ********************************
// ** Interval Practice Settings **
// ********************************
export interface IntervalPracticeSettings extends EarTrainingPracticeSettingsBase {
	intervalTypeGroup: IntervalTypeGroup;
	playingMode: PlayingMode;
}

export type IntervalTypeGroup = keyof typeof INTERVAL_TYPE_GROUPS;

export const INTERVAL_TYPE_GROUPS = {
	all: ['m2', 'M2', 'm3', 'M3', 'P4', 'd5', 'P5', 'm6', 'M6', 'm7', 'M7', 'P8'],
	major: ['M2', 'M3', 'M6', 'M7'],
	minor: ['m2', 'm3', 'm6', 'm7'],
	perfect: ['P4', 'P5', 'P8']
	// custom: []
};

export const DEFAULT_INTERVAL_PRACTICE_SETTINGS: IntervalPracticeSettings = {
	numberOfQuestions: 10,
	intervalTypeGroup: 'all',
	fixedRoot: {
		enabled: false,
		rootNote: 'C4'
	},
	playingMode: 'harmonic',
	tempo: 80,
	questionDuration: 30,
	autoFeedback: true
};

export const INTERVAL_TYPE_GROUP_SELECT_OPTIONS: SelectData<IntervalTypeGroup> = [
	{ value: 'all', label: 'All' },
	{ value: 'major', label: 'Major' },
	{ value: 'minor', label: 'Minor' },
	{ value: 'perfect', label: 'Perfect' }
	// { value: 'custom', label: 'Custom' }
];

// *****************************
// ** Chord Practice Settings **
// *****************************
export interface ChordPracticeSettings extends EarTrainingPracticeSettingsBase {
	chordTypeGroup: ChordTypeGroup;
	inversions: string[];
	playingMode: PlayingMode;
}

export type ChordTypeGroup = keyof typeof CHORD_TYPE_GROUPS;

export const CHORD_TYPE_GROUPS = {
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

export const DEFAULT_CHORD_PRACTICE_SETTINGS: ChordPracticeSettings = {
	numberOfQuestions: 10,
	chordTypeGroup: 'all',
	inversions: ['0', '1', '2', '3'],
	fixedRoot: {
		enabled: false,
		rootNote: 'C4'
	},
	playingMode: 'harmonic',
	tempo: 80,
	questionDuration: 30,
	autoFeedback: true
};

export const CHORD_TYPE_GROUP_SELECT_OPTIONS: SelectData<ChordTypeGroup> = [
	{ value: 'all', label: 'All' },
	{ value: 'triad', label: 'Triad' },
	{ value: 'seventh', label: 'Seventh' },
	{ value: 'major', label: 'Major' },
	{ value: 'minor', label: 'Minor' },
	{ value: 'dim_and_aug', label: 'Diminished and Augmented' },
	{ value: 'dim_and_aug_triad', label: 'Diminished and Augmented Triad' },
	{ value: 'dim_and_aug_seventh', label: 'Diminished and Augmented Seventh' }
	// { value: 'custom', label: 'Custom' }
];

export const CHORD_INVERSION_SELECT_OPTIONS: SelectData<string> = [
	{ value: '0', label: 'Root Inversion' },
	{ value: '1', label: '1st Inversion' },
	{ value: '2', label: '2nd Inversion' },
	{ value: '3', label: '3rd Inversion' }
];

// ****************************
// ** Mode Practice Settings **
// ****************************
export interface ModePracticeSettings extends EarTrainingPracticeSettingsBase {
	modeTypeGroup: ModeTypeGroup;
	playingMode: NonHarmonicPlayingMode;
}

export type ModeTypeGroup = keyof typeof MODE_TYPE_GROUPS;

export const MODE_TYPE_GROUPS = {
	all: ['ionian', 'lydian', 'mixolydian', 'aeolian', 'dorian', 'locrian', 'phrygian'],
	major: ['ionian', 'lydian', 'mixolydian'],
	minor: ['aeolian', 'dorian', 'locrian', 'phrygian']
	// custom: []
};

export const DEFAULT_MODE_PRACTICE_SETTINGS: ModePracticeSettings = {
	numberOfQuestions: 10,
	modeTypeGroup: 'all',
	fixedRoot: {
		enabled: false,
		rootNote: 'C4'
	},
	playingMode: 'ascending',
	tempo: 80,
	questionDuration: 30,
	autoFeedback: true
};

export const MODE_TYPE_GROUP_SELECT_OPTIONS: SelectData<ModeTypeGroup> = [
	{ value: 'all', label: 'All' },
	{ value: 'major', label: 'Major modes' },
	{ value: 'minor', label: 'Minor modes' }
	// { value: 'custom', label: 'Custom' }
];
