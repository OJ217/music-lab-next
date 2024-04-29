import { SelectData } from '@/types';

export type EarTrainingDashboardChartType = 'activity' | 'progress';

export const DASHBOARD_CHART_SEGMENTED_CONTROL_DATA: SelectData<EarTrainingDashboardChartType> = [
	{ label: 'Activity', value: 'activity' },
	{ label: 'Progress', value: 'progress' }
];
