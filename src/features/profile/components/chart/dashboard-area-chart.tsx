import dayjs from 'dayjs';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { LoadingOverlay } from '@mantine/core';
import { IconChartBarOff } from '@tabler/icons-react';

interface IDashboardAreaChartProps {
	pending: boolean;
	data: Record<string, any>[] | undefined;
	dataKeys: {
		area: string;
		xAxis: string;
		yAxis: string;
	};
	height?: number;
}

const DashboardAreaChart: React.FC<IDashboardAreaChartProps> = ({ pending, data, dataKeys, height = 200 }) => {
	return (
		<div className='relative rounded-lg border-violet-600 bg-transparent bg-gradient-to-tr from-violet-600/10 to-violet-600/20 pb-2 pl-2 pr-4 pt-4'>
			<ResponsiveContainer
				width={'100%'}
				height={height}
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
					<AreaChart
						data={data}
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
							dataKey={dataKeys.area}
							fill={'url(#color)'}
							stroke={'#7C3AED'}
							strokeWidth={2.4}
							animationDuration={1500}
							animationEasing='ease-in-out'
						/>
						<XAxis
							padding={{ left: 8, right: 4 }}
							dataKey={dataKeys.xAxis}
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
		</div>
	);
};

export default DashboardAreaChart;
