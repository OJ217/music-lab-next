import { useRouter } from 'next/router';
import { useEffect } from 'react';

import { useAuth } from '@/context/auth/auth.context';

interface IPublicOnlyRouteProps {
	children: React.ReactNode;
}

// * HOC features:
// * [+] HOC for routes that only unauthenticated users can access
// * [+] Redirects to the provided path if user is authenticated
// ! HOCs should only wrap layout components

const PublicOnlyRoute: React.FC<IPublicOnlyRouteProps> = ({ children }) => {
	const { authContextLoading, authenticated } = useAuth();
	const router = useRouter();

	useEffect(() => {
		if (!authContextLoading && authenticated) {
			router.back();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [authenticated, authContextLoading]);

	if (authContextLoading || authenticated === undefined || authenticated) {
		return null;
	}

	return children;
};

export default PublicOnlyRoute;
