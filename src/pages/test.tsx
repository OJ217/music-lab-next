import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';

import EarTrainingLayout from '@/features/ear-training/practice/layouts/ear-training-layout';
import { EarTrainingPracticeType } from '@/features/ear-training/practice/services/practice-session.service';
import DashboardAreaChart from '@/features/profile/components/chart/dashboard-area-chart';
import DashboardBarChart from '@/features/profile/components/chart/dashboard-bar-chart';
import DashboardChartSegmentedControl from '@/features/profile/components/input/dashboard-segmented-control';
import { useEarTrainingOverallStatisticsQuery } from '@/features/profile/services/ear-training-analytics.service';
import { EarTrainingDashboardChartType } from '@/features/profile/types';
import { Badge, Skeleton, Tooltip } from '@mantine/core';
import { IconActivity, IconCalendar, IconChevronRight, IconHistory, IconMusic, IconStar } from '@tabler/icons-react';

const EAR_TRAINING_EXERCISES_META: Record<EarTrainingPracticeType, { icon: JSX.Element | React.ReactNode; label: string; description: string; badgeClass: string; cardClass: string }> = {
	'interval-identification': {
		label: 'Interval',
		description: 'Distance between two notes',
		icon: (
			<div className='grid aspect-square size-10 place-content-center rounded-md bg-transparent bg-gradient-to-tr from-violet-600/20 to-violet-600/40'>
				<IconMusic
					stroke={2}
					size={20}
					className='size-6 stroke-violet-400'
				/>
			</div>
		),
		cardClass: 'bg-gradient-to-tr from-violet-600/15 to-violet-600/30 bg-transparent',
		badgeClass: 'bg-violet-600/75'
	},
	'chord-identification': {
		label: 'Chord',
		description: 'Combination of three or more notes',
		icon: (
			<div className='grid aspect-square size-10 place-content-center rounded-md bg-transparent bg-gradient-to-tr from-sky-600/20 to-sky-600/40'>
				<IconMusic
					stroke={2}
					size={20}
					className='size-6 stroke-sky-400'
				/>
			</div>
		),
		cardClass: 'bg-gradient-to-tr from-sky-600/15 to-sky-600/30 bg-transparent',
		badgeClass: 'bg-sky-600/75'
	},
	'mode-identification': {
		label: 'Mode',
		description: 'Specific scale or tonal pattern',
		icon: (
			<div className='grid aspect-square size-10 place-content-center rounded-md bg-transparent bg-gradient-to-tr from-amber-600/20 to-amber-600/40'>
				<IconMusic
					stroke={2}
					size={20}
					className='size-6 stroke-amber-400'
				/>
			</div>
		),
		cardClass: 'bg-gradient-to-tr from-amber-600/15 to-amber-600/30 bg-transparent',
		badgeClass: 'bg-amber-600/75'
	}
};

