import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Chord, Note } from 'tonal';
import * as Tone from 'tone';

import { capitalize } from '@/utils/format.util';
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
import { IconCheck, IconSettings, IconX } from '@tabler/icons-react';

import { ChordPracticeSettingsModal } from '../components/overlay/PracticeSettingsModal';
import EarTrainingLayout from '../layouts/EarTrainingLayout';
import { CHORD_TYPE_GROUPS, ChordPracticeSettings, DEFAULT_CHORD_PRACTICE_SETTINGS } from '../types/settings.type';

// Types and Interfaces
type PracticeResultLevel = 'high' | 'medium' | 'low';

interface ChordQuestion {
	chordName: string;
	chordNotes: string[];
	answered: boolean;
	correct?: boolean;
}

interface ChordPracticeDetail {
	chordName: string;
	correctAnswers: number;
	incorrectAnswers: number;
	correctPercentage: string;
	numberOfQuestions: number;
}

const PracticeChord = () => {
	// Translation
	const { t } = useTranslation();

	// -------------------- STATES --------------------
	const samplerInstance = useRef<Tone.Sampler>();

	// Practice Settings
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
	const INVERSIONS = chordPracticeSettings.inversions;

	// Practice Session States
	const [sessionQuestions, setSessionQuestions] = useState<Array<ChordQuestion>>([]);
	const [totalAnsweredQuestions, setTotalAnsweredQuestions] = useState<number>(0);
	const [totalCorrectAnswer, setTotalCorrectAnswer] = useState<number>(0);
	const [sessionEnded, setSessionEnded] = useState<boolean>(false);

	// Util States
	const [resultsModalOpened, { open: openResultsModal, close: closeResultsModal }] = useDisclosure(false);
	const [settingsModalOpened, { open: openSettingsModal, close: closeSettingsModal }] = useDisclosure(false);
	const [practiceDetailDrawerOpened, { open: openPracticeDetailDrawer, close: closePracticeDetailDrawer }] =
		useDisclosure(false);
	const [buttonsDisabled, setButtonsDisabled] = useState<boolean>(false);

	const initializeSampler = useCallback(() => {
		const sampler = new Tone.Sampler({
			urls: {
				C4: 'C4.mp3',
				'D#4': 'Ds4.mp3',
				'F#4': 'Fs4.mp3',
				A4: 'A4.mp3'
			},
			release: 2,
			baseUrl: 'https://tonejs.github.io/audio/salamander/',
			onload: () => {
				samplerInstance.current = sampler;
			}
		}).toDestination();
	}, []);

	useEffect(() => {
		if (typeof window !== 'undefined') {
			openSettingsModal();
			initializeSampler();

			return () => {
				samplerInstance.current?.disconnect();
				samplerInstance.current = undefined;
			};
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// Practice Session Handler Functions
	const stopActiveChord = (releaseTime?: number | undefined) => {
		if (samplerInstance.current) {
			samplerInstance.current.releaseAll(releaseTime);
		}
	};

	const playRandomChord = () => {
		const rootNote = ROOT_NOTE ?? Note.fromMidi(Math.floor(Math.random() * 25) + 48);
		const chordName = CHORDS[Math.floor(Math.random() * CHORDS.length)].value;
		const chordNotes = Chord.getChord(chordName, rootNote).notes;

		const chordDegree = Chord.degrees([rootNote, chordName]);
		const randomInversionStartIndex = parseInt(INVERSIONS[Math.floor(Math.random() * INVERSIONS.length)]) + 1;
		const randomInversion = Array.from(
			{ length: chordNotes.length },
			(_, index) => randomInversionStartIndex + index
		).map(i => {
			console.log(i);
			return chordDegree(i);
		});

		console.log({ chordNotes, chordName, randomInversion });

		stopActiveChord();

		if (samplerInstance.current) {
			samplerInstance.current.triggerAttack(chordNotes);
		}

		setSessionQuestions(prevQuestions => [...prevQuestions, { chordName, chordNotes, answered: false }]);
	};

	const replayChord = () => {
		stopActiveChord();

		const previousQuestion = sessionQuestions[sessionQuestions?.length - 1];

		if (!previousQuestion || !!previousQuestion?.answered) {
			console.log('New random chord');

			playRandomChord();
		} else {
			console.log('Previous chord');

			if (samplerInstance.current) {
				samplerInstance.current.triggerAttack(previousQuestion?.chordNotes);
			}
		}
	};

	const answerQuestion = (answerChordName: string) => {
		setSessionQuestions(previousSessionQuestions => {
			let lastQuestion = previousSessionQuestions[previousSessionQuestions.length - 1];
			const answerCorrect = answerChordName === lastQuestion.chordName;

			previousSessionQuestions[previousSessionQuestions.length - 1] = {
				...lastQuestion,
				answered: true,
				correct: answerCorrect
			};

			answerCorrect && setTotalCorrectAnswer(prevTotalCorrectAnswer => prevTotalCorrectAnswer + 1);
			return previousSessionQuestions;
		});

		setTotalAnsweredQuestions(prevTotalAnsweredQuestion => prevTotalAnsweredQuestion + 1);

		if (sessionQuestions.length === TOTAL_QUESTIONS) {
			stopActiveChord(5);
			setSessionEnded(true);
			openResultsModal();
			return;
		}

		playRandomChord();
	};

	const resetSession = (options: { startSession?: boolean } = { startSession: true }) => {
		setSessionQuestions([]);
		setTotalAnsweredQuestions(0);
		setTotalCorrectAnswer(0);
		setSessionEnded(false);
		options?.startSession && playRandomChord();
	};

	const resolvePracticeResultLevel = (): PracticeResultLevel => {
		const correctAnswerPercentage = Math.round((totalCorrectAnswer / TOTAL_QUESTIONS) * 100) / 100;

		switch (true) {
			case correctAnswerPercentage >= 0.8:
				return 'high';
			case correctAnswerPercentage >= 0.5:
				return 'medium';
			default:
				return 'low';
		}
	};

	const PracticeResultMessage: Record<PracticeResultLevel, string> = {
		low: `Don't worry. Keep moving forward. Practice leads to perfection 🙌🫂`,
		medium: 'Good job fella! Keep the momentum up 🍀',
		high: `Are you a maniac? Because you are on fire! 🚀🔥`
	};

	const refinePracticeDetail = (practiceSessionQuestions: Array<ChordQuestion>): Array<ChordPracticeDetail> => {
		return Object.entries(
			practiceSessionQuestions.reduce(
				(questionGroup: Record<string, Array<ChordQuestion>>, question: ChordQuestion) => {
					const mode = question.chordName;

					if (!questionGroup[mode]) {
						questionGroup[mode] = [];
					}

					questionGroup[mode].push(question);

					return questionGroup;
				},
				{}
			)
		).map(([mode, questions]) => {
			const correctAnswers = questions.filter(q => q.correct).length;
			const incorrectAnswers = questions.length - correctAnswers;

			return {
				chordName: t(`chord.${mode}`),
				correctAnswers,
				incorrectAnswers,
				correctPercentage: ((correctAnswers / questions.length) * 100).toFixed(1),
				numberOfQuestions: questions.length
			};
		});
	};

	return (
		<>
			<EarTrainingLayout>
				<div className='space-y-4'>
					<h1 className='text-center text-xl font-semibold'>Mode Identification</h1>
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
								? `${sessionQuestions.length}/${sessionQuestions.length}`
								: `${sessionQuestions.length}/${TOTAL_QUESTIONS}`}
						</p>
					</div>

					<div className='flex items-center justify-center gap-4'>
						<ActionIcon
							p={4}
							radius='sm'
							variant='light'
							onClick={openSettingsModal}
							disabled={sessionQuestions.length > 0 && !sessionEnded}
						>
							<IconSettings />
						</ActionIcon>
					</div>
				</div>

				<div className='mt-16 flex flex-col items-center'>
					<Button
						fw={500}
						radius={'xl'}
						disabled={buttonsDisabled}
						onClick={() => {
							sessionEnded ? resetSession() : replayChord();
						}}
						className='disabled:bg-violet-600/25 disabled:opacity-50'
					>
						{sessionEnded
							? 'Practice Again'
							: !sessionQuestions.length
							  ? 'Start Practice'
							  : 'Replay Interval'}
					</Button>

					<div className='mt-12 flex max-w-md flex-wrap items-center justify-center gap-6'>
						{CHORDS.map(chord => (
							<Button
								py={4}
								px={16}
								fw={400}
								variant='light'
								key={chord.value}
								onClick={() => answerQuestion(chord.value)}
								disabled={sessionEnded || !sessionQuestions.length || buttonsDisabled}
								className='rounded-full border border-violet-600 text-white disabled:pointer-events-none disabled:bg-violet-600/25 disabled:opacity-50'
							>
								{chord.label}
							</Button>
						))}
					</div>
				</div>
			</EarTrainingLayout>

			<Modal
				centered
				padding={24}
				opened={resultsModalOpened}
				onClose={closeResultsModal}
				closeButtonProps={{ size: 'sm' }}
				title={'Practice Result'}
				classNames={{
					header: 'font-semibold text-sm'
				}}
			>
				<div className='mt-4 flex flex-col items-center space-y-8 text-center'>
					<div className='space-y-2'>
						<h3 className='text-3xl font-semibold text-violet-500'>
							{Math.round((totalCorrectAnswer / TOTAL_QUESTIONS) * 1000) / 10}%
						</h3>
						<p className='mx-auto max-w-[240px] text-sm font-medium'>
							You had {totalCorrectAnswer} correct answers and {TOTAL_QUESTIONS - totalCorrectAnswer}{' '}
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
								onClick={() => {
									closeResultsModal();
									resetSession();
								}}
							>
								Retry
							</Button>
							<Button
								fullWidth
								onClick={() => {
									closeResultsModal();
									resetSession({ startSession: false });
									openSettingsModal();
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
				opened={practiceDetailDrawerOpened}
				onClose={closePracticeDetailDrawer}
				scrollAreaComponent={ScrollArea.Autosize}
				closeButtonProps={{ size: 'sm' }}
				classNames={{ title: 'font-semibold text-sm' }}
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
										value: Math.round((totalCorrectAnswer / TOTAL_QUESTIONS) * 1000) / 10,
										color: 'green'
									}
								]}
							/>
							<div>
								<h1 className='text-3xl font-medium'>
									{Math.round((totalCorrectAnswer / TOTAL_QUESTIONS) * 1000) / 10}%
								</h1>
								<p className='text-gray-400'>
									{totalCorrectAnswer}/{TOTAL_QUESTIONS}
								</p>
							</div>
						</div>
						<Divider orientation='vertical' />
						<div className='flex flex-col justify-center space-y-1'>
							<p className='text-xs text-gray-400'>Message:</p>
							<p className='text-sm'>{PracticeResultMessage[resolvePracticeResultLevel()]}</p>
						</div>
					</Paper>

					<Accordion variant='separated'>
						<Accordion.Item value={'interval_practice_settings'}>
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
									<List.Item>{capitalize(chordPracticeSettings.chordTypeGroup)} intervals</List.Item>
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
						{sessionEnded &&
							refinePracticeDetail(sessionQuestions).map(
								(
									{
										chordName,
										incorrectAnswers,
										correctAnswers,
										correctPercentage,
										numberOfQuestions
									},
									index,
									{ length: listLength }
								) => {
									return (
										<>
											<div
												key={chordName}
												className='space-y-1'
											>
												<div className='flex items-center justify-between gap-4 text-sm'>
													<p className='font-medium'>{chordName}</p>
													<div>
														<div className='flex items-center gap-2 font-medium'>
															<p>{correctPercentage}%</p>
															<span className='h-[1.5px] w-1.5 bg-white'></span>
															<p>
																({correctAnswers}/{numberOfQuestions})
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
														<p>{correctAnswers}</p>
													</div>
													<div className='flex items-center gap-3'>
														<IconX
															size={14}
															stroke={1.2}
															className='rounded-full border border-red-500 bg-red-500 bg-opacity-25'
														/>
														<p>{incorrectAnswers}</p>
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
