import dayjs from 'dayjs';
import { useMemo, useState } from 'react';
import { Chord, distance, Note } from 'tonal';

import { randomNumberFromRange } from '@/utils/helper.util';

import { CHORD_WITHOUT_INVERSIONS, ChordPracticeSettings } from '../types/practice-session-settings.type';
import { EarTrainingExerciseQuestionBase, Notes, SelectedChord } from '../types/practice-session.type';
import { useEarTrainingPracticeSession } from './use-practice-session';

interface UsePracticeChordParams {
	practiceSessionSettings: ChordPracticeSettings;
	questionValues: string[];
}

export const usePracticeChord = ({ practiceSessionSettings, questionValues }: UsePracticeChordParams) => {
	// ** Chord practice specific states
	const [selectedChord, setSelectedChord] = useState<SelectedChord | null>();
	const INVERSIONS = useMemo(() => practiceSessionSettings.inversions.map(i => parseInt(i)), [practiceSessionSettings]);

	/**
	 * Checks if given chord has any inversion
	 */
	const hasInversion = (chordName: string) => {
		return !CHORD_WITHOUT_INVERSIONS.includes(chordName);
	};

	/**
	 * Arranges notes for the sampler based on playing mode
	 */
	const arrangeChordNotes = (rootNote: string, chordName: string, chordInversion?: number): Notes => {
		let chordNotesBase = Chord.getChord(chordName)
			.intervals.map(interval => Note.transpose(rootNote, interval))
			.map(Note.simplify);

		if (chordInversion !== undefined) {
			const chordDegree = Chord.degrees([rootNote, chordName]);

			const inversionNotes = Array.from({ length: chordNotesBase.length }, (_, index) => chordInversion + index + 1)
				.map(chordDegree)
				.map((note, _, inversionArr) => distance(inversionArr[0], note))
				.map(interval => Note.transpose(rootNote, interval))
				.map(Note.simplify);

			chordNotesBase = inversionNotes;
		}

		switch (practiceSessionSettings.playingMode) {
			case 'harmonic':
				return [chordNotesBase];
			case 'ascending':
				return chordNotesBase;
			case 'descending':
				return chordNotesBase.reverse();
			case 'ascending-descending':
				return [...chordNotesBase, ...chordNotesBase.slice().reverse()];
			default:
				return [chordNotesBase];
		}
	};

	/**
	 * Determines next interval to play based on previous errors
	 */
	const playNextQuestion = () => {
		const rootNote = chordPracticeSession.practiceSessionSettingsMeta.ROOT_NOTE ?? Note.fromMidi(randomNumberFromRange(48, 65));
		const chordName = chordPracticeSession.selectNextQuestion(chordPracticeSession.practiceSessionQuestions.map(q => q.questionValue));

		let chordInversion: number | undefined = undefined;
		if (hasInversion(chordName) && INVERSIONS.length > 1) {
			chordInversion = INVERSIONS[Math.floor(Math.random() * INVERSIONS.filter(i => i < Chord.getChord(chordName, rootNote).notes.length).length)];
		}

		const chordNotes = arrangeChordNotes(rootNote, chordName, chordInversion);

		chordPracticeSession.play(chordNotes);

		chordPracticeSession.setPracticeSessionQuestions(prevQuestions => [
			...prevQuestions,
			{
				questionValue: chordName,
				notes: chordNotes,
				rootNote,
				answered: false,
				...(chordInversion !== undefined && { inversion: chordInversion })
			}
		]);
	};

	const chordPracticeSession = useEarTrainingPracticeSession<EarTrainingExerciseQuestionBase & { inversion?: number }>({
		practiceSessionSettings,
		playNextQuestion,
		questionValues,
		exerciseType: 'chord'
	});

	/**
	 * Selects the chord value and shows inversions (if inversion exists)
	 */
	const answerChordName = (answerChordValue: string) => {
		if (hasInversion(answerChordValue) && INVERSIONS.length > 1) {
			setSelectedChord({
				name: answerChordValue,
				length: Chord.getChord(answerChordValue).intervals.length
			});
		} else {
			answerQuestion(answerChordValue);
		}
	};

	/**
	 * Deselects the chord value and shows the chords back
	 */
	const deselectChordName = () => {
		setSelectedChord(null);
	};

	/**
	 * Answers question and continues the flow
	 */
	const answerQuestion = (answerChordValue: string, inversion?: number) => {
		let answerCorrect: boolean;

		chordPracticeSession.setPracticeSessionQuestions(sq => {
			const previousSessionQuestions = [...sq];
			const lastQuestion = previousSessionQuestions[previousSessionQuestions.length - 1];
			const chordNameCorrect = answerChordValue === lastQuestion.questionValue;
			answerCorrect = lastQuestion.inversion !== undefined ? chordNameCorrect && inversion === lastQuestion.inversion : chordNameCorrect;

			previousSessionQuestions[previousSessionQuestions.length - 1] = {
				...lastQuestion,
				answered: true,
				correct: answerCorrect
			};

			if (!answerCorrect) {
				chordPracticeSession.setPracticeSessionResultMeta(meta => {
					if (!(lastQuestion.questionValue in meta.errors)) {
						meta.errors[lastQuestion.questionValue] = [answerChordValue];
					} else {
						meta.errors[lastQuestion.questionValue] = [...meta.errors[lastQuestion.questionValue], answerChordValue];
					}

					return meta;
				});
			}

			return previousSessionQuestions;
		});

		if (chordPracticeSession.practiceSessionQuestions.length === chordPracticeSession.practiceSessionSettingsMeta.TOTAL_QUESTIONS) {
			chordPracticeSession.stop(5);
			chordPracticeSession.practiceResultModal.open();
			chordPracticeSession.setPracticeSessionResultMeta(meta => ({ ...meta, endTime: dayjs() }));
			return;
		}

		if (!practiceSessionSettings.autoFeedback) {
			playNextQuestion();
		} else {
			chordPracticeSession.setPracticeSessionResultMeta(meta => {
				const lastQuestion = chordPracticeSession.practiceSessionQuestions[chordPracticeSession.practiceSessionQuestions.length - 1];

				return {
					...meta,
					feedback: {
						correct: answerCorrect,
						answer: {
							value: answerChordValue,
							notes: arrangeChordNotes(lastQuestion.rootNote, answerChordValue, inversion)
						},
						question: {
							value: lastQuestion.questionValue,
							notes: lastQuestion.notes
						}
					}
				};
			});
		}

		deselectChordName();
	};

	return {
		answerChordName,
		answerQuestion,
		selectedChord,
		deselectChordName,
		...{ ...chordPracticeSession, practiceSessionSettingsMeta: { ...chordPracticeSession.practiceSessionSettingsMeta, INVERSIONS } }
	};
};
