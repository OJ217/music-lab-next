import { TablerIconsProps } from '@tabler/icons-react';

interface IIconWrapperProps {
	Icon: (props: TablerIconsProps) => JSX.Element;
}

const IconWrapper: React.FC<IIconWrapperProps> = ({ Icon }) => {
	return (
		<div className='grid aspect-square size-9 place-content-center rounded-full bg-violet-600'>
			<Icon
				size={24}
				className='stroke-white stroke-[1.8px]'
			/>
		</div>
	);
};

export default IconWrapper;
