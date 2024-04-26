import dayjs from 'dayjs';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo } from 'react';

import { notify } from '@/utils/notification.util';
import { useForm, UseFormReturnType, zodResolver } from '@mantine/form';

import EarTrainingSessionControl from '../components/core/practice-session-control';
import EarTrainingQuestionExplanation from '../components/core/practice-session-explanation';
import EarTrainingQuestionFeedback from '../components/core/practice-session-feedback';
import EarTrainingSessionProgress from '../components/core/practice-session-progress';
import PracticeResultDetailDrawer from '../components/overlay/practice-result-detail-drawer';
import PracticeResultModal from '../components/overlay/practice-result-modal';
import { IntervalPracticeSettingsModal } from '../components/overlay/practice-settings-modal';
import { usePracticeInterval } from '../hooks/use-practice-interval';
import EarTrainingLayout from '../layouts/ear-training-layout';
import { EarTrainingPracticeType, saveEarTrainingPracticeSessionSchema, useSaveEarTrainingPracticeSessionMutation } from '../services/practice-session.service';
import { addEarTrainingErrorLocal } from '../stores/ear-training-errors.store';
import { addEarTrainingSessionLocal } from '../stores/ear-training-session.store';
import { DEFAULT_INTERVAL_PRACTICE_SETTINGS, INTERVAL_TYPE_GROUPS, IntervalPracticeSettings, intervalPracticeSettingsSchema } from '../types/practice-session-settings.type';
import { refineEarTrainingSessionResult } from '../utils/practice-session-result.util';

interface IPracticeIntervalView {
	intervalPracticeSettingsForm: UseFormReturnType<IntervalPracticeSettings, (values: IntervalPracticeSettings) => IntervalPracticeSettings>;
	intervalValues: Array<string>;
	settingsEnabled: boolean;
}

