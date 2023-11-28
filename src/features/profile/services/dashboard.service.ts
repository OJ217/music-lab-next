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
		enabled,
		refetchOnMount: 'always'
	});

	return {
		practiceSessionActivity: data?.data,
		activityQueryPending: isPending
	};
};

interface PracticeSessionScore {
	correct: number;
	questionCount: number;
	type: EarTrainingPracticeType;
}

type PracticeSessionScoresResponse = PracticeSessionScore[];

export const useEarTrainingPracticeSessionScoresQuery = ({ enabled = true }: IUseQueryBase) => {
	const fetchEarTrainingPracticeSessionScores = async () => {
		const practiceSessionScores = (
			await axios.get<IResponse<PracticeSessionScoresResponse>>('/ear-training/practice-session/scores', {
				isPrivate: true
			})
		).data.data;

		return practiceSessionScores.reduce(
			(accumulator: Record<string, Omit<PracticeSessionScore, 'type'>>, currentValue: PracticeSessionScore) => {
				const { type, ...rest } = currentValue;
				accumulator[type] = rest;
				return accumulator;
			},
			{}
		);
	};

	const { data, isPending } = useQuery({
		queryFn: fetchEarTrainingPracticeSessionScores,
		queryKey: ['practice-session', 'scores'],
		staleTime: Infinity,
		enabled
	});

	return {
		practiceSessionScores: data,
		scoresQueryPending: isPending
	};
};
