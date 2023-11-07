import { create } from 'zustand';

import { useLocalStorage } from '@mantine/hooks';

interface User {
	_id: string;
	email: string;
	username: string;
	picture?: string;
}

interface IAuthStore {
	auth: User | null;
	useAuth: () => boolean | undefined;
	setAuth: (user: Partial<User>) => void;
}

export const useAuthStore = create<IAuthStore>(set => ({
	auth: typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('auth') as string) : null,
	useAuth: () => {
		const [authenticated] = useLocalStorage<boolean>({ key: 'authenticated', defaultValue: false });
		return authenticated;
	},
	setAuth: user =>
		// @ts-ignore
		set(state => {
			const authState = { ...state.auth, ...user };
			localStorage.setItem('auth', JSON.stringify(authState));
			return authState;
		})
}));
