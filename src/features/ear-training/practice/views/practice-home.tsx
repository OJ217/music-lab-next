import '@mantine/carousel/styles.css';

import Autoplay from 'embla-carousel-autoplay';
import Link from 'next/link';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { Carousel } from '@mantine/carousel';
import { Badge, Button, Center, rem, RingProgress, ThemeIcon } from '@mantine/core';
import { IconArrowRight, IconCheck, IconMusic } from '@tabler/icons-react';

import EarTrainingLayout from '../layouts/ear-training-layout';

const PracticeHome = () => {
	const { t } = useTranslation('ear_training_home');
	const autoplay = useRef(Autoplay({ delay: 5000 }));

	return (
		<EarTrainingLayout
			centered={false}
			showAffix={false}
		>
			<div className='mx-auto w-full max-w-lg space-y-8'>
				<div className='space-y-3'>
					<h3 className='text-sm font-semibold md:text-base'>{t('earTrainingExercises')}</h3>
					<Carousel
						loop
						withIndicators
						slideGap={'md'}
						withControls={false}
						containScroll='trimSnaps'
						plugins={[autoplay.current]}
						onMouseEnter={autoplay.current.stop}
						onMouseLeave={autoplay.current.reset}
						onMouseDown={autoplay.current.stop}
						onMouseUp={autoplay.current.reset}
						styles={{
							indicators: { top: '115%' },
							indicator: { width: '16px' }
						}}
					>
						<Carousel.Slide>
							<Link
								href={'/ear-training/practice/interval'}
								className='from flex h-full items-center justify-between gap-4 rounded-xl bg-gradient-to-tr from-violet-600/25 to-violet-600/50 px-6 py-4 transition-all duration-500 ease-in-out hover:opacity-90 sm:gap-16'
							>
								<div>
									<h3 className='text-xl font-semibold leading-none text-violet-400'>{t('intervalIdentification')}</h3>
									<p className='mt-2 text-sm text-violet-100'>Practicing identifying intervals — the distance between two notes</p>
									<Badge
										size='sm'
										className='mt-4 bg-violet-600'
									>
										{t('earTraining')}
									</Badge>
								</div>
								<div className='grid aspect-square h-12 place-content-center rounded-full bg-violet-600 md:h-12'>
									<IconMusic
										stroke={2}
										className='h-6 w-6 stroke-white md:h-7 md:w-7'
									/>
								</div>
							</Link>
						</Carousel.Slide>
						<Carousel.Slide>
							<Link
								href={'/ear-training/practice/chord'}
								className='from flex h-full items-center justify-between gap-4 rounded-xl bg-gradient-to-tr from-sky-600/25 to-sky-600/50 px-6 py-4 transition-all duration-500 ease-in-out hover:opacity-90 sm:gap-16'
							>
								<div>
									<h3 className='text-xl font-semibold leading-none text-sky-400'>{t('chordIdentification')}</h3>
									<p className='mt-2 text-sm text-sky-100'>Practicing identifying chords — the dombination of three or more notes</p>
									<Badge
										size='sm'
										className='mt-4 bg-sky-600'
									>
										{t('earTraining')}
									</Badge>
								</div>
								<div className='grid aspect-square h-12 place-content-center rounded-full bg-sky-600 md:h-12'>
									<IconMusic
										stroke={2}
										className='h-6 w-6 stroke-white md:h-7 md:w-7'
									/>
								</div>
							</Link>
						</Carousel.Slide>
						<Carousel.Slide>
							<Link
								href={'/ear-training/practice/mode'}
								className='from flex h-full items-center justify-between gap-4 rounded-xl bg-gradient-to-tr from-amber-600/25 to-amber-600/50 px-6 py-4 transition-all duration-500 ease-in-out hover:opacity-90 sm:gap-16'
							>
								<div>
									<h3 className='text-xl font-semibold leading-none text-amber-400'>{t('modeIdentification')}</h3>
									<p className='mt-2 text-sm text-amber-100'>Practicing identifying modes — specific scale or tonal pattern of music</p>
									<Badge
										size='sm'
										className='mt-4 bg-amber-600'
									>
										{t('earTraining')}
									</Badge>
								</div>
								<div className='grid aspect-square h-12 place-content-center rounded-full bg-amber-600 md:h-12'>
									<IconMusic
										stroke={2}
										className='h-6 w-6 stroke-white md:h-7 md:w-7'
									/>
								</div>
							</Link>
						</Carousel.Slide>
					</Carousel>
				</div>

				<div className='space-y-3'>
					<h3 className='text-sm font-semibold md:text-base'>Daily goal</h3>
					<div className='rounded-lg bg-transparent bg-gradient-to-tr from-violet-600/25 to-violet-600/50 p-4 shadow-2xl md:p-6'>
						<div className='mx-auto max-w-xs space-y-4'>
							<div className='flex items-center justify-evenly gap-4'>
								<RingProgress
									size={96}
									roundCaps
									thickness={4}
									label={
										<Center>
											<ThemeIcon
												color='green'
												variant='light'
												radius='50%'
												size={60}
											>
												<h3 className='text-lg font-semibold'>80%</h3>
											</ThemeIcon>
										</Center>
									}
									sections={[
										{
											value: 80,
											color: 'green'
										}
									]}
								/>
								<div className='flex flex-col items-center justify-center space-y-2 text-sm'>
									<div className='flex items-center gap-3'>
										<div className='rounded-full border border-green-500 bg-green-500 bg-opacity-25'>
											<IconCheck
												size={12}
												stroke={1.2}
											/>
										</div>
										<p>30 interval exercises</p>
									</div>
									<div className='flex items-center gap-3'>
										<div className='rounded-full border border-green-500 bg-green-500 bg-opacity-25'>
											<IconCheck
												size={12}
												stroke={1.2}
											/>
										</div>
										<p>30 chord exercises</p>
									</div>
									<div className='flex items-center gap-3'>
										<ThemeIcon
											variant='default'
											size={rem(14)}
											radius={'xl'}
										/>
										<p>30 mode exercises</p>
									</div>
								</div>
							</div>
							<div className='space-y-6'>
								<h3 className='text-center text-lg font-semibold'>You&apos;re on a 2-day streak 🔥</h3>
								<Link
									href={'practice/mode'}
									className='block'
								>
									<Button
										size='xs'
										className='mx-auto block'
										rightSection={<IconArrowRight size={16} />}
									>
										Go practice
									</Button>
								</Link>
							</div>
						</div>
					</div>
				</div>

				<div className='space-y-3'>
					<h3 className='text-sm font-semibold md:text-base'>Library</h3>
					<div className='grid grid-cols-2 gap-4'>
						<Link
							href={'/ear-training/library/intervals'}
							className='from flex flex-col justify-between gap-2 rounded-xl bg-gradient-to-tr from-violet-600/20 to-violet-600/60 px-6 py-4 shadow-md transition-all duration-500 ease-in-out hover:opacity-90'
						>
							<div className='space-y-2'>
								<h3 className='text-lg font-semibold leading-none text-violet-200'>Intervals</h3>
								<p className='text-xs text-violet-100'>Set of simple and compound intervals with examples</p>
							</div>
							<Badge
								color='violet.6'
								variant='filled'
								size='md'
							>
								LIBRARY
							</Badge>
						</Link>
						<div className='from flex flex-col justify-between gap-2 rounded-xl bg-transparent bg-gradient-to-tr from-sky-600/20 to-sky-600/60 px-6 py-4 shadow-md transition-all duration-500 ease-in-out hover:opacity-90'>
							<div className='space-y-2'>
								<h3 className='text-lg font-semibold leading-none text-sky-200'>Chords</h3>
								<p className='text-xs text-sky-100'>Set of basic chords and their inversions</p>
							</div>
							<Badge
								color='blue'
								variant='filled'
								size='md'
							>
								LIBRARY
							</Badge>
						</div>
						<div className='from flex flex-col justify-between gap-2 rounded-xl bg-gradient-to-tr from-amber-600/20 to-amber-600/60 px-6 py-4 shadow-md transition-all duration-500 ease-in-out hover:opacity-90'>
							<div className='space-y-2'>
								<h3 className='text-lg font-semibold leading-none text-amber-200'>Modes</h3>
								<p className='text-xs text-amber-100'>Set of commonly used music modes and scales</p>
							</div>
							<Badge
								color='orange'
								variant='filled'
								size='md'
							>
								LIBRARY
							</Badge>
						</div>
						<div className='from flex flex-col justify-between gap-2 rounded-xl bg-transparent bg-gradient-to-tr from-indigo-600/20 to-indigo-600/60 px-6 py-4 shadow-md transition-all duration-500 ease-in-out hover:opacity-90'>
							<div className='space-y-2'>
								<h3 className='text-lg font-semibold leading-none text-indigo-200'>Chord progression</h3>
								<p className='text-xs text-indigo-100'>Collection of common chord progressions</p>
							</div>
							<Badge
								color='indigo'
								variant='filled'
								size='md'
							>
								LIBRARY
							</Badge>
						</div>
						{/* <div className='from flex flex-col justify-between gap-2 rounded-xl bg-transparent bg-gradient-to-tr from-emerald-600/20 to-emerald-600/60 px-6 py-4 shadow-md transition-all duration-500 ease-in-out hover:opacity-90'>
							<div className='space-y-2'>
								<h3 className='text-lg font-semibold leading-none text-emerald-200'>Circle of Fifths</h3>
								<p className='text-xs text-emerald-100'>Relationship between 12 tones of the chromatic scale</p>
							</div>
							<Badge
								color='teal'
								variant='filled'
								size='md'
							>
								LIBRARY
							</Badge>
						</div> */}
						{/* <div className='from flex flex-col justify-between gap-2 rounded-xl bg-transparent bg-gradient-to-tr from-yellow-600/20 to-yellow-600/60 px-6 py-4 shadow-md transition-all duration-500 ease-in-out hover:opacity-90'>
							<div className='space-y-2'>
								<h3 className='text-lg font-semibold leading-none text-yellow-200'>Notes</h3>
								<p className='text-xs text-yellow-100'>Notes and their frequencies (with examples)</p>
							</div>
							<Badge
								color='yellow'
								variant='filled'
								size='md'
							>
								LIBRARY
							</Badge>
						</div> */}
					</div>
				</div>
			</div>
		</EarTrainingLayout>
	);
};

export default PracticeHome;
