import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import EarTrainingLayout from '@/features/ear-training/practice/layouts/EarTrainingLayout';
import { EarTrainingPracticeType } from '@/features/ear-training/practice/services/practice-session.service';
import { resolvePracticeResultMessage } from '@/features/ear-training/practice/utils/practice-session.util';
import { ActionIcon, Badge, Card, Center, Divider, Drawer, LoadingOverlay, Paper, Progress, RingProgress, ScrollArea, Skeleton } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconChartBarOff, IconCheck, IconDotsVertical, IconX } from '@tabler/icons-react';

import { useEarTrainingPracticeSessionActivityQuery, useEarTrainingPracticeSessionListQuery, useEarTrainingPracticeSessionQuery } from '../../services/ear-training-dashboard.service';

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

	const { practiceSessionList, practiceSessionListPending } = useEarTrainingPracticeSessionListQuery({
		enabled: !!exercise,
		queryParams: { type: exercise, page: 1 }
	});

	const { practiceSessionDetail, practiceSessionDetailPending } = useEarTrainingPracticeSessionQuery({
		enabled: !!selectedPracticeSessionId,
		practiceSessionId: selectedPracticeSessionId
	});

	practiceSessionActivity?.sort((a, b) => dayjs(a.date).diff(dayjs(b.date)));

	return (
		<EarTrainingLayout
			centered={false}
			showAffix={false}
		>
			<div className='mx-auto w-full max-w-lg space-y-8'>
				<div className='space-y-4'>
					<h3 className='text-sm font-semibold md:text-base'>My activity</h3>
					<Card
						className='border-violet-600 bg-transparent bg-gradient-to-tr from-violet-600/10 to-violet-600/20 pl-2'
						radius={'md'}
					>
						<ResponsiveContainer
							height={200}
							width={'100%'}
						>
							{activityQueryPending ? (
								<LoadingOverlay
									visible={activityQueryPending}
									loaderProps={{ type: 'dots' }}
									classNames={{
										overlay: 'border-violet-600 bg-gradient-to-tr from-violet-600/10 to-violet-600/25'
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
										stroke='#344054'
										strokeOpacity={0.2}
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
					</Card>
				</div>
				<div className='space-y-4'>
					<h3 className='text-sm font-semibold md:text-base'>My activity</h3>
					{practiceSessionListPending ? (
						Array.from({ length: 10 }).map((_, index) => (
							<Skeleton
								key={index}
								className='h-20 md:h-[5.5rem]'
								radius={'md'}
							/>
						))
					) : !!practiceSessionList && practiceSessionList?.docs.length > 0 ? (
						practiceSessionList?.docs.map((s, index) => (
							<Card
								key={index}
								radius={'md'}
								className='border-violet-600 bg-transparent bg-gradient-to-tr from-violet-600/10 to-violet-600/20'
							>
								<div className='space-y-3'>
									<div className='flex items-center justify-between gap-4'>
										<p className='text-sm font-medium text-white md:text-base'>Date: {dayjs(s.createdAt).format('MMM DD, HH:MM')}</p>
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
										<p>Duration: {dayjs.duration(s.duration, 'seconds').format(s.duration < 3600 ? 'MM:ss' : 'HH:MM:ss')}</p>
										<div className='flex items-center gap-4'>
											<div className='flex items-center gap-2'>
												<div className='rounded-full border border-green-500 bg-green-500 bg-opacity-25'>
													<IconCheck
														size={12}
														stroke={1.2}
													/>
												</div>
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
						<div>No practice sessions found</div>
					)}
				</div>
			</div>
			<Drawer
				position='left'
				title='Practice Session Detail'
				opened={practiceSessionDetailDrawerOpened}
				onClose={closePracticeSessionDetailDrawer}
				scrollAreaComponent={ScrollArea.Autosize}
				closeButtonProps={{ size: 'sm' }}
				classNames={{ title: 'font-semibold text-sm' }}
				withinPortal
			>
				{practiceSessionDetailPending ? (
					<div>Loading</div>
				) : (
					practiceSessionDetail && (
						<div className='mt-6 space-y-6'>
							<Paper
								p='sm'
								radius='md'
								withBorder
								className='flex items-stretch gap-4'
							>
								<div className='flex items-center gap-4'>
									<RingProgress
										size={80}
										roundCaps
										thickness={4}
										label={
											<Center>
												<ActionIcon
													color='teal'
													variant='light'
													radius='xl'
													size='xl'
												>
													<IconCheck />
												</ActionIcon>
											</Center>
										}
										sections={[
											{
												value: practiceSessionDetail?.result.score,
												color: 'green'
											}
										]}
									/>
									<div>
										<h1 className='text-3xl font-medium'>{practiceSessionDetail?.result.score}%</h1>
										<p className='text-gray-400'>
											{practiceSessionDetail?.result.correct}/{practiceSessionDetail?.result.questionCount}
										</p>
									</div>
								</div>
								<Divider orientation='vertical' />
								<div className='flex flex-col space-y-2'>
									<p className='text-xs text-gray-400'>Message:</p>
									<p className='flex flex-grow items-center justify-center text-sm'>
										{resolvePracticeResultMessage(practiceSessionDetail?.result.correct, practiceSessionDetail?.result.questionCount)}
									</p>
								</div>
							</Paper>
							<div className='space-y-3'>
								{practiceSessionDetail?.statistics.map(({ score, correct, incorrect, questionCount, questionType }, index, { length: listLength }) => {
									return (
										<>
											<div
												key={questionType}
												className='space-y-1'
											>
												<div className='flex items-center justify-between gap-4 text-sm'>
													<p className='font-medium'>{t(`${EAR_TRAINING_PRACTICE_TYPE_NAMESPACES[exercise]}.${questionType}`)}</p>
													<div>
														<div className='flex items-center gap-2 font-medium'>
															<p>{score}%</p>
															<span className='h-[1.5px] w-1.5 bg-white'></span>
															<p>
																({correct}/{questionCount})
															</p>
														</div>
													</div>
												</div>
												<div className='flex items-center justify-end gap-6 text-xs'>
													<div className='flex items-center gap-3'>
														<div className='rounded-full border border-green-500 bg-green-500 bg-opacity-25'>
															<IconCheck
																size={12}
																stroke={1.2}
															/>
														</div>
														<p>{correct}</p>
													</div>
													<div className='flex items-center gap-3'>
														<IconX
															size={14}
															stroke={1.2}
															className='rounded-full border border-red-500 bg-red-500 bg-opacity-25'
														/>
														<p>{incorrect}</p>
													</div>
												</div>
											</div>
											{index + 1 < listLength && <Divider key={`divider-${index + 1}`} />}
										</>
									);
								})}
							</div>
						</div>
					)
				)}
			</Drawer>
		</EarTrainingLayout>
	);
};

export default EarTrainingExerciseDashboard;
