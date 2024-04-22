import dayjs from 'dayjs';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Chord, Note } from 'tonal';

import { calculatePercentage } from '@/utils/format.util';
import { notify } from '@/utils/notification.util';
import { ActionIcon, Button, Progress } from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { IconArrowLeft, IconSettings } from '@tabler/icons-react';

import PracticeResultDetailDrawer from '../components/overlay/practice-result-detail-drawer';
import PracticeResultModal from '../components/overlay/practice-result-modal';
import { ChordPracticeSettingsModal } from '../components/overlay/practice-settings-modal';
import { useEarTrainingQuestionSelection } from '../hooks/use-ear-training-question-selection';
import { useSamplerMethods } from '../hooks/use-sampler';
import EarTrainingLayout from '../layouts/ear-training-layout';
import { EarTrainingPracticeType, saveEarTrainingPracticeSessionSchema, useSaveEarTrainingPracticeSessionMutation } from '../services/practice-session.service';
import { addEarTrainingErrorLocal, fetchEarTrainingErrorLocal } from '../stores/ear-training-errors.store';
import {
	CHORD_TYPE_GROUPS,
	CHORD_WITHOUT_INVERSIONS,
	ChordPracticeSettings,
	chordPracticeSettingsSchema,
	DEFAULT_CHORD_PRACTICE_SETTINGS,
	NOTE_DURATION
} from '../types/practice-session-settings.type';
import { ChordQuestion, EarTrainingSessionMeta, EarTrainingSessionResult, Notes, SelectedChord } from '../types/practice-session.type';
import { refineChordPracticeResult } from '../utils/practice-session-result.util';

