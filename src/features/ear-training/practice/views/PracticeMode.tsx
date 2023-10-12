import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Mode, Note } from 'tonal';
import * as Tone from 'tone';

import { ActionIcon, Modal, Progress } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconSettings } from '@tabler/icons-react';

import { ModePracticeSettingsModal } from '../components/overlay/PracticeSettingsModal';
import EarTrainingLayout from '../layouts/EarTrainingLayout';
import { SelectItem } from '../types';

// Types and Interfaces
type PracticeResultLevel = 'high' | 'medium' | 'low';

interface ModeQuestion {
	modeName: string;
	modeNotes: string[];
	answered: boolean;
	correct?: boolean;
}

// CONSTANTS
const TOTAL_QUESTIONS = 10;

const PracticeMode = () => {
	// Translation
	const { t } = useTranslation('');
	const MODES: SelectItem[] = Mode.names().map(modeName => ({ label: t(`mode.${modeName}`), value: modeName }));

	// -------------------- STATES --------------------
	const [isMounted, setIsMounted] = useState<boolean>(false);
	const samplerInstance = useRef<Tone.Sampler>();

	// Practice Session States
	const [sessionQuestions, setSessionQuestions] = useState<Array<ModeQuestion>>([]);
	const [totalAnsweredQuestions, setTotalAnsweredQuestions] = useState<number>(0);
	const [totalCorrectAnswer, setTotalCorrectAnswer] = useState<number>(0);
	const [sessionEnded, setSessionEnded] = useState<boolean>(false);

	// Util States
	const [resultsModalOpened, setResultsModalOpened] = useState<boolean>(false);
	const [settingsModalOpened, { open: openSettingsModal, close: closeSettingsModal }] = useDisclosure(false);
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
			setIsMounted(true);
			openSettingsModal();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		if (isMounted) {
			initializeSampler();

			return () => {
				samplerInstance.current?.disconnect();
				samplerInstance.current = undefined;
			};
		}
	}, [isMounted, initializeSampler]);

	const playMode = (modeNotes: string[]) => {
		setButtonsDisabled(true);

		const pauseSeconds = 0.5;

		modeNotes.forEach((note, index) => {
			const time = Tone.now() + index * pauseSeconds;
			samplerInstance?.current?.triggerAttackRelease(note, '4n', time);
		});

		setTimeout(() => setButtonsDisabled(false), modeNotes.length * pauseSeconds * 1000);
	};

	const playRandomMode = () => {
		const rootNote = Note.fromMidi(Math.floor(Math.random() * 13) + 48);
		const modeName = MODES[Math.floor(Math.random() * MODES.length)].value;
		const modeNotes = [...Mode.notes(modeName, rootNote), Note.transpose(rootNote, 'P8')];

		console.log({ modeNotes, modeName });

		playMode(modeNotes);

		setSessionQuestions(prevQuestions => [...prevQuestions, { modeName: modeName, modeNotes, answered: false }]);
	};

	const replayMode = () => {
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
		setSessionQuestions(previousSessionQuestions => {
			let lastQuestion = previousSessionQuestions[previousSessionQuestions.length - 1];
			const answerCorrect = answerModeName === lastQuestion.modeName;

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
			setSessionEnded(true);
			setResultsModalOpened(true);
			return;
		}

		playRandomMode();
	};

	const resetSession = () => {
		setSessionQuestions([]);
		setTotalAnsweredQuestions(0);
		setTotalCorrectAnswer(0);
		setSessionEnded(false);
		playRandomMode();
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
		low: `Don't worry. Keep practicing. Practice leads to perfection 🙌🫂`,
		medium: 'Good Job! Keep it Up 🍀',
		high: 'You are on fire 🚀🔥'
	};

	return (
		<>
			<EarTrainingLayout>
				<div>
					<div className='space-y-4'>
						<div className='flex items-center justify-center gap-4'>
							<h1 className='text-center text-xl font-semibold'>Mode Identification Practice</h1>
							<ActionIcon
								p={4}
								radius='sm'
								variant='light'
								onClick={openSettingsModal}
							>
								<IconSettings />
							</ActionIcon>
						</div>
						<Progress
							color='#7E3AF2'
							value={(totalAnsweredQuestions / TOTAL_QUESTIONS) * 100}
							classNames={{
								root: 'bg-white max-w-[60%] mx-auto',
								section: 'transition-all duration-300 ease-in-out'
							}}
						/>
					</div>

					<div className='mt-24 flex flex-col items-center'>
						<button
							disabled={buttonsDisabled}
							onClick={sessionEnded ? resetSession : replayMode}
							className='rounded-3xl bg-violet-600 px-6 py-2 transition-all duration-500 ease-in-out hover:bg-violet-600/50 disabled:pointer-events-none disabled:opacity-50'
						>
							{sessionEnded
								? 'Practice Again'
								: !sessionQuestions.length
								? 'Start Practice'
								: 'Replay Mode'}
						</button>
						<div className='mt-12 flex max-w-sm flex-wrap items-center justify-center gap-6'>
							{MODES.map(mode => (
								<button
									key={mode.value}
									disabled={sessionEnded || !sessionQuestions.length || buttonsDisabled}
									onClick={() => answerQuestion(mode.value)}
									className='rounded-full border border-violet-600 bg-violet-600/25 px-4 py-1 text-sm transition-all duration-500 ease-in-out hover:bg-violet-600/50 hover:opacity-80 disabled:pointer-events-none disabled:opacity-50'
								>
									{mode.label}
								</button>
							))}
						</div>
					</div>
				</div>
			</EarTrainingLayout>

			<Modal
				centered
				padding={24}
				opened={resultsModalOpened}
				onClose={() => setResultsModalOpened(false)}
				closeButtonProps={{ size: 'sm' }}
				title={'Practice Session Result'}
				classNames={{
					header: 'font-medium'
				}}
			>
				<div className='mt-4 flex flex-col items-center space-y-8 text-center'>
					<div className='space-y-2'>
						<p className='text-lg'>
							Correct answer percentage -{' '}
							<span className='font-semibold'>
								{Math.round((totalCorrectAnswer / TOTAL_QUESTIONS) * 1000) / 10}%
							</span>
						</p>
						<p className='mx-auto max-w-[240px] text-sm font-medium'>
							{PracticeResultMessage[resolvePracticeResultLevel()]}
						</p>
					</div>
					<button
						onClick={() => {
							setResultsModalOpened(false);
							resetSession();
						}}
						className='rounded-3xl bg-violet-600 px-6 py-2 transition-all duration-500 ease-in-out hover:bg-violet-600/50 disabled:pointer-events-none disabled:opacity-50'
					>
						Practice Again
					</button>
				</div>
			</Modal>

			<ModePracticeSettingsModal
				opened={settingsModalOpened}
				close={closeSettingsModal}
			/>
		</>
	);
};

export default PracticeMode;
