import Link from 'next/link';

import PublicOnlyRoute from '@/context/auth/hoc/public-route';
import { ActionIcon, Menu } from '@mantine/core';
import { IconFlask2, IconMusic } from '@tabler/icons-react';

interface IAuthLayoutProps {
	children: React.ReactNode;
}

const AuthLayout: React.FC<IAuthLayoutProps> = ({ children }) => {
	return (
		<PublicOnlyRoute>
			<main className='flex min-h-screen flex-col text-white'>
				{/* Navigation */}
				<nav className='sticky top-0 z-50 w-full flex-none border-b-2 border-violet-600/10 bg-transparent bg-gradient-to-tr from-violet-600/5 to-violet-600/20 px-4 pb-3 pt-[calc(0.75rem_+_env(safe-area-inset-top))] backdrop-blur-md md:px-6 md:py-4'>
					<div className='mx-auto max-w-4xl'>
						<div className='flex items-center justify-between gap-8'>
							<Link href={'/auth/sign-in'}>
								<div className='inline-flex items-center gap-1 rounded-lg bg-gradient-to-tr from-cyan-600/20 to-violet-600/25 px-3 py-2'>
									<IconFlask2
										size={20}
										stroke={1.8}
									/>
									<h1 className='text-lg font-medium'>Music Lab</h1>
								</div>
							</Link>
							<Menu position={'top-end'}>
								<Menu.Target>
									<ActionIcon
										className='bg-violet-600/25 bg-gradient-to-tr from-cyan-600/20 to-violet-600/25 transition-all duration-300 ease-in-out hover:bg-gradient-to-tr hover:from-cyan-600/20 hover:to-violet-600/25'
										radius={'md'}
										size={'xl'}
									>
										<IconMusic stroke={1.8} />
									</ActionIcon>
								</Menu.Target>

								<Menu.Dropdown className='border border-violet-600/10 bg-transparent bg-gradient-to-tr from-violet-600/5 to-violet-600/20 backdrop-blur-3xl'>
									<Link
										href={'/auth/sign-in'}
										className='block'
									>
										<Menu.Item className='text-white transition-colors duration-300 ease-in-out hover:bg-violet-600'>Нүүр</Menu.Item>
									</Link>

									<Link
										href={'/auth/sign-in'}
										className='block'
									>
										<Menu.Item className='text-white transition-colors duration-300 ease-in-out hover:bg-violet-600'>Тусламж</Menu.Item>
									</Link>
								</Menu.Dropdown>
							</Menu>
						</div>
					</div>
				</nav>

				{/* Content */}
				<main className='flex min-h-screen flex-col items-center justify-center space-y-8 px-4 pb-28 pt-4'>{children}</main>
			</main>
		</PublicOnlyRoute>
	);
};

export default AuthLayout;
