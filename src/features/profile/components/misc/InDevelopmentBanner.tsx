import { IconDeviceImacCode } from '@tabler/icons-react';

const InDevelopmentBanner = () => {
	return (
		<div className='grid place-items-center space-y-2 rounded-lg border-violet-600 bg-transparent bg-gradient-to-tr from-violet-600/10 to-violet-600/20 p-4 md:space-y-4 md:p-6'>
			<h3 className='text-center font-medium md:text-lg'>Feature is in development</h3>
			<div className='grid aspect-square h-12 place-content-center rounded-full border border-violet-600 bg-violet-600/25'>
				<IconDeviceImacCode
					stroke={1.6}
					className='stroke-violet-600'
				/>
			</div>
		</div>
	);
};

export default InDevelopmentBanner;
