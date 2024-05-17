import dayjs from 'dayjs';
import { AnimatePresence, motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { chunkFromEnd } from '@/utils/helper.util';
import { Button } from '@mantine/core';
import { usePagination } from '@mantine/hooks';
import { IconCheck, IconChevronLeft, IconChevronRight, IconX } from '@tabler/icons-react';

type DataItem = Record<string, any>;

interface IPaginatedBarChartProps<T extends DataItem> {
	data: Array<T>;
	dataKeys: {
		bar: Exclude<keyof T, symbol | number>;
		label: Exclude<keyof T, symbol | number>;
		xAxis: Exclude<keyof T, symbol | number>;
		yAxis: Exclude<keyof T, symbol | number>;
	};
}

// TODO: Dynamic formatter and tooltip
// ** Pagined Bar Chart
export const DashboardBarChart = <T extends DataItem>({ data, dataKeys }: IPaginatedBarChartProps<T>) => {
	const { size, totalPages } = useMemo(() => {
		const size = 7;
		const length = data?.length ?? 0;
		const totalPages = Math.ceil(length / size);

		return { size, totalPages };
	}, [data.length]);

	const [page, setPage] = useState(totalPages);
	const pagination = usePagination({ total: totalPages, page, onChange: setPage });
	const paginatedData = chunkFromEnd(data, size);

	return (
		<>
			{/* Bar Chart */}
			<div className='relative rounded-lg border-violet-600 bg-transparent bg-gradient-to-tr from-violet-600/20 to-violet-600/40 pb-2 pl-2 pr-4 pt-4'>
				<ResponsiveContainer
					width={'100%'}
					height={200}
				>
					<BarChart
						barGap={10}
						barCategoryGap={4}
						className={'text-sm'}
						data={paginatedData[page - 1]}
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
							minTickGap={24}
							tickFormatter={date => dayjs(date).format('MM/DD')}
							tick={{ fill: '#E5E7EB' }}
							fontSize={10}
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
							tick={{ fill: '#E5E7EB' }}
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
				</ResponsiveContainer>
			</div>

			{/* Pagination Control */}
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
						disabled={page === 1 || !data || data?.length === 0}
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
						disabled={page === totalPages || !data || data?.length === 0}
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
