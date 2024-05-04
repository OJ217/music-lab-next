import { Badge } from '@mantine/core';

interface IDashboardStatisticCardProps {
	label: string;
	value: string | number | null | undefined;
	icon: React.ReactNode;
}

const DashboardStatisticCard: React.FC<IDashboardStatisticCardProps> = ({ label, value, icon }) => {
	return (
		<div className='flex flex-col justify-between space-y-3 rounded-lg bg-transparent bg-gradient-to-tr from-violet-600/15 to-violet-600/30 p-4 md:p-5'>
			<div className='flex justify-between'>
				<h2 className='text-2xl font-semibold text-violet-100'>{!!value ? value : '--'}</h2>
				{icon}
			</div>
			<Badge variant='light'>{label}</Badge>
		</div>
	);
};

export default DashboardStatisticCard;
