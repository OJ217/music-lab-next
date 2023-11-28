export type Notes = Array<string | string[]>;

export interface EarTrainingPracticeQuestionBase {
	answered: boolean;
	correct?: boolean;
}

export interface EarTrainingPracticeDetail {
	score: number;
	correct: number;
	incorrect: number;
	questionCount: number;
	questionType: string;
}

// ***********************
// ** Interval Practice **
// ***********************
export interface IntervalQuestion extends EarTrainingPracticeQuestionBase {
	intervalName: string;
	intervalNotes: Notes;
}

export interface IntervalPracticeDetail extends EarTrainingPracticeDetail {
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

export interface ChordPracticeDetail extends EarTrainingPracticeDetail {
	chordName: string;
}

// *******************
// ** Mode Practice **
// *******************
export interface ModeQuestion extends EarTrainingPracticeQuestionBase {
	modeName: string;
	modeNotes: Notes;
}

export interface ModePracticeDetail extends EarTrainingPracticeDetail {
	modeName: string;
}
