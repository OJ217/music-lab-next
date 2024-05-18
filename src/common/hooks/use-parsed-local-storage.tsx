import { useEffect, useState } from 'react';
import { z } from 'zod';

import { EarTrainingType, InstitutionType } from '@/types';
import { useLocalStorage } from '@mantine/hooks';

interface IUseParsedLocalStorageParams<Schema> {
	schema: Schema;
	storeKey: string;
}
export const useParsedLocalStorage = <T extends z.Schema>({ schema, storeKey }: IUseParsedLocalStorageParams<T>) => {
	type Store = z.infer<typeof schema>;

	const [store, setStore] = useLocalStorage<Store>({
		key: storeKey
	});

	const [parsedStore, setParsedStore] = useState<Store | null>(null);

	useEffect(() => {
		if (store !== undefined && parsedStore === null) {
			const storeValidation = schema.safeParse(store);

			if (storeValidation.success) {
				console.log('Settings parsed store');
				setParsedStore(storeValidation.data);
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [store]);

	const setValidatatedStore = (storeValue: Store) => {
		const storeValidation = schema.safeParse(storeValue);

		if (storeValidation.success) {
			console.log('Settings parsed store');
			setStore(storeValidation.data);
			setParsedStore(storeValidation.data);
		}
	};

	return [parsedStore, setValidatatedStore] as const;
};

const metaDataProfileSchema = z.object({
	firstName: z.string().optional(),
	lastName: z.string().optional(),
	createdAt: z.string().datetime(),
	institution: z
		.object({
			name: z.string(),
			type: z.nativeEnum(InstitutionType)
		})
		.optional(),
	picture: z.string().url().optional()
});

const metaDataEarTrainingProfileSchema = z.object({
	xp: z.number(),
	currentStreak: z.object({
		count: z.number(),
		startDate: z.string().datetime(),
		lastLogDate: z.string().datetime()
	}),
	goals: z.array(
		z.object({
			exerciseType: z.nativeEnum(EarTrainingType),
			target: z.number()
		})
	),
	stats: z
		.object({
			totalSessions: z.number(),
			totalDuration: z.number()
		})
		.optional(),
	bestStreak: z
		.object({
			count: z.number(),
			startDate: z.string().datetime(),
			endDate: z.string().datetime()
		})
		.optional()
});

const metaDataSchema = z.object({
	profile: metaDataProfileSchema,
	earTrainingProfile: metaDataEarTrainingProfileSchema
});

export const useMetaDataLocalStorage = () => {
	const [metaDataStore, setMetaDataStore] = useParsedLocalStorage({
		schema: metaDataSchema,
		storeKey: 'music_lab.meta_store'
	});

	const setMetaDataProfile = (metaDataProfile: z.infer<typeof metaDataProfileSchema>) => {
		if (metaDataStore !== null) {
			setMetaDataStore({
				...metaDataStore,
				profile: metaDataProfile
			});
		}
	};

	const setMetaDataEarTrainingProfile = ({ xp, streakUpdated, duration }: { xp: number; streakUpdated: boolean; duration: number }) => {
		if (metaDataStore !== null) {
			const currentDate = new Date().toISOString();

			let currentStreak = metaDataStore.earTrainingProfile.currentStreak;
			let bestStreak = metaDataStore.earTrainingProfile.bestStreak ?? { count: 0, startDate: currentDate, endDate: currentDate };

			if (streakUpdated) {
				if (currentStreak.count === 0) {
					currentStreak.startDate = currentDate;
				}
				currentStreak.count = currentStreak.count + 1;
				currentStreak.lastLogDate = currentDate;
			}

			if (currentStreak.count >= bestStreak.count) {
				if (bestStreak.count === 0) {
					bestStreak.endDate = currentDate;
					bestStreak.startDate = bestStreak.startDate;
				}
				bestStreak.count === currentStreak.count;
			}

			const stats = {
				totalSessions: (metaDataStore.earTrainingProfile.stats?.totalSessions ?? 0) + 1,
				totalDuration: metaDataStore.earTrainingProfile.stats?.totalDuration ?? 0 + duration
			};

			setMetaDataStore({
				...metaDataStore,
				earTrainingProfile: {
					currentStreak: currentStreak,
					bestStreak: bestStreak,
					stats,
					goals: metaDataStore.earTrainingProfile.goals,
					xp: (metaDataStore.earTrainingProfile.xp ?? 0) + xp
				}
			});
		}
	};

	return { metaDataStore, setMetaDataStore, setMetaDataProfile, setMetaDataEarTrainingProfile } as const;
};
