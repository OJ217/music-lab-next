import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Note, Scale } from 'tonal';

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
import { useForm, zodResolver } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { IconCheck, IconSettings, IconX } from '@tabler/icons-react';

import { ModePracticeSettingsModal } from '../components/overlay/PracticeSettingsModal';
import { useSamplerMethods } from '../hooks/useSampler';
import EarTrainingLayout from '../layouts/EarTrainingLayout';
import {
	DEFAULT_MODE_PRACTICE_SETTINGS,
	MODE_TYPE_GROUPS,
	ModePracticeSettings,
	modePracticeSettingsSchema,
	NOTE_DURATION
} from '../types/practice-session-settings.type';
import { ModePracticeDetail, ModeQuestion, Notes } from '../types/practice-session.type';
import { resolvePracticeResultMessage } from '../utils/practice-session.util';

// CONSTANTS
const TOTAL_QUESTIONS = 10;

const PracticeMode = () => {
	// ** Translation
	const { t } = useTranslation();

	// ** Sampler Methods
	const { playNotes, releaseNotes } = useSamplerMethods();

	// -------------------- STATES --------------------

	// ** Practice Settings
	const modePracticeSettingsForm = useForm<ModePracticeSettings>({
		initialValues: DEFAULT_MODE_PRACTICE_SETTINGS,
		validate: zodResolver(modePracticeSettingsSchema)
	});

	const { values: modePracticeSettings } = modePracticeSettingsForm;

	const MODES = useMemo(
		() =>
			MODE_TYPE_GROUPS[modePracticeSettings.modeTypeGroup].map(modeName => ({
				label: t(`mode.${modeName}`),
				value: modeName
			})),
		[modePracticeSettings.modeTypeGroup, t]
	);
	const TOTAL_QUESTIONS = modePracticeSettings.numberOfQuestions;
	const ROOT_NOTE = modePracticeSettings.fixedRoot.enabled ? modePracticeSettings.fixedRoot.rootNote : null;

	// ** Practice Session States
	const [sessionQuestions, setSessionQuestions] = useState<Array<ModeQuestion>>([]);

	const { totalAnsweredQuestions, totalCorrectAnswers, sessionEnded, practiceResultMessage } = useMemo<{
		totalAnsweredQuestions: number;
		totalCorrectAnswers: number;
		sessionEnded: boolean;
		practiceResultMessage?: string;
	}>(() => {
		const totalAnsweredQuestions = sessionQuestions.filter(q => q.answered).length;
		const totalCorrectAnswers = sessionQuestions.filter(q => q.correct).length;
		const sessionEnded = totalAnsweredQuestions === TOTAL_QUESTIONS;
		const practiceResultMessage = sessionEnded
			? resolvePracticeResultMessage(totalCorrectAnswers, TOTAL_QUESTIONS)
			: undefined;

		return {
			totalAnsweredQuestions,
			totalCorrectAnswers,
			sessionEnded,
			practiceResultMessage
		};
	}, [TOTAL_QUESTIONS, sessionQuestions]);

	// ** Util States
	const [resultsModalOpened, { open: openResultsModal, close: closeResultsModal }] = useDisclosure(false);
	const [settingsModalOpened, { open: openSettingsModal, close: closeSettingsModal }] = useDisclosure(false);
	const [practiceDetailDrawerOpened, { open: openPracticeDetailDrawer, close: closePracticeDetailDrawer }] =
		useDisclosure(false);
	const [buttonsDisabled, setButtonsDisabled] = useState<boolean>(false);

	// ** -------------------- EFFECTS -------------------- **

	useEffect(() => {
		if (sessionQuestions.length == 0) {
			openSettingsModal();
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// ** Practice Session Handler Functions
	const playMode = (modeNotes: Notes) => {
		setButtonsDisabled(true);

		const noteDuration = 60 / (modePracticeSettings.tempo * NOTE_DURATION[modePracticeSettings.noteDuration]);

		playNotes(modeNotes, noteDuration);

		setTimeout(() => setButtonsDisabled(false), modeNotes.length * noteDuration * 1000);
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
			case 'descending':
				modeNotes = [...modeNotesBase].reverse();
				break;
			case 'ascending-descending':
				modeNotes = [...modeNotesBase, ...modeNotesBase.slice().reverse()];
				break;
			default:
				modeNotes = modeNotesBase;
				break;
		}

		releaseNotes();
		playMode(modeNotes);

		console.log({ modeNotes: modeNotesBase, modeName });

		setSessionQuestions(prevQuestions => [...prevQuestions, { modeName: modeName, modeNotes, answered: false }]);
	};

	const replayMode = () => {
		releaseNotes();
		const previousQuestion = sessionQuestions[sessionQuestions?.length - 1];

		if (!previousQuestion || !!previousQuestion?.answered) {
			console.log('New random mode');

			playRandomMode();
		} else {
			console.log('Previous mode');

			playMode(previousQuestion.modeNotes);
		}
	};

	const answerQuestion = (answerModeName: string) => {
		setSessionQuestions(sq => {
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

		if (sessionQuestions.length === TOTAL_QUESTIONS) {
			releaseNotes(5);
			openResultsModal();
			return;
		}

		playRandomMode();
	};

	const resetSession = (options: { startSession?: boolean } = { startSession: true }) => {
		setSessionQuestions([]);
		options?.startSession && playRandomMode();
	};

	const refinePracticeResult = (practiceSessionQuestions: Array<ModeQuestion>): Array<ModePracticeDetail> => {
		const result = Object.entries(
			practiceSessionQuestions.reduce(
				(questionGroup: Record<string, Array<ModeQuestion>>, question: ModeQuestion) => {
					const mode = question.modeName;

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
				modeName: t(`mode.${mode}`),
				correctAnswers,
				incorrectAnswers,
				correctPercentage: ((correctAnswers / questions.length) * 100).toFixed(1),
				numberOfQuestions: questions.length
			};
		});

		console.log({ result });

		return result;
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
							sessionEnded ? resetSession() : replayMode();
						}}
						className='disabled:bg-violet-600/25 disabled:opacity-50'
					>
						{sessionEnded ? 'Practice Again' : !sessionQuestions.length ? 'Start Practice' : 'Replay Mode'}
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
								disabled={sessionEnded || !sessionQuestions.length || buttonsDisabled}
								className='rounded-full border border-violet-600 text-white disabled:pointer-events-none disabled:bg-violet-600/25 disabled:opacity-50'
							>
								{mode.label}
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
							{Math.round((totalCorrectAnswers / TOTAL_QUESTIONS) * 1000) / 10}%
						</h3>
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
				{sessionEnded ? (
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
											value: Math.round((totalCorrectAnswers / TOTAL_QUESTIONS) * 1000) / 10,
											color: 'green'
										}
									]}
								/>
								<div>
									<h1 className='text-3xl font-medium'>
										{Math.round((totalCorrectAnswers / TOTAL_QUESTIONS) * 1000) / 10}%
									</h1>
									<p className='text-gray-400'>
										{totalCorrectAnswers}/{TOTAL_QUESTIONS}
									</p>
								</div>
							</div>
							<Divider orientation='vertical' />
							<div className='flex flex-col justify-center space-y-1'>
								<p className='text-xs text-gray-400'>Message:</p>
								<p className='text-sm'>{practiceResultMessage}</p>
							</div>
						</Paper>

						<Accordion variant='separated'>
							<Accordion.Item value={'mode_practice_settings'}>
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
										<List.Item>{modePracticeSettings.numberOfQuestions} questions</List.Item>
										<List.Item>
											{capitalize(modePracticeSettings.playingMode)} playing mode
										</List.Item>
										<List.Item>{capitalize(modePracticeSettings.modeTypeGroup)} modes</List.Item>
										{modePracticeSettings.fixedRoot.enabled && (
											<List.Item>
												{modePracticeSettings.fixedRoot.rootNote} fixed root note
											</List.Item>
										)}
									</List>
								</Accordion.Panel>
							</Accordion.Item>
						</Accordion>

						<div className='space-y-3'>
							{refinePracticeResult(sessionQuestions).map(
								(
									{
										modeName,
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
												key={modeName}
												className='space-y-1'
											>
												<div className='flex items-center justify-between gap-4 text-sm'>
													<p className='font-medium'>{modeName}</p>
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
				) : (
					<div>Practice session not ended</div>
				)}
			</Drawer>

			<ModePracticeSettingsModal
				opened={settingsModalOpened}
				close={closeSettingsModal}
				practiceSettingsForm={modePracticeSettingsForm}
			/>
		</>
	);
};

export default PracticeMode;
