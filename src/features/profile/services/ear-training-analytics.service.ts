import axios from 'axios';
import dayjs from 'dayjs';

import { EarTrainingPracticeType } from '@/features/ear-training/practice/services/practice-session.service';
import { EarTrainingErrorStores, fetchEarTrainingErrorLocal } from '@/features/ear-training/practice/stores/ear-training-errors.store';
import { IPaginatedDocuments, IResponse, IUseQueryBase } from '@/types';
import { wait } from '@/utils/api.util';
import { calculatePercentage } from '@/utils/format.util';
import { isEmptyObject } from '@/utils/helper.util';
import { useQuery } from '@tanstack/react-query';

const earTrainingExerciseErrorStoreNames: Record<EarTrainingPracticeType, EarTrainingErrorStores> = {
	'interval-identification': 'intervalErrors',
	'chord-identification': 'chordErrors',
	'mode-identification': 'modeErrors'
};

interface IEarTrainingStatisticsBase {
	correct: number;
	activity: number;
}

interface IOverallStatisticsResponse {
	dateRangeStatistics: Array<{ date: string } & IEarTrainingStatisticsBase>;
	exerciseTypeStatistics: Array<{ type: EarTrainingPracticeType } & IEarTrainingStatisticsBase>;
}

interface IUseOverallStatisticsQueryResponse {
	activity: Array<{ date: string; activity: number }>;
	scores: Array<{ date: string; correct: number; activity: number; score: number }>;
	exercises: Array<{ type: EarTrainingPracticeType; score: number }>;
	insights: {
		activity: {
			averageActivity: number | string;
			bestActivity: number | string;
			totalActiveDays: number | string;
			totalActivity: number | string;
		};
		exercises: Array<{
			type: EarTrainingPracticeType;
			activity: number | string;
			segmentPercentage: number;
		}>;
	};
}

export const useEarTrainingOverallStatisticsQuery = ({ enabled }: IUseQueryBase) => {
	const fetchEarTrainingOverallStatistics = async (): Promise<IUseOverallStatisticsQueryResponse> => {
		const earTrainingOverallStatistics = (
			await axios.get<IResponse<IOverallStatisticsResponse>>('/ear-training/analytics', {
				isPrivate: true
			})
		)?.data?.data;

		if (!earTrainingOverallStatistics || (earTrainingOverallStatistics.dateRangeStatistics.length === 0 && earTrainingOverallStatistics.exerciseTypeStatistics.length === 0)) {
			return {
				activity: [],
				exercises: [],
				scores: [],
				insights: {
					activity: {
						averageActivity: '--',
						bestActivity: '--',
						totalActiveDays: '--',
						totalActivity: '--'
					},
					exercises: []
				}
			};
		}

		// ** Statistics Data Sorted
		const dateRangeStatisticsSorted = earTrainingOverallStatistics.dateRangeStatistics.toSorted((a, b) => dayjs(a.date).diff(dayjs(b.date)));
		const exerciseTypeOrders: Record<EarTrainingPracticeType, number> = {
			'interval-identification': 0,
			'chord-identification': 1,
			'mode-identification': 2
		};
		const exerciseTypeStatisticsSorted = earTrainingOverallStatistics.exerciseTypeStatistics.toSorted((a, b) => exerciseTypeOrders[a.type] - exerciseTypeOrders[b.type]);

		// ** Statistics Data
		const activity = dateRangeStatisticsSorted.map(stat => ({ date: stat.date, activity: stat.activity }));
		const scores = dateRangeStatisticsSorted.map(stat => ({ date: stat.date, correct: stat.correct, activity: stat.activity, score: calculatePercentage(stat.correct, stat.activity) }));
		const exercises = exerciseTypeStatisticsSorted.map(stat => ({ type: stat.type, score: calculatePercentage(stat.correct, stat.activity) }));

		// ** Activity Insights
		const totalActiveDays = dateRangeStatisticsSorted.filter(stat => stat.activity > 0).length;
		const totalActivity = dateRangeStatisticsSorted.map(stat => stat.activity).reduce((a, b) => a + b, 0);
		const bestActivity = Math.max(...dateRangeStatisticsSorted.map(stat => stat.activity));
		const averageActivity = (totalActivity / dateRangeStatisticsSorted.length).toFixed(1);

		// ** Exercise Insights
		const exerciseInsights = exerciseTypeStatisticsSorted.map(exercise => ({
			type: exercise.type,
			activity: exercise.activity,
			segmentPercentage: calculatePercentage(exercise.activity, totalActivity)
		}));

		return {
			activity,
			scores,
			exercises,
			insights: {
				activity: {
					averageActivity,
					bestActivity,
					totalActiveDays,
					totalActivity
				},
				exercises: exerciseInsights
			}
		};
	};

	const { data, isPending } = useQuery({
		queryFn: fetchEarTrainingOverallStatistics,
		queryKey: ['ear-training', 'analytics', 'overall-statistics'],
		enabled
	});

	return {
		earTrainingOverallStatistics: data,
		earTrainingOverallStatisticsPending: isPending
	};
};

interface IUseExerciseStatisticsQueryParams extends IUseQueryBase {
	exerciseType: EarTrainingPracticeType;
}

type IExerciseStatisticsResponse = Array<{ date: string } & IEarTrainingStatisticsBase>;

