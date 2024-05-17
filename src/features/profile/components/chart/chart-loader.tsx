import { useTranslation } from 'react-i18next';

import { LoadingOverlay } from '@mantine/core';
import { IconChartBarOff } from '@tabler/icons-react';

type DataItem = Record<string, any>;

interface IChartLoaderProps<T extends DataItem> {
	pending: boolean;
	data: Array<T> | undefined;
	chart: React.ReactNode;
}

const ChartLoader = <T extends DataItem>({ pending, data, chart }: IChartLoaderProps<T>) => {
	const { t: systemT } = useTranslation('system');
	return pending ? (
		<LoadingOverlay
			visible={true}
			loaderProps={{ type: 'dots' }}
			classNames={{
				overlay: 'bg-transparent rounded-lg',
				root: 'relative rounded-lg border-violet-600 bg-transparent bg-gradient-to-tr from-violet-600/20 to-violet-600/40 pb-2 pl-2 pr-4 pt-4 h-[14rem]'
			}}
		/>
	) : !!data && data.length > 0 ? (
		chart
	) : (
		<div className='relative grid h-[14rem] place-items-center rounded-lg border-violet-600 bg-transparent bg-gradient-to-tr from-violet-600/20 to-violet-600/40 pb-2 pl-2 pr-4 pt-4'>
			<div className='flex flex-col items-center gap-4'>
				<p className='font-medium text-violet-100'>{systemT('dataNotAvailable')}</p> {/* TODO: Translation*/}
				<div className='aspect-square rounded-full border-[1.5px] border-violet-600 bg-violet-600/25 p-2.5'>
					<IconChartBarOff
						stroke={1.6}
						className='stroke-violet-100'
					/>
				</div>
			</div>
		</div>
	);
};

export default ChartLoader;
