import dayjs from 'dayjs';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { calculatePercentage } from '@/utils/format.util';
import { last } from '@/utils/helper.util';
import { useDisclosure } from '@mantine/hooks';

import { EarTrainingErrorStores, fetchEarTrainingErrorLocal } from '../stores/ear-training-errors.store';
import { EarTrainingPracticeSettingsBase, NOTE_DURATION } from '../types/practice-session-settings.type';
import {
	EarTrainingExerciseQuestionBase,
	EarTrainingExerciseType,
	EarTrainingSessionResultMeta,
	IEarTrainingSessionMeta,
	IEarTrainingSessionSettingsMeta,
	Notes
} from '../types/practice-session.type';
import { refineEarTrainingSessionResult } from '../utils/practice-session-result.util';
import { useEarTrainingQuestionSelection } from './use-question-selection';
import { useSamplerMethods } from './use-sampler';

const earTrainingExerciseErrorStoreNames: Record<EarTrainingExerciseType, EarTrainingErrorStores> = {
	interval: 'intervalErrors',
	chord: 'chordErrors',
	mode: 'modeErrors'
};

interface UseEarTrainingPracticeSessionParams {
	practiceSessionSettings: EarTrainingPracticeSettingsBase;
	playNextQuestion: () => void;
	exerciseType: EarTrainingExerciseType;
	questionValues: string[];
}

