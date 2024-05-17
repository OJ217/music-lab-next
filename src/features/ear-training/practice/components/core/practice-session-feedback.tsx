import { motion } from 'framer-motion';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@mantine/core';

import { EarTrainingExerciseType } from '../../types/practice-session.type';

interface IEarTrainingQuestionFeedback {
	answerCorrect: boolean;
	correctAnswerValue: string;
	continueButtonDisabled: boolean;
	continueAfterFeedback: () => void;
	exerciseType: EarTrainingExerciseType;
}

const EarTrainingQuestionFeedback: React.FC<IEarTrainingQuestionFeedback> = ({ answerCorrect, correctAnswerValue, continueButtonDisabled, continueAfterFeedback, exerciseType }) => {
	const { t } = useTranslation();

	return (
		<motion.div
			layout={'position'}
			key={'feedback'}
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			transition={{
				duration: 1.5,
				type: 'spring'
			}}
			className='flex flex-col items-center space-y-12'
		>
			<>
				{answerCorrect ? (
					<div className='grid size-24 place-content-center rounded-full border-[2.5px] border-green-600/75 bg-transparent bg-gradient-to-tr from-green-600/35 to-green-600/50 text-green-200 shadow-round-2xl shadow-green-600/50'>
						<motion.svg
							xmlns='http://www.w3.org/2000/svg'
							width='48'
							height='48'
							viewBox='0 0 24 24'
							fill='none'
							stroke='currentColor'
							strokeWidth='2'
							strokeLinecap='round'
							strokeLinejoin='round'
							className='tabler-icon tabler-icon-check'
						>
							<motion.path
								d='M5 12l5 5l10 -10'
								variants={{
									hidden: {
										pathLength: 0
									},
									visible: {
										pathLength: 1,
										transition: {
											duration: 0.8,
											ease: 'easeInOut'
										}
									}
								}}
								initial='hidden'
								animate='visible'
							/>
						</motion.svg>
					</div>
				) : (
					<div className='grid size-24 place-content-center rounded-full border-[2.5px] border-red-600/75 bg-transparent bg-gradient-to-tr from-red-600/35 to-red-600/50 text-red-200 shadow-round-2xl shadow-red-600/50'>
						<motion.svg
							xmlns='http://www.w3.org/2000/svg'
							width='48'
							height='48'
							viewBox='0 0 24 24'
							fill='none'
							stroke='currentColor'
							strokeWidth='2'
							strokeLinecap='round'
							strokeLinejoin='round'
							className='tabler-icon tabler-icon-x'
							initial='hidden'
							animate='visible'
						>
							<motion.path
								d='M18 6l-12 12'
								variants={{
									hidden: {
										pathLength: 0
									},
									visible: {
										pathLength: 1,
										transition: {
											duration: 0.4,
											ease: 'easeInOut'
										}
									}
								}}
							/>
							<motion.path
								d='M6 6l12 12'
								variants={{
									hidden: {
										pathLength: 0,
										opacity: 0
									},
									visible: {
										pathLength: 1,
										opacity: 1,
										transition: {
											duration: 0.55,
											delay: 0.45,
											ease: 'easeInOut'
										}
									}
								}}
							/>
						</motion.svg>
					</div>
				)}
				<h3 className='text-center text-4xl font-semibold'>{t(`${exerciseType}.${correctAnswerValue}`)}</h3>
				<Button
					fw={500}
					radius={'xl'}
					disabled={continueButtonDisabled}
					onClick={continueAfterFeedback}
					className='disabled:bg-violet-600/25 disabled:opacity-50'
				>
					{answerCorrect ? t('continue') : t('explanation')}
				</Button>
			</>
		</motion.div>
	);
};

export default EarTrainingQuestionFeedback;
