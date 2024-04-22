import dayjs from 'dayjs';
import Link from 'next/link';
import { useState } from 'react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { useAuth } from '@/context/auth/auth.context';
import EarTrainingLayout from '@/features/ear-training/practice/layouts/ear-training-layout';
import { EarTrainingPracticeType } from '@/features/ear-training/practice/services/practice-session.service';
import { SelectData } from '@/types';
import { calculatePercentage } from '@/utils/format.util';
import { Avatar, Badge, LoadingOverlay, rem, SegmentedControl, Skeleton } from '@mantine/core';
import { IconChartBarOff, IconCheck, IconChevronRight, IconMusic, IconX } from '@tabler/icons-react';

import { useEarTrainingPracticeSessionActivityQuery, useEarTrainingPracticeSessionProgressQuery, useEarTrainingPracticeSessionScoresQuery } from '../../services/ear-training-dashboard.service';

const EAR_TRAINING_EXERCISES_META: Record<EarTrainingPracticeType, { icon: JSX.Element | React.ReactNode; label: string; description: string; badgeClass: string; cardClass: string }> = {
	'interval-identification': {
		label: 'Interval',
		description: 'Distance between two notes',
		icon: (
			<div className='grid aspect-square h-9 place-content-center rounded-md border border-violet-600 bg-violet-600/10 md:h-12'>
				<IconMusic
					stroke={1.6}
					className='h-5 w-5 stroke-violet-600 md:h-7 md:w-7'
				/>
			</div>
		),
		cardClass: 'bg-gradient-to-tr from-violet-600/10 to-violet-600/25',
		badgeClass: 'bg-violet-600'
	},
	'chord-identification': {
		label: 'Chord',
		description: 'Combination of three or more notes',
		icon: (
			<div className='grid aspect-square h-9 place-content-center rounded-md border border-sky-600 bg-sky-600/10 md:h-12'>
				<IconMusic
					stroke={1.6}
					className='h-5 w-5 stroke-sky-600 md:h-7 md:w-7'
				/>
			</div>
		),
		cardClass: 'bg-gradient-to-tr from-sky-600/10 to-sky-600/25',
		badgeClass: 'bg-sky-600'
	},
	'mode-identification': {
		label: 'Mode',
		description: 'Specific scale or tonal pattern',
		icon: (
			<div className='grid aspect-square h-9 place-content-center rounded-md border border-amber-600 bg-amber-600/10 md:h-12'>
				<IconMusic
					stroke={1.6}
					className='h-5 w-5 stroke-amber-600 md:h-7 md:w-7'
				/>
			</div>
		),
		cardClass: 'bg-gradient-to-tr from-amber-600/10 to-amber-600/25',
		badgeClass: 'bg-amber-600'
	}
};

