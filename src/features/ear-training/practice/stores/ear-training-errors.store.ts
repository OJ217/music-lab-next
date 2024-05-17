import Dexie, { Table } from 'dexie';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';

import { combineErrors } from '../utils/practice-session.util';

const earTrainingErrorSchema = z.object({
	id: z.string().uuid().optional(),
	errors: z.record(z.array(z.string())),
	timestamp: z.date()
});

const earTrainingErrorsSchema = z.array(earTrainingErrorSchema).max(10);

type EarTrainingErrorSchema = z.infer<typeof earTrainingErrorSchema>;

class EarTrainingErrorIDB extends Dexie {
	intervalErrors!: Table<EarTrainingErrorSchema>;
	chordErrors!: Table<EarTrainingErrorSchema>;
	modeErrors!: Table<EarTrainingErrorSchema>;

	constructor() {
		super('music_lab.ear_training.errors');
		this.version(1).stores({
			intervalErrors: 'id,timestamp',
			chordErrors: 'id,timestamp',
			modeErrors: 'id,timestamp'
		});

		this.intervalErrors.hook('creating', (_primaryKey, obj) => {
			const validation = earTrainingErrorSchema.safeParse(obj);

			if (!validation.success) {
				console.error(validation.error);
				return;
			}

			return uuidv4();
		});

		this.chordErrors.hook('creating', (_primaryKey, obj) => {
			const validation = earTrainingErrorSchema.safeParse(obj);

			if (!validation.success) {
				console.error(validation.error);
				return;
			}

			return uuidv4();
		});

		this.modeErrors.hook('creating', (_primaryKey, obj) => {
			const validation = earTrainingErrorSchema.safeParse(obj);

			if (!validation.success) {
				console.error(validation.error);
				return;
			}

			return uuidv4();
		});
	}
}

const earTrainingErrorIDB = new EarTrainingErrorIDB();

export type EarTrainingErrorStores = 'intervalErrors' | 'chordErrors' | 'modeErrors';

export const fetchEarTrainingErrorLocal = async (storeName: EarTrainingErrorStores) => {
	const errors = await earTrainingErrorIDB.table(storeName).limit(10).toArray();

	const validation = earTrainingErrorsSchema.safeParse(errors);
	if (!validation.success) {
		return {};
	}

	return combineErrors(validation.data.map(({ errors }) => errors));
};

export const addEarTrainingErrorLocal = async (errors: Record<string, Array<string>>, storeName: EarTrainingErrorStores) => {
	const MAX_DOCUMENTS = 10;

	const errorDocumentCount = await earTrainingErrorIDB.table(storeName).count();

	if (errorDocumentCount >= MAX_DOCUMENTS) {
		void earTrainingErrorIDB
			.table(storeName)
			.orderBy('timestamp')
			.limit(errorDocumentCount - (MAX_DOCUMENTS - 1))
			.delete();
	}

	void earTrainingErrorIDB.table(storeName).add({
		errors,
		timestamp: new Date()
	});
};

export const deleteEarTrainingErrorLocal = async () => {
	await earTrainingErrorIDB.delete();
};
