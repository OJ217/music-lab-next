import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import EarTrainingLayout from '@/features/ear-training/practice/layouts/ear-training-layout';
import { EarTrainingPracticeType } from '@/features/ear-training/practice/services/practice-session.service';
import { resolvePracticeResultMessage } from '@/features/ear-training/practice/utils/practice-session.util';
import { SelectData } from '@/types';
import { ActionIcon, Badge, Card, Center, Drawer, LoadingOverlay, Progress, RingProgress, ScrollArea, SegmentedControl, Select, Skeleton, ThemeIcon } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconChartBarOff, IconCheck, IconDotsVertical, IconFilesOff, IconX } from '@tabler/icons-react';

import {
	useEarTrainingPracticeSessionActivityQuery,
	useEarTrainingPracticeSessionListQuery,
	useEarTrainingPracticeSessionProgressQuery,
	useEarTrainingPracticeSessionQuery
} from '../../services/ear-training-dashboard.service';

dayjs.extend(duration);

const EAR_TRAINING_PRACTICE_TYPE_NAMESPACES: Record<EarTrainingPracticeType, string> = {
	'interval-identification': 'interval',
	'chord-identification': 'chord',
	'mode-identification': 'mode'
};

const EarTrainingExerciseDashboard = () => {
	const { t } = useTranslation();

	const router = useRouter();
	const exercise = router.query?.exercise as EarTrainingPracticeType;

	const [selectedPracticeSessionId, setSelectedPracticeSessionId] = useState<string>('');
	const [practiceSessionDetailDrawerOpened, { open: openPracticeSessionDetailDrawer, close: closePracticeSessionDetailDrawer }] = useDisclosure();

	const { practiceSessionActivity, activityQueryPending } = useEarTrainingPracticeSessionActivityQuery({
		enabled: !!exercise,
		queryParams: { type: exercise }
	});

	const { practiceSessionProgress, progressQueryPending } = useEarTrainingPracticeSessionProgressQuery({
		enabled: !!exercise,
		queryParams: { type: exercise }
	});

	const { practiceSessionList, practiceSessionListPending } = useEarTrainingPracticeSessionListQuery({
		enabled: !!exercise,
		queryParams: { type: exercise, page: 1 }
	});

	const { practiceSessionDetail, practiceSessionDetailPending } = useEarTrainingPracticeSessionQuery({
		enabled: !!selectedPracticeSessionId && typeof selectedPracticeSessionId === 'string',
		practiceSessionId: selectedPracticeSessionId
	});

	practiceSessionActivity?.sort((a, b) => dayjs(a.date).diff(dayjs(b.date)));

	type EarTrainingDashboardType = 'activity' | 'progress';
	const [dashboardType, setDashboardType] = useState<EarTrainingDashboardType>('activity');
	const dashboardSegmentedControlData: SelectData<EarTrainingDashboardType> = [
		{ label: 'Activity', value: 'activity' },
		{ label: 'Progress', value: 'progress' }
	];

	return (
		<EarTrainingLayout
			centered={false}
			showAffix={false}
		>
			<div className='mx-auto w-full max-w-lg space-y-8'>
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
											<div className='aspect-square rounded-full border-[1.5px] border-violet-600 bg-violet-600/25 p-2.5'>
												<IconChartBarOff
													stroke={1.6}
													className='stroke-violet-600 text-lg font-medium'
												/>
											</div>
											<p className='text-lg font-medium'>Data not available</p>
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
										visible={activityQueryPending}
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
												angle={270}
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
											<div className='aspect-square rounded-full border-[1.5px] border-violet-600 bg-violet-600/25 p-2.5'>
												<IconChartBarOff
													stroke={1.6}
													className='stroke-violet-600'
												/>
											</div>
											<p className='text-lg font-medium'>Data not available</p>
										</div>
									</div>
								)}
							</ResponsiveContainer>
						)}
					</div>
				</div>
				<div className='space-y-4'>
					<h3 className='text-sm font-semibold md:text-base'>Practice session history</h3>
					{practiceSessionListPending ? (
						Array.from({ length: 10 }).map((_, index) => (
							<Skeleton
								key={index}
								radius={'md'}
								className='h-20 before:!bg-transparent after:!bg-transparent after:bg-gradient-to-tr after:from-violet-600/15 after:to-violet-600/30 md:h-[5.5rem]'
							/>
						))
					) : !!practiceSessionList && practiceSessionList?.docs.length > 0 ? (
						practiceSessionList?.docs.map((s, index) => (
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
												color='green'
											>
												{s.result.score}%
											</Badge>
											<ActionIcon
												mr={-8}
												size={'sm'}
												variant='transparent'
												onClick={() => {
													setSelectedPracticeSessionId(s._id);
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
										color='green'
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
				</div>
			</div>

			<Drawer
				position='left'
				title={'Practice session detail'}
				opened={practiceSessionDetailDrawerOpened}
				onClose={closePracticeSessionDetailDrawer}
				scrollAreaComponent={ScrollArea.Autosize}
				closeButtonProps={{ size: 'sm' }}
				classNames={{ title: 'font-semibold text-sm' }}
				withinPortal
			>
				<div className='space-y-6'>
					{practiceSessionDetailPending ? (
						<>
							<Skeleton
								radius={'md'}
								className='h-[6.75rem]'
							/>
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
						practiceSessionDetail && (
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
															color='green'
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
														value: practiceSessionDetail.result.score,
														color: 'green'
													}
												]}
											/>
											<div>
												<h1 className='text-3xl font-medium text-white'>{practiceSessionDetail?.result.score}%</h1>
												<p className='text-gray-400'>
													{practiceSessionDetail?.result.correct}/{practiceSessionDetail?.result.questionCount}
												</p>
											</div>
										</div>
									</Card>
									<Card radius='md'>
										<div className='flex h-full flex-col space-y-1 text-center'>
											<p className='text-xs text-gray-400'>Message:</p>
											<p className='flex flex-grow items-center justify-center text-sm text-white'>
												{resolvePracticeResultMessage(practiceSessionDetail?.result.correct, practiceSessionDetail?.result.questionCount)}
											</p>
										</div>
									</Card>
								</div>

								<div className='space-y-4'>
									<div className='flex items-center justify-between gap-4'>
										<h3 className='text-sm font-medium text-white'>Exercises</h3>
										<Select
											size='xs'
											radius='xl'
											variant='filled'
											defaultValue={'all'}
											allowDeselect={false}
											data={[{ label: 'All', value: 'all' }]}
											classNames={{ input: 'focus-within:bg-violet-600/25 max-w-[120px] pl-4' }}
										/>
									</div>
									{practiceSessionDetail?.statistics.map(({ score, correct, incorrect, questionCount, questionType }, index, { length: listLength }) => {
										return (
											<Card
												radius={'md'}
												key={questionType}
												className='space-y-2 p-3'
											>
												<div className='flex items-center justify-between gap-4 text-sm text-white'>
													<p className='font-medium'>{t(`${EAR_TRAINING_PRACTICE_TYPE_NAMESPACES[exercise]}.${questionType}`)}</p>
													<Badge
														variant='light'
														color='green'
													>
														{score}%
													</Badge>
												</div>
												<Progress
													value={score}
													color='green'
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
						)
					)}
				</div>
			</Drawer>
		</EarTrainingLayout>
	);
};

export default EarTrainingExerciseDashboard;
