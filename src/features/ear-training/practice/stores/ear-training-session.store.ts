import Dexie, { Table } from 'dexie';
import { z } from 'zod';

import { EarTrainingType } from '@/types';

const earTrainingSessionSchema = z
	.object({
		_id: z.string(),
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
			.min(2),
		timestamp: z.date()
	})
	.refine(({ result: { correct, incorrect, questionCount } }) => correct + incorrect === questionCount)
	.refine(({ statistics }) => statistics.map(s => s.correct + s.incorrect === s.questionCount).every(s => s), {
		message: 'Invalid practice result statistics',
		path: ['statistics']
	});

const earTrainingSessionsSchema = z.array(earTrainingSessionSchema).max(10);

type EarTrainingSessionSchema = z.infer<typeof earTrainingSessionSchema>;

class EarTrainingSessionIDB extends Dexie {
	intervalSessions!: Table<EarTrainingSessionSchema>;
	chordSessions!: Table<EarTrainingSessionSchema>;
	modeSessions!: Table<EarTrainingSessionSchema>;

	constructor() {
		super('music_lab.ear_training.sessions');
		this.version(1).stores({
			intervalSessions: 'id,timestamp',
			chordSessions: 'id,timestamp',
			modeSessions: 'id,timestamp'
		});

		this.intervalSessions.hook('creating', (_primaryKey, obj) => {
			const validation = earTrainingSessionSchema.safeParse(obj);

			if (!validation.success) {
				console.error(validation.error);
				return;
			}

			return validation.data._id;
		});

		this.chordSessions.hook('creating', (_primaryKey, obj) => {
			const validation = earTrainingSessionSchema.safeParse(obj);

			if (!validation.success) {
				console.error(validation.error);
				return;
			}

			return validation.data._id;
		});

		this.modeSessions.hook('creating', (_primaryKey, obj) => {
			const validation = earTrainingSessionSchema.safeParse(obj);

			if (!validation.success) {
				console.error(validation.error);
				return;
			}

			return validation.data._id;
		});
	}
}

const earTrainingSessionIDB = new EarTrainingSessionIDB();

type EarTrainingSessionStores = 'intervalSessions' | 'chordSessions' | 'modeSessions';

export const fetchEarTrainingSessionsLocal = async (storeName: EarTrainingSessionStores) => {
	try {
		const earTrainingSessions = await earTrainingSessionIDB.table<EarTrainingSessionSchema>(storeName).limit(10).toArray();

		const validation = earTrainingSessionsSchema.safeParse(earTrainingSessions);
		if (!validation.success) {
			return [];
		}

		return earTrainingSessions;
	} catch (error) {
		console.error(error);
		return [];
	}
};

export const addEarTrainingSessionLocal = async (earTrainingSession: EarTrainingSessionSchema, storeName: EarTrainingSessionStores) => {
	const MAX_DOCUMENTS = 10;

	try {
		const earTrainingSssionDocumentCount = await earTrainingSessionIDB.table(storeName).count();

		if (earTrainingSssionDocumentCount >= MAX_DOCUMENTS) {
			void earTrainingSessionIDB
				.table(storeName)
				.orderBy('timestamp')
				.limit(earTrainingSssionDocumentCount - (MAX_DOCUMENTS - 1))
				.delete();
		}

		void earTrainingSessionIDB.table<EarTrainingSessionSchema>(storeName).add(earTrainingSession);
	} catch (error) {
		console.error(error);
	}
};
