import dayjs from 'dayjs';
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { Button, LoadingOverlay } from '@mantine/core';
import { usePagination } from '@mantine/hooks';
import { IconChartBarOff, IconCheck, IconChevronLeft, IconChevronRight, IconX } from '@tabler/icons-react';

// TODO: Data and datakey type improvements
interface IDashboardBarChartProps {
	pending: boolean;
	data: Array<Record<string, any>> | undefined;
	dataKeys: {
		bar: string;
		label: string;
		xAxis: string;
		yAxis: string;
	};
	height?: number;
}

function chunkFromEnd<T>(array: T[], size: number): T[][] {
	const result: T[][] = [];
	let index: number = array.length;

	while (index > 0) {
		result.unshift(array.slice(Math.max(index - size, 0), index));
		index -= size;
	}

	return result;
}

// TODO: Dynamic formatter and tooltip
const DashboardBarChart: React.FC<IDashboardBarChartProps> = ({ pending, data, dataKeys, height = 200 }) => {
	const size = 7;
	const length = data?.length ?? 0;
	const totalPages = Math.ceil(length / size);

	const [page, setPage] = useState(totalPages);
	const pagination = usePagination({
		total: totalPages,
		page,
		onChange: setPage
	});

	const splitData = chunkFromEnd(data!, size);

	console.log({ page });

	return (
		<>
			<div className='relative rounded-lg border-violet-600 bg-transparent bg-gradient-to-tr from-violet-600/10 to-violet-600/20 pb-2 pl-2 pr-4 pt-4'>
				<ResponsiveContainer
					height={height}
					width={'100%'}
				>
					{pending ? (
						<LoadingOverlay
							visible={true}
							loaderProps={{ type: 'dots' }}
							classNames={{
								overlay: 'bg-transparent rounded-lg'
							}}
						/>
					) : data && data?.length > 0 ? (
						<BarChart
							data={splitData[page - 1]}
							className={'text-xs'}
							barCategoryGap={4}
							barGap={10}
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
								radius={6}
								maxBarSize={30}
								barSize={30}
								strokeWidth={1.6}
								type='monotone'
								dataKey={dataKeys.bar}
								fill={'url(#color)'}
								stroke={'#7C3AED'}
							>
								<LabelList
									fill='#E5E7EB'
									dataKey={dataKeys.label}
									position='center'
									className='animate-fade-in text-[0.625rem] font-medium'
									formatter={(data: number) => {
										return data > 0 ? data : null;
									}}
								/>
							</Bar>
							<XAxis
								padding={{ left: 8, right: 4 }}
								dataKey={dataKeys.xAxis}
								axisLine={false}
								tickLine={false}
								tickMargin={16}
								tickSize={0}
								tickFormatter={date => dayjs(date).format('MM/DD')}
								tick={{
									fill: '#E5E7EB'
								}}
							/>
							<YAxis
								domain={[0, 100]}
								dataKey={dataKeys.yAxis}
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
										const activity = data?.activity;

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
														<p>{activity - correct}</p>
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
			</div>
			<AnimatePresence presenceAffectsLayout>
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					transition={{ duration: 1, type: 'spring' }}
					className='flex items-center justify-center gap-4'
				>
					<Button
						py={2}
						px={8}
						fw={400}
						variant='light'
						disabled={page === 1}
						className='rounded-lg border border-violet-600 bg-gradient-to-t from-violet-600/25 to-violet-600/50 text-white disabled:pointer-events-none disabled:bg-violet-600/25 disabled:opacity-50'
						onClick={pagination.previous}
					>
						<IconChevronLeft size={16} />
					</Button>
					<Button
						py={2}
						px={8}
						fw={400}
						variant='light'
						disabled={page === totalPages}
						className='rounded-lg border border-violet-600 bg-gradient-to-t from-violet-600/25 to-violet-600/50 text-white disabled:pointer-events-none disabled:bg-violet-600/25 disabled:opacity-50'
						onClick={pagination.next}
					>
						<IconChevronRight size={16} />
					</Button>
				</motion.div>
			</AnimatePresence>
		</>
	);
};

export default DashboardBarChart;
