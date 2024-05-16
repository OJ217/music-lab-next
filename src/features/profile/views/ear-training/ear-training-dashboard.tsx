import dayjs from 'dayjs';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';

import EarTrainingLayout from '@/features/ear-training/practice/layouts/ear-training-layout';
import { EarTrainingPracticeType } from '@/features/ear-training/practice/services/practice-session.service';
import { Badge, MantineColor, Skeleton, Tooltip } from '@mantine/core';
import { IconActivity, IconCalendar, IconChevronRight, IconHistory, IconMusic, IconStar } from '@tabler/icons-react';

import ChartLoader from '../../components/chart/chart-loader';
import DashboardAreaChart from '../../components/chart/dashboard-area-chart';
import DashboardBarChart from '../../components/chart/dashboard-bar-chart';
import DashboardStatisticCard from '../../components/data-display/dashboard-statistic-card';
import DashboardChartSegmentedControl from '../../components/input/dashboard-segmented-control';
import IconWrapper from '../../components/misc/icon-wrapper';
import { useEarTrainingOverallStatisticsQuery } from '../../services/ear-training-analytics.service';
import { EarTrainingDashboardChartType } from '../../types';

const EXERCISES_SCORE_META: Record<
	EarTrainingPracticeType,
	{ icon: JSX.Element | React.ReactNode; label: string; description: string; badgeClass: string; labelDescriptionClass: string; cardClass: string }
> = {
	'interval-identification': {
		label: 'Interval',
		description: 'Distance between two notes',
		icon: (
			<div className='grid aspect-square size-10 place-content-center rounded-md bg-transparent bg-gradient-to-tr from-violet-600/25 to-violet-600/50'>
				<IconMusic
					stroke={2}
					size={20}
					className='size-6 stroke-violet-300'
				/>
			</div>
		),
		cardClass: 'bg-gradient-to-tr from-violet-600/25 to-violet-600/50 bg-transparent',
		labelDescriptionClass: 'text-violet-100',
		badgeClass: 'bg-violet-600'
	},
	'chord-identification': {
		label: 'Chord',
		description: 'Combination of three or more notes',
		icon: (
			<div className='grid aspect-square size-10 place-content-center rounded-md bg-transparent bg-gradient-to-tr from-sky-600/25 to-sky-600/50'>
				<IconMusic
					stroke={2}
					size={20}
					className='size-6 stroke-sky-300'
				/>
			</div>
		),
		cardClass: 'bg-gradient-to-tr from-sky-600/25 to-sky-600/50 bg-transparent',
		labelDescriptionClass: 'text-sky-100',
		badgeClass: 'bg-sky-600'
	},
	'mode-identification': {
		label: 'Mode',
		description: 'Specific scale or tonal pattern',
		icon: (
			<div className='grid aspect-square size-10 place-content-center rounded-md bg-transparent bg-gradient-to-tr from-amber-600/25 to-amber-600/50'>
				<IconMusic
					stroke={2}
					size={20}
					className='size-6 stroke-amber-300'
				/>
			</div>
		),
		cardClass: 'bg-gradient-to-tr from-amber-600/25 to-amber-600/50 bg-transparent',
		labelDescriptionClass: 'text-amber-100',
		badgeClass: 'bg-amber-600'
	}
};

