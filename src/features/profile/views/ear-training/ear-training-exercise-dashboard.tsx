import dayjs, { duration } from 'dayjs';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import EarTrainingLayout from '@/features/ear-training/practice/layouts/ear-training-layout';
import { EarTrainingPracticeType } from '@/features/ear-training/practice/services/practice-session.service';
import { resolvePracticeResultColor, resolvePracticeResultLevel } from '@/features/ear-training/practice/utils/practice-session.util';
import { Accordion, Center, List, RingProgress, Skeleton, ThemeIcon } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconActivity, IconAlertTriangle, IconCheck, IconFilesOff } from '@tabler/icons-react';

import ChartLoader from '../../components/chart/chart-loader';
import DashboardAreaChart from '../../components/chart/dashboard-area-chart';
import DashboardBarChart from '../../components/chart/dashboard-bar-chart';
import DashboardStatisticCard from '../../components/data-display/dashboard-statistic-card';
import EarTrainingSessionCard from '../../components/data-display/ear-training-session-card';
import DashboardChartSegmentedControl from '../../components/input/dashboard-segmented-control';
import IconWrapper from '../../components/misc/icon-wrapper';
import EarTrainingDetailDrawer from '../../components/overlay/ear-training-detail-drawer';
import {
	IEarTrainingPracticeSession,
	useEarTrainingExerciseErrorsQuery,
	useEarTrainingExerciseStatisticsQuery,
	useEarTrainingPracticeSessionListQuery
} from '../../services/ear-training-analytics.service';
import { EarTrainingDashboardChartType } from '../../types';

const EAR_TRAINING_PRACTICE_TYPE_NAMESPACES: Record<EarTrainingPracticeType, string> = {
	'interval-identification': 'interval',
	'chord-identification': 'chord',
	'mode-identification': 'mode'
};

dayjs.extend(duration);

const EarTrainingExerciseDashboard = () => {
	const router = useRouter();
	const exerciseType = router.query?.exercise as EarTrainingPracticeType;

	const { t } = useTranslation();

	const { earTrainingExerciseStatistics, earTrainingExerciseStatisticsPending } = useEarTrainingExerciseStatisticsQuery({
		enabled: !!exerciseType,
		exerciseType
	});

	const { earTrainingExerciseErrors, earTrainingExerciseErrorsPending } = useEarTrainingExerciseErrorsQuery({
		enabled: !!exerciseType,
		exerciseType
	});

	const { practiceSessionList, practiceSessionListPending } = useEarTrainingPracticeSessionListQuery({
		enabled: !!exerciseType,
		queryParams: { type: exerciseType, page: 1 }
	});

	const [selectedPracticeSession, setSelectedPracticeSession] = useState<IEarTrainingPracticeSession | null>(null);
	const [practiceSessionDetailDrawerOpened, { open: openPracticeSessionDetailDrawer, close: closePracticeSessionDetailDrawer }] = useDisclosure();

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
					key={'insights'}
					layout={'position'}
					className='space-y-4'
				>
					<h3 className='text-sm font-semibold'>Monthly insights</h3>
					<div className='grid grid-cols-2 gap-4'>
						{earTrainingExerciseStatisticsPending ? (
							Array.from({ length: 2 }).map((_, index) => (
								<Skeleton
									key={index}
									radius={'md'}
									className='h-[6.55rem] before:!bg-transparent after:!bg-transparent after:bg-gradient-to-tr after:from-violet-600/15 after:to-violet-600/30 md:h-[7.05rem]'
								/>
							))
						) : (
							<>
								<DashboardStatisticCard
									label={'Average activity'}
									value={earTrainingExerciseStatistics?.insights.averageActivity}
									icon={<IconWrapper Icon={IconActivity} />}
								/>
								<DashboardStatisticCard
									label={'Average score'}
									value={earTrainingExerciseStatistics?.insights.averageScore}
									icon={
										<RingProgress
											size={40}
											roundCaps
											thickness={2}
											label={
												<Center>
													<ThemeIcon
														color={resolvePracticeResultColor(earTrainingExerciseStatistics?.insights.averageScore!, 100)}
														variant='light'
														radius='xl'
														size='md'
													>
														{resolvePracticeResultLevel(earTrainingExerciseStatistics?.insights.averageScore!, 100) === 'high' ? (
															<IconCheck size={20} />
														) : (
															<IconAlertTriangle size={18} />
														)}
													</ThemeIcon>
												</Center>
											}
											sections={[
												{
													value: earTrainingExerciseStatistics?.insights.averageScore!,
													color: resolvePracticeResultColor(earTrainingExerciseStatistics?.insights.averageScore!, 100)
												}
											]}
										/>
									}
								/>
							</>
						)}
					</div>
				</motion.div>

				<motion.div
					key={'common_errors'}
					layout={'position'}
					className='space-y-4'
				>
					<h3 className='text-sm font-semibold'>Common errors</h3>
					{earTrainingExerciseErrorsPending ? (
						Array.from({ length: 5 }).map((_, index) => (
							<Skeleton
								key={index}
								radius={'md'}
								className='h-[3.05rem] before:!bg-transparent after:!bg-transparent after:bg-gradient-to-tr after:from-violet-600/15 after:to-violet-600/30'
							/>
						))
					) : !!earTrainingExerciseErrors && earTrainingExerciseErrors?.length > 0 ? (
						<Accordion variant='separated'>
							{earTrainingExerciseErrors.map(e => (
								<Accordion.Item
									key={e.questionType}
									value={e.questionType}
									className='rounded-lg border-none bg-transparent bg-gradient-to-tr from-violet-600/15 to-violet-600/30'
								>
									<Accordion.Control classNames={{ chevron: 'text-white' }}>
										<div className='flex items-center justify-between gap-4'>
											<h3 className='font-medium text-violet-100'>{t(`${EAR_TRAINING_PRACTICE_TYPE_NAMESPACES[exerciseType]}.${e.questionType}`)}</h3>
										</div>
									</Accordion.Control>

									<Accordion.Panel classNames={{ content: 'space-y-2 pt-0 pl-6' }}>
										<List listStyleType='initial'>
											{e.errors.map((mistakenType, index) => (
												<List.Item
													key={index}
													className='text-sm'
												>
													{t(`${EAR_TRAINING_PRACTICE_TYPE_NAMESPACES[exerciseType]}.${mistakenType}`)}
													{e.questionType === mistakenType && exerciseType === 'chord-identification' ? ` ${t('inversions').toLowerCase()}` : ''}
												</List.Item>
											))}
										</List>
									</Accordion.Panel>
								</Accordion.Item>
							))}
						</Accordion>
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
								className='h-[6.875rem] before:!bg-transparent after:!bg-transparent after:bg-gradient-to-tr after:from-violet-600/15 after:to-violet-600/30'
							/>
						))
					) : !!practiceSessionList && practiceSessionList?.docs.length > 0 ? (
						practiceSessionList?.docs.map((session, index) => (
							<EarTrainingSessionCard
								key={index}
								session={session}
								handleDetailIconClick={() => {
									setSelectedPracticeSession(session);
									openPracticeSessionDetailDrawer();
								}}
							/>
						))
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
