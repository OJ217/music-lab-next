import axios from 'axios';
import dayjs from 'dayjs';

import { EarTrainingPracticeType } from '@/features/ear-training/practice/services/practice-session.service';
import { IPaginatedDocuments, IResponse, IUseQueryBase } from '@/types';
import { calculatePercentage } from '@/utils/format.util';
import { useQuery } from '@tanstack/react-query';

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

interface IEarTrainingPracticeSession {
	_id: string;
	type: EarTrainingPracticeType;
	duration: number;
	result: {
		score: number;
		correct: number;
		incorrect: number;
		questionCount: number;
	};
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
