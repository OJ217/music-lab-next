import dayjs from 'dayjs';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Note, Scale } from 'tonal';

import { calculatePercentage } from '@/utils/format.util';
import { notify } from '@/utils/notification.util';
import { ActionIcon, Button, Progress } from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { IconMusicCheck, IconMusicX, IconSettings } from '@tabler/icons-react';

import PracticeResultDetailDrawer from '../components/overlay/practice-result-detail-drawer';
import PracticeResultModal from '../components/overlay/practice-result-modal';
import { ModePracticeSettingsModal } from '../components/overlay/practice-settings-modal';
import { useEarTrainingQuestionSelection } from '../hooks/use-ear-training-question-selection';
import { useSamplerMethods } from '../hooks/use-sampler';
import EarTrainingLayout from '../layouts/ear-training-layout';
import { EarTrainingPracticeType, saveEarTrainingPracticeSessionSchema, useSaveEarTrainingPracticeSessionMutation } from '../services/practice-session.service';
import { addEarTrainingErrorLocal, fetchEarTrainingErrorLocal } from '../stores/ear-training-errors.store';
import { DEFAULT_MODE_PRACTICE_SETTINGS, MODE_TYPE_GROUPS, ModePracticeSettings, modePracticeSettingsSchema, NOTE_DURATION } from '../types/practice-session-settings.type';
import { EarTrainingSessionMeta, EarTrainingSessionResult, ModeQuestion, Notes } from '../types/practice-session.type';
import { refineModePracticeResult } from '../utils/practice-session-result.util';

// CONSTANTS
const TOTAL_QUESTIONS = 10;

