import Link from 'next/link';
import { useTranslation } from 'react-i18next';

import { useAuth } from '@/context/auth/auth.context';
import ProtectedRoute from '@/context/auth/hoc/protected-route';
import { ActionIcon, Avatar, Menu, rem, Skeleton } from '@mantine/core';
import { modals } from '@mantine/modals';
import { IconChartBar, IconLogout, IconSettings, IconUser } from '@tabler/icons-react';
import { useQueryClient } from '@tanstack/react-query';

import NavigationAffix from '../components/overlay/navigation-affix';

type MaxWidthSizeKey = 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl';

const maxWidthSizes: Record<MaxWidthSizeKey, number> = {
	lg: 32,
	xl: 36,
	'2xl': 42,
	'3xl': 48,
	'4xl': 56,
	'5xl': 64,
	'6xl': 72,
	'7xl': 80
};

interface IEarTrainingLayoutProps {
	children: React.ReactNode;
	centered?: boolean;
	showAffix?: boolean;
	maxWidthKey?: MaxWidthSizeKey;
}

const EarTrainingLayout: React.FC<IEarTrainingLayoutProps> = ({ children, centered = true, showAffix = true, maxWidthKey = '5xl' }) => {
	const { userInfo, signOut } = useAuth();
	const queryClient = useQueryClient();
	const { t: authT } = useTranslation('auth');
	const { t: systemT } = useTranslation('system');

	const openSignOutConfirmationModal = () => {
		modals.openConfirmModal({
			centered: true,
			title: authT('signOut'),
			children: authT('signOutConfirmation'),
			labels: { confirm: systemT('yes'), cancel: systemT('no') },
			onConfirm: () => {
				signOut();
				queryClient.removeQueries();
			}
		});
	};

	return (
		<ProtectedRoute>
			<main className='flex min-h-screen flex-col pb-[calc(1rem_+_env(safe-area-inset-bottom))] text-white'>
				{/* Navigation */}
				<nav className='sticky top-0 z-50 w-full flex-none border-b-2 border-violet-600/10 bg-transparent bg-gradient-to-tr from-violet-600/5 to-violet-600/20 px-4 pb-3 pt-[calc(0.75rem_+_env(safe-area-inset-top))] backdrop-blur-md md:px-6 md:py-4'>
					<div className='mx-auto max-w-4xl'>
						<div className='flex items-center justify-between gap-8'>
							<Link href={'/ear-training/practice'}>
								<img
									src={'/music-lab-icon-text-logo.svg'}
									alt={'logo'}
									className='h-[2.75rem]'
								/>
							</Link>
							{!userInfo ? (
								<div className='flex items-stretch space-x-4'>
									<div className='hidden flex-col justify-between sm:flex'>
										<Skeleton
											height={rem(24)}
											width={rem(120)}
											radius={'xl'}
										/>
										<Skeleton
											height={rem(16)}
											width={rem(96)}
											radius={'xl'}
											ml={'auto'}
										/>
									</div>
									<Skeleton
										circle
										height={rem(46)}
									/>
								</div>
							) : (
								<Menu
									position={'bottom-end'}
									zIndex={1000}
								>
									<div className='flex items-center sm:space-x-4'>
										<div className='hidden h-full flex-col justify-between text-right sm:flex'>
											<h3 className='font-bold'>{userInfo.username}</h3>
											<p className='text-xs'>{userInfo?.email}</p>
										</div>
										<Menu.Target>
											{userInfo.picture ? (
												<Avatar
													radius={'xl'}
													size={rem(46)}
													component={ActionIcon}
													src={userInfo.picture}
												/>
											) : (
												<Avatar
													radius={'xl'}
													size={rem(46)}
													variant='gradient'
													gradient={{ from: 'violet', to: 'violet.7' }}
													classNames={{
														placeholder: 'text-white'
													}}
													component={ActionIcon}
												>
													{userInfo.username[0].toUpperCase()}
												</Avatar>
											)}
										</Menu.Target>
									</div>

									<Menu.Dropdown className='border border-violet-800/25 bg-transparent bg-gradient-to-tr from-violet-700/15 to-violet-700/25 backdrop-blur-3xl'>
										<Link href={'/profile/dashboard'}>
											<Menu.Item
												className='text-white transition-colors duration-300 ease-in-out hover:bg-violet-600'
												leftSection={<IconChartBar stroke={1.6} />}
											>
												{systemT('dashboard')}
											</Menu.Item>
										</Link>

										<Link href={'/profile'}>
											<Menu.Item
												className='text-white transition-colors duration-300 ease-in-out hover:bg-violet-600'
												leftSection={<IconUser stroke={1.6} />}
											>
												{systemT('profile')}
											</Menu.Item>
										</Link>

										<Link href={'/profile/settings'}>
											<Menu.Item
												className='text-white transition-colors duration-300 ease-in-out hover:bg-violet-600'
												leftSection={<IconSettings stroke={1.6} />}
											>
												{systemT('settings')}
											</Menu.Item>
										</Link>

										<Menu.Divider className='border-violet-600/25' />

										<Menu.Item
											onClick={openSignOutConfirmationModal}
											className='text-white transition-colors duration-300 ease-in-out hover:bg-violet-600'
											leftSection={
												<IconLogout
													stroke={1.6}
													className='ml-0.5'
												/>
											}
										>
											{authT('signOut')}
										</Menu.Item>
									</Menu.Dropdown>
								</Menu>
							)}
						</div>
					</div>
				</nav>

				{/* Content */}
				<div className={`flex-grow ${centered && 'flex items-center justify-center'}`}>
					<div
						className='mx-auto flex-grow p-4 md:p-6'
						style={{ maxWidth: `${maxWidthSizes[maxWidthKey]}rem` }}
					>
						{children}
					</div>
				</div>
				{showAffix && <NavigationAffix />}
			</main>
		</ProtectedRoute>
	);
};

export default EarTrainingLayout;
