import axios from 'axios';
import dayjs from 'dayjs';

import { EarTrainingPracticeType } from '@/features/ear-training/practice/services/practice-session.service';
import { IPaginatedDocuments, IResponse, IUseQueryBase } from '@/types';
import { calculatePercentage } from '@/utils/format.util';
import { useQuery } from '@tanstack/react-query';

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
	progress: Array<{ date: string; correct: number; activity: number; score: number }>;
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
				progress: [],
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
		const progress = dateRangeStatisticsSorted.map(stat => ({ date: stat.date, correct: stat.correct, activity: stat.activity, score: calculatePercentage(stat.correct, stat.activity) }));
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
			progress,
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
	progress: Array<{ date: string; correct: number; activity: number; score: number }>;
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
				progress: []
			};
		}

		// ** Statistics Data Sorted
		const dateRangeStatisticsSorted = earTrainingExerciseStatistics.toSorted((a, b) => dayjs(a.date).diff(dayjs(b.date)));
		const activity = dateRangeStatisticsSorted.map(stat => ({ date: stat.date, activity: stat.activity }));
		const progress = dateRangeStatisticsSorted.map(stat => ({ date: stat.date, correct: stat.correct, activity: stat.activity, score: calculatePercentage(stat.correct, stat.activity) }));

		return {
			activity,
			progress
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

interface IUsePracticeSessionActivityParams extends IUseQueryBase {
	queryParams?: {
		type?: EarTrainingPracticeType;
	};
}

interface IPracticeSessionActivity {
	activity: number;
	date: string;
}

type IPracticeSessionActivityResponse = IPracticeSessionActivity[];

export const useEarTrainingPracticeSessionActivityQuery = ({ enabled = true, queryParams = {} }: IUsePracticeSessionActivityParams) => {
	const fetchEarTrainingPracticeSessionActivity = async () => {
		return (
			await axios.get<IResponse<IPracticeSessionActivityResponse>>('/ear-training/analytics/activity', {
				isPrivate: true,
				params: queryParams
			})
		).data;
	};

	const { data, isPending } = useQuery({
		queryFn: fetchEarTrainingPracticeSessionActivity,
		queryKey: ['ear-training', 'analytics', 'activity', queryParams],
		enabled
	});

	return {
		practiceSessionActivity: data?.data,
		activityQueryPending: isPending
	};
};

interface IUsePracticeSessionProgressParams extends IUseQueryBase {
	queryParams?: {
		type?: EarTrainingPracticeType;
	};
}

interface IPracticeSessionProgress {
	date: string;
	correct: number;
	questionCount: number;
}

type IPracticeSessionProgressResponse = IPracticeSessionProgress[];

export const useEarTrainingPracticeSessionProgressQuery = ({ enabled, queryParams }: IUsePracticeSessionProgressParams) => {
	const fetchEarTrainingPracticeSessionProgress = async () => {
		const practiceSessionProgress = (
			await axios.get<IResponse<IPracticeSessionProgressResponse>>('/ear-training/analytics/progress', {
				isPrivate: true,
				params: queryParams
			})
		).data.data;

		return practiceSessionProgress.sort((a, b) => dayjs(a.date).diff(dayjs(b.date))).map(p => ({ ...p, score: calculatePercentage(p.correct, p.questionCount) }));
	};

	const { data, isPending } = useQuery({
		queryFn: fetchEarTrainingPracticeSessionProgress,
		queryKey: ['ear-training', 'analytics', 'progress', queryParams],
		enabled
	});

	return {
		practiceSessionProgress: data,
		progressQueryPending: isPending
	};
};

interface IPracticeSessionScore {
	correct: number;
	questionCount: number;
	type: EarTrainingPracticeType;
}

type IPracticeSessionScoresResponse = IPracticeSessionScore[];

export const useEarTrainingPracticeSessionScoresQuery = ({ enabled = true }: IUseQueryBase) => {
	const fetchEarTrainingPracticeSessionScores = async () => {
		const practiceSessionScores = (
			await axios.get<IResponse<IPracticeSessionScoresResponse>>('/ear-training/analytics/scores', {
				isPrivate: true
			})
		).data.data;

		return practiceSessionScores.reduce((accumulator: Record<string, Omit<IPracticeSessionScore, 'type'>>, currentValue: IPracticeSessionScore) => {
			const { type, ...rest } = currentValue;
			accumulator[type] = rest;
			return accumulator;
		}, {});
	};

	const { data, isPending } = useQuery({
		queryFn: fetchEarTrainingPracticeSessionScores,
		queryKey: ['ear-training', 'analytics', 'scores'],
		enabled
	});

	return {
		practiceSessionScores: data,
		scoresQueryPending: isPending
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

interface IUsePracticeSessionQueryParams extends IUseQueryBase {
	practiceSessionId: string;
}

interface IEarTrainingPracticeSessionDetail {
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

export const useEarTrainingPracticeSessionQuery = ({ enabled, practiceSessionId }: IUsePracticeSessionQueryParams) => {
	const fecthEarTrainingPracticeSession = async () => {
		const data = (
			await axios.get<IResponse<IEarTrainingPracticeSessionDetail>>(`/ear-training/sessions/${practiceSessionId}`, {
				isPrivate: true
			})
		).data;
		return data;
	};

	const { data, isPending } = useQuery({
		queryFn: fecthEarTrainingPracticeSession,
		queryKey: ['ear-training', 'session', practiceSessionId],
		staleTime: Infinity,
		enabled
	});

	return {
		practiceSessionDetail: data?.data,
		practiceSessionDetailPending: isPending
	};
};
