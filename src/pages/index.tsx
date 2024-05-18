import { useRouter } from 'next/router';
import { useEffect } from 'react';

import { useAuth } from '@/context/auth/auth.context';

const HomePage = () => {
	const router = useRouter();

	const { authContextLoading, authenticated, signOut } = useAuth();

	useEffect(() => {
		if (!authContextLoading) {
			if (!authenticated) {
				router.replace('/auth/sign-in');
			} else {
				router.replace('/ear-training/practice');
			}
		}
	}, [router, authContextLoading, authenticated]);
};

export default HomePage;
