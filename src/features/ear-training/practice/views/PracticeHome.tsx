import Link from 'next/link';

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
					<h3 className='text-xl font-bold text-violet-300'>Interval</h3>
					<p className='text-sm text-gray-400'>Practice your Interval Identification skill</p>
				</Link>

				<Link
					href={'/ear-training/practice/chord'}
					className='from block w-full rounded-xl border border-violet-600 bg-gradient-to-tr from-cyan-600/20 to-violet-600/25 px-8 py-6 transition-all duration-500 ease-in-out hover:opacity-80'
				>
					<h3 className='text-xl font-bold text-violet-300'>Chord</h3>
					<p className='text-sm text-gray-400'>Practice your Chord Identification skill</p>
				</Link>

				<Link
					href={'/ear-training/practice/mode'}
					className='from block w-full rounded-xl border border-violet-600 bg-gradient-to-tr from-cyan-600/20 to-violet-600/25 px-8 py-6 transition-all duration-500 ease-in-out hover:opacity-80'
				>
					<h3 className='text-xl font-bold text-violet-300'>Mode</h3>
					<p className='text-sm text-gray-400'>Practice your Mode Identification skill</p>
				</Link>
			</div>

			<NavigationAffix />
		</main>
	);
};

export default PracticeHome;
