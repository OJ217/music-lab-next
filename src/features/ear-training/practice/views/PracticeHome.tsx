import Image from 'next/image';
import Link from 'next/link';

import { useAuth } from '@/context/auth/auth.context';

import EarTrainingLayout from '../layouts/EarTrainingLayout';

const PracticeHome = () => {
	const { userInfo } = useAuth();
	return (
		<EarTrainingLayout>
			<div className='space-y-4'>
				<div className='w-full max-w-lg space-y-8'>
					<h3 className='from flex w-full flex-col items-center gap-1 rounded-xl border border-violet-600 bg-gradient-to-tr from-violet-600/10 to-violet-600/25 px-8 py-2 text-center transition-all duration-500 ease-in-out hover:opacity-80'>
						<h2>Өөлөө хөөрхөн :)</h2>
						<Image
							src={userInfo?.picture ?? ''}
							className='h-16 w-16 rounded-full'
							alt={'profile'}
						/>
					</h3>
					<Link
						href={'/ear-training/practice/interval'}
						className='from block w-full rounded-xl border border-violet-600 bg-gradient-to-tr from-violet-600/10 to-violet-600/25 px-8 py-6 transition-all duration-500 ease-in-out hover:opacity-80'
					>
						<h3 className='text-xl font-semibold text-violet-400'>Interval</h3>
						<p className='text-sm text-violet-100'>Practice your Interval Identification skill</p>
					</Link>
					<Link
						href={'/ear-training/practice/chord'}
						className='from block w-full rounded-xl border border-sky-600 bg-gradient-to-tr from-sky-600/10 to-sky-600/25 px-8 py-6 transition-all duration-500 ease-in-out hover:opacity-80'
					>
						<h3 className='text-xl font-semibold text-sky-300'>Chord</h3>
						<p className='text-sm text-sky-100'>Practice your Chord Identification skill</p>
					</Link>
					<Link
						href={'/ear-training/practice/mode'}
						className='from block w-full rounded-xl border border-amber-600 bg-gradient-to-tr from-amber-600/10 to-amber-600/25 px-8 py-6 transition-all duration-500 ease-in-out hover:opacity-80'
					>
						<h3 className='text-xl font-semibold text-amber-200'>Mode</h3>
						<p className='text-sm text-amber-100'>Practice your Mode Identification skill</p>
					</Link>
				</div>
			</div>
		</EarTrainingLayout>
	);
};

export default PracticeHome;
