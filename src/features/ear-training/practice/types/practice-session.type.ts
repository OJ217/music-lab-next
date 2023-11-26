export type Notes = Array<string | string[]>;

export interface EarTrainingPracticeQuestionBase {
	answered: boolean;
	correct?: boolean;
}

export interface EarTrainingPracticeDetailBase {
	correctAnswers: number;
	incorrectAnswers: number;
	correctPercentage: string;
	numberOfQuestions: number;
}

// ***********************
// ** Interval Practice **
// ***********************
export interface IntervalQuestion extends EarTrainingPracticeQuestionBase {
	intervalName: string;
	intervalNotes: Notes;
}

export interface IntervalPracticeDetail extends EarTrainingPracticeDetailBase {
	intervalName: string;
}

// ********************
// ** Chord Practice **
// ********************
export interface ChordQuestion extends EarTrainingPracticeQuestionBase {
	chordName: string;
	chordInversion?: number;
	chordNotes: Notes;
}

export interface SelectedChord {
	name: string;
	length: number;
}

export interface ChordPracticeDetail extends EarTrainingPracticeDetailBase {
	chordName: string;
}

// *******************
// ** Mode Practice **
// *******************
export interface ModeQuestion extends EarTrainingPracticeQuestionBase {
	modeName: string;
	modeNotes: Notes;
}

export interface ModePracticeDetail extends EarTrainingPracticeDetailBase {
	modeName: string;
}
