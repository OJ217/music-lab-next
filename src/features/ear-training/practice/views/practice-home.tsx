import '@mantine/carousel/styles.css';

import Autoplay from 'embla-carousel-autoplay';
import Link from 'next/link';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { Carousel } from '@mantine/carousel';
import { Badge, Button, Center, rem, RingProgress, ThemeIcon, Tooltip } from '@mantine/core';
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
									<p className='mt-2 text-sm text-violet-100'>{t('intervalIdentificationDesc')}</p>
									<Badge
										size='sm'
										className='mt-4 bg-violet-600'
									>
										{t('exercise')}
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
									<p className='mt-2 text-sm text-sky-100'>{t('chordIdentificationDesc')}</p>
									<Badge
										size='sm'
										className='mt-4 bg-sky-600'
									>
										{t('exercise')}
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
									<p className='mt-2 text-sm text-amber-100'>{t('modeIdentificationDesc')}</p>
									<Badge
										size='sm'
										className='mt-4 bg-amber-600'
									>
										{t('exercise')}
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
					<h3 className='text-sm font-semibold md:text-base'>{t('dailyGoal')}</h3>
					<Tooltip
						label={'Удахгүй ашиглалт орно :)'}
						classNames={{ tooltip: 'bg-violet-600/25 backdrop-blur-md text-white' }}
					>
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
									<div className='flex flex-col items-center justify-center space-y-2 space-y-4 text-sm'>
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
									<Button
										size='xs'
										className='mx-auto block'
										rightSection={<IconArrowRight size={16} />}
									>
										Go practice
									</Button>
								</div>
							</div>
						</div>
					</Tooltip>
				</div>

				<div className='space-y-3'>
					<h3 className='text-sm font-semibold md:text-base'>{t('earTrainingLibraries')}</h3>
					<div className='grid grid-cols-2 gap-4 sm:grid-cols-3'>
						<Tooltip
							label={'Удахгүй ашиглалт орно :)'}
							classNames={{ tooltip: 'bg-violet-600/25 backdrop-blur-md text-white' }}
						>
							<div className='from col-span-1 flex flex-col justify-between space-y-4 rounded-xl bg-gradient-to-tr from-violet-600/20 to-violet-600/60 px-6 py-4 shadow-md transition-all duration-500 ease-in-out hover:opacity-90'>
								<h3 className='text-lg font-semibold leading-none text-violet-200'>{t('interval')}</h3>
								<p className='pb-2 text-sm text-violet-100'>{t('intervalLibraryDesc')}</p>
								<Badge
									className='self-end bg-violet-600'
									variant='filled'
									size='md'
								>
									{t('library')}
								</Badge>
							</div>
						</Tooltip>
						<Tooltip
							label={'Удахгүй ашиглалт орно :)'}
							classNames={{ tooltip: 'bg-sky-600/25 backdrop-blur-md text-white' }}
						>
							<div className='from col-span-1 flex flex-col justify-between space-y-4 rounded-xl bg-transparent bg-gradient-to-tr from-sky-600/20 to-sky-600/60 px-6 py-4 shadow-md transition-all duration-500 ease-in-out hover:opacity-90'>
								<h3 className='text-lg font-semibold leading-none text-sky-200'>{t('chord')}</h3>
								<p className='pb-2 text-sm text-sky-100'>{t('chordLibraryDesc')}</p>
								<Badge
									className='self-end bg-sky-600'
									variant='filled'
									size='md'
								>
									{t('library')}
								</Badge>
							</div>
						</Tooltip>
						<Tooltip
							label={'Удахгүй ашиглалт орно :)'}
							classNames={{ tooltip: 'bg-amber-600/25 backdrop-blur-md text-white' }}
						>
							<div className='from col-span-2 flex flex-col justify-between space-y-4 rounded-xl bg-gradient-to-tr from-amber-600/20 to-amber-600/60 px-6 py-4 shadow-md transition-all duration-500 ease-in-out hover:opacity-90 sm:col-span-1'>
								<h3 className='text-lg font-semibold leading-none text-amber-200'>{t('mode')}</h3>
								<p className='pb-2 text-sm text-amber-100'>{t('modeLibraryDesc')}</p>
								<Badge
									className='bg-amber-600 sm:self-end'
									variant='filled'
									size='md'
								>
									{t('library')}
								</Badge>
							</div>
						</Tooltip>
						{/* <div className='from flex flex-col justify-between space-y-4 rounded-xl bg-transparent bg-gradient-to-tr from-indigo-600/20 to-indigo-600/60 px-6 py-4 shadow-md transition-all duration-500 ease-in-out hover:opacity-90'>
							<h3 className='text-lg font-semibold leading-none text-indigo-200'>{t('chordProgression')}</h3>
							<p className='text-sm text-indigo-100'>{t('chordProgressionLibraryDesc')}</p>
							<Badge
								color='purple'
								variant='filled'
								size='md'
							>
								LIBRARY
							</Badge>
						</div> */}
						{/* <div className='from flex flex-col space-y-4 justify-between gap-4 rounded-xl bg-transparent bg-gradient-to-tr from-emerald-600/20 to-emerald-600/60 px-6 py-4 shadow-md transition-all duration-500 ease-in-out hover:opacity-90'>
								<h3 className='text-lg font-semibold leading-none text-emerald-200'>Circle of Fifths</h3>
								<p className='text-sm text-emerald-100'>Relationship between 12 tones of the chromatic scale</p>

							<Badge
								color='teal'
								variant='filled'
								size='md'
							>
								LIBRARY
							</Badge>
						</div> */}
						{/* <div className='from flex flex-col space-y-4 justify-between gap-4 rounded-xl bg-transparent bg-gradient-to-tr from-yellow-600/20 to-yellow-600/60 px-6 py-4 shadow-md transition-all duration-500 ease-in-out hover:opacity-90'>
								<h3 className='text-lg font-semibold leading-none text-yellow-200'>Notes</h3>
								<p className='text-sm text-yellow-100'>Notes and their frequencies (with examples)</p>

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
