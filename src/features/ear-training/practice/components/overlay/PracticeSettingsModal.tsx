import { useState } from 'react';
import { IntervalLiteral, Mode, NoteLiteral } from 'tonal';

import { notify } from '@/utils/notification.util';
import { Box, Button, Collapse, Modal, MultiSelect, NumberInput, Select, Switch } from '@mantine/core';
import { useForm } from '@mantine/form';

import { SelectData } from '../../types';

type PlayingMode = 'ascending' | 'descending' | 'harmonic' | 'ascending-descending';
type NonHarmonicPlayingMode = Exclude<PlayingMode, 'harmonic'>;

const playingModeSelectOptions: SelectData<PlayingMode> = [
	{ label: 'Ascending', value: 'ascending' },
	{ label: 'Descending', value: 'descending' },
	{ label: 'Harmonic', value: 'harmonic' }
];

const nonHarmonicPlayingModeSelectOptions: SelectData<NonHarmonicPlayingMode> = [
	{ label: 'Ascending', value: 'ascending' },
	{ label: 'Descending', value: 'descending' },
	{ label: 'Ascending and Descending', value: 'ascending-descending' }
];

const fixedRootNotes = ['C4', 'C#4', 'D4', 'D#4', 'E4', 'F4', 'F#4', 'G4', 'G#4', 'A4', 'A#4', 'B4'];
const fixedRootNoteOptions = fixedRootNotes.map(note => ({ label: note, value: note }));

interface IPracticeSettingsModalProps {
	opened: boolean;
	close: () => void;
}

// *****************************
// ** Interval Practice Modal **
// *****************************
interface IntervalPracticeSettings {
	numberOfQuestions: number;
	intervalTypeGroup: IntervalTypeGroup;
	fixedRoot: {
		enabled: boolean;
		rootNote: NoteLiteral;
	};
	playingMode: PlayingMode;
	tempo: number;
	questionDuration: number;
	autoFeedback: boolean;
}

const defaultIntervalPracticeSettings: IntervalPracticeSettings = {
	numberOfQuestions: 10,
	intervalTypeGroup: 'all',
	fixedRoot: {
		enabled: false,
		rootNote: 'C4'
	},
	playingMode: 'harmonic',
	tempo: 80,
	questionDuration: 30,
	autoFeedback: true
};

const INTERVAL_TYPE_GROUPS = {
	all: ['m2', 'M2', 'm3', 'M3', 'P4', 'd5', 'P5', 'm6', 'M6', 'm7', 'M7', 'P8'],
	major: ['M2', 'M3', 'M6', 'M7'],
	minor: ['m2', 'm3', 'm6', 'm7'],
	perfect: ['P4', 'P5', 'P8'],
	custom: []
};

type IntervalTypeGroup = keyof typeof INTERVAL_TYPE_GROUPS;

const INTERVAL_TYPE_GROUP_SELECT_OPTIONS: SelectData<IntervalTypeGroup> = [
	{ value: 'all', label: 'All' },
	{ value: 'major', label: `Major (${INTERVAL_TYPE_GROUPS.major.join(', ')})` },
	{ value: 'minor', label: `Minor (${INTERVAL_TYPE_GROUPS.minor.join(', ')})` },
	{ value: 'perfect', label: `Perfect (${INTERVAL_TYPE_GROUPS.perfect.join(', ')})` },
	{ value: 'custom', label: 'Custom' }
];

