import Link from 'next/link';

import EarTrainingLayout from '@/features/ear-training/practice/layouts/ear-training-layout';
import { Button, Switch } from '@mantine/core';
import { IconBell, IconCertificate, IconChevronRight, IconFlag, IconHelp, IconLanguage, IconMessage, IconSettings, IconSpeakerphone, IconUserCircle } from '@tabler/icons-react';

const Settings = () => {
	return (
		<EarTrainingLayout
			centered={false}
			showAffix={false}
		>
			<div className='mx-auto w-full max-w-md space-y-8'>
				<div className='space-y-3'>
					<h3 className='text-sm font-semibold'>General</h3>
					<div className='space-y-1 rounded-lg bg-gradient-to-tr from-violet-600/25 to-violet-600/50 p-2.5'>
						<div className='flex items-center justify-between gap-1 rounded-lg p-2.5 transition duration-300 hover:bg-violet-700/50'>
							<div className='flex flex-grow items-center gap-4'>
								<div className='grid aspect-square size-9 place-content-center rounded-full bg-violet-600'>
									<IconSettings className='stroke-white stroke-[1.8px]' />
								</div>
								<div className='flex-grow'>
									<h4 className='text-base font-semibold'>Profile</h4>
									<p className='text-[13px] text-violet-200'>Edit general information</p>
								</div>
							</div>
							<IconChevronRight className='stroke-violet-200 stroke-[1.8px]' />
						</div>
						<div className='flex items-center justify-between gap-1 rounded-lg p-2.5 transition duration-300 hover:bg-violet-700/50'>
							<div className='flex flex-grow items-center gap-4'>
								<div className='grid aspect-square size-9 place-content-center rounded-full bg-violet-600'>
									<IconUserCircle className='stroke-white stroke-[1.8px]' />
								</div>
								<div className='flex-grow'>
									<h4 className='text-base font-semibold'>Account</h4>
									<p className='text-[13px] text-violet-200'>Manage your account</p>
								</div>
							</div>
							<IconChevronRight className='stroke-violet-200 stroke-[1.8px]' />
						</div>
						<div className='flex items-center justify-between gap-1 rounded-lg p-2.5 transition duration-300 hover:bg-violet-700/50'>
							<div className='flex flex-grow items-center gap-4'>
								<div className='grid aspect-square size-9 place-content-center rounded-full bg-violet-600'>
									<IconFlag className='stroke-white stroke-[1.8px]' />
								</div>
								<div className='flex-grow'>
									<h4 className='text-base font-semibold'>Daily goal</h4>
									<p className='text-[13px] text-violet-200'>Edit daily goal for ear training</p>
								</div>
							</div>
							<IconChevronRight className='stroke-violet-200 stroke-[1.8px]' />
						</div>
					</div>
				</div>
				<div className='space-y-3'>
					<h3 className='text-sm font-semibold'>Preferences</h3>
					<div className='space-y-6 rounded-lg bg-gradient-to-tr from-violet-600/25 to-violet-600/50 p-5'>
						<div className='flex items-center justify-between gap-1'>
							<div className='flex flex-grow items-center gap-4'>
								<div className='grid aspect-square size-9 place-content-center rounded-full bg-violet-600'>
									<IconLanguage className='stroke-white stroke-[1.8px]' />
								</div>
								<div className='flex-grow'>
									<h4 className='text-base font-semibold'>Language</h4>
									<p className='text-[13px] text-violet-200'>Primary language for the app</p>
								</div>
							</div>
							<div className='rounded bg-violet-600 px-2 py-0.5'>
								<span className='text-xs font-semibold'>МОН</span>
							</div>
						</div>
						<div className='flex items-center justify-between gap-1'>
							<div className='flex flex-grow items-center gap-4'>
								<div className='grid aspect-square size-9 place-content-center rounded-full bg-violet-600'>
									<IconBell className='stroke-white stroke-[1.8px]' />
								</div>
								<div className='flex-grow'>
									<h4 className='text-base font-semibold'>Notification</h4>
									<p className='text-[13px] text-violet-200'>Receive reminder for practice</p>
								</div>
							</div>
							<Switch
								checked={false}
								color='violet.6'
							/>
						</div>
						<div className='flex items-center justify-between gap-1'>
							<div className='flex flex-grow items-center gap-4'>
								<div className='grid aspect-square size-9 place-content-center rounded-full bg-violet-600'>
									<IconMessage className='stroke-white stroke-[1.8px]' />
								</div>
								<div className='flex-grow'>
									<h4 className='text-base font-semibold'>Motivational message</h4>
									<p className='text-[13px] text-violet-200'>Get motivational feedback</p>
								</div>
							</div>
							<Switch
								checked
								color='violet.6'
							/>
						</div>
					</div>
				</div>
				<div className='space-y-3'>
					<h3 className='text-sm font-semibold'>Support</h3>
					<div className='space-y-1 rounded-lg bg-gradient-to-tr from-violet-600/25 to-violet-600/50 p-2.5'>
						<Link
							href={'/profile/support/help-center'}
							className='flex items-center justify-between gap-1 rounded-lg p-2.5 transition duration-300 hover:bg-violet-700/50'
						>
							<div className='flex flex-grow items-center gap-4'>
								<div className='grid aspect-square size-9 place-content-center rounded-full bg-violet-600'>
									<IconHelp className='stroke-white stroke-[1.8px]' />
								</div>
								<div className='flex-grow'>
									<h4 className='text-base font-semibold'>Help center</h4>
									<p className='text-[13px] text-violet-200'>Frequently asked questions</p>
								</div>
							</div>
							<IconChevronRight className='stroke-violet-200 stroke-[1.8px]' />
						</Link>
						<Link
							href={'/profile/support/feedback'}
							className='flex items-center justify-between gap-1 rounded-lg p-2.5 transition duration-300 hover:bg-violet-700/50'
						>
							<div className='flex flex-grow items-center gap-4'>
								<div className='grid aspect-square size-9 place-content-center rounded-full bg-violet-600'>
									<IconSpeakerphone className='stroke-white stroke-[1.8px]' />
								</div>
								<div className='flex-grow'>
									<h4 className='text-base font-semibold'>Feedback</h4>
									<p className='text-[13px] text-violet-200'>Give feedback to the app</p>
								</div>
							</div>
							<IconChevronRight className='stroke-violet-200 stroke-[1.8px]' />
						</Link>
						<div className='flex items-center justify-between gap-1 rounded-lg p-2.5 transition duration-300 hover:bg-violet-700/50'>
							<div className='flex flex-grow items-center gap-4'>
								<div className='grid aspect-square size-9 place-content-center rounded-full bg-violet-600'>
									<IconCertificate className='stroke-white stroke-[1.8px]' />
								</div>
								<div className='flex-grow'>
									<h4 className='text-base font-semibold'>Terms and Policy</h4>
									<p className='text-[13px] text-violet-200'>View app legal documents</p>
								</div>
							</div>
							<IconChevronRight className='stroke-violet-200 stroke-[1.8px]' />
						</div>
					</div>
				</div>
				<Button
					fullWidth
					radius={'md'}
				>
					Sign out
				</Button>
			</div>
		</EarTrainingLayout>
	);
};

export default Settings;
