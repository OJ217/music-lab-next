import dayjs, { Dayjs } from 'dayjs';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Note } from 'tonal';

import { calculatePercentage } from '@/utils/format.util';
import { notify } from '@/utils/notification.util';
import { ActionIcon, Button, Progress } from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { IconSettings } from '@tabler/icons-react';

import PracticeResultDetailDrawer from '../components/overlay/PracticeResultDetailDrawer';
import PracticeResultModal from '../components/overlay/PracticeResultModal';
import { IntervalPracticeSettingsModal } from '../components/overlay/PracticeSettingsModal';
import { useSamplerMethods } from '../hooks/useSampler';
import EarTrainingLayout from '../layouts/EarTrainingLayout';
import { EarTrainingPracticeType, saveEarTrainingPracticeSessionSchema, useSaveEarTrainingPracticeSessionMutation } from '../services/practice-session.service';
import { DEFAULT_INTERVAL_PRACTICE_SETTINGS, INTERVAL_TYPE_GROUPS, IntervalPracticeSettings, intervalPracticeSettingsSchema, NOTE_DURATION } from '../types/practice-session-settings.type';
import { IntervalQuestion, Notes } from '../types/practice-session.type';
import { refineIntervalPracticeResult } from '../utils/practice-session-result.util';

const PracticeInterval = () => {
	// ** Translation
	const { t } = useTranslation();

	// ** Sampler Methods
	const { playNotes, releaseNotes } = useSamplerMethods();

	// ** Practice Settings
	const intervalPracticeSettingsForm = useForm<IntervalPracticeSettings>({
		initialValues: DEFAULT_INTERVAL_PRACTICE_SETTINGS,
		validate: zodResolver(intervalPracticeSettingsSchema)
	});

	const { values: intervalPracticeSettings } = intervalPracticeSettingsForm;

	const INTERVALS = useMemo(
		() =>
			INTERVAL_TYPE_GROUPS[intervalPracticeSettings.typeGroup].map(intervalName => ({
				label: t(`interval.${intervalName}`),
				value: intervalName
			})),
		[intervalPracticeSettings.typeGroup, t]
	);
	const TOTAL_QUESTIONS = intervalPracticeSettings.numberOfQuestions;
	const ROOT_NOTE = intervalPracticeSettings.fixedRoot.enabled ? intervalPracticeSettings.fixedRoot.rootNote : null;

	// ** Practice Session States
	const [practiceSessionQuestions, setPracticeSessionQuestions] = useState<Array<IntervalQuestion>>([]);
	const [practiceSessionMeta, setPracticeSessionMeta] = useState<{ startTime?: Dayjs; endTime?: Dayjs }>();

	const { totalAnsweredQuestions, totalCorrectAnswers, practiceScorePercentage, sessionEnded, practiceSessionQuestionGroups } = useMemo<{
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
	}>(() => {
		const totalAnsweredQuestions = practiceSessionQuestions.filter(q => q.answered).length;
		const totalCorrectAnswers = practiceSessionQuestions.filter(q => q.correct).length;
		const sessionEnded = totalAnsweredQuestions === TOTAL_QUESTIONS;
		const practiceScorePercentage = sessionEnded ? calculatePercentage(totalCorrectAnswers, TOTAL_QUESTIONS) : 0;
		const practiceSessionQuestionGroups = sessionEnded ? refineIntervalPracticeResult(practiceSessionQuestions) : [];

		return {
			totalAnsweredQuestions,
			totalCorrectAnswers,
			sessionEnded,
			practiceScorePercentage,
			practiceSessionQuestionGroups
		};
	}, [TOTAL_QUESTIONS, practiceSessionQuestions]);

	// ** Util States
	const [practiceSessionMethodsDisabled, setPracticeSessionMethodsDisabled] = useState<boolean>(false);
	const [practiceResultModalOpened, { open: openPracticeResultModal, close: closePracticeResultModal }] = useDisclosure(false);
	const [settingsModalOpened, { open: openSettingsModal, close: closeSettingsModal }] = useDisclosure(false);
	const [practiceDetailDrawerOpened, { open: openPracticeDetailDrawer, close: closePracticeDetailDrawer }] = useDisclosure(false);

	// ** Effects
	useEffect(() => {
		if (practiceSessionQuestions.length == 0 || !sessionEnded) {
			openSettingsModal();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// ** Practice Session Handler Functions
	const playInterval = (intervalNotes: Notes) => {
		setPracticeSessionMethodsDisabled(true);

		const noteDuration = 60 / (intervalPracticeSettings.tempo * NOTE_DURATION[intervalPracticeSettings.noteDuration]);

		playNotes(intervalNotes, noteDuration);

		setTimeout(() => setPracticeSessionMethodsDisabled(false), intervalNotes.length * noteDuration * 1000);
	};

	const playRandomInterval = () => {
		const rootNote = ROOT_NOTE ?? Note.fromMidi(Math.floor(Math.random() * 25) + 48);
		const intervalName = INTERVALS[Math.floor(Math.random() * INTERVALS.length)].value;
		const upperNote = Note.transpose(rootNote, intervalName);
		const intervalNotesBase = [rootNote, upperNote];

		let intervalNotes: Notes;

		switch (intervalPracticeSettings.playingMode) {
			case 'harmonic':
				intervalNotes = [intervalNotesBase];
				break;
			case 'ascending':
				intervalNotes = intervalNotesBase;
				break;
			case 'descending':
				intervalNotes = intervalNotesBase.reverse();
				break;
			default:
				intervalNotes = [intervalNotesBase];
				break;
		}

		releaseNotes();
		playInterval(intervalNotes);

		setPracticeSessionQuestions(prevQuestions => [...prevQuestions, { intervalName, intervalNotes, answered: false }]);
	};

	const replayInterval = () => {
		releaseNotes();

		const previousQuestion = practiceSessionQuestions[practiceSessionQuestions?.length - 1];

		if (!previousQuestion || !!previousQuestion?.answered) {
			playRandomInterval();
		} else {
			playInterval(previousQuestion.intervalNotes);
		}
	};

	const answerQuestion = (answerIntervalName: string) => {
		setPracticeSessionQuestions(sq => {
			const previousSessionQuestions = [...sq];
			const lastQuestion = previousSessionQuestions[previousSessionQuestions.length - 1];
			const answerCorrect = answerIntervalName === lastQuestion.intervalName;

			previousSessionQuestions[previousSessionQuestions.length - 1] = {
				...lastQuestion,
				answered: true,
				correct: answerCorrect
			};

			return previousSessionQuestions;
		});

		if (practiceSessionQuestions.length === TOTAL_QUESTIONS) {
			releaseNotes(5);
			openPracticeResultModal();
			setPracticeSessionMeta(sm => ({ ...sm, endTime: dayjs() }));
			return;
		}

		playRandomInterval();
	};

	const resetSession = (options: { startSession?: boolean } = { startSession: true }) => {
		setPracticeSessionQuestions([]);
		if (options?.startSession) {
			playRandomInterval();
			setPracticeSessionMeta(sm => ({ ...sm, startTime: dayjs() }));
		}
	};

	// ** Practice session mutation
	const { mutateSaveEarTrainingPracticeSession, savePracticeSessionPending } = useSaveEarTrainingPracticeSessionMutation();

	const handleSaveEarTrainingPracticeSession = async () => {
		if (sessionEnded) {
			try {
				const practiceSessionData = {
					result: {
						score: practiceScorePercentage,
						correct: totalCorrectAnswers,
						incorrect: TOTAL_QUESTIONS - totalCorrectAnswers,
						questionCount: TOTAL_QUESTIONS
					},
					type: EarTrainingPracticeType.IntervalIdentification,
					duration: dayjs().diff(practiceSessionMeta?.startTime, 'seconds'),
					statistics: refineIntervalPracticeResult(practiceSessionQuestions)
				};

				const practiceSessionDataParsed = saveEarTrainingPracticeSessionSchema.safeParse(practiceSessionData);

				if (!practiceSessionDataParsed.success) {
					throw practiceSessionDataParsed.error;
				}

				await mutateSaveEarTrainingPracticeSession(practiceSessionDataParsed.data);

				notify({ type: 'success', title: 'Practice session saved' });
			} catch (error) {
				console.error(error);

				notify({ type: 'fail', title: 'Could not save practice session' });
			}
		}
	};

	return (
		<>
			<EarTrainingLayout>
				<div>
					<div className='space-y-4'>
						<h1 className='text-center text-xl font-semibold'>{t('intervalIdentification')}</h1>
						<div className='space-y-2'>
							<Progress
								value={sessionEnded ? 100 : (totalAnsweredQuestions / TOTAL_QUESTIONS) * 100}
								classNames={{
									root: 'max-w-[240px] mx-auto',
									section: 'transition-all duration-300 ease-in-out'
								}}
							/>
							<p className='text-center text-xs text-gray-300'>
								{sessionEnded ? `${practiceSessionQuestions.length}/${practiceSessionQuestions.length}` : `${practiceSessionQuestions.length}/${TOTAL_QUESTIONS}`}
							</p>
						</div>

						<div className='flex items-center justify-center gap-4'>
							<ActionIcon
								p={4}
								radius='sm'
								variant='light'
								onClick={openSettingsModal}
								disabled={practiceSessionQuestions.length > 0 && !sessionEnded}
							>
								<IconSettings />
							</ActionIcon>
						</div>
					</div>

					<div className='mt-16 flex flex-col items-center'>
						<Button
							fw={500}
							radius={'xl'}
							disabled={practiceSessionMethodsDisabled || sessionEnded}
							onClick={() => {
								sessionEnded || !practiceSessionQuestions.length ? resetSession() : replayInterval();
							}}
							className='disabled:bg-violet-600/25 disabled:opacity-50'
						>
							{sessionEnded ? t('restart') : !practiceSessionQuestions.length ? t('start') : t('replay')}
						</Button>

						<div className='mt-12 flex max-w-md flex-wrap items-center justify-center gap-6'>
							{INTERVALS.map(interval => (
								<Button
									py={4}
									px={16}
									fw={400}
									variant='light'
									key={interval.value}
									onClick={() => answerQuestion(interval.value)}
									disabled={sessionEnded || !practiceSessionQuestions.length || practiceSessionMethodsDisabled}
									className='rounded-full border border-violet-600 text-white disabled:pointer-events-none disabled:bg-violet-600/25 disabled:opacity-50'
								>
									{interval.label}
								</Button>
							))}
						</div>
					</div>
				</div>
			</EarTrainingLayout>

			<PracticeResultModal
				sessionEnded={sessionEnded}
				practiceResultModalOpened={practiceResultModalOpened}
				savePracticeSessionPending={savePracticeSessionPending}
				practiceScorePercentage={practiceScorePercentage}
				totalCorrectAnswers={totalCorrectAnswers}
				totalQuestions={TOTAL_QUESTIONS}
				closePracticeResultModal={closePracticeResultModal}
				openPracticeDetailDrawer={openPracticeDetailDrawer}
				handleSaveEarTrainingPracticeSession={handleSaveEarTrainingPracticeSession}
				resetSession={resetSession}
			/>

			<PracticeResultDetailDrawer
				sessionEnded={sessionEnded}
				practiceDetailDrawerOpened={practiceDetailDrawerOpened}
				closePracticeDetailDrawer={closePracticeDetailDrawer}
				totalQuestions={TOTAL_QUESTIONS}
				totalCorrectAnswers={totalCorrectAnswers}
				practiceScorePercentage={practiceScorePercentage}
				practiceSessionSettings={intervalPracticeSettings}
				practiceSessionQuestionGroups={practiceSessionQuestionGroups}
				translationNamespace='interval'
			/>

			<IntervalPracticeSettingsModal
				opened={settingsModalOpened}
				close={closeSettingsModal}
				practiceSettingsForm={intervalPracticeSettingsForm}
			/>
		</>
	);
};

export default PracticeInterval;
