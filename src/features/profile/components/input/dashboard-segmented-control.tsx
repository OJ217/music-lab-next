import { SegmentedControl } from '@mantine/core';

import { DASHBOARD_CHART_SEGMENTED_CONTROL_DATA, EarTrainingDashboardChartType } from '../../types';

interface IDashboardChartSegmentedControlProps {
	dashboardChartType: EarTrainingDashboardChartType;
	setDashboardChartType: (value: React.SetStateAction<EarTrainingDashboardChartType>) => void;
}

const DashboardChartSegmentedControl: React.FC<IDashboardChartSegmentedControlProps> = ({ dashboardChartType, setDashboardChartType }) => {
	return (
		<SegmentedControl
			size='xs'
			radius='xl'
			fullWidth
			value={dashboardChartType}
			color='violet.6'
			className='bg-violet-600/10'
			classNames={{ label: 'text-xs' }}
			onChange={t => setDashboardChartType(t as EarTrainingDashboardChartType)}
			data={DASHBOARD_CHART_SEGMENTED_CONTROL_DATA}
		/>
	);
};

export default DashboardChartSegmentedControl;
