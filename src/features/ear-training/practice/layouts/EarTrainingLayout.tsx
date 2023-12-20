import Link from 'next/link';

import { useAuth } from '@/context/auth/auth.context';
import ProtectedRoute from '@/context/auth/hoc/ProtectedRoute';
import { ActionIcon, Avatar, Menu, rem, Skeleton } from '@mantine/core';
import { modals } from '@mantine/modals';
import { IconChartBar, IconFlask2, IconLogout, IconSettings, IconUser } from '@tabler/icons-react';
import { useQueryClient } from '@tanstack/react-query';

import NavigationAffix from '../components/overlay/NavigationAffix';

interface IEarTrainingLayoutProps {
	children: React.ReactNode;
	centered?: boolean;
	showAffix?: boolean;
}

const EarTrainingLayout: React.FC<IEarTrainingLayoutProps> = ({ children, centered = true, showAffix = true }) => {
	const { userInfo, signOut } = useAuth();
	const queryClient = useQueryClient();

	const openSignOutConfirmationModal = () => {
		modals.openConfirmModal({
			centered: true,
			title: 'Sign out',
			children: 'Are you sure to sign out?',
			labels: { confirm: 'Yes', cancel: 'No' },
			onConfirm: () => {
				signOut();
				queryClient.invalidateQueries();
			}
		});
	};

	return (
		<ProtectedRoute>
			<main className='flex min-h-screen flex-col text-white'>
				{/* Navigation */}
				<nav className='sticky -top-[20%] z-50 w-full flex-none backdrop-blur' />
				<nav className='sticky top-0 z-50 w-full flex-none border-b-2 border-violet-600/10 bg-transparent bg-gradient-to-tr from-violet-600/5 to-violet-600/20 px-4 py-3 backdrop-blur md:px-6 md:py-4'>
					<div className='mx-auto max-w-5xl'>
						<div className='flex items-center justify-between gap-8'>
							<Link href={'/ear-training/practice'}>
								<div className='inline-flex items-center gap-1 rounded-lg bg-gradient-to-tr from-cyan-600/20 to-violet-600/25 px-2 py-1'>
									<IconFlask2 size={20} />
									<h1 className='text-lg font-medium'>Music Lab</h1>
								</div>
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
										height={rem(44)}
									/>
								</div>
							) : (
								<Menu
									position={'bottom-end'}
									zIndex={1000}
								>
									<div className='flex items-center space-x-4'>
										<div className='hidden text-right sm:block'>
											<h3 className='font-bold'>{userInfo.username}</h3>
											<p className='text-xs'>{userInfo?.email}</p>
										</div>
										<Menu.Target>
											{userInfo.picture ? (
												<Avatar
													radius={'xl'}
													size={rem(44)}
													component={ActionIcon}
													src={userInfo.picture}
												/>
											) : (
												<Avatar
													radius={'xl'}
													size={rem(44)}
													variant='gradient'
													gradient={{ from: 'violet', to: 'violet.6' }}
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

									<Menu.Dropdown>
										<Link href={'/profile/dashboard'}>
											<Menu.Item leftSection={<IconChartBar stroke={1.6} />}>Dashboard</Menu.Item>
										</Link>

										<Link href={'/profile'}>
											<Menu.Item leftSection={<IconUser stroke={1.6} />}>Profile</Menu.Item>
										</Link>

										<Link href={'/profile/settings'}>
											<Menu.Item leftSection={<IconSettings stroke={1.6} />}>Settings</Menu.Item>
										</Link>

										<Menu.Divider />

										<Menu.Item
											onClick={openSignOutConfirmationModal}
											leftSection={
												<IconLogout
													stroke={1.6}
													className='ml-0.5'
												/>
											}
										>
											Sign out
										</Menu.Item>
									</Menu.Dropdown>
								</Menu>
							)}
						</div>
					</div>
				</nav>

				{/* Content */}
				<div className={`w-full flex-grow ${centered && 'grid place-content-center'}`}>
					<div className='mx-auto max-w-5xl p-4 md:p-6'>{children}</div>
				</div>
				{showAffix && <NavigationAffix />}
			</main>
		</ProtectedRoute>
	);
};

export default EarTrainingLayout;
