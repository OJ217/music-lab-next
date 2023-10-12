import Link from 'next/link';

import { Text } from '@mantine/core';

import NavigationAffix from '../components/overlay/NavigationAffix';

const PracticeHome = () => {
	return (
		<main className='grid min-h-screen place-content-center p-8 text-white'>
			<div className='w-full max-w-lg space-y-8'>
				<h1 className='text-center text-2xl font-semibold'>Music Lab - Ear Training</h1>
				<Link
					href={'/ear-training/practice/interval'}
					className='from block w-full rounded-xl border border-violet-600 bg-gradient-to-tr from-cyan-600/20 to-violet-600/25 px-8 py-6 transition-all duration-500 ease-in-out hover:opacity-80'
				>
					<h3 className='text-xl font-medium'>Interval</h3>
					<p>
						Practice your{' '}
						<span className='font-medium'>
							<Text
								span
								variant='gradient'
								fw={600}
								gradient={{ from: 'blue', to: 'cyan', deg: 90 }}
							>
								Interval Identification
							</Text>
						</span>{' '}
						skill
					</p>
				</Link>

				<Link
					href={'/ear-training/practice/chord'}
					className='from block w-full rounded-xl border border-violet-600 bg-gradient-to-tr from-cyan-600/20 to-violet-600/25 px-8 py-6 transition-all duration-500 ease-in-out hover:opacity-80'
				>
					<h3 className='text-xl font-medium'>Chord</h3>
					<p>
						Practice your{' '}
						<span className='font-medium'>
							<Text
								span
								variant='gradient'
								fw={600}
								gradient={{ from: 'blue', to: 'cyan', deg: 90 }}
							>
								Chord Identification
							</Text>
						</span>{' '}
						skill
					</p>
				</Link>

				<Link
					href={'/ear-training/practice/mode'}
					className='from block w-full rounded-xl border border-violet-600 bg-gradient-to-tr from-cyan-600/20 to-violet-600/25 px-8 py-6 transition-all duration-500 ease-in-out hover:opacity-80'
				>
					<h3 className='text-xl font-medium'>Mode</h3>
					<p>
						Practice your{' '}
						<span className='font-medium'>
							<Text
								span
								variant='gradient'
								fw={600}
								gradient={{ from: 'blue', to: 'cyan', deg: 90 }}
							>
								Mode Identification
							</Text>
						</span>{' '}
						skill
					</p>
				</Link>
			</div>

			<NavigationAffix />
		</main>
	);
};

export default PracticeHome;