export const IntervalPracticeSettingsModal: React.FC<IPracticeSettingsModalProps> = ({ opened, close }) => {
	const [advancedSettingsOpened, setAdvancedSettingsOpened] = useState<boolean>(false);

	const practiceSettingsForm = useForm<IntervalPracticeSettings>({
		initialValues: defaultIntervalPracticeSettings
	});

	const handleSettingsFormSubmit = (settings: IntervalPracticeSettings) => {
		console.log({ intervalPracticeSettings: settings });

		notify({
			type: 'success',
			title: 'Practice settings configured succesfully',
			message: `${settings.numberOfQuestions} questions will be played in ${settings.playingMode} mode${
				settings.fixedRoot.enabled ? ' with a fixed ' + settings.fixedRoot.rootNote + ' root note' : ''
			}.`
		});

		close();
	};

	return (
		<Modal
			centered
			opened={opened}
			onClose={() => {
				close();
				setAdvancedSettingsOpened(false);
			}}
			closeButtonProps={{ size: 'sm' }}
			title={'Practice Settings'}
		>
			<form
				onSubmit={practiceSettingsForm.onSubmit(handleSettingsFormSubmit)}
				onReset={practiceSettingsForm.onReset}
				className='w-full max-w-md space-y-8'
			>
				<section className='space-y-6'>
					<NumberInput
						min={1}
						max={100}
						allowNegative={false}
						clampBehavior='strict'
						description='Number of questions'
						placeholder='Between 5 - 100'
						{...practiceSettingsForm.getInputProps('numberOfQuestions')}
						classNames={{
							input: 'focus:bg-violet-600/25'
						}}
					/>

					<Select
						allowDeselect={false}
						maxDropdownHeight={120}
						data={INTERVAL_TYPE_GROUP_SELECT_OPTIONS}
						description='Intervals'
						placeholder='Select type of intervals to hear'
						{...practiceSettingsForm.getInputProps('intervalTypeGroup')}
						classNames={{
							input: 'focus-within:bg-violet-600/25',
							section: 'hidden'
						}}
					/>

					<div>
						<Switch
							label='Root note'
							checked={practiceSettingsForm.values.fixedRoot.enabled}
							onChange={e => practiceSettingsForm.setFieldValue('fixedRoot.enabled', e.target.checked)}
						/>

						<Collapse in={practiceSettingsForm.values.fixedRoot.enabled}>
							<Box h={16} />
						</Collapse>

						<Collapse in={practiceSettingsForm.values.fixedRoot.enabled}>
							<Select
								allowDeselect={false}
								data={fixedRootNoteOptions}
								description='Root note'
								placeholder='Select toor note'
								{...practiceSettingsForm.getInputProps('fixedRoot.rootNote')}
								classNames={{
									input: 'focus:bg-violet-600/25',
									section: 'hidden'
								}}
							/>
						</Collapse>
					</div>

					<div>
						<Collapse in={advancedSettingsOpened}>
							<div className='space-y-4'>
								<p>Advanced Settings</p>
								<div className='space-y-6'>
									<Select
										allowDeselect={false}
										maxDropdownHeight={120}
										data={playingModeSelectOptions}
										description='Playing mode'
										placeholder='Select playing mode'
										{...practiceSettingsForm.getInputProps('playingMode')}
										classNames={{
											input: 'focus-within:bg-violet-600/25',
											section: 'hidden'
										}}
									/>
									<div className='grid grid-cols-2 gap-4'>
										<NumberInput
											min={60}
											max={160}
											allowNegative={false}
											description='Tempo'
											placeholder='BPM between 60 - 160'
											{...practiceSettingsForm.getInputProps('tempo')}
											classNames={{
												input: 'focus:bg-violet-600/25'
											}}
										/>
										<NumberInput
											min={5}
											max={30}
											allowNegative={false}
											description='Question duration'
											placeholder='Between 5 - 30'
											{...practiceSettingsForm.getInputProps('questionDuration')}
											classNames={{
												input: 'focus:bg-violet-600/25'
											}}
										/>
									</div>
									<Switch
										label='Auto feedback'
										checked={practiceSettingsForm.values.autoFeedback}
										onChange={e =>
											practiceSettingsForm.setFieldValue('autoFeedback', e.target.checked)
										}
									/>
								</div>
							</div>
						</Collapse>

						<Collapse in={advancedSettingsOpened}>
							<Box h={16} />
						</Collapse>

						<Button
							p={0}
							h={'auto'}
							w={'auto'}
							size='compact-xs'
							variant='transparent'
							onClick={() => setAdvancedSettingsOpened(!advancedSettingsOpened)}
						>
							{advancedSettingsOpened ? 'Hide' : 'Advanced settings'}
						</Button>
					</div>
				</section>

				<div className='flex justify-end gap-2'>
					<Button
						type='reset'
						variant='light'
						disabled={!practiceSettingsForm.isDirty()}
					>
						Reset
					</Button>
					<Button type='submit'>Done</Button>
				</div>
			</form>
		</Modal>
	);
};

// *****************************
// ** Chord Practice Modal **
// *****************************
interface ChordPracticeSettings {
	numberOfQuestions: number;
	chordTypeGroup: ChordTypeGroup;
	inversions: string[];
	fixedRoot: {
		enabled: boolean;
		rootNote: IntervalLiteral;
	};
	playingMode: PlayingMode;
	tempo: number;
	questionDuration: number;
	autoFeedback: boolean;
}

const DEFAULT_CHORD_PRACTICE_SETTINGS: ChordPracticeSettings = {
	numberOfQuestions: 10,
	chordTypeGroup: 'all',
	inversions: ['0', '1', '2', '3'],
	fixedRoot: {
		enabled: false,
		rootNote: 'C4'
	},
	playingMode: 'harmonic',
	tempo: 80,
	questionDuration: 30,
	autoFeedback: true
};

