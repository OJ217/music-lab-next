import axios from 'axios';
import { z } from 'zod';

import { IResponse } from '@/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export enum EarTrainingPracticeType {
	IntervalIdentification = 'interval-identification',
	ChordIdentification = 'chord-identification',
	ModeIdentification = 'mode-identification'
}

export const saveEarTrainingPracticeSessionSchema = z
	.object({
		type: z.nativeEnum(EarTrainingPracticeType),
		duration: z.number().min(0),
		result: z.object({
			score: z.number().min(0).max(100),
			correct: z.number().min(0).max(100),
			incorrect: z.number().min(0).max(100),
			questionCount: z.number().min(5).max(100)
		}),
		statistics: z
			.array(
				z.object({
					score: z.number().min(0).max(100),
					correct: z.number().min(0).max(100),
					incorrect: z.number().min(0).max(100),
					questionCount: z.number().min(1).max(100),
					questionType: z.string().min(1).max(50)
				})
			)
			.min(2)
	})
	.refine(({ result: { correct, incorrect, questionCount } }) => correct + incorrect === questionCount)
	.refine(({ statistics }) => statistics.map(s => s.correct + s.incorrect === s.questionCount).every(s => s), {
		message: 'Invalid practice result statistics',
		path: ['statistics']
	});

export type SaveEarTrainingPracticeSessionRequestData = z.infer<typeof saveEarTrainingPracticeSessionSchema>;

export const useSaveEarTrainingPracticeSessionMutation = () => {
	const saveEarTrainingPracticeSession = async (practiceSessionData: SaveEarTrainingPracticeSessionRequestData) => {
		return (
			await axios.post<IResponse<{ _id: string }>>('/ear-training/sessions', practiceSessionData, {
				isPrivate: true
			})
		).data;
	};

	const queryClient = useQueryClient();

	const { isPending: savePracticeSessionPending, mutateAsync: mutateSaveEarTrainingPracticeSession } = useMutation({
		mutationFn: saveEarTrainingPracticeSession,
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ['ear-training', 'analytics', 'scores'],
				exact: true
			});
		}
	});

	return {
		savePracticeSessionPending,
		mutateSaveEarTrainingPracticeSession
	};
};