const EarTrainingDashboard = () => {
	const { earTrainingOverallStatistics, earTrainingOverallStatisticsPending } = useEarTrainingOverallStatisticsQuery({});
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
						<DashboardAreaChart
							pending={earTrainingOverallStatisticsPending}
							data={earTrainingOverallStatistics?.activity}
							dataKeys={{
								area: 'activity',
								xAxis: 'date',
								yAxis: 'activity'
							}}
						/>
					) : (
						<DashboardBarChart
							pending={earTrainingOverallStatisticsPending}
							data={earTrainingOverallStatistics?.progress}
							dataKeys={{
								bar: 'score',
								label: 'score',
								xAxis: 'date',
								yAxis: 'score'
							}}
						/>
					)}
				</motion.div>

				<motion.div
					key={'insights'}
					layout={'position'}
					className='space-y-4'
				>
					<h3 className='text-sm font-medium'>Monthly activity insights</h3>
					<div className='grid grid-cols-2 gap-4'>
						{earTrainingOverallStatisticsPending ? (
							Array.from({ length: 4 }).map((_, index) => (
								<Skeleton
									key={index}
									radius={'md'}
									className='h-[6.3rem] before:!bg-transparent after:!bg-transparent after:bg-gradient-to-tr after:from-violet-600/15 after:to-violet-600/30 md:h-[6.8rem]'
								/>
							))
						) : (
							<>
								<div className='space-y-3 rounded-lg bg-transparent bg-gradient-to-tr from-violet-600/15 to-violet-600/30 p-4 md:p-5'>
									<div className='flex justify-between'>
										<h2 className='text-2xl font-semibold text-violet-100'>
											{!!earTrainingOverallStatistics ? earTrainingOverallStatistics?.insights.activity.averageActivity : '--'}
										</h2>
										<div className='grid aspect-square size-9 place-content-center rounded-full bg-gradient-to-tr from-violet-600/20 to-violet-600/40'>
											<IconActivity
												size={20}
												className='stroke-violet-400'
											/>
										</div>
									</div>
									<Badge variant='light'>Average activity</Badge>
								</div>
								<div className='space-y-3 rounded-lg bg-transparent bg-gradient-to-tr from-violet-600/15 to-violet-600/30 p-4 md:p-5'>
									<div className='flex justify-between'>
										<h2 className='text-viol1t-200 text-2xl font-semibold'>
											{!!earTrainingOverallStatistics ? earTrainingOverallStatistics?.insights.activity.bestActivity : '--'}
										</h2>
										<div className='grid aspect-square size-9 place-content-center rounded-full bg-gradient-to-tr from-violet-600/20 to-violet-600/40'>
											<IconStar
												size={20}
												className='stroke-violet-400'
											/>
										</div>
									</div>
									<Badge variant='light'>Best activity</Badge>
								</div>
								<div className='space-y-3 rounded-lg bg-transparent bg-gradient-to-tr from-violet-600/15 to-violet-600/30 p-4 md:p-5'>
									<div className='flex justify-between'>
										<h2 className='text-2xl font-semibold text-violet-100'>
											{!!earTrainingOverallStatistics ? earTrainingOverallStatistics?.insights.activity.totalActiveDays : '--'}
										</h2>
										<div className='grid aspect-square size-9 place-content-center rounded-full bg-gradient-to-tr from-violet-600/20 to-violet-600/40'>
											<IconCalendar
												size={20}
												className='stroke-violet-400'
											/>
										</div>
									</div>
									<Badge variant='light'>Total active days</Badge>
								</div>
								<div className='space-y-3 rounded-lg bg-transparent bg-gradient-to-tr from-violet-600/15 to-violet-600/30 p-4 md:p-5'>
									<div className='flex justify-between'>
										<h2 className='text-2xl font-semibold text-violet-100'>
											{!!earTrainingOverallStatistics ? earTrainingOverallStatistics?.insights.activity.totalActivity : '--'}
										</h2>
										<div className='grid aspect-square size-9 place-content-center rounded-full bg-gradient-to-tr from-violet-600/20 to-violet-600/40'>
											<IconHistory
												size={20}
												className='stroke-violet-400'
											/>
										</div>
									</div>
									<Badge variant='light'>Total activity</Badge>
								</div>
							</>
						)}
					</div>
				</motion.div>

				<motion.div
					key={'summary'}
					layout={'position'}
					className='space-y-4'
				>
					<h3 className='text-sm font-medium'>Monthly activity summary</h3>
					{earTrainingOverallStatisticsPending ? (
						<Skeleton
							radius={'md'}
							className='h-[9.5rem] before:!bg-transparent after:!bg-transparent after:bg-gradient-to-tr after:from-violet-600/15 after:to-violet-600/30 md:h-40'
						/>
					) : (
						<div className='space-y-4 rounded-lg bg-transparent bg-gradient-to-tr from-violet-600/15 to-violet-600/30 p-4 md:p-5'>
							<div className='flex h-2.5 items-stretch overflow-hidden rounded-2xl shadow-round-md'>
								<Tooltip
									label={earTrainingOverallStatistics?.insights.exercises['interval-identification'].segmentPercentage}
									className='bg-violet-600/50 font-semibold text-white backdrop-blur-sm'
								>
									<div
										className='h-full bg-transparent bg-gradient-to-r from-violet-600/40 to-violet-600/80'
										style={{
											width: `${earTrainingOverallStatistics?.insights.exercises['interval-identification'].segmentPercentage}%`
										}}
									/>
								</Tooltip>
								<Tooltip
									label={earTrainingOverallStatistics?.insights.exercises['chord-identification'].segmentPercentage}
									className='bg-sky-600/50 font-semibold text-white backdrop-blur-sm'
								>
									<div
										className='h-full bg-transparent bg-gradient-to-r from-sky-600/40 to-sky-600/80'
										style={{
											width: `${earTrainingOverallStatistics?.insights.exercises['chord-identification'].segmentPercentage}%`
										}}
									/>
								</Tooltip>
								<Tooltip
									label={earTrainingOverallStatistics?.insights.exercises['mode-identification'].segmentPercentage}
									className='bg-amber-600/50 font-semibold text-white backdrop-blur-sm'
								>
									<div
										className='h-full bg-transparent bg-gradient-to-r from-amber-600/40 to-amber-600/80'
										style={{
											width: `${earTrainingOverallStatistics?.insights.exercises['mode-identification'].segmentPercentage}%`
										}}
									/>
								</Tooltip>
							</div>
							<div className='space-y-2'>
								<div className='flex items-center justify-between'>
									<div className='flex items-center gap-3 font-medium'>
										<div className='aspect-square size-3 rounded-full bg-gradient-to-r from-violet-600/50 to-violet-600/75' />
										<p>Interval practice</p>
									</div>
									<Badge
										size={'lg'}
										color='violet'
										variant='light'
									>
										{earTrainingOverallStatistics ? earTrainingOverallStatistics?.insights.exercises['interval-identification'].activity : '--'}
									</Badge>
								</div>

								<div className='flex items-center justify-between'>
									<div className='flex items-center gap-3 font-medium'>
										<div className='aspect-square size-3 rounded-full bg-gradient-to-r from-sky-600/50 to-sky-600/75' />
										<p>Chord practice</p>
									</div>
									<Badge
										size={'lg'}
										color='blue'
										variant='light'
									>
										{earTrainingOverallStatistics ? earTrainingOverallStatistics?.insights.exercises['chord-identification'].activity : '--'}
									</Badge>
								</div>

								<div className='flex items-center justify-between'>
									<div className='flex items-center gap-3 font-medium'>
										<div className='aspect-square size-3 rounded-full bg-gradient-to-r from-amber-600/50 to-amber-600/75' />
										<p>Mode practice</p>
									</div>
									<Badge
										size={'lg'}
										color='orange'
										variant='light'
									>
										{earTrainingOverallStatistics ? earTrainingOverallStatistics?.insights.exercises['mode-identification'].activity : '--'}
									</Badge>
								</div>
							</div>
						</div>
					)}
				</motion.div>

				<motion.div
					key={'exercises'}
					layout={'position'}
					className='space-y-4'
				>
					<h3 className='font-medium'>Ear training exercises</h3>
					{earTrainingOverallStatisticsPending
						? Array.from({ length: 3 }).map((_, index) => (
								<Skeleton
									key={index}
									radius={'md'}
									className='h-[4.8rem] before:!bg-transparent after:!bg-transparent after:bg-gradient-to-tr after:from-violet-600/15 after:to-violet-600/30 md:h-[5.3rem]'
								/>
							))
						: earTrainingOverallStatistics?.exercises.map(stat => {
								const { icon, label, description, badgeClass, cardClass } = EAR_TRAINING_EXERCISES_META[stat.type];

								return (
									<div
										key={stat.type}
										className={`${cardClass} rounded-lg bg-transparent p-4 md:p-5`}
									>
										<div className='flex items-center justify-between gap-4'>
											<div className='flex items-center gap-4'>
												{icon}
												<div className='text-white'>
													<h3 className='font-semibold'>{label}</h3>
													<p className='text-sm'>{description}</p>
												</div>
											</div>

											<div className='flex items-center gap-2'>
												<Badge
													size='lg'
													className={badgeClass}
												>
													{stat.score}%
												</Badge>

												<Link href={`/profile/ear-training/${stat}`}>
													<IconChevronRight />
												</Link>
											</div>
										</div>
									</div>
								);
							})}
				</motion.div>
			</div>
		</EarTrainingLayout>
	);
};

export default EarTrainingDashboard;
