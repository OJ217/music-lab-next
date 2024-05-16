import dayjs from 'dayjs';
import React from 'react';

import { resolvePracticeResultColor } from '@/features/ear-training/practice/utils/practice-session.util';
import { ActionIcon, Badge, Progress } from '@mantine/core';
import { IconCheck, IconDotsVertical, IconX } from '@tabler/icons-react';

import { IEarTrainingPracticeSession } from '../../services/ear-training-analytics.service';

interface IEarTrainingSessionCardProps {
	session: IEarTrainingPracticeSession;
	handleDetailIconClick: () => void;
}

const EarTrainingSessionCard: React.FC<IEarTrainingSessionCardProps> = ({ session, handleDetailIconClick }) => {
	const exerciseResultColor = resolvePracticeResultColor(session.result.correct, session.result.questionCount);

	return (
		<div className='rounded-lg border-violet-600 bg-gradient-to-tr from-violet-600/10 to-violet-600/30 p-4'>
			<div className='space-y-3'>
				<div className='flex items-center justify-between gap-4'>
					<p className='text-sm font-medium text-white md:text-base'>Date: {dayjs(session.createdAt).format('MMM DD, HH:mm')}</p>
					<div className='flex items-center gap-1'>
						<Badge
							size={'lg'}
							variant='light'
							color={exerciseResultColor}
						>
							{session.result.score}%
						</Badge>
						<ActionIcon
							mr={-8}
							size={'sm'}
							variant='transparent'
							onClick={handleDetailIconClick}
						>
							<IconDotsVertical
								size={16}
								stroke={1.6}
								className='stroke-white'
							/>
						</ActionIcon>
					</div>
				</div>
				<Progress
					value={session.result.score}
					color={exerciseResultColor}
					className='w-full'
				/>
				<div className='flex items-center justify-between text-sm text-white'>
					<p>Duration: {dayjs.duration(session.duration, 'seconds').format(session.duration < 3600 ? 'mm:ss' : 'HH:mm:ss')}</p>
					<div className='flex items-center gap-4'>
						<div className='flex items-center gap-2'>
							<IconCheck
								size={14}
								stroke={1.2}
								className='rounded-full border border-green-500 bg-green-500 bg-opacity-25'
							/>
							<p>{session.result.correct}</p>
						</div>
						<div className='flex items-center gap-2'>
							<IconX
								size={14}
								stroke={1.2}
								className='rounded-full border border-red-500 bg-red-500 bg-opacity-25'
							/>
							<p>{session.result.incorrect}</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default EarTrainingSessionCard;
