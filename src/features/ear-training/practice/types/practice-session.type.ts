import { Dayjs } from 'dayjs';

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

export interface EarTrainingSessionMeta {
	startTime?: Dayjs;
	endTime?: Dayjs;
	errors: Record<string, Array<string>>;
	feedback?: {
		correct: boolean;
		question: { notes: Notes; value: string };
		answer: { notes: Notes; value: string };
	};
}

export interface EarTrainingSessionResult {
	sessionEnded: boolean;
	totalAnsweredQuestions: number;
	totalCorrectAnswers: number;
	practiceScorePercentage: number;
	practiceSessionQuestionGroups: Array<{
		score: number;
		correct: number;
		incorrect: number;
		questionType: string;
	}>;
}

// ***********************
// ** Interval Practice **
// ***********************
export interface IntervalQuestion extends EarTrainingPracticeQuestionBase {
	rootNote: string;
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
	rootNote: string;
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
	rootNote: string;
	modeName: string;
	modeNotes: Notes;
}

export interface ModePracticeDetail extends EarTrainingPracticeDetail {
	modeName: string;
}
