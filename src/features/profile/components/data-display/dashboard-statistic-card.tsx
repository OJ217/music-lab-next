import { Badge } from '@mantine/core';
import { TablerIconsProps } from '@tabler/icons-react';

interface IDashboardStatisticCardProps {
	label: string;
	value: string | number | null | undefined;
	Icon: (props: TablerIconsProps) => JSX.Element;
}

const DashboardStatisticCard: React.FC<IDashboardStatisticCardProps> = ({ label, value, Icon }) => {
	return (
		<div className='space-y-3 rounded-lg bg-transparent bg-gradient-to-tr from-violet-600/15 to-violet-600/30 p-4 md:p-5'>
			<div className='flex justify-between'>
				<h2 className='text-2xl font-semibold text-violet-100'>{value ?? '--'}</h2>
				<div className='grid aspect-square size-9 place-content-center rounded-full bg-gradient-to-tr from-violet-600/20 to-violet-600/40'>
					<Icon
						size={20}
						className='stroke-violet-400'
					/>
				</div>
			</div>
			<Badge variant='light'>{label}</Badge>
		</div>
	);
};

export default DashboardStatisticCard;
