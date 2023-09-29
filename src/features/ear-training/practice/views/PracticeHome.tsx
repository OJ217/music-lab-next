import Link from 'next/link';

const PracticeHome = () => {
	return (
		<main className='grid min-h-screen place-content-center p-16 text-white'>
			<div className=' w-full max-w-lg space-y-8'>
				<h1 className='text-center text-2xl font-semibold'>Music Lab - Ear Training</h1>
				<Link
					href={'/ear-training/practice/interval'}
					className='from relative block w-full rounded-full bg-violet-500 bg-gradient-to-r to-purple-500 p-2'
				>
					<div className='rounded-full bg-slate-900/20 px-8 py-3 backdrop-blur-sm'>
						<h3 className='text-xl font-medium'>Interval</h3>
						<p>Practice your Interval Identification skill</p>
					</div>
				</Link>

				<Link
					href={'/ear-training/practice/chord'}
					className='from relative block w-full rounded-full bg-violet-500 bg-gradient-to-r to-purple-500 p-2'
				>
					<div className='rounded-full bg-slate-900/20 px-8 py-3 backdrop-blur-sm'>
						<h3 className='text-xl font-medium'>Chord</h3>
						<p>Practice your Chord Identification skill</p>
					</div>
				</Link>

				<Link
					href={'/ear-training/practice/mode'}
					className='from relative block w-full rounded-full bg-violet-500 bg-gradient-to-r to-purple-500 p-2'
				>
					<div className='rounded-full bg-slate-900/20 px-8 py-3 backdrop-blur-sm'>
						<h3 className='text-xl font-medium'>Mode</h3>
						<p>Practice your Mode Identification skill.</p>
					</div>
				</Link>
			</div>
		</main>
	);
};

export default PracticeHome;
