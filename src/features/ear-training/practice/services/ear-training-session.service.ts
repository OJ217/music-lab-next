import axios from 'axios';
import { z } from 'zod';

import { EarTrainingType, IResponse } from '@/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const saveEarTrainingPracticeSessionSchema = z
	.object({
		type: z.nativeEnum(EarTrainingType),
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
			await axios.post<IResponse<{ _id: string; xp: number; streakUpdated: boolean }>>('/ear-training/sessions', practiceSessionData, {
				isPrivate: true
			})
		).data;
	};

	const queryClient = useQueryClient();

	const { isPending: savePracticeSessionPending, mutateAsync: mutateSaveEarTrainingPracticeSession } = useMutation({
		mutationFn: saveEarTrainingPracticeSession,
		onSuccess: () => {
			queryClient.removeQueries({
				queryKey: ['ear-training', 'analytics']
			});
		}
	});

	return {
		savePracticeSessionPending,
		mutateSaveEarTrainingPracticeSession
	};
};
