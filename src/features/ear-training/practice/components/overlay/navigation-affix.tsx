import Link from 'next/link';

import { ActionIcon, Affix, Menu, rem } from '@mantine/core';
import { IconMusic } from '@tabler/icons-react';

const NavigationAffix = () => {
	return (
		<Affix
			position={{ bottom: rem(20), right: rem(20) }}
			className='fixed'
			withinPortal={false}
		>
			<Menu position={'top-end'}>
				<Menu.Target>
					<ActionIcon
						variant='light'
						className=' bg-violet-800/50'
						radius={'md'}
						size={'xl'}
					>
						<IconMusic />
					</ActionIcon>
				</Menu.Target>

				<Menu.Dropdown className='border border-violet-600/10 bg-transparent bg-gradient-to-tr from-violet-600/5 to-violet-600/20 backdrop-blur-3xl'>
					<Link
						href={'/ear-training/practice/interval'}
						className='block'
					>
						<Menu.Item className='text-white transition-colors duration-300 ease-in-out hover:bg-violet-600'>Interval</Menu.Item>
					</Link>

					<Link
						href={'/ear-training/practice/chord'}
						className='block'
					>
						<Menu.Item className='text-white transition-colors duration-300 ease-in-out hover:bg-violet-600'>Chord</Menu.Item>
					</Link>

					<Link
						href={'/ear-training/practice/mode'}
						className='block'
					>
						<Menu.Item className='text-white transition-colors duration-300 ease-in-out hover:bg-violet-600'>Mode</Menu.Item>
					</Link>
				</Menu.Dropdown>
			</Menu>
		</Affix>
	);
};

export default NavigationAffix;
