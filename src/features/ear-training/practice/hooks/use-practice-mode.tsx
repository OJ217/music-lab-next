import dayjs from 'dayjs';
import { Note, Scale } from 'tonal';

import { randomNumberFromRange } from '@/utils/helper.util';

import { ModePracticeSettings } from '../types/practice-session-settings.type';
import { useEarTrainingPracticeSession } from './use-practice-session';

interface UsePracticeModeParams {
	practiceSessionSettings: ModePracticeSettings;
	questionValues: string[];
}

export const usePracticeMode = ({ practiceSessionSettings, questionValues }: UsePracticeModeParams) => {
	/**
	 * Gets descending notes for a given mode
	 */
	const getDescendingNotes = (rootNote: string, modeName: string, modeNotesBase: string[]): string[] => {
		if (modeName === 'melodic minor') {
			return [...Scale.get(`${rootNote} aeolian`).notes, Note.transpose(rootNote, 'P8')].toReversed();
		}

		return modeNotesBase.toReversed();
	};

	/**
	 * Arranges notes for the sampler based on playing mode
	 */
	const arrangeModeNotes = (rootNote: string, modeName: string) => {
		const modeNotesBase = [...Scale.get(`${rootNote} ${modeName}`).notes, Note.transpose(rootNote, 'P8')];

		switch (practiceSessionSettings.playingMode) {
			case 'ascending':
				return modeNotesBase;
			case 'ascending-descending':
				return [...modeNotesBase, ...getDescendingNotes(rootNote, modeName, modeNotesBase)];
			default:
				return modeNotesBase;
		}
	};

	/**
	 * Determines next mode to play based on previous errors
	 */
	const playNextQuestion = () => {
		const rootNote = modePracticeSession.practiceSessionSettingsMeta.ROOT_NOTE ?? Note.fromMidi(randomNumberFromRange(48, 60));
		const intervalName = modePracticeSession.selectNextQuestion(modePracticeSession.practiceSessionQuestions.map(q => q.questionValue));
		const intervalNotes = arrangeModeNotes(rootNote, intervalName);

		modePracticeSession.play(intervalNotes);

		modePracticeSession.setPracticeSessionQuestions(prevQuestions => [
			...prevQuestions,
			{
				questionValue: intervalName,
				notes: intervalNotes,
				rootNote,
				answered: false
			}
		]);
	};

	const modePracticeSession = useEarTrainingPracticeSession({
		practiceSessionSettings,
		playNextQuestion,
		questionValues,
		exerciseType: 'mode'
	});

	/**
	 * Answers question and continues the flow
	 */
	const answerQuestion = (answerModeValue: string) => {
		let answerCorrect: boolean;

		modePracticeSession.setPracticeSessionQuestions(sq => {
			const previousSessionQuestions = [...sq];
			const lastQuestion = previousSessionQuestions[previousSessionQuestions.length - 1];
			answerCorrect = answerModeValue === lastQuestion.questionValue;

			previousSessionQuestions[previousSessionQuestions.length - 1] = {
				...lastQuestion,
				answered: true,
				correct: answerCorrect
			};

			if (!answerCorrect) {
				modePracticeSession.setPracticeSessionResultMeta(meta => {
					if (!(lastQuestion.questionValue in meta.errors)) {
						meta.errors[lastQuestion.questionValue] = [answerModeValue];
					} else {
						meta.errors[lastQuestion.questionValue] = [...meta.errors[lastQuestion.questionValue], answerModeValue];
					}

					return meta;
				});
			}

			return previousSessionQuestions;
		});

		if (modePracticeSession.practiceSessionQuestions.length === modePracticeSession.practiceSessionSettingsMeta.TOTAL_QUESTIONS) {
			modePracticeSession.stop(5);
			modePracticeSession.practiceResultModal.open();
			modePracticeSession.setPracticeSessionResultMeta(meta => ({ ...meta, endTime: dayjs() }));
			return;
		}

		if (!practiceSessionSettings.autoFeedback) {
			playNextQuestion();
		} else {
			modePracticeSession.setPracticeSessionResultMeta(meta => {
				const lastQuestion = modePracticeSession.practiceSessionQuestions[modePracticeSession.practiceSessionQuestions.length - 1];

				return {
					...meta,
					feedback: {
						correct: answerCorrect,
						answer: {
							value: answerModeValue,
							notes: arrangeModeNotes(lastQuestion.rootNote, answerModeValue)
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
		...modePracticeSession
	};
};
