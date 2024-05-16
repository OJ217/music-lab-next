interface IDashboardStatisticCardProps {
	label: string;
	value: string | number | null | undefined;
	icon: React.ReactNode;
}

const DashboardStatisticCard: React.FC<IDashboardStatisticCardProps> = ({ label, value, icon }) => {
	return (
		<div className='flex flex-col justify-between space-y-2 rounded-lg bg-gradient-to-tr from-violet-600/25 to-violet-600/50 px-4 py-3 md:px-5 md:py-4'>
			<div className='flex justify-between'>
				<h2 className='text-2xl font-semibold'>{!!value ? value : '--'}</h2>
				{icon}
			</div>
			<span className='text-sm font-medium text-violet-100'>{label}</span>
		</div>
	);
};

export default DashboardStatisticCard;