type ChordTypeGroup = keyof typeof CHORD_TYPE_GROUPS;

const CHORD_TYPE_GROUPS = {
	all: ['maj', 'min', 'aug', 'dim', 'maj7', 'min7', '7', 'mM7', 'dim7', 'm7b5', 'maj7#5'],
	triad: ['maj', 'min', 'aug', 'dim'],
	seventh: ['7', 'maj7', 'min7', 'mM7', 'dim7', 'm7b5', 'maj7#5'],
	major: ['maj', '7', 'maj7'],
	minor: ['min', 'min7', 'mM7'],
	dim_and_aug: ['aug', 'dim', 'dim7', 'maj7#5'],
	dim_and_aug_triad: ['dim', 'aug'],
	dim_and_aug_seventh: ['dim7', 'm7b5', 'maj7#5'],
	custom: []
};

const CHORD_TYPE_GROUP_SELECT_OPTIONS: SelectData<ChordTypeGroup> = [
	{ value: 'all', label: 'All' },
	{ value: 'triad', label: 'Triad' },
	{ value: 'seventh', label: 'Seventh' },
	{ value: 'major', label: 'Major' },
	{ value: 'minor', label: 'Minor' },
	{ value: 'dim_and_aug', label: 'Diminished and Augmented' },
	{ value: 'dim_and_aug_triad', label: 'Diminished and Augmented Triad' },
	{ value: 'dim_and_aug_seventh', label: 'Diminished and Augmented Seventh' },
	{ value: 'custom', label: 'Custom' }
];

const CHORD_INVERSION_SELECT_OPTIONS: SelectData<string> = [
	{ value: '0', label: 'Root Inversion' },
	{ value: '1', label: '1st Inversion' },
	{ value: '2', label: '2nd Inversion' },
	{ value: '3', label: '3rd Inversion' }
];

