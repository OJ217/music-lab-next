import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Box, Button, Collapse, Modal, MultiSelect, NumberInput, ScrollArea, Select, Switch } from '@mantine/core';
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
	NOTE_DURATION_SELECT_OPTIONS,
	PLAYING_MODE_SELECT_OPTIONS
} from '../../types/practice-session-settings.type';

interface IPracticeSettingsModalProps<SettingForm = any> {
	opened: boolean;
	close: () => void;
	practiceSettingsForm: UseFormReturnType<SettingForm>;
}

// *****************************
// ** Interval Practice Modal **
// *****************************

export const IntervalPracticeSettingsModal: React.FC<IPracticeSettingsModalProps<IntervalPracticeSettings>> = ({ opened, close, practiceSettingsForm }) => {
	const { t: settingsT } = useTranslation('ear_training', { keyPrefix: 'settings' });
	const { t: commonT } = useTranslation();

	const [advancedSettingsOpened, setAdvancedSettingsOpened] = useState<boolean>(false);

	const closeSettings = () => {
		setAdvancedSettingsOpened(false);
		close();
	};

	const handleSettingsFormSubmit = (settings: IntervalPracticeSettings) => {
		if (settings.playingMode !== 'harmonic') {
			practiceSettingsForm.setFieldValue('noteDuration', 'quarter');
		}

		closeSettings();
	};

	return (
		<Modal
			centered
			withinPortal
			opened={opened}
			onClose={() => {
				if (practiceSettingsForm.validate().hasErrors) {
					setAdvancedSettingsOpened(true);
					return;
				}

				closeSettings();
			}}
			closeOnEscape={false}
			closeOnClickOutside={false}
			withCloseButton={false}
			title={settingsT('practiceSettings')}
			scrollAreaComponent={ScrollArea.Autosize}
		>
			<form
				onSubmit={practiceSettingsForm.onSubmit(handleSettingsFormSubmit)}
				onReset={practiceSettingsForm.onReset}
				className='w-full max-w-md space-y-8'
			>
				<section className='space-y-6'>
					<NumberInput
						min={10}
						max={100}
						allowNegative={false}
						description={settingsT('numberOfQuestionsDescription')}
						placeholder={settingsT('numberOfQuestionsPlaceholder')}
						{...practiceSettingsForm.getInputProps('numberOfQuestions')}
					/>

					<Select
						allowDeselect={false}
						maxDropdownHeight={120}
						data={INTERVAL_TYPE_GROUP_SELECT_OPTIONS}
						description={settingsT('intervalTypeGroup')}
						placeholder={settingsT('intervalTypeGroupDescription')}
						{...practiceSettingsForm.getInputProps('typeGroup')}
					/>

					<div>
						<Switch
							label={settingsT('rootNote')}
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
								description={settingsT('rootNote')}
								placeholder={settingsT('rootNotePlaceholder')}
								{...practiceSettingsForm.getInputProps('fixedRoot.rootNote')}
							/>
						</Collapse>
					</div>

					<div>
						<Collapse in={advancedSettingsOpened}>
							<div className='space-y-4'>
								<p className='text-sm'>{settingsT('advancedSettings')}</p>
								<div className='space-y-6'>
									<div className='grid grid-cols-2 gap-4'>
										<Select
											allowDeselect={false}
											maxDropdownHeight={120}
											data={PLAYING_MODE_SELECT_OPTIONS}
											description={settingsT('playingMode')}
											placeholder={settingsT('playingModePlaceholder')}
											{...practiceSettingsForm.getInputProps('playingMode')}
										/>
										<NumberInput
											min={60}
											max={180}
											allowNegative={false}
											description={settingsT('tempo')}
											placeholder={settingsT('tempoPlaceholder')}
											{...practiceSettingsForm.getInputProps('tempo')}
										/>
										{/* <NumberInput
											min={1}
											max={30}
											allowNegative={false}
											description={settingsT('questionDuration')}
											placeholder={settingsT('questionDurationPlaceholder')}
											{...practiceSettingsForm.getInputProps('questionDuration')}
										/> */}
									</div>
									<Switch
										label={settingsT('autoFeedback')}
										checked={practiceSettingsForm.values.autoFeedback}
										onChange={e => practiceSettingsForm.setFieldValue('autoFeedback', e.target.checked)}
									/>
								</div>
							</div>
						</Collapse>

						<Collapse in={advancedSettingsOpened}>
							<Box h={16} />
						</Collapse>

						<Button
							px={0}
							h={'auto'}
							w={'auto'}
							color='violet.5'
							size='compact-xs'
							variant='transparent'
							onClick={() => {
								setAdvancedSettingsOpened(!advancedSettingsOpened);
							}}
						>
							{advancedSettingsOpened ? commonT('close') : settingsT('advancedSettings')}
						</Button>
					</div>
				</section>

				<div className='flex justify-end gap-2'>
					<Button
						type='reset'
						variant='light'
						disabled={!practiceSettingsForm.isDirty()}
					>
						{commonT('reset')}
					</Button>
					<Button type='submit'>{commonT('save')}</Button>
				</div>
			</form>
		</Modal>
	);
};