const PracticeChord = () => {
	// ** Translation
	const { t } = useTranslation();

	// ** Sampler Methods
	const { playNotes, releaseNotes } = useSamplerMethods();

	// ** Practice Settings States
	const chordPracticeSettingsForm = useForm<ChordPracticeSettings>({
		initialValues: DEFAULT_CHORD_PRACTICE_SETTINGS,
		validate: zodResolver(chordPracticeSettingsSchema)
	});
	const { values: chordPracticeSettings } = chordPracticeSettingsForm;
	const { TOTAL_QUESTIONS, ROOT_NOTE, INVERSIONS, CHORDS } = useMemo(() => {
		const TOTAL_QUESTIONS = chordPracticeSettings.numberOfQuestions;
		const ROOT_NOTE = chordPracticeSettings.fixedRoot.enabled ? chordPracticeSettings.fixedRoot.rootNote : null;
		const INVERSIONS = chordPracticeSettings.inversions.map(i => parseInt(i));
		const CHORDS = CHORD_TYPE_GROUPS[chordPracticeSettings.typeGroup].map(chordName => ({
			label: t(`chord.${chordName}`),
			value: chordName
		}));
		return { TOTAL_QUESTIONS, ROOT_NOTE, INVERSIONS, CHORDS };
	}, [chordPracticeSettings, t]);

	// ** Practice Session States
	const [practiceSessionQuestions, setPracticeSessionQuestions] = useState<Array<ChordQuestion>>([]);
	const [practiceSessionMeta, setPracticeSessionMeta] = useState<EarTrainingSessionMeta>({ errors: {} });
	const [selectedChord, setSelectedChord] = useState<SelectedChord | null>();
	const { totalAnsweredQuestions, totalCorrectAnswers, practiceScorePercentage, sessionEnded, practiceSessionQuestionGroups } = useMemo<EarTrainingSessionResult>(() => {
		const totalAnsweredQuestions = practiceSessionQuestions.filter(q => q.answered).length;
		const totalCorrectAnswers = practiceSessionQuestions.filter(q => q.correct).length;
		const sessionEnded = totalAnsweredQuestions === TOTAL_QUESTIONS;
		const practiceScorePercentage = sessionEnded ? calculatePercentage(totalCorrectAnswers, TOTAL_QUESTIONS) : 0;
		const practiceSessionQuestionGroups = sessionEnded ? refineChordPracticeResult(practiceSessionQuestions) : [];

		return {
			totalAnsweredQuestions,
			totalCorrectAnswers,
			sessionEnded,
			practiceScorePercentage,
			practiceSessionQuestionGroups
		};
	}, [TOTAL_QUESTIONS, practiceSessionQuestions]);

	// ** Practice Question Selection States and Methods
	const [chordErrors, setChordErrors] = useState<Record<string, string[]>>();
	const { selectNextQuestion } = useEarTrainingQuestionSelection({
		errors: chordErrors,
		questions: CHORDS
	});

	// ** Util States
	const [practiceSessionMethodsDisabled, setPracticeSessionMethodsDisabled] = useState<boolean>(false);
	const [practiceResultModalOpened, { open: openPracticeResultModal, close: closePracticeResultModal }] = useDisclosure(false);
	const [settingsModalOpened, { open: openSettingsModal, close: closeSettingsModal }] = useDisclosure(false);
	const [practiceDetailDrawerOpened, { open: openPracticeDetailDrawer, close: closePracticeDetailDrawer }] = useDisclosure(false);
	const [questionExplanationVisible, { open: showQuestionExplanation, close: hideQuestionExplanation }] = useDisclosure(false);

	// ** Effects
	useEffect(() => {
		if (practiceSessionQuestions.length == 0 && !sessionEnded) {
			void setUpChordErrors();
			openSettingsModal();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// ** Practice Session Handler Functions
	/**
	 * Sets the error state with ear training errors from local store
	 */
	const setUpChordErrors = async () => {
		try {
			const combinedErrors = await fetchEarTrainingErrorLocal('chordErrors');
			setChordErrors(combinedErrors);
		} catch (error) {
			console.error(error);
			setChordErrors({});
		}
	};

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
		let chordNotesBase = Chord.getChord(chordName, rootNote).notes;

		if (chordInversion !== undefined) {
			const chord = Chord.degrees([rootNote, chordName]);
			chordNotesBase = Array.from({ length: chordNotesBase.length }, (_, index) => chordInversion + index + 1).map(chord);
		}

		const rootNoteOctave = Note.get(chordNotesBase[0]).oct as number;

		if (rootNoteOctave >= 5) {
			chordNotesBase = chordNotesBase.map(n => Note.transposeOctaves(n, -1));
		}

		switch (chordPracticeSettings.playingMode) {
			case 'harmonic':
				return [chordNotesBase];
			case 'ascending':
				return [chordNotesBase];
			case 'descending':
				return chordNotesBase.reverse();
			case 'ascending-descending':
				return [...chordNotesBase, ...chordNotesBase.slice().reverse()];
			default:
				return [chordNotesBase];
		}
	};

	const playChord = (chordNotes: Notes) => {
		setPracticeSessionMethodsDisabled(true);
		releaseNotes();

		const noteDuration = 60 / (chordPracticeSettings.tempo * NOTE_DURATION[chordPracticeSettings.noteDuration]);
		playNotes(chordNotes, noteDuration);

		setTimeout(() => setPracticeSessionMethodsDisabled(false), chordNotes.length * noteDuration * 1000);
	};

	const playNextChord = () => {
		const rootNote = ROOT_NOTE ?? Note.fromMidi(Math.floor(Math.random() * 25) + 48);
		const chordName = CHORDS[Math.floor(Math.random() * CHORDS.length)].value;
		let chordNotesBase = Chord.getChord(chordName, rootNote).notes;
		let chordInversion: number | undefined = undefined;

		if (hasInversion(chordName)) {
			chordInversion = INVERSIONS[Math.floor(Math.random() * INVERSIONS.filter(i => i < chordNotesBase.length).length)];
		}

		const chordNotes = arrangeChordNotes(rootNote, chordName, chordInversion);

		releaseNotes();
		playChord(chordNotes);

		setPracticeSessionQuestions(prevQuestions => [
			...prevQuestions,
			{
				chordName,
				chordNotes,
				rootNote,
				answered: false,
				...(chordInversion !== undefined && { chordInversion })
			}
		]);
	};

	const replayChord = () => {
		releaseNotes();

		const previousQuestion = practiceSessionQuestions[practiceSessionQuestions?.length - 1];
		if (!previousQuestion || !!previousQuestion?.answered) {
			playNextChord();
		} else {
			playChord(previousQuestion.chordNotes);
		}
	};

	const answerQuestion = (answerChordName: string, inversion?: number) => {
		let answerCorrect: boolean;

		setPracticeSessionQuestions(sq => {
			const previousSessionQuestions = [...sq];
			const lastQuestion = previousSessionQuestions[previousSessionQuestions.length - 1];
			const chordNameCorrect = answerChordName === lastQuestion.chordName;
			answerCorrect = !!lastQuestion.chordInversion ? chordNameCorrect && inversion === lastQuestion.chordInversion : chordNameCorrect;

			previousSessionQuestions[previousSessionQuestions.length - 1] = {
				...lastQuestion,
				answered: true,
				correct: answerCorrect
			};

			if (!answerCorrect) {
				setPracticeSessionMeta(meta => {
					if (!(lastQuestion.chordName in meta.errors)) {
						meta.errors[lastQuestion.chordName] = [answerChordName];
					} else {
						meta.errors[lastQuestion.chordName] = [...meta.errors[lastQuestion.chordName], answerChordName];
					}

					return meta;
				});
			}

			setSelectedChord(null);
			return previousSessionQuestions;
		});

		if (practiceSessionQuestions.length === TOTAL_QUESTIONS) {
			releaseNotes(5);
			openPracticeResultModal();
			setPracticeSessionMeta(meta => ({ ...meta, endTime: dayjs() }));
			return;
		}

		if (!chordPracticeSettings.autoFeedback) {
		} else {
			setPracticeSessionMeta(meta => {
				const lastQuestion = practiceSessionQuestions[practiceSessionQuestions.length - 1];

				return {
					...meta,
					feedback: {
						correct: answerCorrect,
						answer: {
							value: answerChordName,
							notes: arrangeChordNotes(lastQuestion.rootNote, answerChordName, inversion)
						},
						question: {
							value: lastQuestion.chordName,
							notes: lastQuestion.chordNotes
						}
					}
				};
			});
		}

		playNextChord();
	};

	const resetSession = (options: { startSession?: boolean } = { startSession: true }) => {
		setPracticeSessionQuestions([]);
		if (options?.startSession) {
			playNextChord();
			setPracticeSessionMeta(sm => ({ ...sm, startTime: dayjs() }));
		}
	};

	const { mutateSaveEarTrainingPracticeSession, savePracticeSessionPending } = useSaveEarTrainingPracticeSessionMutation();

	const handleSaveEarTrainingPracticeSession = async () => {
		if (sessionEnded) {
			// ** Save errors locally
			try {
				void addEarTrainingErrorLocal(practiceSessionMeta.errors, 'chordErrors');
			} catch (error) {
				console.error(error);
			} finally {
				setPracticeSessionMeta({ ...practiceSessionMeta, errors: {} });
				void setUpChordErrors();
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
					type: EarTrainingPracticeType.ChordIdentification,
					duration: dayjs().diff(practiceSessionMeta?.startTime, 'seconds'),
					statistics: refineChordPracticeResult(practiceSessionQuestions)
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
			<EarTrainingLayout maxWidthKey='lg'>
				<motion.div
					layout={'position'}
					transition={{ duration: 1.5, type: 'spring' }}
				>
					<div className='space-y-4'>
						<h1 className='text-center text-xl font-semibold'>{t('chordIdentification')}</h1>

						<div className='space-y-2'>
							<Progress
								bg={'violet.8'}
								value={sessionEnded ? 100 : (totalAnsweredQuestions / TOTAL_QUESTIONS) * 100}
								classNames={{
									root: 'max-w-[240px] mx-auto w-full',
									section: 'transition-all duration-300 ease-in-out'
								}}
							/>
							<p className='text-center text-xs text-gray-300'>
								{sessionEnded ? `${practiceSessionQuestions.length}/${practiceSessionQuestions.length}` : `${practiceSessionQuestions.length}/${TOTAL_QUESTIONS}`}
							</p>
						</div>

						<div className='flex flex-col items-center space-y-16'>
							<ActionIcon
								p={4}
								radius='sm'
								variant='light'
								onClick={openSettingsModal}
								disabled={practiceSessionQuestions.length > 0 && !sessionEnded}
							>
								<IconSettings />
							</ActionIcon>
							<Button
								fw={500}
								radius={'xl'}
								disabled={practiceSessionMethodsDisabled || sessionEnded}
								onClick={() => {
									sessionEnded || !practiceSessionQuestions.length ? resetSession() : replayChord();
								}}
								className='disabled:bg-violet-600/25 disabled:opacity-50'
							>
								{sessionEnded ? t('restart') : !practiceSessionQuestions.length ? t('start') : t('replay')}
							</Button>
						</div>
					</div>
				</motion.div>
				<AnimatePresence
					mode='wait'
					initial={false}
					presenceAffectsLayout
				>
					<motion.div
						layout='position'
						transition={{
							duration: 1.5,
							type: 'spring'
						}}
						className='mt-16'
					>
						{!selectedChord ? (
							<motion.div
								layout='position'
								key={'chords'}
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								transition={{ duration: 1.5, type: 'spring' }}
								className='flex w-full flex-wrap items-center justify-center gap-6'
							>
								{CHORDS.map(chord => (
									<Button
										py={4}
										px={16}
										fw={400}
										variant='light'
										key={chord.value}
										onClick={() => {
											if (hasInversion(chord.value)) {
												setSelectedChord({
													name: chord.value,
													length: Chord.getChord(chord.value).intervals.length
												});
											} else {
												answerQuestion(chord.value);
											}
										}}
										disabled={sessionEnded || !practiceSessionQuestions.length || practiceSessionMethodsDisabled}
										className='rounded-full border-[1.5px] border-violet-700 text-violet-100 disabled:pointer-events-none disabled:bg-violet-600/25 disabled:opacity-50'
									>
										{chord.label}
									</Button>
								))}
							</motion.div>
						) : (
							<motion.div
								layout='position'
								key={'chord_inversions'}
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								transition={{ duration: 1.5, type: 'spring' }}
								className='flex w-full flex-col items-center justify-center'
							>
								<p className='text-center'>
									{t('selectedChord')}: <span className='font-semibold'>{t(`chord.${selectedChord.name}`)}</span>
								</p>

								<div className='mb-20 mt-6 flex w-full flex-wrap items-center justify-center gap-6'>
									{INVERSIONS.filter(i => {
										return i < selectedChord.length;
									}).map(inversion => (
										<Button
											py={4}
											px={16}
											fw={400}
											variant='light'
											key={inversion}
											onClick={() => answerQuestion(selectedChord.name, inversion)}
											disabled={sessionEnded || !practiceSessionQuestions.length || practiceSessionMethodsDisabled}
											className='rounded-full border border-violet-600 text-white disabled:pointer-events-none disabled:bg-violet-600/25 disabled:opacity-50'
										>
											{inversion !== 0 ? t('chordInversion', { inversion }) : t('chordInversion', { inversion })}
										</Button>
									))}
								</div>

								<Button
									color='violet.4'
									variant='subtle'
									leftSection={<IconArrowLeft size={16} />}
									onClick={() => {
										setSelectedChord(null);
									}}
								>
									{t('back')}
								</Button>
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
				practiceSessionSettings={chordPracticeSettings}
				practiceSessionQuestionGroups={practiceSessionQuestionGroups}
				translationNamespace='chord'
			/>

			<ChordPracticeSettingsModal
				opened={settingsModalOpened}
				close={closeSettingsModal}
				practiceSettingsForm={chordPracticeSettingsForm}
			/>
		</>
	);
};

export default PracticeChord;
