import Link from 'next/link';

import { ActionIcon, Affix, Menu, rem } from '@mantine/core';
import { IconEar, IconMusic } from '@tabler/icons-react';

const NavigationAffix = () => {
	return (
		<div>
			<Affix position={{ bottom: rem(20), left: rem(20) }}>
				<Menu position={'top-start'}>
					<Menu.Target>
						<ActionIcon
							color={'violet'}
							className='bg-purple-500/25 transition-colors duration-500 ease-in-out hover:bg-purple-500/10'
							radius={'xl'}
							size={'xl'}
						>
							<IconMusic size={rem(28)} />
						</ActionIcon>
					</Menu.Target>

					<Menu.Dropdown className='rounded-lg border-2 border-purple-500/25 bg-slate-900 p-2'>
						<Menu.Label className='flex items-center gap-1 text-slate-500'>
							Ear training{' '}
							<span>
								<IconEar
									size={rem(
										14
									)}
								/>
							</span>
						</Menu.Label>
						<div className='space-y-2'>
							<Link
								href={
									'/practice/interval'
								}
								className='block'
							>
								<Menu.Item className='rounded-lg bg-purple-500/25 py-2 text-center text-white transition-colors duration-500 ease-in-out hover:bg-purple-500/10'>
									Interval
								</Menu.Item>
							</Link>

							<Link
								href={'/practice/chord'}
								className='block'
							>
								<Menu.Item className='rounded-lg bg-purple-500/25 py-2 text-center text-white transition-colors duration-500 ease-in-out hover:bg-purple-500/10'>
									Chord
								</Menu.Item>
							</Link>

							<Link
								href={'/practice/mode'}
								className='block'
							>
								<Menu.Item className='rounded-lg bg-purple-500/25 py-2 text-center text-white transition-colors duration-500 ease-in-out hover:bg-purple-500/10'>
									Mode
								</Menu.Item>
							</Link>

							<Menu.Divider className='!my-4 border-t-purple-500/50' />

							<Link
								href={'/'}
								className='block'
							>
								<Menu.Item className='rounded-lg bg-purple-500/25 py-2 text-center text-white transition-colors duration-500 ease-in-out hover:bg-purple-500/10'>
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
