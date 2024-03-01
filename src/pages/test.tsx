import { AnimatePresence, motion } from 'framer-motion';
import { t } from 'i18next';
import React, { useState } from 'react';

/* eslint-disable react/no-unescaped-entities */
import { ActionIcon, Button, Progress } from '@mantine/core';
import { IconSettings } from '@tabler/icons-react';

/**
 * This is an example of position-only layout animations in Framer Motion 2.
 *
 * This is ideal for layers that are substantially changing their graphical content,
 * like this text layer. Try removing ="position" and see what effect we produce
 * by simply animating between bounding boxes.
 */

export default function App() {
	const [isOpen, setIsOpen] = useState(true);

	return (
		<div className='grid min-h-screen place-content-center'>
			<motion.div
				layout='position'
				transition={{ duration: 1.5, type: 'spring' }}
			>
				<div className='mb-12 space-y-4'>
					<h1 className='text-center text-xl font-semibold'>{t('chordIdentification')}</h1>

					<div className='space-y-2'>
						<Progress
							bg={'violet.8'}
							value={50}
							classNames={{
								root: 'max-w-[240px] mx-auto w-full',
								section: 'transition-all duration-300 ease-in-out'
							}}
						/>
						<p className='text-center text-xs text-gray-300'>5/10</p>
					</div>

					<div className='flex flex-col items-center space-y-16'>
						<ActionIcon
							p={4}
							radius='sm'
							variant='light'
						>
							<IconSettings />
						</ActionIcon>
						<Button
							fw={500}
							radius={'xl'}
							className='disabled:bg-violet-600/25 disabled:opacity-50'
						>
							Тоглох
						</Button>
					</div>
				</div>
			</motion.div>
			<motion.div
				layout
				transition={{
					duration: 1.5,
					type: 'spring'
				}}
				onClick={() => setIsOpen(!isOpen)}
				className='max-w-[400px] overflow-hidden bg-lime-500 bg-gradient-to-tr from-violet-700/10 to-violet-700/25 p-5 text-center'
			>
				<AnimatePresence
					mode='wait'
					presenceAffectsLayout
					initial={false}
				>
					<motion.div
						layout
						transition={{
							duration: 1.5,
							type: 'spring'
						}}
					>
						{isOpen ? (
							<motion.div
								layout
								key={'chords'}
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								transition={{
									duration: 1.5,
									type: 'spring'
								}}
								exit={{ opacity: 0 }}
							>
								It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout.
							</motion.div>
						) : (
							<motion.div
								layout
								key={'chord_inversions'}
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								transition={{
									duration: 1.5,
									type: 'spring'
								}}
								exit={{ opacity: 0 }}
							>
								It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it
								has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English. Many desktop publishing
								packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy.
								Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like).
							</motion.div>
						)}
					</motion.div>
				</AnimatePresence>
			</motion.div>
		</div>
	);
}
