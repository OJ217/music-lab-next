import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Chord, Note } from 'tonal';
import * as Tone from 'tone';

import { ActionIcon, Modal, Progress } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { IconSettings } from '@tabler/icons-react';

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
			setResultsModalOpened(true);
			return;
		}

		playRandomChord();
	};

	const resetSession = () => {
		setSessionQuestions([]);
		setTotalAnsweredQuestions(0);
		setTotalCorrectAnswer(0);
		setSessionEnded(false);
		playRandomChord();
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
							<h1 className='text-center text-xl font-semibold'>Chord Identification Practice</h1>
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
							onClick={sessionEnded ? resetSession : replayChord}
							className='rounded-3xl bg-violet-600 px-6 py-2 transition-all duration-500 ease-in-out hover:bg-violet-600/50 disabled:pointer-events-none disabled:opacity-50'
						>
							{sessionEnded
								? 'Practice Again'
								: !sessionQuestions.length
								? 'Start Practice'
								: 'Replay Chord'}
						</button>
						<div className='mt-12 flex max-w-md flex-wrap items-center justify-center gap-6'>
							{CHORDS.map(chord => (
								<button
									key={chord.value}
									disabled={sessionEnded || !sessionQuestions.length}
									onClick={() => answerQuestion(chord.value)}
									className='rounded-full border border-violet-600 bg-violet-600/25 px-4 py-1 text-sm transition-all duration-500 ease-in-out hover:bg-violet-600/50 hover:opacity-80 disabled:pointer-events-none disabled:opacity-50'
								>
									{chord.label}
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

			<ChordPracticeSettingsModal
				opened={settingsModalOpened}
				close={closeSettingsModal}
				practiceSettingsForm={chordPracticeSettingsForm}
			/>
		</>
	);
};

export default PracticeChord;
