import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Chord, Note } from 'tonal';
import * as Tone from 'tone';

import { Modal, Progress } from '@mantine/core';

import EarTrainingLayout from '../layouts/EarTrainingLayout';
import { SelectItem } from '../types';

// Types and Interfaces
type PracticeResultLevel = 'high' | 'medium' | 'low';

interface ChordQuestion {
	chordName: string;
	chordNotes: string[];
	answered: boolean;
	correct?: boolean;
}

// CONSTANTS
const TOTAL_QUESTIONS = 10;
const CHORD_NAMES = ['maj', 'min', 'aug', 'dim', 'maj7', 'min7', '7', 'mM7', 'dim7', 'm7b5'];

const PracticeChord = () => {
	// Translation
	const { t } = useTranslation();
	const CHORDS: SelectItem[] = CHORD_NAMES.map(chordName => ({ label: t(`chord.${chordName}`), value: chordName }));

	// -------------------- STATES --------------------
	const [isMounted, setIsMounted] = useState<boolean>(false);
	const samplerInstance = useRef<Tone.Sampler>();
	// Practice Session States
	const [sessionQuestions, setSessionQuestions] = useState<Array<ChordQuestion>>([]);
	const [totalAnsweredQuestions, setTotalAnsweredQuestions] = useState<number>(0);
	const [totalCorrectAnswer, setTotalCorrectAnswer] = useState<number>(0);
	const [sessionEnded, setSessionEnded] = useState<boolean>(false);

	// Util States
	const [resultsModalOpened, setResultsModalOpened] = useState<boolean>(false);

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
		}
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

	// Practice Session Handler Functions
	const stopActiveChord = (releaseTime?: number | undefined) => {
		if (samplerInstance.current) {
			samplerInstance.current.releaseAll(releaseTime);
		}
	};

	const playRandomChord = () => {
		const rootNote = Note.fromMidi(Math.floor(Math.random() * 25) + 48);
		const chordName = CHORDS[Math.floor(Math.random() * CHORDS.length)].value;
		const chordNotes = Chord.getChord(chordName, rootNote).notes;

		console.log({ chordNotes, chordName });

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
						<h1 className='text-center text-xl font-semibold'>Music Lab - Chord Identification</h1>
						<Progress
							color='#7E3AF2'
							value={(totalAnsweredQuestions / TOTAL_QUESTIONS) * 100}
							classNames={{ root: '!bg-white max-w-[80%] mx-auto' }}
						/>
					</div>

					<div className='mt-24 flex flex-col items-center'>
						<button
							onClick={sessionEnded ? resetSession : replayChord}
							className='text rounded-3xl bg-purple-600 px-6 py-2 transition-opacity duration-200 ease-in-out disabled:opacity-50'
						>
							{sessionEnded
								? 'Practice Again'
								: !sessionQuestions.length
								? 'Start Practice'
								: 'Replay Chord'}
						</button>
						<div className='mt-12 flex max-w-sm flex-wrap items-center justify-center gap-6'>
							{CHORDS.map(chord => (
								<button
									key={chord.value}
									disabled={sessionEnded || !sessionQuestions.length}
									onClick={() => answerQuestion(chord.value)}
									className='rounded-full border border-purple-600 bg-purple-600/25 px-4 py-1 text-sm transition-opacity duration-200 ease-in-out disabled:opacity-50'
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
				title={'Practice Session Result'}
				classNames={{
					root: 'text-gray-900',
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
						className='text rounded-3xl bg-purple-600 px-6 py-2 text-white transition-opacity duration-200 ease-in-out disabled:opacity-50'
					>
						Practice Again
					</button>
				</div>
			</Modal>
		</>
	);
};

export default PracticeChord;