const PracticeIntervalView: React.FC<IPracticeIntervalView> = ({ intervalPracticeSettingsForm, intervalValues, settingsEnabled }) => {
	// ** Practice Session Initialization
	const intervalPracticeSession = usePracticeInterval({
		practiceSessionSettings: intervalPracticeSettingsForm.values,
		questionValues: intervalValues
	});

	const {
		practiceSessionQuestions,
		practiceSessionMeta,
		practiceSessionResultMeta,
		practiceSessionSettingsMeta,
		setPracticeSessionResultMeta,
		reset,
		replay,
		answerQuestion,
		setUpExerciseErrors,
		samplerMethodsDisabled,
		answerQuestionDisabled,
		praticeSettingsModal,
		practiceResultDetailDrawer,
		practiceResultModal,
		questionExplanation,
		playCorrectAnswer,
		playInorrectAnswer,
		continueAfterFeedback,
		continueAfterExplanation
	} = intervalPracticeSession;

	// ** Practice Session Effects
	useEffect(() => {
		if (practiceSessionQuestions.length === 0 && !practiceSessionMeta.sessionEnded && settingsEnabled) {
			praticeSettingsModal.open();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// ** Practice Session Mutation
	const { mutateSaveEarTrainingPracticeSession, savePracticeSessionPending } = useSaveEarTrainingPracticeSessionMutation();

	const handleSaveEarTrainingPracticeSession = async () => {
		if (practiceSessionMeta.sessionEnded) {
			// ** Save errors locally
			try {
				void addEarTrainingErrorLocal(practiceSessionResultMeta.errors, 'intervalErrors');
			} catch (error) {
				console.error(error);
			} finally {
				setPracticeSessionResultMeta({ ...practiceSessionResultMeta, errors: {} });
				void setUpExerciseErrors();
			}

			// ** Call save ear training session service
			try {
				const practiceSessionData = {
					result: {
						score: practiceSessionMeta.scorePercentage,
						correct: practiceSessionMeta.totalCorrectAnswers,
						incorrect: practiceSessionSettingsMeta.TOTAL_QUESTIONS - practiceSessionMeta.totalCorrectAnswers,
						questionCount: practiceSessionSettingsMeta.TOTAL_QUESTIONS
					},
					type: EarTrainingPracticeType.IntervalIdentification,
					duration: dayjs().diff(practiceSessionResultMeta?.startTime, 'seconds'),
					statistics: refineEarTrainingSessionResult(practiceSessionQuestions)
				};

				const practiceSessionDataParsed = saveEarTrainingPracticeSessionSchema.safeParse(practiceSessionData);

				if (!practiceSessionDataParsed.success) {
					throw practiceSessionDataParsed.error;
				}

				const {
					data: { _id }
				} = await mutateSaveEarTrainingPracticeSession(practiceSessionDataParsed.data);

				void addEarTrainingSessionLocal({ _id, ...practiceSessionDataParsed.data, timestamp: new Date() }, 'intervalSessions');

				notify({ type: 'success', title: 'Practice session saved' });
			} catch (error) {
				console.error(error);

				notify({ type: 'fail', title: 'Could not save practice session' });
			}
		}
	};

	return (
		<>
			<EarTrainingLayout centered={true}>
				<EarTrainingSessionProgress
					sessionEnded={practiceSessionMeta.sessionEnded}
					progressPercentage={practiceSessionMeta.progressPercentage}
					progressIndicatorText={practiceSessionMeta.progessIndicatorText}
					openPracticeSettingsModal={praticeSettingsModal.open}
					questionCount={practiceSessionQuestions.length}
					exerciseType='interval'
				/>

				<AnimatePresence
					mode='sync'
					initial={false}
					presenceAffectsLayout
				>
					<motion.div
						layout={'position'}
						transition={{
							duration: 1.5,
							type: 'spring'
						}}
						className='mt-16'
					>
						{!practiceSessionResultMeta.feedback ? (
							// ** Intervals
							<EarTrainingSessionControl
								reset={reset}
								replay={replay}
								answerQuestion={answerQuestion}
								sessionEnded={practiceSessionMeta.sessionEnded}
								questionCount={practiceSessionQuestions.length}
								quetsions={practiceSessionSettingsMeta.QUESTIONS}
								samplerMethodsDisabled={samplerMethodsDisabled.value}
								answerQuestionDisabled={answerQuestionDisabled}
								controlLayout='fill'
							/>
						) : !questionExplanation.visible ? (
							// ** Feedback
							<EarTrainingQuestionFeedback
								answerCorrect={practiceSessionResultMeta.feedback.correct}
								correctAnswerValue={practiceSessionResultMeta.feedback.question.value}
								continueButtonDisabled={!practiceSessionResultMeta.feedback}
								continueAfterFeedback={continueAfterFeedback}
								exerciseType='interval'
							/>
						) : (
							// ** Explanation
							<EarTrainingQuestionExplanation
								feedback={practiceSessionResultMeta.feedback}
								playIncorrectAnswer={playInorrectAnswer}
								playCorrectAnswer={playCorrectAnswer}
								samplerMethodsDisabled={samplerMethodsDisabled.value}
								continueAfterExplanation={continueAfterExplanation}
								exerciseType='interval'
							/>
						)}
					</motion.div>
				</AnimatePresence>
			</EarTrainingLayout>

			<PracticeResultModal
				sessionEnded={practiceSessionMeta.sessionEnded}
				practiceResultModalOpened={practiceResultModal.opened}
				savePracticeSessionPending={savePracticeSessionPending}
				practiceScorePercentage={practiceSessionMeta.scorePercentage}
				totalCorrectAnswers={practiceSessionMeta.totalCorrectAnswers}
				totalQuestions={practiceSessionSettingsMeta.TOTAL_QUESTIONS}
				closePracticeResultModal={practiceResultModal.close}
				openPracticeDetailDrawer={practiceResultDetailDrawer.open}
				handleSaveEarTrainingPracticeSession={handleSaveEarTrainingPracticeSession}
				resetSession={reset}
			/>

			<PracticeResultDetailDrawer
				sessionEnded={practiceSessionMeta.sessionEnded}
				practiceDetailDrawerOpened={practiceResultDetailDrawer.opened}
				closePracticeDetailDrawer={practiceResultDetailDrawer.close}
				totalQuestions={practiceSessionSettingsMeta.TOTAL_QUESTIONS}
				totalCorrectAnswers={practiceSessionMeta.totalCorrectAnswers}
				practiceScorePercentage={practiceSessionMeta.scorePercentage}
				practiceSessionSettings={intervalPracticeSettingsForm.values}
				practiceSessionQuestionGroups={practiceSessionMeta.practiceSessionResultDetail}
				exerciseType='interval'
			/>

			<IntervalPracticeSettingsModal
				opened={praticeSettingsModal.opened}
				close={praticeSettingsModal.close}
				practiceSettingsForm={intervalPracticeSettingsForm}
			/>
		</>
	);
};

const PracticeIntervalScreen = () => {
	// ** Practice Settings
	const intervalPracticeSettingsForm = useForm<IntervalPracticeSettings>({
		initialValues: DEFAULT_INTERVAL_PRACTICE_SETTINGS,
		validate: zodResolver(intervalPracticeSettingsSchema)
	});

	const intervalValues = useMemo(() => INTERVAL_TYPE_GROUPS[intervalPracticeSettingsForm.values.typeGroup], [intervalPracticeSettingsForm.values]);

	return (
		<PracticeIntervalView
			intervalPracticeSettingsForm={intervalPracticeSettingsForm}
			intervalValues={intervalValues}
			settingsEnabled={true}
		/>
	);
};

export default PracticeIntervalScreen;
