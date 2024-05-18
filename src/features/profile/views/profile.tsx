import dayjs from 'dayjs';

import { useMetaDataLocalStorage } from '@/common/hooks/use-parsed-local-storage';
import { useAuth } from '@/context/auth/auth.context';
import EarTrainingLayout from '@/features/ear-training/practice/layouts/ear-training-layout';
import { EarTrainingType } from '@/types';
import { Avatar, rem } from '@mantine/core';
import { IconCalendarTime, IconFlame, IconMusic, IconSeeding, IconStar } from '@tabler/icons-react';

const Profile = () => {
	const { userInfo } = useAuth();
	const { metaDataStore } = useMetaDataLocalStorage();

	return (
		<EarTrainingLayout
			centered={false}
			showAffix={false}
		>
			<div className='mx-auto w-full max-w-md space-y-8'>
				{/* Profile header */}
				<div className='flex flex-col items-center justify-center space-y-4 rounded-lg bg-gradient-to-tr from-violet-600/25 to-violet-600/50 p-4 md:p-5'>
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
							<div className='flex items-center gap-2 rounded-2xl border border-violet-600 bg-gradient-to-tr from-violet-600/20 to-violet-600/40 px-2 py-1.5'>
								<IconSeeding
									className='stroke-violet-400 stroke-[2.4px]'
									size={18}
								/>
								<span className='text-xs font-bold'>{metaDataStore?.earTrainingProfile.xp} XP</span>
							</div>
							<div className='flex items-center gap-2 rounded-2xl border border-violet-600 bg-gradient-to-tr from-violet-600/20 to-violet-600/40 px-2 py-1.5'>
								<IconStar
									className='stroke-violet-400 stroke-[2.4px]'
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
						{ field: 'И-мэйл', value: userInfo?.email },
						{ field: 'Сургууль', value: 'Mongolian State Conservatory' },
						{ field: 'Бүртгүүлсэн', value: dayjs(metaDataStore?.profile.createdAt).format('YYYY.MM.DD') }
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
					<h3 className='text-sm font-semibold'>Ерөнхий хураангуй</h3>
					<div className='grid grid-cols-2 gap-4'>
						{[
							{ label: 'Current streak', value: metaDataStore?.earTrainingProfile.currentStreak.count ?? 0, icon: IconFlame },
							{ label: 'Total points', value: metaDataStore?.earTrainingProfile.xp ?? 0, icon: IconSeeding },
							{ label: 'Best streak', value: metaDataStore?.earTrainingProfile.bestStreak?.count ?? 0, icon: IconCalendarTime },
							{ label: 'Total practice', value: metaDataStore?.earTrainingProfile.stats?.totalSessions ?? 0, icon: IconMusic }
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
					<h3 className='text-sm font-semibold'>Өдрийн зорилт</h3>
					<div className='space-y-3'>
						<div className='flex items-center justify-between gap-2 rounded-lg bg-gradient-to-tr from-violet-600/25 to-violet-600/50 px-4 py-3'>
							<p className='text-sm font-semibold text-violet-100'>Интервал сонсох</p>
							<div className='rounded-md bg-violet-600 px-2 py-0.5'>
								<p className='text-sm font-bold'>
									{metaDataStore?.earTrainingProfile?.goals
										? metaDataStore?.earTrainingProfile?.goals?.find(g => g.exerciseType === EarTrainingType.IntervalIdentification)?.target ?? 0
										: 0}
								</p>
							</div>
						</div>
						<div className='flex items-center justify-between gap-2 rounded-lg bg-gradient-to-tr from-sky-600/25 to-sky-600/50 px-4 py-3'>
							<p className='text-sm font-semibold text-sky-100'>Аккорд сонсох</p>
							<div className='rounded-md bg-sky-600 px-2 py-0.5'>
								<p className='text-sm font-bold'>
									{metaDataStore?.earTrainingProfile?.goals
										? metaDataStore?.earTrainingProfile?.goals?.find(g => g.exerciseType === EarTrainingType.ChordIdentification)?.target ?? 0
										: 0}
								</p>
							</div>
						</div>
						<div className='flex items-center justify-between gap-2 rounded-lg bg-gradient-to-tr from-amber-600/25 to-amber-600/50 px-4 py-3'>
							<p className='text-sm font-semibold text-amber-100'>Лад сонсох</p>
							<div className='rounded-md bg-amber-600 px-2 py-0.5'>
								<p className='text-sm font-bold'>
									{metaDataStore?.earTrainingProfile?.goals
										? metaDataStore?.earTrainingProfile?.goals?.find(g => g.exerciseType === EarTrainingType.ModeIdentification)?.target ?? 0
										: 0}
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</EarTrainingLayout>
	);
};

export default Profile;
