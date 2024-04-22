import { useCallback, useMemo, useState } from 'react';

import { EarTrainingPracticeSettingsBase, NOTE_DURATION } from '../types/practice-session-settings.type';
import { useSamplerMethods } from './use-sampler';

export type Notes = Array<string | string[]>;

export interface EarTrainingPracticeQuestionBase {
	notes: Notes;
	answered: boolean;
	correct?: boolean;
}

interface UseEarTrainingPracticeSessionParams {
	practiceSessionSettings: EarTrainingPracticeSettingsBase;
	playRandom: () => void;
}

export const useEarTrainingPracticeSession = <EarTrainingPracticeQuestion extends EarTrainingPracticeQuestionBase>({ practiceSessionSettings, playRandom }: UseEarTrainingPracticeSessionParams) => {
	const { playNotes, releaseNotes } = useSamplerMethods();

	// ** Practice session questions
	const [practiceSessionQuestions, setPracticeSessionQuestions] = useState<EarTrainingPracticeQuestion[]>([]);

	// ** Practice session meta data
	const practiceSessionMeta = useMemo<{
		totalAnsweredQuestions: number;
		totalCorrectAnswers: number;
		sessionEnded: boolean;
	}>(() => {
		const totalAnsweredQuestions = practiceSessionQuestions.filter(q => q.answered);

		return {
			totalAnsweredQuestions: totalAnsweredQuestions.length,
			totalCorrectAnswers: totalAnsweredQuestions.filter(q => q.correct).length,
			sessionEnded: totalAnsweredQuestions.length === practiceSessionSettings.numberOfQuestions
		};
	}, [practiceSessionSettings.numberOfQuestions, practiceSessionQuestions]);

	// ** Practice session utility state
	const [samplerMethodsDisabled, setSamplerMethodsDisabled] = useState<boolean>(false);

	// ** Practice session methods
	const play = useCallback(
		(notes: Notes) => {
			setSamplerMethodsDisabled(true);

			const noteDurationSeconds = 60 / (practiceSessionSettings.tempo * NOTE_DURATION[practiceSessionSettings.noteDuration]);

			playNotes(notes, noteDurationSeconds);

			setTimeout(() => setSamplerMethodsDisabled(false), notes.length * noteDurationSeconds * 1000);
		},
		[playNotes, practiceSessionSettings]
	);

	const replay = () => {
		releaseNotes();

		const previousQuestion = practiceSessionQuestions[practiceSessionQuestions?.length - 1];

		if (!previousQuestion || !!previousQuestion?.answered) {
			console.log('New random chord');

			playRandom();
		} else {
			console.log('Previous chord');

			play(previousQuestion.notes);
		}
	};

	const reset = (options: { startSession?: boolean } = { startSession: true }) => {
		setPracticeSessionQuestions([]);
		options?.startSession && playRandom();
	};

	return {
		practiceSessionQuestions,
		setPracticeSessionQuestions,
		practiceSessionMeta,
		samplerMethodsDisabled,
		practiceSessionMethods: {
			play,
			replay,
			reset,
			stop: releaseNotes
		}
	};
};