const PracticeMode = () => {
	// ** Translation
	const { t } = useTranslation();

	// ** Sampler Methods
	const { playNotes, releaseNotes } = useSamplerMethods();

	// ** Practice Settings
	const modePracticeSettingsForm = useForm<ModePracticeSettings>({
		initialValues: DEFAULT_MODE_PRACTICE_SETTINGS,
		validate: zodResolver(modePracticeSettingsSchema)
	});
	const { values: modePracticeSettings } = modePracticeSettingsForm;
	const { MODES, TOTAL_QUESTIONS, ROOT_NOTE } = useMemo(() => {
		const TOTAL_QUESTIONS = modePracticeSettings.numberOfQuestions;
		const ROOT_NOTE = modePracticeSettings.fixedRoot.enabled ? modePracticeSettings.fixedRoot.rootNote : null;
		const MODES = MODE_TYPE_GROUPS[modePracticeSettings.typeGroup].map(modeName => ({
			label: t(`mode.${modeName}`),
			value: modeName
		}));
		return { TOTAL_QUESTIONS, ROOT_NOTE, MODES };
	}, [modePracticeSettings, t]);

	// ** Practice Session States
	const [practiceSessionQuestions, setPracticeSessionQuestions] = useState<Array<ModeQuestion>>([]);
	const [practiceSessionMeta, setPracticeSessionMeta] = useState<EarTrainingSessionMeta>({ errors: {} });
	const { totalAnsweredQuestions, totalCorrectAnswers, practiceScorePercentage, sessionEnded, practiceSessionQuestionGroups } = useMemo<EarTrainingSessionResult>(() => {
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

	// ** Practice Question Selection States and Methods
	const [modeErrors, setModeErrors] = useState<Record<string, string[]>>();
	const { selectNextQuestion } = useEarTrainingQuestionSelection({
		errors: modeErrors,
		questions: MODES
	});

	// ** Util States
	const [practiceSessionMethodsDisabled, setPracticeSessionMethodsDisabled] = useState<boolean>(false);
	const [practiceResultModalOpened, { open: openPracticeResultModal, close: closePracticeResultModal }] = useDisclosure(false);
	const [settingsModalOpened, { open: openSettingsModal, close: closeSettingsModal }] = useDisclosure(false);
	const [practiceDetailDrawerOpened, { open: openPracticeDetailDrawer, close: closePracticeDetailDrawer }] = useDisclosure(false);
	const [questionExplanationVisible, { open: showQuestionExplanation, close: hideQuestionExplanation }] = useDisclosure(false);

	// ** Effects

	useEffect(() => {
		if (practiceSessionQuestions.length === 0 && !sessionEnded) {
			void setUpModeErrors();
			openSettingsModal();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// ** Practice Session Handler Functions
	/**
	 * Sets the error state with ear training errors from local store
	 */
	const setUpModeErrors = async () => {
		try {
			const combinedErrors = await fetchEarTrainingErrorLocal('modeErrors');
			setModeErrors(combinedErrors);
		} catch (error) {
			console.error(error);
			setModeErrors({});
		}
	};

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

		switch (modePracticeSettings.playingMode) {
			case 'ascending':
				return modeNotesBase;
			case 'ascending-descending':
				return [...modeNotesBase, ...getDescendingNotes(rootNote, modeName, modeNotesBase)];
			default:
				return modeNotesBase;
		}
	};

	const playMode = (modeNotes: Notes) => {
		setPracticeSessionMethodsDisabled(true);
		releaseNotes();

		const noteDuration = 60 / (modePracticeSettings.tempo * NOTE_DURATION[modePracticeSettings.noteDuration]);
		playNotes(modeNotes, noteDuration);

		setTimeout(() => setPracticeSessionMethodsDisabled(false), modeNotes.length * noteDuration * 1000);
	};

	const playNextMode = () => {
		const rootNote = ROOT_NOTE ?? Note.fromMidi(Math.floor(Math.random() * 13) + 48);
		const modeName = selectNextQuestion(practiceSessionQuestions.map(q => q.modeName));
		const modeNotes = arrangeModeNotes(rootNote, modeName);

		playMode(modeNotes);

		setPracticeSessionQuestions(prevQuestions => [...prevQuestions, { modeName, modeNotes, rootNote, answered: false }]);
	};

	/**
	 * @param timeout - in seconds
	 */
	const playNextModeWithTimeout = (timeout: number) => {
		setTimeout(playNextMode, timeout * 1000);
	};

	const replayMode = () => {
		releaseNotes();

		const previousQuestion = practiceSessionQuestions[practiceSessionQuestions?.length - 1];
		if (!previousQuestion || !!previousQuestion?.answered) {
			playNextMode();
		} else {
			playMode(previousQuestion.modeNotes);
		}
	};

	const answerQuestion = (answerModeName: string) => {
		let answerCorrect: boolean;

		setPracticeSessionQuestions(sq => {
			const previousSessionQuestions = [...sq];
			const lastQuestion = previousSessionQuestions[previousSessionQuestions.length - 1];
			answerCorrect = answerModeName === lastQuestion.modeName;

			previousSessionQuestions[previousSessionQuestions.length - 1] = {
				...lastQuestion,
				answered: true,
				correct: answerCorrect
			};

			if (!answerCorrect) {
				setPracticeSessionMeta(meta => {
					if (!(lastQuestion.modeName in meta.errors)) {
						meta.errors[lastQuestion.modeName] = [answerModeName];
					} else {
						meta.errors[lastQuestion.modeName] = [...meta.errors[lastQuestion.modeName], answerModeName];
					}

					return meta;
				});
			}

			return previousSessionQuestions;
		});

		if (practiceSessionQuestions.length === TOTAL_QUESTIONS) {
			releaseNotes(5);
			openPracticeResultModal();
			setPracticeSessionMeta(meta => ({ ...meta, endTime: dayjs() }));
			return;
		}

		if (!modePracticeSettings.autoFeedback) {
			playNextMode();
		} else {
			setPracticeSessionMeta(meta => {
				const lastQuestion = practiceSessionQuestions[practiceSessionQuestions.length - 1];

				return {
					...meta,
					feedback: {
						correct: answerCorrect,
						answer: {
							value: answerModeName,
							notes: arrangeModeNotes(lastQuestion.rootNote, answerModeName)
						},
						question: {
							value: lastQuestion.modeName,
							notes: lastQuestion.modeNotes
						}
					}
				};
			});
		}
	};

	const resetSession = (options: { startSession?: boolean } = { startSession: true }) => {
		setPracticeSessionQuestions([]);
		if (options?.startSession) {
			playNextMode();
			setPracticeSessionMeta(sm => ({ ...sm, startTime: dayjs() }));
		}
	};

	const { mutateSaveEarTrainingPracticeSession, savePracticeSessionPending } = useSaveEarTrainingPracticeSessionMutation();

	const handleSaveEarTrainingPracticeSession = async () => {
		if (sessionEnded) {
			// ** Save errors locally
			try {
				void addEarTrainingErrorLocal(practiceSessionMeta.errors, 'modeErrors');
			} catch (error) {
				console.error(error);
			} finally {
				setPracticeSessionMeta({ ...practiceSessionMeta, errors: {} });
				void setUpModeErrors();
			}

			// ** Call save ear training session service
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
				<motion.div
					layout={'position'}
					transition={{ duration: 1.5, type: 'spring' }}
					className='space-y-4'
				>
					<h1 className='text-center text-xl font-semibold'>{t('modeIdentification')}</h1>
					<div className='space-y-2'>
						<Progress
							bg={'violet.8'}
							value={sessionEnded ? 100 : (totalAnsweredQuestions / TOTAL_QUESTIONS) * 100}
							classNames={{
								root: 'max-w-[240px] mx-auto',
								section: 'transition-all duration-300 ease-in-out rounded-r'
							}}
						/>
						<p className='text-center text-xs text-violet-100'>{sessionEnded ? `${TOTAL_QUESTIONS}/${TOTAL_QUESTIONS}` : `${totalAnsweredQuestions}/${TOTAL_QUESTIONS}`}</p>
					</div>

					<div className='flex items-center justify-center'>
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
				</motion.div>

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
						{!practiceSessionMeta.feedback ? (
							<motion.div
								layout={'position'}
								key={'modes_and_control'}
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								transition={{
									duration: 1.5,
									type: 'spring'
								}}
								className='flex flex-col items-center space-y-12'
							>
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
								<div className='flex max-w-md flex-wrap items-center justify-center gap-6'>
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
							</motion.div>
						) : !questionExplanationVisible ? (
							// ** Feedback
							<motion.div
								layout={'position'}
								key={'feedback'}
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								transition={{
									duration: 1.5,
									type: 'spring'
								}}
								className='flex flex-col items-center space-y-12'
							>
								<>
									{practiceSessionMeta.feedback.correct ? (
										<div className='grid size-24 place-content-center rounded-full border-[2.5px] border-green-600/75 bg-transparent bg-gradient-to-tr from-green-600/35 to-green-600/50 text-green-200 shadow-round-2xl shadow-green-600/50'>
											<motion.svg
												xmlns='http://www.w3.org/2000/svg'
												width='48'
												height='48'
												viewBox='0 0 24 24'
												fill='none'
												stroke='currentColor'
												strokeWidth='2'
												strokeLinecap='round'
												strokeLinejoin='round'
												className='tabler-icon tabler-icon-check'
											>
												<motion.path
													d='M5 12l5 5l10 -10'
													variants={{
														hidden: {
															pathLength: 0
														},
														visible: {
															pathLength: 1,
															transition: {
																duration: 0.8,
																ease: 'easeInOut'
															}
														}
													}}
													initial='hidden'
													animate='visible'
												/>
											</motion.svg>
										</div>
									) : (
										<div className='grid size-24 place-content-center rounded-full border-[2.5px] border-red-600/75 bg-transparent bg-gradient-to-tr from-red-600/35 to-red-600/50 text-red-200 shadow-round-2xl shadow-red-600/50'>
											<motion.svg
												xmlns='http://www.w3.org/2000/svg'
												width='48'
												height='48'
												viewBox='0 0 24 24'
												fill='none'
												stroke='currentColor'
												strokeWidth='2'
												strokeLinecap='round'
												strokeLinejoin='round'
												className='tabler-icon tabler-icon-x'
												initial='hidden'
												animate='visible'
											>
												<motion.path
													d='M18 6l-12 12'
													variants={{
														hidden: {
															pathLength: 0
														},
														visible: {
															pathLength: 1,
															transition: {
																duration: 0.4,
																ease: 'easeInOut'
															}
														}
													}}
												/>
												<motion.path
													d='M6 6l12 12'
													variants={{
														hidden: {
															pathLength: 0,
															opacity: 0
														},
														visible: {
															pathLength: 1,
															opacity: 1,
															transition: {
																duration: 0.55,
																delay: 0.45,
																ease: 'easeInOut'
															}
														}
													}}
												/>
											</motion.svg>
										</div>
									)}
									<h3 className='text-center text-4xl font-semibold'>{t(`mode.${practiceSessionMeta.feedback.question.value}`)}</h3>
									<Button
										fw={500}
										radius={'xl'}
										disabled={!practiceSessionMeta.feedback}
										onClick={() => {
											if (practiceSessionMeta.feedback?.correct) {
												setPracticeSessionMethodsDisabled(true);
												setPracticeSessionMeta(meta => ({ ...meta, feedback: undefined }));
												playNextModeWithTimeout(1.5);
											} else {
												showQuestionExplanation();
											}
										}}
										className='disabled:bg-violet-600/25 disabled:opacity-50'
									>
										{practiceSessionMeta.feedback.correct ? t('continue') : t('explanation')}
									</Button>
								</>
							</motion.div>
						) : (
							// ** Explanation
							<motion.div
								layout={'position'}
								key={'explanation'}
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								transition={{
									duration: 1.5,
									type: 'spring'
								}}
								className='flex flex-col items-center'
							>
								<div className='flex max-w-md flex-col items-center space-y-12 rounded-lg bg-gradient-to-tr from-violet-700/10 to-violet-700/25 px-4 py-8 md:px-5 md:py-10'>
									<div className='grid grid-cols-2 gap-4'>
										<div className='flex flex-col items-center justify-between space-y-4 text-center'>
											<div>
												<p className='text-xs'>Сонгосон лад</p>
												<h3 className='text-lg font-semibold'>{practiceSessionMeta.feedback ? t(`mode.${practiceSessionMeta.feedback?.answer.value}`) : '--'}</h3>
											</div>
											<ActionIcon
												size={72}
												className='rounded-xl border-2 border-red-600/50 bg-transparent bg-gradient-to-tr from-red-600/20 to-red-600/40 text-red-300 transition-all duration-300 ease-in-out disabled:opacity-50'
												onClick={() => {
													if (practiceSessionMeta.feedback) {
														playMode(practiceSessionMeta.feedback.answer.notes);
													}
												}}
												disabled={practiceSessionMethodsDisabled}
											>
												<IconMusicX size={36} />
											</ActionIcon>
										</div>
										<div className='flex flex-col items-center justify-between space-y-4 text-center'>
											<div>
												<p className='text-xs'>Тоглосон лад</p>
												<h3 className='text-lg font-semibold'>{practiceSessionMeta.feedback ? t(`mode.${practiceSessionMeta.feedback?.question.value}`) : '--'}</h3>
											</div>
											<ActionIcon
												size={72}
												className='rounded-xl border-2 border-green-600/50 bg-transparent bg-gradient-to-tr from-green-600/20 to-green-600/40 text-green-300 transition-all duration-300 ease-in-out disabled:opacity-50'
												onClick={() => {
													if (practiceSessionMeta.feedback) {
														playMode(practiceSessionMeta.feedback.question.notes);
													}
												}}
												disabled={practiceSessionMethodsDisabled}
											>
												<IconMusicCheck size={36} />
											</ActionIcon>
										</div>
									</div>
									<Button
										fw={500}
										radius={'xl'}
										disabled={practiceSessionMethodsDisabled}
										onClick={() => {
											setPracticeSessionMethodsDisabled(true);
											hideQuestionExplanation();
											setPracticeSessionMeta(meta => ({ ...meta, feedback: undefined }));
											playNextModeWithTimeout(1.5);
										}}
										className='disabled:bg-violet-600/25 disabled:opacity-50'
									>
										{t('continue')}
									</Button>
								</div>
							</motion.div>
						)}
					</motion.div>
				</AnimatePresence>
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
