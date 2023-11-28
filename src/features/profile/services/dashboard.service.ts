import axios from 'axios';

import { EarTrainingPracticeType } from '@/features/ear-training/practice/services/practice-session.service';
import { IResponse, IUseQueryBase } from '@/types';
import { useQuery } from '@tanstack/react-query';

type PracticeSessionActivityResponse = {
	activity: number;
	date: string;
}[];

export const useEarTrainingPracticeSessionActivityQuery = ({ enabled = true }: IUseQueryBase) => {
	const fetchEarTrainingPracticeSessionActivity = async () => {
		return (
			await axios.get<IResponse<PracticeSessionActivityResponse>>('/ear-training/practice-session/activity', {
				isPrivate: true
			})
		).data;
	};

	const { data, isPending } = useQuery({
		queryFn: fetchEarTrainingPracticeSessionActivity,
		queryKey: ['practice-session', 'activity'],
		staleTime: Infinity,
		enabled
	});

	return {
		practiceSessionActivity: data?.data,
		activityQueryPending: isPending
	};
};

type PracticeSessionScoresResponse = {
	correct: number;
	questionCount: number;
	type: EarTrainingPracticeType;
}[];

export const useEarTrainingPracticeSessionScoresQuery = ({ enabled = true }: IUseQueryBase) => {
	const fetchEarTrainingPracticeSessionScores = async () => {
		return (
			await axios.get<IResponse<PracticeSessionScoresResponse>>('/ear-training/practice-session/scores', {
				isPrivate: true
			})
		).data;
	};

	const { data, isPending } = useQuery({
		queryFn: fetchEarTrainingPracticeSessionScores,
		queryKey: ['practice-session', 'scores'],
		staleTime: Infinity,
		enabled
	});

	return {
		practiceSessionScores: data?.data,
		scoresQueryPending: isPending
	};
};
