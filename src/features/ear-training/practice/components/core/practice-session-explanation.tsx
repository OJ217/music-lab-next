import { motion } from 'framer-motion';
import { t } from 'i18next';
import { useTranslation } from 'react-i18next';

import { ActionIcon, Button } from '@mantine/core';
import { IconMusicCheck, IconMusicX } from '@tabler/icons-react';

import { EarTrainingExerciseType, Notes } from '../../types/practice-session.type';

interface IEarTrainingQuestionExplanation {
	feedback?: {
		correct: boolean;
		question: {
			notes: Notes;
			value: string;
		};
		answer: {
			notes: Notes;
			value: string;
		};
	};
	playIncorrectAnswer: () => void;
	playCorrectAnswer: () => void;
	samplerMethodsDisabled: boolean;
	continueAfterExplanation: () => void;
	exerciseType: EarTrainingExerciseType;
}

const EarTrainingQuestionExplanation: React.FC<IEarTrainingQuestionExplanation> = ({
	feedback,
	playIncorrectAnswer,
	playCorrectAnswer,
	samplerMethodsDisabled,
	continueAfterExplanation,
	exerciseType
}) => {
	const { t } = useTranslation();

	return (
		<motion.div
			layout={'position'}
			key={'explanation'}
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			transition={{
				duration: 1.5,
				type: 'spring'
			}}
			className='flex flex-col items-center'
		>
			<div className='flex w-full max-w-sm flex-col items-center space-y-8 rounded-lg bg-gradient-to-tr from-violet-700/10 to-violet-700/25 px-4 py-8'>
				<div className='grid w-full grid-cols-2 justify-evenly'>
					<div className='flex flex-col items-center justify-between space-y-4 text-center'>
						<div>
							<p className='text-xs'>Сонгосон {t(`${exerciseType}Title`).toLowerCase()}</p>
							<h3 className='text-lg font-semibold'>{feedback ? t(`${exerciseType}.${feedback?.answer.value}`) : '--'}</h3>
						</div>
						<ActionIcon
							size={72}
							className='rounded-xl border-2 border-red-600/50 bg-transparent bg-gradient-to-tr from-red-600/20 to-red-600/40 text-red-300 transition-all duration-300 ease-in-out disabled:opacity-50'
							onClick={playIncorrectAnswer}
							disabled={samplerMethodsDisabled}
						>
							<IconMusicX size={36} />
						</ActionIcon>
					</div>
					<div className='flex flex-col items-center justify-between space-y-4 text-center'>
						<div>
							<p className='text-xs'>Тоглосон {t(`${exerciseType}Title`).toLowerCase()}</p>
							<h3 className='text-lg font-semibold'>{feedback ? t(`${exerciseType}.${feedback?.question.value}`) : '--'}</h3>
						</div>
						<ActionIcon
							size={72}
							className='rounded-xl border-2 border-green-600/50 bg-transparent bg-gradient-to-tr from-green-600/20 to-green-600/40 text-green-300 transition-all duration-300 ease-in-out disabled:opacity-50'
							onClick={playCorrectAnswer}
							disabled={samplerMethodsDisabled}
						>
							<IconMusicCheck size={36} />
						</ActionIcon>
					</div>
				</div>
				<Button
					fw={500}
					radius={'xl'}
					disabled={samplerMethodsDisabled}
					onClick={continueAfterExplanation}
					className='disabled:bg-violet-600/25 disabled:opacity-50'
				>
					{t('continue')}
				</Button>
			</div>
		</motion.div>
	);
};

export default EarTrainingQuestionExplanation;
