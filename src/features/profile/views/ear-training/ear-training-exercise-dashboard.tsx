import dayjs, { duration } from 'dayjs';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import { useState } from 'react';

import EarTrainingLayout from '@/features/ear-training/practice/layouts/ear-training-layout';
import { EarTrainingPracticeType } from '@/features/ear-training/practice/services/practice-session.service';
import { resolvePracticeResultColor } from '@/features/ear-training/practice/utils/practice-session.util';
import { ActionIcon, Badge, Card, Progress, Skeleton } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconCheck, IconDotsVertical, IconFilesOff, IconX } from '@tabler/icons-react';

import ChartLoader from '../../components/chart/chart-loader';
import DashboardAreaChart from '../../components/chart/dashboard-area-chart';
import DashboardBarChart from '../../components/chart/dashboard-bar-chart';
import DashboardChartSegmentedControl from '../../components/input/dashboard-segmented-control';
import EarTrainingDetailDrawer from '../../components/overlay/ear-training-detail-drawer';
import { IEarTrainingPracticeSession, useEarTrainingExerciseStatisticsQuery, useEarTrainingPracticeSessionListQuery } from '../../services/ear-training-analytics.service';
import { EarTrainingDashboardChartType } from '../../types';

dayjs.extend(duration);

const EarTrainingExerciseDashboard = () => {
	const router = useRouter();
	const exerciseType = router.query?.exercise as EarTrainingPracticeType;

	const [selectedPracticeSession, setSelectedPracticeSession] = useState<IEarTrainingPracticeSession | null>(null);
	const [practiceSessionDetailDrawerOpened, { open: openPracticeSessionDetailDrawer, close: closePracticeSessionDetailDrawer }] = useDisclosure();

	const { earTrainingExerciseStatistics, earTrainingExerciseStatisticsPending } = useEarTrainingExerciseStatisticsQuery({
		enabled: !!exerciseType,
		exerciseType
	});

	const { practiceSessionList, practiceSessionListPending } = useEarTrainingPracticeSessionListQuery({
		enabled: !!exerciseType,
		queryParams: { type: exerciseType, page: 1 }
	});

	const [dashboardChartType, setDashboardChartType] = useState<EarTrainingDashboardChartType>('activity');

	return (
		<EarTrainingLayout
			centered={false}
			showAffix={false}
		>
			<div className='mx-auto w-full max-w-lg space-y-8'>
				<motion.div
					key={'charts'}
					layout={'position'}
					className='space-y-4'
				>
					<DashboardChartSegmentedControl
						dashboardChartType={dashboardChartType}
						setDashboardChartType={setDashboardChartType}
					/>
					{dashboardChartType === 'activity' ? (
						<ChartLoader
							pending={earTrainingExerciseStatisticsPending}
							data={earTrainingExerciseStatistics?.activity}
							chart={
								<DashboardAreaChart
									data={earTrainingExerciseStatistics?.activity!}
									dataKeys={{ area: 'activity', xAxis: 'date', yAxis: 'activity' }}
									tooltipLabel={'exercises'} // TODO: Translation
									tickFormatter={(date: string) => dayjs(date).format('MM/DD')}
								/>
							}
						/>
					) : (
						<ChartLoader
							pending={earTrainingExerciseStatisticsPending}
							data={earTrainingExerciseStatistics?.progress}
							chart={
								<DashboardBarChart
									data={earTrainingExerciseStatistics?.progress!}
									dataKeys={{ bar: 'score', label: 'score', xAxis: 'date', yAxis: 'score' }}
								/>
							}
						/>
					)}
				</motion.div>

				<motion.div
					key={'history'}
					layout={'position'}
					className='space-y-4'
				>
					<h3 className='text-sm font-semibold'>Practice session history</h3>
					{practiceSessionListPending ? (
						Array.from({ length: 10 }).map((_, index) => (
							<Skeleton
								key={index}
								radius={'md'}
								className='h-20 before:!bg-transparent after:!bg-transparent after:bg-gradient-to-tr after:from-violet-600/15 after:to-violet-600/30 md:h-[5.5rem]'
							/>
						))
					) : !!practiceSessionList && practiceSessionList?.docs.length > 0 ? (
						practiceSessionList?.docs.map((s, index) => {
							const exerciseResultColor = resolvePracticeResultColor(s.result.correct, s.result.questionCount);

							return (
								<Card
									key={index}
									radius={'md'}
									className='border-violet-600 bg-transparent bg-gradient-to-tr from-violet-600/10 to-violet-600/30'
								>
									<div className='space-y-3'>
										<div className='flex items-center justify-between gap-4'>
											<p className='text-sm font-medium text-white md:text-base'>Date: {dayjs(s.createdAt).format('MMM DD, HH:mm')}</p>
											<div className='flex items-center gap-1'>
												<Badge
													size={'lg'}
													variant='light'
													color={exerciseResultColor}
												>
													{s.result.score}%
												</Badge>
												<ActionIcon
													mr={-8}
													size={'sm'}
													variant='transparent'
													onClick={() => {
														setSelectedPracticeSession(s);
														openPracticeSessionDetailDrawer();
													}}
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
											value={s.result.score}
											color={exerciseResultColor}
											className='w-full'
										/>
										<div className='flex items-center justify-between text-sm text-white'>
											<p>Duration: {dayjs.duration(s.duration, 'seconds').format(s.duration < 3600 ? 'mm:ss' : 'HH:mm:ss')}</p>
											<div className='flex items-center gap-4'>
												<div className='flex items-center gap-2'>
													<IconCheck
														size={14}
														stroke={1.2}
														className='rounded-full border border-green-500 bg-green-500 bg-opacity-25'
													/>
													<p>{s.result.correct}</p>
												</div>
												<div className='flex items-center gap-2'>
													<IconX
														size={14}
														stroke={1.2}
														className='rounded-full border border-red-500 bg-red-500 bg-opacity-25'
													/>
													<p>{s.result.incorrect}</p>
												</div>
											</div>
										</div>
									</div>
								</Card>
							);
						})
					) : (
						<div className='flex h-80 flex-col items-center justify-center gap-4 rounded-lg bg-transparent bg-gradient-to-tr from-violet-600/10 to-violet-600/20'>
							<div className='aspect-square rounded-full border-[1.5px] border-violet-600 bg-violet-600/25 p-2.5'>
								<IconFilesOff
									stroke={1.6}
									className='stroke-violet-600'
								/>
							</div>
							<p className='text-lg font-medium'>No document found</p>
						</div>
					)}
				</motion.div>
			</div>

			<EarTrainingDetailDrawer
				earTrainingSession={selectedPracticeSession}
				earTrainingDetailDrawerOpened={practiceSessionDetailDrawerOpened}
				closeEarTrainingDetailDrawer={() => {
					closePracticeSessionDetailDrawer();
					setSelectedPracticeSession(null);
				}}
				earTrainingExerciseType={exerciseType}
			/>
		</EarTrainingLayout>
	);
};

export default EarTrainingExerciseDashboard;
