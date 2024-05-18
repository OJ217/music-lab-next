import { createContext, useContext } from 'react';
import { z } from 'zod';

import { EarTrainingType, InstitutionType } from '@/types';
import { useLocalStorage } from '@mantine/hooks';

export interface User {
	_id: string;
	email: string;
	username: string;
	picture?: string;
	createdAt: Date;
}

interface MetaDataContextPayload {
	metaDataStore: MetaDataStore | null;
	setUpMetaDataStore: (metaDataStore: MetaDataStore) => void;
}

export const MetaDataContext = createContext<MetaDataContextPayload>({
	metaDataStore: null,
	setUpMetaDataStore: _metaDataStore => {}
});

interface MetaDataStore {
	profile: {
		firstName?: string;
		lastName?: string;
		institution?: {
			name: string;
			type: InstitutionType;
		};
		picture?: string;
		createdAt: string;
	};
	earTrainingProfile: {
		xp: number;
		currentStreak: {
			count: number;
			startDate: string;
			lastLogDate: string;
		};
		goals: {
			exerciseType: EarTrainingType;
			target: number;
		}[];
		stats?: {
			totalSessions: number;
			totalDuration: number;
		};
		bestStreak?: {
			count: number;
			startDate: string;
			endDate: string;
		};
	};
}

interface IMetaDataProvider {
	children: React.ReactNode;
}

const metaDataSchema = z.object({
	profile: z.object({
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
	}),
	earTrainingProfile: z.object({
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
	})
});

export const MetaDataProvider: React.FC<IMetaDataProvider> = ({ children }) => {
	const [metaDataStore, setMetaDataStore] = useLocalStorage<MetaDataStore | null>({
		key: 'music_lab.meta_store'
	});

	const setUpMetaDataStore = (metaDataStore: MetaDataStore) => {
		const metaDataStoreParsed = metaDataSchema.safeParse(metaDataStore);

		if (metaDataStoreParsed.success) {
			setMetaDataStore(metaDataStoreParsed.data);
		}
	};

	return (
		<MetaDataContext.Provider
			value={{
				metaDataStore,
				setUpMetaDataStore
			}}
		>
			{children}
		</MetaDataContext.Provider>
	);
};

export const useMetaData = () => {
	return useContext(MetaDataContext);
};
