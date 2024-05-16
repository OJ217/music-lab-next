import { useAuth } from '@/context/auth/auth.context';
import EarTrainingLayout from '@/features/ear-training/practice/layouts/ear-training-layout';
import { Avatar, rem } from '@mantine/core';
import { IconCalendarTime, IconFlame, IconMusic, IconSeeding, IconStar } from '@tabler/icons-react';

const Profile = () => {
	const { userInfo } = useAuth();
	return (
		<EarTrainingLayout
			centered={false}
			showAffix={false}
		>
			<div className='mx-auto w-full max-w-md space-y-8'>
				{/* Profile header */}
				<div className='flex flex-col items-center justify-center space-y-4'>
					{userInfo?.picture ? (
						<Avatar
							radius={'50%'}
							size={rem(96)}
							src={userInfo.picture}
						/>
					) : (
						<Avatar
							radius={'50%'}
							size={rem(96)}
							variant='gradient'
							gradient={{ from: 'violet', to: 'violet.6' }}
							classNames={{
								placeholder: 'text-white'
							}}
						>
							{userInfo?.username[0].toUpperCase()}
						</Avatar>
					)}
					<div className='space-y-3'>
						<h3 className='text-center text-lg font-semibold'>{userInfo?.username}</h3>
						<div className='flex items-center gap-3'>
							<div className='flex items-center gap-2 rounded-2xl bg-gradient-to-tr from-violet-600/25 to-violet-600/50 px-2 py-1.5'>
								<IconSeeding
									className='stroke-violet-500 stroke-[2.4px]'
									size={18}
								/>
								<span className='text-xs font-bold'>200 XP</span>
							</div>
							<div className='flex items-center gap-2 rounded-2xl bg-gradient-to-tr from-violet-600/25 to-violet-600/50 px-2 py-1.5'>
								<IconStar
									className='stroke-violet-500 stroke-[2.6px]'
									size={16}
								/>
								<span className='text-xs font-bold'>RISING STAR</span>
							</div>
						</div>
					</div>
				</div>
				{/* Profile detail */}
				<div className='space-y-2 rounded-lg bg-gradient-to-tr from-violet-600/25 to-violet-600/50 p-5 text-sm'>
					{[
						{ field: 'Email', value: 'ochiroo032373@gmail.com' },
						{ field: 'School', value: 'Mongolian State Conservatory' },
						{ field: 'Joined', value: '2023.09.01' }
					].map((detail, index) => (
						<div
							key={index}
							className='space-x-2'
						>
							<span className='font-semibold'>{detail.field}:</span>
							<span>{detail.value}</span>
						</div>
					))}
				</div>
				{/* Stats */}
				<div className='space-y-3'>
					<h3 className='text-sm font-semibold'>General statistics</h3>
					<div className='grid grid-cols-2 gap-4'>
						{[
							{ label: 'Current streak', value: '3 days', icon: IconFlame },
							{ label: 'Total points', value: '200 XP', icon: IconSeeding },
							{ label: 'Best streak', value: '7 days', icon: IconCalendarTime },
							{ label: 'Total practice', value: '24', icon: IconMusic }
						].map((stat, index) => (
							<div
								key={index}
								className='space-y-2 rounded-lg bg-gradient-to-tr from-violet-600/25 to-violet-600/50 px-4 py-3 md:px-5 md:py-4'
							>
								<div className='flex items-center justify-between gap-2'>
									<h3 className='text-xl font-bold'>{stat.value}</h3>
									<div className='grid aspect-square size-9 place-content-center rounded-full bg-violet-600'>
										<stat.icon className='stroke-white stroke-[1.6px]' />
									</div>
								</div>
								<span className='text-sm font-medium text-violet-100'>{stat.label}</span>
							</div>
						))}
					</div>
				</div>
				{/* Daily goal */}
				<div className='space-y-3'>
					<h3 className='text-sm font-semibold'>Daily goal</h3>
					<div className='space-y-3'>
						<div className='flex items-center justify-between gap-2 rounded-lg bg-gradient-to-tr from-violet-600/25 to-violet-600/50 px-4 py-3'>
							<p className='text-sm font-semibold text-violet-100'>Interval Identification</p>
							<div className='rounded-md bg-violet-600 px-2 py-0.5'>
								<p className='text-sm font-bold'>20</p>
							</div>
						</div>
						<div className='flex items-center justify-between gap-2 rounded-lg bg-gradient-to-tr from-sky-600/25 to-sky-600/50 px-4 py-3'>
							<p className='text-sm font-semibold text-sky-100'>Chord Identification</p>
							<div className='rounded-md bg-sky-600 px-2 py-0.5'>
								<p className='text-sm font-bold'>20</p>
							</div>
						</div>
						<div className='flex items-center justify-between gap-2 rounded-lg bg-gradient-to-tr from-amber-600/25 to-amber-600/50 px-4 py-3'>
							<p className='text-sm font-semibold text-amber-100'>Mode Identification</p>
							<div className='rounded-md bg-amber-600 px-2 py-0.5'>
								<p className='text-sm font-bold'>20</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</EarTrainingLayout>
	);
};

export default Profile;
