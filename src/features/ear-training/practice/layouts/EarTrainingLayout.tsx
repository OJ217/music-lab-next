import Link from 'next/link';

import { useAuth } from '@/context/auth/auth.context';
import ProtectedRoute from '@/context/auth/hoc/ProtectedRoute';
import { ActionIcon, Avatar, Menu, rem, Skeleton } from '@mantine/core';
import { modals } from '@mantine/modals';
import { IconChartBar, IconFlask2, IconLogout, IconSettings, IconUser } from '@tabler/icons-react';

import NavigationAffix from '../components/overlay/NavigationAffix';

interface IEarTrainingLayoutProps {
	children: React.ReactNode;
	centered?: boolean;
	showAffix?: boolean;
}

const EarTrainingLayout: React.FC<IEarTrainingLayoutProps> = ({ children, centered = true, showAffix = true }) => {
	const { userInfo, signOut } = useAuth();

	const openSignOutConfirmationModal = () => {
		modals.openConfirmModal({
			centered: true,
			title: 'Sign out',
			children: 'Are you sure to sign out?',
			labels: { confirm: 'Yes', cancel: 'No' },
			onConfirm: () => signOut()
		});
	};

	return (
		<ProtectedRoute>
			<main className='flex min-h-screen flex-col space-y-4 p-6 text-white md:space-y-8 md:p-12'>
				<nav className='flex items-center justify-between gap-8'>
					<Link href={'/ear-training/practice'}>
						<div className='inline-flex items-center gap-1 rounded-lg bg-gradient-to-tr from-cyan-600/20 to-violet-600/25 px-3 py-1'>
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
								height={rem(48)}
							/>
						</div>
					) : (
						<Menu
							position={'bottom-end'}
							zIndex={1000}
						>
							<div className='flex items-center space-x-4'>
								<div className='hidden text-right md:block'>
									<h3 className='font-bold'>{userInfo.username}</h3>
									<p className='text-xs'>{userInfo?.email}</p>
								</div>
								<Menu.Target>
									{userInfo.picture ? (
										<Avatar
											radius={'xl'}
											size={rem(48)}
											component={ActionIcon}
											src={userInfo.picture}
										/>
									) : (
										<Avatar
											radius={'xl'}
											size={rem(48)}
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
				</nav>
				<div className={`flex-grow ${centered && 'grid place-content-center pb-[3.5rem] md:pb-16'}`}>
					{children}
				</div>
			</main>
			{showAffix && <NavigationAffix />}
		</ProtectedRoute>
	);
};

export default EarTrainingLayout;