// **************************
// ** Chord Practice Modal **
// **************************

export const ChordPracticeSettingsModal: React.FC<IPracticeSettingsModalProps<ChordPracticeSettings>> = ({ opened, close, practiceSettingsForm }) => {
	const { t: settingsT } = useTranslation('ear_training', { keyPrefix: 'settings' });
	const { t: commonT } = useTranslation();

	const [advancedSettingsOpened, setAdvancedSettingsOpened] = useState<boolean>(false);

	const closeSettings = () => {
		setAdvancedSettingsOpened(false);
		close();
	};

	const handleSettingsFormSubmit = (settings: ChordPracticeSettings) => {
		if (settings.playingMode !== 'harmonic') {
			practiceSettingsForm.setFieldValue('noteDuration', 'quarter');
		} else {
			practiceSettingsForm.setFieldValue('noteDuration', 'whole');
		}

		closeSettings();
	};

	return (
		<Modal
			centered
			withinPortal
			opened={opened}
			onClose={() => {
				if (practiceSettingsForm.validate().hasErrors) {
					setAdvancedSettingsOpened(true);
					return;
				}

				closeSettings();
			}}
			closeOnEscape={false}
			closeOnClickOutside={false}
			withCloseButton={false}
			title={settingsT('practiceSettings')}
			scrollAreaComponent={ScrollArea.Autosize}
		>
			<form
				onSubmit={practiceSettingsForm.onSubmit(handleSettingsFormSubmit)}
				onReset={practiceSettingsForm.onReset}
				className='w-full max-w-md space-y-8'
			>
				<section className='space-y-6'>
					<NumberInput
						min={10}
						max={100}
						allowNegative={false}
						clampBehavior='strict'
						description={settingsT('numberOfQuestionsDescription')}
						placeholder={settingsT('numberOfQuestionsPlaceholder')}
						{...practiceSettingsForm.getInputProps('numberOfQuestions')}
					/>
					<Select
						allowDeselect={false}
						maxDropdownHeight={160}
						data={CHORD_TYPE_GROUP_SELECT_OPTIONS}
						description={settingsT('chordTypeGroup')}
						placeholder={settingsT('chordTypeGroupDescription')}
						{...practiceSettingsForm.getInputProps('typeGroup')}
					/>
					<MultiSelect
						description={settingsT('chordInversions')}
						placeholder={settingsT('chordInversionsPlaceholder')}
						data={CHORD_INVERSION_SELECT_OPTIONS}
						{...practiceSettingsForm.getInputProps('inversions')}
					/>
					<div>
						<Switch
							label={settingsT('rootNote')}
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
								description={settingsT('rootNote')}
								placeholder={settingsT('rootNotePlaceholder')}
								{...practiceSettingsForm.getInputProps('fixedRoot.rootNote')}
							/>
						</Collapse>
					</div>
					<div>
						<Collapse in={advancedSettingsOpened}>
							<div className='space-y-4'>
								<p className='text-sm'>{settingsT('advancedSettings')}</p>
								<div className='space-y-6'>
									<div className='grid grid-cols-2 gap-4'>
										<Select
											allowDeselect={false}
											maxDropdownHeight={120}
											data={PLAYING_MODE_SELECT_OPTIONS}
											description={settingsT('playingMode')}
											placeholder={settingsT('playingModePlaceholder')}
											{...practiceSettingsForm.getInputProps('playingMode')}
										/>
										<NumberInput
											min={60}
											max={180}
											allowNegative={false}
											description={settingsT('tempo')}
											placeholder={settingsT('tempoPlaceholder')}
											disabled={practiceSettingsForm.values.playingMode === 'harmonic'}
											{...practiceSettingsForm.getInputProps('tempo')}
										/>
										{/* <NumberInput
											min={5}
											max={30}
											allowNegative={false}
											description={settingsT('questionDuration')}
											placeholder={settingsT('questionDurationPlaceholder')}
											{...practiceSettingsForm.getInputProps('questionDuration')}
										/> */}
									</div>
									<Switch
										label={settingsT('autoFeedback')}
										checked={practiceSettingsForm.values.autoFeedback}
										onChange={e => practiceSettingsForm.setFieldValue('autoFeedback', e.target.checked)}
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
							color='violet.5'
							size='compact-xs'
							variant='transparent'
							onClick={() => {
								setAdvancedSettingsOpened(!advancedSettingsOpened);
							}}
						>
							{advancedSettingsOpened ? commonT('close') : settingsT('advancedSettings')}
						</Button>
					</div>
				</section>

				<div className='flex justify-end gap-2'>
					<Button
						type='reset'
						variant='light'
						disabled={!practiceSettingsForm.isDirty()}
					>
						{commonT('reset')}
					</Button>
					<Button type='submit'>{commonT('save')}</Button>
				</div>
			</form>
		</Modal>
	);
};