export const useEarTrainingPracticeSession = <EarTrainingExerciseQuestion extends EarTrainingExerciseQuestionBase>({
	practiceSessionSettings,
	playNextQuestion,
	questionValues,
	exerciseType
}: UseEarTrainingPracticeSessionParams) => {
	const { t } = useTranslation();

	const { playNotes, releaseNotes } = useSamplerMethods();

	// ** Practice Session States and Metadata Memoization
	const [practiceSessionQuestions, setPracticeSessionQuestions] = useState<EarTrainingExerciseQuestion[]>([]);
	const [practiceSessionResultMeta, setPracticeSessionResultMeta] = useState<EarTrainingSessionResultMeta>({ errors: {} });

	const practiceSessionSettingsMeta = useMemo<IEarTrainingSessionSettingsMeta>(() => {
		const TOTAL_QUESTIONS = practiceSessionSettings.numberOfQuestions;
		const QUESTIONS = questionValues.map(value => ({ label: t(`${exerciseType}.${value}`), value }));
		const ROOT_NOTE = practiceSessionSettings.fixedRoot.enabled ? practiceSessionSettings.fixedRoot.rootNote : null;
		const NOTE_DURATION_SECONDS = 60 / (practiceSessionSettings.tempo * NOTE_DURATION[practiceSessionSettings.noteDuration]);

		return { TOTAL_QUESTIONS, QUESTIONS, ROOT_NOTE, NOTE_DURATION_SECONDS };
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [practiceSessionSettings, questionValues, exerciseType]);

	const practiceSessionMeta = useMemo<IEarTrainingSessionMeta>(() => {
		const totalAnsweredQuestions = practiceSessionQuestions.filter(q => q.answered).length;
		const totalCorrectAnswers = practiceSessionQuestions.filter(q => q.correct).length;
		const sessionEnded = totalAnsweredQuestions === practiceSessionSettingsMeta.TOTAL_QUESTIONS;
		const scorePercentage = sessionEnded ? calculatePercentage(totalCorrectAnswers, practiceSessionSettingsMeta.TOTAL_QUESTIONS) : 0;
		const progressPercentage = sessionEnded ? 100 : calculatePercentage(totalAnsweredQuestions, practiceSessionSettingsMeta.TOTAL_QUESTIONS);
		const progessIndicatorText = sessionEnded
			? `${practiceSessionSettingsMeta.TOTAL_QUESTIONS}/${practiceSessionSettingsMeta.TOTAL_QUESTIONS}`
			: `${totalAnsweredQuestions}/${practiceSessionSettingsMeta.TOTAL_QUESTIONS}`;
		const practiceSessionResultDetail = sessionEnded ? refineEarTrainingSessionResult(practiceSessionQuestions) : [];

		return {
			sessionEnded,
			totalAnsweredQuestions,
			totalCorrectAnswers,
			scorePercentage,
			progressPercentage,
			progessIndicatorText,
			practiceSessionResultDetail
		};
	}, [practiceSessionSettingsMeta, practiceSessionQuestions]);

	// ** Practice Session Handler Functions
	const playQuestion = useCallback(
		(notes: Notes) => {
			setSamplerMethodsDisabled(true);
			releaseNotes();

			playNotes(notes, practiceSessionSettingsMeta.NOTE_DURATION_SECONDS);

			setTimeout(() => setSamplerMethodsDisabled(false), notes.length * practiceSessionSettingsMeta.NOTE_DURATION_SECONDS * 1000);
		},
		[playNotes, practiceSessionSettingsMeta.NOTE_DURATION_SECONDS, releaseNotes]
	);

	const replayQuestion = () => {
		releaseNotes();

		const previousQuestion = last(practiceSessionQuestions);
		if (!previousQuestion || !!previousQuestion?.answered) {
			playNextQuestion();
		} else {
			playQuestion(previousQuestion.notes);
		}
	};

	/**
	 * @param timeout - in seconds
	 */
	const playNextQuestionWithTimeout = (timeout: number) => {
		setTimeout(playNextQuestion, timeout * 1000);
	};

	const resetSession = (options: { startSession?: boolean } = { startSession: true }) => {
		setPracticeSessionQuestions([]);

		if (options?.startSession) {
			playNextQuestion();
			setPracticeSessionResultMeta(sm => ({ ...sm, startTime: dayjs() }));
		}
	};

	// ** Ear Training Exercise Error State
	const [exerciseErrors, setExerciseErrors] = useState<Record<string, string[]>>();

	// ** Ear Training Exercise Error / Question Selection Handler Functions
	/**
	 * Sets the error state with ear training errors from local store
	 */
	const setUpExerciseErrors = useCallback(async () => {
		try {
			const combinedErrors = await fetchEarTrainingErrorLocal(earTrainingExerciseErrorStoreNames[exerciseType]);
			setExerciseErrors(combinedErrors);
		} catch (error) {
			console.error(error);
			setExerciseErrors({});
		}
	}, [exerciseType]);

	const { selectNextQuestion } = useEarTrainingQuestionSelection({
		errors: exerciseErrors,
		questions: practiceSessionSettingsMeta.QUESTIONS
	});

	// ** Effects
	useEffect(() => {
		if (practiceSessionQuestions.length === 0 && !practiceSessionMeta.sessionEnded) {
			void setUpExerciseErrors();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// ** Utility States
	const [samplerMethodsDisabled, setSamplerMethodsDisabled] = useState<boolean>(false);
	const [practiceSettingsModalOpened, { open: openPracticeSettingsModal, close: closePracticeSettingsModal }] = useDisclosure(false);
	const [practiceResultModalOpened, { open: openPracticeResultModal, close: closePracticeResultModal }] = useDisclosure(false);
	const [practiceResultDetailDrawerOpened, { open: openPracticeResultDetailDrawer, close: closePracticeResultDetailDrawer }] = useDisclosure(false);
	const [questionExplanationVisible, { open: showQuestionExplanation, close: hideQuestionExplanation }] = useDisclosure(false);
	const answerQuestionDisabled = useMemo(
		() => practiceSessionMeta.sessionEnded || !practiceSessionQuestions.length || samplerMethodsDisabled,
		[practiceSessionQuestions.length, practiceSessionMeta.sessionEnded, samplerMethodsDisabled]
	);

	// ** Utility Handler Functions
	const continueAfterFeedback = useCallback(() => {
		if (practiceSessionResultMeta.feedback?.correct) {
			setSamplerMethodsDisabled(true);
			setPracticeSessionResultMeta(meta => ({ ...meta, feedback: undefined }));
			playNextQuestionWithTimeout(1.5);
		} else {
			showQuestionExplanation();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [practiceSessionResultMeta.feedback, playNextQuestionWithTimeout]);

	const playCorrectAnswer = useCallback(() => {
		if (practiceSessionResultMeta.feedback) {
			playQuestion(practiceSessionResultMeta.feedback.question.notes);
		}
	}, [practiceSessionResultMeta.feedback, playQuestion]);

	const playInorrectAnswer = useCallback(() => {
		if (practiceSessionResultMeta.feedback) {
			playQuestion(practiceSessionResultMeta.feedback.answer.notes);
		}
	}, [practiceSessionResultMeta.feedback, playQuestion]);

	const continueAfterExplanation = () => {
		if (questionExplanationVisible) {
			setSamplerMethodsDisabled(true);
			hideQuestionExplanation();
			setPracticeSessionResultMeta(meta => ({ ...meta, feedback: undefined }));
			playNextQuestionWithTimeout(1.5);
		}
	};

	return {
		// ** Practice Session States
		practiceSessionQuestions,
		setPracticeSessionQuestions,
		practiceSessionResultMeta,
		setPracticeSessionResultMeta,
		practiceSessionSettingsMeta,
		practiceSessionMeta,
		// ** Practice Session Question Handler Functions
		play: playQuestion,
		replay: replayQuestion,
		stop: releaseNotes,
		reset: resetSession,
		selectNextQuestion,
		setUpExerciseErrors,
		// ** Utility States
		samplerMethodsDisabled: {
			value: samplerMethodsDisabled,
			set: setSamplerMethodsDisabled
		},
		praticeSettingsModal: {
			opened: practiceSettingsModalOpened,
			open: openPracticeSettingsModal,
			close: closePracticeSettingsModal
		},
		practiceResultModal: {
			opened: practiceResultModalOpened,
			open: openPracticeResultModal,
			close: closePracticeResultModal
		},
		practiceResultDetailDrawer: {
			opened: practiceResultDetailDrawerOpened,
			open: openPracticeResultDetailDrawer,
			close: closePracticeResultDetailDrawer
		},
		questionExplanation: {
			visible: questionExplanationVisible,
			show: showQuestionExplanation,
			hide: hideQuestionExplanation
		},
		answerQuestionDisabled,
		// ** Utility Handler Functions
		continueAfterFeedback,
		playCorrectAnswer,
		playInorrectAnswer,
		continueAfterExplanation
	};
};
