// ** Practice Result Level and Message

type PracticeResultLevel = 'high' | 'medium' | 'low';

export const PracticeResultMessage: Record<PracticeResultLevel, string> = {
	low: `Don't worry. Keep moving forward. Practice leads to perfection 🙌🫂`,
	medium: 'Good job fella! Keep the momentum up 🍀',
	high: `Are you a maniac? Because you are on fire! 🚀🔥`
};

export const resolvePracticeResultMessage = (totalCorrectAnswers: number, totalQuestions: number): string => {
	const correctAnswerPercentage = Math.round((totalCorrectAnswers / totalQuestions) * 100) / 100;

	let practiceResultLevel: PracticeResultLevel;

	switch (true) {
		case correctAnswerPercentage >= 0.8:
			practiceResultLevel = 'high';
			break;
		case correctAnswerPercentage >= 0.5:
			practiceResultLevel = 'medium';
			break;
		default:
			practiceResultLevel = 'low';
			break;
	}

	return PracticeResultMessage[practiceResultLevel];
};