interface IUseExerciseStatisticsQueryResponse {
	activity: Array<{ date: string; activity: number }>;
	scores: Array<{ date: string; correct: number; activity: number; score: number }>;
	insights: {
		averageActivity?: string;
		averageScore?: number;
	};
}

export const useEarTrainingExerciseStatisticsQuery = ({ enabled = true, exerciseType }: IUseExerciseStatisticsQueryParams) => {
	const fetchEarTrainingExerciseStatistics = async (): Promise<IUseExerciseStatisticsQueryResponse> => {
		const earTrainingExerciseStatistics = (
			await axios.get<IResponse<IExerciseStatisticsResponse>>(`/ear-training/analytics/${exerciseType}`, {
				isPrivate: true
			})
		)?.data?.data;

		if (!earTrainingExerciseStatistics || earTrainingExerciseStatistics.length === 0) {
			return {
				activity: [],
				scores: [],
				insights: {}
			};
		}

		// ** Statistics Data Sorted
		const dateRangeStatisticsSorted = earTrainingExerciseStatistics.toSorted((a, b) => dayjs(a.date).diff(dayjs(b.date)));
		const activity = dateRangeStatisticsSorted.map(stat => ({ date: stat.date, activity: stat.activity }));
		const scores = dateRangeStatisticsSorted.map(stat => ({ date: stat.date, correct: stat.correct, activity: stat.activity, score: calculatePercentage(stat.correct, stat.activity) }));

		const totalActivity = activity.map(stat => stat.activity).reduce((a, b) => a + b, 0);
		const averageActivity = (totalActivity / activity.length).toFixed(1);
		const averageScore = calculatePercentage(
			scores.map(stat => stat.correct).reduce((a, b) => a + b, 0),
			totalActivity
		);

		return {
			activity,
			scores,
			insights: {
				averageActivity,
				averageScore
			}
		};
	};

	const { data, isPending } = useQuery({
		queryFn: fetchEarTrainingExerciseStatistics,
		queryKey: ['ear-training', 'analytics', `${exerciseType}-statistics`],
		enabled
	});

	return {
		earTrainingExerciseStatistics: data,
		earTrainingExerciseStatisticsPending: isPending
	};
};

interface IUseEarTrainingExerciseErrorsQueryParams extends IUseQueryBase {
	exerciseType: EarTrainingPracticeType;
}

type IUseEarTrainingExerciseErrorsQueryResponse = Array<{ questionType: string; errors: string[]; errorCount: number }>;

export const useEarTrainingExerciseErrorsQuery = ({ enabled, exerciseType }: IUseEarTrainingExerciseErrorsQueryParams) => {
	const fetchEarTrainingExerciseCommonErrors = async (): Promise<IUseEarTrainingExerciseErrorsQueryResponse> => {
		await wait(300);

		const exerciseErrors = await fetchEarTrainingErrorLocal(earTrainingExerciseErrorStoreNames[exerciseType]);

		if (isEmptyObject(exerciseErrors)) {
			return [];
		}

		const sortExerciseErrors = (errors: string[]) => {
			const itemCount = errors.reduce((acc: Record<string, number>, item: string) => {
				acc[item] = (acc[item] || 0) + 1;
				return acc;
			}, {});

			return Object.entries(itemCount)
				.toSorted((a, b) => b[1] - a[1])
				.map(([item]) => item);
		};

		const sortedExerciseErrors = Object.entries(exerciseErrors)
			.map(e => ({
				questionType: e[0],
				errors: e[1],
				errorCount: e[1].length
			}))
			.toSorted((a, b) => b.errors.length - a.errors.length)
			.slice(0, 5)
			.map(e => ({
				questionType: e.questionType,
				errorCount: e.errorCount,
				errors: sortExerciseErrors(e.errors)
			}));

		return sortedExerciseErrors;
	};

	const { data, isPending } = useQuery({
		queryFn: fetchEarTrainingExerciseCommonErrors,
		queryKey: ['ear-training', 'errors', exerciseType],
		enabled
	});

	return {
		earTrainingExerciseErrors: data,
		earTrainingExerciseErrorsPending: isPending
	};
};

interface IUsePracticeSessionListParams extends IUseQueryBase {
	queryParams: {
		type: EarTrainingPracticeType;
		page?: number;
		limit?: number;
	};
}

export interface IEarTrainingPracticeSession {
	_id: string;
	type: EarTrainingPracticeType;
	duration: number;
	result: {
		score: number;
		correct: number;
		incorrect: number;
		questionCount: number;
	};
	statistics: Array<{
		score: number;
		correct: number;
		incorrect: number;
		questionCount: number;
		questionType: string;
	}>;
	createdAt: Date;
}

export const useEarTrainingPracticeSessionListQuery = ({ enabled, queryParams }: IUsePracticeSessionListParams) => {
	const fetchEarTrainingPracticeSessionList = async () => {
		return (
			await axios.get<IResponse<IPaginatedDocuments<IEarTrainingPracticeSession>>>('/ear-training/sessions', {
				isPrivate: true,
				params: queryParams
			})
		).data;
	};

	const { data, isPending } = useQuery({
		queryFn: fetchEarTrainingPracticeSessionList,
		queryKey: ['ear-training', 'sessions', queryParams.type, queryParams.page],
		enabled
	});

	return {
		practiceSessionList: data?.data,
		practiceSessionListPending: isPending
	};
};
