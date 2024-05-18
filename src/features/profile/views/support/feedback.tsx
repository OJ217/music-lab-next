import { useState } from 'react';

import EarTrainingLayout from '@/features/ear-training/practice/layouts/ear-training-layout';
import { Button, FileButton, Textarea, Tooltip } from '@mantine/core';
import { IconFileUpload, IconSpy } from '@tabler/icons-react';

import IconWrapper from '../../components/misc/icon-wrapper';

const Feedback = () => {
	const [attachment, setAttachment] = useState<File | null>(null);

	return (
		<EarTrainingLayout
			centered={false}
			showAffix={false}
		>
			<div className='mx-auto w-full max-w-md space-y-6'>
				<h3 className='text-xl font-semibold'>Feedback</h3>
				<div className='space-y-10'>
					<div className='space-y-3'>
						<div className='flex items-center gap-4 rounded-lg bg-gradient-to-tr from-violet-600/25 to-violet-600/50 px-4 py-3'>
							<IconWrapper Icon={IconSpy} />
							<div className='flex-grow text-center'>
								<h4 className='text-sm font-medium'>Your feedback will be registered anonymously.</h4>
							</div>
						</div>
						<Textarea
							spellCheck={false}
							placeholder={`Write your feedback to contribute to the further development of the 'Music Lab'.`}
							classNames={{
								input: 'bg-violet-600/50 placeholder:text-violet-200 h-[220px] border-violet-600 transition-all ease-in-out duration-500 text-white'
							}}
						/>
						<FileButton
							onChange={setAttachment}
							accept='image/png,image/jpeg'
							disabled
						>
							{props => (
								<Button
									{...props}
									className='border border-violet-600 bg-violet-600/50 disabled:bg-violet-600/50 disabled:text-white/50'
									fullWidth
									disabled
								>
									<div className='flex items-center gap-2'>
										<span>Attach file</span>
										<IconFileUpload
											size={20}
											className='stroke-white stroke-[1.2px]'
										/>
									</div>
								</Button>
							)}
						</FileButton>
					</div>
					<Tooltip label={'Удахгүй ашиглалтанд орно :)'}>
						<Button
							fullWidth
							disabled
							className='disabled:bg-violet-600/50 disabled:text-white/50'
						>
							Submit
						</Button>
					</Tooltip>
				</div>
			</div>
		</EarTrainingLayout>
	);
};

export default Feedback;