export const ChordPracticeSettingsModal: React.FC<IPracticeSettingsModalProps> = ({ opened, close }) => {
	const [advancedSettingsOpened, setAdvancedSettingsOpened] = useState<boolean>(false);

	const practiceSettingsForm = useForm<ChordPracticeSettings>({
		initialValues: DEFAULT_CHORD_PRACTICE_SETTINGS
	});

	const handleSettingsFormSubmit = (settings: ChordPracticeSettings) => {
		console.log({ intervalPracticeSettings: settings });

		notify({
			type: 'success',
			title: 'Practice settings configured succesfully',
			message: `${settings.numberOfQuestions} questions will be played in ${settings.playingMode} mode${
				settings.fixedRoot.enabled ? ' with a fixed ' + settings.fixedRoot.rootNote + ' root note' : ''
			}.`
		});

		close();
	};

	return (
		<Modal
			centered
			opened={opened}
			onClose={() => {
				close();
				setAdvancedSettingsOpened(false);
			}}
			closeButtonProps={{ size: 'sm' }}
			title={'Practice Settings'}
		>
			<form
				onSubmit={practiceSettingsForm.onSubmit(handleSettingsFormSubmit)}
				onReset={practiceSettingsForm.onReset}
				className='w-full max-w-md space-y-8'
			>
				<section className='space-y-6'>
					<NumberInput
						min={1}
						max={100}
						allowNegative={false}
						clampBehavior='strict'
						description='Number of questions'
						placeholder='Between 5 - 100'
						{...practiceSettingsForm.getInputProps('numberOfQuestions')}
						classNames={{
							input: 'focus:bg-violet-600/25'
						}}
					/>
					<Select
						allowDeselect={false}
						maxDropdownHeight={160}
						data={CHORD_TYPE_GROUP_SELECT_OPTIONS}
						description='Chord'
						placeholder='Select type of chords'
						{...practiceSettingsForm.getInputProps('chordTypeGroup')}
						classNames={{
							input: 'focus-within:bg-violet-600/25',
							section: 'hidden'
						}}
					/>
					<MultiSelect
						description='Chord inversions'
						placeholder='Select chord inversions'
						data={CHORD_INVERSION_SELECT_OPTIONS}
						{...practiceSettingsForm.getInputProps('inversions')}
						classNames={{
							input: 'focus-within:bg-violet-600/25',
							section: 'hidden'
						}}
					/>
					<div>
						<Switch
							label='Root note'
							checked={practiceSettingsForm.values.fixedRoot.enabled}
							onChange={e => practiceSettingsForm.setFieldValue('fixedRoot.enabled', e.target.checked)}
						/>

						<Collapse in={practiceSettingsForm.values.fixedRoot.enabled}>
							<Box h={16} />
						</Collapse>

						<Collapse in={practiceSettingsForm.values.fixedRoot.enabled}>
							<Select
								allowDeselect={false}
								data={fixedRootNoteOptions}
								description='Root note'
								placeholder='Select toor note'
								{...practiceSettingsForm.getInputProps('fixedRoot.rootNote')}
								classNames={{
									input: 'focus:bg-violet-600/25',
									section: 'hidden'
								}}
							/>
						</Collapse>
					</div>
					<div>
						<Collapse in={advancedSettingsOpened}>
							<div className='space-y-4'>
								<p>Advanced Settings</p>
								<div className='space-y-6'>
									<Select
										allowDeselect={false}
										maxDropdownHeight={120}
										data={playingModeSelectOptions}
										description='Playing mode'
										placeholder='Select playing mode'
										{...practiceSettingsForm.getInputProps('playingMode')}
										classNames={{
											input: 'focus-within:bg-violet-600/25',
											section: 'hidden'
										}}
									/>
									<div className='grid grid-cols-2 gap-4'>
										<NumberInput
											min={60}
											max={160}
											allowNegative={false}
											description='Tempo'
											placeholder='BPM between 60 - 160'
											{...practiceSettingsForm.getInputProps('tempo')}
											classNames={{
												input: 'focus:bg-violet-600/25'
											}}
										/>
										<NumberInput
											min={5}
											max={30}
											allowNegative={false}
											description='Question duration'
											placeholder='Between 5 - 30'
											{...practiceSettingsForm.getInputProps('questionDuration')}
											classNames={{
												input: 'focus:bg-violet-600/25'
											}}
										/>
									</div>
									<Switch
										label='Auto feedback'
										checked={practiceSettingsForm.values.autoFeedback}
										onChange={e =>
											practiceSettingsForm.setFieldValue('autoFeedback', e.target.checked)
										}
									/>
								</div>
							</div>
						</Collapse>

						<Collapse in={advancedSettingsOpened}>
							<Box h={16} />
						</Collapse>

						<Button
							p={0}
							h={'auto'}
							w={'auto'}
							size='compact-xs'
							variant='transparent'
							onClick={() => setAdvancedSettingsOpened(!advancedSettingsOpened)}
						>
							{advancedSettingsOpened ? 'Hide' : 'Advanced settings'}
						</Button>
					</div>
				</section>

				<div className='flex justify-end gap-2'>
					<Button
						type='reset'
						variant='light'
						disabled={!practiceSettingsForm.isDirty()}
					>
						Reset
					</Button>
					<Button type='submit'>Done</Button>
				</div>
			</form>
		</Modal>
	);
};

// *****************************
// ** Mode Practice Modal **
// *****************************
interface ModePracticeSettings {
	numberOfQuestions: number;
	modeTypeGroup: ChordTypeGroup;
	fixedRoot: {
		enabled: boolean;
		rootNote: NoteLiteral;
	};
	playingMode: NonHarmonicPlayingMode;
	tempo: number;
	questionDuration: number;
	autoFeedback: boolean;
}

const DEFAULT_MODE_PRACTICE_SETTINGS: ModePracticeSettings = {
	numberOfQuestions: 10,
	modeTypeGroup: 'all',
	fixedRoot: {
		enabled: false,
		rootNote: 'C4'
	},
	playingMode: 'ascending',
	tempo: 80,
	questionDuration: 30,
	autoFeedback: true
};

type ModeTypeGroup = keyof typeof MODE_TYPE_GROUPS;

const MODE_TYPE_GROUPS = {
	all: Mode.names(),
	major: ['ionian', 'lydian', 'mixolydian'],
	minor: ['aeolian', 'dorian', 'locrian', 'phrygian'],
	custom: []
};

const MODE_TYPE_GROUP_SELECT_OPTIONS: SelectData<ModeTypeGroup> = [
	{ value: 'all', label: 'All' },
	{ value: 'major', label: 'Major modes' },
	{ value: 'minor', label: 'Minor modes' },
	{ value: 'custom', label: 'Custom' }
];

