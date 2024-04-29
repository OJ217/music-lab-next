import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

type DataItem = Record<string, any>;

interface IDashboardAreaChartProps<T extends DataItem> {
	data: Array<T>;
	dataKeys: {
		area: Exclude<keyof T, symbol>;
		xAxis: Exclude<keyof T, symbol>;
		yAxis: Exclude<keyof T, symbol>;
	};
	tooltipLabel: string;
	tickFormatter: (value: any) => string;
}

const DashboardAreaChart = <T extends DataItem>({ data, dataKeys, tooltipLabel, tickFormatter }: IDashboardAreaChartProps<T>) => {
	return (
		<div className='relative rounded-lg border-violet-600 bg-transparent bg-gradient-to-tr from-violet-600/10 to-violet-600/20 pb-2 pl-2 pr-4 pt-4'>
			<ResponsiveContainer
				width={'100%'}
				height={200}
			>
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
						dataKey={dataKeys.area}
						type={'monotone'}
						fill={'url(#color)'}
						stroke={'#7C3AED'}
						strokeWidth={2.4}
						animationDuration={1500}
						animationEasing='ease-in-out'
					/>
					<XAxis
						dataKey={dataKeys.xAxis}
						padding={{ left: 8, right: 4 }}
						axisLine={false}
						tickLine={false}
						tickMargin={16}
						tickSize={0}
						minTickGap={32}
						tick={{ fill: '#E5E7EB' }}
						tickFormatter={tickFormatter}
						fontSize={10}
					/>
					<YAxis
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
								return (
									<div className='space-y-1 rounded-lg bg-violet-600 px-2 py-1.5 text-center text-xs font-medium text-white'>
										<p>
											{payload[0]?.value} {tooltipLabel}
										</p>
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
			</ResponsiveContainer>
		</div>
	);
};

export default DashboardAreaChart;