const EarTrainingDashboard = () => {
	const { practiceSessionActivity, activityQueryPending } = useEarTrainingPracticeSessionActivityQuery({});
	const { practiceSessionProgress, progressQueryPending } = useEarTrainingPracticeSessionProgressQuery({});
	const { practiceSessionScores, scoresQueryPending } = useEarTrainingPracticeSessionScoresQuery({});

	practiceSessionActivity?.sort((a, b) => dayjs(a.date).diff(dayjs(b.date)));

	type EarTrainingDashboardType = 'activity' | 'progress';
	const [dashboardType, setDashboardType] = useState<EarTrainingDashboardType>('activity');
	const dashboardSegmentedControlData: SelectData<EarTrainingDashboardType> = [
		{ label: 'Activity', value: 'activity' },
		{ label: 'Progress', value: 'progress' }
	];

	const { userInfo } = useAuth();

	return (
		<EarTrainingLayout
			centered={false}
			showAffix={false}
		>
			<div className='mx-auto w-full max-w-lg space-y-8'>
				<div className='flex flex-wrap items-center justify-center gap-4 rounded-lg bg-transparent bg-gradient-to-tr from-violet-600/10 to-violet-600/20 p-4 md:gap-6 md:p-6'>
					{userInfo?.picture ? (
						<Avatar
							radius={'50%'}
							size={rem(96)}
							src={userInfo.picture}
						/>
					) : (
						<Avatar
							radius={'50%'}
							size={rem(96)}
							variant='gradient'
							gradient={{ from: 'violet', to: 'violet.6' }}
							classNames={{
								placeholder: 'text-white'
							}}
						>
							{userInfo?.username[0].toUpperCase()}
						</Avatar>
					)}
					<div className='space-y-4'>
						<div className='text-center'>
							<h3 className='font-bold md:text-xl'>{userInfo?.username}</h3>
							<p className='text-sm'>{userInfo?.email}</p>
						</div>
						<div className='flex flex-wrap items-center justify-center gap-2'>
							<Badge
								variant='light'
								color='violet'
							>
								1200 XP
							</Badge>
							<Badge
								variant='light'
								color='orange'
							>
								2-DAY STREAK
							</Badge>
							<Badge
								variant='light'
								color='blue'
							>
								RISING STAR
							</Badge>
						</div>
					</div>
				</div>

				<div className='space-y-4'>
					<SegmentedControl
						size='xs'
						radius='xl'
						fullWidth
						value={dashboardType}
						color='violet.6'
						className='bg-violet-600/10'
						onChange={t => setDashboardType(t as EarTrainingDashboardType)}
						data={dashboardSegmentedControlData}
					/>
					<div className='relative rounded-lg border-violet-600 bg-transparent bg-gradient-to-tr from-violet-600/10 to-violet-600/20 pb-2 pl-2 pr-4 pt-4'>
						{dashboardType === 'activity' ? (
							<ResponsiveContainer
								height={200}
								width={'100%'}
							>
								{activityQueryPending ? (
									<LoadingOverlay
										visible={true}
										loaderProps={{ type: 'dots' }}
										classNames={{
											overlay: 'bg-transparent rounded-lg'
										}}
									/>
								) : practiceSessionActivity && practiceSessionActivity?.length > 0 ? (
									<AreaChart
										data={practiceSessionActivity}
										className={'text-xs'}
									>
										<defs>
											<linearGradient
												id='color'
												x1='0'
												y1='0'
												x2='0'
												y2='1'
											>
												<stop
													offset='0%'
													stopColor='#7C3AED'
													stopOpacity={0.6}
												/>
												<stop
													offset='80%'
													stopColor='#7C3AED'
													stopOpacity={0.2}
												/>
											</linearGradient>
										</defs>
										<Area
											type={'monotone'}
											dataKey={'activity'}
											fill={'url(#color)'}
											stroke={'#7C3AED'}
											strokeWidth={2.4}
										/>
										<XAxis
											padding={{ left: 8, right: 4 }}
											dataKey={'date'}
											axisLine={false}
											tickLine={false}
											tickMargin={16}
											tickSize={0}
											minTickGap={32}
											tickFormatter={date => dayjs(date).format('MM/DD')}
											tick={{
												fill: '#E5E7EB'
											}}
										/>
										<YAxis
											dataKey={'activity'}
											orientation={'left'}
											axisLine={false}
											tickLine={false}
											tickMargin={8}
											tickSize={0}
											width={32}
											tick={{
												fill: '#E5E7EB'
											}}
										/>
										<Tooltip
											cursor={false}
											content={({ active, payload, label }) => {
												if (active && payload) {
													return (
														<div className='space-y-1 rounded-lg bg-violet-600 px-2 py-1.5 text-center text-xs font-medium text-white'>
															<p>{payload[0]?.value} exercises</p>
															<h4>{label}</h4>
														</div>
													);
												}
												return null;
											}}
										/>
										<CartesianGrid
											vertical={false}
											stroke='#7C3AED'
											strokeOpacity={0.075}
											strokeWidth={1.6}
										/>
									</AreaChart>
								) : (
									<div className='grid h-full place-items-center'>
										<div className='flex flex-col items-center gap-4'>
											<p className='font-medium'>Data not available</p>
											<div className='aspect-square rounded-full border border-violet-600 bg-violet-600/25 p-2'>
												<IconChartBarOff
													stroke={1.6}
													className='stroke-violet-600'
												/>
											</div>
										</div>
									</div>
								)}
							</ResponsiveContainer>
						) : (
							<ResponsiveContainer
								height={200}
								width={'100%'}
							>
								{progressQueryPending ? (
									<LoadingOverlay
										visible={true}
										loaderProps={{ type: 'dots' }}
										classNames={{
											overlay: 'bg-transparent rounded-lg'
										}}
									/>
								) : practiceSessionProgress && practiceSessionProgress?.length > 0 ? (
									<BarChart
										data={practiceSessionProgress}
										className={'text-xs'}
										barCategoryGap={4}
									>
										<defs>
											<linearGradient
												id='color'
												x1='0'
												y1='0'
												x2='0'
												y2='1'
											>
												<stop
													offset='0%'
													stopColor='#7C3AED'
													stopOpacity={0.6}
												/>
												<stop
													offset='90%'
													stopColor='#7C3AED'
													stopOpacity={0.2}
												/>
											</linearGradient>
										</defs>
										<Bar
											type='monotone'
											dataKey={'score'}
											fill={'url(#color)'}
											stroke={'#7C3AED'}
											strokeWidth={1.6}
											maxBarSize={30}
											radius={6}
										>
											<LabelList
												angle={0}
												fill='#E5E7EB'
												dataKey={'score'}
												position='center'
												className='animate-fade-in text-xs font-medium'
												formatter={(data: number) => {
													return data > 0 ? data : null;
												}}
											/>
										</Bar>
										<XAxis
											padding={{ left: 8, right: 4 }}
											dataKey={'date'}
											axisLine={false}
											tickLine={false}
											tickMargin={16}
											tickSize={0}
											minTickGap={32}
											tickFormatter={date => dayjs(date).format('MM/DD')}
											tick={{
												fill: '#E5E7EB'
											}}
										/>
										<YAxis
											dataKey={'score'}
											orientation={'left'}
											axisLine={false}
											tickLine={false}
											tickMargin={8}
											tickSize={0}
											width={32}
											tick={{
												fill: '#E5E7EB'
											}}
										/>
										<Tooltip
											cursor={false}
											content={({ active, payload, label }) => {
												if (active && payload) {
													const data = payload[0]?.payload;
													const correct = data?.correct;
													const questionCount = data?.questionCount;

													return (
														<div className='space-y-1 rounded-lg bg-violet-600 px-2 py-1.5 text-center text-xs font-medium text-white'>
															<div className='flex items-center gap-2'>
																<div className='flex items-center gap-1'>
																	<IconCheck
																		size={14}
																		stroke={1.2}
																		className='rounded-full border border-green-500 bg-green-500 bg-opacity-25'
																	/>
																	<p>{correct}</p>
																</div>
																<div className='flex items-center gap-1'>
																	<IconX
																		size={14}
																		stroke={1.2}
																		className='rounded-full border border-red-500 bg-red-500 bg-opacity-25'
																	/>
																	<p>{questionCount - correct}</p>
																</div>
															</div>
															<h4>{label}</h4>
														</div>
													);
												}
												return null;
											}}
										/>
										<CartesianGrid
											vertical={false}
											stroke='#7C3AED'
											strokeOpacity={0.075}
											strokeWidth={1.6}
										/>
									</BarChart>
								) : (
									<div className='grid h-full place-items-center'>
										<div className='flex flex-col items-center gap-4'>
											<p className='font-medium'>Data not available</p>
											<div className='aspect-square rounded-full border border-violet-600 bg-violet-600/25 p-2'>
												<IconChartBarOff
													stroke={1.6}
													className='stroke-violet-600'
												/>
											</div>
										</div>
									</div>
								)}
							</ResponsiveContainer>
						)}
					</div>
				</div>

				<div className='space-y-4'>
					<h3 className='text-sm font-semibold md:text-base'>Ear training exercises</h3>
					{scoresQueryPending
						? Array.from({ length: 5 }).map((_, index) => (
								<Skeleton
									key={index}
									radius={'md'}
									className='h-20 before:!bg-transparent after:!bg-transparent after:bg-gradient-to-tr after:from-violet-600/15 after:to-violet-600/30 md:h-[5.5rem]'
								/>
							))
						: Object.values(EarTrainingPracticeType)?.map(practiceType => {
								const practiceTypeScore = practiceSessionScores?.[practiceType];

								const { icon, label, description, badgeClass, cardClass } = EAR_TRAINING_EXERCISES_META[practiceType];

								return (
									<div
										key={practiceType}
										className={`${cardClass} rounded-lg bg-transparent p-4 md:p-5`}
									>
										<div className='flex items-center justify-between gap-4'>
											<div className='flex items-center gap-4'>
												{icon}
												<div className='text-white'>
													<h3 className='text-lg font-semibold'>{label}</h3>
													<p className='text-[13px]'>{description}</p>
												</div>
											</div>

											<div className='flex items-center gap-2'>
												<Badge
													size='lg'
													className={badgeClass}
												>
													{practiceTypeScore ? calculatePercentage(practiceTypeScore?.correct, practiceTypeScore?.questionCount) : 0}%
												</Badge>

												<Link href={`/profile/ear-training/${practiceType}`}>
													<IconChevronRight />
												</Link>
											</div>
										</div>
									</div>
								);
							})}
				</div>
			</div>
		</EarTrainingLayout>
	);
};

export default EarTrainingDashboard;
