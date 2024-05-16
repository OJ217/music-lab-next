import { t } from 'i18next';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Interval, Note } from 'tonal';

import { useVariableDurationSamplerMethodsWith } from '@/features/ear-training/practice/hooks/use-sampler';
import EarTrainingLayout from '@/features/ear-training/practice/layouts/ear-training-layout';
import { SelectData } from '@/types';
import { ActionIcon, Button, Checkbox, Drawer, UnstyledButton } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconSettings } from '@tabler/icons-react';

type IntervalType = 'simple';

const selectDataFormatter = (interval: string) => ({ label: t(`interval.${interval}`), value: interval });

const intervals: Record<IntervalType, SelectData> = {
	simple: ['m2', 'M2', 'm3', 'M3', 'P4', 'd5', 'P5', 'm6', 'M6', 'm7', 'M7', 'P8'].map(selectDataFormatter)
};

const intervalTypeDefautValues: Record<IntervalType, string> = {
	simple: 'M3'
};

const IntervalLibrary = () => {
	// ** Translation
	const { t } = useTranslation();

	// ** Library states
	const [selectedIntervalType] = useState<IntervalType>('simple');
	const [selectedInterval, setSelectedInterval] = useState<string>(intervalTypeDefautValues[selectedIntervalType]);

	// ** Utility
	const { playNotes, releaseNotes } = useVariableDurationSamplerMethodsWith();
	const [samplerDisabled, setSamplerDisabled] = useState<boolean>(false);
	const [librarySettingsDrawerOpened, { open: openLibrarySettingsDrawer, close: closeLibrarySettingsDrawer }] = useDisclosure();

	console.log(Interval.get(selectedInterval));

	return (
		<EarTrainingLayout
			centered={true}
			maxWidthKey='2xl'
		>
			<div className='flex flex-col items-center justify-center'>
				<h1 className='text-center text-3xl font-semibold'>{t(`interval.${selectedInterval}`)}</h1>
				<ActionIcon
					p={4}
					radius='sm'
					variant='light'
					size={32}
					onClick={openLibrarySettingsDrawer}
					className='mt-4'
				>
					<IconSettings />
				</ActionIcon>
				<div className='mb-10 mt-6 flex w-full max-w-xs flex-col items-center justify-center rounded-lg bg-gradient-to-tr from-violet-600/25 to-violet-600/50 p-6 text-lg'>
					<div className='space-x-2'>
						<span className='font-semibold'>Тон хэмжигдэхүүн:</span>
						<span>{Interval.get(selectedInterval).semitones}</span>
					</div>
					<div className='space-x-2'>
						<span className='font-semibold'>Интервалын чанар:</span>
						<span>Цэвэр</span>
					</div>
				</div>
				<Button
					disabled={samplerDisabled}
					className='disabled:bg-violet-600/50 disabled:text-white/50'
					onClick={() => {
						setSamplerDisabled(true);
						releaseNotes();

						const upperNote = Note.transpose('C4', selectedInterval);
						const intervalNotesBase = ['C4', upperNote].map(Note.simplify);
						const intervalNotes = [...intervalNotesBase, intervalNotesBase];

						playNotes(intervalNotes, [1, 1, 1.5]);

						setTimeout(() => setSamplerDisabled(false), 3500);
					}}
				>
					Интервал сонсох
				</Button>
			</div>
			<Drawer
				opened={librarySettingsDrawerOpened}
				onClose={closeLibrarySettingsDrawer}
				position='right'
				classNames={{
					content: 'bg-gradient-to-tr from-[#150836] to-[#451ba1] bg-fixed',
					header: 'bg-transparent bg-gradient-to-tr from-violet-600/5 to-violet-600/20 backdrop-blur-md border-b-2 border-violet-600/10',
					close: 'text-violet-100',
					title: 'font-semibold'
				}}
				title={'Интервал сонгох'}
			>
				<div className='space-y-6 pt-4'>
					{intervals[selectedIntervalType].map(interval => (
						<div
							key={interval.value}
							className='relative'
						>
							<Checkbox
								checked={selectedInterval === interval.value}
								onChange={() => setSelectedInterval(interval.value)}
								tabIndex={-1}
								size='md'
								classNames={{
									root: 'absolute left-4 top-4 cursor-pointer',
									input: '[&:not(:checked)]:bg-violet-600/50 border-violet-600 [&:checked]:bg-violet-600'
								}}
							/>

							<UnstyledButton
								data-checked={selectedInterval === interval.value || undefined}
								onClick={() => setSelectedInterval(interval.value)}
								className='w-full items-center gap-4 rounded-lg bg-gradient-to-tr from-violet-600/10 to-violet-600/20 py-4 pl-14 pr-4 data-[checked]:from-violet-600/25 data-[checked]:to-violet-600/50'
							>
								<p>{interval.label}</p>
							</UnstyledButton>
						</div>
					))}
				</div>
			</Drawer>
		</EarTrainingLayout>
	);
};

export default IntervalLibrary;
