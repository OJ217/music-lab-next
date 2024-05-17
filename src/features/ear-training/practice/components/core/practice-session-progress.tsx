import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

import { ActionIcon, Progress } from '@mantine/core';
import { IconSettings } from '@tabler/icons-react';

import { EarTrainingExerciseType } from '../../types/practice-session.type';

interface IEarTrainingSessionProgress {
	sessionEnded: boolean;
	progressPercentage: number;
	progressIndicatorText: string;
	openPracticeSettingsModal: () => void;
	exerciseType: EarTrainingExerciseType;
	questionCount: number;
}

const earTrainingExerciseTitleKeys: Record<EarTrainingExerciseType, string> = {
	interval: 'intervalIdentification',
	chord: 'chordIdentification',
	mode: 'modeIdentification'
};

const EarTrainingSessionProgress: React.FC<IEarTrainingSessionProgress> = ({ sessionEnded, progressPercentage, progressIndicatorText, openPracticeSettingsModal, exerciseType, questionCount }) => {
	const { t } = useTranslation();

	return (
		<motion.div
			layout={'position'}
			key={'progress'}
			transition={{ duration: 1.5, type: 'spring' }}
			className='space-y-4'
		>
			<h1 className='text-center text-xl font-semibold'>{t(earTrainingExerciseTitleKeys[exerciseType])}</h1>
			<div className='space-y-2'>
				<Progress
					bg={'violet.8'}
					value={progressPercentage}
					classNames={{
						root: 'max-w-[240px] mx-auto',
						section: 'transition-all duration-300 ease-in-out rounded-r'
					}}
				/>
				<p className='text-center text-xs text-violet-100'>{progressIndicatorText}</p>
			</div>
			<div className='flex items-center justify-center gap-4'>
				<ActionIcon
					p={4}
					radius='sm'
					variant='light'
					onClick={openPracticeSettingsModal}
					disabled={questionCount > 0 && !sessionEnded}
				>
					<IconSettings />
				</ActionIcon>
			</div>
		</motion.div>
	);
};

export default EarTrainingSessionProgress;
