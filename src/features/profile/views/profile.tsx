import { useAuth } from '@/context/auth/auth.context';
import EarTrainingLayout from '@/features/ear-training/practice/layouts/ear-training-layout';
import { Avatar, Badge, rem } from '@mantine/core';

const Profile = () => {
	const { userInfo } = useAuth();
	return (
		<EarTrainingLayout centered={false}>
			<div className='mx-auto w-full max-w-md'>
				<div className='flex flex-wrap items-center justify-center gap-4 rounded-lg bg-transparent bg-gradient-to-tr from-violet-600/10 to-violet-600/20 p-4 md:gap-6 md:p-6'>
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
					<div className='space-y-4'>
						<div className='text-center'>
							<h3 className='font-bold md:text-xl'>{userInfo?.username}</h3>
							<p className='text-sm'>{userInfo?.email}</p>
						</div>
						<div className='flex flex-wrap items-center justify-center gap-2'>
							<Badge
								variant='light'
								color='violet'
							>
								1200 XP
							</Badge>
							<Badge
								variant='light'
								color='orange'
							>
								2-DAY STREAK
							</Badge>
							<Badge
								variant='light'
								color='blue'
							>
								RISING STAR
							</Badge>
						</div>
					</div>
				</div>
			</div>
		</EarTrainingLayout>
	);
};

export default Profile;