const MONTHLY_ACTIVITY_SUMMARY_META: Record<EarTrainingPracticeType, { tooltipClass: string; segmentClass: string; label: string; badgeColor: MantineColor }> = {
	'interval-identification': {
		tooltipClass: 'bg-violet-600/75 font-semibold text-white backdrop-blur-sm',
		segmentClass: 'h-full bg-violet-600',
		label: 'Interval practice',
		badgeColor: 'bg-violet-600'
	},
	'chord-identification': {
		tooltipClass: 'bg-sky-600/75 font-semibold text-white backdrop-blur-sm',
		segmentClass: 'h-full bg-sky-600',
		label: 'Chord practice',
		badgeColor: 'bg-sky-600'
	},
	'mode-identification': {
		tooltipClass: 'bg-amber-600/75 font-semibold text-white backdrop-blur-sm',
		segmentClass: 'h-full bg-amber-600',
		label: 'Mode practice',
		badgeColor: 'bg-amber-600'
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
						<ChartLoader
							pending={earTrainingOverallStatisticsPending}
							data={earTrainingOverallStatistics?.activity}
							chart={
								<DashboardAreaChart
									data={earTrainingOverallStatistics?.activity!}
									dataKeys={{ area: 'activity', xAxis: 'date', yAxis: 'activity' }}
									tooltipLabel={'exercises'} // TODO: Translation
									tickFormatter={(date: string) => dayjs(date).format('MM/DD')}
								/>
							}
						/>
					) : (
						<ChartLoader
							pending={earTrainingOverallStatisticsPending}
							data={earTrainingOverallStatistics?.scores}
							chart={
								<DashboardBarChart
									data={earTrainingOverallStatistics?.scores!}
									dataKeys={{ bar: 'score', label: 'score', xAxis: 'date', yAxis: 'score' }}
								/>
							}
						/>
					)}
				</motion.div>

				<motion.div
					key={'activity_insights'}
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
								{[
									{ Icon: <IconWrapper Icon={IconActivity} />, label: 'Average activity', value: earTrainingOverallStatistics?.insights.activity.averageActivity },
									{ Icon: <IconWrapper Icon={IconStar} />, label: 'Best activity', value: earTrainingOverallStatistics?.insights.activity.bestActivity },
									{ Icon: <IconWrapper Icon={IconCalendar} />, label: 'Total active days', value: earTrainingOverallStatistics?.insights.activity.totalActiveDays },
									{ Icon: <IconWrapper Icon={IconHistory} />, label: 'Total activity', value: earTrainingOverallStatistics?.insights.activity.totalActivity }
								].map((insight, index) => (
									<DashboardStatisticCard
										key={index}
										label={insight.label}
										value={insight.value}
										icon={insight.Icon}
									/>
								))}
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
						// TODO: Extract a component
						<div className='space-y-4 rounded-lg bg-transparent bg-gradient-to-tr from-violet-600/25 to-violet-600/50 p-4 md:p-5'>
							{!!earTrainingOverallStatistics?.insights?.exercises && earTrainingOverallStatistics?.insights?.exercises.length > 0 ? (
								<>
									<div className='flex h-2.5 items-stretch overflow-hidden rounded-2xl shadow-round-md'>
										{earTrainingOverallStatistics.insights.exercises.map(exercise => {
											const { tooltipClass, segmentClass } = MONTHLY_ACTIVITY_SUMMARY_META[exercise.type];
											return (
												<Tooltip
													key={exercise.type}
													label={exercise.segmentPercentage}
													className={tooltipClass}
												>
													<div
														className={segmentClass}
														style={{ width: `${exercise.segmentPercentage}%` }}
													/>
												</Tooltip>
											);
										})}
									</div>
									<div className='space-y-2'>
										{earTrainingOverallStatistics.insights.exercises.map(exercise => {
											const { label, badgeColor } = MONTHLY_ACTIVITY_SUMMARY_META[exercise.type];

											return (
												<div
													key={exercise.type}
													className='flex items-center justify-between'
												>
													<p className='font-medium'>{label}</p>
													<div className={`rounded-md ${badgeColor} px-2 py-0.5`}>
														<p className='text-sm font-bold'>{exercise.activity}</p>
													</div>
												</div>
											);
										})}
									</div>
								</>
							) : (
								<div className='space-y-2'>
									{Object.values(EarTrainingPracticeType).map(type => {
										const { label, badgeColor } = MONTHLY_ACTIVITY_SUMMARY_META[type];

										return (
											<div
												key={type}
												className='flex items-center justify-between'
											>
												<p className='font-medium'>{label}</p>
												<div className={`rounded-md ${badgeColor} px-2 py-0.5`}>
													<p className='text-sm font-bold'>--</p>
												</div>
											</div>
										);
									})}
								</div>
							)}
						</div>
					)}
				</motion.div>

				<motion.div
					key={'exercises'}
					layout={'position'}
					className='space-y-4'
				>
					<h3 className='text-sm font-medium'>Ear training exercises</h3>
					{earTrainingOverallStatisticsPending
						? Array.from({ length: 3 }).map((_, index) => (
								<Skeleton
									key={index}
									radius={'md'}
									className='h-[4.8rem] before:!bg-transparent after:!bg-transparent after:bg-gradient-to-tr after:from-violet-600/15 after:to-violet-600/30 md:h-[5.3rem]'
								/>
							))
						: !!earTrainingOverallStatistics?.exercises && earTrainingOverallStatistics.exercises.length > 0
							? // TODO: Extract a component
								earTrainingOverallStatistics?.exercises.map(stat => {
									const { icon, label, description, badgeClass, labelDescriptionClass, cardClass } = EXERCISES_SCORE_META[stat.type];

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
														<p className={`text-[13px] ${labelDescriptionClass}`}>{description}</p>
													</div>
												</div>

												<div className='flex items-center gap-2'>
													<Badge
														size='lg'
														className={badgeClass}
													>
														{stat.score}%
													</Badge>

													<Link href={`/profile/ear-training/${stat.type}`}>
														<IconChevronRight />
													</Link>
												</div>
											</div>
										</div>
									);
								})
							: Object.values(EarTrainingPracticeType).map(type => {
									const { icon, label, description, cardClass, labelDescriptionClass, badgeClass } = EXERCISES_SCORE_META[type];

									return (
										<div
											key={type}
											className={`${cardClass} rounded-lg bg-transparent p-4 md:p-5`}
										>
											<div className='flex items-center justify-between gap-4'>
												<div className='flex items-center gap-4'>
													{icon}
													<div className='text-white'>
														<h3 className='font-semibold'>{label}</h3>
														<p className={`text-[13px] ${labelDescriptionClass}`}>{description}</p>
													</div>
												</div>

												<div className='flex items-center gap-2'>
													<Badge
														size='lg'
														className={badgeClass}
													>
														--
													</Badge>

													<Link href={`/profile/ear-training/${type}`}>
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
