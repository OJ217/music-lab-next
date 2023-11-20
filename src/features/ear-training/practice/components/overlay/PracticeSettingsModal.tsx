import { useState } from 'react';

import { notify } from '@/utils/notification.util';
import { Box, Button, Collapse, Modal, MultiSelect, NumberInput, Select, Switch } from '@mantine/core';
import { UseFormReturnType } from '@mantine/form';

import {
	CHORD_INVERSION_SELECT_OPTIONS,
	CHORD_TYPE_GROUP_SELECT_OPTIONS,
	ChordPracticeSettings,
	FIXED_ROOT_NOTE_SELECT_OPTIONS,
	INTERVAL_TYPE_GROUP_SELECT_OPTIONS,
	IntervalPracticeSettings,
	MODE_TYPE_GROUP_SELECT_OPTIONS,
	ModePracticeSettings,
	NON_HARMONIC_PLAYING_MODE_SELECT_OPTIONS,
	PLAYING_MODE_SELECT_OPTIONS
} from '../../types/settings.type';

interface IPracticeSettingsModalProps<SettingForm = any> {
	opened: boolean;
	close: () => void;
	practiceSettingsForm: UseFormReturnType<SettingForm>;
}

// *****************************
// ** Interval Practice Modal **
// *****************************

export const IntervalPracticeSettingsModal: React.FC<IPracticeSettingsModalProps<IntervalPracticeSettings>> = ({
	opened,
	close,
	practiceSettingsForm
}) => {
	const [advancedSettingsOpened, setAdvancedSettingsOpened] = useState<boolean>(false);

	const handleSettingsFormSubmit = (settings: IntervalPracticeSettings) => {
		console.log({ intervalPracticeSettings: settings });

		notify({
			type: 'success',
			title: 'Practice Settings',
			message: `${settings.numberOfQuestions} questions will be played in ${settings.playingMode} mode${
				settings.fixedRoot.enabled ? ' with a fixed ' + settings.fixedRoot.rootNote + ' root note' : ''
			}.`
		});

		practiceSettingsForm.setFieldValue('settingsLocked', true);

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
								data={FIXED_ROOT_NOTE_SELECT_OPTIONS}
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
										data={PLAYING_MODE_SELECT_OPTIONS}
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
							onClick={() => {
								!advancedSettingsOpened &&
									notify({
										type: 'warning',
										title: 'Feature Unimplemented',
										message: `Currently, advanced settings don't have any effect. (But you can preview the UI)`
									});
								setAdvancedSettingsOpened(!advancedSettingsOpened);
							}}
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

// **************************
// ** Chord Practice Modal **
// **************************

export const ChordPracticeSettingsModal: React.FC<IPracticeSettingsModalProps<ChordPracticeSettings>> = ({
	opened,
	close,
	practiceSettingsForm
}) => {
	const [advancedSettingsOpened, setAdvancedSettingsOpened] = useState<boolean>(false);

	const handleSettingsFormSubmit = (settings: ChordPracticeSettings) => {
		console.log({ intervalPracticeSettings: settings });

		notify({
			type: 'success',
			title: 'Practice Settings',
			message: `${settings.numberOfQuestions} questions will be played in ${settings.playingMode} mode${
				settings.fixedRoot.enabled ? ' with a fixed ' + settings.fixedRoot.rootNote + ' root note' : ''
			}.`
		});

		practiceSettingsForm.setFieldValue('settingsLocked', true);

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
								data={FIXED_ROOT_NOTE_SELECT_OPTIONS}
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
										data={PLAYING_MODE_SELECT_OPTIONS}
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
							onClick={() => {
								!advancedSettingsOpened &&
									notify({
										type: 'warning',
										title: 'Feature Unimplemented',
										message: `Currently, advanced settings don't have any effect. (But you can preview the UI)`
									});
								setAdvancedSettingsOpened(!advancedSettingsOpened);
							}}
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

// *************************
// ** Mode Practice Modal **
// *************************

export const ModePracticeSettingsModal: React.FC<IPracticeSettingsModalProps<ModePracticeSettings>> = ({
	opened,
	close,
	practiceSettingsForm
}) => {
	const [advancedSettingsOpened, setAdvancedSettingsOpened] = useState<boolean>(false);

	const handleSettingsFormSubmit = (settings: ModePracticeSettings) => {
		console.log({ intervalPracticeSettings: settings });

		notify({
			type: 'success',
			title: 'Practice Settings',
			message: `${settings.numberOfQuestions} questions will be played in ${settings.playingMode} mode${
				settings.fixedRoot.enabled ? ' with a fixed ' + settings.fixedRoot.rootNote + ' root note' : ''
			}.`
		});

		practiceSettingsForm.setFieldValue('settingsLocked', true);

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
						{...practiceSettingsForm.getInputProps('modeTypeGroup')}
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
								data={FIXED_ROOT_NOTE_SELECT_OPTIONS}
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
										data={NON_HARMONIC_PLAYING_MODE_SELECT_OPTIONS}
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
							onClick={() => {
								!advancedSettingsOpened &&
									notify({
										type: 'warning',
										title: 'Feature Unimplemented',
										message: `Currently, advanced settings don't have any effect. (But you can preview the UI)`
									});
								setAdvancedSettingsOpened(!advancedSettingsOpened);
							}}
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