export const ModePracticeSettingsModal: React.FC<IPracticeSettingsModalProps> = ({ opened, close }) => {
	const [advancedSettingsOpened, setAdvancedSettingsOpened] = useState<boolean>(false);

	const practiceSettingsForm = useForm<ModePracticeSettings>({
		initialValues: DEFAULT_MODE_PRACTICE_SETTINGS
	});

	const handleSettingsFormSubmit = (settings: ModePracticeSettings) => {
		console.log({ intervalPracticeSettings: settings });

		notify({
			type: 'success',
			title: 'Practice settings configured succesfully',
			message: `${settings.numberOfQuestions} questions will be played in ${settings.playingMode} mode${
				settings.fixedRoot.enabled ? ' with a fixed ' + settings.fixedRoot.rootNote + ' root note' : ''
			}.`
		});

		close();
	};

	return (
		<Modal
			centered
			opened={opened}
			onClose={() => {
				close();
				setAdvancedSettingsOpened(false);
			}}
			closeButtonProps={{ size: 'sm' }}
			title={'Practice Settings'}
		>
			<form
				onSubmit={practiceSettingsForm.onSubmit(handleSettingsFormSubmit)}
				onReset={practiceSettingsForm.onReset}
				className='w-full max-w-md space-y-8'
			>
				<section className='space-y-6'>
					<NumberInput
						min={1}
						max={100}
						allowNegative={false}
						clampBehavior='strict'
						description='Number of questions'
						placeholder='Between 5 - 100'
						{...practiceSettingsForm.getInputProps('numberOfQuestions')}
						classNames={{
							input: 'focus:bg-violet-600/25'
						}}
					/>
					<Select
						allowDeselect={false}
						maxDropdownHeight={160}
						data={MODE_TYPE_GROUP_SELECT_OPTIONS}
						description='Mode'
						placeholder='Select type of modes'
						{...practiceSettingsForm.getInputProps('chordTypeGroup')}
						classNames={{
							input: 'focus-within:bg-violet-600/25',
							section: 'hidden'
						}}
					/>
					<div>
						<Switch
							label='Root note'
							checked={practiceSettingsForm.values.fixedRoot.enabled}
							onChange={e => practiceSettingsForm.setFieldValue('fixedRoot.enabled', e.target.checked)}
						/>

						<Collapse in={practiceSettingsForm.values.fixedRoot.enabled}>
							<Box h={16} />
						</Collapse>

						<Collapse in={practiceSettingsForm.values.fixedRoot.enabled}>
							<Select
								allowDeselect={false}
								data={fixedRootNoteOptions}
								description='Root note'
								placeholder='Select toor note'
								{...practiceSettingsForm.getInputProps('fixedRoot.rootNote')}
								classNames={{
									input: 'focus:bg-violet-600/25',
									section: 'hidden'
								}}
							/>
						</Collapse>
					</div>
					<div>
						<Collapse in={advancedSettingsOpened}>
							<div className='space-y-4'>
								<p>Advanced Settings</p>
								<div className='space-y-6'>
									<Select
										allowDeselect={false}
										maxDropdownHeight={120}
										data={nonHarmonicPlayingModeSelectOptions}
										description='Playing mode'
										placeholder='Select playing mode'
										{...practiceSettingsForm.getInputProps('playingMode')}
										classNames={{
											input: 'focus-within:bg-violet-600/25',
											section: 'hidden'
										}}
									/>
									<div className='grid grid-cols-2 gap-4'>
										<NumberInput
											min={60}
											max={160}
											allowNegative={false}
											description='Tempo'
											placeholder='BPM between 60 - 160'
											{...practiceSettingsForm.getInputProps('tempo')}
											classNames={{
												input: 'focus:bg-violet-600/25'
											}}
										/>
										<NumberInput
											min={5}
											max={30}
											allowNegative={false}
											description='Question duration'
											placeholder='Between 5 - 30'
											{...practiceSettingsForm.getInputProps('questionDuration')}
											classNames={{
												input: 'focus:bg-violet-600/25'
											}}
										/>
									</div>
									<Switch
										label='Auto feedback'
										checked={practiceSettingsForm.values.autoFeedback}
										onChange={e =>
											practiceSettingsForm.setFieldValue('autoFeedback', e.target.checked)
										}
									/>
								</div>
							</div>
						</Collapse>

						<Collapse in={advancedSettingsOpened}>
							<Box h={16} />
						</Collapse>

						<Button
							p={0}
							h={'auto'}
							w={'auto'}
							size='compact-xs'
							variant='transparent'
							onClick={() => setAdvancedSettingsOpened(!advancedSettingsOpened)}
						>
							{advancedSettingsOpened ? 'Hide' : 'Advanced settings'}
						</Button>
					</div>
				</section>

				<div className='flex justify-end gap-2'>
					<Button
						type='reset'
						variant='light'
						disabled={!practiceSettingsForm.isDirty()}
					>
						Reset
					</Button>
					<Button type='submit'>Done</Button>
				</div>
			</form>
		</Modal>
	);
};
