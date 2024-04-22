// ** Practice Result Level and Message

import { MantineColor } from '@mantine/core';

type PracticeResultLevel = 'high' | 'medium-high' | 'medium-low' | 'low';

export const PRACTICE_RESULT_MESSAGE: Record<PracticeResultLevel, string> = {
	low: `Don't worry. Keep moving forward. Practice leads to perfection 🙌🫂`,
	'medium-low': `Don't worry. Keep moving forward. Practice leads to perfection 🙌🫂`,
	'medium-high': 'Good job fella! Keep the momentum up 🍀',
	high: `Are you a maniac? Because you are on fire! 🚀🔥`
};

export const PRACTICE_RESULT_COLOR: Record<PracticeResultLevel, MantineColor> = {
	low: 'red',
	'medium-low': 'orange',
	'medium-high': 'yellow',
	high: 'green'
};

export const resolvePracticeResultLevel = (totalCorrectAnswers: number, totalQuestions: number): PracticeResultLevel => {
	const correctAnswerPercentage = Math.round((totalCorrectAnswers / totalQuestions) * 100) / 100;

	let practiceResultLevel: PracticeResultLevel;

	switch (true) {
		case correctAnswerPercentage >= 0.8:
			practiceResultLevel = 'high';
			break;
		case correctAnswerPercentage >= 0.6:
			practiceResultLevel = 'medium-high';
			break;
		case correctAnswerPercentage >= 0.4:
			practiceResultLevel = 'medium-low';
			break;
		default:
			practiceResultLevel = 'low';
			break;
	}

	return practiceResultLevel;
};

export const resolvePracticeResultMessage = (totalCorrectAnswers: number, totalQuestions: number): string => {
	return PRACTICE_RESULT_MESSAGE[resolvePracticeResultLevel(totalCorrectAnswers, totalQuestions)];
};

export const resolvePracticeResultColor = (totalCorrectAnswers: number, totalQuestions: number): MantineColor => {
	return PRACTICE_RESULT_COLOR[resolvePracticeResultLevel(totalCorrectAnswers, totalQuestions)];
};

export const combineErrors = (errors: Array<Record<string, Array<string>>>) => {
	return errors.reduce((acc, obj) => {
		for (const [key, value] of Object.entries(obj)) {
			acc[key] = acc[key] ? [...acc[key], ...value] : [...value];
		}
		return acc;
	}, {});
};
