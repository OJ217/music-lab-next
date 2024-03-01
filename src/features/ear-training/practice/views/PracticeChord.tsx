import dayjs, { Dayjs } from 'dayjs';
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

import PracticeResultDetailDrawer from '../components/overlay/PracticeResultDetailDrawer';
import PracticeResultModal from '../components/overlay/PracticeResultModal';
import { ChordPracticeSettingsModal } from '../components/overlay/PracticeSettingsModal';
import { useSamplerMethods } from '../hooks/useSampler';
import EarTrainingLayout from '../layouts/EarTrainingLayout';
import { EarTrainingPracticeType, saveEarTrainingPracticeSessionSchema, useSaveEarTrainingPracticeSessionMutation } from '../services/practice-session.service';
import {
	CHORD_TYPE_GROUPS,
	CHORD_WITHOUT_INVERSIONS,
	ChordPracticeSettings,
	chordPracticeSettingsSchema,
	DEFAULT_CHORD_PRACTICE_SETTINGS,
	NOTE_DURATION
} from '../types/practice-session-settings.type';
import { ChordQuestion, Notes, SelectedChord } from '../types/practice-session.type';
import { refineChordPracticeResult } from '../utils/practice-session-result.util';

const PracticeChord = () => {
	// ** Translation
	const { t } = useTranslation();

	// ** Sampler Methods
	const { playNotes, releaseNotes } = useSamplerMethods();

	// ** Practice Settings
	const chordPracticeSettingsForm = useForm<ChordPracticeSettings>({
		initialValues: DEFAULT_CHORD_PRACTICE_SETTINGS,
		validate: zodResolver(chordPracticeSettingsSchema)
	});

	const { values: chordPracticeSettings } = chordPracticeSettingsForm;

	const CHORDS = useMemo(
		() =>
			CHORD_TYPE_GROUPS[chordPracticeSettings.typeGroup].map(chordName => ({
				label: t(`chord.${chordName}`),
				value: chordName
			})),
		[chordPracticeSettings.typeGroup, t]
	);
	const TOTAL_QUESTIONS = chordPracticeSettings.numberOfQuestions;
	const ROOT_NOTE = chordPracticeSettings.fixedRoot.enabled ? chordPracticeSettings.fixedRoot.rootNote : null;
	const INVERSIONS = chordPracticeSettings.inversions.map(i => parseInt(i));

	// ** Practice Session States
	const [practiceSessionQuestions, setPracticeSessionQuestions] = useState<Array<ChordQuestion>>([]);
	const [practiceSessionMeta, setPracticeSessionMeta] = useState<{ startTime?: Dayjs; endTime?: Dayjs }>();
	const [selectedChord, setSelectedChord] = useState<SelectedChord | null>();

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
		const practiceSessionQuestionGroups = sessionEnded ? refineChordPracticeResult(practiceSessionQuestions) : [];

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
			chordInversion = INVERSIONS[Math.floor(Math.random() * INVERSIONS.filter(i => i < chordNotesBase.length).length)];
			chordNotesBase = Array.from({ length: chordNotesBase.length }, (_, index) => chordInversion + index + 1).map(chord);
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
			const answerCorrect = !!lastQuestion.chordInversion ? chordNameCorrect && inversion === lastQuestion.chordInversion : chordNameCorrect;

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
			openPracticeResultModal();
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
			<EarTrainingLayout>
				<motion.div
					layout
					transition={{ duration: 1.5, type: 'spring' }}
				>
					<div className='mb-12 space-y-4'>
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

				<motion.div
					layout
					transition={{
						duration: 1.5,
						type: 'spring'
					}}
					className='w-full max-w-lg'
				>
					<AnimatePresence
						mode='wait'
						presenceAffectsLayout
						initial={false}
					>
						<motion.div
							layout
							transition={{
								duration: 1.5,
								type: 'spring'
							}}
						>
							{!selectedChord ? (
								<motion.div
									layout
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
									layout
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
												{inversion !== 0 ? t('chordInversion', { inversion }) : t('rootInversion')}
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
				</motion.div>
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
