import { t } from 'i18next';

import { SelectData } from '@/types';

export type EarTrainingDashboardChartType = 'activity' | 'progress';

export const DASHBOARD_CHART_SEGMENTED_CONTROL_DATA: SelectData<EarTrainingDashboardChartType> = [
	{ label: t('activity', { ns: 'ear_training_dashboard' }), value: 'activity' },
	{ label: t('progress', { ns: 'ear_training_dashboard' }), value: 'progress' }
];
