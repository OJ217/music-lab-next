import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

import { Button } from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons-react';

import { SelectedChord } from '../../types/practice-session.type';

type ControlLayout = 'wrap' | 'fill';

const controlLayoutClasses: Record<ControlLayout, string> = {
	fill: 'grid max-w-xl grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4',
	wrap: 'flex w-full flex-wrap items-center justify-center gap-6'
};

interface IEarTrainingSessionControl {
	samplerMethodsDisabled: boolean;
	sessionEnded: boolean;
	questionCount: number;
	reset: () => void;
	replay: () => void;
	quetsions: Array<{ label: string; value: string }>;
	answerQuestion: (value: string) => void;
	answerQuestionDisabled: boolean;
	controlLayout: ControlLayout;
}

const EarTrainingSessionControl: React.FC<IEarTrainingSessionControl> = ({
	samplerMethodsDisabled,
	sessionEnded,
	questionCount,
	reset,
	replay,
	quetsions,
	answerQuestion,
	answerQuestionDisabled,
	controlLayout
}) => {
	const { t } = useTranslation();

	return (
		<motion.div
			layout={'position'}
			key={'control'}
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			transition={{
				duration: 1.5,
				type: 'spring'
			}}
			className='flex flex-col items-center space-y-12'
		>
			<Button
				fw={500}
				radius={'xl'}
				disabled={samplerMethodsDisabled || sessionEnded}
				onClick={() => {
					sessionEnded || !questionCount ? reset() : replay();
				}}
				className='disabled:bg-violet-600/25 disabled:opacity-50'
			>
				{sessionEnded ? t('restart') : !questionCount ? t('start') : t('replay')}
			</Button>
			<div className={controlLayoutClasses[controlLayout]}>
				{quetsions.map(q => (
					<Button
						py={4}
						px={16}
						fw={400}
						variant='light'
						key={q.value}
						onClick={() => answerQuestion(q.value)}
						disabled={answerQuestionDisabled}
						className='rounded-full border-[1.5px] border-violet-700 bg-violet-600/25 text-violet-100 disabled:pointer-events-none disabled:bg-violet-600/25 disabled:opacity-50'
					>
						{q.label}
					</Button>
				))}
			</div>
		</motion.div>
	);
};

interface IChordInversionSelectionControl {
	samplerMethodsDisabled: boolean;
	sessionEnded: boolean;
	questionCount: number;
	reset: () => void;
	replay: () => void;
	inversions: Array<number>;
	selectedChord: SelectedChord;
	answerQuestion: (value: string, inversion?: number) => void;
	answerQuestionDisabled: boolean;
	deselectChordName: () => void;
}

export const ChordInversionSelectionControl: React.FC<IChordInversionSelectionControl> = ({
	samplerMethodsDisabled,
	sessionEnded,
	questionCount,
	reset,
	replay,
	inversions,
	answerQuestion,
	answerQuestionDisabled,
	selectedChord,
	deselectChordName
}) => {
	const { t } = useTranslation();

	return (
		<motion.div
			layout='position'
			key={'chord_inversions'}
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			transition={{ duration: 1.5, type: 'spring' }}
			className='flex flex-col items-center space-y-12'
		>
			<Button
				fw={500}
				radius={'xl'}
				disabled={samplerMethodsDisabled || sessionEnded}
				onClick={() => {
					sessionEnded || !questionCount ? reset() : replay();
				}}
				className='disabled:bg-violet-600/25 disabled:opacity-50'
			>
				{sessionEnded ? t('restart') : !questionCount ? t('start') : t('replay')}
			</Button>
			<div className='flex w-full flex-col items-center justify-center'>
				<p className='text-center'>
					{t('selectedChord')}: <span className='font-semibold'>{t(`chord.${selectedChord.name}`)}</span>
				</p>

				<div className='mb-20 mt-6 flex w-full flex-wrap items-center justify-center gap-6'>
					{inversions
						.filter(i => {
							return i < selectedChord.length;
						})
						.map(inversion => (
							<Button
								py={4}
								px={16}
								fw={400}
								variant='light'
								key={inversion}
								onClick={() => answerQuestion(selectedChord.name, inversion)}
								disabled={answerQuestionDisabled}
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
					onClick={deselectChordName}
				>
					{t('back')}
				</Button>
			</div>
		</motion.div>
	);
};

export default EarTrainingSessionControl;
