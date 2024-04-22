import { useEffect } from 'react';

import { useAuth } from '@/context/auth/auth.context';

interface IProtectedRouteProps {
	children: React.ReactNode;
}

// * HOC features:
// * [+] HOC for routes that only authenticated users can access
// * [+] Performs signOut() action and redirects the user to /auth/sign-in if user is unauthenticated
// ! HOCs should only wrap layout components

const ProtectedRoute: React.FC<IProtectedRouteProps> = ({ children }) => {
	const { authContextLoading, authenticated, signOut } = useAuth();

	useEffect(() => {
		if (!authContextLoading && !authenticated) {
			signOut();
		}
	}, [authenticated, authContextLoading, signOut]);

	if (authContextLoading || authenticated === undefined || !authenticated) {
		return null;
	}

	return children;
};

export default ProtectedRoute;
