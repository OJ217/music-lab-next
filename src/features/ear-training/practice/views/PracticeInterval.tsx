import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Note } from 'tonal';
import * as Tone from 'tone';

import { ActionIcon, Modal, Progress } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { IconSettings } from '@tabler/icons-react';

import { IntervalPracticeSettingsModal } from '../components/overlay/PracticeSettingsModal';
import EarTrainingLayout from '../layouts/EarTrainingLayout';
import {
	DEFAULT_INTERVAL_PRACTICE_SETTINGS,
	INTERVAL_TYPE_GROUPS,
	IntervalPracticeSettings
} from '../types/settings.type';

// Types and Interfaces
type IntervalTuple = [string, string];
type PracticeResultLevel = 'high' | 'medium' | 'low';

interface IntervalQuestion {
	intervalName: string;
	intervalNotes: IntervalTuple;
	answered: boolean;
	correct?: boolean;
}

const PracticeInterval = () => {
	// Translation
	const { t } = useTranslation();

	// -------------------- STATES --------------------
	const samplerInstance = useRef<Tone.Sampler>();

	// Practice Settings
	const intervalPracticeSettingsForm = useForm<IntervalPracticeSettings>({
		initialValues: DEFAULT_INTERVAL_PRACTICE_SETTINGS
	});

	const { values: intervalPracticeSettings } = intervalPracticeSettingsForm;

	const INTERVALS = useMemo(
		() =>
			INTERVAL_TYPE_GROUPS[intervalPracticeSettings.intervalTypeGroup].map(intervalName => ({
				label: t(`interval.${intervalName}`),
				value: intervalName
			})),
		[intervalPracticeSettings.intervalTypeGroup, t]
	);
	const TOTAL_QUESTIONS = intervalPracticeSettings.numberOfQuestions;
	const ROOT_NOTE = intervalPracticeSettings.fixedRoot.enabled ? intervalPracticeSettings.fixedRoot.rootNote : null;

	// Practice Session States
	const [sessionQuestions, setSessionQuestions] = useState<Array<IntervalQuestion>>([]);
	const [totalAnsweredQuestions, setTotalAnsweredQuestions] = useState<number>(0);
	const [totalCorrectAnswer, setTotalCorrectAnswer] = useState<number>(0);
	const [sessionEnded, setSessionEnded] = useState<boolean>(false);

	// Util States
	const [resultsModalOpened, setResultsModalOpened] = useState<boolean>(false);
	const [settingsModalOpened, { open: openSettingsModal, close: closeSettingsModal }] = useDisclosure(false);

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
	const stopActiveInterval = (releaseTime?: number | undefined) => {
		if (samplerInstance.current) {
			samplerInstance.current.releaseAll(releaseTime);
		}
	};

	const playRandomInterval = () => {
		const rootNote = ROOT_NOTE ?? Note.fromMidi(Math.floor(Math.random() * 25) + 48);
		const intervalName = INTERVALS[Math.floor(Math.random() * INTERVALS.length)].value;
		const upperNote = Note.transpose(rootNote, intervalName);
		const intervalNotes: IntervalTuple = [rootNote, upperNote];

		console.log({ intervalName, intervalNotes });

		stopActiveInterval();

		if (samplerInstance.current) {
			samplerInstance.current.triggerAttack(intervalNotes);
		}

		setSessionQuestions(prevQuestions => [...prevQuestions, { intervalName, intervalNotes, answered: false }]);
	};

	const replayInterval = () => {
		stopActiveInterval();

		const previousQuestion = sessionQuestions[sessionQuestions?.length - 1];

		if (!previousQuestion || !!previousQuestion?.answered) {
			console.log('New random interval');

			playRandomInterval();
		} else {
			console.log('Previous interval');

			if (samplerInstance.current) {
				samplerInstance.current.triggerAttack(previousQuestion?.intervalNotes);
			}
		}
	};

	const answerQuestion = (answerIntervalName: string) => {
		setSessionQuestions(previousSessionQuestions => {
			let lastQuestion = previousSessionQuestions[previousSessionQuestions.length - 1];
			const answerCorrect = answerIntervalName === lastQuestion.intervalName;

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
			stopActiveInterval(5);
			setSessionEnded(true);
			setResultsModalOpened(true);
			return;
		}

		playRandomInterval();
	};

	const resetSession = () => {
		setSessionQuestions([]);
		setTotalAnsweredQuestions(0);
		setTotalCorrectAnswer(0);
		setSessionEnded(false);
		playRandomInterval();
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
							<h1 className='text-center text-xl font-semibold'>Interval Identification Practice</h1>
							<ActionIcon
								p={4}
								radius='sm'
								variant='light'
								onClick={openSettingsModal}
							>
								<IconSettings />
							</ActionIcon>
						</div>
						<div className='space-y-2'>
							<Progress
								color='#7E3AF2'
								value={(totalAnsweredQuestions / TOTAL_QUESTIONS) * 100}
								classNames={{
									root: 'bg-white max-w-[60%] mx-auto',
									section: 'transition-all duration-300 ease-in-out'
								}}
							/>
							<p className='text-center text-xs text-gray-500'>
								{sessionQuestions.length}/{TOTAL_QUESTIONS}
							</p>
						</div>
					</div>

					<div className='mt-24 flex flex-col items-center'>
						<button
							onClick={sessionEnded ? resetSession : replayInterval}
							className='rounded-3xl bg-violet-600 px-6 py-2 transition-all duration-500 ease-in-out hover:bg-violet-600/50 disabled:pointer-events-none disabled:opacity-50'
						>
							{sessionEnded
								? 'Practice Again'
								: !sessionQuestions.length
								? 'Start Practice'
								: 'Replay Interval'}
						</button>
						<div className='mt-12 flex max-w-md flex-wrap items-center justify-center gap-6'>
							{INTERVALS.map(interval => (
								<button
									key={interval.value}
									disabled={sessionEnded || !sessionQuestions.length}
									onClick={() => answerQuestion(interval.value)}
									className='rounded-full border border-violet-600 bg-violet-600/25 px-4 py-1 text-sm transition-all duration-500 ease-in-out hover:bg-violet-600/50 hover:opacity-80 disabled:pointer-events-none disabled:opacity-50'
								>
									{interval.label}
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

			<IntervalPracticeSettingsModal
				opened={settingsModalOpened}
				close={closeSettingsModal}
				practiceSettingsForm={intervalPracticeSettingsForm}
			/>
		</>
	);
};

export default PracticeInterval;
