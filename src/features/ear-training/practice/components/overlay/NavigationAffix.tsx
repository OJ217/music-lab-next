import Link from 'next/link';

import { ActionIcon, Affix, Menu, rem } from '@mantine/core';
import { IconMusic } from '@tabler/icons-react';

const NavigationAffix = () => {
	return (
		<div>
			<Affix position={{ bottom: rem(20), left: rem(20) }}>
				<Menu position={'top-start'}>
					<Menu.Target>
						<ActionIcon
							variant='light'
							radius={'md'}
							size={'xl'}
						>
							<IconMusic />
						</ActionIcon>
					</Menu.Target>

					<Menu.Dropdown className='rounded-md border-none bg-slate-900 p-2'>
						<Menu.Label className='text-slate-500'>Ear training</Menu.Label>
						<div className='space-y-2'>
							<Link
								href={'/ear-training/practice/interval'}
								className='block'
							>
								<Menu.Item className='rounded-md bg-violet-600/50 py-2 text-center text-white transition-colors duration-200 ease-in-out hover:bg-violet-600/25'>
									Interval
								</Menu.Item>
							</Link>

							<Link
								href={'/ear-training/practice/chord'}
								className='block'
							>
								<Menu.Item className='rounded-md bg-violet-600/50 py-2 text-center text-white transition-colors duration-200 ease-in-out hover:bg-violet-600/25'>
									Chord
								</Menu.Item>
							</Link>

							<Link
								href={'/ear-training/practice/mode'}
								className='block'
							>
								<Menu.Item className='rounded-md bg-violet-600/50 py-2 text-center text-white transition-colors duration-200 ease-in-out hover:bg-violet-600/25'>
									Mode
								</Menu.Item>
							</Link>

							<Menu.Divider className='!my-4 border-t-violet-600/50' />

							<Link
								href={'/'}
								className='block'
							>
								<Menu.Item className='rounded-md bg-violet-600/50 py-2 text-center text-white transition-colors duration-200 ease-in-out hover:bg-violet-600/25'>
									Home
								</Menu.Item>
							</Link>
						</div>
					</Menu.Dropdown>
				</Menu>
			</Affix>
		</div>
	);
};

export default NavigationAffix;
