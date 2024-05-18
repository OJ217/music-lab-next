import { useRouter } from 'next/router';
import { createContext, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

import { deleteEarTrainingErrorLocal } from '@/features/ear-training/practice/stores/ear-training-errors.store';
import { notify } from '@/utils/notification.util';
import { useLocalStorage } from '@mantine/hooks';
import { useQueryClient } from '@tanstack/react-query';

export interface User {
	_id: string;
	email: string;
	username: string;
	picture?: string;
	createdAt: Date;
}

interface AuthContextPayload {
	authenticated: boolean | undefined;
	authContextLoading: boolean;
	userInfo: User | undefined;
	setAuthStore: (val: AuthStore | ((prevState: AuthStore | null) => AuthStore | null) | null) => void;
	signInLocal: (authStore: AuthStore) => void;
	signOut: () => void;
}

export const AuthContext = createContext<AuthContextPayload>({
	authenticated: false,
	authContextLoading: true,
	userInfo: undefined,
	setAuthStore: () => {},
	signInLocal: (_authStore: AuthStore) => {},
	signOut: () => {}
});

interface AuthStore {
	accessToken: string;
	refreshToken: string;
	user: User;
}

interface IAuthProvider {
	children: React.ReactNode;
}

const authStoreSchema = z.object({
	accessToken: z.string().min(1),
	refreshToken: z.string().min(1),
	user: z.object({
		_id: z.string().min(1),
		email: z.string().email(),
		username: z.string().min(1),
		picture: z.string().optional().nullable(),
		createdAt: z.string().datetime()
	})
});

export const AuthProvider: React.FC<IAuthProvider> = ({ children }) => {
	const router = useRouter();
	const client = useQueryClient();
	const { t: authT } = useTranslation('auth');

	const [authStore, setAuthStore] = useLocalStorage<AuthStore | null>({
		key: 'music_lab.auth_store'
	});

	const [authenticated, setAuthenticated] = useState<boolean | undefined>();
	const authContextLoading: boolean = authenticated === undefined;

	useEffect(() => {
		if (!window.localStorage.getItem('music_lab.auth_store')) {
			setAuthenticated(false);
		} else if (!!authStore) {
			const authStoreParsed = authStoreSchema.safeParse(authStore);

			if (authStoreParsed.success) {
				setAuthenticated(true);
			} else {
				setAuthenticated(false);
			}
		}
	}, [authStore]);

	const signInLocal = (authStore: AuthStore) => {
		const authStoreParsed = authStoreSchema.safeParse(authStore);

		if (authStoreParsed.success) {
			setAuthStore(authStore);
			setAuthenticated(true);
			router.push('/ear-training/practice');
		} else {
			setAuthenticated(false);
		}
	};

	const signOut = () => {
		client.cancelQueries();
		client.removeQueries();

		localStorage.clear();
		void deleteEarTrainingErrorLocal();

		setAuthenticated(false);

		router.push('/auth/sign-in').then(() =>
			notify({
				type: 'warning',
				title: authT('signInMessage')
			})
		);
	};

	const authContextValue: AuthContextPayload = {
		authenticated,
		authContextLoading,
		userInfo: authStore?.user,
		setAuthStore,
		signInLocal,
		signOut
	};

	return <AuthContext.Provider value={authContextValue}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
	return useContext(AuthContext);
};
