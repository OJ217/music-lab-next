import PublicOnlyRoute from '@/context/auth/hoc/public-route';

interface IAuthLayoutProps {
	children: React.ReactNode;
}

const AuthLayout: React.FC<IAuthLayoutProps> = ({ children }) => {
	return (
		<PublicOnlyRoute>
			<main className='flex min-h-screen flex-col text-white'>
				{/* Content */}
				<main className='flex min-h-screen flex-col items-center justify-center space-y-8 p-4'>{children}</main>
			</main>
		</PublicOnlyRoute>
	);
};

export default AuthLayout;
