import dayjs, { Dayjs } from 'dayjs';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Note, Scale } from 'tonal';

import { calculatePercentage } from '@/utils/format.util';
import { notify } from '@/utils/notification.util';
import { ActionIcon, Button, Progress } from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { IconSettings } from '@tabler/icons-react';

import PracticeResultDetailDrawer from '../components/overlay/PracticeResultDetailDrawer';
import PracticeResultModal from '../components/overlay/PracticeResultModal';
import { ModePracticeSettingsModal } from '../components/overlay/PracticeSettingsModal';
import { useSamplerMethods } from '../hooks/useSampler';
import EarTrainingLayout from '../layouts/EarTrainingLayout';
import { EarTrainingPracticeType, saveEarTrainingPracticeSessionSchema, useSaveEarTrainingPracticeSessionMutation } from '../services/practice-session.service';
import { DEFAULT_MODE_PRACTICE_SETTINGS, MODE_TYPE_GROUPS, ModePracticeSettings, modePracticeSettingsSchema, NOTE_DURATION } from '../types/practice-session-settings.type';
import { ModeQuestion, Notes } from '../types/practice-session.type';
import { refineModePracticeResult } from '../utils/practice-session-result.util';

// CONSTANTS
const TOTAL_QUESTIONS = 10;

const PracticeMode = () => {
	// ** Translation
	const { t } = useTranslation();

	// ** Sampler Methods
	const { playNotes, releaseNotes } = useSamplerMethods();

	// ** -------------------- STATES -------------------- **

	// ** Practice Settings
	const modePracticeSettingsForm = useForm<ModePracticeSettings>({
		initialValues: DEFAULT_MODE_PRACTICE_SETTINGS,
		validate: zodResolver(modePracticeSettingsSchema)
	});

	const { values: modePracticeSettings } = modePracticeSettingsForm;

	const MODES = useMemo(
		() =>
			MODE_TYPE_GROUPS[modePracticeSettings.typeGroup].map(modeName => ({
				label: t(`mode.${modeName}`),
				value: modeName
			})),
		[modePracticeSettings.typeGroup, t]
	);
	const TOTAL_QUESTIONS = modePracticeSettings.numberOfQuestions;
	const ROOT_NOTE = modePracticeSettings.fixedRoot.enabled ? modePracticeSettings.fixedRoot.rootNote : null;

	// ** Practice Session States
	const [practiceSessionQuestions, setPracticeSessionQuestions] = useState<Array<ModeQuestion>>([]);
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
		const practiceSessionQuestionGroups = sessionEnded ? refineModePracticeResult(practiceSessionQuestions) : [];

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
		if (practiceSessionQuestions.length == 0) {
			openSettingsModal();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// ** Practice Session Handler Functions
	const getDescendingNotes = (rootNote: string, modeName: string, modeNotesBase: string[]): string[] => {
		if (modeName === 'melodic minor') {
			return [...Scale.get(`${rootNote} aeolian`).notes, Note.transpose(rootNote, 'P8')].toReversed();
		}

		return modeNotesBase.toReversed();
	};

	const playMode = (modeNotes: Notes) => {
		setPracticeSessionMethodsDisabled(true);

		const noteDuration = 60 / (modePracticeSettings.tempo * NOTE_DURATION[modePracticeSettings.noteDuration]);

		playNotes(modeNotes, noteDuration);

		setTimeout(() => setPracticeSessionMethodsDisabled(false), modeNotes.length * noteDuration * 1000);
	};

	const playRandomMode = () => {
		const rootNote = ROOT_NOTE ?? Note.fromMidi(Math.floor(Math.random() * 13) + 48);
		const modeName = MODES[Math.floor(Math.random() * MODES.length)].value;
		const modeNotesBase = [...Scale.get(`${rootNote} ${modeName}`).notes, Note.transpose(rootNote, 'P8')];

		let modeNotes: string[];

		switch (modePracticeSettings.playingMode) {
			case 'ascending':
				modeNotes = modeNotesBase;
				break;
			case 'ascending-descending':
				modeNotes = [...modeNotesBase, ...getDescendingNotes(rootNote, modeName, modeNotesBase)];
				break;
			default:
				modeNotes = modeNotesBase;
				break;
		}

		releaseNotes();
		playMode(modeNotes);

		setPracticeSessionQuestions(prevQuestions => [...prevQuestions, { modeName: modeName, modeNotes, answered: false }]);
	};

	const replayMode = () => {
		releaseNotes();
		const previousQuestion = practiceSessionQuestions[practiceSessionQuestions?.length - 1];

		if (!previousQuestion || !!previousQuestion?.answered) {
			playRandomMode();
		} else {
			playMode(previousQuestion.modeNotes);
		}
	};

	const answerQuestion = (answerModeName: string) => {
		setPracticeSessionQuestions(sq => {
			const updatedSessionQuestions = [...sq];
			const lastQuestion = updatedSessionQuestions[updatedSessionQuestions.length - 1];
			const answerCorrect = answerModeName === lastQuestion.modeName;

			updatedSessionQuestions[updatedSessionQuestions.length - 1] = {
				...lastQuestion,
				answered: true,
				correct: answerCorrect
			};

			return updatedSessionQuestions;
		});

		if (practiceSessionQuestions.length === TOTAL_QUESTIONS) {
			releaseNotes(5);
			openPracticeResultModal();
			setPracticeSessionMeta(sm => ({ ...sm, endTime: dayjs() }));
			return;
		}

		playRandomMode();
	};

	const resetSession = (options: { startSession?: boolean } = { startSession: true }) => {
		setPracticeSessionQuestions([]);
		if (options?.startSession) {
			playRandomMode();
			setPracticeSessionMeta(sm => ({ ...sm, startTime: dayjs() }));
		}
	};

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
					type: EarTrainingPracticeType.ModeIdentification,
					duration: dayjs().diff(practiceSessionMeta?.startTime, 'seconds'),
					statistics: refineModePracticeResult(practiceSessionQuestions)
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
				<div className='space-y-4'>
					<h1 className='text-center text-xl font-semibold'>{t('modeIdentification')}</h1>
					<div className='space-y-2'>
						<Progress
							bg={'violet.8'}
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
							sessionEnded || !practiceSessionQuestions.length ? resetSession() : replayMode();
						}}
						className='disabled:bg-violet-600/25 disabled:opacity-50'
					>
						{sessionEnded ? t('restart') : !practiceSessionQuestions.length ? t('start') : t('replay')}
					</Button>

					<div className='mt-12 flex max-w-md flex-wrap items-center justify-center gap-6'>
						{MODES.map(mode => (
							<Button
								py={4}
								px={16}
								fw={400}
								variant='light'
								key={mode.value}
								onClick={() => answerQuestion(mode.value)}
								disabled={sessionEnded || !practiceSessionQuestions.length || practiceSessionMethodsDisabled}
								className='rounded-full border-[1.5px] border-violet-700 text-violet-100 disabled:pointer-events-none disabled:bg-violet-600/25 disabled:opacity-50'
							>
								{mode.label}
							</Button>
						))}
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
				practiceSessionSettings={modePracticeSettings}
				practiceSessionQuestionGroups={practiceSessionQuestionGroups}
				translationNamespace='mode'
			/>

			<ModePracticeSettingsModal
				opened={settingsModalOpened}
				close={closeSettingsModal}
				practiceSettingsForm={modePracticeSettingsForm}
			/>
		</>
	);
};

export default PracticeMode;