// *************************
// ** Mode Practice Modal **
// *************************

export const ModePracticeSettingsModal: React.FC<IPracticeSettingsModalProps<ModePracticeSettings>> = ({ opened, close, practiceSettingsForm }) => {
	const { t: settingsT } = useTranslation('ear_training', { keyPrefix: 'settings' });
	const { t: commonT } = useTranslation();

	const [advancedSettingsOpened, setAdvancedSettingsOpened] = useState<boolean>(false);

	const closeSettings = () => {
		setAdvancedSettingsOpened(false);
		close();
	};

	const handleSettingsFormSubmit = (settings: ModePracticeSettings) => {
		closeSettings();
	};

	return (
		<Modal
			centered
			withinPortal
			opened={opened}
			onClose={() => {
				if (practiceSettingsForm.validate().hasErrors) {
					setAdvancedSettingsOpened(true);
					return;
				}

				closeSettings();
			}}
			closeOnEscape={false}
			closeOnClickOutside={false}
			withCloseButton={false}
			title={settingsT('practiceSettings')}
			scrollAreaComponent={ScrollArea.Autosize}
		>
			<form
				onSubmit={practiceSettingsForm.onSubmit(handleSettingsFormSubmit)}
				onReset={practiceSettingsForm.onReset}
				className='w-full max-w-md space-y-8'
			>
				<section className='space-y-6'>
					<NumberInput
						min={10}
						max={100}
						allowNegative={false}
						description={settingsT('numberOfQuestionsDescription')}
						placeholder={settingsT('numberOfQuestionsPlaceholder')}
						{...practiceSettingsForm.getInputProps('numberOfQuestions')}
					/>
					<Select
						allowDeselect={false}
						maxDropdownHeight={160}
						data={MODE_TYPE_GROUP_SELECT_OPTIONS}
						description={settingsT('modeTypeGroup')}
						placeholder={settingsT('modeTypeGroupDescription')}
						{...practiceSettingsForm.getInputProps('typeGroup')}
					/>
					<div>
						<Switch
							label={settingsT('rootNote')}
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
								description={settingsT('rootNote')}
								placeholder={settingsT('rootNotePlaceholder')}
								{...practiceSettingsForm.getInputProps('fixedRoot.rootNote')}
							/>
						</Collapse>
					</div>
					<div>
						<Collapse in={advancedSettingsOpened}>
							<div className='space-y-4'>
								<p className='text-sm'>{settingsT('advancedSettings')}</p>
								<div className='space-y-6'>
									<div className='grid grid-cols-2 gap-4'>
										<Select
											allowDeselect={false}
											maxDropdownHeight={120}
											data={NON_HARMONIC_PLAYING_MODE_SELECT_OPTIONS}
											description={settingsT('playingMode')}
											placeholder={settingsT('playingModePlaceholder')}
											{...practiceSettingsForm.getInputProps('playingMode')}
										/>
										<NumberInput
											min={60}
											max={180}
											allowNegative={false}
											description={settingsT('tempo')}
											placeholder={settingsT('tempoPlaceholder')}
											{...practiceSettingsForm.getInputProps('tempo')}
										/>
										<Select
											allowDeselect={false}
											maxDropdownHeight={120}
											data={NOTE_DURATION_SELECT_OPTIONS}
											description={settingsT('noteType')}
											placeholder={settingsT('noteTypePlaceholder')}
											{...practiceSettingsForm.getInputProps('noteDuration')}
										/>
										{/* <NumberInput
											min={1}
											max={30}
											allowNegative={false}
											description={settingsT('questionDuration')}
											placeholder={settingsT('questionDurationPlaceholder')}
											{...practiceSettingsForm.getInputProps('questionDuration')}
										/> */}
									</div>
									<Switch
										label={settingsT('autoFeedback')}
										checked={practiceSettingsForm.values.autoFeedback}
										onChange={e => practiceSettingsForm.setFieldValue('autoFeedback', e.target.checked)}
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
							color='violet.5'
							size='compact-xs'
							variant='transparent'
							onClick={() => {
								setAdvancedSettingsOpened(!advancedSettingsOpened);
							}}
						>
							{advancedSettingsOpened ? commonT('close') : settingsT('advancedSettings')}
						</Button>
					</div>
				</section>

				<div className='flex justify-end gap-2'>
					<Button
						type='reset'
						variant='light'
						disabled={!practiceSettingsForm.isDirty()}
					>
						{commonT('reset')}
					</Button>
					<Button type='submit'>{commonT('save')}</Button>
				</div>
			</form>
		</Modal>
	);
};
