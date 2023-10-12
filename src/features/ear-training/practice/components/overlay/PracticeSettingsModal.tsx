import { useState } from 'react';
import { IntervalLiteral } from 'tonal';

import { notify } from '@/utils/notification.util';
import { Box, Button, Collapse, Modal, NumberInput, Select, Switch } from '@mantine/core';
import { useForm } from '@mantine/form';

import { SelectData } from '../../types';

type PlayingMode = 'ascending' | 'descending' | 'harmonic';

const playingModeSelectOptions: SelectData<PlayingMode> = [
	{ label: 'Ascending', value: 'ascending' },
	{ label: 'Descending', value: 'descending' },
	{ label: 'Harmonic', value: 'harmonic' }
];

const fixedRootNotes = ['C4', 'C#4', 'D4', 'D#4', 'E4', 'F4', 'F#4', 'G4', 'G#4', 'A4', 'A#4', 'B4'];
const fixedRootNoteOptions = fixedRootNotes.map(note => ({ label: note, value: note }));

interface PracticeSettings {
	numberOfQuestions: number;
	playingMode: PlayingMode;
	fixedRoot: {
		enabled: boolean;
		rootNote: string;
	};
}

const initialValues = {
	numberOfQuestions: 10,
	playingMode: 'harmonic',
	fixedRoot: { enabled: false, rootNote: 'C4' }
} as const;

interface IPracticeSettingsModalProps {
	opened: boolean;
	close: () => void;
}

const PracticeSettingsModal: React.FC<IPracticeSettingsModalProps> = ({ opened, close }) => {
	const practiceSettingsForm = useForm<PracticeSettings>({
		initialValues
	});

	const handleSettingsFormSubmit = (formValues: PracticeSettings) => {
		notify({
			type: 'success',
			title: 'Practice settings configured succesfully',
			message: `${formValues.numberOfQuestions} questions played in ${formValues.playingMode} mode${
				formValues.fixedRoot.enabled ? ' with a fixed ' + formValues.fixedRoot.rootNote + ' root note' : ''
			}.`
		});
		close();
	};

	return (
		<Modal
			centered
			opened={opened}
			onClose={close}
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
						placeholder='Select number between 5 - 100'
						{...practiceSettingsForm.getInputProps('numberOfQuestions')}
						classNames={{
							input: 'focus:bg-violet-600/25'
						}}
					/>

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

export default PracticeSettingsModal;

// *****************************
// ** Interval Practice Modal **
// *****************************
interface IntervalPracticeSettings {
	numberOfQuestions: number;
	intervalTypeGroup: IntervalTypeGroup;
	fixedRoot: {
		enabled: boolean;
		rootNote: IntervalLiteral;
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
		console.log(settings);
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
