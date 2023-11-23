import Link from 'next/link';

import EarTrainingLayout from '../layouts/EarTrainingLayout';

const PracticeHome = () => {
	return (
		<EarTrainingLayout centered={true}>
			<div className='w-full max-w-lg space-y-8'>
				<Link
					href={'/ear-training/practice/interval'}
					className='from block w-full rounded-xl border border-violet-600 bg-gradient-to-tr from-cyan-600/20 to-violet-600/25 px-8 py-6 transition-all duration-500 ease-in-out hover:opacity-80'
				>
					<h3 className='text-xl font-semibold text-violet-300'>Interval</h3>
					<p className='text-sm text-gray-200'>Practice your Interval Identification skill</p>
				</Link>

				<Link
					href={'/ear-training/practice/chord'}
					className='from block w-full rounded-xl border border-violet-600 bg-gradient-to-tr from-cyan-600/20 to-violet-600/25 px-8 py-6 transition-all duration-500 ease-in-out hover:opacity-80'
				>
					<h3 className='text-xl font-semibold text-violet-300'>Chord</h3>
					<p className='text-sm text-gray-200'>Practice your Chord Identification skill</p>
				</Link>

				<Link
					href={'/ear-training/practice/mode'}
					className='from block w-full rounded-xl border border-violet-600 bg-gradient-to-tr from-cyan-600/20 to-violet-600/25 px-8 py-6 transition-all duration-500 ease-in-out hover:opacity-80'
				>
					<h3 className='text-xl font-semibold text-violet-300'>Mode</h3>
					<p className='text-sm text-gray-200'>Practice your Mode Identification skill</p>
				</Link>
			</div>
		</EarTrainingLayout>
	);
};

export default PracticeHome;
