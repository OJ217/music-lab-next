import dayjs, { Dayjs } from 'dayjs';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Chord, Note } from 'tonal';

import { calculatePercentage, capitalize } from '@/utils/format.util';
import { notify } from '@/utils/notification.util';
import {
	Accordion,
	ActionIcon,
	Button,
	Center,
	Divider,
	Drawer,
	List,
	Modal,
	Paper,
	Progress,
	RingProgress,
	ScrollArea,
	ThemeIcon
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { IconArrowLeft, IconCheck, IconSettings, IconX } from '@tabler/icons-react';

import { ChordPracticeSettingsModal } from '../components/overlay/PracticeSettingsModal';
import { useSamplerMethods } from '../hooks/useSampler';
import EarTrainingLayout from '../layouts/EarTrainingLayout';
import {
	EarTrainingPracticeType,
	saveEarTrainingPracticeSessionSchema,
	useSaveEarTrainingPracticeSessionMutation
} from '../services/practice-session.service';
import {
	CHORD_TYPE_GROUPS,
	CHORD_WITHOUT_INVERSIONS,
	ChordPracticeSettings,
	DEFAULT_CHORD_PRACTICE_SETTINGS,
	NOTE_DURATION
} from '../types/practice-session-settings.type';
import { ChordQuestion, EarTrainingPracticeDetail, Notes, SelectedChord } from '../types/practice-session.type';
import { resolvePracticeResultMessage } from '../utils/practice-session.util';

const PracticeChord = () => {
	// ** Translation
	const { t } = useTranslation();

	// ** Sampler Methods
	const { playNotes, releaseNotes } = useSamplerMethods();

	// ** -------------------- STATES -------------------- **

	// ** Practice Settings
	const chordPracticeSettingsForm = useForm<ChordPracticeSettings>({
		initialValues: DEFAULT_CHORD_PRACTICE_SETTINGS
	});

	const { values: chordPracticeSettings } = chordPracticeSettingsForm;

	const CHORDS = useMemo(
		() =>
			CHORD_TYPE_GROUPS[chordPracticeSettings.chordTypeGroup].map(chordName => ({
				label: t(`chord.${chordName}`),
				value: chordName
			})),
		[chordPracticeSettings.chordTypeGroup, t]
	);
	const TOTAL_QUESTIONS = chordPracticeSettings.numberOfQuestions;
	const ROOT_NOTE = chordPracticeSettings.fixedRoot.enabled ? chordPracticeSettings.fixedRoot.rootNote : null;
	const INVERSIONS = chordPracticeSettings.inversions.map(i => parseInt(i));

	// ** Practice Session States
	const [practiceSessionQuestions, setPracticeSessionQuestions] = useState<Array<ChordQuestion>>([]);
	const [practiceSessionMeta, setPracticeSessionMeta] = useState<{ startTime?: Dayjs; endTime?: Dayjs }>();
	const [selectedChord, setSelectedChord] = useState<SelectedChord | null>();

	const {
		totalAnsweredQuestions,
		totalCorrectAnswers,
		practiceScorePercentage,
		sessionEnded,
		practiceResultMessage
	} = useMemo<{
		totalAnsweredQuestions: number;
		totalCorrectAnswers: number;
		sessionEnded: boolean;
		practiceScorePercentage: number;
		practiceResultMessage?: string;
	}>(() => {
		const totalAnsweredQuestions = practiceSessionQuestions.filter(q => q.answered).length;
		const totalCorrectAnswers = practiceSessionQuestions.filter(q => q.correct).length;
		const sessionEnded = totalAnsweredQuestions === TOTAL_QUESTIONS;
		const practiceScorePercentage = sessionEnded ? calculatePercentage(totalCorrectAnswers, TOTAL_QUESTIONS) : 0;
		const practiceResultMessage = sessionEnded
			? resolvePracticeResultMessage(totalCorrectAnswers, TOTAL_QUESTIONS)
			: undefined;

		return {
			totalAnsweredQuestions,
			totalCorrectAnswers,
			sessionEnded,
			practiceScorePercentage,
			practiceResultMessage
		};
	}, [TOTAL_QUESTIONS, practiceSessionQuestions]);

	// ** Util States
	const [practiceSessionMethodsDisabled, setPracticeSessionMethodsDisabled] = useState<boolean>(false);
	const [resultsModalOpened, { open: openResultsModal, close: closeResultsModal }] = useDisclosure(false);
	const [settingsModalOpened, { open: openSettingsModal, close: closeSettingsModal }] = useDisclosure(false);
	const [practiceDetailDrawerOpened, { open: openPracticeDetailDrawer, close: closePracticeDetailDrawer }] =
		useDisclosure(false);

	// ** -------------------- EFFECTS -------------------- **

	useEffect(() => {
		if (practiceSessionQuestions.length == 0) {
			openSettingsModal();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// ** Practice Session Handler Functions
	const hasInversion = (chordName: string) => {
		return !CHORD_WITHOUT_INVERSIONS.includes(chordName);
	};

	const playChord = (chordNotes: Notes) => {
		setPracticeSessionMethodsDisabled(true);

		const noteDuration = 60 / (chordPracticeSettings.tempo * NOTE_DURATION[chordPracticeSettings.noteDuration]);

		playNotes(chordNotes, noteDuration);

		setTimeout(() => setPracticeSessionMethodsDisabled(false), chordNotes.length * noteDuration * 1000);
	};

	const playRandomChord = () => {
		const rootNote = ROOT_NOTE ?? Note.fromMidi(Math.floor(Math.random() * 25) + 48);
		const chordName = CHORDS[Math.floor(Math.random() * CHORDS.length)].value;
		let chordNotesBase = Chord.getChord(chordName, rootNote).notes;
		let chordInversion: number;

		if (hasInversion(chordName)) {
			const chord = Chord.degrees([rootNote, chordName]);
			chordInversion =
				INVERSIONS[Math.floor(Math.random() * INVERSIONS.filter(i => i < chordNotesBase.length).length)];
			chordNotesBase = Array.from(
				{ length: chordNotesBase.length },
				(_, index) => chordInversion + index + 1
			).map(chord);
		}

		const rootNoteOctave = Note.get(chordNotesBase[0]).oct as number;

		if (rootNoteOctave >= 5) {
			chordNotesBase = chordNotesBase.map(n => Note.transposeOctaves(n, -1));
		}

		let chordNotes: Notes;

		switch (chordPracticeSettings.playingMode) {
			case 'harmonic':
				chordNotes = [chordNotesBase];
				break;
			case 'ascending':
				chordNotes = chordNotesBase;
				break;
			case 'descending':
				chordNotes = chordNotesBase.reverse();
				break;
			case 'ascending-descending':
				chordNotes = [...chordNotesBase, ...chordNotesBase.slice().reverse()];
				break;
			default:
				chordNotes = [chordNotesBase];
				break;
		}

		releaseNotes();
		playChord(chordNotes);

		setPracticeSessionQuestions(prevQuestions => [
			...prevQuestions,
			{
				chordName,
				chordNotes,
				answered: false,
				...(chordInversion !== undefined && { chordInversion })
			}
		]);
	};

	const replayChord = () => {
		releaseNotes();

		const previousQuestion = practiceSessionQuestions[practiceSessionQuestions?.length - 1];

		if (!previousQuestion || !!previousQuestion?.answered) {
			playRandomChord();
		} else {
			playChord(previousQuestion.chordNotes);
		}
	};

	const answerQuestion = (answerChordName: string, inversion?: number) => {
		setPracticeSessionQuestions(sq => {
			const updatedSessionQuestions = [...sq];
			const lastQuestion = updatedSessionQuestions[updatedSessionQuestions.length - 1];
			const chordNameCorrect = answerChordName === lastQuestion.chordName;
			const answerCorrect = !!lastQuestion.chordInversion
				? chordNameCorrect && inversion === lastQuestion.chordInversion
				: chordNameCorrect;

			updatedSessionQuestions[updatedSessionQuestions.length - 1] = {
				...lastQuestion,
				answered: true,
				correct: answerCorrect
			};

			setSelectedChord(null);
			return updatedSessionQuestions;
		});

		if (practiceSessionQuestions.length === TOTAL_QUESTIONS) {
			releaseNotes(5);
			openResultsModal();
			setPracticeSessionMeta(sm => ({ ...sm, endTime: dayjs() }));
			return;
		}

		playRandomChord();
	};

	const resetSession = (options: { startSession?: boolean } = { startSession: true }) => {
		setPracticeSessionQuestions([]);
		if (options?.startSession) {
			playRandomChord();
			setPracticeSessionMeta(sm => ({ ...sm, startTime: dayjs() }));
		}
	};

	const refinePracticeResult = (practiceSessionQuestions: Array<ChordQuestion>): Array<EarTrainingPracticeDetail> => {
		return Object.entries(
			practiceSessionQuestions.reduce(
				(questionGroup: Record<string, Array<ChordQuestion>>, question: ChordQuestion) => {
					const chord = question.chordName;

					if (!questionGroup[chord]) {
						questionGroup[chord] = [];
					}

					questionGroup[chord].push(question);

					return questionGroup;
				},
				{}
			)
		).map(([chord, questions]) => {
			const correct = questions.filter(q => q.correct).length;
			const incorrect = questions.length - correct;

			return {
				score: calculatePercentage(correct, questions.length),
				correct,
				incorrect,
				questionCount: questions.length,
				questionType: chord
			};
		});
	};

	const { mutateSaveEarTrainingPracticeSession, savePracticeSessionPending } =
		useSaveEarTrainingPracticeSessionMutation();

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
					type: EarTrainingPracticeType.ChordIdentification,
					duration: dayjs().diff(practiceSessionMeta?.startTime, 'seconds'),
					statistics: refinePracticeResult(practiceSessionQuestions)
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
					<h1 className='text-center text-xl font-semibold'>Chord Identification</h1>
					<div className='space-y-2'>
						<Progress
							value={sessionEnded ? 100 : (totalAnsweredQuestions / TOTAL_QUESTIONS) * 100}
							classNames={{
								root: 'max-w-[240px] mx-auto',
								section: 'transition-all duration-300 ease-in-out'
							}}
						/>
						<p className='text-center text-xs text-gray-300'>
							{sessionEnded
								? `${practiceSessionQuestions.length}/${practiceSessionQuestions.length}`
								: `${practiceSessionQuestions.length}/${TOTAL_QUESTIONS}`}
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

				<div className='mt-16 flex flex-col items-center space-y-12'>
					<Button
						fw={500}
						radius={'xl'}
						disabled={practiceSessionMethodsDisabled || sessionEnded}
						onClick={() => {
							sessionEnded || !practiceSessionQuestions.length ? resetSession() : replayChord();
						}}
						className='disabled:bg-violet-600/25 disabled:opacity-50'
					>
						{sessionEnded
							? 'Practice Again'
							: !practiceSessionQuestions.length
							  ? 'Start Practice'
							  : 'Replay Chord'}
					</Button>

					<AnimatePresence
						mode='wait'
						initial={false}
					>
						{!selectedChord ? (
							<motion.div
								key={'chords'}
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								transition={{
									duration: 0.3
								}}
								exit={{ opacity: 0 }}
								className='flex max-w-md flex-wrap items-center justify-center gap-6'
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
										disabled={
											sessionEnded ||
											!practiceSessionQuestions.length ||
											practiceSessionMethodsDisabled
										}
										className='rounded-full border border-violet-600 text-white disabled:pointer-events-none disabled:bg-violet-600/25 disabled:opacity-50'
									>
										{chord.label}
									</Button>
								))}
							</motion.div>
						) : (
							<motion.div
								key={'chord_inversions'}
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								transition={{
									duration: 0.3
								}}
								exit={{ opacity: 0 }}
								className='flex flex-col items-center justify-center gap-20'
							>
								<div className='space-y-6'>
									<p className='text-center'>
										Selected chord:{' '}
										<span className='font-semibold'>{t(`chord.${selectedChord.name}`)}</span>
									</p>
									<div className='flex max-w-md flex-wrap items-center justify-center gap-6'>
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
												disabled={
													sessionEnded ||
													!practiceSessionQuestions.length ||
													practiceSessionMethodsDisabled
												}
												className='rounded-full border border-violet-600 text-white disabled:pointer-events-none disabled:bg-violet-600/25 disabled:opacity-50'
											>
												{inversion !== 0 ? `Inversion ${inversion}` : 'Root inversion'}
											</Button>
										))}
									</div>
								</div>

								<Button
									color='violet.4'
									variant='subtle'
									leftSection={<IconArrowLeft size={16} />}
									onClick={() => {
										setSelectedChord(null);
									}}
								>
									Back
								</Button>
							</motion.div>
						)}
					</AnimatePresence>
				</div>
			</EarTrainingLayout>

			<Modal
				centered
				withinPortal
				padding={24}
				opened={resultsModalOpened && sessionEnded}
				onClose={() => {
					if (sessionEnded && savePracticeSessionPending) {
						return;
					}

					closeResultsModal();
				}}
				closeOnEscape={false}
				closeOnClickOutside={false}
				withCloseButton={false}
				title={'Practice Result'}
				classNames={{
					header: 'font-semibold text-sm'
				}}
			>
				<div className='mt-4 flex flex-col items-center space-y-8 text-center'>
					<div className='space-y-2'>
						<h3 className='text-3xl font-semibold text-violet-500'>{practiceScorePercentage}</h3>
						<p className='mx-auto max-w-[240px] text-sm font-medium'>
							You had {totalCorrectAnswers} correct answers and {TOTAL_QUESTIONS - totalCorrectAnswers}{' '}
							wrong answers. Keep going 🍀🚀.
						</p>
					</div>

					<div className='w-full max-w-[200px] space-y-2'>
						<Button
							p={0}
							h={'auto'}
							w={'auto'}
							color='violet.5'
							size='compact-sm'
							variant='transparent'
							onClick={openPracticeDetailDrawer}
						>
							See practice details
						</Button>

						<div className='flex w-full items-center gap-4'>
							<Button
								fullWidth
								variant='light'
								disabled={savePracticeSessionPending}
								onClick={async () => {
									await handleSaveEarTrainingPracticeSession();
									closeResultsModal();
									resetSession();
								}}
							>
								Retry
							</Button>
							<Button
								fullWidth
								loading={savePracticeSessionPending}
								onClick={async () => {
									await handleSaveEarTrainingPracticeSession();
									closeResultsModal();
									resetSession({ startSession: false });
								}}
							>
								Done
							</Button>
						</div>
					</div>
				</div>
			</Modal>

			<Drawer
				position='left'
				title='Practice Overview'
				opened={practiceDetailDrawerOpened && sessionEnded}
				onClose={closePracticeDetailDrawer}
				scrollAreaComponent={ScrollArea.Autosize}
				closeButtonProps={{ size: 'sm' }}
				classNames={{ title: 'font-semibold text-sm' }}
				withinPortal
			>
				<div className='mt-6 space-y-6'>
					<Paper
						p='sm'
						radius='md'
						withBorder
						className='flex items-stretch gap-4'
					>
						<div className='flex items-center gap-4'>
							<RingProgress
								size={80}
								roundCaps
								thickness={4}
								label={
									<Center>
										<ActionIcon
											color='teal'
											variant='light'
											radius='xl'
											size='xl'
										>
											<IconCheck />
										</ActionIcon>
									</Center>
								}
								sections={[
									{
										value: practiceScorePercentage,
										color: 'green'
									}
								]}
							/>
							<div>
								<h1 className='text-3xl font-medium'>{practiceScorePercentage}%</h1>
								<p className='text-gray-400'>
									{totalCorrectAnswers}/{TOTAL_QUESTIONS}
								</p>
							</div>
						</div>
						<Divider orientation='vertical' />
						<div className='flex flex-col justify-center space-y-1'>
							<p className='text-xs text-gray-400'>Message:</p>
							<p className='text-sm'>
								{resolvePracticeResultMessage(totalCorrectAnswers, TOTAL_QUESTIONS)}
							</p>
						</div>
					</Paper>

					<Accordion variant='separated'>
						<Accordion.Item value={'chord_practice_settings'}>
							<Accordion.Control
								classNames={{ label: 'text-sm' }}
								icon={
									<ThemeIcon
										p={4}
										radius='sm'
										variant='light'
									>
										<IconSettings />
									</ThemeIcon>
								}
							>
								Practice Settings
							</Accordion.Control>
							<Accordion.Panel>
								<List
									className='space-y-2 text-xs'
									listStyleType='initial'
								>
									<List.Item>{chordPracticeSettings.numberOfQuestions} questions</List.Item>
									<List.Item>{capitalize(chordPracticeSettings.playingMode)} playing mode</List.Item>
									<List.Item>{capitalize(chordPracticeSettings.chordTypeGroup)} chords</List.Item>
									{chordPracticeSettings.fixedRoot.enabled && (
										<List.Item>
											{chordPracticeSettings.fixedRoot.rootNote} fixed root note
										</List.Item>
									)}
								</List>
							</Accordion.Panel>
						</Accordion.Item>
					</Accordion>

					<div className='space-y-3'>
						{refinePracticeResult(practiceSessionQuestions).map(
							(
								{ questionType, incorrect, correct, score, questionCount },
								index,
								{ length: listLength }
							) => {
								return (
									<>
										<div
											key={questionType}
											className='space-y-1'
										>
											<div className='flex items-center justify-between gap-4 text-sm'>
												<p className='font-medium'>{t(`chord.${questionType}`)}</p>
												<div>
													<div className='flex items-center gap-2 font-medium'>
														<p>{score}%</p>
														<span className='h-[1.5px] w-1.5 bg-white'></span>
														<p>
															({correct}/{questionCount})
														</p>
													</div>
												</div>
											</div>
											<div className='flex items-center justify-end gap-6 text-xs'>
												<div className='flex items-center gap-3'>
													<div className='rounded-full border border-green-500 bg-green-500 bg-opacity-25'>
														<IconCheck
															size={12}
															stroke={1.2}
														/>
													</div>
													<p>{correct}</p>
												</div>
												<div className='flex items-center gap-3'>
													<IconX
														size={14}
														stroke={1.2}
														className='rounded-full border border-red-500 bg-red-500 bg-opacity-25'
													/>
													<p>{incorrect}</p>
												</div>
											</div>
										</div>
										{index + 1 < listLength && <Divider key={`divider-${index + 1}`} />}
									</>
								);
							}
						)}
					</div>
				</div>
			</Drawer>

			<ChordPracticeSettingsModal
				opened={settingsModalOpened}
				close={closeSettingsModal}
				practiceSettingsForm={chordPracticeSettingsForm}
			/>
		</>
	);
};

export default PracticeChord;
