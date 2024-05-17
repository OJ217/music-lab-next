import dayjs from 'dayjs';
import { useCallback } from 'react';
import { Note } from 'tonal';

import { randomNumberFromRange } from '@/utils/helper.util';

import { IntervalPracticeSettings } from '../types/practice-session-settings.type';
import { useEarTrainingPracticeSession } from './use-practice-session';

interface UsePracticeIntervalParams {
	practiceSessionSettings: IntervalPracticeSettings;
	questionValues: string[];
}

export const usePracticeInterval = ({ practiceSessionSettings, questionValues }: UsePracticeIntervalParams) => {
	/**
	 * Arranges notes for the sampler based on playing mode
	 */
	const arrangeIntervalNotes = useCallback(
		(rootNote: string, intervalName: string) => {
			const upperNote = Note.transpose(rootNote, intervalName);
			const intervalNotesBase = [rootNote, upperNote].map(Note.simplify);

			switch (practiceSessionSettings.playingMode) {
				case 'harmonic':
					return [intervalNotesBase];
				case 'ascending':
					return intervalNotesBase;
				case 'descending':
					return intervalNotesBase.toReversed();
				case 'ascending-descending':
					return [...intervalNotesBase, ...intervalNotesBase.toReversed()];
				default:
					return [intervalNotesBase];
			}
		},
		[practiceSessionSettings.playingMode]
	);

	/**
	 * Determines next interval to play based on previous errors
	 */
	const playNextQuestion = () => {
		const rootNote = intervalPracticeSession.practiceSessionSettingsMeta.ROOT_NOTE ?? Note.fromMidi(randomNumberFromRange(48, 72));
		const intervalName = intervalPracticeSession.selectNextQuestion(intervalPracticeSession.practiceSessionQuestions.map(q => q.questionValue));
		const intervalNotes = arrangeIntervalNotes(rootNote, intervalName);

		intervalPracticeSession.play(intervalNotes);

		intervalPracticeSession.setPracticeSessionQuestions(prevQuestions => [
			...prevQuestions,
			{
				questionValue: intervalName,
				notes: intervalNotes,
				rootNote,
				answered: false
			}
		]);
	};

	const intervalPracticeSession = useEarTrainingPracticeSession({
		practiceSessionSettings,
		playNextQuestion,
		exerciseType: 'interval',
		questionValues
	});

	/**
	 * Answers question and continues the flow
	 */
	const answerQuestion = (answerIntervalValue: string) => {
		let answerCorrect: boolean;

		intervalPracticeSession.setPracticeSessionQuestions(sq => {
			const previousSessionQuestions = [...sq];
			const lastQuestion = previousSessionQuestions[previousSessionQuestions.length - 1];
			answerCorrect = answerIntervalValue === lastQuestion.questionValue;

			previousSessionQuestions[previousSessionQuestions.length - 1] = {
				...lastQuestion,
				answered: true,
				correct: answerCorrect
			};

			if (!answerCorrect) {
				intervalPracticeSession.setPracticeSessionResultMeta(meta => {
					if (!(lastQuestion.questionValue in meta.errors)) {
						meta.errors[lastQuestion.questionValue] = [answerIntervalValue];
					} else {
						meta.errors[lastQuestion.questionValue] = [...meta.errors[lastQuestion.questionValue], answerIntervalValue];
					}

					return meta;
				});
			}

			return previousSessionQuestions;
		});

		if (intervalPracticeSession.practiceSessionQuestions.length === intervalPracticeSession.practiceSessionSettingsMeta.TOTAL_QUESTIONS) {
			intervalPracticeSession.stop(5);
			intervalPracticeSession.practiceResultModal.open();
			intervalPracticeSession.setPracticeSessionResultMeta(meta => ({ ...meta, endTime: dayjs() }));
			return;
		}

		if (!practiceSessionSettings.autoFeedback) {
			playNextQuestion();
		} else {
			intervalPracticeSession.setPracticeSessionResultMeta(meta => {
				const lastQuestion = intervalPracticeSession.practiceSessionQuestions[intervalPracticeSession.practiceSessionQuestions.length - 1];

				return {
					...meta,
					feedback: {
						correct: answerCorrect,
						answer: {
							value: answerIntervalValue,
							notes: arrangeIntervalNotes(lastQuestion.rootNote, answerIntervalValue)
						},
						question: {
							value: lastQuestion.questionValue,
							notes: lastQuestion.notes
						}
					}
				};
			});
		}
	};

	return {
		answerQuestion,
		...intervalPracticeSession
	};
};
