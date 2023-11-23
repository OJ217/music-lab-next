import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';

const Test = () => {
	const [isToggled, setToggled] = useState(false);

	const toggleContent = () => {
		setToggled(!isToggled);
	};

	return (
		<div className='grid min-h-screen place-content-center text-center'>
			<button onClick={toggleContent}>Toggle content</button>
			<AnimatePresence
				mode='wait'
				initial={false}
			>
				{isToggled ? (
					<motion.div
						key={'chord_inversion'}
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{
							duration: 0.3
						}}
						onClick={toggleContent}
						exit={{ opacity: 0 }}
					>
						This is chord inversion
					</motion.div>
				) : (
					<motion.div
						key={'chord'}
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{
							duration: 0.3
						}}
						onClick={toggleContent}
						exit={{ opacity: 0 }}
					>
						This is chord
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
};

export default Test;
