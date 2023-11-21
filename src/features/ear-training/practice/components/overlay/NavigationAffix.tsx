import Link from 'next/link';

import { ActionIcon, Affix, Menu, rem } from '@mantine/core';
import { IconMusic } from '@tabler/icons-react';

const NavigationAffix = () => {
	return (
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

				<Menu.Dropdown>
					<Link
						href={'/ear-training/practice/interval'}
						className='block'
					>
						<Menu.Item>Interval</Menu.Item>
					</Link>

					<Link
						href={'/ear-training/practice/chord'}
						className='block'
					>
						<Menu.Item>Chord</Menu.Item>
					</Link>

					<Link
						href={'/ear-training/practice/mode'}
						className='block'
					>
						<Menu.Item>Mode</Menu.Item>
					</Link>
				</Menu.Dropdown>
			</Menu>
		</Affix>
	);
};

export default NavigationAffix;
