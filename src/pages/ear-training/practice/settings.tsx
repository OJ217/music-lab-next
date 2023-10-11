import { notify } from '@/utils/notification.util';
import { Box, Button, Collapse, NumberInput, Select, Switch } from '@mantine/core';
import { useForm } from '@mantine/form';

type PlayingMode = 'ascending' | 'descending' | 'harmonic';

const playingModeSelectOptions: Array<{ label: string; value: PlayingMode }> = [
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

const Settings = () => {
	const practiceSettingsForm = useForm<PracticeSettings>({
		initialValues
	});

	const handleSettingsFormSubmit = (formValues: PracticeSettings) => {
		notify({
			type: 'success',
			title: 'Practice settings configured succesfully',
			message: `${formValues.numberOfQuestions} questions played in ${formValues.playingMode} mode${
				formValues.fixedRoot.enabled ? 'with a fixed ' + formValues.fixedRoot.rootNote + ' root note' : ''
			}.`
		});
	};

	return (
		<div className='grid min-h-screen place-items-center p-6'>
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
							input: 'focus:bg-purple-600/25'
						}}
					/>

					<Select
						maxDropdownHeight={120}
						data={playingModeSelectOptions}
						description='Playing mode'
						placeholder='Select playing mode'
						{...practiceSettingsForm.getInputProps('playingMode')}
						classNames={{
							input: 'focus-within:bg-purple-600/25',
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
								data={fixedRootNoteOptions}
								description='Root note'
								placeholder='Select toor note'
								{...practiceSettingsForm.getInputProps('fixedRoot.rootNote')}
								classNames={{
									input: 'focus:bg-purple-600/25'
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
		</div>
	);
};

export default Settings;
