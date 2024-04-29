import { useTranslation } from 'react-i18next';

import { EarTrainingPracticeType } from '@/features/ear-training/practice/services/practice-session.service';
import { resolvePracticeResultColor, resolvePracticeResultMessage } from '@/features/ear-training/practice/utils/practice-session.util';
import { Badge, Card, Center, Drawer, Progress, RingProgress, Skeleton, ThemeIcon } from '@mantine/core';
import { IconCheck, IconX } from '@tabler/icons-react';

import { IEarTrainingPracticeSession } from '../../services/ear-training-analytics.service';

const EAR_TRAINING_PRACTICE_TYPE_NAMESPACES: Record<EarTrainingPracticeType, string> = {
	'interval-identification': 'interval',
	'chord-identification': 'chord',
	'mode-identification': 'mode'
};

interface IEarTrainingDetailDrawerProps {
	earTrainingDetailDrawerOpened: boolean;
	closeEarTrainingDetailDrawer: () => void;
	earTrainingSession: IEarTrainingPracticeSession | null;
	earTrainingExerciseType: EarTrainingPracticeType;
}

// TODO: Translation
const EarTrainingDetailDrawer: React.FC<IEarTrainingDetailDrawerProps> = ({ earTrainingDetailDrawerOpened, closeEarTrainingDetailDrawer, earTrainingSession, earTrainingExerciseType }) => {
	const { t } = useTranslation();

	return (
		<Drawer
			position='left'
			title={'Practice session detail'}
			opened={earTrainingDetailDrawerOpened}
			onClose={closeEarTrainingDetailDrawer}
			closeButtonProps={{ size: 'sm' }}
			classNames={{ title: 'font-semibold text-sm', content: 'scrollbar-none' }}
			withinPortal
		>
			<div className='space-y-6'>
				{earTrainingSession === null ? (
					<>
						<div className='grid gap-3 min-[350px]:grid-cols-[3fr_2fr]'>
							<Skeleton
								radius={'md'}
								className='h-[6.75rem]'
							/>
							<Skeleton
								radius={'md'}
								className='h-[6.75rem]'
							/>
						</div>
						<h3 className='text-sm font-medium text-white'>Exercises</h3>
						<div className='space-y-3'>
							{Array.from({ length: 8 }).map((_, index) => (
								<Skeleton
									key={index}
									radius={'md'}
									className='h-20'
								/>
							))}
						</div>
					</>
				) : (
					<>
						<div className='grid gap-3 min-[350px]:grid-cols-[3fr_2fr]'>
							<Card radius='md'>
								<div className='flex h-full items-center justify-center gap-3'>
									<RingProgress
										size={60}
										roundCaps
										thickness={3}
										label={
											<Center>
												<ThemeIcon
													color={resolvePracticeResultColor(earTrainingSession.result.correct, earTrainingSession.result.questionCount)}
													variant='light'
													radius='xl'
													size='lg'
												>
													<IconCheck />
												</ThemeIcon>
											</Center>
										}
										sections={[
											{
												value: earTrainingSession.result.score,
												color: resolvePracticeResultColor(earTrainingSession.result.correct, earTrainingSession.result.questionCount)
											}
										]}
									/>
									<div>
										<h1 className='text-3xl font-medium text-white'>{earTrainingSession?.result.score}%</h1>
										<p className='text-gray-400'>
											{earTrainingSession?.result.correct}/{earTrainingSession?.result.questionCount}
										</p>
									</div>
								</div>
							</Card>
							<Card radius='md'>
								<div className='flex h-full flex-col space-y-1 text-center'>
									<p className='text-xs text-gray-400'>Message:</p>
									<p className='flex flex-grow items-center justify-center text-sm text-white'>
										{resolvePracticeResultMessage(earTrainingSession?.result.correct, earTrainingSession?.result.questionCount)}
									</p>
								</div>
							</Card>
						</div>

						<div className='space-y-4'>
							<h3 className='text-sm font-medium text-white'>Exercises</h3>
							{earTrainingSession?.statistics.map(({ score, correct, incorrect, questionType, questionCount }) => {
								const exerciseResultColor = resolvePracticeResultColor(correct, questionCount);

								return (
									<Card
										radius={'md'}
										key={questionType}
										className='space-y-2 p-3'
									>
										<div className='flex items-center justify-between gap-4 text-sm text-white'>
											<p className='font-medium'>{t(`${EAR_TRAINING_PRACTICE_TYPE_NAMESPACES[earTrainingExerciseType]}.${questionType}`)}</p>
											<Badge
												variant='light'
												color={exerciseResultColor}
											>
												{score}%
											</Badge>
										</div>
										<Progress
											value={score}
											color={exerciseResultColor}
											className='w-full'
											size={'sm'}
										/>
										<div className='flex items-center justify-end gap-4 text-xs'>
											<div className='flex items-center gap-2'>
												<div className='rounded-full border border-green-500 bg-green-500 bg-opacity-25'>
													<IconCheck
														size={14}
														stroke={1.2}
													/>
												</div>
												<p>{correct}</p>
											</div>
											<div className='flex items-center gap-2'>
												<IconX
													size={14}
													stroke={1.2}
													className='rounded-full border border-red-500 bg-red-500 bg-opacity-25'
												/>
												<p>{incorrect}</p>
											</div>
										</div>
									</Card>
								);
							})}
						</div>
					</>
				)}
			</div>
		</Drawer>
	);
};

export default EarTrainingDetailDrawer;
