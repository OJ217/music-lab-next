import { TablerIconsProps } from '@tabler/icons-react';

interface IIconWrapperProps {
	Icon: (props: TablerIconsProps) => JSX.Element;
}

const IconWrapper: React.FC<IIconWrapperProps> = ({ Icon }) => {
	return (
		<div className='grid aspect-square size-9 place-content-center rounded-full bg-gradient-to-tr from-violet-600/20 to-violet-600/40'>
			<Icon
				size={20}
				className='stroke-violet-400'
			/>
		</div>
	);
};

export default IconWrapper;
