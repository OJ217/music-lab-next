import { calculatePercentage } from '@/utils/format.util';

import { ChordQuestion, EarTrainingPracticeDetail, IntervalQuestion, ModeQuestion } from '../types/practice-session.type';

export const refineIntervalPracticeResult = (practiceSessionQuestions: Array<IntervalQuestion>): Array<EarTrainingPracticeDetail> => {
	return Object.entries(
		practiceSessionQuestions.reduce((questionGroup: Record<string, Array<IntervalQuestion>>, question: IntervalQuestion) => {
			const interval = question.intervalName;

			if (!questionGroup[interval]) {
				questionGroup[interval] = [];
			}

			questionGroup[interval].push(question);

			return questionGroup;
		}, {})
	).map(([interval, questions]) => {
		const correct = questions.filter(q => q.correct).length;
		const incorrect = questions.length - correct;

		return {
			score: calculatePercentage(correct, questions.length),
			correct,
			incorrect,
			questionCount: questions.length,
			questionType: interval
		};
	});
};

export const refineChordPracticeResult = (practiceSessionQuestions: Array<ChordQuestion>): Array<EarTrainingPracticeDetail> => {
	return Object.entries(
		practiceSessionQuestions.reduce((questionGroup: Record<string, Array<ChordQuestion>>, question: ChordQuestion) => {
			const chord = question.chordName;

			if (!questionGroup[chord]) {
				questionGroup[chord] = [];
			}

			questionGroup[chord].push(question);

			return questionGroup;
		}, {})
	).map(([chord, questions]) => {
		const correct = questions.filter(q => q.correct).length;
		const incorrect = questions.length - correct;

		return {
			score: calculatePercentage(correct, questions.length),
			correct,
			incorrect,
			questionCount: questions.length,
			questionType: chord
		};
	});
};

export const refineModePracticeResult = (practiceSessionQuestions: Array<ModeQuestion>): Array<EarTrainingPracticeDetail> => {
	return Object.entries(
		practiceSessionQuestions.reduce((questionGroup: Record<string, Array<ModeQuestion>>, question: ModeQuestion) => {
			const mode = question.modeName;

			if (!questionGroup[mode]) {
				questionGroup[mode] = [];
			}

			questionGroup[mode].push(question);

			return questionGroup;
		}, {})
	).map(([mode, questions]) => {
		const correct = questions.filter(q => q.correct).length;
		const incorrect = questions.length - correct;

		return {
			correct,
			incorrect,
			score: calculatePercentage(correct, questions.length),
			questionType: mode,
			questionCount: questions.length
		};
	});
};
